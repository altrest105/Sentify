import pandas as pd
import joblib
from lightgbm import LGBMClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, classification_report
from sklearn.feature_extraction.text import TfidfVectorizer

# Загрузка данных
df = pd.read_csv('files/train.csv')

# Предполагаем, что 'text' - это основной признак, а 'label' - целевая переменная
# Если 'src' тоже нужен, его можно объединить с текстом или закодировать отдельно
X_text = df['text'].fillna('')
y = df['label']

# Векторизация текста
vectorizer = TfidfVectorizer(max_features=1000)
X = vectorizer.fit_transform(X_text)

X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# Создание и обучение модели
model = LGBMClassifier(
    n_estimators=100,
    learning_rate=0.1,
    num_leaves=31,
    random_state=42
)

model.fit(X_train, y_train)

# Предсказание и оценка
y_pred = model.predict(X_test)
y_pred_proba = model.predict_proba(X_test)

print("Accuracy:", accuracy_score(y_test, y_pred))
print("\nClassification Report:\n", classification_report(y_test, y_pred))

# Сохранение модели и векторизатора
joblib.dump(model, 'lgbm_model.pkl')
joblib.dump(vectorizer, 'tfidf_vectorizer.pkl')
print("Модель и векторизатор сохранены в файлы 'lgbm_model.pkl' и 'tfidf_vectorizer.pkl'")
