import React, { useState } from "react";
import { predictCSV } from "../services/predictionService";

function Predict() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleUpload = async () => {
    if (!file) {
      alert("Please select a CSV file");
      return;
    }

    setLoading(true);

    try {
      const result = await predictCSV(file);
      console.log("Prediction result:", result);
      alert("Prediction completed! Check console.");
    } catch (err) {
      console.error(err);
      alert("Prediction failed");
    }

    setLoading(false);
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Upload CSV for Prediction</h2>

      <input
        type="file"
        accept=".csv"
        onChange={(e) => setFile(e.target.files[0])}
      />

      <br /><br />

      <button onClick={handleUpload} disabled={loading}>
        {loading ? "Predicting..." : "Upload & Predict"}
      </button>
    </div>
  );
}

export default Predict;
