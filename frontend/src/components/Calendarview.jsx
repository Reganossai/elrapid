import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import Navbar from "./Navbar";

const Calendarview = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [dailyNotes, setDailyNotes] = useState([]);
  const [sss, setSss] = useState(""); // ✅ Define state for SSS
  const [individual, setIndividual] = useState(""); // ✅ Define state for Individual

  useEffect(() => {
    const storedSss = localStorage.getItem("sss");
    const storedIndividual = localStorage.getItem("individual");

    if (storedSss) setSss(storedSss);
    if (storedIndividual) setIndividual(storedIndividual);

    fetch(`http://localhost:5000/api/calendar/monthly/${id}`)
      .then((res) => res.json())
      .then(({ dailyNotes }) => {
        setDailyNotes(dailyNotes || []);
        console.log("LocalStorage SSS:", localStorage.getItem("sss"));
        console.log(
          "LocalStorage Individual:",
          localStorage.getItem("individual")
        );
      })
      .catch((err) => console.error("❌ Fetch error:", err));
  }, [id]);

  const downloadCalendarPDF = (dailyNotes, storedSss, storedIndividual) => {
    const doc = new jsPDF("landscape");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(22); // ✅ Larger font for better readability
    doc.setTextColor(30, 144, 255); // ✅ Set header color (Dodger Blue)

    doc.text(`SSS: ${storedSss}`, 14, 15);
    doc.text(`Individual: ${storedIndividual}`, 14, 25);

    doc.setTextColor(0); // ✅ Reset color for regular text
    doc.setFontSize(12); // ✅ Standard text size

    const headers = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
    let tableData = [];

    const weekStructure = {
      Monday: [],
      Tuesday: [],
      Wednesday: [],
      Thursday: [],
      Friday: [],
    };

    dailyNotes.forEach((note) => {
      const taskSummary = note.isHoliday
        ? "Holiday"
        : [
            note.morningBriefing
              ? `Morning Briefing: ${note.morningBriefing}`
              : "",
            note.workSkill ? `Work Skill: ${note.workSkill}` : "",
            note.softSkill ? `Soft Skill: ${note.softSkill}` : "",
            note.subSoftSkill ? `Sub Soft Skill: ${note.subSoftSkill}` : "",
          ]
            .filter(Boolean)
            .join("\n");

      const weekdayIndex = new Date(note.date).getDay();
      const weekdays = [
        "Sunday",
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
      ];

      if (weekdays[weekdayIndex] in weekStructure) {
        weekStructure[weekdays[weekdayIndex]].push(taskSummary);
      }
    });

    const maxRows = Math.max(
      ...Object.values(weekStructure).map((arr) => arr.length)
    );
    for (let i = 0; i < maxRows; i++) {
      tableData.push([
        weekStructure.Monday[i] || "",
        weekStructure.Tuesday[i] || "",
        weekStructure.Wednesday[i] || "",
        weekStructure.Thursday[i] || "",
        weekStructure.Friday[i] || "",
      ]);
    }

    autoTable(doc, {
      head: [headers],
      body: tableData,
      theme: "grid", // ✅ Adds table styling
      startY: 35, // ✅ Adjusts position below header
      styles: { fontSize: 12, cellPadding: 5, lineWidth: 0.5 }, // ✅ Adds borders
      headStyles: { fillColor: [30, 144, 255], textColor: 255 }, // ✅ Adds color to headers
    });

    doc.save("Calendar_View.pdf");
  };
  return (
    <div>
      <Navbar />
      <button onClick={() => navigate("/calendar/list")}>← Back</button>
      <button onClick={() => downloadCalendarPDF(dailyNotes, sss, individual)}>
        📄 Download Calendar PDF
      </button>

      {/* Weekday Headers */}
      <div className="calendar-header">
        <div>Monday</div>
        <div>Tuesday</div>
        <div>Wednesday</div>
        <div>Thursday</div>
        <div>Friday</div>
      </div>

      {/* Dynamic Grid Layout */}
      <div className="calendar-grid">
        {dailyNotes.map((note, index) => (
          <div
            key={index}
            className={`calendar-cell ${note.isHoliday ? "holiday" : ""}`}
          >
            <strong>{new Date(note.date).toDateString()}</strong>

            {note.isHoliday ? (
              <p>Holiday — No tasks</p>
            ) : (
              <p>
                {note.morningBriefing &&
                  `Morning Briefing: ${note.morningBriefing}`}
                {note.workSkill && `\nWork Skill: ${note.workSkill}`}
                {note.softSkill && `\nSoft Skill: ${note.softSkill}`}
                {note.subSoftSkill && `\nSub Soft Skill: ${note.subSoftSkill}`}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Calendarview;
