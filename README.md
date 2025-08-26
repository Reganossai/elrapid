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



const logoBase64 = "data:image/jpeg;base64,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";