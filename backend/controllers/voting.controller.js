const Candidate = require("../models/Candidate");
const Vote = require("../models/Vote");
const VotingSession = require("../models/VotingSession");
const User = require("../models/User");
const { errorHandler } = require("../utils/errorHandler");

// Simple test function to ensure the controller is being imported correctly
exports.test = (req, res) => {
  res.status(200).json({ message: "Voting controller is working" });
};

/**
 * Submit a candidature application
 */
exports.submitCandidature = async (req, res) => {
  try {
    const { position, batch, statement, experience, achievements } = req.body;
    const userId = req.user.id;

    // Check if user already applied for this position
    const existingCandidate = await Candidate.findOne({
      user: userId,
      position,
    });

    if (existingCandidate) {
      // Update existing application if it was rejected or reverted
      if (["Rejected", "Reverted"].includes(existingCandidate.status)) {
        existingCandidate.batch = batch;
        existingCandidate.statement = statement;
        existingCandidate.experience = experience;
        existingCandidate.achievements = achievements;
        existingCandidate.status = "Pending";
        existingCandidate.remark = "";
        existingCandidate.updatedAt = Date.now();

        await existingCandidate.save();

        return res.status(200).json({
          success: true,
          message: "Candidature application resubmitted successfully",
          candidate: existingCandidate,
        });
      } else {
        return res.status(400).json({
          success: false,
          message: "You have already applied for this position",
        });
      }
    }

    // Create new application
    const candidate = new Candidate({
      user: userId,
      position,
      batch,
      statement,
      experience,
      achievements,
    });

    await candidate.save();

    res.status(201).json({
      success: true,
      message: "Candidature application submitted successfully",
      candidate,
    });
  } catch (error) {
    errorHandler(error, req, res);
  }
};

/**
 * Get candidate's own applications
 */
exports.getMyCandidatures = async (req, res) => {
  try {
    const userId = req.user.id;

    const candidatures = await Candidate.find({ user: userId });

    res.status(200).json({
      success: true,
      candidatures,
    });
  } catch (error) {
    errorHandler(error, req, res);
  }
};

/**
 * Admin: Get all candidature applications
 */
exports.getAllCandidatures = async (req, res) => {
  try {
    // Only allow admin access
    if (req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      });
    }

    const candidatures = await Candidate.find()
      .populate("user", "name email rollNumber")
      .sort({ submittedAt: -1 });

    res.status(200).json({
      success: true,
      candidatures,
    });
  } catch (error) {
    errorHandler(error, req, res);
  }
};

/**
 * Admin: Update candidature status
 */
exports.updateCandidatureStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, remark } = req.body;

    // Only allow admin access
    if (req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      });
    }

    // Validate status
    if (!["Approved", "Rejected", "Reverted"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status",
      });
    }

    const candidate = await Candidate.findById(id);

    if (!candidate) {
      return res.status(404).json({
        success: false,
        message: "Candidature application not found",
      });
    }

    candidate.status = status;
    candidate.remark = remark || "";
    candidate.updatedAt = Date.now();

    await candidate.save();

    res.status(200).json({
      success: true,
      message: "Candidature status updated successfully",
      candidate,
    });
  } catch (error) {
    errorHandler(error, req, res);
  }
};

/**
 * Get approved candidates for voting
 */
exports.getApprovedCandidates = async (req, res) => {
  try {
    const candidates = await Candidate.find({ status: "Approved" })
      .populate("user", "name email rollNumber")
      .sort({ position: 1, submittedAt: 1 });

    // Group candidates by position
    const candidatesByPosition = {};

    candidates.forEach((candidate) => {
      if (!candidatesByPosition[candidate.position]) {
        candidatesByPosition[candidate.position] = [];
      }

      candidatesByPosition[candidate.position].push({
        id: candidate._id,
        name: candidate.user.name,
        rollNumber: candidate.user.rollNumber,
        batch: candidate.batch,
        statement: candidate.statement,
        experience: candidate.experience,
        achievements: candidate.achievements,
      });
    });

    res.status(200).json({
      success: true,
      candidates: candidatesByPosition,
    });
  } catch (error) {
    errorHandler(error, req, res);
  }
};

