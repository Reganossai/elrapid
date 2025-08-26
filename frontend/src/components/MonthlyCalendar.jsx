import React from "react";

const MonthlyCalendar = ({ dailyNotes }) => {
  const weekdays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
  const weekStructure = { Monday: [], Tuesday: [], Wednesday: [], Thursday: [], Friday: [] };

  dailyNotes.forEach((note) => {
    const day = new Date(note.date).toLocaleDateString("en-US", { weekday: "long" });
    if (weekStructure[day]) {
      weekStructure[day].push(note);
    }
  });

  return (
    <div className="calendar-grid">
      {weekdays.map((day) => (
        <div key={day}>
          <h3>{day}</h3>
          {weekStructure[day].map((note, i) => (
            <div key={i} className={`calendar-cell ${note.isHoliday ? "holiday" : ""}`}>
              <strong>{new Date(note.date).toDateString()}</strong>
              {note.isHoliday ? (
                <p>Holiday — No tasks</p>
              ) : (
                <p>
                  {note.morningBriefing && `Morning Briefing: ${note.morningBriefing}`}
                  {note.workSkill && `\nWork Skill: ${note.workSkill}`}
                  {note.softSkill && `\nSoft Skill: ${note.softSkill}`}
                  {note.subSoftSkill && `\nSub Soft Skill: ${note.subSoftSkill}`}
                </p>
              )}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};

export default MonthlyCalendar;