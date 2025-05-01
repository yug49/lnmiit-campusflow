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
import api from "../../utils/apiClient";

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
  const [positions, setPositions] = useState([]);
  const [candidatesByPosition, setCandidatesByPosition] = useState({});
  const [selectedVotes, setSelectedVotes] = useState({});
  const [confirmDialog, setConfirmDialog] = useState({
    open: false,
    position: "",
    candidate: null,
  });
  const [voteSubmitted, setVoteSubmitted] = useState(false);
  const [loadingVoteSubmission, setLoadingVoteSubmission] = useState(false);

  useEffect(() => {
    // Check voting authorization and fetch candidates
    const initializeVoting = async () => {
      setIsLoading(true);
      try {
        // Check if voting is authorized
        const authResponse = await api.voting.checkVotingAuthorization();

        if (authResponse.authorized) {
          setVotingAuthorized(true);

          // Calculate time remaining
          const expiresAt = new Date(authResponse.session.expiresAt);
          const now = new Date();
          const diff = expiresAt - now;

          if (diff > 0) {
            setTimeRemaining(Math.floor(diff / 1000)); // Convert to seconds
          } else {
            setVotingAuthorized(false);
          }

          // Fetch candidates
          const candidatesResponse = await api.voting.getApprovedCandidates();

          if (candidatesResponse.candidates) {
            setCandidatesByPosition(candidatesResponse.candidates);
            setPositions(Object.keys(candidatesResponse.candidates));
          }
        } else if (authResponse.alreadyVoted) {
          setVoteSubmitted(true);
        }
      } catch (error) {
        console.error("Error initializing voting:", error);
        setSnackbar({
          open: true,
          message: `Failed to initialize voting: ${
            error.message || "Unknown error"
          }`,
          severity: "error",
        });
      } finally {
        setIsLoading(false);
      }
    };

    initializeVoting();
  }, []);

  useEffect(() => {
    // Countdown timer for voting authorization
    if (timeRemaining && timeRemaining > 0) {
      const timer = setTimeout(() => {
        setTimeRemaining(timeRemaining - 1);

        if (timeRemaining === 1) {
          // Timer expired
          setVotingAuthorized(false);
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

  const handleConfirmSingleVote = () => {
    setConfirmDialog({ ...confirmDialog, open: false });
    setSnackbar({
      open: true,
      message: `Vote confirmed for ${confirmDialog.position}`,
      severity: "success",
    });
  };

  const handleVoteSubmission = async () => {
    setLoadingVoteSubmission(true);

    try {
      await api.voting.castVote(selectedVotes);

      setVoteSubmitted(true);
      setVotingAuthorized(false);

      setSnackbar({
        open: true,
        message: "Your votes have been submitted successfully!",
        severity: "success",
      });
    } catch (error) {
      console.error("Error submitting votes:", error);
      setSnackbar({
        open: true,
        message: `Failed to submit votes: ${error.message || "Unknown error"}`,
        severity: "error",
      });
    } finally {
      setLoadingVoteSubmission(false);
      setConfirmDialog({ open: false, position: "", candidate: null });
    }
  };

  const handleCloseSnackbar = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    setSnackbar({ ...snackbar, open: false });
  };

  // Render the current position's candidates
  const renderCandidates = () => {
    if (positions.length === 0) {
      return (
        <Typography
          variant="body1"
          sx={{ fontStyle: "italic", textAlign: "center", p: 3 }}
        >
          No positions or candidates available.
        </Typography>
      );
    }

    const currentPosition = positions[position];
    const candidates = candidatesByPosition[currentPosition] || [];

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
                      <Box
                        sx={{
                          width: 60,
                          height: 60,
                          borderRadius: "50%",
                          mr: 2,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          backgroundColor: "rgba(0,0,0,0.1)",
                          color: "primary.main",
                          fontWeight: "bold",
                          fontSize: "1.5rem",
                        }}
                      >
                        {candidate.name.charAt(0)}
                      </Box>
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
                      {candidate.achievements && (
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{ mt: 1 }}
                        >
                          <strong>Achievements:</strong>{" "}
                          {candidate.achievements}
                        </Typography>
                      )}
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
                  disabled={loadingVoteSubmission}
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
          <Button variant="contained" onClick={handleConfirmSingleVote}>
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
