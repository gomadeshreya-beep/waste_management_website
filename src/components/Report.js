import React, { useState } from "react";

function Report() {
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");

  const handleReport = async (e) => {
    e.preventDefault();

    if (!description) {
      setError("Please enter a description.");
      return;
    }

    try {
      const response = await fetch("http://localhost:5000/report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ description }),
      });

      const data = await response.json();

      if (data.error) {
        setError(data.error);
      } else {
        setError("");
        alert(data.message);
        setDescription(""); // clear form
      }
    } catch (err) {
      setError("Server not reachable");
    }
  };

  return (
    <div className="login">
      <h2>Report Issue</h2>
      {error && <p style={{ color: "red" }}>{error}</p>}
      <form onSubmit={handleReport}>
        <textarea
          placeholder="Describe the issue"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <button type="submit">Submit Report</button>
      </form>
    </div>
  );
}

export default Report;
