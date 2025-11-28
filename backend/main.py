from collections import Counter
from fastapi import FastAPI, UploadFile, HTTPException, BackgroundTasks
from fastapi.responses import FileResponse
import os
import uuid
import magic
import csv

app = FastAPI()

UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

ALLOWED_CSV_MIME_TYPES = [
    'text/csv',
    'text/plain',
    'application/csv',
    'application/vnd.ms-excel'
]


async def collect_statistics(filename: str) -> dict:
    counter = Counter()
    with open(filename, 'r') as csvfile:
        dict_reader = csv.DictReader(csvfile)
        for i in dict_reader:
            counter[dict_reader["label"]] += 1
    return dict(counter)


async def validate_csv_file(file: UploadFile) -> bool:
    filename = file.filename.lower()
    if not filename.endswith("csv"):
        return False
    try:
        content = file.file.read(2048)
        file.file.seek(0)

        mime = magic.Magic(mime=True)
        mime_type = mime.from_buffer(content)

        if mime_type not in ALLOWED_CSV_MIME_TYPES:
            return False
    except Exception as e:
        print(f"Ошибка при проверке MIME-типа: {e}")
        return False
    return True


async def validate_headers(filename, validation_file) -> bool:
    with open(filename, 'r') as csvfile:
        reader = csv.reader(csvfile)
        headers = next(reader)

        if validation_file and set(headers) == {"text", "label", "src"} or \
           not validation_file and set(headers) == {"text", "src"}:
            return True
        return False


def delete_file_after_send(file_path):
    try:
        if os.path.exists(file_path):
            os.remove(file_path)
    except Exception as e:
        print(f"Ошибка при удалении файла: {e}")


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
        path=file_path,
        filename=file.filename,
        media_type='application/octet-stream'
    )

    background_tasks.add_task(delete_file_after_send, file.filename)

    return {"file": response, "statistic": collect_statistics(new_file)}
