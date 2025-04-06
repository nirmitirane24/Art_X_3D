# --- scene_routes.py --- (Revised with Subscription Checks, Caching, and Thumbnail Fix)
from flask import Blueprint, request, jsonify, session, current_app
import boto3
import json
from botocore.exceptions import ClientError
from utils.db import get_db_connection
from models import User
from utils.decorators import login_required
import os
from dotenv import load_dotenv
from pathlib import Path
from urllib.parse import urlparse
from datetime import datetime, timezone
import timeago
import pytz
import logging


load_dotenv(dotenv_path=Path(__file__).resolve().parent.parent / '.env')
scene_bp = Blueprint('scene', __name__, url_prefix='/')


# --- Configuration ---
AWS_REGION = os.environ.get('AWS_REGION')
S3_BUCKET_NAME = os.environ.get('S3_BUCKET_NAME')
AWS_ACCESS_KEY_ID = os.environ.get('AWS_ACCESS_KEY_ID')
AWS_SECRET_ACCESS_KEY = os.environ.get('AWS_SECRET_ACCESS_KEY')

SUPABASE_S3_REGION = os.environ.get('SUPABASE_S3_REGION')
SUPABASE_S3_ENDPOINT = os.environ.get('SUPABASE_S3_ENDPOINT')
SUPABASE_S3_ACCESS_KEY = os.environ.get('SUPABASE_S3_ACCESS_KEY')
SUPABASE_S3_SECRET_KEY = os.environ.get('SUPABASE_S3_SECRET_KEY')
SUPABASE_BUCKET_NAME = os.environ.get('SUPABASE_BUCKET_NAME')
SUPABASE_API_KEY = os.environ.get('SUPABASE_SERVICE_ROLE_KEY')
SUPABASE_URL = os.environ.get('SUPABASE_URL')

CLOUDFLARE_ACCESS_KEY = os.environ.get('CLOUDFLARE_ACCESS_KEY')
CLOUDFLARE_SECRET_KEY = os.environ.get('CLOUDFLARE_SECRET_KEY')
CLOUDFLARE_TOKEN = os.environ.get('CLOUDFLARE_TOKEN')
CLOUDFLARE_ENDPOINT = os.environ.get('CLOUDFLARE_ENDPOINT')
CLOUDFLARE_R2_REGION = "auto"
CLOUDFLARE_BUCKET_NAME = os.environ.get('CLOUDFLARE_BUCKET_NAME')

# --- Logging Configuration ---
logging.basicConfig(level=logging.INFO)


if not AWS_REGION:
    raise ValueError("AWS_REGION environment variable not set.")
if not S3_BUCKET_NAME:
    raise ValueError("S3_BUCKET_NAME environment variable not set.")

if AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY:
    s3_client = boto3.client(
        's3',
        region_name=AWS_REGION,
        aws_access_key_id=AWS_ACCESS_KEY_ID,
        aws_secret_access_key=AWS_SECRET_ACCESS_KEY
    )
else:
    s3_client = boto3.client('s3', region_name=AWS_REGION)

if not SUPABASE_S3_ENDPOINT or not SUPABASE_API_KEY or not SUPABASE_BUCKET_NAME:
    raise ValueError("Supabase environment variables (URL, KEY, BUCKET_NAME) are not set.")

cloudflare_r2_client = boto3.client(
    's3',
    region_name=CLOUDFLARE_R2_REGION,
    endpoint_url=CLOUDFLARE_ENDPOINT,
    aws_access_key_id=CLOUDFLARE_ACCESS_KEY,
    aws_secret_access_key=CLOUDFLARE_SECRET_KEY
)


