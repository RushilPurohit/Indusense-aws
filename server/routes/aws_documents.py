
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from server.aws.storage import generate_upload_url

router = APIRouter()


class UploadRequest(BaseModel):
    filename: str = Field(min_length=1, max_length=200)
    content_type: str = "application/pdf"


@router.post("/upload-url")
def create_upload_url(request: UploadRequest):

    if request.content_type != "application/pdf":
        raise HTTPException(
            status_code=400,
            detail="Only PDF files are allowed"
        )

    if not request.filename.lower().endswith(".pdf"):
        raise HTTPException(
            status_code=400,
            detail="Invalid PDF filename"
        )

    try:
        result = generate_upload_url(
            filename=request.filename,
            content_type=request.content_type
        )

        return {
            "success": True,
            "upload_url": result["url"],
            "key": result["key"],
            "message": "Upload URL generated successfully"
        }

    except Exception:
        raise HTTPException(
            status_code=500,
            detail="Could not generate upload URL"
        )
