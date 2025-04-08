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
  TextField,
  Grid,
  Card,
  CardContent,
  CircularProgress,
  Divider,
  Snackbar,
  Alert,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Switch,
  InputAdornment,
} from "@mui/material";
import {
  ArrowBack as ArrowBackIcon,
  Logout as LogoutIcon,
  HowToVote as HowToVoteIcon,
  Search as SearchIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  AccessTime as AccessTimeIcon,
  DeleteOutline as DeleteOutlineIcon,
} from "@mui/icons-material";
import WaveBackground from "../WaveBackground";

// Mock student data
const mockStudents = [
  {
    id: "s1",
    name: "John Doe",
    email: "john.doe@lnmiit.ac.in",
    rollNumber: "12345678",
    batch: "2022-2026",
    program: "B.Tech CSE",
  },
  {
    id: "s2",
    name: "Jane Smith",
    email: "jane.smith@lnmiit.ac.in",
    rollNumber: "87654321",
    batch: "2023-2027",
    program: "B.Tech ECE",
  },
  {
    id: "s3",
    name: "Rahul Kumar",
    email: "rahul.kumar@lnmiit.ac.in",
    rollNumber: "23456789",
    batch: "2022-2026",
    program: "B.Tech CSE",
  },
  {
    id: "s4",
    name: "Priya Singh",
    email: "priya.singh@lnmiit.ac.in",
    rollNumber: "34567890",
    batch: "2023-2027",
    program: "B.Tech ECE",
  },
  {
    id: "s5",
    name: "Akash Verma",
    email: "akash.verma@lnmiit.ac.in",
    rollNumber: "45678901",
    batch: "2022-2026",
    program: "B.Tech Mechanical",
  },
];

// Mock voting authorizations
const mockAuthorizations = [
  {
    id: "auth1",
    studentId: "s1",
    studentName: "John Doe",
    studentEmail: "john.doe@lnmiit.ac.in",
    authorizedAt: "2025-04-08T09:15:00.000Z",
    expiresAt: "2025-04-08T09:20:00.000Z",
    status: "Expired",
  },
  {
    id: "auth2",
    studentId: "s3",
    studentName: "Rahul Kumar",
    studentEmail: "rahul.kumar@lnmiit.ac.in",
    authorizedAt: "2025-04-08T09:30:00.000Z",
    expiresAt: "2025-04-08T09:35:00.000Z",
    status: "Voted",
  },
];

