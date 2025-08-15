import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const Resumeadd = () => {
  const [formData, setFormData] = useState({
    individual: "",
    email: "",
    phone: "",
    skills: [],
    education: "",
    experience: [],
    certifications: [],
    projects: [],
    summary: "",
  });
  
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleArrayChange = (e, field) => {
    const values = e.target.value.split(",").map((item) => {
      if (field === "experience") {
        const parts = item.split("-");
        return {
          company: parts[0]?.trim() || "",
          role: parts[1]?.trim() || "",
          years: parseInt(parts[2]?.trim()) || 0,
        };
      }
      return item.trim();
    });

    setFormData({ ...formData, [field]: values });
  };

  const handleSubmit = async (e) => {
  e.preventDefault();

  const response = await fetch("http://localhost:5000/api/resume/add", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("token")}` // ✅ Include token
    },
    body: JSON.stringify(formData)
  });

  const result = await response.json();
  if (response.ok) {
    alert("✅ Resume added successfully!");
    navigate("/resume/list")
    
  } else {
    alert(`❌ Error: ${result.message}`);
  }
};

  return (
    <div className="cal-tab">
       <button onClick={() => navigate("/")}>← Back to Home</button>
      <form onSubmit={handleSubmit}>
        <label>Individuals:</label>
        <select
          name="individual"
          value={formData.individual}
          onChange={handleChange}
          required
        >
          <option value="">Select</option>
          <option value="Reagan">Reagan</option>
          <option value="Bello">Bello</option>
          <option value="Dayo">Dayo</option>
        </select>

        <label>Email:</label>
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          required
        />

        <label>Phone:</label>
        <input
          type="text"
          name="phone"
          value={formData.phone}
          onChange={handleChange}
          required
        />

        <label>Skills (comma separated):</label>
        <input type="text" onChange={(e) => handleArrayChange(e, "skills")} />

        <label>Education:</label>
        <input
          type="text"
          name="education"
          value={formData.education}
          onChange={handleChange}
          required
        />

        <label>
          Work Experience (comma separated, e.g. Company-Role-Years):
        </label>
        <input
          type="text"
          onChange={(e) => handleArrayChange(e, "experience")}
        />

        <label>Certifications (comma separated):</label>
        <input
          type="text"
          onChange={(e) => handleArrayChange(e, "certifications")}
        />

        <label>Projects (comma separated):</label>
        <input type="text" onChange={(e) => handleArrayChange(e, "projects")} />

        <label>Summary:</label>
        <textarea
          name="summary"
          value={formData.summary}
          onChange={handleChange}
        ></textarea>

        <button type="submit">Submit</button>
      </form>
    </div>
  );
};

export default Resumeadd;
