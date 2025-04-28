import React, { useState, useEffect } from "react";
import {
  Box,
  Container,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Snackbar,
  Alert,
  Tabs,
  Tab,
  TextField,
  // Removing unused AppBar and Toolbar imports
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useNavigate } from "react-router-dom";
import WaveBackground from "../WaveBackground";
import CloseIcon from "@mui/icons-material/Close";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import DoneAllIcon from "@mui/icons-material/DoneAll";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import CancelIcon from "@mui/icons-material/Cancel";
// Removing unused LogoutIcon import

// Mock data for demonstration - in a real app, this would come from an API
const mockPendingEvents = [
  {
    id: 1,
    eventName: "Tech Fest 2024",
    councilMember: "John Doe",
    councilPosition: "Technical Head",
    submissionDate: "2024-04-04",
    status: "pending",
    eventDate: "2024-05-15",
    venue: "Main Auditorium",
    expectedParticipants: 500,
    budget: 50000,
    description: "Annual technical festival with workshops and competitions",
    approvals: [
      {
        role: "Faculty Mentor",
        status: "pending",
        email: "mentor@lnmiit.ac.in",
        date: null,
      },
      {
        role: "HOD",
        status: "pending",
        email: "hod@lnmiit.ac.in",
        date: null,
      },
    ],
  },
  {
    id: 3,
    eventName: "Workshop on AI",
    councilMember: "Alice Johnson",
    councilPosition: "Workshop Coordinator",
    submissionDate: "2024-04-06",
    status: "pending",
    eventDate: "2024-04-25",
    venue: "Seminar Hall",
    expectedParticipants: 150,
    budget: 20000,
    description:
      "Hands-on workshop on artificial intelligence and machine learning",
    approvals: [
      {
        role: "Faculty Mentor",
        status: "pending",
        email: "mentor@lnmiit.ac.in",
        date: null,
      },
      {
        role: "HOD",
        status: "pending",
        email: "hod@lnmiit.ac.in",
        date: null,
      },
    ],
  },
];

const mockApprovedEvents = [
  {
    id: 2,
    eventName: "Cultural Night",
    councilMember: "Jane Smith",
    councilPosition: "Cultural Head",
    submissionDate: "2024-03-30",
    approvalDate: "2024-04-01",
    status: "approved",
    eventDate: "2024-05-20",
    venue: "Open Air Theatre",
    expectedParticipants: 1000,
    budget: 75000,
    description: "Annual cultural night with performances and competitions",
    approvals: [
      {
        role: "Faculty Mentor",
        status: "approved",
        email: "mentor@lnmiit.ac.in",
        date: "2024-04-01",
      },
      {
        role: "HOD",
        status: "approved",
        email: "hod@lnmiit.ac.in",
        date: "2024-04-02",
      },
    ],
  },
];