@scene_bp.route('/save', methods=['POST'])
@login_required
def save_scene():
    username = session.get('username')
    if not username:
        return jsonify({'error': 'Unauthorized'}), 403

    user = User.get_user_by_username(username)
    if not user:
        return jsonify({'error': 'User not found'}), 404
    user_id = user.id

    # --- SUBSCRIPTION CHECK (with Redis caching) ---
    if current_app.redis:
        try:
            subscription_key = f"subscription:{user_id}"
            subscription_level = current_app.redis.get(subscription_key)
            if subscription_level:
                subscription_level = subscription_level.decode('utf-8')
                logging.info(f"Subscription level retrieved from cache for user {username}")
                if subscription_level == 'free':
                    return jsonify({'error': 'Saving scenes requires a Pro subscription'}), 403
        except Exception as e:
            logging.error(f"Error checking subscription from Redis: {e}")

    conn = None
    try:
        conn = get_db_connection()
        if conn is None:
            return jsonify({'error': 'Database connection failed'}), 500

        if not current_app.redis or not subscription_level: # Only query if not cached
            with conn.cursor() as cursor:
                cursor.execute("SELECT subscription_level FROM users WHERE id = %s", (user_id,))
                user_subscription = cursor.fetchone()

            if not user_subscription or user_subscription[0] == 'free':
                if current_app.redis:
                    try:
                        current_app.redis.setex(subscription_key, 3600, 'free')  # Cache for 1 hour
                        logging.info(f"Cached subscription level 'free' for user {username}")
                    except Exception as e:
                        logging.error(f"Error caching subscription level: {e}")

                return jsonify({'error': 'Saving scenes requires a Pro subscription'}), 403
            else:
                if current_app.redis:
                    try:
                        current_app.redis.setex(subscription_key, 3600, user_subscription[0])
                        logging.info(f"Cached subscription level '{user_subscription[0]}' for user {username}")
                        subscription_level = user_subscription[0] #set subscription to user subscription to prevent name error
                    except Exception as e:
                        logging.error(f"Error caching subscription level: {e}")


        scene_data_json = request.form.get('sceneData')
        scene_name = request.form.get('sceneName')
        if not scene_data_json or not scene_name:
            return jsonify({'error': 'Missing required data'}), 400
        scene_data = json.loads(scene_data_json)

        objects = scene_data.get('objects')
        scene_settings = scene_data.get('sceneSettings')
        scene_id = scene_data.get('sceneId')

        with conn.cursor() as cursor:
            if scene_id:
                object_key = f"{user_id}/{scene_id}-{scene_name}-{username}.json"
                cursor.execute(
                    "UPDATE Scenes SET s3_bucket_name = %s, scene_name = %s, s3_key = %s, updated_at = NOW() WHERE scene_id = %s AND user_id = %s",
                    (S3_BUCKET_NAME, scene_name, object_key, scene_id, user_id)
                )
                if cursor.rowcount == 0:
                    conn.rollback()
                    return jsonify({'error': 'Scene not found or unauthorized'}), 404
            else:
                object_key = f"{user_id}/{scene_name}-{username}.json"
                cursor.execute(
                    "INSERT INTO Scenes (user_id, s3_bucket_name, scene_name, s3_key) VALUES (%s, %s, %s, %s) RETURNING scene_id",
                    (user_id, S3_BUCKET_NAME, scene_name, object_key)
                )
                scene_id = cursor.fetchone()[0]

            json_data = json.dumps({'objects': objects, 'sceneSettings': scene_settings})
            s3_client.put_object(Bucket=S3_BUCKET_NAME, Key=object_key, Body=json_data, ContentType='application/json')
            print(f"Uploaded scene data to S3: {object_key}")

            thumbnail_file = request.files.get('thumbnail')
            if thumbnail_file:
                thumbnail_path = f"Thumbnails/{user_id}/{scene_id}.png"
                try:
                    # Use BytesIO to avoid writing to disk
                    from io import BytesIO
                    thumbnail_data = BytesIO()
                    thumbnail_file.save(thumbnail_data)
                    thumbnail_data.seek(0)  # Reset pointer to beginning of the stream

                    cloudflare_r2_client.put_object(
                        Bucket=CLOUDFLARE_BUCKET_NAME,
                        Key=thumbnail_path,
                        Body=thumbnail_data,
                        ContentType='image/png'
                    )
                    print(f"Uploaded thumbnail to Cloudflare R2: {thumbnail_path}")

                except ClientError as e:
                    print(f"Cloudflare R2 Error: {e}")
                    conn.rollback()
                    return jsonify({'error': f'Failed to upload thumbnail to Cloudflare R2: {str(e)}'}), 500
                except Exception as e:
                    print(f"General Error uploading thumbnail: {e}")
                    conn.rollback()
                    return jsonify({'error': 'Failed to upload thumbnail'}), 500

                cursor.execute("SELECT id FROM scene_thumbnails WHERE scene_id = %s", (scene_id,))
                existing_thumbnail = cursor.fetchone()

                if existing_thumbnail:
                    cursor.execute(
                        "UPDATE scene_thumbnails SET image_url = %s WHERE scene_id = %s",
                        (thumbnail_path, scene_id)
                    )
                else:
                    cursor.execute(
                        "INSERT INTO scene_thumbnails (scene_id, image_url) VALUES (%s, %s)",
                        (scene_id, thumbnail_path)
                    )

            conn.commit()

            # --- Invalidate the cache when a scene is saved ---
            if current_app.redis:
                try:
                    scene_list_key = f"scenes:{user_id}"
                    current_app.redis.delete(scene_list_key)  # Invalidate scenes list
                    scene_key = f"scene:{scene_id}"
                    current_app.redis.delete(scene_key)       # Invalidate scene details
                    logging.info(f"Invalidated scene cache for user {username}, scene {scene_id}")
                except Exception as e:
                    logging.error(f"Error invalidating cache: {e}")

            return jsonify({'message': 'Scene saved successfully', 'sceneId': scene_id}), 200 if scene_id else 201

    except ClientError as e:
        if conn:
            conn.rollback()
        print(f"S3 Error: {e}")
        return jsonify({'error': 'Failed to upload scene data to S3'}), 500
    except Exception as e:
        if conn:
            conn.rollback()
        print(f"Error saving scene: {e}")
        return jsonify({'error': 'An unexpected error occurred'}), 500
    finally:
        if conn and not conn.closed:
            conn.close()

