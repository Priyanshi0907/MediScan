"""
Trains and compares three baseline text-classification models
(Naive Bayes, Logistic Regression, Linear SVM) over TF-IDF features
on the symptom -> disease dataset, and saves the best-performing
pipeline plus a comparison report.
"""
import json
import pickle
from pathlib import Path

import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import train_test_split
from sklearn.naive_bayes import MultinomialNB
from sklearn.pipeline import Pipeline
from sklearn.svm import LinearSVC
from sklearn.calibration import CalibratedClassifierCV
from sklearn.metrics import accuracy_score

from .preprocess import preprocess

DATA_DIR = Path(__file__).parent / "data"
MODEL_PATH = DATA_DIR / "model.pkl"
REPORT_PATH = DATA_DIR / "model_comparison.json"


def load_dataset():
    df = pd.read_csv(DATA_DIR / "dataset.csv")
    df["clean_text"] = df["text"].apply(preprocess)
    return df


def build_pipeline(classifier):
    return Pipeline([
        ("tfidf", TfidfVectorizer(ngram_range=(1, 2), min_df=1)),
        ("clf", classifier),
    ])


def main():
    df = load_dataset()
    X_train, X_test, y_train, y_test = train_test_split(
        df["clean_text"], df["disease"], test_size=0.2, random_state=42, stratify=df["disease"]
    )

    candidates = {
        "Naive Bayes": build_pipeline(MultinomialNB()),
        "Logistic Regression": build_pipeline(LogisticRegression(max_iter=2000)),
        "Linear SVM": build_pipeline(CalibratedClassifierCV(LinearSVC(), cv=3)),
    }

    results = {}
    best_name, best_pipeline, best_acc = None, None, -1

    for name, pipeline in candidates.items():
        pipeline.fit(X_train, y_train)
        preds = pipeline.predict(X_test)
        acc = accuracy_score(y_test, preds)
        results[name] = round(acc * 100, 1)
        print(f"{name}: {acc * 100:.1f}% accuracy")
        if acc > best_acc:
            best_name, best_pipeline, best_acc = name, pipeline, acc

    # Refit the best model on the full dataset for production use
    best_pipeline.fit(df["clean_text"], df["disease"])

    with open(MODEL_PATH, "wb") as f:
        pickle.dump({"pipeline": best_pipeline, "model_name": best_name, "classes": sorted(df["disease"].unique())}, f)

    with open(REPORT_PATH, "w") as f:
        json.dump({"results": results, "selected_model": best_name, "selected_accuracy": round(best_acc * 100, 1)}, f, indent=2)

    print(f"\nSelected model: {best_name} ({best_acc * 100:.1f}% held-out accuracy)")
    print(f"Saved to {MODEL_PATH}")


if __name__ == "__main__":
    main()
