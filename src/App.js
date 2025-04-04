import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import RoleSelection from "./components/RoleSelection";
import Login from "./components/Login";
import StudentDashboard from "./components/dashboards/StudentDashboard";
import FacultyDashboard from "./components/dashboards/FacultyDashboard";
import AdminDashboard from "./components/dashboards/AdminDashboard";
import CouncilDashboard from "./components/dashboards/CouncilDashboard";
import StudentNoDuesForm from "./components/StudentNoDuesForm";
import FacultyNoDuesApproval from "./components/faculty/FacultyNoDuesApproval";
import AdminNoDuesApproval from "./components/admin/AdminNoDuesApproval";

const theme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: "#0078D4",
    },
    secondary: {
      main: "#444791",
    },
    background: {
      default: "#f5f5f5",
    },
  },
  typography: {
    fontFamily: '"Segoe UI", "Roboto", "Arial", sans-serif',
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundColor: "rgba(255, 255, 255, 0.1)",
          backdropFilter: "blur(10px)",
          borderRadius: 12,
          border: "1px solid rgba(255, 255, 255, 0.2)",
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: "none",
          fontWeight: 500,
        },
      },
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <div
        style={{
          minHeight: "100vh",
          background: "linear-gradient(135deg, #1e1e1e 0%, #2d2d2d 100%)",
          backgroundImage: `url(${process.env.PUBLIC_URL}/background.jpg)`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundAttachment: "fixed",
        }}
      >
        <Router>
          <Routes>
            <Route path="/" element={<RoleSelection />} />
            <Route path="/login/:role" element={<Login />} />
            <Route path="/student/dashboard" element={<StudentDashboard />} />
            <Route path="/faculty/dashboard" element={<FacultyDashboard />} />
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/council/dashboard" element={<CouncilDashboard />} />
            <Route path="/student/no-dues" element={<StudentNoDuesForm />} />
            <Route
              path="/faculty/student-approval"
              element={<FacultyNoDuesApproval />}
            />
            <Route path="/admin/no-dues" element={<AdminNoDuesApproval />} />
          </Routes>
        </Router>
      </div>
    </ThemeProvider>
  );
}

export default App;
