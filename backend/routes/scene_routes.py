# --- scene_routes.py ---
from flask import Blueprint, request, jsonify, session
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

load_dotenv(dotenv_path=Path(__file__).resolve().parent.parent / '.env')

scene_bp = Blueprint('scene', __name__, url_prefix='/')

# --- Configuration ---
AWS_REGION = os.environ.get('AWS_REGION')
S3_BUCKET_NAME = os.environ.get('S3_BUCKET_NAME')
AWS_ACCESS_KEY_ID = os.environ.get('AWS_ACCESS_KEY_ID')
AWS_SECRET_ACCESS_KEY = os.environ.get('AWS_SECRET_ACCESS_KEY')

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


@scene_bp.route('/save', methods=['POST'])
@login_required
def save_scene():
    conn = None
    try:
        data = request.get_json()
        scene_name = data.get('sceneName')
        objects = data.get('objects')
        scene_settings = data.get('sceneSettings')
        scene_id = data.get('sceneId')  # Get scene_id from the request

        if not scene_name or not objects or not scene_settings:
            return jsonify({'error': 'Missing required data (sceneName, objects, or sceneSettings)'}), 400

        username = session.get('username')
        if not username:
            return jsonify({'error': 'Unauthorized'}), 403

        user = User.get_user_by_username(username)
        if not user:
            return jsonify({'error': 'User not found'}), 404
        user_id = user.id

        # Combine scene data
        scene_data = {
            'objects': objects,
            'sceneSettings': scene_settings
        }
        conn = get_db_connection()
        # --- S3 UPLOAD (Both Save and Update) ---
        # 1. Generate the object key.  Use scene_id if it exists (update).
        if scene_id:
            object_key = f"{user_id}/{scene_id}-{scene_name}-{username}.json"
        else:
            object_key = f"{user_id}/{scene_name}-{username}.json"  # No scene_id for new scenes


        # 2. Convert data to JSON.
        json_data = json.dumps(scene_data)

        # 3. Upload to S3 (always overwrite).
        s3_client.put_object(Bucket=S3_BUCKET_NAME, Key=object_key, Body=json_data, ContentType='application/json')
        print(f"Uploaded to S3: {object_key}")

        # --- DATABASE (Save or Update) ---
        conn = get_db_connection()
        if conn is None:
            return jsonify({'error': 'Database connection failed'}), 500

        with conn.cursor() as cursor:
            if scene_id:
                # UPDATE existing scene
                cursor.execute(
                    "UPDATE Scenes SET s3_bucket_name = %s, scene_name = %s, s3_key = %s WHERE scene_id = %s AND user_id = %s",
                    (S3_BUCKET_NAME, scene_name, object_key, scene_id, user_id)  # Include user_id for security
                )
                if cursor.rowcount == 0:  # Check if update was successful
                    conn.rollback()
                    return jsonify({'error': 'Scene not found or unauthorized'}), 404 #or 403
                conn.commit()
                return jsonify({'message': 'Scene updated successfully', 'sceneId': scene_id}), 200  # Return 200 for update

            else:
                # INSERT new scene
                cursor.execute(
                    "INSERT INTO Scenes (user_id, s3_bucket_name, scene_name, s3_key) VALUES (%s, %s, %s, %s) RETURNING scene_id",
                    (user_id, S3_BUCKET_NAME, scene_name, object_key)
                )
                scene_id = cursor.fetchone()[0]
                conn.commit()
                return jsonify({'message': 'Scene saved successfully', 'sceneId': scene_id}), 201  # Return 201 for create

    except ClientError as e:
        if conn:
            conn.rollback()
        print(f"S3 Error: {e}")
        return jsonify({'error': 'Failed to upload to S3'}), 500
    except Exception as e:
        if conn:
            conn.rollback()
        print(f"Error saving scene: {e}")
        return jsonify({'error': 'An unexpected error occurred'}), 500
    finally:
        if conn:
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

        return jsonify(json.loads(file_content.decode('utf-8')))

    except ClientError as e:
        print(f"S3 Error: {e}")
        return jsonify({'error': 'Failed to retrieve scene from S3'}), 500
    except Exception as e:
        print(f"Error getting scene: {e}")
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

    try:
        conn = get_db_connection()
        if conn is None:
            return jsonify({'error': 'Database connection failed'}), 500

        with conn.cursor() as cursor:
            cursor.execute("SELECT scene_id, scene_name FROM Scenes WHERE user_id = %s", (user.id,))
            scenes = cursor.fetchall()

        scene_list = []
        for scene in scenes:
            scene_list.append({
                "scene_id": scene[0],
                "scene_name": scene[1]
            })

        return jsonify(scene_list), 200

    except Exception as e:
        print(f"Error getting user scenes: {e}")
        return jsonify({'error': str(e)}), 500
    finally:
        if conn is not None and not conn.closed:
            conn.close()