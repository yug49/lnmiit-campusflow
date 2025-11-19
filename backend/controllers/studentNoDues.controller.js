const StudentNoDues = require("../models/StudentNoDues");
const User = require("../models/User");
const { ApiError } = require("../utils/errorHandler");
const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

// Submit Student No Dues
exports.submitStudentNoDues = async (req, res, next) => {
    try {
        const {
            bankDetails,
            donation,
            initialSignature,
            walletAddress,
            documentHash,
            approvalFlow: submittedApprovalFlow,
        } = req.body;

        const student = await User.findById(req.user.id);
        if (!student) {
            return next(new ApiError(404, "Student not found"));
        }

        // Check if student already has an approved no dues
        const existingApproved = await StudentNoDues.findOne({
            studentId: req.user.id,
            status: "approved",
        });

        if (existingApproved) {
            return next(
                new ApiError(
                    400,
                    "You already have an approved no dues certificate. Each student can only get one no dues approved in their lifetime."
                )
            );
        }

        // Check if student has a pending or in-progress no dues
        const existingPending = await StudentNoDues.findOne({
            studentId: req.user.id,
            status: { $in: ["pending", "in_progress"] },
        });

        if (existingPending) {
            return next(
                new ApiError(
                    400,
                    "You already have a pending no dues request. Please wait for it to be processed."
                )
            );
        }

        // Get approval flow from request body (sent from frontend)
        let approvalFlow = submittedApprovalFlow || [];

        // Fallback to environment variable if not provided
        if (approvalFlow.length === 0) {
            const approvalFlowJson = process.env.STUDENT_NODUES_FLOW || "[]";
            try {
                approvalFlow = JSON.parse(approvalFlowJson);
            } catch (e) {
                approvalFlow = [];
            }
        }

        if (approvalFlow.length === 0) {
            return next(
                new ApiError(
                    400,
                    "No approval flow configured. Please contact administrator."
                )
            );
        }

        // Parse bank details and donation if they're strings
        let parsedBankDetails = bankDetails;
        let parsedDonation = donation;

        if (typeof bankDetails === "string") {
            parsedBankDetails = JSON.parse(bankDetails);
        }
        if (typeof donation === "string") {
            parsedDonation = JSON.parse(donation);
        }

        // Prepare student info
        const studentInfo = {
            name: student.name,
            email: student.email,
            rollNumber: student.rollNumber || student.email.split("@")[0],
            branch: student.branch,
            semester: student.semester,
            phone: student.phone,
        };

        // Generate PDF
        const pdfPath = await generateNoDuesPDF({
            studentInfo,
            bankDetails: parsedBankDetails,
            donation: parsedDonation,
            approvalFlow,
        });

        // Calculate file hash for the generated PDF
        const fileBuffer = fs.readFileSync(pdfPath);
        const calculatedHash = crypto
            .createHash("sha256")
            .update(fileBuffer)
            .digest("hex");

        // Note: We don't verify the provided documentHash against the PDF hash
        // because the frontend generates a hash from JSON data while the backend
        // generates a PDF. The frontend hash is used for the initial signature only.

        // Create initial signature using the provided hash (from frontend JSON)
        const initialSig = {
            signerEmail: student.email,
            signerName: student.name,
            department: "Student",
            walletAddress,
            signature: initialSignature,
            signedData: JSON.stringify({
                documentHash: documentHash, // Use frontend's hash for initial signature
                firstSigner: true,
            }),
            timestamp: new Date(),
            order: 0,
        };

        // Create no dues record with the PDF hash
        const noDues = new StudentNoDues({
            studentId: req.user.id,
            studentInfo,
            bankDetails: parsedBankDetails,
            donation: parsedDonation,
            document: {
                path: pdfPath,
                url: `/uploads/nodues/${path.basename(pdfPath)}`,
                hash: calculatedHash, // Use PDF hash for document storage
                size: fileBuffer.length,
            },
            approvalFlow,
            signatures: [initialSig],
            currentStage: 0,
            status: "pending",
        });

        await noDues.save();

        res.status(201).json({
            success: true,
            message: "No dues submitted successfully",
            data: noDues,
        });
    } catch (error) {
        next(new ApiError(500, error.message));
    }
};

