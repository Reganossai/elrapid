import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const Pcpadd = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    individual: "",
    vision: "",
    whatWorks: "",
    whatDoesNotWork: "",
    strengths: "",
    goals: "",
    whatMatters: "",
    importantTo: "",
    importantFor: "",
    specialPeople: "",
    supportPreferences: "",
    personalityTraits: "",
    interests: "",
    communicationStyle: "",
    decisionMaking: "",
    dreams: "",
    futureVision: "",
  });

  const [sss, setSss] = useState("");

  useEffect(() => {
    const stored = localStorage.getItem("sss");
    if (stored) setSss(stored);
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const response = await fetch("http://localhost:5000/api/pcp/add", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify({ ...formData, createdBy: sss }),
    });

    const data = await response.json();
    if (!response.ok) {
      alert(`❌ Error: ${data.message}`);
      return;
    }

    alert("✅ PCP added!");
    navigate("/pcp/list");
  };

  return (
    <div className="cal-tab">
      <h2>Add Person-Centered Plan</h2>
      <form onSubmit={handleSubmit}>
        <label>Individual:</label>
        <select name="individual" value={formData.individual} onChange={handleChange} required>
          <option value="">-- Select --</option>
          <option value="Reagan">Reagan</option>
          <option value="Dayo">Dayo</option>
          <option value="Bello">Bello</option>
        </select>

        <label>Individual's Vision:</label>
        <textarea name="vision" value={formData.vision} onChange={handleChange} />

        <label>What works for the Individual:</label>
        <textarea name="whatWorks" value={formData.whatWorks} onChange={handleChange} />

        <label>What does not work for the Individual:</label>
        <textarea name="whatDoesNotWork" value={formData.whatDoesNotWork} onChange={handleChange} />

        <label>Individual’s Strengths:</label>
        <textarea name="strengths" value={formData.strengths} onChange={handleChange} />

        <label>Individual’s Goal:</label>
        <textarea name="goals" value={formData.goals} onChange={handleChange} />

        <label>Things that matter to me and are important to my life:</label>
        <textarea name="whatMatters" value={formData.whatMatters} onChange={handleChange} />

        <label>Things that are important to the Individual:</label>
        <textarea name="importantTo" value={formData.importantTo} onChange={handleChange} />

        <label>Things that are important for the Individual:</label>
        <textarea name="importantFor" value={formData.importantFor} onChange={handleChange} />

        <label>The Special People are:</label>
        <textarea name="specialPeople" value={formData.specialPeople} onChange={handleChange} />

        <label>How I like to be supported:</label>
        <textarea name="supportPreferences" value={formData.supportPreferences} onChange={handleChange} />

        <label>Personality Traits I like:</label>
        <textarea name="personalityTraits" value={formData.personalityTraits} onChange={handleChange} />

        <label>Their Interests:</label>
        <textarea name="interests" value={formData.interests} onChange={handleChange} />

        <label>I share my thoughts and feelings by:</label>
        <textarea name="communicationStyle" value={formData.communicationStyle} onChange={handleChange} />

        <label>How Individual prefers to make decisions:</label>
        <textarea name="decisionMaking" value={formData.decisionMaking} onChange={handleChange} />

        <label>Visions and Dreams:</label>
        <textarea name="dreams" value={formData.dreams} onChange={handleChange} />

        <label>What {formData.individual || "Individual"} wants to see:</label>
        <textarea name="futureVision" value={formData.futureVision} onChange={handleChange} />

        <button type="submit">Submit PCP</button>
      </form>
    </div>
  );
};

export default Pcpadd;