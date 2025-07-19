from flask import Flask, send_from_directory, jsonify, request
from flask_cors import CORS
import joblib
import os

app = Flask(__name__, static_folder="static", static_url_path="")
CORS(app)

# Load model
try:
    model = joblib.load("salary_model.pkl")
    print("[INFO] Model loaded successfully ✅")
except Exception as e:
    print(f"[ERROR] Failed to load model: {e}")
    model = None

# Load job list safely
csv_path = "Salary Data.csv"
if os.path.exists(csv_path):
    import pandas as pd
    job_list = pd.read_csv(csv_path)["Job Title"].unique().tolist()
    print(f"[INFO] Loaded {len(job_list)} job titles from CSV ✅")
else:
    # Fallback job list
    job_list = ["Software Engineer", "Data Scientist", "Manager", "Analyst", "Designer"]
    print(f"[WARNING] CSV not found. Using fallback job list of {len(job_list)} roles.")

@app.route("/predict", methods=["POST"])
def predict():
    if model is None:
        return jsonify({"error": "ML model not loaded on server"}), 500

    try:
        data = request.json
        age = int(data.get("Age", 0))
        experience = int(data.get("Years of Experience", 0))
        job = data.get("Job Title", "").strip()

        # Validate
        if not (18 <= age <= 65):
            return jsonify({"error": "Age must be between 18 and 65"}), 400
        if not (0 <= experience <= age - 18):
            return jsonify({"error": f"Experience must be between 0 and {age - 18}"}), 400
        if job not in job_list:
            return jsonify({"error": f"Job '{job}' not found in model"}), 400

        # Predict
        prediction = model.predict([[job, age, experience]])
        predicted_salary = round(prediction[0], 2)

        return jsonify({"predicted_salary": predicted_salary})

    except Exception as e:
        return jsonify({"error": f"Server error: {str(e)}"}), 500

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
