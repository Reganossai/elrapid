import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

const Resumelist = () => {
  const [resumes, setResumes] = useState([]);
  const navigate = useNavigate();

   const editResume = (id) => {
      navigate(`/resume/edit/${id}`); // ✅ Navigate to the correct edit page
    };

    const deleteResume = async (id) => {
      try {
        const response = await fetch(
          `http://localhost:5000/api/resume/delete/${id}`,
          {
            method: "DELETE",
          }
        );

        if (response.ok) {
          setResumes(resumes.filter((resume) => resume._id !== id)); // ✅ Remove deleted resume from UI
          alert("🗑️ Resume deleted successfully!");
        } else {
          alert("❌ Error deleting resume.");
        }
      } catch (error) {
        console.error("❌ Delete Error:", error);
        alert("🚨 Server error while deleting resume.");
      }
    };


  useEffect(() => {
    fetch("http://localhost:5000/api/resume/list")
      .then((res) => res.json())
      .then((data) => setResumes(data.resumes))
      .catch((err) => console.error("❌ Fetch error:", err));
  }, []);

  const downloadPDF = (resume) => {
    const doc = new jsPDF();

   
    // 🔹 Add Resume Header
    doc.setFont("helvetica", "bold");
    doc.setFontSize(22);
    doc.text(resume.individual, 20, 20);

    doc.setFontSize(12);
    doc.text(resume.email, 20, 30);
    doc.text(resume.phone, 20, 40);
    doc.line(20, 45, 190, 45); // 🔹 Horizontal Line for Separation

    // 🔹 Add Education Section
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.text("Education", 20, 55);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(12);
    doc.text(resume.education, 20, 65);

    // 🔹 Add Experience Section
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.text("Experience", 20, 80);

    doc.setFont("helvetica", "normal");
    let yPosition = 90;
    resume.experience.forEach((exp) => {
      doc.text(
        `${exp.company} | ${exp.role} (${exp.years} years)`,
        20,
        yPosition
      );
      yPosition += 10;
    });

    // 🔹 Add Skills Section
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.text("Skills", 20, yPosition + 10);

    doc.setFont("helvetica", "normal");
    doc.text(resume.skills.join(", "), 20, yPosition + 20);

    // 🔹 Add Certifications Section
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.text("Certifications", 20, yPosition + 35);

    doc.setFont("helvetica", "normal");
    doc.text(resume.certifications.join(", "), 20, yPosition + 45);

    // 🔹 Add Projects Section
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.text("Projects", 20, yPosition + 60);

    doc.setFont("helvetica", "normal");
    doc.text(resume.projects.join(", "), 20, yPosition + 70);

    // 🔹 Add Created By at the Bottom
    doc.setFont("helvetica", "italic");
    doc.text(`Created by: ${resume.createdBy}`, 20, 280);

    doc.save(`${resume.individual}_Resume.pdf`);
  };

  return (
    <div className="cal-tab">
      <button onClick={() => navigate("/")}>← Back to Home</button>
      {/* ✅ PDF Export Button */}
      <table border="1">
        <thead>
          <tr>
            <th>Individual</th>
            <th>Email</th>
            <th>Skills</th>
            <th>Created By</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {resumes.map((resume) => (
            <tr key={resume._id}>
              <td>{resume.individual}</td>
              <td>{resume.email}</td>
              <td>{resume.skills.join(", ")}</td>
              <td>{resume.createdBy}</td>
              <td>
                <button onClick={() => editResume(resume._id)}>✏️ Edit</button>
                <button onClick={() => deleteResume(resume._id)}>
                  🗑️ Delete
                </button>
                <button onClick={() => downloadPDF(resume)}>
                  📄 Download PDF
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Resumelist;
