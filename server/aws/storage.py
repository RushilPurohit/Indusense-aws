
import os
import uuid
from pathlib import Path

import boto3
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

AWS_REGION = os.getenv("AWS_REGION", "us-east-1")
DATA_BUCKET = os.getenv("DATA_BUCKET")

if not DATA_BUCKET:
    raise RuntimeError("DATA_BUCKET is missing from environment")

# Connect to AWS S3
s3 = boto3.client(
    "s3",
    region_name=AWS_REGION
)


# Existing backend file upload function
def upload_file(file_path, object_key):

    s3.upload_file(
        file_path,
        DATA_BUCKET,
        object_key
    )

    return {
        "success": True,
        "key": object_key
    }


# Generate a temporary URL for React uploads
def generate_upload_url(
    filename,
    content_type="application/pdf"
):

    safe_filename = Path(filename).name

    if not safe_filename.lower().endswith(".pdf"):
        raise ValueError("Only PDF files are allowed")

    if content_type != "application/pdf":
        raise ValueError("Invalid content type")

    # Generate unique S3 object key
    key = f"manuals/{uuid.uuid4()}_{safe_filename}"

    # Generate presigned URL
    url = s3.generate_presigned_url(
        ClientMethod="put_object",
        Params={
            "Bucket": DATA_BUCKET,
            "Key": key,
            "ContentType": content_type
        },
        ExpiresIn=300
    )

    return {
        "url": url,
        "key": key
    }
