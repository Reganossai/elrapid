import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const TwoMinuteDrillAdd = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
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

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
  e.preventDefault();
  const token = localStorage.getItem("token");

  try {
    const res = await fetch("http://localhost:5000/api/2mindrill/add", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(form),
    });

    if (!res.ok) {
      const text = await res.text(); // fallback to raw text
      console.error("❌ Server error:", text);
      alert("Server error while saving drill.");
      return;
    }

    const data = await res.json();
    if (data.success) navigate("/2mindrill/list");  
    else alert("Failed to save drill.");
  } catch (err) {
    console.error("❌ Submission error:", err.message);
    alert("Something went wrong.");
  }
};

  return (
    <div className="cal-tab">
      <button onClick={() => navigate("/")}>← Back</button>
      <h2>Add 2-Minute Drill</h2>
      <form onSubmit={handleSubmit}>
        {/* Individual Dropdown */}
        <label>Individual:</label>
        <select
          name="individual"
          value={form.individual}
          onChange={handleChange}
          required
        >
          <option value="">Select</option>
          <option value="Nicolas">Nicolas</option>
          <option value="Reagan">Reagan</option>
          <option value="Bello">Bello</option>
          <option value="Dayo">Dayo</option>
        </select>

        {/* Date Input */}
        <label>Date:</label>
        <input
          type="date"
          name="date"
          value={form.date}
          onChange={handleChange}
          required
        />

        {/* Remaining Fields */}
        <label>Height/Weight:</label>
        <input
          name="heightWeight"
          value={form.heightWeight}
          onChange={handleChange}
        />

        <label>Age/Sex:</label>
        <input name="ageSex" value={form.ageSex} onChange={handleChange} />

        <label>Race/Color:</label>
        <input name="raceColor" value={form.raceColor} onChange={handleChange} />

        <label>Appearance:</label>
        <input name="appearance" value={form.appearance} onChange={handleChange} />

        <label>Mobility / Commute:</label>
        <input
          name="mobilityCommute"
          value={form.mobilityCommute}
          onChange={handleChange}
        />

        <label>Address:</label>
        <input name="address" value={form.address} onChange={handleChange} />

        <label>Personality:</label>
        <input name="personality" value={form.personality} onChange={handleChange} />

        <label>Likes & Dislikes:</label>
        <input
          name="likesDislikes"
          value={form.likesDislikes}
          onChange={handleChange}
        />

        <label>Things to Note:</label>
        <textarea
          name="thingsToNote"
          value={form.thingsToNote}
          onChange={handleChange}
        />

        <button type="submit">Save</button>
      </form>
    </div>
  );
};

export default TwoMinuteDrillAdd;