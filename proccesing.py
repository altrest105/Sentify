import re
import html
from typing import List, Dict, Any, Optional

# pip install pyspellchecker pymorphy2 pandas
from spellchecker import SpellChecker
import pymorphy3
import pandas as pd

spell = SpellChecker(language="ru")
morph = pymorphy3.MorphAnalyzer()


def clean_text(text: Optional[str]) -> str:
    if text is None:
        return ""

    text = str(text)

    text = html.unescape(text)
    text = re.sub(r"<.*?>", " ", text)
    
    pattern = r"[^0-9a-zA-Zа-яА-ЯёЁ\s\.,!?…:;()\-\"]"
    text = re.sub(pattern, " ", text)

    text = re.sub(r"\s+", " ", text).strip()

    return text


def auto_correct_text(text: str) -> str:
    if spell is None:
        return text

    tokens = re.findall(r"\w+|[^\w\s]", text, flags=re.UNICODE)
    corrected_tokens: List[str] = []

    for tok in tokens:
        if re.match(r"^[а-яА-ЯёЁa-zA-Z]+$", tok):
            corrected = spell.correction(tok)
            if corrected is None:
                corrected = tok
            corrected_tokens.append(corrected)
        else:
            corrected_tokens.append(tok)

    text = " ".join(corrected_tokens)
    text = re.sub(r"\s+", " ", text).strip()
    return text


def normalize_text(text: str) -> str:
    text = text.lower()
    text = re.sub(r"\s+", " ", text).strip()

    text = auto_correct_text(text)
    text = re.sub(r"\s+", " ", text).strip()
    
    return text


def sentence_tokenize(text: str) -> List[str]:
    sentences = re.split(r"(?<=[\.!?…])\s+", text)
    sentences = [s.strip() for s in sentences if s.strip()]
    return sentences


def lemmatize_sentence(sentence: str) -> List[str]:
    tokens = re.findall(r"\w+|[^\w\s]", sentence, flags=re.UNICODE)

    lemmas: List[str] = []
    for token in tokens:
        if re.match(r"\w+", token):
            parsed = morph.parse(token)[0]
            lemmas.append(parsed.normal_form)
        else:
            lemmas.append(token)
    return lemmas


def preprocess_text(text: Optional[str]) -> Dict[str, Any]:
    """
    - очистка
    - нормализация 
    - извлечение пунктуационных фич
    - токенизация на предложения
    - лемматизация
    """
    original = "" if text is None else str(text)

    cleaned = clean_text(original)
    normalized = normalize_text(cleaned)

    sentences = sentence_tokenize(normalized)
    lemmatized_sentences = [lemmatize_sentence(s) for s in sentences]

    return {
        "original": original,
        "cleaned": cleaned,
        "normalized": normalized,
        "sentences": sentences,
        "lemmatized_sentences": lemmatized_sentences,
    }


if __name__ == "__main__":
    sample_text = "Мне никогда не нравился ваш магазин. Однако, сегодня я не могу найти нужный товар... Почему так дорого?!"

    processed = preprocess_text(sample_text)

    print("\n=== ТЕСТОВАЯ ЗАПИСЬ ===")
    print("Оригинал:", processed["original"])
    print("После очистки:", processed["cleaned"])
    print("После нормализации:", processed["normalized"])
    print("Предложения:", processed["sentences"])
    print("Лемматизация по предложениям:", processed["lemmatized_sentences"])
