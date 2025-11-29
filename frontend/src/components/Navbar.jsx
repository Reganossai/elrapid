import React, { useState, useEffect } from "react";
import { Link, NavLink } from "react-router-dom";
import axios from "axios";
import logo from "../assets/logo.jpg";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min";
import { Popover } from "bootstrap";
import { TfiMenuAlt } from "react-icons/tfi";
import { HiMiniXMark } from "react-icons/hi2";
import { TbHomeFilled } from "react-icons/tb";
import { FaUsers } from "react-icons/fa6";
import { TbFileCv } from "react-icons/tb";
import { IoChatbox } from "react-icons/io5";
import { TbChartPieFilled } from "react-icons/tb";
import { GoLog } from "react-icons/go";
import { FaCalendarCheck } from "react-icons/fa6";
import { TbDeviceWatchUp } from "react-icons/tb";
import { VscSettings } from "react-icons/vsc";
import { FaFileLines } from "react-icons/fa6";
import { BsFillCalendar2DateFill } from "react-icons/bs";
import { MdGridView } from "react-icons/md";
import { TbLockSquare } from "react-icons/tb";


const Navbar = () => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [dob, setDob] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [regionalCenter, setRegionalCenter] = useState("");
  const [profilePic, setProfilePic] = useState("");
  const [nav, setNav] = useState(false);
  const [expanded, setExpanded] = useState({
    dashboard: false,
    individuals: false,
    resumes: false,
    drill: false,
    pcp: false,
    isp: false,
    monthly: false,
    progress: false,
    assesment: false,
    worksheets: false,
    calendars: false,
    forms: false,
    authentication: false,
  });

  const toggleExpand = (section) => {
    setExpanded((prev) => ({ ...prev, [section]: !prev[section] }));
  };

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

  useEffect(() => {
    const popoverTrigger = document.getElementById("profilePopover");

    if (popoverTrigger) {
      const popoverContent = `
      <div class="popover-content">
        <ul class="list-group">
          <li class="list-group-item">
            <a href="/profile">Profile</a>
          </li> 
        </ul>
      </div>
    `;

      const popover = new Popover(popoverTrigger, {
        content: popoverContent,
        html: true,
      });

      document.addEventListener("click", (event) => {
        if (event.target.id === "logoutBtn") {
          localStorage.removeItem("token");
          window.location.href = "/login"; // Redirect to login page
        }
      });
    }
  }, []);

  const handleNav = () => {
    setNav(!nav);
  };

  nav
    ? (document.body.style.overflowX = "hidden")
    : (document.body.style.overflow = "auto");
  return (
    <nav className="navbar sticky-top ">
      <Link className="elrapido-div" to="/">
        <img src={logo} className="logo" alt="logo" />
        <h2 className="elrapido">OVO</h2>
      </Link>
      <div className="profile-nav">
        <Link to="/profile">
          <img
            src={
              profilePic
                ? `http://localhost:5000${profilePic}`
                : "/uploads/default-avatar.jpg"
            }
            alt="Profile"
            width="60"
            height="50"
            className="image-nav"
          />
        </Link>
      </div>

      <div onClick={handleNav} className="zaracho">
        {nav ? <HiMiniXMark /> : <TfiMenuAlt />}
      </div>

      {nav ? (
        <div id="navbarSupportedContentMobile">
          <div className="sidebar-nav">
            <h1 className="module-head">HOME</h1>
            <button
              className="sidebar-toggle"
              onClick={() => toggleExpand("dashboard")}
            >
              <span>
                <TbHomeFilled className="icons" />
              </span>{" "}
              Dashboard {expanded.dashboard ? "▲" : "▼"}
            </button>
            {expanded.dashboard && (
              <div className="dropdown">
                <NavLink to="/" className="sidebar-link">
                  • Home
                </NavLink>
              </div>
            )}

            <button
              className="sidebar-toggle"
              onClick={() => toggleExpand("pcp")}
            >
              <span>
                <FaCalendarCheck className="icons" />
              </span>
              Pcp {expanded.pcp ? "▲" : "▼"}
            </button>
            {expanded.pcp && (
              <div className="dropdown">
                <NavLink to="/pcp/add" className="sidebar-link">
                  • Add
                </NavLink>

                <NavLink to="/pcp/list" className="sidebar-link">
                  • List
                </NavLink>
              </div>
            )}

            <button
              className="sidebar-toggle"
              onClick={() => toggleExpand("twomindrill")}
            >
              <span>
                <FaCalendarCheck className="icons" />
              </span>
              2mins drill {expanded.twomindrill ? "▲" : "▼"}
            </button>
            {expanded.twomindrill && (
              <div className="dropdown">
                <NavLink to="/2mindrill/add" className="sidebar-link">
                  • Add
                </NavLink>

                <NavLink to="/2mindrill/list" className="sidebar-link">
                  • List
                </NavLink>
              </div>
            )}

            <h1 className="module-head">MAIN</h1>
            <button
              className="sidebar-toggle"
              onClick={() => toggleExpand("resumes")}
            >
              <span>
                <TbFileCv className="icons" />
              </span>
              Resumes {expanded.resumes ? "▲" : "▼"}
            </button>
            {expanded.resumes && (
              <div className="dropdown">
                <NavLink to="/resume/list" className="sidebar-link">
                  • List
                </NavLink>
                <NavLink to="/resume/add" className="sidebar-link">
                  ➕ Add
                </NavLink>
              </div>
            )}

            <h1 className="module-head">WORKSHEET</h1>
            <button
              className="sidebar-toggle"
              onClick={() => toggleExpand("worksheets")}
            >
              <span>
                <FaFileLines className="icons" />
              </span>
              Worksheets {expanded.worksheets ? "▲" : "▼"}
            </button>
            {expanded.worksheets && (
              <div className="dropdown">
                <NavLink to="/worksheets/list" className="sidebar-link">
                  • List
                </NavLink>
                <NavLink to="/worksheets/add" className="sidebar-link">
                  ➕ Add
                </NavLink>
              </div>
            )}

            <h1 className="module-head">CALENDARS</h1>
            <button
              className="sidebar-toggle"
              onClick={() => toggleExpand("calendars")}
            >
              <span>
                <BsFillCalendar2DateFill className="icons" />
              </span>{" "}
              Calendars {expanded.calendars ? "▲" : "▼"}
            </button>
            {expanded.calendars && (
              <div className="dropdown">
                <NavLink to="/calendar/list" className="sidebar-link">
                  • List
                </NavLink>
                <NavLink to="/calendar/add" className="sidebar-link">
                  ➕ Add
                </NavLink>
              </div>
            )}

            <h1 className="module-head">SECURITY</h1>
            <button className="sidebar-toggle">
              <span>
                <TbLockSquare className="icons" />
              </span>{" "}
              <Link to="/profile">Authentication</Link>
            </button>

            <h1 className="module-head">MAR</h1>
            <button className="sidebar-toggle">
              <span>
                <TbLockSquare className="icons" />
              </span>{" "}
              <Link to="/monthly/report">Monthly report</Link>
            </button>

            
          </div>
        </div>
      ) : null}
    </nav>
  );
};

export default Navbar;
