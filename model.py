import re
import pandas as pd
from lightgbm import LGBMClassifier
from sklearn.model_selection import StratifiedKFold
from sklearn.metrics import f1_score, classification_report
from sklearn.feature_extraction.text import TfidfVectorizer
from tqdm import tqdm

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
    cleaned_texts = [clean_text(t) for t in tqdm(texts, desc="Cleaning texts")]
    return cleaned_texts

# Загрузка данных
df = pd.read_csv('files/train.csv')
X_raw = df['text'].fillna('')
y = df['label']

# Предобработка
X_text = preprocess_texts(X_raw)

# Векторизация
vectorizer = TfidfVectorizer(
    max_features=20000,
    ngram_range=(1, 3),
)
X = vectorizer.fit_transform(X_text)

# Кросс-валидация
skf = StratifiedKFold(n_splits=2, shuffle=True, random_state=42)
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

# Обучение
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

# Предсказание и оценка
y_pred = final_model.predict(X)
print("\nClassification Report on full dataset:\n")
print(classification_report(y, y_pred))

# Сохранение модели и векторизатора
import joblib
joblib.dump(final_model, 'lgbm_model.pkl')
joblib.dump(vectorizer, 'tfidf_vectorizer.pkl')
print("Модель и векторизатор сохранены.")
