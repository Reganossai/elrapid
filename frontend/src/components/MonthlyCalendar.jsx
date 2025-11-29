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
  <div className="calendar-wrapper">
    <div className="calendar-grid">
      {weekdays.map((day) => (
        <div key={day}>
          <h3 style={{ marginBottom: "10px" }}>{day}</h3>

          {weekStructure[day].length === 0 ? (
            <div className="calendar-cell">
              <strong>No Entry</strong>
            </div>
          ) : (
            weekStructure[day].map((note, i) => (
              <div key={i} className={`calendar-cell ${note.isHoliday ? "holiday" : ""}`}>
                <strong>{new Date(note.date).toDateString()}</strong>

                {note.isHoliday ? (
                  <p>Holiday — No tasks</p>
                ) : (
                  <>
                    {note.morningBriefing && (
                      <span className="note-label label-morning">
                        Morning Briefing: {note.morningBriefing}
                      </span>
                    )}
                    {note.workSkill && (
                      <span className="note-label label-work">
                        Work Skill: {note.workSkill}
                      </span>
                    )}
                    {note.softSkill && (
                      <span className="note-label label-soft">
                        Soft Skill: {note.softSkill}
                      </span>
                    )}
                    {note.subSoftSkill && (
                      <span className="note-label label-subsoft">
                        Sub Skill: {note.subSoftSkill}
                      </span>
                    )}
                  </>
                )}
              </div>
            ))
          )}
        </div>
      ))}
    </div>
  </div>
);

};

export default MonthlyCalendar;