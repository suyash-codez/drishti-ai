import os
import joblib
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestRegressor
from sklearn.preprocessing import OneHotEncoder
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.metrics import r2_score, mean_absolute_error

def train_irrigation_model():
    data_path = "data/Crop_recommendation.csv"
    if not os.path.exists(data_path):
        raise FileNotFoundError(f"{data_path} not found. Run data generation first.")

    df = pd.read_csv(data_path)
    X = df[["crop_type", "soil_moisture", "temperature", "rainfall"]]
    y = df["irrigation_amount_mm"]

    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

    preprocessor = ColumnTransformer(
        transformers=[
            ("cat", OneHotEncoder(handle_unknown="ignore", sparse_output=False), ["crop_type"]),
            ("num", "passthrough", ["soil_moisture", "temperature", "rainfall"])
        ]
    )

    # Strictly RandomForest per PRD Section 12.3
    rf = RandomForestRegressor(n_estimators=100, max_depth=12, random_state=42)

    pipeline = Pipeline(steps=[
        ("preprocessor", preprocessor),
        ("regressor", rf)
    ])

    pipeline.fit(X_train, y_train)

    y_pred = pipeline.predict(X_test)
    r2 = r2_score(y_test, y_pred)
    mae = mean_absolute_error(y_test, y_pred)

    print(f"=== Irrigation Model Trained (RandomForestRegressor) ===")
    print(f"R² Score: {r2:.4f}")
    print(f"MAE: {mae:.4f} mm")

    # Extract feature importances
    ohe = pipeline.named_steps["preprocessor"].named_transformers_["cat"]
    cat_feature_names = [f"crop_{c}" for c in ohe.categories_[0]]
    feature_names = cat_feature_names + ["soil_moisture", "temperature", "rainfall"]
    raw_importances = pipeline.named_steps["regressor"].feature_importances_
    feature_importances = dict(zip(feature_names, [float(x) for x in raw_importances]))

    os.makedirs("backend/models", exist_ok=True)
    model_artifact = {
        "model": pipeline,
        "feature_names": feature_names,
        "feature_importances": feature_importances,
        "r2_score": float(r2),
        "mae": float(mae),
        "target": "irrigation_amount_mm"
    }

    out_path = "backend/models/irrigation_model.pkl"
    joblib.dump(model_artifact, out_path)
    print(f"Saved irrigation model to {out_path}")
    return model_artifact

if __name__ == "__main__":
    train_irrigation_model()
