# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.






to clearify, sss name is the name of the logged in user and vabari should be the name of the individual, here's code for my profile.jsx to get logged in user import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const Profile = () => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [dob, setDob] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [regionalCenter, setRegionalCenter] = useState("");
  const [profilePic, setProfilePic] = useState("");
  const [userData, setUserData] = useState(null); // Store full user data
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");

    if (token && role) {
      navigate("/profile");
    }

    fetch("http://localhost:5000/api/profile", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        setUserData(data.user); // ✅ Save user data once
      })
      .catch((err) => console.error("⛔ Profile fetch error:", err)); // ✅ Prevent infinite redirects
  }, []); // ✅ Empty dependency array prevents continuous updates

  useEffect(() => {
    const token = localStorage.getItem("token");

    axios
      .get("http://localhost:5000/api/profile", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        const userData = res.data.user;

        setFirstName(userData.firstName);
        setLastName(userData.lastName);
        setEmail(userData.email);
        setPhoneNumber(userData.phoneNumber);
        setCity(userData.city);
        setState(userData.state);
        setRegionalCenter(userData.regionalCenter);
        setProfilePic(userData.profilePic);

        // Convert ISO date format to "yyyy-MM-dd"
        const formattedDOB = userData.dob ? userData.dob.split("T")[0] : "";
        setDob(formattedDOB);
      })
      .catch((err) => console.error(err));
  }, []);

  const handleUpdate = async () => {
    const token = localStorage.getItem("token");

    try {
      const response = await axios.put(
        "http://localhost:5000/api/profile", // ✅ Ensure this matches backend
        {
          firstName,
          lastName,
          city,
          state,
          regionalCenter,
          dob,
          phoneNumber,
          email,
          profilePic,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      console.log("🔄 Server response:", response.data);

      if (response.data.success) {
        alert("✅ Profile Updated!");
      } else {
        alert("❌ Update failed");
      }
    } catch (error) {
      console.error("⛔ Update error:", error.response?.data || error);
    }
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    const formData = new FormData();
    formData.append("profilePic", file);
    formData.append("email", email); // Ensure email is used

    const token = localStorage.getItem("token");

    console.log("📤 Sending file upload request:", formData);

    const response = await axios.post(
      "http://localhost:5000/api/profile",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    console.log("🔄 Server response:", response.data);

    if (response.data.success) {
      setProfilePic(response.data.filePath);
      alert("✅ Profile picture updated!");
    } else {
      alert("❌ Upload failed");
    }
  };

  return (
    <div className="cal-tab">
         <button onClick={() => navigate("/")}>← Back to Home</button>
      <h2>Profile Page</h2>
      <input
        type="text"
        value={firstName}
        onChange={(e) => setFirstName(e.target.value)}
        placeholder="First Name"
      />
      <input
        type="text"
        value={lastName}
        onChange={(e) => setLastName(e.target.value)}
        placeholder="Last Name"
      />
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
      />
      <input
        type="text"
        value={phoneNumber}
        onChange={(e) => setPhoneNumber(e.target.value)}
        placeholder="Phone Number"
      />
      <input
        type="date"
        value={dob}
        onChange={(e) => setDob(e.target.value)}
        placeholder="Date of Birth"
      />
      <input
        type="text"
        value={city}
        onChange={(e) => setCity(e.target.value)}
        placeholder="City"
      />
      <input
        type="text"
        value={state}
        onChange={(e) => setState(e.target.value)}
        placeholder="State"
      />
      <input
        type="text"
        value={regionalCenter}
        onChange={(e) => setRegionalCenter(e.target.value)}
        placeholder="Regional Center"
      />
      <input type="file" onChange={handleFileUpload} />

      <img
        src={
          profilePic
            ? `http://localhost:5000${profilePic}`
            : "/uploads/default-avatar.jpg"
        }
        alt="Profile"
        width="330"
        height="180"
        className="img-prf"
      />

      <button onClick={handleUpdate}>Save Changes</button>

      <button
        onClick={() => {
          localStorage.removeItem("token");
          localStorage.removeItem("role");
          navigate("/");
        }}
      >
        Logout
      </button>

     

    </div>
  );
};

export default Profile;    and my backend is running on port 5000 worksheets upload return the file name 