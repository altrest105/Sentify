from fastapi import FastAPI, UploadFile, HTTPException, BackgroundTasks, Form
from fastapi.responses import FileResponse
import os
import uuid

from utils import validate_headers, validate_csv_file, delete_file_after_send, collect_statistics

app = FastAPI()
UPLOAD_DIR = "uploads"

@app.post("/upload-file")
async def upload_file(
        background_tasks: BackgroundTasks,
        file: UploadFile = Form(...),
        is_verification: bool = Form(...),
):

    try:
        if not await validate_csv_file(file):
            raise HTTPException(
                status_code=400,
                detail="Only CSV files allowed"
            )

        file_id = str(uuid.uuid4())

        file_path = os.path.join(UPLOAD_DIR, f"{file_id}_{file.filename}")

        with open(file_path, "wb") as buffer:
            content = await file.read()
            buffer.write(content)

        if not validate_headers(file_path, is_verification):
            raise HTTPException(
                status_code=400,
                detail="CSV file contains wrong headers"
            )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Ошибка при загрузке файла: {str(e)}")

    # new_file = do_some_stuff(file_path, verification_file)
    response = FileResponse(
        path=file_path,
        filename="response.csv",
        media_type='application/octet-stream'
    )

    background_tasks.add_task(delete_file_after_send, file_path)

    return {"file": response, "statistic": collect_statistics(new_file)}