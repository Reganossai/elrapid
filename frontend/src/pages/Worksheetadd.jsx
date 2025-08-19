import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Worksheetadd = () => {
  const [title, setTitle] = useState("");
  const [file, setFile] = useState(null);
  const [skillType, setSkillType] = useState("");
  const [individual, setIndividual] = useState("");
  const [individualOptions, setIndividualOptions] = useState([]);
  const navigate = useNavigate();

  const skillOptions = [
    "Stocking",
    "Facing",
    "Product Wrapping",
    "Splitting",
    "Cleaning",
    "Communication",
    "Teamwork",
    "Problem Solving",
    "Adaptability",
    "Time Management",
  ];

  useEffect(() => {
    const savedUser = localStorage.getItem("sss");
    if (savedUser) setIndividual(savedUser);

    axios.get("http://localhost:5000/api/calendar/list").then((res) => {
      const unique = [
        ...new Set(res.data.events.map((e) => e.individual).filter(Boolean)),
      ];
      setIndividualOptions(unique);
    });
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("title", title);
    formData.append("individual", individual);
    formData.append("skillType", skillType);
    formData.append("file", file);
    formData.append("date", new Date().toISOString().slice(0, 10));

    try {
      await axios.post("http://localhost:5000/api/worksheets", formData);
      alert("✅ Worksheet uploaded successfully");
      setTitle("");
      setFile(null);
      setSkillType("");
      console.log("Submitting worksheet with:", {
        individual,
        skillType,
        title,
        file,
      });
    } catch (err) {
      console.error("❌ Upload error:", err);
      alert("Failed to upload worksheet");
    }
  };

  return (
    <div className="cal-tab">
      <form onSubmit={handleSubmit}>
        <button onClick={() => navigate("/")}>← Back</button>
        <h3>📄 Upload Worksheet</h3>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Worksheet Title"
          required
        />

        <select
          value={individual}
          onChange={(e) => setIndividual(e.target.value)}
          required
        >
          <option value="">Select Individual</option>
          {individualOptions.map((name, idx) => (
            <option key={idx} value={name}>
              {name}
            </option>
          ))}
        </select>

        <select
          value={skillType}
          onChange={(e) => setSkillType(e.target.value)}
          required
        >
          <option value="">Select Skill</option>
          {skillOptions.map((skill, idx) => (
            <option key={idx} value={skill}>
              {skill}
            </option>
          ))}
        </select>

        <input
          type="file"
          onChange={(e) => setFile(e.target.files[0])}
          required
        />

        <button type="submit">Upload</button>
      </form>
    </div>
  );
};

export default Worksheetadd;
