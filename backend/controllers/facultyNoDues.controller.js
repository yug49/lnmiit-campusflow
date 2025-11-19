const FacultyNoDues = require("../models/FacultyNoDues");
const User = require("../models/User");
const { ApiError } = require("../utils/errorHandler");
const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const QRCode = require("qrcode");

// Submit Faculty No Dues
exports.submitFacultyNoDues = async (req, res, next) => {
    try {
        const {
            bankDetails,
            donation,
            initialSignature,
            walletAddress,
            documentHash,
            approvalFlow: submittedApprovalFlow,
        } = req.body;

        const faculty = await User.findById(req.user.id);
        if (!faculty) {
            return next(new ApiError(404, "Faculty not found"));
        }

        // Check if faculty already has an approved no dues
        const existingApproved = await FacultyNoDues.findOne({
            facultyId: req.user.id,
            status: "approved",
        });

        if (existingApproved) {
            return next(
                new ApiError(
                    400,
                    "You already have an approved no dues certificate. Each faculty can only get one no dues approved in their lifetime."
                )
            );
        }

        // Check if faculty has a pending or in-progress no dues
        const existingPending = await FacultyNoDues.findOne({
            facultyId: req.user.id,
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
            const approvalFlowJson = process.env.FACULTY_NODUES_FLOW || "[]";
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

        // Prepare faculty info
        const facultyInfo = {
            name: faculty.name,
            email: faculty.email,
            employeeId: faculty.employeeId || faculty.email.split("@")[0],
            department: faculty.department,
            designation: faculty.designation || "Faculty",
            phone: faculty.phone,
        };

        // Generate PDF with initial signature QR code
        const pdfPath = await generateNoDuesPDF({
            facultyInfo,
            bankDetails: parsedBankDetails,
            donation: parsedDonation,
            approvalFlow,
            finalSignatureHash: initialSignature, // Use initial signature for QR
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
            signerEmail: faculty.email,
            signerName: faculty.name,
            department: faculty.department || "Faculty",
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
        const noDues = new FacultyNoDues({
            facultyId: req.user.id,
            facultyInfo,
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
            message: "Faculty no dues submitted successfully",
            data: noDues,
        });
    } catch (error) {
        next(new ApiError(500, error.message));
    }
};

// Generate No Dues PDF
async function generateNoDuesPDF({
    facultyInfo,
    bankDetails,
    donation,
    approvalFlow,
    finalSignatureHash = null,
}) {
    return new Promise(async (resolve, reject) => {
        try {
            // Create uploads directory if it doesn't exist
            const uploadsDir = path.join(__dirname, "../uploads/nodues");
            if (!fs.existsSync(uploadsDir)) {
                fs.mkdirSync(uploadsDir, { recursive: true });
            }

            // Generate unique filename
            const filename = `faculty_nodues_${Date.now()}_${Math.random()
                .toString(36)
                .substring(7)}.pdf`;
            const filePath = path.join(uploadsDir, filename);

            // Create PDF
            const doc = new PDFDocument({ margin: 50 });
            const stream = fs.createWriteStream(filePath);

            doc.pipe(stream);

            // Header
            doc.fontSize(20)
                .font("Helvetica-Bold")
                .text("FACULTY NO DUES CERTIFICATE", { align: "center" });
            doc.moveDown();

            doc.fontSize(12)
                .font("Helvetica")
                .text(`Generated on: ${new Date().toLocaleDateString()}`, {
                    align: "center",
                });
            doc.moveDown(2);

            // Faculty Information
            doc.fontSize(14).font("Helvetica-Bold").text("Faculty Information");
            doc.moveDown(0.5);

            doc.fontSize(11).font("Helvetica");
            doc.text(`Name: ${facultyInfo.name}`);
            doc.text(`Employee ID: ${facultyInfo.employeeId}`);
            doc.text(`Email: ${facultyInfo.email}`);
            doc.text(`Department: ${facultyInfo.department}`);
            doc.text(`Designation: ${facultyInfo.designation}`);
            if (facultyInfo.phone) {
                doc.text(`Phone: ${facultyInfo.phone}`);
            }
            doc.moveDown(2);

            // Bank Details
            doc.fontSize(14).font("Helvetica-Bold").text("Bank Details");
            doc.moveDown(0.5);

            doc.fontSize(11).font("Helvetica");
            doc.text(`Account Holder Name: ${bankDetails.accountHolderName}`);
            doc.text(`Account Number: ${bankDetails.accountNumber}`);
            doc.text(`IFSC Code: ${bankDetails.ifscCode}`);
            doc.text(`Bank Name: ${bankDetails.bankName}`);
            doc.text(`Branch: ${bankDetails.branchName}`);
            doc.moveDown(2);

            // Donation Information
            doc.fontSize(14).font("Helvetica-Bold").text("Donation");
            doc.moveDown(0.5);

            doc.fontSize(11).font("Helvetica");
            doc.text(`Amount: ₹${donation.amount || 0}`);
            doc.text(`Purpose: ${donation.purpose || "Faculty Welfare Fund"}`);
            doc.moveDown(2);

            // Approval Flow
            doc.fontSize(14).font("Helvetica-Bold").text("Approval Workflow");
            doc.moveDown(0.5);

            doc.fontSize(11).font("Helvetica");
            approvalFlow.forEach((approver, index) => {
                doc.text(
                    `${index + 1}. ${approver.department} - ${approver.email}`
                );
            });
            doc.moveDown(2);

            // Signature Section
            doc.fontSize(14).font("Helvetica-Bold").text("Signatures");
            doc.moveDown(0.5);

            doc.fontSize(10)
                .font("Helvetica-Oblique")
                .text(
                    "Digital signatures will be added as each approver signs this document."
                );
            doc.moveDown(3);

            // Footer
            doc.fontSize(9)
                .font("Helvetica-Oblique")
                .text(
                    "This is a digitally signed document. All signatures are verified using blockchain technology.",
                    50,
                    doc.page.height - 100,
                    { align: "center" }
                );

            // Add QR code if finalSignatureHash is provided
            if (finalSignatureHash) {
                try {
                    // Generate QR code as data URL
                    const qrDataUrl = await QRCode.toDataURL(
                        finalSignatureHash,
                        {
                            width: 100,
                            margin: 1,
                        }
                    );

                    // Convert data URL to buffer
                    const qrBuffer = Buffer.from(
                        qrDataUrl.split(",")[1],
                        "base64"
                    );

                    // Add QR code at center-bottom of page
                    const qrSize = 80;
                    const qrX = (doc.page.width - qrSize) / 2;
                    const qrY = doc.page.height - 80;

                    doc.image(qrBuffer, qrX, qrY, {
                        width: qrSize,
                        height: qrSize,
                    });

                    doc.fontSize(8).text(
                        "Scan to verify",
                        qrX,
                        qrY + qrSize + 2,
                        {
                            width: qrSize,
                            align: "center",
                        }
                    );
                } catch (qrError) {
                    console.error("Error generating QR code:", qrError);
                }
            }

            doc.end();

            stream.on("finish", () => {
                resolve(filePath);
            });

            stream.on("error", (error) => {
                reject(error);
            });
        } catch (error) {
            reject(error);
        }
    });
}

// Get My No Dues Status
exports.getMyNoDuesStatus = async (req, res, next) => {
    try {
        const noDues = await FacultyNoDues.findOne({
            facultyId: req.user.id,
        }).sort({ createdAt: -1 });

        // If faculty has a no dues record, use its approval flow
        // Otherwise, try to get from environment variable
        let approvalFlow = [];
        if (noDues && noDues.approvalFlow) {
            approvalFlow = noDues.approvalFlow;
        } else {
            const approvalFlowJson = process.env.FACULTY_NODUES_FLOW || "[]";
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

        const noDuesList = await FacultyNoDues.find({
            status: { $in: ["pending", "in_progress"] },
            "approvalFlow.email": user.email.toLowerCase(),
        })
            .populate("facultyId", "name email employeeId")
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
            data: pendingForUser,
        });
    } catch (error) {
        next(new ApiError(500, error.message));
    }
};

// Get All No Dues (Admin only)
exports.getAllNoDues = async (req, res, next) => {
    try {
        const { status } = req.query;

        let query = {};
        if (status) {
            query.status = status;
        }

        const noDuesList = await FacultyNoDues.find(query)
            .populate("facultyId", "name email employeeId department")
            .lean()
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            data: noDuesList,
        });
    } catch (error) {
        next(new ApiError(500, error.message));
    }
};

// Sign No Dues (Add signature to chain)
exports.signNoDues = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { signature, walletAddress, documentHash, signedData } = req.body;

        const noDues = await FacultyNoDues.findById(id);
        if (!noDues) {
            return next(new ApiError(404, "No dues not found"));
        }

        const user = await User.findById(req.user.id);

        // Check if user can sign at current stage
        if (!noDues.canUserSign(user.email)) {
            return next(
                new ApiError(
                    403,
                    "You are not authorized to sign at this stage"
                )
            );
        }

        // Create signature entry
        const newSignature = {
            signerEmail: user.email,
            signerName: user.name,
            department: user.department || "Admin",
            walletAddress,
            signature,
            signedData,
            timestamp: new Date(),
            order: noDues.signatures.length,
        };

        noDues.signatures.push(newSignature);
        noDues.currentStage += 1;

        // Get latest signature hash (just added)
        const latestSignature = noDues.signatures[noDues.signatures.length - 1];
        const latestSignatureHash = latestSignature.signature;

        // Regenerate PDF with QR code containing latest signature after each sign
        const pdfPath = await generateNoDuesPDF({
            facultyInfo: {
                name: noDues.facultyInfo.name,
                employeeId: noDues.facultyInfo.employeeId,
                email: noDues.facultyInfo.email,
                department: noDues.facultyInfo.department,
                designation: noDues.facultyInfo.designation,
                phone: noDues.facultyInfo.phone,
            },
            bankDetails: noDues.bankDetails,
            donation: noDues.donation,
            approvalFlow: noDues.approvalFlow,
            finalSignatureHash: latestSignatureHash,
        });

        // Update document path with QR-embedded PDF
        noDues.document.path = pdfPath;

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
            message: "Faculty no dues signed successfully",
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

        const noDues = await FacultyNoDues.findById(id);
        if (!noDues) {
            return next(new ApiError(404, "No dues not found"));
        }

        const user = await User.findById(req.user.id);

        // Check if user can reject (must be current approver or admin)
        const canReject =
            noDues.canUserSign(user.email) || user.role === "admin";

        if (!canReject) {
            return next(
                new ApiError(403, "You are not authorized to reject this")
            );
        }

        noDues.status = "rejected";
        noDues.rejectionDetails = {
            reason: reason || "No reason provided",
            rejectedBy: {
                userId: user._id,
                name: user.name,
                email: user.email,
                department: user.department || "Admin",
            },
            rejectedAt: new Date(),
        };

        await noDues.save();

        res.status(200).json({
            success: true,
            message: "Faculty no dues rejected",
            data: noDues,
        });
    } catch (error) {
        next(new ApiError(500, error.message));
    }
};

// Get No Dues by ID
exports.getNoDuesById = async (req, res, next) => {
    try {
        const { id } = req.params;

        const noDues = await FacultyNoDues.findById(id)
            .populate("facultyId", "name email employeeId department")
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
        // Get approval flow from environment or return empty array
        const approvalFlowJson = process.env.FACULTY_NODUES_FLOW || "[]";
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

// Delete Faculty No Dues (Development Only)
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

        const noDues = await FacultyNoDues.findOne({
            facultyId: req.user.id,
        });

        if (!noDues) {
            return next(new ApiError(404, "No dues record not found"));
        }

        // Delete the no dues record
        await FacultyNoDues.findByIdAndDelete(noDues._id);

        res.status(200).json({
            success: true,
            message: "No dues record deleted successfully",
        });
    } catch (error) {
        next(new ApiError(500, error.message));
    }
};
