import re
import joblib

# Загрузка модели и векторизатора
model = joblib.load('lgbm_model.pkl')
vectorizer = joblib.load('tfidf_vectorizer.pkl')

# Предобработка текста
def clean_text(text):
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

def preprocess_texts(texts):
    cleaned_texts = [clean_text(t) for t in texts]
    return cleaned_texts

# Пример предсказания
new_texts = [
    "Отличный продукт! Очень доволен 😊",
    "Ужасное качество, не рекомендую 😡",
    "Это было просто великолепно! Лучший опыт в моей жизни!!! 🎉🎉🎉",
    "Мне никогда не нравился ваш магазин. Однако, сегодня я не могу найти нужный товар... Почему так дорого?!",
]

# 1. Предобработка
preprocessed_texts = preprocess_texts(new_texts)

# 2. Векторизация
X_new = vectorizer.transform(preprocessed_texts)

# 3. Предсказание
preds = model.predict(X_new)

print("Тональности:", preds)
