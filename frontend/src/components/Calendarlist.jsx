import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const Calendarlist = () => {
  const [events, setEvents] = useState([]);
  const [sss, setSss] = useState("");
  const [individual, setIndividual] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
  fetch("http://localhost:5000/api/calendar/list")
    .then((res) => res.json())
    .then((data) => {

      setEvents(data.events || []);

      if (data.events.length > 0) {
        const sssValue = data.events[0].signedInUser; 
        const individualValue = data.events[0].individual; 
        setSss(sssValue);
        setIndividual(individualValue)
        localStorage.setItem("sss", sssValue); 
        localStorage.setItem("individual", individualValue); 
      }
    })
    .catch((err) => console.error("❌ Fetch error:", err));
}, []);

  const deleteEvent = async (id) => {
    await fetch(`http://localhost:5000/api/calendar/delete/${id}`, {
      method: "DELETE",
    });
    setEvents(events.filter((event) => event._id !== id));
  };

  const editEvent = (id) => {
    window.location.href = `/calendar/edit/${id}`;
  };

 const viewCalendar = (id) => {
  const selectedEvent = events.find((event) => event._id === id);

  if (selectedEvent) {
    localStorage.setItem("sss", selectedEvent.signedInUser);
    localStorage.setItem("individual", selectedEvent.individual);

    navigate(`/calendar/view/${id}`);
  }
};

  return (
    <div className="cal-tab">
      <button onClick={() => navigate("/")}>← Back to Home</button>
      <table border="1">
        <thead>
          <tr>
            <th>Date</th>
            <th>SSS</th>
            <th>Selected Individual</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {events.map((event) => (
            <tr key={event._id}>
              <td>{new Date(event.date).toLocaleDateString()}</td>
              <td>{event.signedInUser}</td>
              <td>{event.individual}</td>
              <td>
                <button onClick={() => editEvent(event._id)}>✏️ Edit</button>
                <button onClick={() => deleteEvent(event._id)}>
                  🗑️ Delete
                </button>
                <button onClick={() => viewCalendar(event._id)}>
                  📅 View Calendar
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Calendarlist;
