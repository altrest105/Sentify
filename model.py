import re
import pandas as pd
from lightgbm import LGBMClassifier
from sklearn.model_selection import StratifiedKFold
from sklearn.metrics import f1_score, classification_report
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

def lemmatize_texts_batch(texts, batch_size=1000):
    res = []
    sep = ' uniquebreaktoken '
    sep_token = 'uniquebreaktoken'
    chunks = [texts[i:i+batch_size] for i in range(0, len(texts), batch_size)]

    for chunk in tqdm(chunks, desc="Lemmatizing texts"):
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
        chunk_res.append(' '.join(current_doc))

        # коррекция длины
        if len(chunk_res) != len(chunk):
            if len(chunk_res) > len(chunk):
                chunk_res = chunk_res[:len(chunk)]
            else:
                chunk_res.extend([''] * (len(chunk) - len(chunk_res)))

        res.extend(chunk_res)
    return res

def preprocess_texts(texts, batch_size=1000):
    cleaned_texts = [clean_text(t) for t in tqdm(texts, desc="Cleaning texts")]
    lemmatized_texts = lemmatize_texts_batch(cleaned_texts, batch_size=batch_size)
    return lemmatized_texts

# ЗАГРУЗКА ДАННЫХ
df = pd.read_csv('files/train.csv')
X_raw = df['text'].fillna('')
y = df['label']

# Предобработка с прогрессбаром
X_text = preprocess_texts(X_raw, batch_size=1000)

# ВЕКТОРИЗАЦИЯ
vectorizer = TfidfVectorizer(
    max_features=10000,
    ngram_range=(1, 2),
)
X = vectorizer.fit_transform(X_text)

# КРОСС-ВАЛИДАЦИЯ
skf = StratifiedKFold(n_splits=3, shuffle=True, random_state=42)
f1_scores = []

for fold, (train_idx, val_idx) in enumerate(skf.split(X, y), 1):
    print(f"\n=== FOLD {fold} ===")
    X_train, X_val = X[train_idx], X[val_idx]
    y_train, y_val = y.iloc[train_idx], y.iloc[val_idx]

    model = LGBMClassifier(
        n_estimators=200,
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

# ОБУЧЕНИЕ НА ВСЕМ ДАТАСЕТЕ
final_model = LGBMClassifier(
    n_estimators=200,
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

# ПРЕДСКАЗАНИЕ И ОЦЕНКА
y_pred = final_model.predict(X)
print("\nClassification Report on full dataset:\n")
print(classification_report(y, y_pred))

# СОХРАНЕНИЕ МОДЕЛИ И ВЕКТОРИЗАТОРА
import joblib
joblib.dump(final_model, 'lgbm_model.pkl')
joblib.dump(vectorizer, 'tfidf_vectorizer.pkl')
print("Модель и векторизатор сохранены.")
