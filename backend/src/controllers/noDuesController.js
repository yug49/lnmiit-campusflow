const NoDues = require("../models/NoDues");
const User = require("../models/User");
const apiResponse = require("../utils/apiResponse");

// @desc    Get all no dues forms
// @route   GET /api/nodues
// @access  Private/Admin/HOD
exports.getAllNoDuesForms = async (req, res) => {
  try {
    let query = {};

    // If HOD, only show no dues forms from their department
    if (
      req.userRoles.includes("head_of_department") &&
      !req.userRoles.includes("admin")
    ) {
      // Get the department of the HOD
      const hod = await User.findById(req.user.id);
      if (hod && hod.department) {
        query.department = hod.department;
      }
    }

    const noDuesForms = await NoDues.find(query)
      .populate("user", "name email")
      .populate("items.approvedBy", "name email");

    return apiResponse.success(res, {
      count: noDuesForms.length,
      noDuesForms,
    });
  } catch (error) {
    return apiResponse.error(res, error.message);
  }
};

// @desc    Get no dues form by ID
// @route   GET /api/nodues/:id
// @access  Private
exports.getNoDuesForm = async (req, res) => {
  try {
    const noDues = await NoDues.findById(req.params.id)
      .populate("user", "name email")
      .populate("items.approvedBy", "name email");

    if (!noDues) {
      return apiResponse.notFound(res, "No dues form not found");
    }

    // Check permission: user can view own form, HOD can view forms from their department, admin can view all
    if (
      noDues.user.toString() !== req.user.id &&
      !req.userRoles.includes("admin") &&
      !(
        req.userRoles.includes("head_of_department") &&
        noDues.department === req.user.department
      )
    ) {
      return apiResponse.forbidden(
        res,
        "Not authorized to view this no dues form"
      );
    }

    return apiResponse.success(res, noDues);
  } catch (error) {
    return apiResponse.error(res, error.message);
  }
};

// @desc    Create new no dues form
// @route   POST /api/nodues
// @access  Private
exports.createNoDuesForm = async (req, res) => {
  try {
    // Set user
    req.body.user = req.user.id;

    // Determine user type based on roles
    req.body.userType = req.userRoles.includes("faculty")
      ? "faculty"
      : "student";

    // If faculty, set department
    if (req.body.userType === "faculty") {
      const faculty = await User.findById(req.user.id);
      if (faculty && faculty.department) {
        req.body.department = faculty.department;
      } else {
        return apiResponse.badRequest(res, "Faculty must have a department");
      }
    }

    // Check if user already has an active no dues form
    const existingForm = await NoDues.findOne({
      user: req.user.id,
      overallStatus: { $in: ["pending", "approved"] },
    });

    if (existingForm) {
      return apiResponse.badRequest(
        res,
        "You already have an active no dues form"
      );
    }

    const noDues = await NoDues.create(req.body);

    return apiResponse.success(res, noDues, 201);
  } catch (error) {
    return apiResponse.error(res, error.message);
  }
};

// @desc    Get current user's no dues forms
// @route   GET /api/nodues/my
// @access  Private
exports.getMyNoDuesForms = async (req, res) => {
  try {
    const noDuesForms = await NoDues.find({ user: req.user.id })
      .populate("items.approvedBy", "name email")
      .sort("-submittedDate");

    return apiResponse.success(res, {
      count: noDuesForms.length,
      noDuesForms,
    });
  } catch (error) {
    return apiResponse.error(res, error.message);
  }
};

// @desc    Update no dues item approval
// @route   PUT /api/nodues/:id/items/:itemId
// @access  Private/HOD/Admin
exports.updateNoDuesItemApproval = async (req, res) => {
  try {
    const { status, comments } = req.body;

    // Validate status
    if (!status || !["approved", "rejected"].includes(status)) {
      return apiResponse.badRequest(
        res,
        "Please provide valid status: approved or rejected"
      );
    }

    // If rejecting, comments are required
    if (status === "rejected" && !comments) {
      return apiResponse.badRequest(
        res,
        "Please provide comments for rejection"
      );
    }

    let noDues = await NoDues.findById(req.params.id);

    if (!noDues) {
      return apiResponse.notFound(res, "No dues form not found");
    }

    // Check permission: HOD can only approve items from their department, admin can approve all
    if (
      !req.userRoles.includes("admin") &&
      !(
        req.userRoles.includes("head_of_department") &&
        noDues.department === req.user.department
      )
    ) {
      return apiResponse.forbidden(
        res,
        "Not authorized to update this no dues form"
      );
    }

    // Find the item
    const itemIndex = noDues.items.findIndex(
      (item) => item._id.toString() === req.params.itemId
    );

    if (itemIndex === -1) {
      return apiResponse.notFound(res, "No dues item not found");
    }

    // Update the item
    noDues.items[itemIndex].status = status;
    noDues.items[itemIndex].approvedBy = req.user.id;
    noDues.items[itemIndex].approvalDate = Date.now();
    if (comments) {
      noDues.items[itemIndex].comments = comments;
    }

    // Check if all items are approved, and update overall status if so
    const allApproved = noDues.items.every(
      (item) => item.status === "approved"
    );
    if (allApproved) {
      noDues.overallStatus = "approved";
      noDues.completedDate = Date.now();
    }

    // Check if any item is rejected, and update overall status if so
    const anyRejected = noDues.items.some((item) => item.status === "rejected");
    if (anyRejected) {
      noDues.overallStatus = "rejected";
    }

    await noDues.save();

    return apiResponse.success(res, noDues);
  } catch (error) {
    return apiResponse.error(res, error.message);
  }
};
