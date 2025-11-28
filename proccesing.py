import re
import html
from typing import List, Dict, Any, Optional

# pip install pyspellchecker pymorphy3 pandas natasha
from spellchecker import SpellChecker
import pymorphy3
import pandas as pd
from natasha import Doc, NewsEmbedding, NewsNERTagger, Segmenter, MorphVocab

spell = SpellChecker(language="ru")
morph = pymorphy3.MorphAnalyzer()

emb = NewsEmbedding()
segmenter = Segmenter()
morph_vocab = MorphVocab()
ner_tagger = NewsNERTagger(emb)

# Очистка текста
# ============================

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

# ============================
# Замена пунктуации на токены
# ============================

def replace_punctuation_with_tokens(text: str) -> str:
    def repl_ellipsis(match: re.Match) -> str:
        dots = match.group(0)
        n = len(dots)
        return " " + ("mark_ellipsis" if n == 3 else f"mark_ellipsis{n}") + " "

    text = re.sub(r"\.{3,}", repl_ellipsis, text)

    def repl_exclam(match: re.Match) -> str:
        seq = match.group(0)
        n = len(seq)
        base = "mark_exclamation"
        token = base if n == 1 else f"{base}{n}"
        return " " + token + " "

    text = re.sub(r"!+", repl_exclam, text)

    def repl_question(match: re.Match) -> str:
        seq = match.group(0)
        n = len(seq)
        base = "mark_question"
        token = base if n == 1 else f"{base}{n}"
        return " " + token + " "

    text = re.sub(r"\?+", repl_question, text)

    text = re.sub(r"\s+", " ", text).strip()
    return text

# ============================
# Нормализация текста
# ============================

def auto_correct_text(text: str) -> str:
    if spell is None:
        return text

    tokens = re.findall(r"\w+|[^\w\s]", text, flags=re.UNICODE)
    corrected_tokens = []

    for tok in tokens:
        if re.match(r"^[а-яА-ЯёЁa-zA-Z]+$", tok):
            if len(tok) <= 2:
                corrected_tokens.append(tok)
                continue

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

# ============================
# Токенизация и лемматизация
# ============================

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

# ============================
# NER
# ============================

def extract_named_entities(text: List[List[str]]) -> List[Dict[str, str]]:

    text_for_ner = re.sub(r"\s+([,\.\?\!])", r"\1", text)

    doc = Doc(text_for_ner)
    doc.segment(segmenter)
    doc.tag_ner(ner_tagger)

    entities: List[Dict[str, str]] = []

    for span in doc.spans:
        span.normalize(morph_vocab)
        entities.append(
            {
                "text": span.text,
                "type": span.type,
            }
        )

    return entities

# ============================
# Основная функция пайплайна
# ============================

def preprocess_text(text: Optional[str], test = False) -> Dict[str, Any]:
    """
    - очистка
    - замена пунктуации на токены
    - нормализация 
    - токенизация на предложения
    - лемматизация
    """
    original = "" if text is None else str(text)

    cleaned = clean_text(original)

    normalized_with_punct_tokens = replace_punctuation_with_tokens(cleaned)
    normalized = normalize_text(normalized_with_punct_tokens)

    sentences = sentence_tokenize(normalized)
    lemmatized_sentences = [lemmatize_sentence(s) for s in sentences]

    ner_entities = extract_named_entities(original)

    if not test:
        return lemmatized_sentences, ner_entities
    else:
        return {
            "original": original,
            "cleaned": cleaned,
            "normalized": normalized,
            "normalized_with_punct_tokens": normalized_with_punct_tokens,
            "sentences": sentences,
            "lemmatized_sentences": lemmatized_sentences,
            "ner_entities": ner_entities,
        }


if __name__ == "__main__":
    sample_text = "Мне никогда не нравился ваш магазин в Москве. Однако, сегодня я не могу найти нужный товар, хотя нашёл его в Ашане... Почему так дорого???!"

    processed = preprocess_text(sample_text, test=True)

    print("\n=== ТЕСТОВАЯ ЗАПИСЬ ===")
    print("Оригинал:", processed["original"])
    print("После очистки:", processed["cleaned"])
    print("После нормализации:", processed["normalized"])
    print("После замены пунктуации на токены:", processed["normalized_with_punct_tokens"])
    print("Предложения:", processed["sentences"])
    print("Лемматизация по предложениям:", processed["lemmatized_sentences"])
    print("NER:", processed["ner_entities"])

    # processed, ner = preprocess_text(sample_text)
    # print(processed)
    # print(ner)
