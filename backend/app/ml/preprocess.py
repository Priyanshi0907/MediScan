"""
Lightweight NLP preprocessing pipeline: lowercasing, punctuation removal,
tokenization, stop-word removal, and simple suffix-based lemmatization.

We avoid heavy dependencies (spaCy / NLTK corpora downloads) so the project
runs offline out of the box. This is intentionally simple and explainable —
a good fit for a college-level NLP + ML project.
"""
import re

STOPWORDS = {
    "a", "an", "the", "is", "am", "are", "was", "were", "be", "been", "being",
    "i", "me", "my", "myself", "we", "our", "you", "your", "he", "she", "it",
    "they", "them", "this", "that", "these", "those", "and", "but", "if", "or",
    "because", "as", "of", "at", "by", "for", "with", "about", "against",
    "between", "into", "through", "during", "before", "after", "to", "from",
    "up", "down", "in", "out", "on", "off", "over", "under", "again", "further",
    "then", "once", "here", "there", "when", "where", "why", "how", "all",
    "any", "both", "each", "few", "more", "most", "other", "some", "such",
    "no", "nor", "not", "only", "own", "same", "so", "than", "too", "very",
    "s", "t", "can", "will", "just", "don", "should", "now", "have", "has",
    "had", "having", "do", "does", "did", "doing", "would", "could", "also",
}

_SUFFIXES = [("ies", "y"), ("ing", ""), ("edly", ""), ("ed", ""), ("es", ""), ("s", "")]


def _lemmatize(word: str) -> str:
    if len(word) <= 3:
        return word
    for suf, repl in _SUFFIXES:
        if word.endswith(suf) and len(word) - len(suf) + len(repl) >= 3:
            return word[: -len(suf)] + repl
    return word


def clean_text(text: str) -> str:
    text = text.lower()
    text = re.sub(r"[^a-z\s]", " ", text)
    text = re.sub(r"\s+", " ", text).strip()
    return text


def tokenize(text: str) -> list[str]:
    return clean_text(text).split()


def preprocess(text: str, lemmatize: bool = True, remove_stopwords: bool = True) -> str:
    tokens = tokenize(text)
    if remove_stopwords:
        tokens = [t for t in tokens if t not in STOPWORDS]
    if lemmatize:
        tokens = [_lemmatize(t) for t in tokens]
    return " ".join(tokens)
