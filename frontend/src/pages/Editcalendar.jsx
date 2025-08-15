import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

const Editcalendar = () => {
  const { id } = useParams();
  const navigate = useNavigate();
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
  const [dailyNotes, setDailyNotes] = useState([]);

  const taskOptions = [
    "Stocking",
    "Facing",
    "Product Wrapping",
    "Splitting",
    "Cleaning",
  ];

  useEffect(() => {
    fetch(`http://localhost:5000/api/calendar/${id}`)
      .then((res) => res.json())
      .then(({ event }) => {
        setFormData({
          ...event,
          date: event.date.split("T")[0], // Trim timestamp
          isHoliday: event.isHoliday ?? false,
        });

        setDailyNotes(event.dailyNotes || []); // 🔥 Load saved dailyNotes
      })
      .catch((err) => console.error("❌ Fetch error:", err));
  }, [id]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({ ...formData, [name]: type === "checkbox" ? checked : value });
  };

  const handleBack = () => setStep((prev) => prev - 1);

  const handleTaskChange = (index, value, page) => {
    const tasks = [...formData[page]];
    tasks[index] = value;
    setFormData({ ...formData, [page]: tasks });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const response = await fetch(
      `http://localhost:5000/api/calendar/edit/${id}`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, dailyNotes }),
      }
    );

    const result = await response.json();
    if (response.ok) {
      alert("✅ Event updated!");
      navigate("/calendar/list");
    } else {
      alert(`❌ ${result.message}`);
    }
  };

  return (
    <div className="cal-tab">
      <button onClick={() => navigate("/calendar/list")}>← Back to list</button>
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

            <button type="button" onClick={() => setStep(2)}>
              Next
            </button>
          </div>
        )}

        {step === 2 && (
          <div>
            <h3>Work Skills</h3>
            {formData.tasksPage1.map((task, index) => (
              <div key={index}>
                <label>Task {index + 1}:</label>
                <select
                  value={task}
                  onChange={(e) =>
                    handleTaskChange(index, e.target.value, "tasksPage1")
                  }
                  required
                >
                  <option value="">Select</option>
                  {taskOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>
            ))}
            <button type="button" onClick={() => setStep(1)}>
              Back
            </button>
            <button type="button" onClick={() => setStep(3)}>
              Next
            </button>
          </div>
        )}

        {step === 3 && (
          <div>
            <h3>Soft Skills</h3>
            {formData.tasksPage2.map((task, index) => (
              <div key={index}>
                <label>Task {index + 6}:</label>
                <select
                  value={task}
                  onChange={(e) =>
                    handleTaskChange(index, e.target.value, "tasksPage2")
                  }
                  required
                >
                  <option value="">Select</option>
                  {taskOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>
            ))}
            <button type="button" onClick={() => setStep(2)}>
              Back
            </button>
            <button type="button" onClick={() => setStep(4)}>
              Next
            </button>
          </div>
        )}

        {step === 4 && (
          <div>
            <h3>Edit Daily Notes for This Month</h3>
            {dailyNotes.map((note, index) => (
              <div
                key={index}
                style={{ marginBottom: "1rem", borderBottom: "1px solid #ccc" }}
              >
                <strong>{new Date(note.date).toDateString()}</strong>

                <label>Morning Briefing:</label>
                <input
                  type="text"
                  value={note.morningBriefing}
                  onChange={(e) => {
                    const updated = [...dailyNotes];
                    updated[index].morningBriefing = e.target.value;
                    setDailyNotes(updated);
                  }}
                />

                <label>Work Skill:</label>
                <input
                  type="text"
                  value={note.workSkill}
                  onChange={(e) => {
                    const updated = [...dailyNotes];
                    updated[index].workSkill = e.target.value;
                    setDailyNotes(updated);
                  }}
                />

                <label>Soft Skill:</label>
                <input
                  type="text"
                  value={note.softSkill}
                  onChange={(e) => {
                    const updated = [...dailyNotes];
                    updated[index].softSkill = e.target.value;
                    setDailyNotes(updated);
                  }}
                />

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
            <button type="submit">Update</button>
          </div>
        )}
      </form>
    </div>
  );
};

export default Editcalendar;
