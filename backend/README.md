# Backend спецификация

## Для запуска

```commandline
docker-compose up --build
```

## Загрузка файла на backend

URL - `/upload_file`

Тип запроса - `POST`

### Входные данные

**Форма**

```
Key: file
Value: Файл загруженный пользователем
```

### Выходные данные

```json
{
  "file_id": "string",
  "statistic": {
    "0": "int",
    "1": "int",
    "2": "int"
  },
  "content": {
    "ID": "string",
    "text": "string",
    "label": "string",
    "source": "string"
  }
}
```

## Получение файла с backend

URL - `/download_file/{file_id}`

Тип запроса - `GET`

### Входные данные

`file_id` - id файла, получается в при запросе `/upload_file`

### Выходные данные

CSV файл