/**
 * Admin: Authorize student for voting
 */
exports.authorizeVoter = async (req, res) => {
  try {
    const { studentId } = req.body;

    // Only allow admin access
    if (req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      });
    }

    // Check if the student exists and is a student
    const student = await User.findById(studentId);

    if (!student || student.role !== "student") {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

    // Check if student has already voted
    const existingVote = await Vote.findOne({ voter: studentId });

    if (existingVote) {
      return res.status(400).json({
        success: false,
        message: "Student has already voted",
      });
    }

    // Deactivate any existing sessions for the student
    await VotingSession.updateMany(
      { student: studentId, active: true },
      { active: false }
    );

    // Create new voting session with 5-minute expiration
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 5);

    const session = new VotingSession({
      student: studentId,
      authorizedBy: req.user.id,
      expiresAt,
    });

    await session.save();

    res.status(200).json({
      success: true,
      message: "Student authorized for voting",
      session,
    });
  } catch (error) {
    errorHandler(error, req, res);
  }
};

/**
 * Admin: Authorize temporary voter (non-student)
 */
exports.authorizeTemporaryVoter = async (req, res) => {
  try {
    const { email, name, purpose } = req.body;

    // Only allow admin access
    if (req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      });
    }

    // Check if a user with this email exists with any role
    let existingUser = await User.findOne({ email });

    // If user exists but is not a temp_voter
    if (existingUser && existingUser.role !== "temp_voter") {
      // Check if user has already voted
      const existingVote = await Vote.findOne({ voter: existingUser._id });

      if (existingVote) {
        return res.status(400).json({
          success: false,
          message: "This user has already voted",
        });
      }

      // Enable voting for existing user
      existingUser.votingEligible = true;
      await existingUser.save();

      // Deactivate any existing sessions for the user
      await VotingSession.updateMany(
        { student: existingUser._id, active: true },
        { active: false }
      );

      // Create new voting session with 5-minute expiration
      const expiresAt = new Date();
      expiresAt.setMinutes(expiresAt.getMinutes() + 5);

      const session = new VotingSession({
        student: existingUser._id,
        authorizedBy: req.user.id,
        expiresAt,
      });

      await session.save();

      return res.status(200).json({
        success: true,
        message: "Existing user authorized for voting",
        tempUser: {
          id: existingUser._id,
          name: existingUser.name,
          email: existingUser.email,
        },
        session,
      });
    }

    // Handle temp_voter case (either new or existing)
    let tempUser = existingUser;

    if (!tempUser) {
      // Create a temporary user
      tempUser = new User({
        name,
        email,
        role: "temp_voter",
        votingEligible: true,
        password: Math.random().toString(36).slice(-8), // Generate random password
        metadata: {
          purpose,
          createdBy: req.user.id,
        },
      });

      await tempUser.save();
    } else {
      // Update existing temp user
      tempUser.name = name;
      tempUser.votingEligible = true;
      tempUser.metadata = {
        ...tempUser.metadata,
        purpose,
        updatedBy: req.user.id,
        updatedAt: Date.now(),
      };

      await tempUser.save();
    }

    // Check if user has already voted
    const existingVote = await Vote.findOne({ voter: tempUser._id });

    if (existingVote) {
      return res.status(400).json({
        success: false,
        message: "This temporary voter has already voted",
      });
    }

    // Deactivate any existing sessions for the user
    await VotingSession.updateMany(
      { student: tempUser._id, active: true },
      { active: false }
    );

    // Create new voting session with 5-minute expiration
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 5);

    const session = new VotingSession({
      student: tempUser._id,
      authorizedBy: req.user.id,
      expiresAt,
    });

    await session.save();

    res.status(200).json({
      success: true,
      message: "Temporary voter authorized for voting",
      tempUser: {
        id: tempUser._id,
        name: tempUser.name,
        email: tempUser.email,
      },
      session,
    });
  } catch (error) {
    errorHandler(error, req, res);
  }
};

/**
 * Student: Check if authorized to vote
 */
