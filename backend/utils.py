from fastapi import UploadFile
import os
import magic
import csv
import pandas as pd


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
        print(f"Error checking MIME-type: {e}")
        return False
    return True


async def validate_headers(filename) -> bool:
    with open(filename, 'r', encoding='utf-8-sig') as csvfile:
        reader = csv.reader(csvfile)
        headers = next(reader)
        print(headers)
        return set(headers) == {"ID", "text", "src"}


async def delete_file_util(file_path):
    try:
        if os.path.exists(file_path):
            os.remove(file_path)
    except Exception as e:
        print(f"Error deleting file: {e}")


async def parse_csv(file_path):
    content = []
    with open(file_path, 'r') as csvfile:
        dict_reader = csv.DictReader(csvfile)
        for i in dict_reader:
            content.append(i)
    return content


async def filter_file(file_path, column, value):
    content = []
    with open(file_path, 'r') as csvfile:
        dict_reader = csv.DictReader(csvfile)
        for i in dict_reader:
            if i[column] == value:
                content.append(i)
    return content


async def prepare_data(file_path):
    df = pd.read_csv(file_path)
    df_transposed = df.T
    transposed_array = df_transposed.values.tolist()
    headers = df_transposed.index.tolist()

    return headers, transposed_array


def create_csv(headers, data_arrays, output_file='response.csv'):
    file_path = os.path.join(UPLOAD_DIR, output_file)
    data_dict = {}
    for header, data_array in zip(headers, data_arrays):
        data_dict[header] = data_array

    df = pd.DataFrame(data_dict)
    df.to_csv(file_path, index=False, encoding='utf-8')

    return file_path