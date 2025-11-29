from fastapi import FastAPI, UploadFile, HTTPException, BackgroundTasks, Form
from fastapi.responses import FileResponse
import os
import uuid

from utils import validate_headers, validate_csv_file, delete_file, collect_statistics, parse_csv, filter_file

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
        validated, is_verification = await validate_headers(file_path)
        if not validated:
            raise HTTPException(
                status_code=400,
                detail="CSV file contains wrong headers"
            )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error loading file: {str(e)}")

    new_file_path = file_path

    # new_file_path = do_some_stuff(file_path, is_verification)
    #
    # await delete_file(file_path)

    file_info[file_id] = new_file_path

    return {"file_id": file_id, "statistic": await collect_statistics(new_file_path), "content": await parse_csv(new_file_path)}


@app.get("/download_file/{file_id}")
async def download_file(file_id: str):
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

    return response


@app.get("/filter/{file_id}")
async def filter_func(file_id: str, filter_column: str, filter_value: str):
    file_path = file_info.get(file_id)
    if not file_path:
        raise HTTPException(
            status_code=404,
            detail="File doesn't exists"
        )

    if not filter_column in {'label', 'source'}:
        raise HTTPException(
            status_code=400,
            detail="Wrong column to filter"
        )

    return filter_file(file_path, filter_column, filter_value)


@app.delete("/clear/{file_id}")
async def delete_file(file_id: str):
    file_path = file_info.get(file_id)
    if not file_path:
        raise HTTPException(
            status_code=404,
            detail="File doesn't exists"
        )

    await delete_file(file_path)