exports.checkVotingAuthorization = async (req, res) => {
  try {
    const userId = req.user.id;

    // Check if already voted
    const existingVote = await Vote.findOne({ voter: userId });

    if (existingVote) {
      return res.status(200).json({
        success: true,
        authorized: false,
        alreadyVoted: true,
        message: "You have already cast your vote",
      });
    }

    // Find active voting session
    const now = new Date();

    const session = await VotingSession.findOne({
      student: userId,
      active: true,
      expiresAt: { $gt: now },
    });

    if (!session) {
      return res.status(200).json({
        success: true,
        authorized: false,
        message: "You are not authorized to vote at this time",
      });
    }

    res.status(200).json({
      success: true,
      authorized: true,
      session: {
        expiresAt: session.expiresAt,
      },
    });
  } catch (error) {
    errorHandler(error, req, res);
  }
};

/**
 * Student: Cast votes
 */
exports.castVote = async (req, res) => {
  try {
    const userId = req.user.id;
    const { votes } = req.body;

    // Check if already voted
    const existingVote = await Vote.findOne({ voter: userId });

    if (existingVote) {
      return res.status(400).json({
        success: false,
        message: "You have already cast your vote",
      });
    }

    // Check for active voting authorization
    const now = new Date();

    const session = await VotingSession.findOne({
      student: userId,
      active: true,
      expiresAt: { $gt: now },
    });

    if (!session) {
      return res.status(401).json({
        success: false,
        message: "Your voting authorization has expired or is not active",
      });
    }

    // Validate votes format and candidates
    if (
      !votes ||
      typeof votes !== "object" ||
      Object.keys(votes).length === 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid votes format",
      });
    }

    // Convert votes to a Map for MongoDB
    const votesMap = new Map();

    // Validate each vote
    for (const [position, candidateId] of Object.entries(votes)) {
      // Check if candidate exists and is approved for the position
      const candidate = await Candidate.findOne({
        _id: candidateId,
        position,
        status: "Approved",
      });

      if (!candidate) {
        return res.status(400).json({
          success: false,
          message: `Invalid candidate selection for position: ${position}`,
        });
      }

      votesMap.set(position, candidateId);
    }

    // Record the vote
    const vote = new Vote({
      voter: userId,
      votes: votesMap,
    });

    await vote.save();

    // Deactivate the voting session
    session.active = false;
    await session.save();

    res.status(201).json({
      success: true,
      message: "Your vote has been recorded successfully",
    });
  } catch (error) {
    errorHandler(error, req, res);
  }
};

/**
 * Admin: Get voting statistics
 */
exports.getVotingStatistics = async (req, res) => {
  try {
    // Only allow admin access
    if (req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      });
    }

    // Get total number of votes
    const totalVotes = await Vote.countDocuments();

    // Get all approved candidates
    const candidates = await Candidate.find({ status: "Approved" }).populate(
      "user",
      "name rollNumber"
    );

    // Initialize statistics
    const statistics = {
      totalVotes,
      positions: {},
    };

    // Group candidates by position
    candidates.forEach((candidate) => {
      if (!statistics.positions[candidate.position]) {
        statistics.positions[candidate.position] = {
          candidates: [],
          voteCounts: {},
        };
      }

      statistics.positions[candidate.position].candidates.push({
        id: candidate._id.toString(),
        name: candidate.user.name,
        rollNumber: candidate.user.rollNumber,
      });
    });

    // Count votes for each candidate
    const votes = await Vote.find();

    votes.forEach((vote) => {
      vote.votes.forEach((candidateId, position) => {
        const candidateIdStr = candidateId.toString();
        if (statistics.positions[position]) {
          if (!statistics.positions[position].voteCounts[candidateIdStr]) {
            statistics.positions[position].voteCounts[candidateIdStr] = 0;
          }
          statistics.positions[position].voteCounts[candidateIdStr]++;
        }
      });
    });

    res.status(200).json({
      success: true,
      statistics,
    });
  } catch (error) {
    errorHandler(error, req, res);
  }
};

/**
 * Admin: Get all voting sessions
 */
