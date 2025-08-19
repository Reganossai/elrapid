import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import jsPDF from "jspdf"; // Make sure to install this: npm install jspdf



const TwoMinuteDrillEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    individual: "",
    date: "",
    heightWeight: "",
    ageSex: "",
    raceColor: "",
    appearance: "",
    mobilityCommute: "",
    address: "",
    personality: "",
    likesDislikes: "",
    thingsToNote: "",
  });

  useEffect(() => {
    fetch("http://localhost:5000/api/2mindrill/list", {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    })
      .then((res) => res.json())
      .then(({ drills }) => {
        const drill = drills.find((d) => d._id === id);
        if (drill) setFormData(drill);
        else alert("❌ Drill not found");
      })
      .catch((err) => console.error("❌ Fetch error:", err));
  }, [id]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const response = await fetch(`http://localhost:5000/api/2mindrill/edit/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify(formData),
    });

    const result = await response.json();
    if (response.ok) {
      alert("✅ Drill updated successfully!");
      navigate("/2mindrill/list");
    } else {
      alert(`❌ Error: ${result.message}`);
    }
  };


const handleDelete = async () => {
  if (!window.confirm("Are you sure you want to delete this drill?")) return;

  const response = await fetch(`http://localhost:3001/api/2mindrill/delete/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  });

  const result = await response.json();
  if (response.ok) {
    alert("🗑️ Drill deleted successfully!");
    navigate("/2mindrill/list");
  } else {
    alert(`❌ Error: ${result.message}`);
  }
};

const handleExportPDF = () => {
  const doc = new jsPDF();
  doc.setFontSize(14);
  doc.text("2-Minute Drill Summary", 20, 20);

  const fields = [
    "individual", "date", "heightWeight", "ageSex", "raceColor", "appearance",
    "mobilityCommute", "address", "personality", "likesDislikes", "thingsToNote"
  ];

  let y = 30;
  fields.forEach((field) => {
    const label = field.replace(/([A-Z])/g, " $1").replace(/^./, str => str.toUpperCase());
    const value = formData[field] || "—";
    doc.text(`${label}: ${value}`, 20, y);
    y += 10;
  });

  doc.save(`2min-drill-${formData.individual || "unknown"}.pdf`);
};

  return (
    <div className="cal-tab">
      <button onClick={() => navigate("/2mindrill/list")}>← Back</button>
      <form onSubmit={handleSubmit}>
        <label>Individual:</label>
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
          <option value="Nicolas">Nicolas</option>
        </select>

        <label>Date:</label>
        <input
          type="date"
          name="date"
          value={formData.date}
          onChange={handleChange}
        />

        <label>Height & Weight:</label>
        <input
          name="heightWeight"
          value={formData.heightWeight}
          onChange={handleChange}
        />

        <label>Age & Sex:</label>
        <input
          name="ageSex"
          value={formData.ageSex}
          onChange={handleChange}
        />

        <label>Race & Color:</label>
        <input
          name="raceColor"
          value={formData.raceColor}
          onChange={handleChange}
        />

        <label>Appearance:</label>
        <textarea
          name="appearance"
          value={formData.appearance}
          onChange={handleChange}
        />

        <label>Mobility & Commute:</label>
        <textarea
          name="mobilityCommute"
          value={formData.mobilityCommute}
          onChange={handleChange}
        />

        <label>Address:</label>
        <textarea
          name="address"
          value={formData.address}
          onChange={handleChange}
        />

        <label>Personality:</label>
        <textarea
          name="personality"
          value={formData.personality}
          onChange={handleChange}
        />

        <label>Likes & Dislikes:</label>
        <textarea
          name="likesDislikes"
          value={formData.likesDislikes}
          onChange={handleChange}
        />

        <label>Things to Note:</label>
        <textarea
          name="thingsToNote"
          value={formData.thingsToNote}
          onChange={handleChange}
        />

        <button type="submit">Update Drill</button>
      </form>
    </div>
  );
};

export default TwoMinuteDrillEdit;