const FacultyEventApproval = () => {
  const navigate = useNavigate();
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [pendingEvents, setPendingEvents] = useState(mockPendingEvents);
  const [approvedEvents, setApprovedEvents] = useState(mockApprovedEvents);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const [activeTab, setActiveTab] = useState(0);
  const [comments, setComments] = useState("");
  const [rejectionDialog, setRejectionDialog] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");

  // In a real app, fetch event data from an API
  useEffect(() => {
    // Fetch events here
    // setPendingEvents(data.pending);
    // setApprovedEvents(data.approved);
  }, []);

  const handleViewDetails = (event) => {
    setSelectedEvent(event);
    setDetailsOpen(true);
    setComments("");
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleApprove = () => {
    // In a real app, this would be an API call
    const currentDate = new Date().toISOString().split("T")[0];
    const updatedPendingEvents = pendingEvents.filter(
      (event) => event.id !== selectedEvent.id
    );

    // Update the event's approval status
    const updatedEvent = {
      ...selectedEvent,
      status: "approved",
      approvalDate: currentDate,
      approvals: selectedEvent.approvals.map((approval) =>
        approval.role === "Faculty Mentor"
          ? {
              ...approval,
              status: "approved",
              date: currentDate,
              comments: comments,
            }
          : approval
      ),
    };

    setApprovedEvents([...approvedEvents, updatedEvent]);
    setPendingEvents(updatedPendingEvents);

    setSnackbar({
      open: true,
      message: `Event "${updatedEvent.eventName}" has been approved successfully!`,
      severity: "success",
    });

    setDetailsOpen(false);
  };

  const handleOpenRejectionDialog = () => {
    setRejectionDialog(true);
  };

  const handleReject = () => {
    // In a real app, this would be an API call
    // Removing unused 'now' variable
    const updatedPendingEvents = pendingEvents.filter(
      (event) => event.id !== selectedEvent.id
    );

    setSnackbar({
      open: true,
      message: `Event "${selectedEvent.eventName}" has been rejected.`,
      severity: "info",
    });

    setPendingEvents(updatedPendingEvents);
    setRejectionDialog(false);
    setDetailsOpen(false);
  };

  const renderRejectionDialog = () => (
    <Dialog
      open={rejectionDialog}
      onClose={() => setRejectionDialog(false)}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle>Reject Event</DialogTitle>
      <DialogContent>
        <Typography variant="body1" gutterBottom>
          Please provide a reason for rejecting this event.
        </Typography>
        <TextField
          fullWidth
          multiline
          rows={4}
          margin="normal"
          label="Reason for Rejection"
          value={rejectionReason}
          onChange={(e) => setRejectionReason(e.target.value)}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setRejectionDialog(false)}>Cancel</Button>
        <Button
          onClick={handleReject}
          variant="contained"
          color="error"
          disabled={!rejectionReason.trim()}
        >
          Confirm Rejection
        </Button>
      </DialogActions>
    </Dialog>
  );

  const renderEventDetails = () => {
    if (!selectedEvent) return null;

    return (
      <Dialog
        open={detailsOpen}
        onClose={() => setDetailsOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle
          sx={{
            bgcolor: "primary.main",
            color: "white",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Typography variant="h6">Event Details</Typography>
          <IconButton
            onClick={() => setDetailsOpen(false)}
            sx={{ color: "white" }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          <Grid container spacing={3}>
            {/* Event Information */}
            <Grid item xs={12}>
              <Typography
                variant="h6"
                sx={{ borderBottom: "1px solid #eee", pb: 1, mb: 2 }}
              >
                Event Information
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle1" fontWeight="bold">
                    Event Name:
                  </Typography>
                  <Typography>{selectedEvent.eventName}</Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle1" fontWeight="bold">
                    Event Date:
                  </Typography>
                  <Typography>{selectedEvent.eventDate}</Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle1" fontWeight="bold">
                    Venue:
                  </Typography>
                  <Typography>{selectedEvent.venue}</Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle1" fontWeight="bold">
                    Expected Participants:
                  </Typography>
                  <Typography>{selectedEvent.expectedParticipants}</Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle1" fontWeight="bold">
                    Budget:
                  </Typography>
                  <Typography>₹{selectedEvent.budget}</Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="subtitle1" fontWeight="bold">
                    Description:
                  </Typography>
                  <Typography>{selectedEvent.description}</Typography>
                </Grid>
              </Grid>
            </Grid>

            {/* Council Member Information */}
            <Grid item xs={12}>
              <Typography
                variant="h6"
                sx={{ borderBottom: "1px solid #eee", pb: 1, mb: 2 }}
              >
                Council Member Information
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle1" fontWeight="bold">
                    Name:
                  </Typography>
                  <Typography>{selectedEvent.councilMember}</Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle1" fontWeight="bold">
                    Position:
                  </Typography>
                  <Typography>{selectedEvent.councilPosition}</Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle1" fontWeight="bold">
                    Submission Date:
                  </Typography>
                  <Typography>{selectedEvent.submissionDate}</Typography>
                </Grid>
              </Grid>
            </Grid>

            {/* Approval Status */}
            <Grid item xs={12}>
              <Typography
                variant="h6"
                sx={{ borderBottom: "1px solid #eee", pb: 1, mb: 2 }}
              >
                Approval Status
              </Typography>
              <TableContainer component={Paper} variant="outlined">
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell align="center">Role</TableCell>
                      <TableCell align="center">Status</TableCell>
                      <TableCell align="center">Email</TableCell>
                      <TableCell align="center">Date</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {selectedEvent.approvals.map((approval, index) => (
                      <TableRow key={index}>
                        <TableCell align="center">{approval.role}</TableCell>
                        <TableCell align="center">
                          <Chip
                            label={approval.status}
                            color={
                              approval.status === "approved"
                                ? "success"
                                : approval.status === "rejected"
                                ? "error"
                                : "warning"
                            }
                            size="small"
                          />
                        </TableCell>
                        <TableCell align="center">{approval.email}</TableCell>
                        <TableCell align="center">
                          {approval.date || "Pending"}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Grid>

            {/* Comments Section (only for pending events) */}
            {selectedEvent.status === "pending" && (
              <Grid item xs={12}>
                <Typography
                  variant="h6"
                  sx={{ borderBottom: "1px solid #eee", pb: 1, mb: 2 }}
                >
                  Your Comments
                </Typography>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  variant="outlined"
                  placeholder="Add your comments or notes about this event (optional)"
                  value={comments}
                  onChange={(e) => setComments(e.target.value)}
                />
              </Grid>
            )}
          </Grid>
        </DialogContent>
        <DialogActions>
          {selectedEvent.status === "pending" && (
            <>
              <Button
                onClick={handleOpenRejectionDialog}
                variant="outlined"
                color="error"
                startIcon={<CancelIcon />}
              >
                Reject
              </Button>
              <Button
                onClick={handleApprove}
                variant="contained"
                color="primary"
                startIcon={<CheckCircleIcon />}
              >
                Approve Event
              </Button>
            </>
          )}
          <Button onClick={() => setDetailsOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    );
  };

  const renderPendingEvents = () => (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell align="center">Event Name</TableCell>
            <TableCell align="center">Council Member</TableCell>
            <TableCell align="center">Event Date</TableCell>
            <TableCell align="center">Submission Date</TableCell>
            <TableCell align="center">Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {pendingEvents.map((event) => (
            <TableRow key={event.id}>
              <TableCell align="center">{event.eventName}</TableCell>
              <TableCell align="center">{event.councilMember}</TableCell>
              <TableCell align="center">{event.eventDate}</TableCell>
              <TableCell align="center">{event.submissionDate}</TableCell>
              <TableCell align="center">
                <Button
                  variant="contained"
                  size="small"
                  onClick={() => handleViewDetails(event)}
                >
                  Review Event
                </Button>
              </TableCell>
            </TableRow>
          ))}
          {pendingEvents.length === 0 && (
            <TableRow>
              <TableCell colSpan={5} align="center">
                No pending event requests to review
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );

  const renderApprovedEvents = () => (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell align="center">Event Name</TableCell>
            <TableCell align="center">Council Member</TableCell>
            <TableCell align="center">Event Date</TableCell>
            <TableCell align="center">Approval Date</TableCell>
            <TableCell align="center">Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {approvedEvents.map((event) => (
            <TableRow key={event.id}>
              <TableCell align="center">{event.eventName}</TableCell>
              <TableCell align="center">{event.councilMember}</TableCell>
              <TableCell align="center">{event.eventDate}</TableCell>
              <TableCell align="center">{event.approvalDate}</TableCell>
              <TableCell align="center">
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => handleViewDetails(event)}
                >
                  View Details
                </Button>
              </TableCell>
            </TableRow>
          ))}
          {approvedEvents.length === 0 && (
            <TableRow>
              <TableCell colSpan={5} align="center">
                No approved events found
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );

  return (
    <>
      <WaveBackground />
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ mb: 4, textAlign: "center" }}>
          <IconButton
            onClick={() => navigate(-1)}
            sx={{
              color: "#fff",
              mb: 2,
              position: "absolute",
              left: 24,
              top: 24,
            }}
          >
            <ArrowBackIcon />
          </IconButton>
          <Typography
            variant="h4"
            component="h1"
            sx={{
              color: "#fff",
              fontWeight: 600,
              mb: 4,
              textShadow: "0 2px 4px rgba(0,0,0,0.1)",
              textAlign: "center",
            }}
          >
            Event Permission Dashboard
          </Typography>
        </Box>

        <Paper
          elevation={3}
          sx={{
            p: 3,
            background: "rgba(255,255,255,0.9)",
            backdropFilter: "blur(10px)",
            borderRadius: 2,
          }}
        >
          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            sx={{ borderBottom: 1, borderColor: "divider", mb: 3 }}
            centered
          >
            <Tab label="Pending Approvals" />
            <Tab label="Approved Events" />
          </Tabs>

          <Box sx={{ mt: 2 }}>
            {activeTab === 0 ? renderPendingEvents() : renderApprovedEvents()}
          </Box>
        </Paper>

        {/* Stats Cards */}
        <Grid container spacing={4} sx={{ mt: 4, justifyContent: "center" }}>
          <Grid item xs={12} sm={5} md={4}>
            <Card
              sx={{
                height: "100%",
                background: "rgba(255,255,255,0.1)",
                backdropFilter: "blur(10px)",
                border: "1px solid rgba(255,255,255,0.2)",
              }}
            >
              <CardContent
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  p: 3,
                  textAlign: "center",
                }}
              >
                <Box
                  sx={{
                    color: "#fff",
                    mb: 2,
                    display: "flex",
                    justifyContent: "center",
                  }}
                >
                  <AccessTimeIcon sx={{ fontSize: 40 }} />
                </Box>
                <Typography
                  variant="h6"
                  component="div"
                  sx={{ color: "#fff", mb: 1, textAlign: "center" }}
                >
                  Pending Events
                </Typography>
                <Typography
                  variant="h4"
                  sx={{ color: "#fff", textAlign: "center", my: 1 }}
                >
                  {pendingEvents.length}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={5} md={4}>
            <Card
              sx={{
                height: "100%",
                background: "rgba(255,255,255,0.1)",
                backdropFilter: "blur(10px)",
                border: "1px solid rgba(255,255,255,0.2)",
              }}
            >
              <CardContent
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  p: 3,
                  textAlign: "center",
                }}
              >
                <Box
                  sx={{
                    color: "#fff",
                    mb: 2,
                    display: "flex",
                    justifyContent: "center",
                  }}
                >
                  <DoneAllIcon sx={{ fontSize: 40 }} />
                </Box>
                <Typography
                  variant="h6"
                  component="div"
                  sx={{ color: "#fff", mb: 1, textAlign: "center" }}
                >
                  Approved Events
                </Typography>
                <Typography
                  variant="h4"
                  sx={{ color: "#fff", textAlign: "center", my: 1 }}
                >
                  {approvedEvents.length}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>

      {/* Dialogs and snackbar */}
      {renderEventDetails()}
      {renderRejectionDialog()}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default FacultyEventApproval;