exports.getVotingSessions = async (req, res) => {
  try {
    // Only allow admin access
    if (req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      });
    }

    // Get most recent voting sessions
    const sessions = await VotingSession.find()
      .populate("student", "name email rollNumber")
      .populate("authorizedBy", "name")
      .sort({ createdAt: -1 })
      .limit(50);

    res.status(200).json({
      success: true,
      sessions,
    });
  } catch (error) {
    errorHandler(error, req, res);
  }
};

/**
 * Admin: Deactivate a voting session
 */
exports.deactivateVotingSession = async (req, res) => {
  try {
    const { sessionId } = req.params;

    // Only allow admin access
    if (req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      });
    }

    const session = await VotingSession.findById(sessionId);

    if (!session) {
      return res.status(404).json({
        success: false,
        message: "Voting session not found",
      });
    }

    session.active = false;
    await session.save();

    res.status(200).json({
      success: true,
      message: "Voting session deactivated successfully",
    });
  } catch (error) {
    errorHandler(error, req, res);
  }
};

/**
 * Get/Update Voting System Status
 */
exports.getVotingSystemStatus = async (req, res) => {
  try {
    // For now, store this in memory or in a system settings collection
    // This is a placeholder implementation
    res.status(200).json({
      success: true,
      isActive: true, // Default to active
    });
  } catch (error) {
    errorHandler(error, req, res);
  }
};

/**
 * Update Voting System Status
 */
exports.updateVotingSystemStatus = async (req, res) => {
  try {
    const { isActive } = req.body;

    // Only allow admin access
    if (req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      });
    }

    // In a real implementation, you would update a database record
    // For now, this is a placeholder
    res.status(200).json({
      success: true,
      isActive,
      message: `Voting system is now ${isActive ? "active" : "inactive"}`,
    });
  } catch (error) {
    errorHandler(error, req, res);
  }
};

/**
 * Get Candidature Portal Status
 */
exports.getCandidaturePortalStatus = async (req, res) => {
  try {
    // For now, store this in memory or in a system settings collection
    // This is a placeholder implementation
    res.status(200).json({
      success: true,
      isOpen: true, // Default to open
    });
  } catch (error) {
    errorHandler(error, req, res);
  }
};

/**
 * Update Candidature Portal Status
 */
exports.updateCandidaturePortalStatus = async (req, res) => {
  try {
    const { isOpen } = req.body;

    // Only allow admin access
    if (req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      });
    }

    // If portal is being closed, delete all pending candidature applications
    if (!isOpen) {
      // Delete all pending candidature applications
      await Candidate.deleteMany({ status: "Pending" });
    }

    // In a real implementation, you would update a database record
    // For now, this is a placeholder
    res.status(200).json({
      success: true,
      isOpen,
      message: `Candidature portal is now ${isOpen ? "open" : "closed"}`,
    });
  } catch (error) {
    errorHandler(error, req, res);
  }
};

/**
 * Get Election Results
 */
exports.getElectionResults = async (req, res) => {
  try {
    // Only show results to admin or after election is closed
    if (req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      });
    }

    // Get all approved candidates
    const candidates = await Candidate.find({ status: "Approved" }).populate(
      "user",
      "name rollNumber"
    );

    // Get all votes
    const votes = await Vote.find();

    // Calculate results by position
    const results = {};

    candidates.forEach((candidate) => {
      const position = candidate.position;

      if (!results[position]) {
        results[position] = {
          position,
          candidates: [],
        };
      }

      // Count votes for this candidate
      const voteCount = votes.reduce((count, vote) => {
        if (vote.votes.get(position)?.toString() === candidate._id.toString()) {
          return count + 1;
        }
        return count;
      }, 0);

      results[position].candidates.push({
        id: candidate._id,
        name: candidate.user.name,
        rollNumber: candidate.user.rollNumber,
        votes: voteCount,
      });
    });

    // Sort candidates by votes
    Object.values(results).forEach((positionResult) => {
      positionResult.candidates.sort((a, b) => b.votes - a.votes);

      // Determine winner
      if (positionResult.candidates.length > 0) {
        const maxVotes = positionResult.candidates[0].votes;
        const winners = positionResult.candidates.filter(
          (c) => c.votes === maxVotes
        );

        positionResult.winners = winners.map((w) => ({
          id: w.id,
          name: w.name,
          votes: w.votes,
        }));

        positionResult.isTie = winners.length > 1;
      }
    });

    res.status(200).json({
      success: true,
      results: Object.values(results),
      totalVotes: votes.length,
    });
  } catch (error) {
    errorHandler(error, req, res);
  }
};

