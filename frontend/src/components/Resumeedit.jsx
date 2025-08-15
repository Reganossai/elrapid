import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

const Resumeedit = () => {
  const { id } = useParams(); // ✅ Get Resume ID from URL
  const navigate = useNavigate();
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

  useEffect(() => {
    fetch(`http://localhost:5000/api/resume/${id}`)
      .then((res) => res.json())
      .then(({ resume }) => setFormData(resume))
      .catch((err) => console.error("❌ Fetch error:", err));
  }, [id]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const response = await fetch(
      `http://localhost:5000/api/resume/edit/${id}`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      }
    );

    const result = await response.json();
    if (response.ok) {
      alert("✅ Resume updated successfully!");
      navigate("/resume/list");
    } else {
      alert(`❌ Error: ${result.message}`);
    }
  };

  return (
    <div className="cal-tab">
     <button onClick={() => navigate("/resume/list")}>← Back</button>
      <form onSubmit={handleSubmit}>
        <label>Individuals:</label>
        <select
          name="individual"
          value={formData.individual}
          onChange={handleChange}
          required
        >
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

        <label>Skills:</label>
        <input
          type="text"
          name="skills"
          value={formData.skills.join(", ")}
          onChange={handleChange}
        />

        <label>Education:</label>
        <input
          type="text"
          name="education"
          value={formData.education}
          onChange={handleChange}
          required
        />

        <label>Summary:</label>
        <textarea
          name="summary"
          value={formData.summary}
          onChange={handleChange}
        ></textarea>

        <button type="submit">Update Resume</button>
      </form>
    </div>
  );
};

export default Resumeedit;