const VoterApproval = () => {
  const navigate = useNavigate();
  const [isVotingActive, setIsVotingActive] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [foundStudent, setFoundStudent] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState("");
  const [authorizations, setAuthorizations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [confirmDialog, setConfirmDialog] = useState({
    open: false,
    student: null,
    action: "",
  });
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "info",
  });

  useEffect(() => {
    // Simulate API call to fetch authorizations
    setTimeout(() => {
      setAuthorizations(mockAuthorizations);
      setIsLoading(false);
    }, 1000);
  }, []);

  const handleSearchStudent = () => {
    if (!searchQuery.trim()) {
      setSearchError("Please enter an email, name, or roll number");
      return;
    }

    setIsSearching(true);
    setSearchError("");
    setFoundStudent(null);

    // Simulate API search
    setTimeout(() => {
      const query = searchQuery.toLowerCase();
      const student = mockStudents.find(
        (s) =>
          s.email.toLowerCase().includes(query) ||
          s.name.toLowerCase().includes(query) ||
          s.rollNumber.toLowerCase().includes(query)
      );

      if (student) {
        setFoundStudent(student);
      } else {
        setSearchError("Student not found");
      }

      setIsSearching(false);
    }, 1500);
  };

  const handleVotingToggle = () => {
    setIsVotingActive(!isVotingActive);

    setSnackbar({
      open: true,
      message: `Voting is now ${!isVotingActive ? "active" : "disabled"}`,
      severity: "info",
    });
  };

  const handleAuthorizeVoting = (student) => {
    setConfirmDialog({
      open: true,
      student,
      action: "authorize",
    });
  };

  const handleRevokeAuthorization = (authId) => {
    setAuthorizations(authorizations.filter((auth) => auth.id !== authId));

    setSnackbar({
      open: true,
      message: "Voting authorization has been revoked",
      severity: "info",
    });
  };

  const handleConfirmAction = () => {
    if (!confirmDialog.student) return;

    const now = new Date();
    const expiresAt = new Date(now.getTime() + 5 * 60 * 1000); // 5 minutes later

    const newAuth = {
      id: `auth${authorizations.length + 1}`,
      studentId: confirmDialog.student.id,
      studentName: confirmDialog.student.name,
      studentEmail: confirmDialog.student.email,
      authorizedAt: now.toISOString(),
      expiresAt: expiresAt.toISOString(),
      status: "Active",
    };

    setAuthorizations([...authorizations, newAuth]);

    // In a real app, this would set a flag in the database and possibly send the student a notification
    // For demo purposes, we'll store it in localStorage
    localStorage.setItem(
      "votingAuthorized",
      JSON.stringify({
        studentId: confirmDialog.student.id,
        authorizedAt: now.toISOString(),
        expiresAt: expiresAt.toISOString(),
      })
    );

    setFoundStudent(null);
    setSearchQuery("");

    setSnackbar({
      open: true,
      message: `${confirmDialog.student.name} is now authorized to vote for the next 5 minutes`,
      severity: "success",
    });

    setConfirmDialog({
      open: false,
      student: null,
      action: "",
    });
  };

  const handleCloseDialog = () => {
    setConfirmDialog({
      open: false,
      student: null,
      action: "",
    });
  };

  const handleCloseSnackbar = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    setSnackbar({ ...snackbar, open: false });
  };

  const getStatusChipProps = (status) => {
    switch (status) {
      case "Active":
        return { color: "success", icon: <CheckCircleIcon fontSize="small" /> };
      case "Voted":
        return { color: "primary", icon: <HowToVoteIcon fontSize="small" /> };
      case "Expired":
        return { color: "error", icon: <AccessTimeIcon fontSize="small" /> };
      default:
        return { color: "default", icon: null };
    }
  };

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
            LNMIIT-CampusFlow
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
          Voter Approval
        </Typography>

        {/* Voting System Control */}
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
              Voting System Status
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Enable or disable the entire voting system
            </Typography>
          </Box>
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <Typography
              variant="body1"
              sx={{
                mr: 1,
                fontWeight: "medium",
                color: isVotingActive ? "success.main" : "error.main",
              }}
            >
              {isVotingActive ? "Active" : "Disabled"}
            </Typography>
            <Switch
              checked={isVotingActive}
              onChange={handleVotingToggle}
              color={isVotingActive ? "success" : "error"}
            />
          </Box>
        </Paper>

        {isVotingActive && (
          <Grid container spacing={4}>
            {/* Student Search */}
            <Grid item xs={12} md={6}>
              <Paper
                sx={{
                  p: 3,
                  backgroundColor: "rgba(255,255,255,0.9)",
                  borderRadius: 2,
                  height: "100%",
                }}
              >
                <Typography variant="h6" component="h3" gutterBottom>
                  Authorize Voter
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mb: 3 }}
                >
                  Search for a student to authorize for voting
                </Typography>

                <Box sx={{ mb: 3 }}>
                  <TextField
                    fullWidth
                    label="Search by email, name, or roll number"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === "Enter") {
                        handleSearchStudent();
                      }
                    }}
                    error={!!searchError}
                    helperText={searchError}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={handleSearchStudent}
                            disabled={isSearching}
                          >
                            {isSearching ? (
                              <CircularProgress size={24} />
                            ) : (
                              <SearchIcon />
                            )}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />
                </Box>

                {foundStudent && (
                  <Card variant="outlined" sx={{ mb: 2 }}>
                    <CardContent>
                      <Typography variant="h6">{foundStudent.name}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {foundStudent.email}
                      </Typography>
                      <Divider sx={{ my: 1 }} />
                      <Grid container spacing={2}>
                        <Grid item xs={6}>
                          <Typography variant="body2" color="text.secondary">
                            Roll Number
                          </Typography>
                          <Typography variant="body1">
                            {foundStudent.rollNumber}
                          </Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography variant="body2" color="text.secondary">
                            Batch
                          </Typography>
                          <Typography variant="body1">
                            {foundStudent.batch}
                          </Typography>
                        </Grid>
                        <Grid item xs={12}>
                          <Typography variant="body2" color="text.secondary">
                            Program
                          </Typography>
                          <Typography variant="body1">
                            {foundStudent.program}
                          </Typography>
                        </Grid>
                      </Grid>
                      <Box
                        sx={{
                          mt: 2,
                          display: "flex",
                          justifyContent: "flex-end",
                        }}
                      >
                        <Button
                          variant="contained"
                          color="primary"
                          startIcon={<HowToVoteIcon />}
                          onClick={() => handleAuthorizeVoting(foundStudent)}
                        >
                          Authorize to Vote
                        </Button>
                      </Box>
                    </CardContent>
                  </Card>
                )}

                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mt: 2 }}
                >
                  Note: Once authorized, students will have 5 minutes to cast
                  their vote.
                </Typography>
              </Paper>
            </Grid>

            {/* Authorization History */}
            <Grid item xs={12} md={6}>
              <Paper
                sx={{
                  p: 3,
                  backgroundColor: "rgba(255,255,255,0.9)",
                  borderRadius: 2,
                  height: "100%",
                }}
              >
                <Typography variant="h6" component="h3" gutterBottom>
                  Recent Authorizations
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mb: 3 }}
                >
                  List of students recently authorized to vote
                </Typography>

                {isLoading ? (
                  <Box
                    sx={{ display: "flex", justifyContent: "center", my: 4 }}
                  >
                    <CircularProgress />
                  </Box>
                ) : (
                  <TableContainer>
                    <Table size="small">
                      <TableHead>
                        <TableRow sx={{ backgroundColor: "rgba(0,0,0,0.03)" }}>
                          <TableCell sx={{ fontWeight: "bold" }}>
                            Student
                          </TableCell>
                          <TableCell sx={{ fontWeight: "bold" }}>
                            Time
                          </TableCell>
                          <TableCell sx={{ fontWeight: "bold" }}>
                            Status
                          </TableCell>
                          <TableCell sx={{ fontWeight: "bold" }}>
                            Action
                          </TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {authorizations.length > 0 ? (
                          authorizations.map((auth) => {
                            const { color, icon } = getStatusChipProps(
                              auth.status
                            );
                            return (
                              <TableRow key={auth.id} hover>
                                <TableCell>
                                  <Typography variant="body2" component="div">
                                    {auth.studentName}
                                  </Typography>
                                  <Typography
                                    variant="caption"
                                    color="text.secondary"
                                  >
                                    {auth.studentEmail}
                                  </Typography>
                                </TableCell>
                                <TableCell>
                                  <Typography variant="body2" component="div">
                                    {new Date(
                                      auth.authorizedAt
                                    ).toLocaleTimeString()}
                                  </Typography>
                                  <Typography
                                    variant="caption"
                                    color="text.secondary"
                                  >
                                    {new Date(
                                      auth.authorizedAt
                                    ).toLocaleDateString()}
                                  </Typography>
                                </TableCell>
                                <TableCell>
                                  <Chip
                                    size="small"
                                    label={auth.status}
                                    color={color}
                                    icon={icon}
                                  />
                                </TableCell>
                                <TableCell>
                                  <IconButton
                                    color="error"
                                    size="small"
                                    onClick={() =>
                                      handleRevokeAuthorization(auth.id)
                                    }
                                    disabled={auth.status !== "Active"}
                                  >
                                    <DeleteOutlineIcon fontSize="small" />
                                  </IconButton>
                                </TableCell>
                              </TableRow>
                            );
                          })
                        ) : (
                          <TableRow>
                            <TableCell
                              colSpan={4}
                              align="center"
                              sx={{ py: 3 }}
                            >
                              <Typography
                                variant="body1"
                                color="text.secondary"
                              >
                                No recent authorizations
                              </Typography>
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}
              </Paper>
            </Grid>
          </Grid>
        )}

        {!isVotingActive && (
          <Paper
            sx={{
              p: 4,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              backgroundColor: "rgba(255,255,255,0.9)",
              borderRadius: 2,
              mt: 3,
            }}
          >
            <CancelIcon color="error" sx={{ fontSize: 64, mb: 2 }} />
            <Typography
              variant="h5"
              component="h2"
              sx={{ color: "error.main" }}
            >
              Voting System is Currently Disabled
            </Typography>
            <Typography variant="body1" sx={{ mt: 2, textAlign: "center" }}>
              The voting system is currently disabled. Enable it to authorize
              students for voting.
            </Typography>
          </Paper>
        )}
      </Container>

      {/* Confirmation Dialog */}
      <Dialog open={confirmDialog.open} onClose={handleCloseDialog}>
        <DialogTitle>Authorize Voting</DialogTitle>
        <DialogContent>
          <DialogContentText>
            You are authorizing <strong>{confirmDialog.student?.name}</strong>{" "}
            to vote. They will have 5 minutes to cast their vote once
            authorized. This action cannot be undone. Do you want to continue?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button
            onClick={handleConfirmAction}
            variant="contained"
            color="primary"
          >
            Authorize
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

export default VoterApproval;
