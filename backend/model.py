import re
import os
import joblib
import pandas as pd
from lightgbm import LGBMClassifier
from sklearn.model_selection import StratifiedKFold
from sklearn.metrics import f1_score
from sklearn.feature_extraction.text import TfidfVectorizer
from utils import prepare_data, create_csv

CROSS_VALIDATE = False

MAX_FEATURES = 40000
NGRAM_RANGE = (1, 3)
N_SPLITS = 3

N_ESTIMATORS = 400
LR = 0.07
N_LEAVES = 63


# Предобработка текста
def preprocess_texts(texts):
    cleaned_texts = []
    for t in texts:
        text = str(t).lower()
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

        cleaned_texts.append(text)
    
    return cleaned_texts

# Загрузка и предобработка данных
def load_and_preprocess_data():
    df = pd.read_csv('files/train.csv')
    X_raw = df['text'].fillna('')
    y = df['label']

    X_text = preprocess_texts(X_raw)
    return X_text, y

# Векторизация
def create_vectorizer():
    vectorizer = TfidfVectorizer(
        max_features=MAX_FEATURES,
        ngram_range=NGRAM_RANGE,
    )
    return vectorizer

# Кросс-валидация
def cross_validate_model(X, y):
    skf = StratifiedKFold(n_splits=N_SPLITS, shuffle=True, random_state=42)
    f1_scores = []

    for fold, (train_idx, val_idx) in enumerate(skf.split(X, y), 1):
        print(f"\n=== FOLD {fold} ===")
        X_train, X_val = X[train_idx], X[val_idx]
        y_train, y_val = y.iloc[train_idx], y.iloc[val_idx]

        model = LGBMClassifier(
            n_estimators=N_ESTIMATORS,
            learning_rate=LR,
            num_leaves=N_LEAVES,
            random_state=42,
            class_weight='balanced',

            device='gpu',
            gpu_platform_id=0,
            gpu_device_id=0,
            max_bin=255
        )

        model.fit(X_train, y_train)
        preds = model.predict(X_val)
        f1 = f1_score(y_val, preds, average='macro')
        print(f"F1-macro: {f1:.4f}")
        f1_scores.append(f1)

    print("\nMean F1-macro across folds:", sum(f1_scores)/len(f1_scores))

# Обучение
def train_final_model(X, y):
    final_model = LGBMClassifier(
        n_estimators=N_ESTIMATORS,
        learning_rate=LR,
        num_leaves=N_LEAVES,
        random_state=42,
        class_weight='balanced',

        device='gpu',
        gpu_platform_id=0,
        gpu_device_id=0,
        max_bin=255
    )
    final_model.fit(X, y)
    return final_model

# Сохранение модели и векторизатора
def save_model_and_vectorizer(model, vectorizer):
    joblib.dump(model, 'files/lgbm_model.pkl')
    joblib.dump(vectorizer, 'files/tfidf_vectorizer.pkl')
    print("Модель и векторизатор сохранены.")

# Загрузка модели и векторизатора
def load_model_and_vectorizer():
    model = joblib.load('files/lgbm_model.pkl')
    vectorizer = joblib.load('files/tfidf_vectorizer.pkl')
    return model, vectorizer

# Получение тональности
def get_mood(file_path):
    # Проверяем, есть ли обученная модель
    if not(os.path.exists('files/lgbm_model.pkl')) or not(os.path.exists('files/tfidf_vectorizer.pkl')):
        X_text, y = load_and_preprocess_data()
        vectorizer = create_vectorizer()
        X = vectorizer.fit_transform(X_text)

        if CROSS_VALIDATE:
            cross_validate_model(X, y)

        model = train_final_model(X, y)
        save_model_and_vectorizer(model, vectorizer)
    
    model, vectorizer = load_model_and_vectorizer()

    headers, columns = prepare_data(file_path)
    preprocessed_texts = preprocess_texts(columns[headers.index("text")])

    X_new = vectorizer.transform(preprocessed_texts)
    preds = model.predict(X_new)

    file_path = create_csv(['ID', 'text', 'src', 'label'], columns + [preds])
    return file_path
