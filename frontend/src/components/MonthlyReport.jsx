import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const normalize = (str) => str?.toLowerCase().trim();

const MonthlyReport = () => {
  const [reportRows, setReportRows] = useState([]);
  const [individuals, setIndividuals] = useState([]);
  const [selectedIndividual, setSelectedIndividual] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const sss = localStorage.getItem("sss");
  const token = localStorage.getItem("token");

  useEffect(() => {
    const saved = localStorage.getItem("sss");
    if (saved) setSelectedIndividual(saved);
  }, []);

  useEffect(() => {
    if (!token) return;

    const fetchData = async () => {
      setLoading(true);
      setError("");

      try {
        const [calendarRes, worksheetRes] = await Promise.all([
          axios.get("http://localhost:5000/api/calendar/list"),
          axios.get("http://localhost:5000/api/worksheets"),
        ]);

        const calendarEvents = calendarRes.data?.events || [];
        const worksheetEntries = worksheetRes.data?.worksheets || [];

        const uniqueIndividuals = [
          ...new Set(calendarEvents.map((entry) => entry.individual).filter(Boolean)),
        ];
        setIndividuals(uniqueIndividuals);

        if (!selectedIndividual) return;

        const userCalendar = calendarEvents.filter(
          (entry) => normalize(entry.individual) === normalize(selectedIndividual)
        );

        // ✅ FIX: match worksheets by "individual" instead of "createdBy"
        const userWorksheets = worksheetEntries.filter(
          (ws) => normalize(ws.individual) === normalize(selectedIndividual)
        );

        const groupedByMonth = {};

        userCalendar.forEach((entry) => {
          const entryDate = new Date(entry.date);
          if (isNaN(entryDate)) return;

          const month = entryDate.toLocaleString("default", {
            month: "long",
            year: "numeric",
          });

          if (!groupedByMonth[month]) {
            groupedByMonth[month] = {
              workSkills: [],
              softSkills: [],
              createdAt: entry.date,
            };
          }

          groupedByMonth[month].workSkills.push(...(entry.tasksPage1 || []).filter(Boolean));
          groupedByMonth[month].softSkills.push(...(entry.tasksPage2 || []).filter(Boolean));
        });

        // ✅ Updated to match backend's filePath
        const buildFileUrl = (ws) => {
          if (ws.filePath) {
            const safePath = ws.filePath.replace(/\\/g, "/");
            return `http://localhost:5000/${safePath}`;
          }
          return null;
        };

        const rows =
          Object.entries(groupedByMonth).length > 0
            ? Object.entries(groupedByMonth).map(([month, data]) => {
                const allSkills = [...new Set([...data.workSkills, ...data.softSkills])];

                const attachedFiles = userWorksheets
                  .filter((ws) =>
                    allSkills.some(
                      (skill) => normalize(ws.skillType) === normalize(skill)
                    )
                  )
                  .map((ws) => ({
                    name: ws.fileName || `${ws.skillType || "Skill"} Worksheet`,
                    url: buildFileUrl(ws),
                    skill: ws.skillType || "Unknown",
                  }))
                  .filter((f) => f.url);

                return {
                  month,
                  skills: allSkills,
                  createdAt: new Date(data.createdAt).toLocaleDateString(),
                  report: `AI Summary for ${selectedIndividual}: Demonstrated ${allSkills.join(", ")}`,
                  files: attachedFiles,
                };
              })
            : [
                {
                  month: "No calendar data",
                  skills: [],
                  createdAt: "N/A",
                  report: `No calendar entries found for ${selectedIndividual}`,
                  files: userWorksheets
                    .map((ws) => ({
                      name: ws.fileName || `${ws.skillType || "Skill"} Worksheet`,
                      url: buildFileUrl(ws),
                      skill: "Unknown",
                    }))
                    .filter((f) => f.url),
                },
              ];

        setReportRows(rows);
      } catch (err) {
        console.error("❌ Error fetching monthly report:", err);
        setError("Failed to load report");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [selectedIndividual, token]);

  if (!token) {
    return (
      <div className="cal-tab">
        <h2>📋 Monthly Worksheet Report</h2>
        <p>Access denied. Please log in to view this page.</p>
      </div>
    );
  }

  return (
    <div className="cal-tab">
      <button onClick={() => navigate("/")}>← Back to Home</button>
      <h2>📋 Monthly Worksheet Report</h2>

      <label htmlFor="individual-select">Select Individual:</label>
      <select
        id="individual-select"
        value={selectedIndividual}
        onChange={(e) => setSelectedIndividual(e.target.value)}
      >
        <option value="">-- Choose --</option>
        {individuals.map((name, idx) => (
          <option key={idx} value={name}>
            {name}
          </option>
        ))}
      </select>

      {loading && <p>Loading report...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      {selectedIndividual && reportRows.length > 0 ? (
        <>
          {reportRows[0].month === "No calendar data" && (
            <p style={{ color: "gray" }}>
              ⚠️ No calendar entries found. Showing worksheet-only data.
            </p>
          )}
          <table border="1" cellPadding="10" style={{ marginTop: "20px" }}>
            <thead>
              <tr>
                <th>SSS</th>
                <th>Month</th>
                <th>Calendar Created</th>
                <th>Skills Selected</th>
                <th>AI-Generated Report</th>
                <th>Attached Worksheets</th>
                <th>Edit</th>
              </tr>
            </thead>
            <tbody>
              {reportRows.map((row, idx) => (
                <tr key={idx}>
                  <td>{sss || "—"}</td>
                  <td>{row.month}</td>
                  <td>{row.createdAt}</td>
                  <td>{row.skills.length > 0 ? row.skills.join(", ") : "None"}</td>
                  <td>{row.report}</td>
                  <td>
                    {row.files.length > 0 ? (
                      row.files.map((file, i) => (
                        <div key={i}>
                          <a href={file.url} target="_blank" rel="noreferrer">
                            {file.name} ({file.skill})
                          </a>
                        </div>
                      ))
                    ) : (
                      "No files"
                    )}
                  </td>
                  <td>
                    <button
                      onClick={() => {
                        localStorage.setItem("selectedIndividual", selectedIndividual);
                        navigate(`/monthly/reportedit/${encodeURIComponent(row.month)}`);
                      }}
                    >
                      Edit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      ) : selectedIndividual ? (
        <p>No report data available for {selectedIndividual}.</p>
      ) : (
        <p>Please select an individual to view their report.</p>
      )}
    </div>
  );
};

export default MonthlyReport;