@scene_bp.route('/get-scene-url', methods=['GET'])
@login_required
def get_scene_url():
    scene_id = request.args.get('sceneId')
    if not scene_id:
        return jsonify({'error': 'sceneId is required'}), 400

    try:
        conn = get_db_connection()
        if conn is None:
            return jsonify({'error': 'Database connection failed'}), 500

        with conn.cursor() as cursor:
            cursor.execute("SELECT s3_key, scene_name FROM Scenes WHERE scene_id = %s", (scene_id,))
            scene_data = cursor.fetchone()

        if not scene_data:
            return jsonify({'error': 'Scene not found'}), 404

        return jsonify({'s3Key': scene_data[0], 'sceneName': scene_data[1]}), 200

    except Exception as e:
        print(f"Error getting scene URL: {e}")
        return jsonify({'error': str(e)}), 500
    finally:
        if conn is not None and not conn.closed:
            conn.close()


@scene_bp.route('/get-scene', methods=['GET'])
@login_required
def get_scene():
    scene_id = request.args.get('sceneId')
    if not scene_id:
        return jsonify({'error': 'sceneId is required'}), 400

    conn = None
    try:
        conn = get_db_connection()
        if conn is None:
            return jsonify({'error': 'Database connection failed'}), 500

        with conn.cursor() as cursor:
            cursor.execute("SELECT s3_key, scene_name FROM Scenes WHERE scene_id = %s", (scene_id,))
            scene_data = cursor.fetchone()

        if not scene_data:
            return jsonify({'error': 'Scene not found'}), 404

        s3_key = scene_data[0]

        response = s3_client.get_object(Bucket=S3_BUCKET_NAME, Key=s3_key)
        file_content = response['Body'].read()

        scene_data = json.loads(file_content.decode('utf-8'))  # Parse JSON data

        return jsonify(scene_data), 200

    except ClientError as e:
        print(f"S3 Error: {e}")
        return jsonify({'error': 'Failed to retrieve scene from S3'}), 500
    except Exception as e:
        print(f"Error getting scene: {e}")
        return jsonify({'error': str(e)}), 500
    finally:
        if conn is not None:
            conn.close()

