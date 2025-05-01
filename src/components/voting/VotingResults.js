import React, { useState, useEffect } from "react";
import {
  Container,
  Typography,
  Paper,
  Box,
  Grid,
  Button,
  CircularProgress,
  Alert,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Card,
  CardContent,
  Divider,
  List,
  ListItem,
  ListItemText,
  Chip,
} from "@mui/material";
import RefreshIcon from "@mui/icons-material/Refresh";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import { useUser } from "../../context/UserContext";
import api from "../../utils/apiClient";

const VotingResults = () => {
  const { userRole } = useUser();
  const [results, setResults] = useState({});
  const [totalVotes, setTotalVotes] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [refreshTime, setRefreshTime] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);

  // Function to fetch election results
  const fetchResults = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.voting.getElectionResults();

      if (response.success) {
        setResults(response.results);
        setTotalVotes(response.totalVotes);
        setRefreshTime(new Date());
      } else {
        setError("Failed to fetch results");
      }
    } catch (err) {
      console.error("Error fetching results:", err);
      setError("Error fetching results. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Function to reset the election after confirmation
  const handleResetElection = async () => {
    try {
      setLoading(true);
      setError("");
      setSuccess("");

      const response = await api.voting.resetElection();

      if (response.success) {
        setSuccess(response.message);
        // Refresh results after reset
        fetchResults();
      } else {
        setError("Failed to reset election");
      }
    } catch (err) {
      console.error("Error resetting election:", err);
      setError("Error resetting election. Please try again.");
    } finally {
      setLoading(false);
      setOpenDialog(false);
    }
  };

  // Load results on component mount
  useEffect(() => {
    fetchResults();
  }, []);

  // Handle open confirmation dialog
  const handleOpenDialog = () => {
    setOpenDialog(true);
  };

  // Handle close confirmation dialog
  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Paper
        sx={{
          p: 4,
          display: "flex",
          flexDirection: "column",
          backgroundColor: "rgba(255, 255, 255, 0.9)",
          borderRadius: 2,
        }}
      >
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 3,
          }}
        >
          <Typography variant="h4" gutterBottom>
            Election Results
          </Typography>
          <Box>
            <Button
              startIcon={<RefreshIcon />}
              variant="outlined"
              onClick={fetchResults}
              sx={{ mr: 1 }}
              disabled={loading}
            >
              Refresh Results
            </Button>
            <Button
              startIcon={<RestartAltIcon />}
              variant="contained"
              color="warning"
              onClick={handleOpenDialog}
              disabled={loading || userRole !== "admin"}
            >
              Refresh Election
            </Button>
          </Box>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mb: 3 }}>
            {success}
          </Alert>
        )}

        {loading ? (
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              minHeight: "200px",
            }}
          >
            <CircularProgress />
          </Box>
        ) : (
          <Box>
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle1">
                      Total Votes Cast: <strong>{totalVotes}</strong>
                    </Typography>
                  </Grid>
                  <Grid item xs={12} md={6} sx={{ textAlign: "right" }}>
                    <Typography variant="subtitle1">
                      Last Updated:{" "}
                      <strong>
                        {refreshTime ? refreshTime.toLocaleString() : "Never"}
                      </strong>
                    </Typography>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>

            {Object.keys(results).length === 0 ? (
              <Alert severity="info">
                No election results available. Either no votes have been cast or
                no candidates have been approved.
              </Alert>
            ) : (
              Object.keys(results).map((position) => (
                <Card key={position} sx={{ mb: 3 }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Position: {position}
                    </Typography>
                    <Divider sx={{ mb: 2 }} />
                    <List>
                      {results[position]
                        .sort((a, b) => b.voteCount - a.voteCount)
                        .map((candidate) => (
                          <ListItem
                            key={candidate.candidateId}
                            divider
                            secondaryAction={
                              <Chip
                                label={`${candidate.voteCount} votes (${candidate.percentage}%)`}
                                color={
                                  results[position][0].candidateId ===
                                  candidate.candidateId
                                    ? "primary"
                                    : "default"
                                }
                                variant={
                                  results[position][0].candidateId ===
                                  candidate.candidateId
                                    ? "filled"
                                    : "outlined"
                                }
                              />
                            }
                          >
                            <ListItemText
                              primary={candidate.name}
                              secondary={`Roll Number: ${candidate.rollNumber}`}
                            />
                          </ListItem>
                        ))}
                    </List>
                  </CardContent>
                </Card>
              ))
            )}
          </Box>
        )}
      </Paper>

      {/* Confirmation Dialog for Election Reset */}
      <Dialog open={openDialog} onClose={handleCloseDialog}>
        <DialogTitle>Confirm Election Reset</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Warning: This action will delete all votes and reset candidate
            statuses to "Pending". This cannot be undone. Are you sure you want
            to reset the election?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} color="primary">
            Cancel
          </Button>
          <Button onClick={handleResetElection} color="error">
            Reset Election
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default VotingResults;
