import React, { useState } from "react";

const WeeklyCalendar = ({ dailyNotes }) => {
  const [weekIndex, setWeekIndex] = useState(0);

  const weeks = [];
  let currentWeek = [];

  dailyNotes.forEach((note) => {
    const day = new Date(note.date).getDay();
    if (day === 1 && currentWeek.length) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
    currentWeek.push(note);
  });
  if (currentWeek.length) weeks.push(currentWeek);

  const currentNotes = weeks[weekIndex] || [];

  return (
  <div className="calendar-wrapper">
    <div style={{ marginBottom: "1rem" }}>
      <button disabled={weekIndex === 0} onClick={() => setWeekIndex(weekIndex - 1)}>
        ← Previous Week
      </button>
      <button disabled={weekIndex === weeks.length - 1} onClick={() => setWeekIndex(weekIndex + 1)}>
        Next Week →
      </button>
    </div>

    <div className="calendar-grid">
      {currentNotes.map((note, index) => (
        <div key={index} className={`calendar-cell ${note.isHoliday ? "holiday" : ""}`}>
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
                <span className="note-label label-work">Work Skill: {note.workSkill}</span>
              )}
              {note.softSkill && (
                <span className="note-label label-soft">Soft Skill: {note.softSkill}</span>
              )}
              {note.subSoftSkill && (
                <span className="note-label label-subsoft">Sub Skill: {note.subSoftSkill}</span>
              )}
            </>
          )}
        </div>
      ))}
    </div>
  </div>
);

};

export default WeeklyCalendar;