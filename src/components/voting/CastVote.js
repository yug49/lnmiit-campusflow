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
  CircularProgress,
  Card,
  CardContent,
  CardMedia,
  CardActions,
  Grid,
  Snackbar,
  Alert,
  Tabs,
  Tab,
  Divider,
  FormControlLabel,
  Radio,
  RadioGroup,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from "@mui/material";
import {
  ArrowBack as ArrowBackIcon,
  Logout as LogoutIcon,
  Person as PersonIcon,
  HowToVote as HowToVoteIcon,
  CheckCircle as CheckCircleIcon,
  AccessTime as AccessTimeIcon,
} from "@mui/icons-material";
import WaveBackground from "../WaveBackground";

// Mock candidate data
const mockCandidatesByPosition = {
  President: [
    {
      id: "p1",
      name: "Alex Johnson",
      image: "https://randomuser.me/api/portraits/men/32.jpg",
      batch: "2022-2026",
      statement:
        "I aim to bring greater transparency and accountability to student governance.",
      experience:
        "Class Representative (2 years), Event Coordinator for Tech Fest",
    },
    {
      id: "p2",
      name: "Maria Garcia",
      image: "https://randomuser.me/api/portraits/women/44.jpg",
      batch: "2022-2026",
      statement:
        "My vision is to create more inclusive campus activities and better facilities for all students.",
      experience: "Cultural Committee Lead, Student Mentor",
    },
  ],
  "Vice President": [
    {
      id: "vp1",
      name: "Sam Williams",
      image: "https://randomuser.me/api/portraits/men/41.jpg",
      batch: "2023-2027",
      statement:
        "I will focus on strengthening communication between students and administration.",
      experience: "Department Representative, Debate Club President",
    },
    {
      id: "vp2",
      name: "Taylor Reed",
      image: "https://randomuser.me/api/portraits/women/22.jpg",
      batch: "2023-2027",
      statement:
        "My priority is improving academic resources and study environments across campus.",
      experience:
        "Academic Affairs Committee, Teaching Assistant for two courses",
    },
  ],
  "General Secretary": [
    {
      id: "gs1",
      name: "Jordan Lee",
      image: "https://randomuser.me/api/portraits/men/55.jpg",
      batch: "2022-2026",
      statement:
        "I pledge to streamline club activities and ensure fair fund distribution.",
      experience: "Club Coordinator, Finance Committee Member",
    },
  ],
  Treasurer: [
    {
      id: "t1",
      name: "Casey Morgan",
      image: "https://randomuser.me/api/portraits/women/33.jpg",
      batch: "2023-2027",
      statement:
        "I will manage council funds with complete transparency and efficiency.",
      experience:
        "Accounts Manager for College Festival, Economics Society President",
    },
  ],
};

