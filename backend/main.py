from fastapi import FastAPI, UploadFile, HTTPException, BackgroundTasks
from fastapi.responses import FileResponse
import os
import uuid

from utils import validate_headers, validate_csv_file, delete_file_after_send, collect_statistics

app = FastAPI()
UPLOAD_DIR = "uploads"


@app.post("/upload-file/")
async def upload_file(
        background_tasks: BackgroundTasks,
        file: UploadFile,
        verification_file: bool
):
    try:
        if not await validate_csv_file(file):
            raise HTTPException(
                status_code=400,
                detail="Only CSV files allowed"
            )

        file_id = str(uuid.uuid4())

        file_path = os.path.join(UPLOAD_DIR, f"{file_id}_{file.filename}")

        if not validate_headers(file_path, verification_file):
            raise HTTPException(
                status_code=400,
                detail="CSV file contains wrong headers"
            )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Ошибка при загрузке файла: {str(e)}")

    new_file = do_some_stuff(file_path, verification_file)

    response = FileResponse(
        path=new_file,
        filename="response.csv",
        media_type='application/octet-stream'
    )

    background_tasks.add_task(delete_file_after_send, file_path)

    return {"file": response, "statistic": collect_statistics(new_file)}
