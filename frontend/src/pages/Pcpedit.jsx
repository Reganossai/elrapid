import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

const Pcpedit = () => {
  const { id } = useParams();
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

  useEffect(() => {
    fetch(`http://localhost:5000/api/pcp/${id}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    })
      .then((res) => res.json())
      .then(({ pcp }) => setFormData(pcp))
      .catch((err) => console.error("❌ Fetch error:", err));
  }, [id]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const response = await fetch(`http://localhost:5000/api/pcp/edit/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify(formData),
    });

    const result = await response.json();
    if (response.ok) {
      alert("✅ PCP updated successfully!");
      navigate("/pcp/list");
    } else {
      alert(`❌ Error: ${result.message}`);
    }
  };

  return (
    <div className="cal-tab">
      <button onClick={() => navigate("/pcp/list")}>← Back</button>
      <form onSubmit={handleSubmit}>
        <label>Individual:</label>
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

        <label>Vision:</label>
        <textarea name="vision" value={formData.vision} onChange={handleChange} />

        <label>What Works:</label>
        <textarea name="whatWorks" value={formData.whatWorks} onChange={handleChange} />

        <label>What Doesn't Work:</label>
        <textarea name="whatDoesNotWork" value={formData.whatDoesNotWork} onChange={handleChange} />

        <label>Strengths:</label>
        <textarea name="strengths" value={formData.strengths} onChange={handleChange} />

        <label>Goals:</label>
        <textarea name="goals" value={formData.goals} onChange={handleChange} />

        <label>What Matters:</label>
        <textarea name="whatMatters" value={formData.whatMatters} onChange={handleChange} />

        <label>Important To:</label>
        <textarea name="importantTo" value={formData.importantTo} onChange={handleChange} />

        <label>Important For:</label>
        <textarea name="importantFor" value={formData.importantFor} onChange={handleChange} />

        <label>Special People:</label>
        <textarea name="specialPeople" value={formData.specialPeople} onChange={handleChange} />

        <label>Support Preferences:</label>
        <textarea name="supportPreferences" value={formData.supportPreferences} onChange={handleChange} />

        <label>Personality Traits:</label>
        <textarea name="personalityTraits" value={formData.personalityTraits} onChange={handleChange} />

        <label>Interests:</label>
        <textarea name="interests" value={formData.interests} onChange={handleChange} />

        <label>Communication Style:</label>
        <textarea name="communicationStyle" value={formData.communicationStyle} onChange={handleChange} />

        <label>Decision Making:</label>
        <textarea name="decisionMaking" value={formData.decisionMaking} onChange={handleChange} />

        <label>Dreams:</label>
        <textarea name="dreams" value={formData.dreams} onChange={handleChange} />

        <label>Future Vision:</label>
        <textarea name="futureVision" value={formData.futureVision} onChange={handleChange} />

        <button type="submit">Update PCP</button>
      </form>
    </div>
  );
};

export default Pcpedit;