import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const Calendaradd = () => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    individual: "",
    location: "",
    date: "",
    tasksPage1: Array(5).fill(""),
    tasksPage2: Array(5).fill(""),
    morningBriefing: "",
    workSkill: "",
    softSkill: "",
    subSoftSkill: "",
    isHoliday: false,
  });

  const [dailyNotes, setDailyNotes] = useState(
    getWorkingDaysOfMonth(new Date().getFullYear(), new Date().getMonth())
  );

  const navigate = useNavigate();

  const hardSkillOptions = [
    "Stocking",
    "Facing",
    "Product Wrapping",
    "Splitting",
    "Cleaning",
  ];

  const softSkillOptions = [
    "Communication",
    "Teamwork",
    "Problem Solving",
    "Adaptability",
    "Time Management",
  ];

  function getWorkingDaysOfMonth(year, month) {
    const days = [];
    const d = new Date(year, month, 1);
    while (d.getMonth() === month) {
      if (d.getDay() !== 0 && d.getDay() !== 6) {
        days.push({
          date: new Date(d),
          morningBriefing: "",
          workSkill: "",
          softSkill: "",
          subSoftSkill: "",
          isHoliday: false,
        });
      }
      d.setDate(d.getDate() + 1);
    }
    return days;
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === "checkbox" ? checked : value;
    setFormData({ ...formData, [name]: newValue });

    if (name === "individual") {
      localStorage.setItem("selectedIndividualName", value);
    }
  };

  const handleTaskChange = (index, value, page) => {
    const updatedTasks = [...formData[page]];
    updatedTasks[index] = value;
    setFormData({ ...formData, [page]: updatedTasks });
  };

  const handleNext = () => setStep((prev) => prev + 1);

  const handleBack = () => setStep((prev) => prev - 1);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const cleanSkills = (skills) => skills.map((s) => s.trim()).filter(Boolean);

    const combinedWorkSkill = cleanSkills(formData.tasksPage1).join(", ");
    const combinedSoftSkill = cleanSkills(formData.tasksPage2).join(", ");

    const enrichedNotes = dailyNotes.map((note) => ({
      ...note,
      date: new Date(note.date).toISOString(),
      morningBriefing: note.morningBriefing.trim(),
      workSkill: note.workSkill.trim() || combinedWorkSkill,
      softSkill: note.softSkill.trim() || combinedSoftSkill,
      subSoftSkill: note.subSoftSkill.trim(),
    }));

    const payload = {
      ...formData,
      date: new Date(formData.date).toISOString(),
      tasksPage1: cleanSkills(formData.tasksPage1),
      tasksPage2: cleanSkills(formData.tasksPage2),
      dailyNotes: enrichedNotes,
    };

    try {
      const response = await fetch("http://localhost:5000/api/calendar/add", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      if (!response.ok) {
        alert(`❌ Error: ${data.message}`);
        return;
      }

      alert("✅ Event added successfully!");
      setStep(1);
      navigate("/");
    } catch (error) {
      console.error("❌ Submission error:", error);
      alert("Something went wrong while saving the calendar entry.");
    }
  };

  return (
    <div className="cal-tab">
      <button onClick={() => navigate("/")}>← Back to Home</button>
      <form onSubmit={handleSubmit}>
        {step === 1 && (
          <div>
            <label>Individual:</label>
            <select
              name="individual"
              value={formData.individual}
              onChange={handleChange}
              required
            >
              <option value="">Select</option>
              <option value="Nicolas">Nicolas</option>
              <option value="Reagan">Reagan</option>
              <option value="Bello">Bello</option>
              <option value="Dayo">Dayo</option>
            </select>

              <label>Location:</label>
        <select
          name="location"
          value={formData.location}
          onChange={handleChange}
          required
        >
          <option value="">Select</option>
          <option value="Staples">Staples</option>
          <option value="Dollar King">Dollar King</option>
          <option value="7/11">7/11</option>
        </select>

        <label>Date:</label>
        <input
          type="date"
          name="date"
          value={formData.date}
          onChange={handleChange}
          required
        />

        <button type="button" onClick={handleNext}>
          Next
        </button>
      </div>
    )}

    {step === 2 && (
      <div>
        <h3>Work Skills</h3>
        {formData.tasksPage1.map((task, index) => (
          <div key={index}>
            <label>Work Skill {index + 1}:</label>
            <select
              value={task}
              onChange={(e) =>
                handleTaskChange(index, e.target.value, "tasksPage1")
              }
              required
            >
              <option value="">Select</option>
              {hardSkillOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
        ))}
        <button type="button" onClick={handleBack}>
          Back
        </button>
        <button type="button" onClick={handleNext}>
          Next
        </button>
      </div>
    )}

    {step === 3 && (
      <div>
        <h3>Soft Skills</h3>
        {formData.tasksPage2.map((task, index) => (
          <div key={index}>
            <label>Soft Skill {index + 1}:</label>
            <select
              value={task}
              onChange={(e) =>
                handleTaskChange(index, e.target.value, "tasksPage2")
              }
              required
            >
              <option value="">Select</option>
              {softSkillOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
        ))}
        <button type="button" onClick={handleBack}>
          Back
        </button>
        <button type="button" onClick={handleNext}>
          Next
        </button>
      </div>
    )}

    {step === 4 && (
      <div>
        <h3>Daily Notes for This Month</h3>
        {dailyNotes.map((note, index) => (
          <div
            key={index}
            style={{ marginBottom: "1rem", borderBottom: "1px solid #ccc" }}
          >
            <strong>{new Date(note.date).toDateString()}</strong>

            <label>Morning Briefing:</label>
            <select
              value={note.morningBriefing}
              onChange={(e) => {
                const updated = [...dailyNotes];
                updated[index].morningBriefing = e.target.value;
                setDailyNotes(updated);
              }}
              required
            >
              <option value="">Select</option>
              <option value="anger management">Anger Management</option>
              <option value="respecting boundaries">Respecting Boundaries</option>
              <option value="self control">Self Control</option>
            </select>

            <label>Work Skill:</label>
            <select
              value={note.workSkill}
              onChange={(e) => {
                const updated = [...dailyNotes];
                updated[index].workSkill = e.target.value;
                setDailyNotes(updated);
              }}
            >
              <option value="">Select</option>
              {hardSkillOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>

            <label>Soft Skill:</label>
            <select
              value={note.softSkill}
              onChange={(e) => {
                const updated = [...dailyNotes];
                updated[index].softSkill = e.target.value;
                setDailyNotes(updated);
              }}
            >
              <option value="">Select</option>
              {softSkillOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>

            <label>Sub Soft Skill:</label>
            <input
              type="text"
              value={note.subSoftSkill}
              onChange={(e) => {
                const updated = [...dailyNotes];
                updated[index].subSoftSkill = e.target.value;
                setDailyNotes(updated);
              }}
            />

            <label>
              <input
                type="checkbox"
                checked={note.isHoliday}
                onChange={(e) => {
                  const updated = [...dailyNotes];
                  updated[index].isHoliday = e.target.checked;
                  setDailyNotes(updated);
                }}
              />
              Is Holiday
            </label>
          </div>
        ))}
        <button type="button" onClick={handleBack}>
          Back
        </button>
        <button type="submit">Confirm & Save</button>
      </div>
    )}
  </form>
    </div>
  );
};

export default Calendaradd;
