from collections import Counter
from fastapi import UploadFile
import os
import magic
import csv


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
            counter[i["label"]] += 1
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

        if validation_file and set(headers) == {"ID", "text", "label", "src"} or \
           not validation_file and set(headers) == {"ID", "text", "src"}:
            return True
        return False


def delete_file_after_send(file_path):
    try:
        if os.path.exists(file_path):
            os.remove(file_path)
    except Exception as e:
        print(f"Ошибка при удалении файла: {e}")