@scene_bp.route('/community-examples', methods=['GET'])
@login_required
def get_community_examples():
    try:
        conn = get_db_connection()
        if conn is None:
            return jsonify({'error': 'Database connection failed'}), 500

        with conn.cursor() as cursor:
            cursor.execute("SELECT example_id, example_name, description, thumbnail_s3_key FROM community_examples")  # Select necessary fields
            examples = cursor.fetchall()

        example_list = []
        for example in examples:
            example_list.append({
                "example_id": example[0],
                "example_name": example[1],
                "description": example[2],
                "thumbnail_s3_key": example[3]  # Include thumbnail key
            })
        return jsonify(example_list), 200

    except Exception as e:
        print(f"Error getting community examples: {e}")
        return jsonify({'error': str(e)}), 500
    finally:
        if conn is not None:
            conn.close()

@scene_bp.route('/get-community-example-url', methods=['GET'])
@login_required
def get_community_example_url():
    example_id = request.args.get('exampleId')
    if not example_id:
        return jsonify({'error': 'exampleId is required'}), 400

    try:
        conn = get_db_connection()
        with conn.cursor() as cursor:
            cursor.execute("SELECT s3_key FROM community_examples WHERE example_id = %s", (example_id,))
            example_data = cursor.fetchone()

        if not example_data:
            return jsonify({'error': 'Community example not found'}), 404

        return jsonify({'s3Key': example_data[0]}), 200

    except Exception as e:
        print(f"Error getting community example URL: {e}")
        return jsonify({'error': str(e)}), 500
    finally:
        if conn is not None:
            conn.close()

@scene_bp.route('/get-community-example', methods=['GET'])
@login_required
def get_community_example():
    example_id = request.args.get('exampleId')
    if not example_id:
        return jsonify({'error': 'exampleId is required'}), 400

    conn = None
    try:
        conn = get_db_connection()
        with conn.cursor() as cursor:
            cursor.execute("SELECT s3_key FROM community_examples WHERE example_id = %s", (example_id,))
            example_data = cursor.fetchone()

        if not example_data:
            return jsonify({'error': 'Community example not found'}), 404

        s3_key = example_data[0]

        s3_client = boto3.client(
            's3',
            region_name=os.environ.get('SUPABASE_S3_REGION'),
            endpoint_url=os.environ.get('SUPABASE_S3_ENDPOINT'),
            aws_access_key_id=os.environ.get('SUPABASE_S3_ACCESS_KEY'),
            aws_secret_access_key=os.environ.get('SUPABASE_S3_SECRET_KEY')
        )

        response = s3_client.get_object(Bucket=os.environ.get('SUPABASE_BUCKET_NAME'), Key=s3_key)
        # print(response)
        file_content = response['Body'].read()

        return jsonify(json.loads(file_content.decode('utf-8')))

    except ClientError as e:
        print(f"S3 Error: {e}")
        return jsonify({'error': 'Failed to retrieve scene from Supabase Storage'}), 500
    except Exception as e:
        print(f"Error getting community example: {e}")
        return jsonify({'error': str(e)}), 500
    finally:
        if conn is not None:
            conn.close()



