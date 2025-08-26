import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import jsPDF from "jspdf";

const logoBase64 = "data:image/jpeg;base64...";

const MonthlyReportEdit = () => {
  const { month } = useParams();
  const navigate = useNavigate();
  const selectedIndividual = localStorage.getItem("selectedIndividual");
  const sss = localStorage.getItem("sss");

  const [skills, setSkills] = useState([]);
  const [worksheetsBySkill, setWorksheetsBySkill] = useState({});
  const [aiStatements, setAiStatements] = useState({});
  const [loading, setLoading] = useState(true);
  const [supportPlans, setSupportPlans] = useState({});

  const monthMap = {
    January: "01",
    February: "02",
    March: "03",
    April: "04",
    May: "05",
    June: "06",
    July: "07",
    August: "08",
    September: "09",
    October: "10",
    November: "11",
    December: "12",
  };

  const individualGoals = {
    Reagan: `Reagan is focused on building scalable, user-centric platforms. Their goal is to architect systems that empower users to reflect, grow, and manage data with clarity and reliability.`,
    Nicolas: `Nicolas aims to become a full-stack engineer with a focus on mobile-first design. He’s passionate about creating intuitive interfaces and seamless backend integrations.`,
    Dayo: `Dayo is working toward a career in community-based tech support and education. His goal is to build tools that make digital literacy accessible to everyone.`,
    Bello: `Bello has expressed his future aspiration to secure a position as a state park ranger with Los Angeles County or a professional sports coach. He is also interested in retail work involving inventory, labeling, and product presentation.`,
  };

  const parseMonthString = (monthStr) => {
    const [monthName, year] = monthStr.split(" ");
    const monthNum = monthMap[monthName];
    return `${year}-${monthNum}`;
  };

  const generateAIStatements = async (
    skills,
    individual,
    worksheetsBySkill = {}
  ) => {
    const summaries = {};

    const skillTemplates = {
      communication: [
        `${individual} communicated with purpose and poise.`,
        `${individual} navigated team discussions with clarity and empathy.`,
        `${individual} ensured everyone felt heard during collaborative sessions.`,
      ],
      problemSolving: [
        `${individual} approached challenges with curiosity and persistence.`,
        `${individual} broke down complex problems into manageable parts.`,
        `${individual} collaborated with others to co-create solutions.`,
      ],
      coding: [
        `${individual} wrote clean, maintainable code across multiple modules.`,
        `${individual} debugged tricky issues with methodical precision.`,
        `${individual} applied React and Node concepts to real-world workflows.`,
      ],
      planning: [
        `${individual} organized tasks effectively and met deadlines.`,
        `${individual} demonstrated foresight in project planning.`,
        `${individual} adapted plans based on team feedback and changing needs.`,
      ],
      default: [
        `${individual} showed initiative and consistency in this area.`,
        `${individual} engaged meaningfully with assigned tasks.`,
        `${individual} demonstrated steady growth throughout the month.`,
      ],
    };

    const getTemplates = (skill) => {
      const key = skill.toLowerCase();
      if (key.includes("communicat")) return skillTemplates.communication;
      if (key.includes("problem")) return skillTemplates.problemSolving;
      if (
        key.includes("code") ||
        key.includes("develop") ||
        key.includes("react") ||
        key.includes("node")
      )
        return skillTemplates.coding;
      if (key.includes("plan") || key.includes("organize"))
        return skillTemplates.planning;
      return skillTemplates.default;
    };

    for (const skill of skills) {
      const templates = getTemplates(skill);
      const files = worksheetsBySkill[skill] || [];
      const shuffled = [...templates].sort(() => 0.5 - Math.random());
      const selected = shuffled.slice(0, 5);

      const contextSentence =
        files.length > 0
          ? `This was supported by ${files.length} worksheet${
              files.length > 1 ? "s" : ""
            } submitted under "${skill}".`
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

        const userWorksheets = worksheetEntries.filter(
          (ws) =>
            ws.individual?.toLowerCase() === selectedIndividual.toLowerCase()
        );

        const groupedWorksheets = {};
        selectedSkills.forEach((skill) => {
          groupedWorksheets[skill] = userWorksheets.filter(
            (ws) =>
              ws.skillType?.toLowerCase().trim() === skill.toLowerCase().trim()
          );
        });

        // Load AI statements
        const localKeyStatements = `aiStatements-${selectedIndividual}-${month}`;
        const savedRaw = localStorage.getItem(localKeyStatements);
        let aiData;

        if (savedRaw) {
          const parsed = JSON.parse(savedRaw);
          const isValid =
            parsed &&
            parsed.name === selectedIndividual &&
            typeof parsed.statements === "object";

          aiData = isValid
            ? parsed.statements
            : await generateAIStatements(
                selectedSkills,
                selectedIndividual,
                groupedWorksheets
              );

          if (!isValid) {
            localStorage.setItem(
              localKeyStatements,
              JSON.stringify({ name: selectedIndividual, statements: aiData })
            );
          }
        } else {
          aiData = await generateAIStatements(
            selectedSkills,
            selectedIndividual,
            groupedWorksheets
          );
          localStorage.setItem(
            localKeyStatements,
            JSON.stringify({ name: selectedIndividual, statements: aiData })
          );
        }

        // Load support plans
        const localKeyPlans = `supportPlans-${selectedIndividual}-${month}`;
        const savedPlans = localStorage.getItem(localKeyPlans);
        let planData = {};

        if (savedPlans) {
          planData = JSON.parse(savedPlans);
        } else {
          selectedSkills.forEach((skill) => {
            planData[skill] = generateSupportPlan(skill, selectedIndividual);
          });
          localStorage.setItem(localKeyPlans, JSON.stringify(planData));
        }

        setSkills(selectedSkills);
        setWorksheetsBySkill(groupedWorksheets);
        setAiStatements(aiData);
        setSupportPlans(planData);
      } catch (error) {
        console.error("❌ Error loading report edit data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [month, selectedIndividual]);

  const generateSupportPlan = (skill, individual) => {
    const templates = [
      `${individual} will dedicate 15 days this month to focused development in ${skill}. This will include hands-on practice, guided coaching sessions, and reflection exercises to reinforce learning.`,
      `${individual} will engage in a structured training plan for ${skill}, combining online modules, worksheet reviews, and real-time feedback from a job coach. Progress will be tracked weekly.`,
      `To strengthen ${skill}, ${individual} will participate in daily skill drills, peer collaboration tasks, and scenario-based learning. The coach will introduce new strategies every few days to keep the training dynamic.`,
      `${individual} will receive personalized coaching in ${skill}, supported by interactive tutorials and group discussions. The plan includes journaling reflections and weekly goal-setting to monitor growth.`,
      `Over the next 15 days, ${individual} will work on ${skill} through a mix of practical assignments, video-based learning, and feedback loops. The coach will adjust the plan based on observed progress.`,
      `${individual} will improve ${skill} by completing a series of challenge-based tasks, attending skill-specific workshops, and reviewing performance with the coach. Emphasis will be placed on consistency and adaptability.`,
      `A rotating schedule of activities will help ${individual} build proficiency in ${skill}. This includes worksheet analysis, role-play scenarios, and collaborative exercises with peers.`,
    ];

    const shuffled = templates.sort(() => 0.5 - Math.random());
    return shuffled.slice(0, 2).join(" "); // Combine two random templates for richness
  };

  const exportMonthlyPDF = () => {
    const doc = new jsPDF();
    doc.setFont("helvetica");

    // Logo top-right
    doc.addImage(logoBase64, "JPEG", 150, 10, 40, 20);

    // Title centered
    doc.setFontSize(16);
    doc.setFont(undefined, "bold");
    doc.text(
      "MONTHLY ACTIVITY REPORT",
      doc.internal.pageSize.getWidth() / 2,
      20,
      { align: "center" }
    );

    doc.setFontSize(12);
    doc.setFont(undefined, "normal");

    let y = 35;

    // Header Info
    const monthLabel = decodeURIComponent(month);
    doc.text(`Name: ${selectedIndividual}`, 20, y);
    y += 10;
    doc.text(`SSS Name: ${sss}`, 20, y);
    y += 10;
    doc.text(`Period: ${monthLabel} (01 to 30)`, 20, y);
    y += 16;

    // Section: General Employment Goals
    doc.setFont(undefined, "bold");
    doc.text("General Employment Goals:", 20, y);
    y += 8;
    doc.setFont(undefined, "normal");
    doc.text("• Develop and apply skills across multiple domains.", 25, y);
    y += 8;
    doc.text(
      "• Engage consistently with calendar tasks and worksheets.",
      25,
      y
    );
    y += 14;

    // Section: Special Employment Objectives
    doc.setFont(undefined, "bold");
    doc.text("Special Employment Objectives:", 20, y);
    y += 8;
    doc.setFont(undefined, "normal");
    doc.text(
      "• Focused development in key areas identified by calendar activity.",
      25,
      y
    );
    y += 14;

    // Section: Work Activity Covered
    doc.setFont(undefined, "bold");
    doc.text("Work Activity Covered:", 20, y);
    y += 10;
    doc.setFont(undefined, "normal");

    skills.forEach((skill) => {
      const statement = aiStatements[skill] || "No summary available.";
      const files = worksheetsBySkill[skill] || [];

      // Skill Header
      doc.setFont(undefined, "bold");
      doc.text(`• ${skill}`, 25, y);
      y += 8;
      doc.setFont(undefined, "normal");

      // Wrap long statement
      const wrappedStatement = doc.splitTextToSize(statement, 160);
      wrappedStatement.forEach((line) => {
        doc.text(line, 30, y);
        y += 8;
      });

      // Attached files
      if (files.length > 0) {
        y += 4;
        doc.text("  Attached Worksheets:", 30, y);
        y += 8;
        files.forEach((file) => {
          doc.text(`    - ${file.fileName || "Unnamed File"}`, 35, y);
          y += 8;
          if (y > 270) {
            doc.addPage();
            y = 20;
          }
        });
      }

      y += 12; // Extra space between skill sections

      if (y > 270) {
        doc.addPage();
        y = 20;
      }
    });

    // Section: Training & Support Links
    doc.addPage();
    y = 20;
    doc.setFont(undefined, "bold");
    doc.text("Training & Support Links:", 20, y);
    y += 10;
    doc.setFont(undefined, "normal");
    doc.text("• Security & Safety: https://youtube.com/example1", 25, y);
    y += 8;
    doc.text("• Stocking & Merchandising: https://youtube.com/example2", 25, y);
    y += 8;
    doc.text("• Support & Training: https://youtube.com/example3", 25, y);
    y += 12;

    doc.save(`monthly-report-${selectedIndividual}-${monthLabel}.pdf`);
  };

  if (loading) return <p>Loading report data...</p>;

  if (!selectedIndividual) {
    return (
      <div className="report-edit">
        <h2>Edit Monthly Report: {decodeURIComponent(month)}</h2>
        <p>Please select an individual before editing a report.</p>
      </div>
    );
  }

  const categorizeSkills = (skills) => {
    const workSkills = [];
    const softSkills = [];

    skills.forEach((skill) => {
      const lower = skill.toLowerCase();
      if (
        lower.includes("stock") ||
        lower.includes("clean") ||
        lower.includes("wrap") ||
        lower.includes("split") ||
        lower.includes("faci") ||
        lower.includes("order") ||
        lower.includes("package")
      ) {
        workSkills.push(skill);
      } else {
        softSkills.push(skill);
      }
    });

    return { workSkills, softSkills };
  };

  const { workSkills, softSkills } = categorizeSkills(skills);

  return (
    <div className="cal-tab">
      <button onClick={() => navigate("/monthly/report")}>← Back</button>
      <h2>Edit Monthly Report: {decodeURIComponent(month)}</h2>
      <h3>Individual: {selectedIndividual}</h3>
      <div
        style={{
          marginBottom: "20px",
          padding: "10px",
          background: "#f9f9f9",
          borderRadius: "6px",
          border: "1px solid #ddd",
        }}
      >
        <h4 style={{ color: "#2c3e50" }}>🎯 Individual Goal Statement</h4>
        <p style={{ marginTop: "8px", lineHeight: "1.6" }}>
          {individualGoals[selectedIndividual] ||
            "No goal statement available for this individual."}
        </p>
      </div>
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
              const statement =
                aiStatements[skill] || "No AI summary available.";

              return (
                <tr key={i}>
                  <td>{skill}</td>
                  <td>
                    {files.length > 0 ? (
                      files.map((file, j) => {
                        const fileUrl = `https://elrapido.onrender.com/${file.filePath?.replace(
                          /\\/g,
                          "/"
                        )}`;
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

      <div style={{ marginTop: "30px" }}>
        <h3>📋 Plans to Support Unmet Work Activities and Soft Skills</h3>

        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            marginTop: "10px",
          }}
        >
          <thead>
            <tr>
              <th style={{ background: "#eee", padding: "10px" }}>
                Work Activity
              </th>
              <th style={{ background: "#eee", padding: "10px" }}>
                Support Plan
              </th>
            </tr>
          </thead>
          <tbody>
            {workSkills.map((skill, i) => (
              <tr key={`work-${i}`}>
                <td style={{ padding: "10px", border: "1px solid #ccc" }}>
                  {skill}
                </td>
                <td style={{ padding: "10px", border: "1px solid #ccc" }}>
                  <textarea
                    value={
                      supportPlans[skill] ||
                      generateSupportPlan(skill, selectedIndividual)
                    }
                    onChange={(e) => {
                      setSupportPlans((prev) => ({
                        ...prev,
                        [skill]: e.target.value,
                      }));
                    }}
                    rows={5}
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
            ))}
          </tbody>
        </table>

        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            marginTop: "30px",
          }}
        >
          <thead>
            <tr>
              <th style={{ background: "#eee", padding: "10px" }}>
                Soft Activity
              </th>
              <th style={{ background: "#eee", padding: "10px" }}>
                Support Plan
              </th>
            </tr>
          </thead>
          <tbody>
            {softSkills.map((skill, i) => (
              <tr key={`soft-${i}`}>
                <td style={{ padding: "10px", border: "1px solid #ccc" }}>
                  {skill}
                </td>
                <td style={{ padding: "10px", border: "1px solid #ccc" }}>
                  <textarea
                    value={
                      supportPlans[skill] ||
                      generateSupportPlan(skill, selectedIndividual)
                    }
                    onChange={(e) => {
                      setSupportPlans((prev) => ({
                        ...prev,
                        [skill]: e.target.value,
                      }));
                    }}
                    rows={5}
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
            ))}
          </tbody>
        </table>
      </div>
      <button onClick={exportMonthlyPDF} style={{ marginTop: "20px" }}>
        📄 Export Monthly Report PDF
      </button>
      <button
        onClick={() => {
          const localKeyStatements = `aiStatements-${selectedIndividual}-${month}`;
          const localKeyPlans = `supportPlans-${selectedIndividual}-${month}`;

          // Save AI statements with metadata
          localStorage.setItem(
            localKeyStatements,
            JSON.stringify({
              name: selectedIndividual,
              statements: aiStatements,
            })
          );

          // Save support plans
          localStorage.setItem(localKeyPlans, JSON.stringify(supportPlans));

          alert("✅ All updates saved successfully.");
        }}
        style={{
          marginTop: "10px",
          background: "#007bff",
          color: "#fff",
          padding: "10px 16px",
          border: "none",
          borderRadius: "4px",
          cursor: "pointer",
        }}
      >
        🔄 Update All Inputs
      </button>
    </div>
  );
};

export default MonthlyReportEdit;
