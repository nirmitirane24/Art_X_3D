from flask import Blueprint, jsonify, request, current_app
import boto3
from botocore.exceptions import ClientError
import psycopg2  
import os
from utils.decorators import login_required
from datetime import datetime, timedelta
from utils.db import get_db_connection
import logging
import json  

library_bp = Blueprint('library', __name__, url_prefix='/library')

# --- Cloudflare R2 Client Setup (Keep this!) ---

CLOUDFLARE_ACCESS_KEY = os.environ.get('CLOUDFLARE_ACCESS_KEY')
CLOUDFLARE_SECRET_KEY = os.environ.get('CLOUDFLARE_SECRET_KEY')
CLOUDFLARE_TOKEN = os.environ.get('CLOUDFLARE_TOKEN')
CLOUDFLARE_ENDPOINT = os.environ.get('CLOUDFLARE_ENDPOINT')
CLOUDFLARE_R2_REGION = "auto"
CLOUDFLARE_BUCKET_NAME = os.environ.get('CLOUDFLARE_BUCKET_NAME')

def get_r2_client():
     return boto3.client(
        's3',
        region_name=CLOUDFLARE_R2_REGION,
        endpoint_url=CLOUDFLARE_ENDPOINT,
        aws_access_key_id=CLOUDFLARE_ACCESS_KEY,
        aws_secret_access_key=CLOUDFLARE_SECRET_KEY
    )

# --- Logging Configuration ---
logging.basicConfig(level=logging.INFO)

@library_bp.route('/models', methods=['GET'])
def get_library_models():
    category = request.args.get('category')
    cache_key = f"library_models:{category}" if category and category != "All" else "library_models:all"  # More specific key

    if current_app.redis:
        try:
            cached_models_json = current_app.redis.get(cache_key)
            if cached_models_json:
                logging.info(f"Returning library models from cache (key: {cache_key})")
                return jsonify(json.loads(cached_models_json.decode('utf-8'))), 200
        except Exception as e:
            logging.error(f"Error retrieving models from cache: {e}")

    conn = None
    try:
        conn = get_db_connection()
        if conn is None:
            return jsonify({'message': 'Database connection failed'}), 500

        with conn.cursor() as cursor:
            if category and category != "All":
                cursor.execute("SELECT * FROM library_models WHERE model_category = %s", (category,))
            else:
                cursor.execute("SELECT * FROM library_models")

            models = cursor.fetchall()

            column_names = [desc[0] for desc in cursor.description]
            model_list = []
            for model_row in models:
                model_dict = dict(zip(column_names, model_row))

                if 'model_image' in model_dict and model_dict['model_image']:
                    try:
                        r2 = get_r2_client()
                        presigned_thumbnail_url = r2.generate_presigned_url(
                            'get_object',
                            Params={'Bucket': CLOUDFLARE_BUCKET_NAME, 'Key': model_dict['model_image']},
                            ExpiresIn=3600  # 1 hour
                        )
                        model_dict['model_image'] = presigned_thumbnail_url
                    except Exception as e:
                        print(f"Error generating thumbnail URL: {e}")
                        model_dict['model_image'] = None

                model_list.append(model_dict)

            # --- Cache the model list ---
            if current_app.redis:
                try:
                    current_app.redis.setex(cache_key, 3600, json.dumps(model_list))  # Cache for 1 hour
                    logging.info(f"Cached library models (key: {cache_key})")
                except Exception as e:
                    logging.error(f"Error caching models: {e}")

            return jsonify(model_list), 200

    except psycopg2.Error as e:
        print(f"Database error: {e}")
        return jsonify({'message': 'Database error'}), 500
    except Exception as e:
        print(f"Error fetching models: {e}")
        return jsonify({'message': 'Failed to fetch library models'}), 500
    finally:
        if conn:
            conn.close()


@library_bp.route('/models/<int:model_id>/signed_url', methods=['GET'])
def get_signed_url(model_id):
    cache_key = f"signed_url:{model_id}"

    if current_app.redis:
        try:
            cached_url = current_app.redis.get(cache_key)
            if cached_url:
                logging.info(f"Returning signed URL from cache (key: {cache_key})")
                return jsonify({'signed_url': cached_url.decode('utf-8')}), 200
        except Exception as e:
            logging.error(f"Error retrieving signed URL from cache: {e}")

    conn = None
    try:
        conn = get_db_connection()
        if conn is None:
            return jsonify({'message': 'Database connection failed'}), 500

        with conn.cursor() as cursor:
            cursor.execute("SELECT model_url FROM library_models WHERE id = %s", (model_id,))
            result = cursor.fetchone()

            if not result:
                return jsonify({'message': 'Model not found'}), 404

            model_url = result[0]

            r2 = get_r2_client()
            presigned_url = r2.generate_presigned_url(
                'get_object',
                Params={'Bucket': CLOUDFLARE_BUCKET_NAME, 'Key': model_url},
                ExpiresIn=3600
            )

            # --- Cache the signed URL ---
            if current_app.redis:
                try:
                    current_app.redis.setex(cache_key, 3600, presigned_url)  # Cache for 1 hour
                    logging.info(f"Cached signed URL (key: {cache_key})")
                except Exception as e:
                    logging.error(f"Error caching signed URL: {e}")

            return jsonify({'signed_url': presigned_url}), 200

    except psycopg2.Error as e:
        print(f"Database error: {e}")
        return jsonify({'message': 'Database error'}), 500
    except ClientError as e:
        print(f"Boto3 error: {e}")
        return jsonify({'message': 'Failed to generate signed URL'}), 500
    except Exception as e:
        print(f"Error getting signed URL: {e}")
        return jsonify({'message': 'Failed to get signed URL'}), 500
    finally:
        if conn:
            conn.close()

@library_bp.route('/models', methods=['POST'])
def add_library_model():
    conn = None
    try:
        conn = get_db_connection()
        if conn is None:
            return jsonify({'message': 'Database connection failed'}), 500

        data = request.get_json()
        model_name = data.get('model_name')
        model_url = data.get('model_url')
        model_image = data.get('model_image')
        model_category = data.get('model_category')

        if not all([model_name, model_url, model_image, model_category]):
            return jsonify({'message': 'Missing required fields'}), 400

        with conn.cursor() as cursor:
            cursor.execute(
                "INSERT INTO library_models (model_name, model_url, model_image, model_category) VALUES (%s, %s, %s, %s) RETURNING id, model_name, model_url, model_image, model_category",
                (model_name, model_url, model_image, model_category)
            )
            inserted_model = cursor.fetchone()
            conn.commit()
            column_names = [desc[0] for desc in cursor.description]
            model_dict = dict(zip(column_names, inserted_model))

        # --- Invalidate the cache when a model is added ---
        if current_app.redis:
            try:
                current_app.redis.delete("library_models:all")  # Invalidate the 'all' cache
                if model_category:
                    current_app.redis.delete(f"library_models:{model_category}")  # Invalidate category-specific cache
                logging.info("Invalidated library model cache after adding new model")
            except Exception as e:
                logging.error(f"Error invalidating cache: {e}")

        return jsonify({'message': 'Model added successfully', 'model': model_dict}), 201

    except psycopg2.Error as e:
        if conn:
            conn.rollback()
        print(f"Database error: {e}")
        return jsonify({'message': 'Database error'}), 500
    except Exception as e:
        if conn:
            conn.rollback()
        print(f"Error adding model: {e}")
        return jsonify({'message': 'Failed to add model'}), 500
    finally:
        if conn:
            conn.close()