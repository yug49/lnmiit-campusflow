const Event = require("../models/Event");
const User = require("../models/User");
const apiResponse = require("../utils/apiResponse");

// @desc    Get all events
// @route   GET /api/events
// @access  Private
exports.getEvents = async (req, res) => {
  try {
    // Different behavior based on user role
    let query = {};

    // If council member, only show events created by this council member or their council
    if (
      req.userRoles.includes("council_member") &&
      !req.userRoles.includes("admin")
    ) {
      // Find events created by this user
      const userEvents = await Event.find({ organizer: req.user.id });

      // Get unique councils this user has created events for
      const userCouncils = [
        ...new Set(userEvents.map((event) => event.council)),
      ];

      // Query for events by this organizer or from the same councils
      query = {
        $or: [{ organizer: req.user.id }, { council: { $in: userCouncils } }],
      };
    }

    // Admin and faculty mentor can see all events

    const events = await Event.find(query)
      .populate("organizer", "name email")
      .populate("approvedBy", "name email");

    return apiResponse.success(res, {
      count: events.length,
      events,
    });
  } catch (error) {
    return apiResponse.error(res, error.message);
  }
};

// @desc    Get single event
// @route   GET /api/events/:id
// @access  Private
exports.getEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate("organizer", "name email")
      .populate("approvedBy", "name email");

    if (!event) {
      return apiResponse.notFound(res, "Event not found");
    }

    return apiResponse.success(res, event);
  } catch (error) {
    return apiResponse.error(res, error.message);
  }
};

// @desc    Create new event
// @route   POST /api/events
// @access  Private/CouncilMember
exports.createEvent = async (req, res) => {
  try {
    // Add user to req.body as organizer
    req.body.organizer = req.user.id;

    const event = await Event.create(req.body);

    return apiResponse.success(res, event, 201);
  } catch (error) {
    return apiResponse.error(res, error.message);
  }
};

// @desc    Update event
// @route   PUT /api/events/:id
// @access  Private/CouncilMember/Admin
exports.updateEvent = async (req, res) => {
  try {
    let event = await Event.findById(req.params.id);

    if (!event) {
      return apiResponse.notFound(res, "Event not found");
    }

    // Make sure user is event organizer or admin
    if (
      event.organizer.toString() !== req.user.id &&
      !req.userRoles.includes("admin")
    ) {
      return apiResponse.forbidden(res, "Not authorized to update this event");
    }

    // Don't allow changing approval status through this endpoint
    if (req.body.status) {
      delete req.body.status;
    }

    event = await Event.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    return apiResponse.success(res, event);
  } catch (error) {
    return apiResponse.error(res, error.message);
  }
};

// @desc    Delete event
// @route   DELETE /api/events/:id
// @access  Private/CouncilMember/Admin
exports.deleteEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return apiResponse.notFound(res, "Event not found");
    }

    // Make sure user is event organizer or admin
    if (
      event.organizer.toString() !== req.user.id &&
      !req.userRoles.includes("admin")
    ) {
      return apiResponse.forbidden(res, "Not authorized to delete this event");
    }

    // Don't allow deleting approved events
    if (event.status === "approved") {
      return apiResponse.badRequest(res, "Cannot delete an approved event");
    }

    await event.deleteOne();

    return apiResponse.success(res, {});
  } catch (error) {
    return apiResponse.error(res, error.message);
  }
};

// @desc    Approve/reject event
// @route   PUT /api/events/:id/approval
// @access  Private/FacultyMentor/Admin
exports.updateEventApproval = async (req, res) => {
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

    let event = await Event.findById(req.params.id);

    if (!event) {
      return apiResponse.notFound(res, "Event not found");
    }

    // Update event status
    const updateData = {
      status,
      approvedBy: req.user.id,
      approvalDate: Date.now(),
    };

    if (status === "rejected") {
      updateData.rejectionReason = rejectionReason;
    }

    event = await Event.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    });

    return apiResponse.success(res, event);
  } catch (error) {
    return apiResponse.error(res, error.message);
  }
};
