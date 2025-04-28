import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { UserProvider } from "./context/UserContext";
import RoleSelection from "./components/RoleSelection";
import Login from "./components/Login";
import StudentDashboard from "./components/dashboards/StudentDashboard";
import FacultyDashboard from "./components/dashboards/FacultyDashboard";
import AdminDashboard from "./components/dashboards/AdminDashboard";
import CouncilDashboard from "./components/dashboards/CouncilDashboard";
import StudentNoDuesForm from "./components/StudentNoDuesForm";
import FacultyNoDuesApproval from "./components/faculty/FacultyNoDuesApproval";
import FacultyMOUApproval from "./components/faculty/FacultyMOUApproval";
import FacultyEventApproval from "./components/faculty/FacultyEventApproval";
import AdminNoDuesApproval from "./components/admin/AdminNoDuesApproval";
import AdminMOUApproval from "./components/admin/AdminMOUApproval";
import AdminEventApproval from "./components/admin/AdminEventApproval";
import MOUAdditionForm from "./components/council/MOUAdditionForm";
import MOUStatus from "./components/council/MOUStatus";
import StudentVoting from "./components/voting/StudentVoting";
import CandidatureForm from "./components/voting/CandidatureForm";
import CastVote from "./components/voting/CastVote";
import CandidatureApproval from "./components/admin/CandidatureApproval";
import VoterApproval from "./components/admin/VoterApproval";
import EventPermissions from "./components/council/EventPermissions";
import EventRequestForm from "./components/council/EventRequestForm";
import EventStatus from "./components/council/EventStatus";
import MyAccount from "./components/common/MyAccount";

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
      <UserProvider>
        <div
          style={{
            minHeight: "100vh",
            background:
              "linear-gradient(135deg, #beb19a 0%, #9a8e7c 50%, #766d5a 100%)",
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundAttachment: "fixed",
          }}
        >
          <Router>
            <Routes>
              {/* Authentication & Dashboard Routes */}
              <Route path="/" element={<RoleSelection />} />
              <Route path="/login/:role" element={<Login />} />
              <Route path="/student/dashboard" element={<StudentDashboard />} />
              <Route path="/faculty/dashboard" element={<FacultyDashboard />} />
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
              <Route path="/council/dashboard" element={<CouncilDashboard />} />

              {/* No-Dues & MOU Routes */}
              <Route path="/student/no-dues" element={<StudentNoDuesForm />} />
              <Route
                path="/faculty/student-approval"
                element={<FacultyNoDuesApproval />}
              />
              <Route
                path="/faculty/mou-approval"
                element={<FacultyMOUApproval />}
              />
              <Route
                path="/faculty/event-approval"
                element={<FacultyEventApproval />}
              />
              <Route path="/admin/no-dues" element={<AdminNoDuesApproval />} />
              <Route path="/admin/mou" element={<AdminMOUApproval />} />
              <Route path="/admin/event" element={<AdminEventApproval />} />
              <Route
                path="/council/mou-addition"
                element={<MOUAdditionForm />}
              />
              <Route path="/council/mou-status" element={<MOUStatus />} />

              {/* Event Permission routes */}
              <Route
                path="/council/permissions"
                element={<EventPermissions />}
              />
              <Route
                path="/council/event-request"
                element={<EventRequestForm />}
              />
              <Route path="/council/event-status" element={<EventStatus />} />

              {/* Voting routes */}
              <Route path="/student/voting" element={<StudentVoting />} />
              <Route
                path="/student/voting/candidature"
                element={<CandidatureForm />}
              />
              <Route path="/student/voting/cast" element={<CastVote />} />
              <Route
                path="/admin/voting/candidature"
                element={<CandidatureApproval />}
              />
              <Route path="/admin/voting/voters" element={<VoterApproval />} />

              {/* My Account route */}
              <Route path="/my-account" element={<MyAccount />} />
            </Routes>
          </Router>
        </div>
      </UserProvider>
    </ThemeProvider>
  );
}

export default App;
