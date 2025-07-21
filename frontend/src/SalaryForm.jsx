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
  Paper,
} from "@mui/material";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Line, Bar } from "react-chartjs-2";

// Register Chart.js modules
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const theme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: "#0077b6",
    },
    secondary: {
      main: "#90e0ef",
    },
  },
  typography: {
    fontFamily: "Roboto, sans-serif",
    h4: {
      fontWeight: 700,
      color: "#0077b6",
    },
  },
});

export default function SalaryForm() {
  const [formData, setFormData] = useState({
    "Age" : age,
    'Gender': "Male",
    "Education Level" : "Bachelors",
    "Job Title": 'Software Engineer',
    "Years of Experience": '0',
    "Actual Salary": "",
  });
  const [predictedSalary, setPredictedSalary] = useState(null);
  const [predictionHistory, setPredictionHistory] = useState([]);
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
        "https://employee-salary-prediction-njgz.onrender.com/predict",
        {
     Age: formData.Age,
      "Years of Experience": formData["Years of Experience"],
      "Job Title": formData["Job Title"].trim() // trim extra spaces
     },
        formData
      );

      const salary = response.data.predicted_salary;
      setPredictedSalary(salary);

      setPredictionHistory((prev) => [
        ...prev,
        {
          label: formData["Job Title"],
          predicted: salary,
          actual: formData["Actual Salary"] || null,
        },
      ]);
    } catch (err) {
      console.error(err);
      setError(
        "Failed to fetch prediction. Please check your input or try again later."
      );
    } finally {
      setLoading(false);
    }
  };

  const chartData = {
    labels: predictionHistory.map((item, index) => `#${index + 1}`),
    datasets: [
      {
        label: "Predicted Salary (₹)",
        data: predictionHistory.map((item) => item.predicted),
        backgroundColor: "rgba(0, 119, 182, 0.5)",
        borderColor: "#0077b6",
        fill: false,
        tension: 0.3,
      },
      {
        label: "Actual Salary (₹)",
        data: predictionHistory.map((item) =>
          item.actual ? Number(item.actual) : null
        ),
        backgroundColor: "rgba(255, 99, 132, 0.5)",
        borderColor: "#ff6b6b",
        fill: false,
        tension: 0.3,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: "bottom",
      },
      title: {
        display: true,
        text: "Predicted vs Actual Salary",
        font: { size: 18 },
      },
    },
  };
  return (
    <ThemeProvider theme={theme}>
      <Container
        maxWidth="sm"
        sx={{
          mt: 5,
          p: 4,
          boxShadow: 5,
          borderRadius: 3,
          background: "linear-gradient(145deg, #caf0f8, #ffffff)",
        }}
      >
        <Typography variant="h4" align="center" gutterBottom>
          💼 Employee Salary Predictor
        </Typography>

        <form onSubmit={handleSubmit}>
          {/* Age */}
          <TextField
            fullWidth
            label="Age (18-65)"
            name="Age"
            type="number"
            value={formData.Age}
            onChange={handleChange}
            margin="normal"
            required
            inputProps={{ min: 18, max: 65 }}
          />

          {/* Gender */}
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

          {/* Education Level */}
          <FormControl fullWidth margin="normal">
            <InputLabel>Education Level</InputLabel>
            <Select
              name="Education Level"
              value={formData["Education Level"]}
              onChange={handleChange}
            >
              <MenuItem value="High School">High School</MenuItem>
              <MenuItem value="Bachelors">Bachelors</MenuItem>
              <MenuItem value="Masters">Masters</MenuItem>
              <MenuItem value="PhD">PhD</MenuItem>
            </Select>
          </FormControl>

          {/* Job Title */}
          <TextField
            fullWidth
            label="Job Title"
            name="Job Title"
            value={formData["Job Title"]}
            onChange={handleChange}
            margin="normal"
            required
          />

          {/* Years of Experience */}
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

          {/* Actual Salary for Comparison */}
          <TextField
            fullWidth
            label="Actual Salary (Optional)"
            name="Actual Salary"
            type="number"
            value={formData["Actual Salary"]}
            onChange={handleChange}
            margin="normal"
            helperText="Enter if known to compare with prediction"
          />

          {/* Submit Button */}
          <Box textAlign="center" mt={3}>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              size="large"
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} /> : "Predict Salary"}
            </Button>
          </Box>
        </form>

        {/* Error Alert */}
        {error && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
        )}

        {/* Success Alert */}
        {predictedSalary && (
          <Alert severity="success" sx={{ mt: 2 }}>
            💰 Predicted Salary: ₹{predictedSalary}
          </Alert>
        )}

        {/* Chart */}
        {predictionHistory.length > 0 && (
          <Paper elevation={3} sx={{ mt: 5, p: 2 }}>
            <Line data={chartData} options={chartOptions} />
          </Paper>
        )}
      </Container>
    </ThemeProvider>
  );
}
