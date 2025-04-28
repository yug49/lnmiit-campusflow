import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  AppBar,
  Toolbar,
  Typography,
  Container,
  Box,
  Paper,
  Button,
  IconButton,
  Switch,
  FormControlLabel,
  TextField,
  Card,
  CardContent,
  Grid,
  Chip,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Snackbar,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
} from "@mui/material";
import {
  ArrowBack as ArrowBackIcon,
  Logout as LogoutIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Feedback as FeedbackIcon,
} from "@mui/icons-material";
import WaveBackground from "../WaveBackground";

// Mock data for candidature applications
const mockApplications = [
  {
    id: "app1",
    name: "John Doe",
    email: "john.doe@lnmiit.ac.in",
    rollNumber: "12345678",
    position: "President",
    batch: "2022-2026",
    statement:
      "I aim to bring greater transparency and accountability to student governance.",
    experience:
      "Class Representative (2 years), Event Coordinator for Tech Fest",
    achievements: "Dean's List, Best Delegate at MUN",
    status: "Pending",
    submittedAt: "2025-04-05T10:30:00.000Z",
  },
  {
    id: "app2",
    name: "Jane Smith",
    email: "jane.smith@lnmiit.ac.in",
    rollNumber: "87654321",
    position: "Vice President",
    batch: "2023-2027",
    statement:
      "My focus is on improving the academic resources available to students.",
    experience:
      "Academic Affairs Committee, Teaching Assistant for two courses",
    achievements: "Research Paper Publication, Merit Scholarship Recipient",
    status: "Pending",
    submittedAt: "2025-04-06T08:45:00.000Z",
  },
  {
    id: "app3",
    name: "Rahul Kumar",
    email: "rahul.kumar@lnmiit.ac.in",
    rollNumber: "23456789",
    position: "Cultural Secretary",
    batch: "2022-2026",
    statement:
      "I want to revitalize our cultural events and make them more inclusive.",
    experience:
      "Dance Club Coordinator, Event Management Team for Cultural Fest",
    achievements: "Best Performer Award, National Dance Competition Finalist",
    status: "Approved",
    submittedAt: "2025-04-04T14:20:00.000Z",
  },
  {
    id: "app4",
    name: "Priya Singh",
    email: "priya.singh@lnmiit.ac.in",
    rollNumber: "34567890",
    position: "Sports Secretary",
    batch: "2023-2027",
    statement:
      "My goal is to increase sports participation and organize more inter-college tournaments.",
    experience: "Basketball Team Captain, Sports Committee Member",
    achievements: "University Championship Winner, Best Sportsperson Award",
    status: "Rejected",
    remark: "Insufficient leadership experience for this position",
    submittedAt: "2025-04-03T16:10:00.000Z",
  },
  {
    id: "app5",
    name: "Akash Verma",
    email: "akash.verma@lnmiit.ac.in",
    rollNumber: "45678901",
    position: "General Secretary",
    batch: "2022-2026",
    statement:
      "I will work to streamline administrative processes and improve communication.",
    experience: "Department Representative, Student Council Member",
    achievements:
      "Academic Excellence Award, Outstanding Leadership Recognition",
    status: "Reverted",
    remark:
      "Please provide more details about your experience with administrative processes",
    submittedAt: "2025-04-02T11:05:00.000Z",
  },
];