const CastVote = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [votingAuthorized, setVotingAuthorized] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "info",
  });
  const [position, setPosition] = useState(0);
  const [positions] = useState(Object.keys(mockCandidatesByPosition));
  const [selectedVotes, setSelectedVotes] = useState({});
  const [confirmDialog, setConfirmDialog] = useState({
    open: false,
    position: "",
    candidate: null,
  });
  const [voteSubmitted, setVoteSubmitted] = useState(false);

  useEffect(() => {
    // Mock API call to check if voting is authorized
    const checkAuthorization = setTimeout(() => {
      const mockAuth = localStorage.getItem("votingAuthorized");

      if (mockAuth) {
        const authData = JSON.parse(mockAuth);

        // Calculate time remaining
        const endTime = new Date(authData.expiresAt);
        const now = new Date();
        const diff = endTime - now;

        if (diff > 0) {
          setVotingAuthorized(true);
          setTimeRemaining(Math.floor(diff / 1000)); // Convert to seconds
        } else {
          // Reset authorization if expired
          localStorage.removeItem("votingAuthorized");
          setVotingAuthorized(false);
          setTimeRemaining(null);
        }
      }

      setIsLoading(false);
    }, 1500);

    return () => clearTimeout(checkAuthorization);
  }, []);

  useEffect(() => {
    // Countdown timer for voting authorization
    if (timeRemaining && timeRemaining > 0) {
      const timer = setTimeout(() => {
        setTimeRemaining(timeRemaining - 1);

        if (timeRemaining === 1) {
          // Timer expired
          setVotingAuthorized(false);
          localStorage.removeItem("votingAuthorized");
          setSnackbar({
            open: true,
            message:
              "Your voting time has expired. Please contact the administrator.",
            severity: "error",
          });
        }
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [timeRemaining]);

  const formatTimeRemaining = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  const handlePositionChange = (event, newValue) => {
    setPosition(newValue);
  };

  const handleVoteChange = (position, candidateId) => {
    setSelectedVotes({
      ...selectedVotes,
      [position]: candidateId,
    });
  };

  const handleVoteConfirmation = (position, candidate) => {
    setConfirmDialog({
      open: true,
      position,
      candidate,
    });
  };

  const handleVoteSubmission = () => {
    setIsLoading(true);

    // Mock API call to submit votes
    setTimeout(() => {
      // Save vote record in localStorage for demo purposes
      localStorage.setItem(
        "votesSubmitted",
        JSON.stringify({
          votes: selectedVotes,
          submittedAt: new Date().toISOString(),
        })
      );

      // Clear voting authorization
      localStorage.removeItem("votingAuthorized");

      setIsLoading(false);
      setVoteSubmitted(true);
      setVotingAuthorized(false);

      setSnackbar({
        open: true,
        message: "Your votes have been submitted successfully!",
        severity: "success",
      });
    }, 2000);

    setConfirmDialog({ open: false, position: "", candidate: null });
  };

  const handleCloseSnackbar = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    setSnackbar({ ...snackbar, open: false });
  };

  // Render the current position's candidates
  const renderCandidates = () => {
    const currentPosition = positions[position];
    const candidates = mockCandidatesByPosition[currentPosition];

    return (
      <Box>
        <Typography variant="h6" component="h3" sx={{ mb: 2 }}>
          {currentPosition} Candidates
        </Typography>

        {candidates.length > 0 ? (
          <RadioGroup
            value={selectedVotes[currentPosition] || ""}
            onChange={(e) => handleVoteChange(currentPosition, e.target.value)}
          >
            <Grid container spacing={3}>
              {candidates.map((candidate) => (
                <Grid item xs={12} sm={6} key={candidate.id}>
                  <Card
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      height: "100%",
                      backgroundColor:
                        selectedVotes[currentPosition] === candidate.id
                          ? "rgba(25, 118, 210, 0.08)"
                          : "rgba(255, 255, 255, 0.9)",
                      border:
                        selectedVotes[currentPosition] === candidate.id
                          ? "2px solid #1976d2"
                          : "1px solid rgba(0, 0, 0, 0.12)",
                    }}
                  >
                    <Box sx={{ display: "flex", alignItems: "center", p: 2 }}>
                      <CardMedia
                        component="img"
                        sx={{
                          width: 60,
                          height: 60,
                          borderRadius: "50%",
                          mr: 2,
                        }}
                        image={candidate.image}
                        alt={candidate.name}
                      />
                      <Box>
                        <Typography variant="h6" component="div">
                          {candidate.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {candidate.batch}
                        </Typography>
                      </Box>
                    </Box>

                    <CardContent sx={{ py: 1, flexGrow: 1 }}>
                      <Typography variant="body2" gutterBottom>
                        <strong>Statement:</strong> {candidate.statement}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        <strong>Experience:</strong> {candidate.experience}
                      </Typography>
                    </CardContent>

                    <CardActions sx={{ p: 2, pt: 0 }}>
                      <FormControlLabel
                        value={candidate.id}
                        control={<Radio />}
                        label="Select"
                        sx={{ flexGrow: 1 }}
                      />
                      <Button
                        variant="outlined"
                        size="small"
                        disabled={
                          !selectedVotes[currentPosition] ||
                          selectedVotes[currentPosition] !== candidate.id
                        }
                        onClick={() =>
                          handleVoteConfirmation(currentPosition, candidate)
                        }
                      >
                        Confirm Vote
                      </Button>
                    </CardActions>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </RadioGroup>
        ) : (
          <Typography
            variant="body1"
            sx={{ fontStyle: "italic", textAlign: "center" }}
          >
            No candidates available for this position.
          </Typography>
        )}
      </Box>
    );
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
            onClick={() => navigate("/student/voting")}
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
        maxWidth="lg"
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
          Cast Your Vote
        </Typography>

        {isLoading ? (
          <Box sx={{ display: "flex", justifyContent: "center", mt: 8 }}>
            <CircularProgress />
          </Box>
        ) : voteSubmitted ? (
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
            <CheckCircleIcon color="success" sx={{ fontSize: 64, mb: 2 }} />
            <Typography
              variant="h5"
              component="h2"
              sx={{ color: "success.main" }}
            >
              Vote Cast Successfully
            </Typography>
            <Typography variant="body1" sx={{ mt: 2, textAlign: "center" }}>
              Thank you for participating in the student council elections. Your
              vote has been recorded.
            </Typography>
            <Button
              variant="contained"
              color="primary"
              onClick={() => navigate("/student/dashboard")}
              sx={{ mt: 4 }}
            >
              Return to Dashboard
            </Button>
          </Paper>
        ) : !votingAuthorized ? (
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
            <Typography variant="h5" component="h2" sx={{ color: "#d32f2f" }}>
              Voting Not Authorized
            </Typography>
            <Typography variant="body1" sx={{ mt: 2, textAlign: "center" }}>
              You are not currently authorized to cast a vote. Please contact
              the election administrator to receive authorization. Once
              authorized, you will have 5 minutes to cast your vote.
            </Typography>
            <Button
              variant="contained"
              color="primary"
              onClick={() => navigate("/student/voting")}
              sx={{ mt: 4 }}
            >
              Go Back
            </Button>
          </Paper>
        ) : (
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: "rgba(25, 118, 210, 0.1)",
                color: "primary.main",
                borderRadius: 2,
                p: 1.5,
                mb: 3,
                width: "100%",
                maxWidth: 400,
              }}
            >
              <AccessTimeIcon sx={{ mr: 1 }} />
              <Typography variant="body1">
                Time remaining to vote:{" "}
                <strong>{formatTimeRemaining(timeRemaining)}</strong>
              </Typography>
            </Box>

            <Paper
              sx={{
                width: "100%",
                backgroundColor: "rgba(255,255,255,0.9)",
                borderRadius: 2,
                mb: 4,
              }}
            >
              <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
                <Tabs
                  value={position}
                  onChange={handlePositionChange}
                  variant="scrollable"
                  scrollButtons="auto"
                  allowScrollButtonsMobile
                  aria-label="voting positions tabs"
                >
                  {positions.map((pos, index) => (
                    <Tab
                      key={index}
                      label={pos}
                      icon={
                        selectedVotes[pos] ? (
                          <CheckCircleIcon color="success" fontSize="small" />
                        ) : (
                          <PersonIcon fontSize="small" />
                        )
                      }
                      iconPosition="end"
                    />
                  ))}
                </Tabs>
              </Box>

              <Box sx={{ p: 3 }}>{renderCandidates()}</Box>

              <Divider />

              <Box sx={{ p: 3, display: "flex", justifyContent: "center" }}>
                <Button
                  variant="contained"
                  color="primary"
                  size="large"
                  startIcon={<HowToVoteIcon />}
                  onClick={() => {
                    const allPositionsVoted = positions.every(
                      (pos) => selectedVotes[pos]
                    );
                    if (!allPositionsVoted) {
                      setSnackbar({
                        open: true,
                        message:
                          "Please vote for all positions before submitting",
                        severity: "warning",
                      });
                      return;
                    }
                    handleVoteSubmission();
                  }}
                >
                  Submit All Votes
                </Button>
              </Box>
            </Paper>
          </Box>
        )}
      </Container>

      {/* Confirmation Dialog */}
      <Dialog
        open={confirmDialog.open}
        onClose={() => setConfirmDialog({ ...confirmDialog, open: false })}
      >
        <DialogTitle>Confirm Your Vote</DialogTitle>
        <DialogContent>
          <DialogContentText>
            You are voting for <strong>{confirmDialog.candidate?.name}</strong>{" "}
            as <strong>{confirmDialog.position}</strong>. This action will be
            final for this position. Do you want to continue?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setConfirmDialog({ ...confirmDialog, open: false })}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={() => {
              setConfirmDialog({ ...confirmDialog, open: false });
              setSnackbar({
                open: true,
                message: `Vote confirmed for ${confirmDialog.position}`,
                severity: "success",
              });
            }}
          >
            Confirm Vote
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

export default CastVote;
