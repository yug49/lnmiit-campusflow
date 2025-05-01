const express = require("express");
const router = express.Router();
const { authenticateToken } = require("../middleware/auth.middleware");
const votingController = require("../controllers/voting.controller");

// Test routes
router.get("/test", (req, res) => {
  res.json({ message: "Voting route test is working" });
});

// Test route using controller function
router.get("/controller-test", votingController.test);

// Candidature routes
router.get(
  "/my-candidatures",
  authenticateToken,
  votingController.getMyCandidatures
);

// Add route for getting all candidatures (admin access)
router.get(
  "/candidatures",
  authenticateToken,
  votingController.getAllCandidatures
);

// Add route for candidature submission
router.post(
  "/candidature",
  authenticateToken,
  votingController.submitCandidature
);

// Add route to update candidature status (admin)
router.put(
  "/candidature/:id/status",
  authenticateToken,
  votingController.updateCandidatureStatus
);

// Add route to get approved candidates for voting
router.get(
  "/approved-candidates",
  authenticateToken,
  votingController.getApprovedCandidates
);

// Voting authorization routes
router.post(
  "/authorize-voter",
  authenticateToken,
  votingController.authorizeVoter
);

// Add route for temporary voter authorization
router.post(
  "/authorize-temp-voter",
  authenticateToken,
  votingController.authorizeTemporaryVoter
);

router.get(
  "/check-authorization",
  authenticateToken,
  votingController.checkVotingAuthorization
);

// Voting routes
router.post("/cast-vote", authenticateToken, votingController.castVote);

// Admin statistics routes
router.get(
  "/statistics",
  authenticateToken,
  votingController.getVotingStatistics
);

router.get("/sessions", authenticateToken, votingController.getVotingSessions);

router.put(
  "/session/:sessionId/deactivate",
  authenticateToken,
  votingController.deactivateVotingSession
);

// System status routes
router.get(
  "/system-status",
  authenticateToken,
  votingController.getVotingSystemStatus
);

router.put(
  "/system-status",
  authenticateToken,
  votingController.updateVotingSystemStatus
);

// Candidature portal status routes
router.get(
  "/candidature-portal-status",
  authenticateToken,
  votingController.getCandidaturePortalStatus
);

router.put(
  "/candidature-portal-status",
  authenticateToken,
  votingController.updateCandidaturePortalStatus
);

// Election results route
router.get("/results", authenticateToken, votingController.getElectionResults);

// Reset election route
router.post(
  "/reset-election",
  authenticateToken,
  votingController.resetElection
);

// Voter management routes
router.get("/voters", authenticateToken, votingController.getAllVoters);
router.put(
  "/voter/:id/status",
  authenticateToken,
  votingController.updateVoterStatus
);

// Export router
module.exports = router;
