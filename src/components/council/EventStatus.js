import React, { useState, useEffect } from "react";
import {
  Box,
  Container,
  Typography,
  Paper,
  Tabs,
  Tab,
  Grid,
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
  CircularProgress,
  Divider,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import VisibilityIcon from "@mui/icons-material/Visibility";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import PendingIcon from "@mui/icons-material/Pending";
import CloseIcon from "@mui/icons-material/Close";
import EditIcon from "@mui/icons-material/Edit";
import DownloadIcon from "@mui/icons-material/Download";
import EventIcon from "@mui/icons-material/Event";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import PlaceIcon from "@mui/icons-material/Place";
import PeopleIcon from "@mui/icons-material/People";
import { useNavigate } from "react-router-dom";
import WaveBackground from "../WaveBackground";

// Mock data for demonstration - replace with actual API calls
const mockEvents = [
  {
    id: 1,
    eventName: "Tech Symposium 2025",
    eventType: "Technical Workshop",
    description:
      "A series of technical workshops and expert talks on emerging technologies",
    startDate: "2025-05-15T10:00:00",
    endDate: "2025-05-17T18:00:00",
    venue: "Auditorium",
    status: "pending",
    submissionDate: "2025-04-05",
    expectedAttendance: 250,
    budgetRequired: true,
    budgetAmount: 25000,
    budgetBreakdown: [
      { item: "Speaker honorarium", amount: 10000 },
      { item: "Refreshments", amount: 8000 },
      { item: "Promotional materials", amount: 5000 },
      { item: "Miscellaneous", amount: 2000 },
    ],
    equipmentNeeded: ["Projector", "Sound System", "Microphones", "Laptop"],
    facultyCoordinator: "Dr. Rajesh Kumar",
    facultyEmail: "rajesh.kumar@lnmiit.ac.in",
    studentCoordinator: "Ananya Sharma",
    studentEmail: "ananya.sharma@lnmiit.ac.in",
    studentPhone: "9876543210",
    supportingDocuments: ["event_proposal.pdf", "speakers_list.pdf"],
    submittedBy: {
      name: "Technical Club Secretary",
      email: "technical.secretary@lnmiit.ac.in",
    },
    approvals: [
      {
        role: "Faculty Advisor",
        status: "approved",
        email: "faculty.advisor@lnmiit.ac.in",
        date: "2025-04-08",
        comments: "Well-organized event plan. Approved.",
      },
      {
        role: "Dean of Student Affairs",
        status: "pending",
        email: "dean.sa@lnmiit.ac.in",
        date: null,
        comments: null,
      },
      {
        role: "Director",
        status: "pending",
        email: "director@lnmiit.ac.in",
        date: null,
        comments: null,
      },
    ],
  },
  {
    id: 2,
    eventName: "Cultural Night 2025",
    eventType: "Cultural Event",
    description:
      "Annual cultural festival with performances by students and guest artists",
    startDate: "2025-04-25T17:00:00",
    endDate: "2025-04-25T22:00:00",
    venue: "Open Air Theater",
    status: "approved",
    submissionDate: "2025-03-15",
    approvalDate: "2025-03-25",
    expectedAttendance: 500,
    budgetRequired: true,
    budgetAmount: 40000,
    budgetBreakdown: [
      { item: "Guest artist fees", amount: 15000 },
      { item: "Decorations", amount: 10000 },
      { item: "Sound and lighting", amount: 12000 },
      { item: "Refreshments", amount: 3000 },
    ],
    equipmentNeeded: [
      "Sound System",
      "Lighting Equipment",
      "Microphones",
      "Podium",
    ],
    facultyCoordinator: "Dr. Meera Patel",
    facultyEmail: "meera.patel@lnmiit.ac.in",
    studentCoordinator: "Rahul Singh",
    studentEmail: "rahul.singh@lnmiit.ac.in",
    studentPhone: "8765432109",
    supportingDocuments: ["cultural_night_program.pdf", "performance_list.pdf"],
    submittedBy: {
      name: "Cultural Club Secretary",
      email: "cultural.secretary@lnmiit.ac.in",
    },
    approvals: [
      {
        role: "Faculty Advisor",
        status: "approved",
        email: "faculty.advisor@lnmiit.ac.in",
        date: "2025-03-18",
        comments: "Excellent planning for cultural night.",
      },
      {
        role: "Dean of Student Affairs",
        status: "approved",
        email: "dean.sa@lnmiit.ac.in",
        date: "2025-03-22",
        comments:
          "Approved with the condition of strict adherence to time limits.",
      },
      {
        role: "Director",
        status: "approved",
        email: "director@lnmiit.ac.in",
        date: "2025-03-25",
        comments: "Approved. Ensure security arrangements are in place.",
      },
    ],
  },
  {
    id: 3,
    eventName: "Alumni Connect Workshop",
    eventType: "Guest Lecture",
    description:
      "A workshop series by alumni to help current students with industry preparation",
    startDate: "2025-04-15T14:00:00",
    endDate: "2025-04-15T17:00:00",
    venue: "Seminar Room 1",
    status: "rejected",
    submissionDate: "2025-03-20",
    rejectionDate: "2025-03-28",
    expectedAttendance: 100,
    budgetRequired: false,
    equipmentNeeded: ["Projector", "Microphones"],
    facultyCoordinator: "Dr. Amit Joshi",
    facultyEmail: "amit.joshi@lnmiit.ac.in",
    studentCoordinator: "Vikram Malhotra",
    studentEmail: "vikram.malhotra@lnmiit.ac.in",
    studentPhone: "7654321098",
    supportingDocuments: ["alumni_workshop_agenda.pdf"],
    submittedBy: {
      name: "Placement Cell Coordinator",
      email: "placement.coordinator@lnmiit.ac.in",
    },
    rejectionReason:
      "The event clashes with scheduled mid-semester examinations. Please propose alternate dates after the examination period.",
    approvals: [
      {
        role: "Faculty Advisor",
        status: "approved",
        email: "faculty.advisor@lnmiit.ac.in",
        date: "2025-03-22",
        comments: "Good initiative for students.",
      },
      {
        role: "Dean of Student Affairs",
        status: "rejected",
        email: "dean.sa@lnmiit.ac.in",
        date: "2025-03-28",
        comments: "Clashes with mid-semester examinations.",
      },
      {
        role: "Director",
        status: "pending",
        email: "director@lnmiit.ac.in",
        date: null,
        comments: null,
      },
    ],
  },
];

const mockPastEvents = [
  {
    id: 101,
    eventName: "Technical Innovation Fair 2025",
    eventType: "Competition",
    description:
      "Exhibition of student technical projects and innovation competition",
    startDate: "2025-02-10T09:00:00",
    endDate: "2025-02-10T17:00:00",
    venue: "Multi-purpose Hall",
    status: "completed",
    submissionDate: "2025-01-15",
    completionDate: "2025-02-10",
    attendanceCount: 320, // Actual attendance
    budgetRequired: true,
    budgetAmount: 30000,
    actualExpenses: 27500,
    facultyCoordinator: "Dr. Sanjay Mehta",
    studentCoordinator: "Priya Sharma",
    feedback:
      "Successfully organized with good participation. Projects were of high quality. Recommend making this a biannual event.",
    photos: ["tech_fair_1.jpg", "tech_fair_2.jpg", "tech_fair_3.jpg"],
    supportingDocuments: ["winners_list.pdf", "expense_report.pdf"],
    highlights:
      "15 projects were showcased, with 3 projects selected for national level competition.",
  },
  {
    id: 102,
    eventName: "LNMIIT Sports Tournament",
    eventType: "Sports Event",
    description:
      "Inter-year sports competition including cricket, football, basketball, and athletics",
    startDate: "2025-01-20T08:00:00",
    endDate: "2025-01-25T18:00:00",
    venue: "Sports Ground",
    status: "completed",
    submissionDate: "2024-12-10",
    completionDate: "2025-01-25",
    attendanceCount: 450,
    budgetRequired: true,
    budgetAmount: 35000,
    actualExpenses: 34200,
    facultyCoordinator: "Dr. Raj Kiran",
    studentCoordinator: "Arjun Singh",
    feedback:
      "Excellent event with high participation. Better arrangements for spectator seating needed for next time.",
    photos: ["sports_1.jpg", "sports_2.jpg", "sports_winners.jpg"],
    supportingDocuments: ["tournament_results.pdf", "sports_report.pdf"],
    highlights:
      "Second year students won the overall championship trophy. New college record set in 100m sprint.",
  },
  {
    id: 103,
    eventName: "Literary Festival",
    eventType: "Cultural Event",
    description:
      "Annual literary festival featuring debates, poetry recitation, and story writing competitions",
    startDate: "2025-03-05T10:00:00",
    endDate: "2025-03-06T16:00:00",
    venue: "Auditorium",
    status: "completed",
    submissionDate: "2025-02-01",
    completionDate: "2025-03-06",
    attendanceCount: 280,
    budgetRequired: true,
    budgetAmount: 20000,
    actualExpenses: 18500,
    facultyCoordinator: "Dr. Priya Varma",
    studentCoordinator: "Aditya Kumar",
    feedback:
      "Well-organized event. The guest speaker sessions were particularly well-received. Consider extending to a three-day event next time due to high participation.",
    photos: ["lit_fest_1.jpg", "lit_fest_2.jpg", "awards.jpg"],
    supportingDocuments: ["event_report.pdf", "winners.pdf"],
    highlights:
      "Famous author Amish Tripathi attended as chief guest. Over 100 participants in various competitions.",
  },
];

const EventStatus = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(0);
  const [events, setEvents] = useState([]);
  const [pastEvents, setPastEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate API call to fetch events
    setTimeout(() => {
      setEvents(mockEvents);
      setPastEvents(mockPastEvents);
      setIsLoading(false);
    }, 1000);
  }, []);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleViewDetails = (event) => {
    setSelectedEvent(event);
    setDetailsOpen(true);
  };

  const handleEditEvent = (eventId) => {
    // In a real implementation, you would navigate to the edit form with the event ID
    console.log("Edit event:", eventId);
    navigate(`/council/event-request?edit=${eventId}`);
  };

  const getStatusInfo = (status) => {
    switch (status) {
      case "approved":
        return {
          color: "success",
          icon: <CheckCircleIcon fontSize="small" />,
          label: "Approved",
        };
      case "rejected":
        return {
          color: "error",
          icon: <CancelIcon fontSize="small" />,
          label: "Rejected",
        };
      case "pending":
        return {
          color: "warning",
          icon: <PendingIcon fontSize="small" />,
          label: "Pending",
        };
      case "completed":
        return {
          color: "info",
          icon: <EventIcon fontSize="small" />,
          label: "Completed",
        };
      default:
        return {
          color: "default",
          icon: <PendingIcon fontSize="small" />,
          label: status,
        };
    }
  };

  const formatDate = (dateString) => {
    const options = {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const renderCurrentEventDetails = () => {
    if (!selectedEvent) return null;

    const statusInfo = getStatusInfo(selectedEvent.status);

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
            {/* Status Banner */}
            <Grid item xs={12}>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  p: 2,
                  mb: 2,
                  borderRadius: 1,
                  bgcolor:
                    selectedEvent.status === "approved"
                      ? "rgba(46, 125, 50, 0.1)"
                      : selectedEvent.status === "rejected"
                      ? "rgba(211, 47, 47, 0.1)"
                      : "rgba(255, 167, 38, 0.1)",
                }}
              >
                <Box sx={{ mr: 1 }}>{statusInfo.icon}</Box>
                <Typography
                  variant="h6"
                  sx={{
                    color:
                      selectedEvent.status === "approved"
                        ? "success.main"
                        : selectedEvent.status === "rejected"
                        ? "error.main"
                        : "warning.main",
                  }}
                >
                  Status: {statusInfo.label}
                </Typography>
              </Box>
            </Grid>

            {/* Rejection Reason (if rejected) */}
            {selectedEvent.status === "rejected" && (
              <Grid item xs={12}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 2,
                    mb: 3,
                    bgcolor: "error.main",
                    color: "white",
                  }}
                >
                  <Typography variant="subtitle1" sx={{ fontWeight: "bold" }}>
                    Rejection Reason:
                  </Typography>
                  <Typography variant="body2">
                    {selectedEvent.rejectionReason}
                  </Typography>
                </Paper>
              </Grid>
            )}

            {/* Basic Event Information */}
            <Grid item xs={12}>
              <Typography
                variant="h6"
                sx={{ borderBottom: "1px solid #eee", pb: 1, mb: 2 }}
              >
                Basic Information
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Typography variant="subtitle1" fontWeight="bold">
                    Event Name:
                  </Typography>
                  <Typography variant="body1">
                    {selectedEvent.eventName}
                  </Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle1" fontWeight="bold">
                    Event Type:
                  </Typography>
                  <Typography variant="body1">
                    {selectedEvent.eventType}
                  </Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle1" fontWeight="bold">
                    Submission Date:
                  </Typography>
                  <Typography variant="body1">
                    {selectedEvent.submissionDate}
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="subtitle1" fontWeight="bold">
                    Description:
                  </Typography>
                  <Typography variant="body1" paragraph>
                    {selectedEvent.description}
                  </Typography>
                </Grid>
              </Grid>
            </Grid>

            {/* Venue & Schedule */}
            <Grid item xs={12}>
              <Typography
                variant="h6"
                sx={{ borderBottom: "1px solid #eee", pb: 1, mb: 2 }}
              >
                Venue & Schedule
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                    <PlaceIcon sx={{ mr: 1, color: "primary.main" }} />
                    <Typography variant="subtitle1" fontWeight="bold">
                      Venue:
                    </Typography>
                  </Box>
                  <Typography variant="body1" paragraph>
                    {selectedEvent.venue}
                  </Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                    <PeopleIcon sx={{ mr: 1, color: "primary.main" }} />
                    <Typography variant="subtitle1" fontWeight="bold">
                      Expected Attendance:
                    </Typography>
                  </Box>
                  <Typography variant="body1" paragraph>
                    {selectedEvent.expectedAttendance} people
                  </Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                    <AccessTimeIcon sx={{ mr: 1, color: "primary.main" }} />
                    <Typography variant="subtitle1" fontWeight="bold">
                      Start Date & Time:
                    </Typography>
                  </Box>
                  <Typography variant="body1" paragraph>
                    {formatDate(selectedEvent.startDate)}
                  </Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                    <AccessTimeIcon sx={{ mr: 1, color: "primary.main" }} />
                    <Typography variant="subtitle1" fontWeight="bold">
                      End Date & Time:
                    </Typography>
                  </Box>
                  <Typography variant="body1" paragraph>
                    {formatDate(selectedEvent.endDate)}
                  </Typography>
                </Grid>
              </Grid>
            </Grid>

            {/* Budget Information (if applicable) */}
            {selectedEvent.budgetRequired && (
              <Grid item xs={12}>
                <Typography
                  variant="h6"
                  sx={{ borderBottom: "1px solid #eee", pb: 1, mb: 2 }}
                >
                  Budget Information
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle1" fontWeight="bold">
                      Total Budget:
                    </Typography>
                    <Typography variant="body1">
                      ₹{selectedEvent.budgetAmount}
                    </Typography>
                  </Grid>
                  {selectedEvent.budgetBreakdown && (
                    <Grid item xs={12}>
                      <Typography
                        variant="subtitle1"
                        fontWeight="bold"
                        sx={{ mb: 1 }}
                      >
                        Budget Breakdown:
                      </Typography>
                      <TableContainer component={Paper} variant="outlined">
                        <Table size="small">
                          <TableHead>
                            <TableRow>
                              <TableCell>Item</TableCell>
                              <TableCell align="right">Amount (₹)</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {selectedEvent.budgetBreakdown.map(
                              (item, index) => (
                                <TableRow key={index}>
                                  <TableCell>{item.item}</TableCell>
                                  <TableCell align="right">
                                    {item.amount}
                                  </TableCell>
                                </TableRow>
                              )
                            )}
                            <TableRow>
                              <TableCell sx={{ fontWeight: "bold" }}>
                                Total
                              </TableCell>
                              <TableCell
                                align="right"
                                sx={{ fontWeight: "bold" }}
                              >
                                {selectedEvent.budgetBreakdown.reduce(
                                  (total, item) => total + Number(item.amount),
                                  0
                                )}
                              </TableCell>
                            </TableRow>
                          </TableBody>
                        </Table>
                      </TableContainer>
                    </Grid>
                  )}
                </Grid>
              </Grid>
            )}

            {/* Resources & Requirements */}
            <Grid item xs={12}>
              <Typography
                variant="h6"
                sx={{ borderBottom: "1px solid #eee", pb: 1, mb: 2 }}
              >
                Resources & Requirements
              </Typography>
              <Grid container spacing={2}>
                {selectedEvent.equipmentNeeded &&
                  selectedEvent.equipmentNeeded.length > 0 && (
                    <Grid item xs={12}>
                      <Typography variant="subtitle1" fontWeight="bold">
                        Equipment Needed:
                      </Typography>
                      <Box
                        sx={{
                          mt: 1,
                          display: "flex",
                          flexWrap: "wrap",
                          gap: 1,
                        }}
                      >
                        {selectedEvent.equipmentNeeded.map((item, index) => (
                          <Chip
                            key={index}
                            label={item}
                            variant="outlined"
                            color="primary"
                          />
                        ))}
                      </Box>
                    </Grid>
                  )}
              </Grid>
            </Grid>

            {/* Coordinators */}
            <Grid item xs={12}>
              <Typography
                variant="h6"
                sx={{ borderBottom: "1px solid #eee", pb: 1, mb: 2 }}
              >
                Coordinators
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle1" fontWeight="bold">
                    Faculty Coordinator:
                  </Typography>
                  <Typography variant="body1">
                    {selectedEvent.facultyCoordinator}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {selectedEvent.facultyEmail}
                  </Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle1" fontWeight="bold">
                    Student Coordinator:
                  </Typography>
                  <Typography variant="body1">
                    {selectedEvent.studentCoordinator}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {selectedEvent.studentEmail}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {selectedEvent.studentPhone}
                  </Typography>
                </Grid>
              </Grid>
            </Grid>

            {/* Documents */}
            {selectedEvent.supportingDocuments && (
              <Grid item xs={12}>
                <Typography
                  variant="h6"
                  sx={{ borderBottom: "1px solid #eee", pb: 1, mb: 2 }}
                >
                  Documents
                </Typography>
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                  {selectedEvent.supportingDocuments.map((doc, index) => (
                    <Button
                      key={index}
                      variant="outlined"
                      size="small"
                      startIcon={<DownloadIcon />}
                      sx={{ mb: 1, mr: 1 }}
                      onClick={() => console.log("Downloading:", doc)}
                    >
                      {doc}
                    </Button>
                  ))}
                </Box>
              </Grid>
            )}

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
                      <TableCell>Role</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Email</TableCell>
                      <TableCell>Date</TableCell>
                      <TableCell>Comments</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {selectedEvent.approvals.map((approval, index) => {
                      const approvalStatusInfo = getStatusInfo(approval.status);
                      return (
                        <TableRow key={index}>
                          <TableCell>{approval.role}</TableCell>
                          <TableCell>
                            <Chip
                              label={approvalStatusInfo.label}
                              color={approvalStatusInfo.color}
                              size="small"
                              icon={approvalStatusInfo.icon}
                            />
                          </TableCell>
                          <TableCell>{approval.email}</TableCell>
                          <TableCell>{approval.date || "Pending"}</TableCell>
                          <TableCell>
                            {approval.comments || "No comments"}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          {selectedEvent.status === "rejected" && (
            <Button
              onClick={() => handleEditEvent(selectedEvent.id)}
              variant="contained"
              color="primary"
              startIcon={<EditIcon />}
            >
              Edit and Resubmit
            </Button>
          )}
          <Button onClick={() => setDetailsOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    );
  };

  const renderPastEventDetails = () => {
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
          <Typography variant="h6">Past Event Details</Typography>
          <IconButton
            onClick={() => setDetailsOpen(false)}
            sx={{ color: "white" }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          <Grid container spacing={3}>
            {/* Status Banner */}
            <Grid item xs={12}>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  p: 2,
                  mb: 2,
                  borderRadius: 1,
                  bgcolor: "rgba(3, 169, 244, 0.1)",
                }}
              >
                <Box sx={{ mr: 1 }}>
                  <EventIcon fontSize="small" color="info" />
                </Box>
                <Typography variant="h6" color="info.main">
                  Completed Event
                </Typography>
              </Box>
            </Grid>

            {/* Basic Event Information */}
            <Grid item xs={12}>
              <Typography
                variant="h6"
                sx={{ borderBottom: "1px solid #eee", pb: 1, mb: 2 }}
              >
                Basic Information
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Typography variant="subtitle1" fontWeight="bold">
                    Event Name:
                  </Typography>
                  <Typography variant="body1">
                    {selectedEvent.eventName}
                  </Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle1" fontWeight="bold">
                    Event Type:
                  </Typography>
                  <Typography variant="body1">
                    {selectedEvent.eventType}
                  </Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle1" fontWeight="bold">
                    Completion Date:
                  </Typography>
                  <Typography variant="body1">
                    {selectedEvent.completionDate}
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="subtitle1" fontWeight="bold">
                    Description:
                  </Typography>
                  <Typography variant="body1" paragraph>
                    {selectedEvent.description}
                  </Typography>
                </Grid>
              </Grid>
            </Grid>

            {/* Venue & Schedule */}
            <Grid item xs={12}>
              <Typography
                variant="h6"
                sx={{ borderBottom: "1px solid #eee", pb: 1, mb: 2 }}
              >
                Venue & Schedule
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                    <PlaceIcon sx={{ mr: 1, color: "primary.main" }} />
                    <Typography variant="subtitle1" fontWeight="bold">
                      Venue:
                    </Typography>
                  </Box>
                  <Typography variant="body1" paragraph>
                    {selectedEvent.venue}
                  </Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                    <PeopleIcon sx={{ mr: 1, color: "primary.main" }} />
                    <Typography variant="subtitle1" fontWeight="bold">
                      Actual Attendance:
                    </Typography>
                  </Box>
                  <Typography variant="body1" paragraph>
                    {selectedEvent.attendanceCount} people
                  </Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                    <AccessTimeIcon sx={{ mr: 1, color: "primary.main" }} />
                    <Typography variant="subtitle1" fontWeight="bold">
                      Start Date & Time:
                    </Typography>
                  </Box>
                  <Typography variant="body1" paragraph>
                    {formatDate(selectedEvent.startDate)}
                  </Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                    <AccessTimeIcon sx={{ mr: 1, color: "primary.main" }} />
                    <Typography variant="subtitle1" fontWeight="bold">
                      End Date & Time:
                    </Typography>
                  </Box>
                  <Typography variant="body1" paragraph>
                    {formatDate(selectedEvent.endDate)}
                  </Typography>
                </Grid>
              </Grid>
            </Grid>

            {/* Budget Information (if applicable) */}
            {selectedEvent.budgetRequired && (
              <Grid item xs={12}>
                <Typography
                  variant="h6"
                  sx={{ borderBottom: "1px solid #eee", pb: 1, mb: 2 }}
                >
                  Budget Information
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle1" fontWeight="bold">
                      Approved Budget:
                    </Typography>
                    <Typography variant="body1">
                      ₹{selectedEvent.budgetAmount}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle1" fontWeight="bold">
                      Actual Expenses:
                    </Typography>
                    <Typography variant="body1">
                      ₹{selectedEvent.actualExpenses}
                    </Typography>
                  </Grid>
                </Grid>
              </Grid>
            )}

            {/* Event Highlights */}
            <Grid item xs={12}>
              <Typography
                variant="h6"
                sx={{ borderBottom: "1px solid #eee", pb: 1, mb: 2 }}
              >
                Event Highlights
              </Typography>
              <Typography variant="body1" paragraph>
                {selectedEvent.highlights}
              </Typography>
            </Grid>

            {/* Feedback */}
            <Grid item xs={12}>
              <Typography
                variant="h6"
                sx={{ borderBottom: "1px solid #eee", pb: 1, mb: 2 }}
              >
                Feedback & Report
              </Typography>
              <Typography variant="body1" paragraph>
                {selectedEvent.feedback}
              </Typography>
            </Grid>

            {/* Coordinators */}
            <Grid item xs={12}>
              <Typography
                variant="h6"
                sx={{ borderBottom: "1px solid #eee", pb: 1, mb: 2 }}
              >
                Coordinators
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle1" fontWeight="bold">
                    Faculty Coordinator:
                  </Typography>
                  <Typography variant="body1">
                    {selectedEvent.facultyCoordinator}
                  </Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle1" fontWeight="bold">
                    Student Coordinator:
                  </Typography>
                  <Typography variant="body1">
                    {selectedEvent.studentCoordinator}
                  </Typography>
                </Grid>
              </Grid>
            </Grid>

            {/* Photos */}
            {selectedEvent.photos && selectedEvent.photos.length > 0 && (
              <Grid item xs={12}>
                <Typography
                  variant="h6"
                  sx={{ borderBottom: "1px solid #eee", pb: 1, mb: 2 }}
                >
                  Event Photos
                </Typography>
                <Grid container spacing={2}>
                  {selectedEvent.photos.map((photo, index) => (
                    <Grid item xs={12} sm={4} key={index}>
                      <Box
                        sx={{
                          height: 150,
                          bgcolor: "grey.200",
                          borderRadius: 1,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <Typography variant="body2" color="text.secondary">
                          {photo}
                        </Typography>
                      </Box>
                    </Grid>
                  ))}
                </Grid>
              </Grid>
            )}

            {/* Documents */}
            {selectedEvent.supportingDocuments && (
              <Grid item xs={12}>
                <Typography
                  variant="h6"
                  sx={{ borderBottom: "1px solid #eee", pb: 1, mb: 2 }}
                >
                  Documents
                </Typography>
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                  {selectedEvent.supportingDocuments.map((doc, index) => (
                    <Button
                      key={index}
                      variant="outlined"
                      size="small"
                      startIcon={<DownloadIcon />}
                      sx={{ mb: 1, mr: 1 }}
                      onClick={() => console.log("Downloading:", doc)}
                    >
                      {doc}
                    </Button>
                  ))}
                </Box>
              </Grid>
            )}
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailsOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    );
  };

  const filteredEvents = (tab) => {
    switch (tab) {
      case 0: // All Events
        return events;
      case 1: // Pending Events
        return events.filter((event) => event.status === "pending");
      case 2: // Approved Events
        return events.filter((event) => event.status === "approved");
      case 3: // Rejected Events
        return events.filter((event) => event.status === "rejected");
      case 4: // Past Events
        return pastEvents;
      default:
        return events;
    }
  };

  const renderCurrentEventsList = () => {
    const filtered = filteredEvents(activeTab);

    if (filtered.length === 0) {
      return (
        <Box sx={{ p: 4, textAlign: "center" }}>
          <Typography variant="body1" color="text.secondary">
            No events found in this category.
          </Typography>
        </Box>
      );
    }

    return (
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Event Name</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Date</TableCell>
              <TableCell>Venue</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filtered.map((event) => {
              const statusInfo = getStatusInfo(event.status);
              return (
                <TableRow key={event.id}>
                  <TableCell>{event.eventName}</TableCell>
                  <TableCell>{event.eventType}</TableCell>
                  <TableCell>
                    {new Date(event.startDate).toLocaleDateString()}
                  </TableCell>
                  <TableCell>{event.venue}</TableCell>
                  <TableCell>
                    <Chip
                      label={statusInfo.label}
                      color={statusInfo.color}
                      size="small"
                      icon={statusInfo.icon}
                    />
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={<VisibilityIcon />}
                      onClick={() => handleViewDetails(event)}
                      sx={{ mr: 1 }}
                    >
                      View Details
                    </Button>
                    {event.status === "rejected" && (
                      <Button
                        variant="outlined"
                        color="primary"
                        size="small"
                        startIcon={<EditIcon />}
                        onClick={() => handleEditEvent(event.id)}
                      >
                        Edit
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
    );
  };

  const renderPastEventsList = () => {
    if (pastEvents.length === 0) {
      return (
        <Box sx={{ p: 4, textAlign: "center" }}>
          <Typography variant="body1" color="text.secondary">
            No past events found.
          </Typography>
        </Box>
      );
    }

    return (
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Event Name</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Date</TableCell>
              <TableCell>Venue</TableCell>
              <TableCell>Attendance</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {pastEvents.map((event) => (
              <TableRow key={event.id}>
                <TableCell>{event.eventName}</TableCell>
                <TableCell>{event.eventType}</TableCell>
                <TableCell>
                  {new Date(event.startDate).toLocaleDateString()}
                </TableCell>
                <TableCell>{event.venue}</TableCell>
                <TableCell>{event.attendanceCount}</TableCell>
                <TableCell>
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<VisibilityIcon />}
                    onClick={() => handleViewDetails(event)}
                  >
                    View Details
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    );
  };

  return (
    <>
      <WaveBackground />
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ mb: 4 }}>
          <IconButton
            onClick={() => navigate("/council/permissions")}
            sx={{ color: "#fff", mb: 2 }}
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
            }}
          >
            Events Status Dashboard
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
            variant="scrollable"
            scrollButtons="auto"
          >
            <Tab label="All Events" />
            <Tab
              label="Pending"
              icon={<PendingIcon color="warning" />}
              iconPosition="start"
            />
            <Tab
              label="Approved"
              icon={<CheckCircleIcon color="success" />}
              iconPosition="start"
            />
            <Tab
              label="Rejected"
              icon={<CancelIcon color="error" />}
              iconPosition="start"
            />
            <Tab
              label="Past Events"
              icon={<EventIcon color="info" />}
              iconPosition="start"
            />
          </Tabs>

          {isLoading ? (
            <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
              <CircularProgress />
            </Box>
          ) : activeTab === 4 ? (
            renderPastEventsList()
          ) : (
            renderCurrentEventsList()
          )}
        </Paper>
      </Container>
      {activeTab === 4 ? renderPastEventDetails() : renderCurrentEventDetails()}
    </>
  );
};

export default EventStatus;
