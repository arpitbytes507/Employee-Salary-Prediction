from flask import Flask, send_from_directory, jsonify, request
from flask_cors import CORS
import joblib
import os

app = Flask(__name__, static_folder="static", static_url_path="")
CORS(app)

# === Load ML model ===
try:
    model = joblib.load("salary_model.pkl")
    print("[INFO] ✅ Model loaded successfully.")
except Exception as e:
    print(f"[ERROR] ❌ Failed to load model: {e}")
    model = None

# === Load job titles ===
csv_path = "Salary Data.csv"
if os.path.exists(csv_path):
    try:
        import pandas as pd
        job_list = pd.read_csv(csv_path)["Job Title"].unique().tolist()
        job_titles_lower = [j.lower() for j in job_list]  # For case-insensitive matching
        print(f"[INFO] ✅ Loaded {len(job_list)} job titles from CSV.")
    except Exception as e:
        print(f"[ERROR] ❌ Failed to load CSV: {e}")
        job_list = []
        job_titles_lower = []
else:
    # Fallback job list if CSV is missing
    job_list = ["Software Engineer", "Data Scientist", "Manager", "Analyst", "Designer"]
    job_titles_lower = [j.lower() for j in job_list]
    print(f"[WARNING] ⚠️ CSV not found. Using fallback job list of {len(job_list)} roles.")

# === Prediction Endpoint ===
@app.route("/predict", methods=["POST"])
def predict():
    if model is None:
        return jsonify({"error": "❌ ML model not loaded on server"}), 500

    try:
        data = request.json
        print("[DEBUG] 📥 Received data:", data)

        # Extract and validate data
        age = int(data.get("Age", 0))
        experience = int(data.get("Years of Experience", 0))
        job = data.get("Job Title", "").strip()

        # Validate age
        if not (18 <= age <= 65):
            return jsonify({"error": "Age must be between 18 and 65"}), 400

        # Validate experience
        if not (0 <= experience <= age - 18):
            return jsonify({"error": f"Experience must be between 0 and {age - 18}"}), 400

        # Validate job title (case-insensitive)
        if job.lower() not in job_titles_lower:
            return jsonify({"error": f"Job '{job}' not found in model"}), 400

        # Predict
        prediction = model.predict([[job, age, experience]])
        predicted_salary = round(prediction[0], 2)
        print(f"[DEBUG] 📊 Predicted Salary: ₹{predicted_salary}")

        return jsonify({"predicted_salary": predicted_salary})

    except Exception as e:
        print(f"[ERROR] ❌ Server error during prediction: {e}")
        return jsonify({"error": f"Server error: {str(e)}"}), 500

# === Serve React App ===
@app.route("/", defaults={"path": ""})
@app.route("/<path:path>")
def serve_react(path):
    if path != "" and os.path.exists(os.path.join(app.static_folder, path)):
        return send_from_directory(app.static_folder, path)
    else:
        return send_from_directory(app.static_folder, "index.html")

if __name__ == "__main__":
    app.run(debug=True)