// Generate No Dues PDF
async function generateNoDuesPDF({
    studentInfo,
    bankDetails,
    donation,
    approvalFlow,
}) {
    return new Promise((resolve, reject) => {
        try {
            const uploadsDir = path.join(__dirname, "..", "uploads", "nodues");
            if (!fs.existsSync(uploadsDir)) {
                fs.mkdirSync(uploadsDir, { recursive: true });
            }

            const filename = `nodues_${
                studentInfo.rollNumber
            }_${Date.now()}.pdf`;
            const filepath = path.join(uploadsDir, filename);

            const doc = new PDFDocument({ margin: 50 });
            const stream = fs.createWriteStream(filepath);

            doc.pipe(stream);

            // Header
            doc.fontSize(20)
                .font("Helvetica-Bold")
                .text("THE LNM INSTITUTE OF INFORMATION TECHNOLOGY", {
                    align: "center",
                });
            doc.fontSize(16).text("NO DUES CERTIFICATE", { align: "center" });
            doc.moveDown();

            // Student Information
            doc.fontSize(14).font("Helvetica-Bold").text("Student Information");
            doc.fontSize(11).font("Helvetica");
            doc.text(`Name: ${studentInfo.name}`);
            doc.text(`Roll Number: ${studentInfo.rollNumber}`);
            doc.text(`Email: ${studentInfo.email}`);
            if (studentInfo.branch) doc.text(`Branch: ${studentInfo.branch}`);
            if (studentInfo.semester)
                doc.text(`Semester: ${studentInfo.semester}`);
            if (studentInfo.phone) doc.text(`Phone: ${studentInfo.phone}`);
            doc.moveDown();

            // Bank Details
            if (bankDetails && bankDetails.accountNumber) {
                doc.fontSize(14).font("Helvetica-Bold").text("Bank Details");
                doc.fontSize(11).font("Helvetica");
                doc.text(
                    `Account Holder: ${bankDetails.accountHolderName || "N/A"}`
                );
                doc.text(`Account Number: ${bankDetails.accountNumber}`);
                doc.text(`IFSC Code: ${bankDetails.ifscCode || "N/A"}`);
                doc.text(`Bank Name: ${bankDetails.bankName || "N/A"}`);
                doc.text(`Branch: ${bankDetails.branchName || "N/A"}`);
                doc.moveDown();
            }

            // Donation
            if (donation && donation.amount > 0) {
                doc.fontSize(14).font("Helvetica-Bold").text("Donation");
                doc.fontSize(11).font("Helvetica");
                doc.text(`Amount: ₹${donation.amount}`);
                if (donation.purpose) doc.text(`Purpose: ${donation.purpose}`);
                doc.moveDown();
            }

            // Approval Flow
            doc.fontSize(14).font("Helvetica-Bold").text("Approval Flow");
            doc.fontSize(11).font("Helvetica");
            approvalFlow.forEach((approver, index) => {
                doc.text(
                    `${index + 1}. ${approver.department} - ${approver.email}`
                );
            });
            doc.moveDown();

            // Footer
            doc.fontSize(10)
                .font("Helvetica")
                .text(
                    `Generated on: ${new Date().toLocaleString()}`,
                    50,
                    doc.page.height - 100,
                    { align: "center" }
                );

            doc.end();

            stream.on("finish", () => {
                resolve(filepath);
            });

            stream.on("error", (err) => {
                reject(err);
            });
        } catch (error) {
            reject(error);
        }
    });
}

// Get My No Dues Status
exports.getMyNoDuesStatus = async (req, res, next) => {
    try {
        const noDues = await StudentNoDues.findOne({
            studentId: req.user.id,
        }).sort({ createdAt: -1 });

        // If student has a no dues record, use its approval flow
        // Otherwise, try to get from environment variable
        let approvalFlow = [];
        if (noDues && noDues.approvalFlow) {
            approvalFlow = noDues.approvalFlow;
        } else {
            const approvalFlowJson = process.env.STUDENT_NODUES_FLOW || "[]";
            try {
                approvalFlow = JSON.parse(approvalFlowJson);
            } catch (e) {
                approvalFlow = [];
            }
        }

        res.status(200).json({
            success: true,
            data: {
                noDues,
                approvalFlow,
                canSubmit: !noDues || noDues.status === "rejected",
            },
        });
    } catch (error) {
        next(new ApiError(500, error.message));
    }
};

// Get Pending No Dues for Approver
exports.getPendingNoDues = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id);

        const noDuesList = await StudentNoDues.find({
            status: { $in: ["pending", "in_progress"] },
            "approvalFlow.email": user.email.toLowerCase(),
        })
            .populate("studentId", "name email rollNumber")
            .lean()
            .sort({ createdAt: -1 });

        // Filter to only show where user is current approver
        const pendingForUser = noDuesList.filter((noDues) => {
            const currentApprover = noDues.approvalFlow[noDues.currentStage];
            return (
                currentApprover &&
                currentApprover.email.toLowerCase() === user.email.toLowerCase()
            );
        });

        res.status(200).json({
            success: true,
            count: pendingForUser.length,
            data: pendingForUser,
        });
    } catch (error) {
        next(new ApiError(500, error.message));
    }
};