/**
 * Admin: Get all voters (students who can vote)
 */
exports.getAllVoters = async (req, res) => {
  try {
    // Only allow admin access
    if (req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      });
    }

    // Fetch all students with their voting eligibility status
    const students = await User.find({ role: "student" })
      .select("_id name email studentId votingEligible")
      .sort({ name: 1 });

    res.status(200).json({
      success: true,
      count: students.length,
      voters: students,
    });
  } catch (error) {
    errorHandler(error, req, res);
  }
};

/**
 * Admin: Update voter eligibility status
 */
exports.updateVoterStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { eligible } = req.body;

    // Only allow admin access
    if (req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      });
    }

    // Find and update the user
    const user = await User.findById(id);

    if (!user || user.role !== "student") {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

    user.votingEligible = eligible;
    await user.save();

    res.status(200).json({
      success: true,
      message: `Student voting eligibility updated to ${
        eligible ? "eligible" : "ineligible"
      }`,
      voter: {
        _id: user._id,
        name: user.name,
        email: user.email,
        studentId: user.studentId,
        votingEligible: user.votingEligible,
      },
    });
  } catch (error) {
    errorHandler(error, req, res);
  }
};

/**
 * Admin: Reset election (delete all votes and candidates)
 */
exports.resetElection = async (req, res) => {
  try {
    // Only allow admin access
    if (req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      });
    }

    // Delete all votes
    await Vote.deleteMany({});

    // Delete all candidates instead of just resetting their status
    await Candidate.deleteMany({});

    // Delete all voting sessions
    await VotingSession.deleteMany({});

    res.status(200).json({
      success: true,
      message: "Election has been reset successfully",
    });
  } catch (error) {
    errorHandler(error, req, res);
  }
};

/**
 * Admin: Get election results
 */
exports.getElectionResults = async (req, res) => {
  try {
    // Only allow admin access
    if (req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      });
    }

    // Get all votes
    const votes = await Vote.find();

    // Get approved candidates
    const candidates = await Candidate.find({ status: "Approved" })
      .populate("user", "name rollNumber")
      .lean();

    // Count votes for each candidate
    const results = {};
    const totalVotes = votes.length;

    // Initialize results structure by position
    candidates.forEach((candidate) => {
      if (!results[candidate.position]) {
        results[candidate.position] = [];
      }

      results[candidate.position].push({
        candidateId: candidate._id.toString(),
        name: candidate.user.name,
        rollNumber: candidate.user.rollNumber,
        voteCount: 0,
        percentage: 0,
      });
    });

    // Count votes - handle both Map objects and plain objects from lean()
    votes.forEach((vote) => {
      // Check if vote.votes is a Map or a plain object
      if (vote.votes instanceof Map) {
        // It's a Map, use forEach
        vote.votes.forEach((candidateId, position) => {
          if (results[position]) {
            const candidateResult = results[position].find(
              (c) => c.candidateId === candidateId.toString()
            );

            if (candidateResult) {
              candidateResult.voteCount += 1;
            }
          }
        });
      } else if (vote.votes && typeof vote.votes === "object") {
        // It's likely a plain object from MongoDB
        Object.entries(vote.votes).forEach(([position, candidateId]) => {
          if (results[position]) {
            const candidateResult = results[position].find(
              (c) => c.candidateId === candidateId.toString()
            );

            if (candidateResult) {
              candidateResult.voteCount += 1;
            }
          }
        });
      }
    });

    // Calculate percentages after all votes are counted
    Object.values(results).forEach((candidates) => {
      candidates.forEach((candidate) => {
        candidate.percentage =
          totalVotes > 0
            ? Math.round((candidate.voteCount / totalVotes) * 100)
            : 0;
      });
    });

    res.status(200).json({
      success: true,
      results: results,
      totalVotes: totalVotes,
      timestamp: new Date(),
    });
  } catch (error) {
    errorHandler(error, req, res);
  }
};
