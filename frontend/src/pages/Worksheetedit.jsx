import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";

const Worksheetedit = () => {
  const { id } = useParams();
  const [title, setTitle] = useState("");
  const [file, setFile] = useState(null);
  const [existingFileName, setExistingFileName] = useState("");
  const [skillType, setSkillType] = useState("");

  const skillOptions = [
    "Facing",
    "Product Wrapping",
    "Cleaning",
    "Splitting",
    "Stocking",
    "Safety",
    "Customer Service",
    "Online Ordering",
    "Inventory Management",
    "Teamwork",
    "Communication",
    "Problem Solving",
  ];

  useEffect(() => {
    const fetchWorksheet = async () => {
      try {
        const { data } = await axios.get("http://localhost:5000/api/worksheets");
        const found = data.find((w) => w._id === id);
        if (found) {
          setTitle(found.title);
          setExistingFileName(found.fileName);
          setSkillType(found.skillType || "");
        }
      } catch (err) {
        console.error("❌ Error fetching worksheet:", err);
      }
    };
    fetchWorksheet();
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("title", title);
    formData.append("createdBy", localStorage.getItem("sss"));
    formData.append("skillType", skillType);
    if (file) formData.append("file", file);

    try {
      await axios.put(`http://localhost:5000/api/worksheets/${id}`, formData);
      alert("✅ Worksheet updated successfully");
    } catch (err) {
      console.error("❌ Update error:", err);
      alert("Failed to update worksheet");
    }
  };

  return (
    <div className="cal-tab">
    <form onSubmit={handleSubmit}>
      <h3>✏️ Edit Worksheet</h3>

      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Worksheet Title"
        required
      />

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

      <input type="file" onChange={(e) => setFile(e.target.files[0])} />

      {existingFileName && (
        <p>
          📎 Current File:{" "}
          <a
            href={`http://localhost:5000${existingFileName}`}
            target="_blank"
            rel="noreferrer"
          >
            View
          </a>
        </p>
      )}

      <button type="submit">Update</button>
    </form>
    </div>
  );
};

export default Worksheetedit;