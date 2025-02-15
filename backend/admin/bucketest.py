import boto3
import os
from dotenv import load_dotenv
from botocore.exceptions import ClientError

load_dotenv()

AWS_REGION = os.environ.get('AWS_REGION')
AWS_ACCESS_KEY_ID = os.environ.get('AWS_ACCESS_KEY_ID')  # Only if not using IAM role
AWS_SECRET_ACCESS_KEY = os.environ.get('AWS_SECRET_ACCESS_KEY')  # Only if not using IAM role
S3_BUCKET_NAME = os.environ.get('S3_BUCKET_NAME')

if not AWS_REGION:
    raise ValueError("AWS_REGION environment variable not set.")
if not S3_BUCKET_NAME:
    raise ValueError("S3_BUCKET_NAME environment variable not set.")


if not os.environ.get('AWS_IAM_ROLE'):  # Add a way to check for IAM role
    if not AWS_ACCESS_KEY_ID:
        raise ValueError("AWS_ACCESS_KEY_ID environment variable not set (and not using IAM role).")
    if not AWS_SECRET_ACCESS_KEY:
        raise ValueError("AWS_SECRET_ACCESS_KEY environment variable not set (and not using IAM role).")


# Initialize S3 client
if AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY:
    s3_client = boto3.client(
        's3',
        region_name=AWS_REGION,
        aws_access_key_id=AWS_ACCESS_KEY_ID,
        aws_secret_access_key=AWS_SECRET_ACCESS_KEY
    )
else: # Use IAM Role or AWS CLI Config:
    s3_client = boto3.client('s3', region_name=AWS_REGION)



def upload_test_file(file_name, bucket, object_name=None):
    if object_name is None:
        object_name = file_name
    try:
        with open(file_name, "rb") as f:  # Open in binary read mode ("rb")
            s3_client.upload_fileobj(f, bucket, object_name) # Use upload_fileobj

    except ClientError as e:
        print(f"Error uploading file: {e}")
        return False
    return True


if __name__ == '__main__':
    test_file_name = "test_s3_upload.txt"
    with open(test_file_name, "w") as f:
        f.write("This is a test file to upload to S3.\n")
        f.write("Testing credentials and permissions.\n")
    if upload_test_file(test_file_name, S3_BUCKET_NAME):
        print(f"Successfully uploaded {test_file_name} to S3 bucket {S3_BUCKET_NAME}")
    else:
        print(f"Failed to upload {test_file_name} to S3 bucket {S3_BUCKET_NAME}")