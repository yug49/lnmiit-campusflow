import React from "react";
import { useLocation } from "react-router-dom";
import AdminDashboard from "./dashboards/AdminDashboard";
import StudentDashboard from "./dashboards/StudentDashboard";
import FacultyDashboard from "./dashboards/FacultyDashboard";
import CouncilDashboard from "./dashboards/CouncilDashboard";

const Dashboard = () => {
  const location = useLocation();
  const role = location.state?.role;

  if (!role) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          color: "white",
        }}
      >
        <h2>Please login to access the dashboard</h2>
      </div>
    );
  }

  switch (role) {
    case "admin":
      return <AdminDashboard />;
    case "student":
      return <StudentDashboard />;
    case "faculty":
      return <FacultyDashboard />;
    case "council":
      return <CouncilDashboard />;
    default:
      return (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "100vh",
            color: "white",
          }}
        >
          <h2>Invalid role</h2>
        </div>
      );
  }
};

export default Dashboard;
