import re
import joblib
from utils import prepare_data, create_csv


async def clean_text(text: str) -> str:
    text = str(text).lower()
    text = re.sub(r'http\S+', '<URL>', text)
    text = re.sub(r'\S+@\S+', '<EMAIL>', text)
    text = re.sub(r'\b\d{1,2}[./-]\d{1,2}[./-]\d{2,4}\b', '<DATE>', text)
    text = re.sub(r'\b\d+\b', '<NUM>', text)
    text = re.sub(
        r'[^а-яёa-z0-9\s!?.,…\U0001F000-\U0001FFFF]+',
        ' ',
        text
    )
    text = re.sub(r'\s+', ' ', text).strip()

    return text

async def preprocess_texts(texts):
    cleaned_texts = [await clean_text(t) for t in texts]
    return cleaned_texts


async def get_mood(file_path):
    # Загрузка модели и векторизатора
    model = joblib.load('backend/lgbm_model.pkl')
    vectorizer = joblib.load('backend/tfidf_vectorizer.pkl')

    headers, columns = await prepare_data(file_path)
    preprocessed_texts = await preprocess_texts(columns[headers.index("text")])

    # 2. Векторизация
    X_new = vectorizer.transform(preprocessed_texts)

    # 3. Предсказание
    preds = model.predict(X_new)

    file_path = create_csv(['ID', 'text', 'src', 'label'], columns + [preds])
    return file_path



