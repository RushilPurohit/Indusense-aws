
import requests

# Replace this with the upload_url returned by Swagger
upload_url = "PASTE_PRESIGNED_URL_HERE"

file_path = "test.pdf"

with open(file_path, "rb") as file:
    response = requests.put(
        upload_url,
        data=file,
        headers={
            "Content-Type": "application/pdf"
        }
    )

if response.status_code == 200:
    print("SUCCESS: PDF uploaded to AWS S3!")
else:
    print("Upload failed:", response.status_code)
    print(response.text)
