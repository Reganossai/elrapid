import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import logo from "../assets/logo.svg";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  // Check if the user is already logged in
  useEffect(() => {
    const token =
      localStorage.getItem("token") || sessionStorage.getItem("token");
    const role = localStorage.getItem("role") || sessionStorage.getItem("role");

    if (token && role) {
      navigate(role === "admin" ? "/admin-dashboard" : "/user-dashboard");
    }
  }, []);

  // Handle login request
  const handleLogin = async (event) => {
    event.preventDefault();
    setIsLoading(true); // Start loading
    setError(""); // Clear previous errors

    try {
      const response = await axios.post("http://localhost:5000/api/login", {
        email,
        password,
      });

      console.log("🔄 Server response:", response.data);

      if (response.data.success) {
        localStorage.setItem("token", response.data.token);
        localStorage.setItem("role", response.data.role);
        localStorage.setItem("firstname", response.data.firstname);
        localStorage.setItem("lastname", response.data.lastname);

        alert("✅ Login Successful!");
        navigate(
          response.data.role === "admin"
            ? "/admin-dashboard"
            : "/user-dashboard"
        );
      } else {
        setError(response.data.message);
      }
    } catch (error) {
      console.error("❌ Login error:", error);
      setError("❌ Invalid credentials!");
    } finally {
      setIsLoading(false); // End loading
    }
  };

  return (
    <div className="login-div">
      <form onSubmit={handleLogin}>
        <div className="elrapido-div">
          <img src={logo} className="logo" alt="logo" />
          <h2 className="elrapido">Elrapido</h2>
        </div>
        <h1>Welcome to Elrapido</h1>
        <p>Please sign into your account</p>

        <label className="lal">Email</label>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <label className="lal">Password</label>
        <div className="laloo" style={{ position: "relative" }}>
          <input
            type={isPasswordVisible ? "text" : "password"}
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button
            type="button"
            onClick={() => setIsPasswordVisible(!isPasswordVisible)}
            style={{
              position: "absolute",
              right: "10px",
              top: "40%",
              transform: "translateY(-50%)",
              background: "transparent",
              border: "none",
              cursor: "pointer",
              width: "50px",
            }}
          >
            {isPasswordVisible ? "👁️" : "🙈"}
          </button>
        </div>

        <div style={{ display: "flex", alignItems: "center" }}>
          <input
            type="checkbox"
            checked={rememberMe}
            onChange={() => setRememberMe(!rememberMe)}
          />
          <label className="remem">Remember Me</label>
        </div>

        <button className="butttt" type="submit" disabled={isLoading}>
          {isLoading ? "Logging in..." : "Login"}
        </button>
      </form>
      {error && <p style={{ color: "red" }}>{error}</p>}
    </div>
  );
};

export default Login;
