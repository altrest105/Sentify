import re
import pandas as pd
import joblib
from lightgbm import LGBMClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, classification_report
from sklearn.feature_extraction.text import TfidfVectorizer
from pymystem3 import Mystem
from tqdm import tqdm

# ПРЕДОБРАБОТКА ТЕКСТА
mystem = Mystem()

def clean_text(text: str) -> str:
    text = str(text).lower()
    text = re.sub(r'http\S+', '<URL>', text)
    text = re.sub(r'\S+@\S+', '<EMAIL>', text)
    text = re.sub(r'\b\d{1,2}[./-]\d{1,2}[./-]\d{2,4}\b', '<DATE>', text)
    text = re.sub(r'\b\d+\b', '<NUM>', text)
    text = re.sub(r'[^а-яёa-z0-9 ]+', ' ', text)
    text = re.sub(r'\s+', ' ', text).strip()
    return text

# ЛЕММАТИЗАЦИЯ В ПАКЕТАХ
def lemmatize_texts_batch(texts, batch_size=1000):
    """
    texts: список строк
    batch_size: сколько текстов объединять для одной лемматизации
    """
    res = []
    # Используем уникальный токен, который вряд ли встретится в тексте
    sep = ' uniquebreaktoken '
    sep_token = 'uniquebreaktoken'
    
    # разбиваем на чанки
    chunks = [texts[i:i+batch_size] for i in range(0, len(texts), batch_size)]

    for chunk in tqdm(chunks, desc="Lemmatizing texts"):
        # объединяем тексты в одну строку
        merged = sep.join(chunk)
        lemmas = mystem.lemmatize(merged)

        current_doc = []
        chunk_res = []
        for w in lemmas:
            w = w.strip()
            if not w or w == '\n':
                continue
            if w == sep_token:
                chunk_res.append(' '.join(current_doc))
                current_doc = []
            else:
                current_doc.append(w)

        # добавляем последний документ в чанке
        chunk_res.append(' '.join(current_doc))
        
        # Аварийная коррекция длины, чтобы не падал train_test_split
        if len(chunk_res) != len(chunk):
            if len(chunk_res) > len(chunk):
                chunk_res = chunk_res[:len(chunk)]
            else:
                chunk_res.extend([''] * (len(chunk) - len(chunk_res)))
        
        res.extend(chunk_res)
        
    return res

def preprocess_texts(texts, batch_size=1000):
    # сначала очистка
    cleaned_texts = [clean_text(t) for t in tqdm(texts, desc="Cleaning texts")]
    # потом пакетная лемматизация
    lemmatized_texts = lemmatize_texts_batch(cleaned_texts, batch_size=batch_size)
    return lemmatized_texts

# ЗАГРУЗКА ДАННЫХ
df = pd.read_csv('files/train.csv')
X_raw = df['text'].fillna('')
y = df['label']

# ПРЕДОБРАБОТКА С ПРОГРЕССБАРОМ
X_text = preprocess_texts(X_raw, batch_size=1000)

# ВЕКТОРИЗАЦИЯ
vectorizer = TfidfVectorizer(max_features=1000)
X = vectorizer.fit_transform(X_text)

# TRAIN / TEST SPLIT
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# ОБУЧЕНИЕ МОДЕЛИ
model = LGBMClassifier(
    n_estimators=100,
    learning_rate=0.1,
    num_leaves=31,
    random_state=42
)

model.fit(X_train, y_train)

# ПРЕДСКАЗАНИЕ И ОЦЕНКА
y_pred = model.predict(X_test)
y_pred_proba = model.predict_proba(X_test)

print("Accuracy:", accuracy_score(y_test, y_pred))
print("\nClassification Report:\n", classification_report(y_test, y_pred))

# СОХРАНЕНИЕ МОДЕЛИ И ВЕКТОРИЗАТОРА
joblib.dump(model, 'lgbm_model.pkl')
joblib.dump(vectorizer, 'tfidf_vectorizer.pkl')
print("Модель и векторизатор сохранены в файлы 'lgbm_model.pkl' и 'tfidf_vectorizer.pkl'")
