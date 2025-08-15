import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const AdminDashboard = () => {
  const [username, setUsername] = useState("");
  const navigate = useNavigate();
useEffect(() => {
  const token = localStorage.getItem("token");

  if (!token || localStorage.getItem("role") !== "admin") {
    navigate("/");
  } else {
    fetch("http://localhost:5000/api/protected", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => setUsername(data.user.email)) // ✅ Change to `email`
      .catch(() => navigate("/"));
  }
}, []);

  return (
    <div>
      <h2>Admin Dashboard</h2>
      <p>Welcome, {username}! You have admin privileges.</p>
      <button
        onClick={() => {
          localStorage.removeItem("token");
          localStorage.removeItem("role");
          navigate("/");
        }}
      >
        Logout
      </button>
    </div>
  );
};

export default AdminDashboard;