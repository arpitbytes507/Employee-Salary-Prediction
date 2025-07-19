from flask import Flask, send_from_directory, jsonify, request
import joblib
import pandas as pd
import os

app = Flask(__name__, static_folder="static", static_url_path="")

# Load ML model
model = joblib.load("salary_model.pkl")

@app.route("/predict", methods=["POST"])
def predict():
    try:
        data = request.json

        # Extract values
        age = int(data.get("age", 0))
        experience = int(data.get("experience", 0))
        job = data.get("job", "").strip()

        # Validate Age
        if not (18 <= age <= 65):
            return jsonify({"error": "Age must be between 18 and 65"}), 400

        # Validate Experience
        if not (0 <= experience <= age - 18):
            return jsonify({"error": f"Experience must be between 0 and {age - 18}"}), 400

        # Validate Job Role
        if job not in job_list:  # job_list = list of trained job titles
            return jsonify({"error": f"Job '{job}' is not available in the prediction model"}), 400

        # Make prediction
        prediction = model.predict([[job, age, experience]])
        predicted_salary = prediction[0]

        return jsonify({"predicted_salary": predicted_salary})

    except Exception as e:
        return jsonify({"error": f"Something went wrong: {str(e)}"}), 500
