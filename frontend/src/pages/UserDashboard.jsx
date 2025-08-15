import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import { FaUsers } from "react-icons/fa";
import { MdOutlineNotificationsActive } from "react-icons/md";
import { GrFormCalendar } from "react-icons/gr";
import { BiSolidFileCss } from "react-icons/bi";


const UserDashboard = () => {
  const [userData, setUserData] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");

    if (token && role) {
      navigate("/user-dashboard");
    }

    fetch("http://localhost:5000/api/profile", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        setUserData(data.user);
      })
      .catch((err) => console.error("⛔ Profile fetch error:", err));
  }, []);

  return (
    <div className="user-dash">
      <Navbar />

      <div className="user-sub">
        <Sidebar />

        {userData ? (
          <div className="dashboard">
            <div className="top-section">
              {/* Good Morning Section */}
              <div className="greeting">
                <h2>Good Morning 🎉 {userData.firstName} {userData.lastName}!</h2>
                <p>
                  Role: <strong>{userData.role === "user" ? "Skills Support Specialist" : "Admin"}</strong>
                </p>
              </div>

              {/* Statistics Section */}
              <section className="stats">
                <h3>Statistics</h3>
                <div className="stats-container">
                  <div className="sttt">
                    <p>Individuals</p>
                    <strong><span><FaUsers className="icons-orange"/></span>12</strong>
                  </div>
                  <div className="sttt">
                    <p>Reports</p>
                   <strong><span><BiSolidFileCss className="icons-red"/></span>2</strong>
                  </div>
                  <div className="sttt">
                    <p>MAR</p>
                   <strong><span><GrFormCalendar  className="icons-blue"/></span>10</strong>
                  </div>
                  <div className="sttt">
                    <p>Notifications</p>
                    <strong><span><MdOutlineNotificationsActive  className="icons-green"/></span>8</strong> 
                  </div>
                </div>
              </section>
            </div>

            {/* Reports Section */}
            <div className="reports">
              <h3>Reports Due</h3>
              <table>
                <thead>
                  <tr>
                    <th>Due Date</th>
                    <th>Report Name</th>
                    <th>Report Type</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>2025-07-10</td>
                    <td>Monthly Financial Report</td>
                    <td>Finance</td>
                  </tr>
                  <tr>
                    <td>2025-07-15</td>
                    <td>Employee Performance Review</td>
                    <td>HR</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Upcoming Birthdays Section */}
            <div className="birthdays">
              <h3>Upcoming Birthdays</h3>
              <ul>
                <li>John Doe - July 15</li>
                <li>Jane Smith - July 20</li>
              </ul>
            </div>
          </div>
        ) : (
          <p>Loading...</p>
        )}
      </div>
    </div>
  );
};

export default UserDashboard;