import React from "react";
import SalaryForm from "./components/SalaryForm";
import Footer from "./components/Footer";

export default function App() {
  return (
    <div className="flex flex-col min-h-screen bg-gray-100 text-gray-800">
      <header className="bg-blue-600 text-white text-center py-6 shadow-lg">
        <h1 className="text-3xl font-bold">Employee Salary Predictor</h1>
        <p className="text-sm mt-1">Predict salaries based on your profile</p>
      </header>
      <main className="flex-1 p-4 flex justify-center">
        <SalaryForm />
      </main>
      <Footer />
    </div>
  );
}
