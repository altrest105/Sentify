from fastapi import UploadFile
import os
import magic
import csv
from typing import Tuple


UPLOAD_DIR = "files"
os.makedirs(UPLOAD_DIR, exist_ok=True)

ALLOWED_CSV_MIME_TYPES = [
    'text/csv',
    'text/plain',
    'application/csv',
    'application/vnd.ms-excel'
]


async def collect_statistics(filename: str) -> dict:
    counter = {
        "0": 0,
        "1": 0,
        "2": 0
    }
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


async def validate_headers(filename) -> Tuple[bool, bool]:
    with open(filename, 'r') as csvfile:
        reader = csv.reader(csvfile)
        headers = next(reader)

        if set(headers) == {"ID", "text", "label", "src"} or \
           set(headers) == {"ID", "text", "src"}:
            return True, set(headers) == {"ID", "text", "label", "src"}
        return False, False


def delete_file_after_send(file_path):
    try:
        if os.path.exists(file_path):
            os.remove(file_path)
    except Exception as e:
        print(f"Ошибка при удалении файла: {e}")


async def parse_csv(file_path):
    content = []
    with open(file_path, 'r') as csvfile:
        dict_reader = csv.DictReader(csvfile)
        for i in dict_reader:
            content.append(i)
    return content