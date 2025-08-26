import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import Navbar from "./Navbar";
import MonthlyCalendar from "./MonthlyCalendar";
import WeeklyCalendar from "./WeeklyCalendar";

const Calendarview = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [dailyNotes, setDailyNotes] = useState([]);
  const [sss, setSss] = useState("");
  const [individual, setIndividual] = useState("");
  const [viewMode, setViewMode] = useState("monthly");

  useEffect(() => {
    const storedSss = localStorage.getItem("sss");
    const storedIndividual = localStorage.getItem("individual");

    if (storedSss) setSss(storedSss);
    if (storedIndividual) setIndividual(storedIndividual);

    fetch(`http://localhost:5000/api/calendar/monthly/${id}`)
      .then((res) => res.json())
      .then(({ dailyNotes }) => setDailyNotes(dailyNotes || []))
      .catch((err) => console.error("❌ Fetch error:", err));
  }, [id]);

  const downloadCalendarPDF = () => {
    const doc = new jsPDF("landscape");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(22);
    doc.setTextColor(30, 144, 255);

    doc.text(`SSS: ${sss}`, 14, 15);
    doc.text(`Individual: ${individual}`, 14, 25);

    doc.setTextColor(0);
    doc.setFontSize(12);

    const headers = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
    const weekStructure = {
      Monday: [],
      Tuesday: [],
      Wednesday: [],
      Thursday: [],
      Friday: [],
    };

    dailyNotes.forEach((note) => {
      const day = new Date(note.date).toLocaleDateString("en-US", {
        weekday: "long",
      });
      if (weekStructure[day]) {
        const summary = note.isHoliday
          ? "Holiday"
          : [
              note.morningBriefing &&
                `Morning Briefing: ${note.morningBriefing}`,
              note.workSkill && `Work Skill: ${note.workSkill}`,
              note.softSkill && `Soft Skill: ${note.softSkill}`,
              note.subSoftSkill && `Sub Soft Skill: ${note.subSoftSkill}`,
            ]
              .filter(Boolean)
              .join("\n");
        weekStructure[day].push(summary);
      }
    });

    const maxRows = Math.max(
      ...Object.values(weekStructure).map((arr) => arr.length)
    );
    const tableData = Array.from({ length: maxRows }, (_, i) =>
      headers.map((day) => weekStructure[day][i] || "")
    );

    autoTable(doc, {
      head: [headers],
      body: tableData,
      theme: "grid",
      startY: 35,
      styles: { fontSize: 12, cellPadding: 5 },
      headStyles: { fillColor: [30, 144, 255], textColor: 255 },
    });

    doc.save("Calendar_View.pdf");
  };

  return (
    <div className="cal-tab">
      <Navbar />
      <button onClick={() => navigate("/calendar/list")}>← Back</button>
      <button onClick={downloadCalendarPDF}>📄 Download Calendar PDF</button>

      <div style={{ margin: "1rem 0" }}>
        <button
          onClick={() => setViewMode("monthly")}
          style={{
            backgroundColor: viewMode === "monthly" ? "#1e90ff" : "#f0f0f0",
            color: viewMode === "monthly" ? "#fff" : "#333",
            border: "1px solid #ccc",
            padding: "0.5rem 1rem",
            marginRight: "0.5rem",
            borderRadius: "5px",
            cursor: "pointer",
            fontWeight: viewMode === "monthly" ? "bold" : "normal",
          }}
        >
          Monthly View
        </button>

        <button
          onClick={() => setViewMode("weekly")}
          style={{
            backgroundColor: viewMode === "weekly" ? "#1e90ff" : "#f0f0f0",
            color: viewMode === "weekly" ? "#fff" : "#333",
            border: "1px solid #ccc",
            padding: "0.5rem 1rem",
            borderRadius: "5px",
            cursor: "pointer",
            fontWeight: viewMode === "weekly" ? "bold" : "normal",
          }}
        >
          Weekly View
        </button>
      </div>

      {viewMode === "monthly" ? (
        <MonthlyCalendar dailyNotes={dailyNotes} />
      ) : (
        <WeeklyCalendar dailyNotes={dailyNotes} />
      )}
    </div>
  );
};

export default Calendarview;
