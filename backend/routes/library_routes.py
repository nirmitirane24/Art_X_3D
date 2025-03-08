# routes/library_routes.py (Revised for psycopg2 + Cloudflare R2)
from flask import Blueprint, jsonify, request, current_app
import boto3
from botocore.exceptions import ClientError
import psycopg2  # Import psycopg2
import os
from utils.decorators import login_required
from datetime import datetime, timedelta
from utils.db import get_db_connection

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



@library_bp.route('/models', methods=['GET'])
def get_library_models():
    conn = None 
    try:
        conn = get_db_connection()  
        if conn is None:
            return jsonify({'message': 'Database connection failed'}), 500

        with conn.cursor() as cursor:
            category = request.args.get('category')
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