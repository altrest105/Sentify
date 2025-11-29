import re
import pandas as pd
from lightgbm import LGBMClassifier
from sklearn.model_selection import StratifiedKFold
from sklearn.metrics import f1_score
from sklearn.feature_extraction.text import TfidfVectorizer
from tqdm import tqdm
import joblib

CROSS_VALIDATE = False
TEST = True
TRAIN = True

# Предобработка текста
def preprocess_texts(texts):
    cleaned_texts = []
    for t in tqdm(texts, desc="Cleaning texts"):
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
        max_features=40000,
        ngram_range=(1, 3),
    )
    return vectorizer

# Кросс-валидация
def cross_validate_model(X, y):
    skf = StratifiedKFold(n_splits=3, shuffle=True, random_state=42)
    f1_scores = []

    for fold, (train_idx, val_idx) in enumerate(skf.split(X, y), 1):
        print(f"\n=== FOLD {fold} ===")
        X_train, X_val = X[train_idx], X[val_idx]
        y_train, y_val = y.iloc[train_idx], y.iloc[val_idx]

        model = LGBMClassifier(
            n_estimators=400,
            learning_rate=0.05,
            num_leaves=63,
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
        n_estimators=400,
        learning_rate=0.05,
        num_leaves=63,
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
    joblib.dump(model, 'lgbm_model.pkl')
    joblib.dump(vectorizer, 'tfidf_vectorizer.pkl')
    print("Модель и векторизатор сохранены.")

# Загрузка модели и векторизатора
def load_model_and_vectorizer():
    model = joblib.load('lgbm_model.pkl')
    vectorizer = joblib.load('tfidf_vectorizer.pkl')
    return model, vectorizer


if __name__ == "__main__":
    if TRAIN == True:
        X_text, y = load_and_preprocess_data()
        vectorizer = create_vectorizer()
        X = vectorizer.fit_transform(X_text)

        if CROSS_VALIDATE == True:
            cross_validate_model(X, y)

        final_model = train_final_model(X, y)

        save_model_and_vectorizer(final_model, vectorizer)


    if TEST == True:
        new_texts = pd.read_csv('files/test.csv')['text'].fillna('')
        ids = pd.read_csv('files/test.csv')['ID']
        src = pd.read_csv('files/test.csv')['src'].fillna('')

        cleaned_texts = preprocess_texts(new_texts)
        model, vectorizer = load_model_and_vectorizer()
        X_new = vectorizer.transform(cleaned_texts)
        labels = model.predict(X_new)

        pd.DataFrame({'id': ids, 'text': new_texts, 'src': src, 'label': labels}).to_csv('submission.csv', index=False)