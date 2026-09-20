import os
import joblib
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import OneHotEncoder
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.metrics import accuracy_score, classification_report

def train_fertilizer_model():
    data_path = "data/Fertilizer_Prediction.csv"
    if not os.path.exists(data_path):
        raise FileNotFoundError(f"{data_path} not found. Run data generation first.")

    df = pd.read_csv(data_path)
    X = df[["crop_type", "soil_moisture", "temperature", "rainfall"]]
    y = df["fertilizer_type"]

    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

    preprocessor = ColumnTransformer(
        transformers=[
            ("cat", OneHotEncoder(handle_unknown="ignore", sparse_output=False), ["crop_type"]),
            ("num", "passthrough", ["soil_moisture", "temperature", "rainfall"])
        ]
    )

    # Strictly RandomForest per PRD Section 12.3
    rf = RandomForestClassifier(n_estimators=100, max_depth=12, random_state=42)

    pipeline = Pipeline(steps=[
        ("preprocessor", preprocessor),
        ("classifier", rf)
    ])

    pipeline.fit(X_train, y_train)

    y_pred = pipeline.predict(X_test)
    acc = accuracy_score(y_test, y_pred)

    print(f"=== Fertilizer Model Trained (RandomForestClassifier) ===")
    print(f"Accuracy: {acc * 100:.2f}%")
    print("Classification Summary:")
    print(classification_report(y_test, y_pred))

    # Feature importances
    ohe = pipeline.named_steps["preprocessor"].named_transformers_["cat"]
    cat_feature_names = [f"crop_{c}" for c in ohe.categories_[0]]
    feature_names = cat_feature_names + ["soil_moisture", "temperature", "rainfall"]
    raw_importances = pipeline.named_steps["classifier"].feature_importances_
    feature_importances = dict(zip(feature_names, [float(x) for x in raw_importances]))

    os.makedirs("backend/models", exist_ok=True)
    model_artifact = {
        "model": pipeline,
        "feature_names": feature_names,
        "feature_importances": feature_importances,
        "accuracy": float(acc),
        "target": "fertilizer_type"
    }

    out_path = "backend/models/fertilizer_model.pkl"
    joblib.dump(model_artifact, out_path)
    print(f"Saved fertilizer model to {out_path}")
    return model_artifact

if __name__ == "__main__":
    train_fertilizer_model()
