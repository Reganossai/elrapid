import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

const MonthlyReportEdit = () => {
  const { month } = useParams();
  const navigate = useNavigate();
  const selectedIndividual = localStorage.getItem("selectedIndividual");

  const [skills, setSkills] = useState([]);
  const [worksheetsBySkill, setWorksheetsBySkill] = useState({});
  const [aiStatements, setAiStatements] = useState({});
  const [loading, setLoading] = useState(true);

  const monthMap = {
    January: "01", February: "02", March: "03", April: "04", May: "05", June: "06",
    July: "07", August: "08", September: "09", October: "10", November: "11", December: "12",
  };

  const parseMonthString = (monthStr) => {
    const [monthName, year] = monthStr.split(" ");
    const monthNum = monthMap[monthName];
    return `${year}-${monthNum}`;
  };

  const generateAIStatements = async (skills, individual, worksheetsBySkill = {}) => {
    const summaries = {};

    const skillTemplates = {
      communication: [],
      problemSolving: [],
      coding: [],
      planning: [],
      default: [],
    };

    const getTemplates = (skill) => {
      const key = skill.toLowerCase();
      if (key.includes("communicat")) return skillTemplates.communication;
      if (key.includes("problem")) return skillTemplates.problemSolving;
      if (key.includes("code") || key.includes("develop") || key.includes("react") || key.includes("node")) return skillTemplates.coding;
      if (key.includes("plan") || key.includes("organize")) return skillTemplates.planning;
      return skillTemplates.default;
    };

    for (const skill of skills) {
      const templates = getTemplates(skill);
      const files = worksheetsBySkill[skill] || [];
      const shuffled = [...templates].sort(() => 0.5 - Math.random());
      const selected = shuffled.slice(0, 5);

      const contextSentence = files.length > 0
        ? `This was supported by ${files.length} worksheet${files.length > 1 ? "s" : ""} submitted under "${skill}".`
        : `No worksheets were submitted for "${skill}", but calendar activity indicates meaningful engagement.`;

      selected.push(contextSentence);
      summaries[skill] = selected.join(" ");
    }
    return summaries;
  };

  useEffect(() => {
    const fetchData = async () => {
      if (!selectedIndividual) {
        console.warn("No individual selected.");
        setLoading(false);
        return;
      }

      try {
        const [calendarRes, worksheetRes] = await Promise.all([
          axios.get("http://localhost:5000/api/calendar/list"),
          axios.get("http://localhost:5000/api/worksheets"),
        ]);

        const calendarEvents = calendarRes.data?.events || [];
        const worksheetEntries = worksheetRes.data?.worksheets || [];

        const userCalendar = calendarEvents.filter(
          (entry) =>
            entry.individual?.toLowerCase() === selectedIndividual.toLowerCase()
        );

        const targetMonth = parseMonthString(decodeURIComponent(month));

        const matchedEntries = userCalendar.filter((entry) => {
          const entryMonth = new Date(entry.date).toISOString().slice(0, 7);
          return entryMonth === targetMonth;
        });

        const selectedSkills = [
          ...new Set(
            matchedEntries.flatMap((entry) => [
              ...(entry.tasksPage1 || []),
              ...(entry.tasksPage2 || []),
            ])
          ),
        ];

        // ✅ FIX: Match worksheets by `individual` instead of `createdBy`
        const userWorksheets = worksheetEntries.filter(
          (ws) =>
            ws.individual?.toLowerCase() === selectedIndividual.toLowerCase()
        );

        // ✅ Group worksheets by skillType
        const groupedWorksheets = {};
        selectedSkills.forEach((skill) => {
          groupedWorksheets[skill] = userWorksheets.filter(
            (ws) =>
              ws.skillType?.toLowerCase().trim() === skill.toLowerCase().trim()
          );
        });

        const localKey = `aiStatements-${selectedIndividual}-${month}`;
        const savedStatements = localStorage.getItem(localKey);

        const aiData = savedStatements
          ? JSON.parse(savedStatements)
          : await generateAIStatements(selectedSkills, selectedIndividual, groupedWorksheets);

        setSkills(selectedSkills);
        setWorksheetsBySkill(groupedWorksheets);
        setAiStatements(aiData);

      } catch (error) {
        console.error("❌ Error loading report edit data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [month, selectedIndividual]);

  if (loading) return <p>Loading report data...</p>;

  if (!selectedIndividual) {
    return (
      <div className="report-edit">
        <h2>Edit Monthly Report: {decodeURIComponent(month)}</h2>
        <p>Please select an individual before editing a report.</p>
      </div>
    );
  }

  return (
    <div className="cal-tab">
      <button onClick={() => navigate("/monthly/report")}>← Back</button>
      <h2>Edit Monthly Report: {decodeURIComponent(month)}</h2>
      <h3>Individual: {selectedIndividual}</h3>

      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th>Skill</th>
            <th>Attached Worksheets</th>
            <th>AI-Generated Statements</th>
          </tr>
        </thead>
        <tbody>
          {skills.length === 0 ? (
            <tr>
              <td colSpan={3} style={{ textAlign: "center", padding: "1rem" }}>
                No skills found for <strong>{selectedIndividual}</strong> in{" "}
                <strong>{decodeURIComponent(month)}</strong>.
              </td>
            </tr>
          ) : (
            skills.map((skill, i) => {
              const files = worksheetsBySkill[skill] || [];
              const statement = aiStatements[skill] || "No AI summary available.";

              return (
                <tr key={i}>
                  <td>{skill}</td>
                  <td>
                    {files.length > 0 ? (
                      files.map((file, j) => {
                        const fileUrl = `http://localhost:5000/${file.filePath?.replace(/\\/g, "/")}`;
                        return (
                          <a
                            key={j}
                            href={fileUrl}
                            target="_blank"
                            rel="noreferrer"
                            style={{ display: "block" }}
                          >
                            {file.fileName || "Unnamed File"}
                          </a>
                        );
                      })
                    ) : (
                      <em>No files</em>
                    )}
                  </td>
                  <td>
                    <textarea
                      value={statement}
                      onChange={(e) => {
                        const updated = {
                          ...aiStatements,
                          [skill]: e.target.value,
                        };
                        setAiStatements(updated);
                        const localKey = `aiStatements-${selectedIndividual}-${month}`;
                        localStorage.setItem(localKey, JSON.stringify(updated));
                      }}
                      rows={6}
                      style={{
                        width: "100%",
                        resize: "vertical",
                        fontFamily: "inherit",
                        fontSize: "0.9rem",
                        padding: "8px",
                        border: "1px solid #ccc",
                        borderRadius: "4px",
                      }}
                    />
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
};

export default MonthlyReportEdit;