const CandidatureApproval = () => {
  const navigate = useNavigate();
  const [isPortalOpen, setIsPortalOpen] = useState(true);
  const [applications, setApplications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [actionDialog, setActionDialog] = useState({
    open: false,
    action: "",
    title: "",
  });
  const [remark, setRemark] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [positionFilter, setPositionFilter] = useState("All");
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  // Get unique positions from applications
  const positions = [
    "All",
    ...new Set(mockApplications.map((app) => app.position)),
  ];

  useEffect(() => {
    // Simulate API call to fetch applications
    setTimeout(() => {
      setApplications(mockApplications);
      setIsLoading(false);
    }, 1500);
  }, []);

  const handlePortalToggle = () => {
    setIsPortalOpen(!isPortalOpen);

    setSnackbar({
      open: true,
      message: `Candidature portal is now ${!isPortalOpen ? "open" : "closed"}`,
      severity: "info",
    });
  };

  const handleSelectApplication = (application) => {
    setSelectedApplication(application);
  };

  const handleOpenActionDialog = (action, application) => {
    setSelectedApplication(application);
    let title = "";

    switch (action) {
      case "approve":
        title = "Approve Candidature";
        break;
      case "reject":
        title = "Reject Candidature";
        break;
      case "revert":
        title = "Revert for Changes";
        break;
      default:
        title = "Take Action";
    }

    setActionDialog({
      open: true,
      action,
      title,
    });
    setRemark("");
  };

  const handleAction = () => {
    if (!selectedApplication) return;

    // Update application status
    const updatedApplications = applications.map((app) => {
      if (app.id === selectedApplication.id) {
        let status;
        switch (actionDialog.action) {
          case "approve":
            status = "Approved";
            break;
          case "reject":
            status = "Rejected";
            break;
          case "revert":
            status = "Reverted";
            break;
          default:
            status = app.status;
        }

        return {
          ...app,
          status,
          remark: remark || app.remark,
        };
      }
      return app;
    });

    setApplications(updatedApplications);

    // Close dialog
    setActionDialog({ open: false, action: "", title: "" });

    // Show confirmation
    let message = "";
    let severity = "success";

    switch (actionDialog.action) {
      case "approve":
        message = `${selectedApplication.name}'s candidature has been approved`;
        severity = "success";
        break;
      case "reject":
        message = `${selectedApplication.name}'s candidature has been rejected`;
        severity = "error";
        break;
      case "revert":
        message = `${selectedApplication.name}'s candidature has been reverted for changes`;
        severity = "warning";
        break;
      default:
        message = "Action completed";
    }

    setSnackbar({
      open: true,
      message,
      severity,
    });

    setSelectedApplication(null);
  };

  const handleCloseDialog = () => {
    setActionDialog({ open: false, action: "", title: "" });
    setRemark("");
  };

  const handleCloseSnackbar = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    setSnackbar({ ...snackbar, open: false });
  };

  const getStatusChipProps = (status) => {
    switch (status) {
      case "Approved":
        return { color: "success", icon: <CheckCircleIcon fontSize="small" /> };
      case "Rejected":
        return { color: "error", icon: <CancelIcon fontSize="small" /> };
      case "Reverted":
        return { color: "warning", icon: <FeedbackIcon fontSize="small" /> };
      default:
        return { color: "info", icon: null };
    }
  };

  // Filter applications based on status and position
  const filteredApplications = applications.filter((app) => {
    const matchesStatus = statusFilter === "All" || app.status === statusFilter;
    const matchesPosition =
      positionFilter === "All" || app.position === positionFilter;
    return matchesStatus && matchesPosition;
  });

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <WaveBackground />
      <AppBar
        position="static"
        sx={{
          background: "rgba(255,255,255,0.8)",
          backdropFilter: "blur(10px)",
          boxShadow: "none",
          borderBottom: "1px solid rgba(255,255,255,0.2)",
        }}
      >
        <Toolbar>
          <IconButton
            edge="start"
            color="primary"
            onClick={() => navigate("/admin/dashboard")}
            sx={{ mr: 2 }}
          >
            <ArrowBackIcon />
          </IconButton>
          <Typography
            variant="h6"
            component="div"
            sx={{
              flexGrow: 1,
              color: "#0078D4",
              fontWeight: 600,
            }}
          >
            LNMIIT-CampusConnect
          </Typography>
          <IconButton
            onClick={() => navigate("/")}
            sx={{
              color: "#0078D4",
              "&:hover": {
                backgroundColor: "rgba(0,120,212,0.1)",
              },
            }}
          >
            <LogoutIcon />
          </IconButton>
        </Toolbar>
      </AppBar>

      <Container
        maxWidth="xl"
        sx={{
          position: "relative",
          zIndex: 1,
          py: 4,
          display: "flex",
          flexDirection: "column",
          flex: 1,
        }}
      >
        <Typography
          variant="h4"
          component="h1"
          sx={{
            fontWeight: 600,
            mb: 2,
            color: "#fff",
            textAlign: "center",
            textShadow: "0 2px 4px rgba(0,0,0,0.1)",
          }}
        >
          Candidature Approval
        </Typography>

        {/* Portal Control */}
        <Paper
          sx={{
            p: 3,
            mb: 4,
            backgroundColor: "rgba(255,255,255,0.9)",
            borderRadius: 2,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Box>
            <Typography variant="h6" component="h2">
              Candidature Portal Status
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Control whether students can submit candidature forms
            </Typography>
          </Box>
          <FormControlLabel
            control={
              <Switch
                checked={isPortalOpen}
                onChange={handlePortalToggle}
                color={isPortalOpen ? "success" : "error"}
              />
            }
            label={
              <Typography
                sx={{
                  color: isPortalOpen ? "success.main" : "error.main",
                  fontWeight: "medium",
                }}
              >
                {isPortalOpen ? "Open" : "Closed"}
              </Typography>
            }
          />
        </Paper>

        {/* Filters */}
        <Paper
          sx={{
            p: 3,
            mb: 4,
            backgroundColor: "rgba(255,255,255,0.9)",
            borderRadius: 2,
          }}
        >
          <Grid container spacing={3} alignItems="center">
            <Grid item xs={12} md={3}>
              <Typography variant="h6" component="h2">
                Filter Applications
              </Typography>
            </Grid>
            <Grid item xs={12} md={4.5}>
              <FormControl fullWidth size="small">
                <InputLabel id="status-filter-label">Status</InputLabel>
                <Select
                  labelId="status-filter-label"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  label="Status"
                >
                  <MenuItem value="All">All</MenuItem>
                  <MenuItem value="Pending">Pending</MenuItem>
                  <MenuItem value="Approved">Approved</MenuItem>
                  <MenuItem value="Rejected">Rejected</MenuItem>
                  <MenuItem value="Reverted">Reverted</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={4.5}>
              <FormControl fullWidth size="small">
                <InputLabel id="position-filter-label">Position</InputLabel>
                <Select
                  labelId="position-filter-label"
                  value={positionFilter}
                  onChange={(e) => setPositionFilter(e.target.value)}
                  label="Position"
                >
                  {positions.map((pos) => (
                    <MenuItem key={pos} value={pos}>
                      {pos}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </Paper>

        {/* Applications List */}
        {isLoading ? (
          <Box sx={{ display: "flex", justifyContent: "center", my: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <TableContainer
            component={Paper}
            sx={{
              backgroundColor: "rgba(255,255,255,0.9)",
              borderRadius: 2,
              mb: 4,
            }}
          >
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: "rgba(0,0,0,0.03)" }}>
                  <TableCell sx={{ fontWeight: "bold" }}>Name</TableCell>
                  <TableCell sx={{ fontWeight: "bold" }}>Position</TableCell>
                  <TableCell sx={{ fontWeight: "bold" }}>Roll Number</TableCell>
                  <TableCell sx={{ fontWeight: "bold" }}>Batch</TableCell>
                  <TableCell sx={{ fontWeight: "bold" }}>Submitted</TableCell>
                  <TableCell sx={{ fontWeight: "bold" }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: "bold" }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredApplications.length > 0 ? (
                  filteredApplications.map((application) => {
                    const { color, icon } = getStatusChipProps(
                      application.status
                    );
                    return (
                      <TableRow key={application.id} hover>
                        <TableCell>{application.name}</TableCell>
                        <TableCell>{application.position}</TableCell>
                        <TableCell>{application.rollNumber}</TableCell>
                        <TableCell>{application.batch}</TableCell>
                        <TableCell>
                          {new Date(
                            application.submittedAt
                          ).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <Chip
                            size="small"
                            label={application.status}
                            color={color}
                            icon={icon}
                          />
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: "flex" }}>
                            <Tooltip title="View Details">
                              <Button
                                size="small"
                                onClick={() =>
                                  handleSelectApplication(application)
                                }
                              >
                                Details
                              </Button>
                            </Tooltip>
                            {application.status === "Pending" && (
                              <>
                                <Tooltip title="Approve">
                                  <IconButton
                                    color="success"
                                    size="small"
                                    onClick={() =>
                                      handleOpenActionDialog(
                                        "approve",
                                        application
                                      )
                                    }
                                  >
                                    <CheckCircleIcon fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                                <Tooltip title="Reject">
                                  <IconButton
                                    color="error"
                                    size="small"
                                    onClick={() =>
                                      handleOpenActionDialog(
                                        "reject",
                                        application
                                      )
                                    }
                                  >
                                    <CancelIcon fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                                <Tooltip title="Revert for Changes">
                                  <IconButton
                                    color="warning"
                                    size="small"
                                    onClick={() =>
                                      handleOpenActionDialog(
                                        "revert",
                                        application
                                      )
                                    }
                                  >
                                    <FeedbackIcon fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                              </>
                            )}
                          </Box>
                        </TableCell>
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} align="center" sx={{ py: 3 }}>
                      <Typography variant="body1" color="text.secondary">
                        No applications found matching the selected filters
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        {/* Application Details */}
        {selectedApplication && (
          <Card
            sx={{
              backgroundColor: "rgba(255,255,255,0.9)",
              borderRadius: 2,
              mb: 4,
            }}
          >
            <CardContent>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                }}
              >
                <Typography variant="h6" component="h3" gutterBottom>
                  Candidature Details
                </Typography>
                <Chip
                  label={selectedApplication.status}
                  color={getStatusChipProps(selectedApplication.status).color}
                  icon={getStatusChipProps(selectedApplication.status).icon}
                />
              </Box>
              <Divider sx={{ mb: 2 }} />
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" component="div">
                    Name
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 1 }}>
                    {selectedApplication.name}
                  </Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" component="div">
                    Email
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 1 }}>
                    {selectedApplication.email}
                  </Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" component="div">
                    Roll Number
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 1 }}>
                    {selectedApplication.rollNumber}
                  </Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" component="div">
                    Batch
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 1 }}>
                    {selectedApplication.batch}
                  </Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" component="div">
                    Position
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 1 }}>
                    {selectedApplication.position}
                  </Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" component="div">
                    Submitted On
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 1 }}>
                    {new Date(selectedApplication.submittedAt).toLocaleString()}
                  </Typography>
                </Grid>

                <Grid item xs={12}>
                  <Typography variant="subtitle2" component="div">
                    Personal Statement
                  </Typography>
                  <Paper
                    variant="outlined"
                    sx={{
                      p: 1.5,
                      mb: 1.5,
                      backgroundColor: "rgba(0,0,0,0.02)",
                    }}
                  >
                    <Typography variant="body1">
                      {selectedApplication.statement}
                    </Typography>
                  </Paper>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="subtitle2" component="div">
                    Experience
                  </Typography>
                  <Paper
                    variant="outlined"
                    sx={{
                      p: 1.5,
                      mb: 1.5,
                      backgroundColor: "rgba(0,0,0,0.02)",
                    }}
                  >
                    <Typography variant="body1">
                      {selectedApplication.experience}
                    </Typography>
                  </Paper>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="subtitle2" component="div">
                    Achievements
                  </Typography>
                  <Paper
                    variant="outlined"
                    sx={{
                      p: 1.5,
                      mb: 1.5,
                      backgroundColor: "rgba(0,0,0,0.02)",
                    }}
                  >
                    <Typography variant="body1">
                      {selectedApplication.achievements}
                    </Typography>
                  </Paper>
                </Grid>

                {selectedApplication.remark && (
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" component="div">
                      Admin Remark
                    </Typography>
                    <Paper
                      variant="outlined"
                      sx={{ p: 1.5, backgroundColor: "rgba(0,0,0,0.02)" }}
                    >
                      <Typography variant="body1">
                        {selectedApplication.remark}
                      </Typography>
                    </Paper>
                  </Grid>
                )}
              </Grid>

              <Box sx={{ display: "flex", justifyContent: "center", mt: 3 }}>
                <Button
                  variant="outlined"
                  onClick={() => setSelectedApplication(null)}
                >
                  Close
                </Button>
              </Box>
            </CardContent>
          </Card>
        )}
      </Container>

      {/* Action Dialog */}
      <Dialog open={actionDialog.open} onClose={handleCloseDialog}>
        <DialogTitle>{actionDialog.title}</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {actionDialog.action === "approve" && (
              <>
                You are approving <strong>{selectedApplication?.name}</strong>'s
                candidature for the position of{" "}
                <strong>{selectedApplication?.position}</strong>.
              </>
            )}
            {actionDialog.action === "reject" && (
              <>
                You are rejecting <strong>{selectedApplication?.name}</strong>'s
                candidature for the position of{" "}
                <strong>{selectedApplication?.position}</strong>. Please provide
                a reason for rejection.
              </>
            )}
            {actionDialog.action === "revert" && (
              <>
                You are reverting <strong>{selectedApplication?.name}</strong>'s
                candidature for the position of{" "}
                <strong>{selectedApplication?.position}</strong> for changes.
                Please provide details on what needs to be changed.
              </>
            )}
          </DialogContentText>

          {(actionDialog.action === "reject" ||
            actionDialog.action === "revert") && (
            <TextField
              autoFocus
              margin="dense"
              id="remark"
              label="Remark"
              fullWidth
              multiline
              rows={3}
              variant="outlined"
              value={remark}
              onChange={(e) => setRemark(e.target.value)}
              sx={{ mt: 2 }}
            />
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button
            onClick={handleAction}
            color={
              actionDialog.action === "approve"
                ? "success"
                : actionDialog.action === "reject"
                ? "error"
                : "warning"
            }
            variant="contained"
            disabled={
              (actionDialog.action === "reject" ||
                actionDialog.action === "revert") &&
              !remark
            }
          >
            {actionDialog.action === "approve"
              ? "Approve"
              : actionDialog.action === "reject"
              ? "Reject"
              : "Revert for Changes"}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default CandidatureApproval;
