from cProfile import label

from fastapi import UploadFile
import os
import magic
import csv
import pandas as pd
from sklearn.metrics import f1_score


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


async def validate_headers(filename, headers_to_check) -> bool:
    with open(filename, 'r', encoding='utf-8-sig') as csvfile:
        reader = csv.reader(csvfile)
        headers = next(reader)
        return set(headers) == headers_to_check


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


async def filter_file(file_path, mood, sources):
    content = []
    print(mood, sources)
    with (open(file_path, 'r') as csvfile):
        dict_reader = csv.DictReader(csvfile)
        s = 0
        for i in dict_reader:
            s += 1
            if s % 1000 == 0:
                print(i['label'], i['src'])
            if (len(mood) == 0 or i['label'] in mood) and \
               (len(sources) == 0 or i['src'] in sources):
                    content.append(i)
    return content


def prepare_data(file_path):
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


async def reformat_csv(file_path, output_path):
    try:
        df = pd.read_csv(file_path, encoding='utf-8-sig')
        df.columns = df.columns.str.replace('\ufeff', '')
        filtered_df = df[['ID', 'label']]

        filtered_df.to_csv(output_path, index=False, encoding='utf-8')

    except Exception as e:
        print(f"Error while processing file: {e}")


async def sort_file(file_path, column, desc):
    content = await parse_csv(file_path)
    content.sort(key=lambda x: x[column], reverse=desc)
    return content


async def count_metric_util(file_path, submission_file_path):
    df1 = pd.read_csv(file_path)
    df2 = pd.read_csv(submission_file_path)
    df1 = df1.rename(columns={'label': 'label1'})
    df2 = df2.rename(columns={'label': 'label2'})
    merged_df = pd.merge(df1, df2, on='ID', how='inner')
    labels1 = merged_df['label1'].tolist()
    labels2 = merged_df['label2'].tolist()

    return f1_score(labels2, labels1, average='macro')