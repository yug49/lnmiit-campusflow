const MOU = require("../models/MOU");
const User = require("../models/User");
const apiResponse = require("../utils/apiResponse");

// @desc    Get all MOUs
// @route   GET /api/mous
// @access  Private
exports.getMOUs = async (req, res) => {
  try {
    // Different behavior based on user role
    let query = {};

    // If council member, only show MOUs created by this council member or their council
    if (
      req.userRoles.includes("council_member") &&
      !req.userRoles.includes("admin")
    ) {
      // Find MOUs created by this user
      const userMOUs = await MOU.find({ proposer: req.user.id });

      // Get unique councils this user has created MOUs for
      const userCouncils = [...new Set(userMOUs.map((mou) => mou.council))];

      // Query for MOUs by this proposer or from the same councils
      query = {
        $or: [{ proposer: req.user.id }, { council: { $in: userCouncils } }],
      };
    }

    // Admin and faculty mentor can see all MOUs

    const mous = await MOU.find(query)
      .populate("proposer", "name email")
      .populate("approvedBy", "name email");

    return apiResponse.success(res, {
      count: mous.length,
      mous,
    });
  } catch (error) {
    return apiResponse.error(res, error.message);
  }
};

// @desc    Get single MOU
// @route   GET /api/mous/:id
// @access  Private
exports.getMOU = async (req, res) => {
  try {
    const mou = await MOU.findById(req.params.id)
      .populate("proposer", "name email")
      .populate("approvedBy", "name email");

    if (!mou) {
      return apiResponse.notFound(res, "MOU not found");
    }

    return apiResponse.success(res, mou);
  } catch (error) {
    return apiResponse.error(res, error.message);
  }
};

// @desc    Create new MOU
// @route   POST /api/mous
// @access  Private/CouncilMember
exports.createMOU = async (req, res) => {
  try {
    // Add user to req.body as proposer
    req.body.proposer = req.user.id;

    const mou = await MOU.create(req.body);

    return apiResponse.success(res, mou, 201);
  } catch (error) {
    return apiResponse.error(res, error.message);
  }
};

// @desc    Update MOU
// @route   PUT /api/mous/:id
// @access  Private/CouncilMember/Admin
exports.updateMOU = async (req, res) => {
  try {
    let mou = await MOU.findById(req.params.id);

    if (!mou) {
      return apiResponse.notFound(res, "MOU not found");
    }

    // Make sure user is MOU proposer or admin
    if (
      mou.proposer.toString() !== req.user.id &&
      !req.userRoles.includes("admin")
    ) {
      return apiResponse.forbidden(res, "Not authorized to update this MOU");
    }

    // Don't allow changing approval status through this endpoint
    if (req.body.status) {
      delete req.body.status;
    }

    mou = await MOU.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    return apiResponse.success(res, mou);
  } catch (error) {
    return apiResponse.error(res, error.message);
  }
};

// @desc    Delete MOU
// @route   DELETE /api/mous/:id
// @access  Private/CouncilMember/Admin
exports.deleteMOU = async (req, res) => {
  try {
    const mou = await MOU.findById(req.params.id);

    if (!mou) {
      return apiResponse.notFound(res, "MOU not found");
    }

    // Make sure user is MOU proposer or admin
    if (
      mou.proposer.toString() !== req.user.id &&
      !req.userRoles.includes("admin")
    ) {
      return apiResponse.forbidden(res, "Not authorized to delete this MOU");
    }

    // Don't allow deleting approved MOUs
    if (mou.status === "approved") {
      return apiResponse.badRequest(res, "Cannot delete an approved MOU");
    }

    await mou.deleteOne();

    return apiResponse.success(res, {});
  } catch (error) {
    return apiResponse.error(res, error.message);
  }
};

// @desc    Approve/reject MOU
// @route   PUT /api/mous/:id/approval
// @access  Private/FacultyMentor/Admin
exports.updateMOUApproval = async (req, res) => {
  try {
    const { status, rejectionReason } = req.body;

    // Validate status
    if (!status || !["approved", "rejected"].includes(status)) {
      return apiResponse.badRequest(
        res,
        "Please provide valid status: approved or rejected"
      );
    }

    // If rejecting, reason is required
    if (status === "rejected" && !rejectionReason) {
      return apiResponse.badRequest(res, "Please provide a rejection reason");
    }

    let mou = await MOU.findById(req.params.id);

    if (!mou) {
      return apiResponse.notFound(res, "MOU not found");
    }

    // Update MOU status
    const updateData = {
      status,
      approvedBy: req.user.id,
      approvalDate: Date.now(),
    };

    if (status === "rejected") {
      updateData.rejectionReason = rejectionReason;
    }

    mou = await MOU.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    });

    return apiResponse.success(res, mou);
  } catch (error) {
    return apiResponse.error(res, error.message);
  }
};
