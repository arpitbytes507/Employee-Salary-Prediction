from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib
import pandas as pd

# Load your trained ML model
model=joblib.load("salary_model.pkl")

app=Flask(__name__)
CORS(app)  # Allow requests from frontend

@app.route("/predict", methods=["POST"])
def predict():
    data = request.get_json()
    print("Received data:", data)
    # Convert JSON to DataFrame
    df = pd.DataFrame([data])
    # Predict salary
    prediction = model.predict(df)[0]
    return jsonify({"predicted_salary": round(prediction, 2)})

if __name__ == "__main__":
    app.run(debug=True, port=5000)
