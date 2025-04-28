import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import Box from "@mui/material/Box";
import { UserProvider } from "./context/UserContext";
import RoleSelection from "./components/RoleSelection";
import Login from "./components/Login";
import StudentDashboard from "./components/dashboards/StudentDashboard";
import FacultyDashboard from "./components/dashboards/FacultyDashboard";
import AdminDashboard from "./components/dashboards/AdminDashboard";
import CouncilDashboard from "./components/dashboards/CouncilDashboard";
import StudentNoDuesForm from "./components/StudentNoDuesForm";
import FacultyNoDuesForm from "./components/faculty/FacultyNoDuesForm";
import FacultyNoDuesApproval from "./components/faculty/FacultyNoDuesApproval";
import FacultyMOUApproval from "./components/faculty/FacultyMOUApproval";
import FacultyEventApproval from "./components/faculty/FacultyEventApproval";
import FacultyInvoiceApproval from "./components/faculty/FacultyInvoiceApproval";
import AdminNoDuesApproval from "./components/admin/AdminNoDuesApproval";
import AdminMOUApproval from "./components/admin/AdminMOUApproval";
import AdminEventApproval from "./components/admin/AdminEventApproval";
import AdminInvoiceApproval from "./components/admin/AdminInvoiceApproval";
import MOUAdditionForm from "./components/council/MOUAdditionForm";
import MOUStatus from "./components/council/MOUStatus";
import InvoiceSubmissionForm from "./components/council/InvoiceSubmissionForm";
import InvoiceRecords from "./components/council/InvoiceRecords";
import StudentVoting from "./components/voting/StudentVoting";
import CandidatureForm from "./components/voting/CandidatureForm";
import CastVote from "./components/voting/CastVote";
import CandidatureApproval from "./components/admin/CandidatureApproval";
import VoterApproval from "./components/admin/VoterApproval";
import EventPermissions from "./components/council/EventPermissions";
import EventRequestForm from "./components/council/EventRequestForm";
import EventStatus from "./components/council/EventStatus";
import MyAccount from "./components/common/MyAccount";
import ProtectedRoute from "./components/common/ProtectedRoute";
import Footer from "./components/common/Footer";

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
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            height: "100vh",
            background:
              "linear-gradient(135deg, #beb19a 0%, #9a8e7c 50%, #766d5a 100%)",
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundAttachment: "fixed",
          }}
        >
          <Router>
            <Box sx={{ flex: 1, overflow: "auto" }}>
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<RoleSelection />} />
                <Route path="/login/:role" element={<Login />} />

                {/* Protected Dashboard Routes */}
                <Route
                  path="/student/dashboard"
                  element={
                    <ProtectedRoute>
                      <StudentDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/faculty/dashboard"
                  element={
                    <ProtectedRoute>
                      <FacultyDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/dashboard"
                  element={
                    <ProtectedRoute>
                      <AdminDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/council/dashboard"
                  element={
                    <ProtectedRoute>
                      <CouncilDashboard />
                    </ProtectedRoute>
                  }
                />

                {/* Protected No-Dues & MOU Routes */}
                <Route
                  path="/student/no-dues"
                  element={
                    <ProtectedRoute>
                      <StudentNoDuesForm />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/faculty/no-dues"
                  element={
                    <ProtectedRoute>
                      <FacultyNoDuesForm />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/faculty/student-approval"
                  element={
                    <ProtectedRoute>
                      <FacultyNoDuesApproval />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/faculty/mou-approval"
                  element={
                    <ProtectedRoute>
                      <FacultyMOUApproval />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/faculty/event-approval"
                  element={
                    <ProtectedRoute>
                      <FacultyEventApproval />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/faculty/invoice-approval"
                  element={
                    <ProtectedRoute>
                      <FacultyInvoiceApproval />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/no-dues"
                  element={
                    <ProtectedRoute>
                      <AdminNoDuesApproval />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/mou"
                  element={
                    <ProtectedRoute>
                      <AdminMOUApproval />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/event"
                  element={
                    <ProtectedRoute>
                      <AdminEventApproval />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/invoice"
                  element={
                    <ProtectedRoute>
                      <AdminInvoiceApproval />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/council/mou-addition"
                  element={
                    <ProtectedRoute>
                      <MOUAdditionForm />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/council/mou-status"
                  element={
                    <ProtectedRoute>
                      <MOUStatus />
                    </ProtectedRoute>
                  }
                />

                {/* Protected Invoice Routes */}
                <Route
                  path="/council/submit-invoices"
                  element={
                    <ProtectedRoute>
                      <InvoiceSubmissionForm />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/council/invoice-records"
                  element={
                    <ProtectedRoute>
                      <InvoiceRecords />
                    </ProtectedRoute>
                  }
                />

                {/* Protected Event Permission routes */}
                <Route
                  path="/council/permissions"
                  element={
                    <ProtectedRoute>
                      <EventPermissions />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/council/event-request"
                  element={
                    <ProtectedRoute>
                      <EventRequestForm />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/council/event-status"
                  element={
                    <ProtectedRoute>
                      <EventStatus />
                    </ProtectedRoute>
                  }
                />

                {/* Protected Voting routes */}
                <Route
                  path="/student/voting"
                  element={
                    <ProtectedRoute>
                      <StudentVoting />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/student/voting/candidature"
                  element={
                    <ProtectedRoute>
                      <CandidatureForm />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/student/voting/cast"
                  element={
                    <ProtectedRoute>
                      <CastVote />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/voting/candidature"
                  element={
                    <ProtectedRoute>
                      <CandidatureApproval />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/voting/voters"
                  element={
                    <ProtectedRoute>
                      <VoterApproval />
                    </ProtectedRoute>
                  }
                />

                {/* Protected My Account route */}
                <Route
                  path="/my-account"
                  element={
                    <ProtectedRoute>
                      <MyAccount />
                    </ProtectedRoute>
                  }
                />
              </Routes>
            </Box>
            <Footer />
          </Router>
        </Box>
      </UserProvider>
    </ThemeProvider>
  );
}

export default App;
