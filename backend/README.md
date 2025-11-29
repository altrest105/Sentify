# Backend спецификация

## Базовый URL

`http://localhost:8000/`

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
  "content": [
    {
      "ID": "string",
      "text": "string",
      "label": "string",
      "source": "string"
    }
  ]
}
```

## Загрузка submission файла на backend

**Здесь идет речь о submission файле, который пользователь загружает для проверки работы модели**

URL - `/upload_submission_file`

Тип запроса - `POST`

### Входные данные

**Форма**

```
Key: file
Value: Submission файл загруженный пользователем
```

### Выходные данные

```json
{
  "file_id": "string"
}
```

## Получение полного файла с backend

URL - `/download_file/<file_id>/response_file`

Тип запроса - `GET`

### Входные данные

`file_id` - id файла, получается в при запросе `/upload_file`

### Выходные данные

CSV файл

## Получение submission файла с backend

**Здесь идет речь о submission файле, который бек генерирует из полученного от модели файла**

URL - `/download_file/<file_id>/submission_file`

Тип запроса - `GET`

### Входные данные

`file_id` - id файла, получается в при запросе `/upload_file`

### Выходные данные

CSV файл

## Фильтрация файла

URL - `/filter_file/<file_id>?mood=string&...&mood=string&sources=string&...&sources=string`

Тип запроса - `GET`

### Пример запроса

`http://loacalhost:8000/filter_file/file_id?mood=1&mood=2&sources=perekrestok&sources=geo`

### Входные данные

`file_id` - id файла, получается в при запросе `/upload_file`
`mood` - настроение отзыва
`sources` - источники отзыва

### Выходные данные

```json
{
  "content": [
    {
      "ID": "string",
      "text": "string",
      "label": "string",
      "source": "string"
    }
  ]
}
```

## Сортировка файла

URL - `/sort_file/<file_id>?sort_column=string&desc=bool

Тип запроса - `GET`

### Входные данные

`file_id` - id файла, получается в при запросе `/upload_file`
`sort_column` - колонка по которой производится фильтрация. `label` или `src`
`desc` - порядок сортировки по умолчанию - по возрастанию, если передано false - по убыванию. **Не обязательный параметр**

### Выходные данные

```json
{
  "content": [
    {
      "ID": "string",
      "text": "string",
      "label": "string",
      "source": "string"
    }
  ]
}
```

## Удаление файла

URL - `/delete_file/<file_id>`

Тип запроса - `DELETE`

### Входные данные

`file_id` - id файла, получается в при запросе `/upload_file`

## Фильтрация файла

URL - `/count_metric?file_id=string&submission_file_id=string`

Тип запроса - `GET`

### Входные данные

`file_id` - id файла, получается в при запросе `/upload_file`
`submission_file_id` - id submission файла, получается в при запросе `/upload_submission_file`

### Выходные данные

```json
{
  "metric": "int"
}
```