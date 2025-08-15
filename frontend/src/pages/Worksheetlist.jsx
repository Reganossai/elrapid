import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";

const Worksheetlist = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [worksheets, setWorksheets] = useState([]);
  const [sss, setSss] = useState("");

  // ✅ Load SSS from localStorage
  useEffect(() => {
    const storedSss = localStorage.getItem("sss");
    if (storedSss) {
      setSss(storedSss);
    }
  }, []);

  // ✅ Fetch worksheets
  useEffect(() => {
    fetch("http://localhost:5000/api/worksheets")
      .then((res) => res.json())
      .then((data) => setWorksheets(data.worksheets))
      .catch((err) => console.error("❌ Fetch failed:", err));
  }, [location.state]);

  const handleDelete = (id) => {
    fetch(`http://localhost:5000/api/worksheets/${id}`, {
      method: "DELETE",
    })
      .then((res) => res.json())
      .then(() => {
        setWorksheets((prev) => prev.filter((ws) => ws._id !== id));
      })
      .catch((err) => console.error("❌ Delete failed:", err));
  };

  return (
    <div className="cal-tab">
      <button onClick={() => navigate("/")}>← Back to Home</button>
      {worksheets.length === 0 ? (
        <p>No entries found.</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>SSS (Logged-in User)</th>
              <th>Individual</th>
              <th>Date</th>
              <th>File</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {worksheets.map((ws) => (
              <tr key={ws._id}>
                <td>{sss || "—"}</td>
                <td>{ws.individual}</td>
                <td>{ws.date}</td>
                <td>{ws.fileName}</td>
                <td>
                  <button onClick={() => handleDelete(ws._id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default Worksheetlist;