// Get All No Dues (with filters)
exports.getAllNoDues = async (req, res, next) => {
    try {
        const { status } = req.query;
        const user = await User.findById(req.user.id);

        let query = {
            "approvalFlow.email": user.email.toLowerCase(),
        };

        if (status) {
            query.status = status;
        }

        const noDuesList = await StudentNoDues.find(query)
            .populate("studentId", "name email rollNumber")
            .lean()
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: noDuesList.length,
            data: noDuesList,
        });
    } catch (error) {
        next(new ApiError(500, error.message));
    }
};

// Sign No Dues
exports.signNoDues = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { signature, walletAddress, documentHash, signedData } = req.body;

        const noDues = await StudentNoDues.findById(id);
        if (!noDues) {
            return next(new ApiError(404, "No dues not found"));
        }

        const user = await User.findById(req.user.id);

        // Verify user can sign
        if (!noDues.canUserSign(user.email)) {
            return next(
                new ApiError(
                    403,
                    "You are not authorized to sign this no dues at this stage"
                )
            );
        }

        // Verify document hash
        if (documentHash !== noDues.document.hash) {
            return next(
                new ApiError(
                    400,
                    "Document hash mismatch. Document may have been tampered with."
                )
            );
        }

        // Get current approver details
        const currentApprover = noDues.approvalFlow[noDues.currentStage];

        // Add signature
        noDues.signatures.push({
            signerEmail: user.email,
            signerName: user.name,
            department: currentApprover.department,
            walletAddress,
            signature,
            signedData,
            timestamp: new Date(),
            order: noDues.currentStage + 1,
        });

        // Move to next stage
        noDues.currentStage += 1;

        // Check if all approvals are complete
        if (noDues.currentStage >= noDues.approvalFlow.length) {
            noDues.status = "approved";
            noDues.completedAt = new Date();
        } else {
            noDues.status = "in_progress";
        }

        await noDues.save();

        res.status(200).json({
            success: true,
            message: "No dues signed successfully",
            data: noDues,
        });
    } catch (error) {
        next(new ApiError(500, error.message));
    }
};

// Reject No Dues
exports.rejectNoDues = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { reason } = req.body;

        if (!reason || !reason.trim()) {
            return next(new ApiError(400, "Rejection reason is required"));
        }

        const noDues = await StudentNoDues.findById(id);
        if (!noDues) {
            return next(new ApiError(404, "No dues not found"));
        }

        const user = await User.findById(req.user.id);

        // Verify user can reject
        if (!noDues.canUserSign(user.email)) {
            return next(
                new ApiError(
                    403,
                    "You are not authorized to reject this no dues at this stage"
                )
            );
        }

        const currentApprover = noDues.approvalFlow[noDues.currentStage];

        noDues.status = "rejected";
        noDues.rejectionDetails = {
            rejectedBy: {
                email: user.email,
                name: user.name,
                department: currentApprover.department,
            },
            reason: reason.trim(),
            timestamp: new Date(),
        };

        await noDues.save();

        res.status(200).json({
            success: true,
            message: "No dues rejected successfully",
            data: noDues,
        });
    } catch (error) {
        next(new ApiError(500, error.message));
    }
};

// Get No Dues by ID
exports.getNoDuesById = async (req, res, next) => {
    try {
        const noDues = await StudentNoDues.findById(req.params.id)
            .populate("studentId", "name email rollNumber branch semester")
            .lean();

        if (!noDues) {
            return next(new ApiError(404, "No dues not found"));
        }

        res.status(200).json({
            success: true,
            data: noDues,
        });
    } catch (error) {
        next(new ApiError(500, error.message));
    }
};

// Get Approval Flow Config
exports.getApprovalFlowConfig = async (req, res, next) => {
    try {
        // TODO: Replace with database config when ready
        const approvalFlowJson = process.env.STUDENT_NODUES_FLOW || "[]";
        let approvalFlow = [];
        try {
            approvalFlow = JSON.parse(approvalFlowJson);
        } catch (e) {
            approvalFlow = [];
        }

        res.status(200).json({
            success: true,
            data: approvalFlow,
        });
    } catch (error) {
        next(new ApiError(500, error.message));
    }
};

// Delete Student No Dues (Development Only)
exports.deleteMyNoDues = async (req, res, next) => {
    try {
        // Only allow in development environment
        if (process.env.NODE_ENV !== "development") {
            return next(
                new ApiError(
                    403,
                    "This endpoint is only available in development mode"
                )
            );
        }

        const noDues = await StudentNoDues.findOne({
            studentId: req.user.id,
        });

        if (!noDues) {
            return next(new ApiError(404, "No dues record not found"));
        }

        // Delete the no dues record
        await StudentNoDues.findByIdAndDelete(noDues._id);

        res.status(200).json({
            success: true,
            message: "No dues record deleted successfully",
        });
    } catch (error) {
        next(new ApiError(500, error.message));
    }
};