@scene_bp.route('/scenes', methods=['GET'])
@login_required
def get_user_scenes():
    user = User.get_user_by_username(session.get('username'))
    if not user:
        return jsonify({'error': 'User not found'}), 404

    user_id = user.id
    cache_key = f"scenes:{user_id}"  # Unique cache key for the user's scenes

    if current_app.redis:
        try:
            cached_scenes = current_app.redis.get(cache_key)
            if cached_scenes:
                logging.info(f"Returning scene list from cache for user {user_id}")
                return jsonify(json.loads(cached_scenes.decode('utf-8'))), 200  # Return cached scene list
        except Exception as e:
            logging.error(f"Error retrieving scene list from cache: {e}")

    conn = None
    try:
        conn = get_db_connection()
        if conn is None:
            return jsonify({'error': 'Database connection failed'}), 500

        with conn.cursor() as cursor:
            cursor.execute("""
                SELECT s.scene_id, s.scene_name, s.updated_at, st.image_url
                FROM Scenes s
                LEFT JOIN scene_thumbnails st ON s.scene_id = st.scene_id
                WHERE s.user_id = %s
                ORDER BY s.updated_at DESC
            """, (user.id,))
            scenes = cursor.fetchall()

        ist = pytz.timezone('Europe/London')
        scene_list = []

        for scene in scenes:
            last_updated = scene[2]
            if last_updated.tzinfo is None:
                last_updated = ist.localize(last_updated)

            thumbnail_url = None  # Default None if no thumbnail exists
            if scene[3]:
                try:
                    thumbnail_url = cloudflare_r2_client.generate_presigned_url(
                        'get_object',
                        Params={'Bucket': CLOUDFLARE_BUCKET_NAME, 'Key': scene[3]},
                        ExpiresIn=3600  # URL valid for 1 hour
                    )
                except Exception as e:
                    print(f"Error generating signed URL for scene {scene[0]}: {e}")

            scene_list.append({
                "scene_id": scene[0],
                "scene_name": scene[1],
                "last_updated": timeago.format(last_updated, datetime.now(ist)),
                "thumbnail_url": thumbnail_url
            })

        if current_app.redis:
            try:
                current_app.redis.setex(cache_key, 3600, json.dumps(scene_list))
                logging.info(f"Cached scene list for user {user_id}")
            except Exception as e:
                logging.error(f"Error caching scene list: {e}")

        return jsonify(scene_list), 200

    except Exception as e:
        print(f"Error getting user scenes: {e}")
        return jsonify({'error': str(e)}), 500
    finally:
        if conn is not None and not conn.closed:
            conn.close()
            
            
