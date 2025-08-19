import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

const Pcplist = () => {
  const [pcps, setPcps] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetch("http://localhost:5000/api/pcp/list", {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    })
      .then((res) => res.json())
      .then((data) => setPcps(data.pcps))
      .catch((err) => console.error("❌ Fetch error:", err));
  }, []);

  const editPcp = (id) => {
    navigate(`/pcp/edit/${id}`);
  };

  const deletePcp = async (id) => {
    try {
      const response = await fetch(`http://localhost:5000/api/pcp/delete/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (response.ok) {
        setPcps(pcps.filter((pcp) => pcp._id !== id));
        alert("🗑️ PCP deleted successfully!");
      } else {
        alert("❌ Error deleting PCP.");
      }
    } catch (error) {
      console.error("❌ Delete Error:", error);
      alert("🚨 Server error while deleting PCP.");
    }
  };

  const downloadPDF = (pcp) => {
    const doc = new jsPDF();
    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.text(`PCP for ${pcp.individual}`, 20, 20);

    doc.setFontSize(12);
    const fields = [
      ["Vision", pcp.vision],
      ["What Works", pcp.whatWorks],
      ["What Doesn't Work", pcp.whatDoesNotWork],
      ["Strengths", pcp.strengths],
      ["Goals", pcp.goals],
      ["What Matters", pcp.whatMatters],
      ["Important To", pcp.importantTo],
      ["Important For", pcp.importantFor],
      ["Special People", pcp.specialPeople],
      ["Support Preferences", pcp.supportPreferences],
      ["Personality Traits", pcp.personalityTraits],
      ["Interests", pcp.interests],
      ["Communication Style", pcp.communicationStyle],
      ["Decision Making", pcp.decisionMaking],
      ["Dreams", pcp.dreams],
      ["Future Vision", pcp.futureVision],
    ];

    autoTable(doc, {
      startY: 30,
      head: [["Field", "Details"]],
      body: fields,
      styles: { cellPadding: 2, fontSize: 10 },
    });

    doc.setFont("helvetica", "italic");
    doc.text(`Created by: ${pcp.createdBy}`, 20, doc.internal.pageSize.height - 10);

    doc.save(`${pcp.individual}_PCP.pdf`);
  };

  return (
    <div className="cal-tab">
      <button onClick={() => navigate("/")}>← Back to Home</button>
      <h2>Person-Centered Plans</h2>
      <table border="1">
        <thead>
          <tr>
            <th>Individual</th>
            <th>Created By</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {pcps.map((pcp) => (
            <tr key={pcp._id}>
              <td>{pcp.individual}</td>
              <td>{pcp.createdBy}</td>
              <td>
                <button onClick={() => editPcp(pcp._id)}>✏️ Edit</button>
                <button onClick={() => deletePcp(pcp._id)}>🗑️ Delete</button>
                <button onClick={() => downloadPDF(pcp)}>📄 Download PDF</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Pcplist;