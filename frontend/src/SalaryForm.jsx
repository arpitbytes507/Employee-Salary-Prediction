import React, { useState } from "react";
import axios from "axios";
import {
  Container,
  TextField,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  Button,
  Typography,
  CircularProgress,
  Alert,
  Box,
  createTheme,
  ThemeProvider,
} from "@mui/material";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Line } from "react-chartjs-2";

// Register Chart.js modules
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const lightTheme = createTheme({
  palette: {
    mode: "light", // Force light mode
  },
});

export default function SalaryForm() {
  const [formData, setFormData] = useState({
    Age: "",
    Gender: "Male",
    "Education Level": "Bachelors",
    "Job Title": "",
    "Years of Experience": "",
  });
  const [predictedSalary, setPredictedSalary] = useState(null);
  const [predictionHistory, setPredictionHistory] = useState([]); // For chart
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setPredictedSalary(null);
    setLoading(true);
    try {
      const response = await axios.post(
        "https://employee-salary-prediction-njgz.onrender.com/predict", // Flask API endpoint
        formData
      );
      const salary = response.data.predicted_salary;
      setPredictedSalary(salary);
      setPredictionHistory((prev) => [
        ...prev,
        { label: formData["Job Title"], salary: salary },
      ]);
    } catch (err) {
      console.error(err);
      setError("Failed to fetch prediction. Is your Flask backend running?");
    } finally {
      setLoading(false);
    }
  };

  // Prepare chart data
  const chartData = {
    labels: predictionHistory.map((item, index) => `#${index + 1}`),
    datasets: [
      {
        label: "Predicted Salary (₹)",
        data: predictionHistory.map((item) => item.salary),
        fill: false,
        borderColor: "rgb(75, 192, 192)",
        tension: 0.2,
        pointBackgroundColor: "rgb(75, 192, 192)",
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: "top",
      },
      title: {
        display: true,
        text: "Prediction History",
      },
    },
  };

  return (
    <ThemeProvider theme={lightTheme}>
      <Container
        maxWidth="sm"
        sx={{
          mt: 5,
          p: 4,
          boxShadow: 3,
          borderRadius: 2,
          backgroundColor: "white",
        }}
      >
        <Typography variant="h4" align="center" gutterBottom>
          💼 Employee Salary Predictor
        </Typography>

        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="Age"
            name="Age"
            type="number"
            value={formData.Age}
            onChange={handleChange}
            margin="normal"
            required
          />

          <FormControl fullWidth margin="normal">
            <InputLabel>Gender</InputLabel>
            <Select
              name="Gender"
              value={formData.Gender}
              onChange={handleChange}
            >
              <MenuItem value="Male">Male</MenuItem>
              <MenuItem value="Female">Female</MenuItem>
            </Select>
          </FormControl>

          <FormControl fullWidth margin="normal">
            <InputLabel>Education Level</InputLabel>
            <Select
              name="Education Level"
              value={formData["Education Level"]}
              onChange={handleChange}
            >
              <MenuItem value="Bachelors">Bachelors</MenuItem>
              <MenuItem value="Masters">Masters</MenuItem>
              <MenuItem value="PhD">PhD</MenuItem>
              <MenuItem value="High School">High School</MenuItem>
            </Select>
          </FormControl>

          <TextField
            fullWidth
            label="Job Title"
            name="Job Title"
            value={formData["Job Title"]}
            onChange={handleChange}
            margin="normal"
            required
          />

          <TextField
            fullWidth
            label="Years of Experience"
            name="Years of Experience"
            type="number"
            value={formData["Years of Experience"]}
            onChange={handleChange}
            margin="normal"
            required
          />

          <Box textAlign="center" mt={3}>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} /> : "Predict Salary"}
            </Button>
          </Box>
        </form>

        {error && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
        )}

        {predictedSalary && (
          <Alert severity="success" sx={{ mt: 2 }}>
            💰 Predicted Salary: ₹{predictedSalary}
          </Alert>
        )}

        {/* Chart */}
        {predictionHistory.length > 0 && (
          <Box sx={{ mt: 5 }}>
            <Line data={chartData} options={chartOptions} />
          </Box>
        )}
      </Container>
    </ThemeProvider>
  );
}
