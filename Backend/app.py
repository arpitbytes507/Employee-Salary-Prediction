from flask import Flask, send_from_directory, jsonify, request
from flask_cors import CORS
import joblib
import pandas as pd
import os

app = Flask(__name__, static_folder="static", static_url_path="")
CORS(app)

# Load ML model
model = joblib.load("salary_model.pkl")

# Example: Define valid job titles (you can replace this with actual job titles from your dataset)
job_list = ["Software Engineer", "Data Scientist", "Manager", "Analyst", "Designer"]

@app.route("/predict", methods=["POST"])
def predict():
    try:
        data = request.json

        # Extract values
        age = int(data.get("Age", 0))
        experience = int(data.get("Years of Experience", 0))
        job = data.get("Job Title", "").strip()

        # Validate Age
        if not (18 <= age <= 65):
            return jsonify({"error": "Age must be between 18 and 65"}), 400

        # Validate Experience
        if not (0 <= experience <= age - 18):
            return jsonify({"error": f"Experience must be between 0 and {age - 18}"}), 400

        # Validate Job Role
        if job not in job_list:
            return jsonify({"error": f"Job '{job}' is not available in the prediction model"}), 400

        # Make prediction
        prediction = model.predict([[job, age, experience]])
        predicted_salary = round(prediction[0], 2)

        return jsonify({"predicted_salary": predicted_salary})

    except Exception as e:
        return jsonify({"error": f"Something went wrong: {str(e)}"}), 500

# Serve React app
@app.route("/", defaults={"path": ""})
@app.route("/<path:path>")
def serve_react(path):
    if path != "" and os.path.exists(os.path.join(app.static_folder, path)):
        return send_from_directory(app.static_folder, path)
    else:
        return send_from_directory(app.static_folder, "index.html")

if __name__ == "__main__":
    app.run(debug=True)
