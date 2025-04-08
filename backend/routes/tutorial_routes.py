from flask import Blueprint, jsonify, request, current_app
import boto3
from botocore.exceptions import ClientError
import psycopg2
import os
from utils.decorators import login_required # Keep if authentication is needed for tutorials
from datetime import datetime, timedelta
from utils.db import get_db_connection
import logging
import json

tutorial_bp = Blueprint('tutorials', __name__, url_prefix='/tutorials')

# Assuming R2 client setup is similar to library_routes.py
# You might want to move this to a shared utils file if not already done
CLOUDFLARE_ACCESS_KEY = os.environ.get('CLOUDFLARE_ACCESS_KEY')
CLOUDFLARE_SECRET_KEY = os.environ.get('CLOUDFLARE_SECRET_KEY')
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

@tutorial_bp.route('/', methods=['GET'])
@login_required # Uncomment if users must be logged in to view tutorials
def get_tutorials():
    cache_key = "tutorials:all"

    # --- Check Cache ---
    if current_app.redis:
        try:
            cached_tutorials_json = current_app.redis.get(cache_key)
            if cached_tutorials_json:
                logging.info(f"Returning tutorials from cache (key: {cache_key})")
                return jsonify(json.loads(cached_tutorials_json.decode('utf-8'))), 200
        except Exception as e:
            logging.error(f"Error retrieving tutorials from cache: {e}")

    conn = None
    try:
        conn = get_db_connection()
        if conn is None:
            return jsonify({'message': 'Database connection failed'}), 500

        with conn.cursor() as cursor:
            # Fetch necessary fields including the thumbnail key
            cursor.execute("""
                SELECT id, title, description, thumbnail_key
                FROM tutorials
                ORDER BY created_at DESC
            """)
            tutorials_raw = cursor.fetchall()
            column_names = [desc[0] for desc in cursor.description]

        tutorial_list = []
        r2_client = get_r2_client()

        for tutorial_row in tutorials_raw:
            tutorial_dict = dict(zip(column_names, tutorial_row))
            thumbnail_url = None

            # Generate presigned URL for the thumbnail
            if tutorial_dict.get('thumbnail_key'):
                try:
                    thumbnail_url = r2_client.generate_presigned_url(
                        'get_object',
                        Params={'Bucket': CLOUDFLARE_BUCKET_NAME, 'Key': tutorial_dict['thumbnail_key']},
                        ExpiresIn=3600  # 1 hour validity for thumbnail URL
                    )
                except ClientError as e:
                    logging.error(f"Error generating presigned URL for thumbnail {tutorial_dict['thumbnail_key']}: {e}")
                except Exception as e:
                    logging.error(f"Unexpected error generating presigned URL for thumbnail {tutorial_dict['thumbnail_key']}: {e}")


            tutorial_dict['thumbnail_url'] = thumbnail_url
            # We don't need the raw key in the frontend response
            tutorial_dict.pop('thumbnail_key', None)
            tutorial_list.append(tutorial_dict)

        # --- Cache the result ---
        if current_app.redis:
            try:
                current_app.redis.setex(cache_key, 3600, json.dumps(tutorial_list)) # Cache for 1 hour
                logging.info(f"Cached tutorials list (key: {cache_key})")
            except Exception as e:
                logging.error(f"Error caching tutorials: {e}")

        return jsonify(tutorial_list), 200

    except psycopg2.Error as e:
        logging.error(f"Database error fetching tutorials: {e}")
        return jsonify({'message': 'Database error'}), 500
    except Exception as e:
        logging.error(f"Error fetching tutorials: {e}")
        return jsonify({'message': 'Failed to fetch tutorials'}), 500
    finally:
        if conn:
            conn.close()


@tutorial_bp.route('/<int:tutorial_id>/signed_url', methods=['GET'])
@login_required # Uncomment if users must be logged in to get video URL
def get_tutorial_signed_url(tutorial_id):
    cache_key = f"tutorial_signed_url:{tutorial_id}"

    # --- Check Cache ---
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
            # Fetch the video key
            cursor.execute("SELECT video_key FROM tutorials WHERE id = %s", (tutorial_id,))
            result = cursor.fetchone()

            if not result:
                return jsonify({'message': 'Tutorial not found'}), 404

            video_key = result[0]
            if not video_key:
                 return jsonify({'message': 'Video key not found for this tutorial'}), 404

        r2_client = get_r2_client()
        try:
            presigned_url = r2_client.generate_presigned_url(
                'get_object',
                Params={'Bucket': CLOUDFLARE_BUCKET_NAME, 'Key': video_key},
                ExpiresIn=3600 # 1 hour validity for the video link
            )
        except ClientError as e:
            logging.error(f"Error generating presigned URL for video {video_key}: {e}")
            return jsonify({'message': 'Failed to generate video URL'}), 500
        except Exception as e:
             logging.error(f"Unexpected error generating presigned URL for video {video_key}: {e}")
             return jsonify({'message': 'Failed to generate video URL'}), 500

        # --- Cache the signed URL ---
        if current_app.redis:
            try:
                # Cache for slightly less than expiry time (e.g., 55 mins for 1 hour expiry)
                current_app.redis.setex(cache_key, 3300, presigned_url)
                logging.info(f"Cached signed URL (key: {cache_key})")
            except Exception as e:
                logging.error(f"Error caching signed URL: {e}")

        return jsonify({'signed_url': presigned_url}), 200

    except psycopg2.Error as e:
        logging.error(f"Database error fetching tutorial video key: {e}")
        return jsonify({'message': 'Database error'}), 500
    except Exception as e:
        logging.error(f"Error getting signed URL for tutorial {tutorial_id}: {e}")
        return jsonify({'message': 'Failed to get signed URL'}), 500
    finally:
        if conn:
            conn.close()