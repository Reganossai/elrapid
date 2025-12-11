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
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  doc.setFont("helvetica");
  doc.setFontSize(11);

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const leftMargin = 15;
  const rightMargin = 15;
  const usableWidth = pageWidth - leftMargin - rightMargin;

  // Logo top-right
  if (logoBase64) {
    try {
      doc.addImage(logoBase64, "JPEG", pageWidth - 55, 10, 40, 18);
    } catch (e) {
      // ignore if logo is invalid
    }
  }

  // Title
  doc.setFontSize(16);
  doc.setFont(undefined, "bold");
  doc.text("MONTHLY ACTIVITY REPORT", pageWidth / 2, 20, { align: "center" });

  doc.setFontSize(11);
  doc.setFont(undefined, "normal");

  let y = 28;

  const monthLabel = decodeURIComponent(month || "");
  doc.text(`Name: ${selectedIndividual || "—"}`, leftMargin, y);
  y += 6;
  doc.text(`SSS Name: ${sss || "—"}`, leftMargin, y);
  y += 6;
  doc.text(`Period: ${monthLabel} (01 to 30)`, leftMargin, y);
  y += 10;

  // Goals (small section)
  doc.setFont(undefined, "bold");
  doc.text("Targeted Employment Goals:", leftMargin, y);
  y += 6;
  doc.setFont(undefined, "normal");
  doc.text(
    "• Develop and apply skills across multiple domains. • Engage consistently with calendar tasks and worksheets.",
    leftMargin + 3,
    y,
    { maxWidth: usableWidth }
  );
  y += 10;

  // ---------- TABLE SETUP ----------
  // Column widths (tuned to sample)
  const col1W = 38; // Skill
  const col2W = usableWidth - col1W - 60; // AI Summary (flex)
  const col3W = 60; // Worksheets

  const col1X = leftMargin;
  const col2X = col1X + col1W;
  const col3X = col2X + col2W;

  const headerHeight = 8;
  const cellLineHeight = 5;
  const cellPadding = 3;

  const safeAddPage = () => {
    doc.addPage();
    y = 20;
  };

  const renderTableHeader = (title) => {
  // Add space ABOVE the section title
  y += 4;

  // Title above table
  doc.setFont(undefined, "bold");
  doc.text(title, leftMargin, y);
  y += 10;  // <<< increased space below title

  // Header background (light gray)
  doc.setFillColor(230, 230, 230);
  doc.rect(col1X - 0.5, y - headerHeight + 1, col1W + col2W + col3W + 1, headerHeight, "F");

  // Header text
  doc.setFont(undefined, "bold");
  doc.setTextColor(0, 0, 0);
  doc.text("Skill", col1X + cellPadding, y - 2);
  doc.text("AI Summary", col2X + cellPadding, y - 2);
  doc.text("Worksheets", col3X + cellPadding, y - 2);
  doc.setFont(undefined, "normal");

  doc.setDrawColor(0, 0, 0);
  doc.rect(col1X - 0.5, y - headerHeight + 1, col1W + col2W + col3W + 1, headerHeight);

  y += 8; // <<< more space before first row starts
};

  // ---------- RENDER MONTHLY ACTIVITY TABLE ----------
  renderTableHeader("Monthly Activity Details:");

  // keep track of table top for outer border (per page segment)
  let tableSegmentTop = y - 6;

  // iterate skills
  for (let si = 0; si < skills.length; si++) {
    const skill = skills[si];
    const ai = (aiStatements && aiStatements[skill]) || "No AI summary available.";
    const files = (worksheetsBySkill && worksheetsBySkill[skill]) || [];
    const fileNames = files.length ? files.map((f) => f.fileName || "Unnamed File").join(", ") : "No files";

    // split text into lines that fit each column
    const skillLines = doc.splitTextToSize(`• ${skill}`, col1W - cellPadding * 2);
    const aiLines = doc.splitTextToSize(ai, col2W - cellPadding * 2);
    const fileLines = doc.splitTextToSize(fileNames, col3W - cellPadding * 2);

    const maxLines = Math.max(skillLines.length, aiLines.length, fileLines.length) || 1;
    const rowHeight = maxLines * cellLineHeight + cellPadding * 2;

    // If not enough room, add page and re-render header
    if (y + rowHeight + 20 > pageHeight) {
      // draw outer border for this segment before page break
      doc.rect(col1X - 0.5, tableSegmentTop, col1W + col2W + col3W + 1, y - tableSegmentTop);
      safeAddPage();
      renderTableHeader("Monthly Activity Details (cont.):");
      tableSegmentTop = y - 6;
    }

    // Draw thin inner cell borders and fill rows with text
    // Skill cell border
    doc.rect(col1X - 0.5, y - 2, col1W, rowHeight);
    // AI cell
    doc.rect(col2X - 0.5, y - 2, col2W, rowHeight);
    // Files cell
    doc.rect(col3X - 0.5, y - 2, col3W + 1, rowHeight);

    // Print text vertically aligned top + padding
    for (let i = 0; i < maxLines; i++) {
      const lineY = y + cellPadding + i * cellLineHeight;
      doc.text(skillLines[i] || "", col1X + cellPadding, lineY);
      doc.text(aiLines[i] || "", col2X + cellPadding, lineY, { maxWidth: col2W - cellPadding * 2 });
      doc.text(fileLines[i] || "", col3X + cellPadding, lineY, { maxWidth: col3W - cellPadding * 2 });
    }

    y += rowHeight + 2;
  }

  // Outer border for final segment
  doc.rect(col1X - 0.5, tableSegmentTop, col1W + col2W + col3W + 1, y - tableSegmentTop);
  y += 8;

  // ---------- RENDER SUPPORT PLANS TABLE (separate, bordered) ----------
  // We'll render as two separate sections (Work then Soft) in the same styled boxed table.
  const { workSkills, softSkills } = categorizeSkills(skills);

  const renderPlanTable = (title, items) => {
    if (!items || items.length === 0) return;
    if (y + 60 > pageHeight) {
      doc.addPage();
      y = 20;
    }

    doc.setFont(undefined, "bold");
    doc.text(title, leftMargin, y);
    y += 8;
    doc.setFont(undefined, "normal");

    const pCol1W = 55;
    const pCol2W = usableWidth - pCol1W;

    const pCol1X = leftMargin;
    const pCol2X = pCol1X + pCol1W;

    // header background
    doc.setFillColor(230, 230, 230);
    doc.rect(pCol1X - 0.5, y - 7, pCol1W + pCol2W + 1, headerHeight, "F");

    // header text
    doc.setFont(undefined, "bold");
    doc.text("Activity", pCol1X + 3, y - 3);
    doc.text("Support Plan", pCol2X + 3, y - 3);
    doc.setFont(undefined, "normal");
    doc.rect(pCol1X - 0.5, y - 7, pCol1W + pCol2W + 1, headerHeight);
    y += 6;

    const segmentTop = y - 6;
    let segmentBottom = y;

    for (let i = 0; i < items.length; i++) {
      const skill = items[i];
      const plan = supportPlans[skill] || generateSupportPlan(skill, selectedIndividual) || "No plan available.";
      const activityLines = doc.splitTextToSize(`• ${skill}`, pCol1W - 6);
      const planLines = doc.splitTextToSize(plan, pCol2W - 6);
      const maxL = Math.max(activityLines.length, planLines.length);
      const rowH = maxL * cellLineHeight + cellPadding * 2;

      if (y + rowH + 20 > pageHeight) {
        // close outer border for this table segment
        doc.rect(pCol1X - 0.5, segmentTop, pCol1W + pCol2W + 1, segmentBottom - segmentTop);
        doc.addPage();
        y = 20;

        // re-render header on new page
        doc.setFillColor(230, 230, 230);
        doc.rect(pCol1X - 0.5, y - 7, pCol1W + pCol2W + 1, headerHeight, "F");
        doc.setFont(undefined, "bold");
        doc.text("Activity", pCol1X + 3, y - 3);
        doc.text("Support Plan", pCol2X + 3, y - 3);
        doc.setFont(undefined, "normal");
        doc.rect(pCol1X - 0.5, y - 7, pCol1W + pCol2W + 1, headerHeight);
        y += 6;
        segmentBottom = y;
      }

      // draw row border
      doc.rect(pCol1X - 0.5, y - 2, pCol1W, rowH);
      doc.rect(pCol2X - 0.5, y - 2, pCol2W + 1, rowH);

      // print lines
      for (let li = 0; li < maxL; li++) {
        const lineY = y + cellPadding + li * cellLineHeight;
        doc.text(activityLines[li] || "", pCol1X + 3, lineY);
        doc.text(planLines[li] || "", pCol2X + 3, lineY, { maxWidth: pCol2W - 6 });
      }

      y += rowH + 4;
      segmentBottom = y;
    }

    // draw outer border for this plan table segment
    doc.rect(pCol1X - 0.5, segmentTop, pCol1W + pCol2W + 1, segmentBottom - segmentTop);
    y += 8;
  };

  // render work then soft
  renderPlanTable("Plans to Support Unmet Work Activities:", workSkills);
  renderPlanTable("Plans to Support Unmet Soft Skills:", softSkills);

  // ---------- TRAINING LINKS ----------

  if (y + 60 > pageHeight) {
    doc.addPage();
    y = 20;
  } else {
    y += 4;
  }

  doc.setFont(undefined, "bold");
  doc.text("Training & Support Links:", leftMargin, y);
  y += 8;
  doc.setFont(undefined, "normal");
  doc.text("• Security & Safety: https://youtube.com/example1", leftMargin + 5, y);
  y += 6;
  doc.text("• Stocking & Merchandising: https://youtube.com/example2", leftMargin + 5, y);
  y += 6;
  doc.text("• Support & Training: https://youtube.com/example3", leftMargin + 5, y);

  // final save
  doc.save(`monthly-report-${selectedIndividual || "person"}-${monthLabel || "period"}.pdf`);
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