# --- Delete Scene Route ---
# This route deletes a scene and its associated thumbnail from S3 and R2, respectively.
@scene_bp.route('/delete-scene', methods=['DELETE'])
@login_required
def delete_scene():
    username = session.get('username')
    if not username:
        # This check is technically redundant due to @login_required,
        # but good for clarity if the decorator were removed.
        return jsonify({'error': 'Unauthorized'}), 403

    scene_id = request.args.get('sceneId')
    if not scene_id:
        return jsonify({'error': 'Missing sceneId parameter'}), 400

    conn = None
    try:
        user = User.get_user_by_username(username)
        if not user:
            return jsonify({'error': 'User not found'}), 404
        user_id = user.id

        logging.info(f"Attempting to delete scene {scene_id} for user {username} (ID: {user_id})")

        conn = get_db_connection()
        if conn is None:
            logging.error("Database connection failed during scene deletion.")
            return jsonify({'error': 'Database connection failed'}), 500

        # --- 1. Verify Scene Ownership and Get S3/Thumbnail Keys ---
        s3_key_to_delete = None
        thumbnail_key_to_delete = None
        with conn.cursor() as cursor:
            # Check if scene exists AND belongs to the user, get S3 key
            cursor.execute(
                "SELECT s3_key FROM Scenes WHERE scene_id = %s AND user_id = %s",
                (scene_id, user_id)
            )
            scene_result = cursor.fetchone()
            if not scene_result:
                logging.warning(f"Scene {scene_id} not found or user {user_id} does not own it.")
                return jsonify({'error': 'Scene not found or you do not have permission to delete it'}), 404
            s3_key_to_delete = scene_result[0]
            logging.info(f"Found scene {scene_id} owned by user {user_id}. S3 key: {s3_key_to_delete}")

            # Check if a thumbnail exists for this scene, get its key (image_url)
            cursor.execute(
                "SELECT image_url FROM scene_thumbnails WHERE scene_id = %s",
                (scene_id,)
            )
            thumbnail_result = cursor.fetchone()
            if thumbnail_result:
                thumbnail_key_to_delete = thumbnail_result[0]
                logging.info(f"Found thumbnail for scene {scene_id}. R2 key: {thumbnail_key_to_delete}")

        # --- 2. Delete from External Storage (S3 and R2) ---
        # Delete Scene Data from AWS S3
        if s3_key_to_delete:
            try:
                logging.info(f"Deleting S3 object: Bucket={S3_BUCKET_NAME}, Key={s3_key_to_delete}")
                s3_client.delete_object(Bucket=S3_BUCKET_NAME, Key=s3_key_to_delete)
                logging.info(f"Successfully deleted S3 object: {s3_key_to_delete}")
            except ClientError as e:
                logging.error(f"Failed to delete S3 object {s3_key_to_delete}: {e}")
                # Decide if this is fatal. For now, log and continue, but the DB record will remain.
                # Could return 500 here if S3 deletion is critical before DB deletion.
                # Let's proceed but log the inconsistency.
                pass # Logged the error, continue to attempt other deletions

        # Delete Thumbnail from Cloudflare R2
        if thumbnail_key_to_delete:
            try:
                logging.info(f"Deleting R2 object: Bucket={CLOUDFLARE_BUCKET_NAME}, Key={thumbnail_key_to_delete}")
                cloudflare_r2_client.delete_object(Bucket=CLOUDFLARE_BUCKET_NAME, Key=thumbnail_key_to_delete)
                logging.info(f"Successfully deleted R2 object: {thumbnail_key_to_delete}")
            except ClientError as e:
                logging.error(f"Failed to delete R2 object {thumbnail_key_to_delete}: {e}")
                # Log and continue
                pass

        # --- 3. Delete from Database (PostgreSQL) ---
        with conn.cursor() as cursor:
            # Delete thumbnail record first (if it exists)
            if thumbnail_key_to_delete:
                 logging.info(f"Deleting thumbnail record for scene_id {scene_id} from database.")
                 cursor.execute("DELETE FROM scene_thumbnails WHERE scene_id = %s", (scene_id,))
                 logging.info(f"Deleted thumbnail record for scene_id {scene_id} (Rows affected: {cursor.rowcount})")


            # Delete scene record (ensuring user_id match again for safety)
            logging.info(f"Deleting scene record for scene_id {scene_id} and user_id {user_id} from database.")
            cursor.execute("DELETE FROM Scenes WHERE scene_id = %s AND user_id = %s", (scene_id, user_id))
            logging.info(f"Deleted scene record for scene_id {scene_id} (Rows affected: {cursor.rowcount})")


        conn.commit() # Commit transaction after successful deletions
        logging.info(f"Database transaction committed for scene {scene_id} deletion.")

        # --- 4. Invalidate Cache ---
        if current_app.redis:
            try:
                scene_list_key = f"scenes:{user_id}"
                scene_key = f"scene:{scene_id}" # If you cache individual scenes
                deleted_count = current_app.redis.delete(scene_list_key, scene_key)
                logging.info(f"Invalidated Redis cache keys: {scene_list_key}, {scene_key}. Keys deleted: {deleted_count}")
            except Exception as e:
                logging.error(f"Error invalidating Redis cache for user {user_id}, scene {scene_id}: {e}")
                # Cache invalidation failure is usually not critical enough to fail the request

        return jsonify({'message': 'Scene deleted successfully'}), 200

    except Exception as e:
        if conn:
            conn.rollback() # Rollback DB changes if any error occurred before commit
            logging.error(f"Database transaction rolled back due to error during scene {scene_id} deletion.")
        logging.exception(f"Error deleting scene {scene_id} for user {username}: {e}") # Use logging.exception to include stack trace
        return jsonify({'error': 'An unexpected error occurred during scene deletion'}), 500
    finally:
        if conn and not conn.closed:
            conn.close()
            logging.debug(f"Database connection closed for scene {scene_id} deletion request.")