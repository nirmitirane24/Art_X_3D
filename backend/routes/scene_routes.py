from flask import Blueprint, request, jsonify, session
import boto3
import json
from botocore.exceptions import ClientError
from utils.db import get_db_connection
from models import User
from utils.decorators import login_required
import requests
import os
from dotenv import load_dotenv

load_dotenv()

scene_bp = Blueprint('scene', __name__, url_prefix='/')

# --- Configuration (Use environment variables) ---
AWS_REGION = os.environ.get('AWS_REGION')
S3_BUCKET_NAME = os.environ.get('S3_BUCKET_NAME')
AWS_ACCESS_KEY_ID = os.environ.get('AWS_ACCESS_KEY_ID')
AWS_SECRET_ACCESS_KEY = os.environ.get('AWS_SECRET_ACCESS_KEY')

# --- Validate Environment Variables ---
if not AWS_REGION:
    raise ValueError("AWS_REGION environment variable not set.")
if not S3_BUCKET_NAME:
    raise ValueError("S3_BUCKET_NAME environment variable not set.")
# --- Initialize S3 client ---
if AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY:
    s3_client = boto3.client(
        's3',
        region_name=AWS_REGION,
        aws_access_key_id=AWS_ACCESS_KEY_ID,
        aws_secret_access_key=AWS_SECRET_ACCESS_KEY
    )
else:
    s3_client = boto3.client('s3', region_name=AWS_REGION)  # IAM Role or AWS CLI

@scene_bp.route('/save', methods=['POST'])
@login_required
def save_scene():
    try:
        # --- 1. Get Data from FormData ---
        scene_name = request.form.get('sceneName')
        username = request.form.get('username')
        scene_file = request.files.get('sceneFile')

        # --- 2. Validate Data ---
        if not scene_name or not username or not scene_file:
            return jsonify({'error': 'Missing required data (sceneName, username, sceneFile)'}), 400

        # --- 3. Get User ID (from session) ---
        logged_in_username = session.get('username')
        if not logged_in_username or logged_in_username != username:
            return jsonify({'error': 'Unauthorized or mismatched user'}), 403

        user = User.get_user_by_username(logged_in_username)
        if not user:
            return jsonify({'error': 'User not found'}), 404
        user_id = user.id

        # --- 4. Database Interaction ---
        conn = get_db_connection()
        if conn is None:
            return jsonify({'error': 'Database connection failed'}), 500

        try:
            with conn.cursor() as cursor:
                cursor.execute(
                    "INSERT INTO Scenes (user_id, s3_bucket_name, scene_name) VALUES (%s, %s, %s)",
                    (user_id, S3_BUCKET_NAME, scene_name)
                )
                conn.commit()
                scene_id = cursor.lastrowid
                object_key = f"{user_id}/{scene_id}/{scene_file.filename}"
                 # No updating here

        except Exception as db_err:
            conn.rollback()
            print(f"Database error: {db_err}")
            return jsonify({'error': 'Database error'}), 500

        # --- 5. S3 Upload (Direct Upload, Public Read) ---
        try:
            file_content = scene_file.read()
            print(f"Uploading to S3: Key={object_key}, Size={len(file_content)} bytes")

            s3_client.put_object(
                Bucket=S3_BUCKET_NAME,
                Key=object_key,
                Body=file_content,
            )


        except ClientError as e:
            print(f"S3 upload error: {e}")
            return jsonify({'error': f'S3 upload error: {e}'}), 500


        # --- 6. Generate Public URL ---
        public_url = f"https://{S3_BUCKET_NAME}.s3.{AWS_REGION}.amazonaws.com/{object_key}"
        print(f"Public URL: {public_url}")

        # --- 7. Update Database with Public URL ---
        try:
            with conn.cursor() as cursor:
                cursor.execute("UPDATE Scenes SET s3_key = %s WHERE scene_id = %s", (public_url, scene_id)) #store public url
                conn.commit()
        except Exception as db_err:
            conn.rollback()
            print(f"Database error (updating URL): {db_err}")
            return jsonify({'error': 'Database error while updating URL'}), 500

        print("S3 upload and URL generation successful!")
        return jsonify({'message': 'Scene saved successfully', 'sceneId': scene_id, 'publicUrl': public_url}), 200

    except Exception as e:
        print(f"An unexpected error occurred: {e}")
        return jsonify({'error': str(e)}), 500
    finally:
        if 'conn' in locals() and conn is not None and conn.open:
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
            cursor.execute("SELECT s3_key FROM Scenes WHERE scene_id = %s", (scene_id,))
            scene_data = cursor.fetchone()

        if not scene_data:
            return jsonify({'error': 'Scene not found'}), 404

        public_url = scene_data['s3_key'] # Get public url

        return jsonify({'publicUrl': public_url}), 200

    except Exception as e:
        print(f"Error getting scene URL: {e}")
        return jsonify({'error': str(e)}), 500
    finally:
        if 'conn' in locals() and conn is not None and conn.open:
            conn.close()