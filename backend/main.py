from fastapi import FastAPI, UploadFile, HTTPException, BackgroundTasks, Form
from fastapi.responses import FileResponse
import os
import uuid

from utils import validate_headers, validate_csv_file, delete_file_after_send, collect_statistics, parse_csv

app = FastAPI()
UPLOAD_DIR = "files"
file_info = {}

@app.post("/upload_file")
async def upload_file(
        background_tasks: BackgroundTasks,
        file: UploadFile = Form(...)
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
        validated, is_verification = await validate_headers(file_path)
        if not validated:
            raise HTTPException(
                status_code=400,
                detail="CSV file contains wrong headers"
            )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Ошибка при загрузке файла: {str(e)}")

    new_file_path = do_some_stuff(file_path, is_verification)

    background_tasks.add_task(delete_file_after_send, file_path)

    file_info[file_id] = new_file_path

    return {"file_id": file_id, "statistic": await collect_statistics(new_file_path), "content": await parse_csv(new_file_path)}


@app.get("/download_file/{file_id}")
async def download_file(file_id: str, background_tasks: BackgroundTasks):
    file_path = file_info.get(file_id)
    if not file_path:
        raise HTTPException(
            status_code=404,
            detail="File doesn't exists"
        )

    response = FileResponse(
        path=file_path,
        filename="response.csv",
        media_type='application/octet-stream'
    )

    background_tasks.add_task(delete_file_after_send, file_path)
    return response