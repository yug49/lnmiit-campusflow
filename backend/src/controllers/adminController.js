const User = require("../models/User");
const apiResponse = require("../utils/apiResponse");
const fs = require("fs");
const path = require("path");
const csv = require("csv-parser");

// @desc    Bulk upload users from CSV file
// @route   POST /api/admin/users/bulk-upload
// @access  Private/Admin
exports.bulkUploadUsers = async (req, res) => {
  try {
    if (!req.files || !req.files.csvFile) {
      return apiResponse.badRequest(res, "Please upload a CSV file");
    }

    const csvFile = req.files.csvFile;
    const uploadPath = path.join(
      __dirname,
      "..",
      "..",
      "uploads",
      "temp",
      csvFile.name
    );

    // Ensure directory exists
    const dir = path.dirname(uploadPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    // Save the file temporarily
    await csvFile.mv(uploadPath);

    const results = [];
    const errors = [];

    // Process the CSV file
    fs.createReadStream(uploadPath)
      .pipe(csv())
      .on("data", async (data) => {
        // Validate required fields
        if (!data.email || !data.password || !data.name || !data.roles) {
          errors.push(
            `Row with email ${
              data.email || "unknown"
            } is missing required fields`
          );
          return;
        }

        try {
          // Check if user already exists
          const existingUser = await User.findOne({ email: data.email });

          if (existingUser) {
            errors.push(`User with email ${data.email} already exists`);
            return;
          }

          // Parse roles from CSV (comma separated string)
          const roles = data.roles.split(",").map((role) => role.trim());

          // Create user object
          const userData = {
            name: data.name,
            email: data.email,
            password: data.password,
            roles: roles,
          };

          // Add department if provided and user is faculty
          if (data.department && roles.includes("faculty")) {
            userData.department = data.department;
          }

          // Create user
          await User.create(userData);
          results.push(`User ${data.email} created successfully`);
        } catch (error) {
          errors.push(`Error creating user ${data.email}: ${error.message}`);
        }
      })
      .on("end", () => {
        // Clean up the uploaded file
        fs.unlinkSync(uploadPath);

        return apiResponse.success(res, {
          success: results,
          errors: errors,
        });
      });
  } catch (error) {
    return apiResponse.error(res, `Error processing upload: ${error.message}`);
  }
};

// @desc    Generate CSV template for user upload
// @route   GET /api/admin/users/csv-template
// @access  Private/Admin
exports.getCsvTemplate = async (req, res) => {
  const templatePath = path.join(
    __dirname,
    "..",
    "..",
    "templates",
    "user_upload_template.csv"
  );

  // Check if template exists, if not create it
  if (!fs.existsSync(templatePath)) {
    const dir = path.dirname(templatePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    // Create template content
    const templateContent =
      "name,email,password,roles,department\n" +
      "John Doe,johndoe@lnmiit.ac.in,password,student,\n" +
      'Jane Smith,janesmith@lnmiit.ac.in,password,"faculty,faculty_mentor",CSE\n' +
      'Alex Johnson,alexj@lnmiit.ac.in,password,"student,council_member",';

    fs.writeFileSync(templatePath, templateContent);
  }

  res.download(templatePath, "user_upload_template.csv");
};

// @desc    Batch update user roles
// @route   POST /api/admin/users/batch-update
// @access  Private/Admin
exports.batchUpdateUsers = async (req, res) => {
  try {
    const { updates } = req.body;

    if (!updates || !Array.isArray(updates) || updates.length === 0) {
      return apiResponse.badRequest(
        res,
        "Please provide an array of user updates"
      );
    }

    const results = [];
    const errors = [];

    for (const update of updates) {
      try {
        const { email, roles, department } = update;

        if (!email) {
          errors.push("Email is required for each update");
          continue;
        }

        const user = await User.findOne({ email });

        if (!user) {
          errors.push(`User with email ${email} not found`);
          continue;
        }

        // Update roles if provided
        if (roles && Array.isArray(roles)) {
          user.roles = roles;
        }

        // Update department if provided and user is faculty
        if (department && user.roles.includes("faculty")) {
          user.department = department;
        }

        await user.save();
        results.push(`User ${email} updated successfully`);
      } catch (error) {
        errors.push(`Error updating user ${update.email}: ${error.message}`);
      }
    }

    return apiResponse.success(res, {
      success: results,
      errors: errors,
    });
  } catch (error) {
    return apiResponse.error(res, error.message);
  }
};

// @desc    Annual batch promotion (move students to next year, graduate final years)
// @route   POST /api/admin/users/annual-promotion
// @access  Private/Admin
exports.annualPromotion = async (req, res) => {
  try {
    const { academicYear } = req.body;

    if (!academicYear) {
      return apiResponse.badRequest(
        res,
        "Please provide the current academic year"
      );
    }

    const yearPattern = /^\d{2}$/; // Two-digit year pattern (e.g., 22 for 2022)
    if (!yearPattern.test(academicYear)) {
      return apiResponse.badRequest(
        res,
        "Academic year should be in two-digit format (e.g., 22 for 2022)"
      );
    }

    const prevYear = parseInt(academicYear) - 1;
    const prevYearStr = prevYear.toString().padStart(2, "0");

    const results = [];
    const errors = [];

    // Find graduating students (those with email starting with the pattern (academicYear-4)ucs, etc.)
    const graduatingYear = parseInt(academicYear) - 4;
    const graduatingYearStr = graduatingYear.toString().padStart(2, "0");

    // Find students with this pattern and mark them as alumni or remove if needed
    const graduatingStudents = await User.find({
      email: { $regex: `^${graduatingYearStr}u[a-z]{2}\\d+@lnmiit\\.ac\\.in$` },
      roles: { $in: ["student"] },
    });

    results.push(
      `Found ${graduatingStudents.length} graduating students from batch ${graduatingYearStr}`
    );

    // Handle graduating students here (could be removing them, marking as alumni, etc.)
    // For now, we'll just log them

    // Update student IDs in emails if needed for current batches
    // This is a placeholder for actual logic that might be needed for your institution

    return apiResponse.success(res, {
      success: results,
      errors: errors,
      message: "Annual promotion processed successfully",
      details: {
        graduatingBatch: graduatingYearStr,
        studentsAffected: graduatingStudents.length,
      },
    });
  } catch (error) {
    return apiResponse.error(res, error.message);
  }
};

// @desc    Get user statistics
// @route   GET /api/admin/users/stats
// @access  Private/Admin
exports.getUserStats = async (req, res) => {
  try {
    // Count users by role
    const studentCount = await User.countDocuments({ roles: "student" });
    const councilMemberCount = await User.countDocuments({
      roles: "council_member",
    });
    const facultyCount = await User.countDocuments({ roles: "faculty" });
    const facultyMentorCount = await User.countDocuments({
      roles: "faculty_mentor",
    });
    const hodCount = await User.countDocuments({ roles: "head_of_department" });
    const adminCount = await User.countDocuments({ roles: "admin" });

    // Count users by department (for faculty)
    const departmentStats = [];
    const departments = await User.distinct("department", { roles: "faculty" });

    for (const department of departments) {
      if (department) {
        const count = await User.countDocuments({
          roles: "faculty",
          department,
        });
        departmentStats.push({ department, count });
      }
    }

    return apiResponse.success(res, {
      totalUsers: await User.countDocuments(),
      roleStats: {
        students: studentCount,
        councilMembers: councilMemberCount,
        faculty: facultyCount,
        facultyMentors: facultyMentorCount,
        headsOfDepartment: hodCount,
        admins: adminCount,
      },
      departmentStats,
    });
  } catch (error) {
    return apiResponse.error(res, error.message);
  }
};
