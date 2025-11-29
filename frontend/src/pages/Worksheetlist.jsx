import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";

const Worksheetlist = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [worksheets, setWorksheets] = useState([]);
  const [sss, setSss] = useState("");

  // Load SSS
  useEffect(() => {
    const storedSss = localStorage.getItem("sss");
    if (storedSss) setSss(storedSss);
  }, []);

  // Fetch worksheets
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

  // Build the correct file URL
  const getFileUrl = (fileName) => `http://localhost:5000/uploads/${fileName}`;

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

                <td style={{ display: "flex", gap: "10px" }}>
                  {/* DELETE */}
                  <button
                    className="delete-btn"
                    onClick={() => handleDelete(ws._id)}
                  >
                    Delete
                  </button>

                  {/* DOWNLOAD */}
                  <a className="download-btn" href={ws.fileUrl} download>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      height="18"
                      width="18"
                      viewBox="0 0 24 24"
                      fill="white"
                    >
                      <path d="M5 20h14v-2H5v2zm7-18l-5 5h3v6h4V7h3l-5-5z" />
                    </svg>
                  </a>
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
