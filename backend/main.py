from fastapi import FastAPI, UploadFile, HTTPException, Form, status
from fastapi.responses import FileResponse
import os
import uuid

from utils import validate_headers, validate_csv_file, delete_file_util, collect_statistics, parse_csv, filter_file
from stariy_file import get_mood

app = FastAPI()
UPLOAD_DIR = "files"
file_info = {}

@app.post("/upload_file")
async def upload_file(
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
        validated = await validate_headers(file_path)
        if not validated:
            raise HTTPException(
                status_code=400,
                detail="CSV file contains wrong headers"
            )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error loading file: {str(e)}")


    new_file_path = await get_mood(file_path)

    await delete_file_util(file_path)

    file_info[file_id] = new_file_path

    return {"file_id": file_id, "statistic": await collect_statistics(new_file_path), "content": await parse_csv(new_file_path)}


@app.get("/download_file/{file_id}")
async def download_file(file_id: str):
    file_path = file_info.get(file_id)
    if not file_path or not os.path.exists(file_path):
        raise HTTPException(
            status_code=404,
            detail="File doesn't exists"
        )

    response = FileResponse(
        path=file_path,
        filename="response.csv",
        media_type='application/octet-stream'
    )

    return response


@app.get("/filter_file/{file_id}")
async def filter_func(file_id: str, filter_column: str, filter_value: str):
    file_path = file_info.get(file_id)
    if not file_path or not os.path.exists(file_path):
        raise HTTPException(
            status_code=404,
            detail="File doesn't exists"
        )

    if not filter_column in {'label', 'src'}:
        raise HTTPException(
            status_code=400,
            detail="Wrong column to filter"
        )

    return filter_file(file_path, filter_column, filter_value)


@app.delete("/delete_file/{file_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_file(file_id: str):
    file_path = file_info.get(file_id)
    if not file_path or not os.path.exists(file_path):
        raise HTTPException(
            status_code=404,
            detail="File doesn't exists"
        )

    await delete_file_util(file_path)
    return None