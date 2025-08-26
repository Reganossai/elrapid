import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import { TbHomeFilled } from "react-icons/tb";
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

const Sidebar = () => {
  const [expanded, setExpanded] = useState({
    dashboard: false,
    individuals: false,
    resumes: false,
    drill: false,
    pcp: false,
    isp: false,
    monthly: false,
    twomindrill:false,
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

  return (
    <div className="sidebar">
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

      
      <button className="sidebar-toggle" onClick={() => toggleExpand("pcp")}>
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


      <button className="sidebar-toggle" onClick={() => toggleExpand("twomindrill")}>
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

 
      {/* <h1 className="module-head">USERS</h1>
      <button
        className="sidebar-toggle"
        onClick={() => toggleExpand("individuals")}
      >
        <span > <FaUsers className="icons" /> </span> Individuals {expanded.individuals ? "▲" : "▼"}
      </button>
      {expanded.individuals && (
        <div className="dropdown">
          <NavLink to="/individuals/list" className="sidebar-link">
            • List
          </NavLink>
        
        </div>
      )} */}

      <h1 className="module-head">MAIN</h1>
      <button
        className="sidebar-toggle"
        onClick={() => toggleExpand("resumes")}
      >
        <span>
          <TbFileCv className="icons" />
        </span>{" "}
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

      {/* <button className="sidebar-toggle" onClick={() => toggleExpand("drill")}>
       <span ><IoChatbox className="icons" /> </span> Minutes Drill {expanded.drill ? "▲" : "▼"}
      </button>
      {expanded.drill && (
        <div className="dropdown">
          <NavLink to="/drill/list" className="sidebar-link">
            •  List
          </NavLink>
          <NavLink to="/drill/reports" className="sidebar-link">
            • Reports
          </NavLink>
          <button className="add-btn">➕ Add</button>
        </div>
      )}

      <button className="sidebar-toggle" onClick={() => toggleExpand("pcp")}>
       <span> <TbChartPieFilled className="icons"/> </span> PCP {expanded.pcp ? "▲" : "▼"}
      </button>
      {expanded.pcp && (
        <div className="dropdown">
          <NavLink to="/resumes/list" className="sidebar-link">
            •  List
          </NavLink>
          <NavLink to="/resumes/reports" className="sidebar-link">
            • Reports
          </NavLink>
          <NavLink to="/resumes/uploads" className="sidebar-link">
            • Uploads
          </NavLink>
          <button className="add-btn">➕ Add</button>
        </div>
      )}

      <button className="sidebar-toggle" onClick={() => toggleExpand("isp")}>
        <span> <GoLog className="icons" /></span> ISP {expanded.isp ? "▲" : "▼"}
      </button>
      {expanded.isp && (
        <div className="dropdown">
          <NavLink to="/isp/list" className="sidebar-link">
            •  List
          </NavLink>
          <NavLink to="/isp/reports" className="sidebar-link">
            • Reports
          </NavLink>
          <button className="add-btn">➕ Add</button>
        </div>
      )}

      <button
        className="sidebar-toggle"
        onClick={() => toggleExpand("monthly")}
      >
       <span> <FaCalendarCheck className="icons"/> </span> Monthly Activities {expanded.monthly ? "▲" : "▼"}
      </button>
      {expanded.monthly && (
        <div className="dropdown">
          <NavLink to="/monthly/list" className="sidebar-link">
            •  List
          </NavLink>
          <NavLink to="/monthly/upload" className="sidebar-link">
            • Reports
          </NavLink>
          <button className="add-btn">➕ Add</button>
        </div>
      )}

      <button
        className="sidebar-toggle"
        onClick={() => toggleExpand("progress")}
      >
      <span><TbDeviceWatchUp className="icons"/></span> Individual Progress {expanded.progress ? "▲" : "▼"}
      </button>
      {expanded.progress && (
        <div className="dropdown">
          <NavLink to="/progress/list" className="sidebar-link">
            •  List
          </NavLink>
          <NavLink to="/progress/reports" className="sidebar-link">
            • Reports
          </NavLink>
          <button className="add-btn">➕ Add</button>
        </div>
      )}

      <h1 className="module-head">ASSESMENT</h1>
      <button
        className="sidebar-toggle"
        onClick={() => toggleExpand("assesment")}
      >
       <span> <VscSettings className="icons" /></span> Individual Assesment {expanded.assesment ? "▲" : "▼"}
      </button>
      {expanded.assesment && (
        <div className="dropdown">
          <NavLink to="/assesment/list" className="sidebar-link">
            •  List
          </NavLink>
          <NavLink to="/assesment/reports" className="sidebar-link">
            • Reports 
          </NavLink>
          <button className="add-btn">➕ Add</button>
        </div>
      )} */}

      <h1 className="module-head">WORKSHEET</h1>
      <button
        className="sidebar-toggle"
        onClick={() => toggleExpand("worksheets")}
      >
        <span>
          {" "}
          <FaFileLines className="icons" />{" "}
        </span>{" "}
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
      {/* 
      <h1 className="module-head">ERP</h1>
      <button className="sidebar-toggle" onClick={() => toggleExpand("forms")}>
       <span className="icons"> <MdGridView /></span> HCD Forms {expanded.forms ? "▲" : "▼"}
      </button>
      {expanded.forms && (
        <div className="dropdown">
          <NavLink to="/resumes/list" className="sidebar-link">
            • Resume List
          </NavLink>
          <NavLink to="/resumes/upload" className="sidebar-link">
            • Upload Resume
          </NavLink>
          <button className="add-btn">➕ Add</button>
        </div>
      )} */}

      <h1 className="module-head">SECURITY</h1>
      <button
        className="sidebar-toggle"
        onClick={() => toggleExpand("authentication")}
      >
        <span>
          {" "}
          <TbLockSquare className="icons" />
        </span>{" "}
        Authentication {expanded.authentication ? "▲" : "▼"}
      </button>
      {expanded.authentication && (
        <div className="dropdown">
          <NavLink to="/profile" className="sidebar-link">
            Profile
          </NavLink>
        </div>
      )}
      <h1 className="module-head">MAR</h1>
      <button
        className="sidebar-toggle"
        onClick={() => toggleExpand("monthly")}
      >
        <span>
          {" "}
          <FaCalendarCheck className="icons" />{" "}
        </span>{" "}
        Monthly Activities {expanded.monthly ? "▲" : "▼"}
      </button>
      {expanded.monthly && (
        <div className="dropdown">
          <NavLink to="/monthly/report" className="sidebar-link">
            • Monthly Report
          </NavLink>
        </div>
      )}

      {/* Keeping all other modules untouched
      <h1 className="module-head">ASSESMENT</h1>
      <NavLink to="/individual-progress" className="sidebar-link">• Individual Assesment</NavLink>

      <h1 className="module-head">WORKSHEET</h1>
      <NavLink to="/individual-progress" className="sidebar-link">• Worksheets</NavLink>

      <h1 className="module-head">CALENDARS</h1>
      <NavLink to="/individual-progress" className="sidebar-link">• Calendars</NavLink>

      <h1 className="module-head">ERP</h1>
      <NavLink to="/individual-progress" className="sidebar-link">• HCD Forms</NavLink>

      <h1 className="module-head">SECURITY</h1>
      <NavLink to="/individual-progress" className="sidebar-link">• Authentication</NavLink> */}
    </div>
  );
};

export default Sidebar;
