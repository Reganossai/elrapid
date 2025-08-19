import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import UserDashboard from "./pages/UserDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import Profile from "./pages/Profile";
import Calendaradd from "./components/Calendaradd";
import Calendarlist from "./components/Calendarlist";
import Editcalendar from "./pages/Editcalendar";
import Calendarview from "./components/Calendarview";
import Resumelist from "./components/Resumelist";
import Resumeadd from "./components/Resumeadd";
import Resumeedit from "./components/Resumeedit";
import Worksheetlist from "./pages/Worksheetlist";
import Worksheetadd from "./pages/Worksheetadd";
import Worksheetedit from "./pages/Worksheetedit";
import MonthlyReport from "./components/MonthlyReport"; 
import MonthlyReportEdit from "./components/MonthlyReportEdit";
import Pcpadd from "./pages/Pcpadd";
import PcpList from "./pages/Pcplist";
import Pcpedit from "./pages/Pcpedit";
import TwoMinuteDrillAdd from "./pages/TwoMinuteDrillAdd";
import TwoMinuteDrillEdit from "./pages/TwoMinuteDrillEdit";
import TwoMinuteDrillList from "./pages/TwoMinuteDrillList";

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/user-dashboard" element={<UserDashboard />} />
        <Route path="/admin-dashboard" element={<AdminDashboard />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/calendar/add" element={<Calendaradd />} />
        <Route path="/calendar/list" element={<Calendarlist />} />
        <Route path="/calendar/edit/:id" element={<Editcalendar />} />
        <Route path="/calendar/view/:id" element={<Calendarview />} />
        <Route path="/resume/add" element={<Resumeadd />} />
        <Route path="/resume/list" element={<Resumelist />} />
        <Route path="/pcp/add" element={<Pcpadd />} />
        <Route path="/pcp/edit/:id" element={<Pcpedit />} />
        <Route path="/pcp/list" element={<PcpList />} />
        <Route path="/2mindrill/add" element={<TwoMinuteDrillAdd />} />
        <Route path="/2mindrill/edit/:id" element={<TwoMinuteDrillEdit />} />
        <Route path="/2mindrill/list" element={<TwoMinuteDrillList />} />
        <Route path="/resume/edit/:id" element={<Resumeedit />} />
        <Route path="/worksheets/list" element={<Worksheetlist />} />
        <Route path="/worksheets/add" element={<Worksheetadd />} />
        <Route path="/worksheets/edit/:id" element={<Worksheetedit />} />
        <Route path="/monthly/report" element={<MonthlyReport />} />
        <Route path="/monthly/reportedit/:month" element={<MonthlyReportEdit />} />
      </Routes>
    </Router>
  );
};

export default App;
