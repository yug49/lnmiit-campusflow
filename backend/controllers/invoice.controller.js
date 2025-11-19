const Invoice = require("../models/Invoice");
const EventPermission = require("../models/EventPermission");
const User = require("../models/User");
const { ApiError } = require("../utils/errorHandler");
const { storeFile, deleteFile } = require("../utils/fileStorage");
const crypto = require("crypto");
const fs = require("fs");

// Submit Invoice (Council only)
exports.submitInvoice = async (req, res, next) => {
    try {
        const {
            eventPermissionId,
            title,
            recipientsFlow,
            initialSignature,
            walletAddress,
            documentHash,
        } = req.body;

        if (!eventPermissionId) {
            return next(new ApiError(400, "Event permission ID is required"));
        }

        if (!req.file) {
            return next(new ApiError(400, "Please upload a PDF document"));
        }

        // Validate PDF
        if (req.file.mimetype !== "application/pdf") {
            return next(new ApiError(400, "Only PDF files are supported"));
        }

        // Verify event permission exists and is approved/completed
        const eventPermission = await EventPermission.findById(
            eventPermissionId
        );
        if (!eventPermission) {
            return next(new ApiError(404, "Event permission not found"));
        }

        if (
            eventPermission.status !== "completed" &&
            eventPermission.status !== "approved"
        ) {
            return next(
                new ApiError(
                    400,
                    "Can only create invoices for approved events"
                )
            );
        }

        // Parse recipients flow if it's a string (from FormData)
        let recipients = recipientsFlow;
        if (typeof recipientsFlow === "string") {
            try {
                recipients = JSON.parse(recipientsFlow);
            } catch (e) {
                return next(
                    new ApiError(400, "Invalid recipients flow format")
                );
            }
        }

        // Validate recipients flow
        if (
            !recipients ||
            !Array.isArray(recipients) ||
            recipients.length === 0
        ) {
            return next(
                new ApiError(
                    400,
                    "Recipients flow is required. Please add at least one recipient."
                )
            );
        }

        // Verify all recipients exist in database
        const recipientEmails = recipients.map((r) => r.email.toLowerCase());
        const users = await User.find({ email: { $in: recipientEmails } });

        if (users.length !== recipientEmails.length) {
            return next(
                new ApiError(
                    400,
                    "One or more recipient emails not found in system"
                )
            );
        }

        // Enrich recipients with user data
        const enrichedRecipients = recipients.map((recipient, index) => {
            const user = users.find(
                (u) => u.email.toLowerCase() === recipient.email.toLowerCase()
            );
            return {
                email: user.email,
                name: user.name,
                role: user.role,
                order: index,
            };
        });

        // Calculate document hash
        const fileBuffer = fs.readFileSync(req.file.path);
        const calculatedHash = crypto
            .createHash("sha256")
            .update(fileBuffer)
            .digest("hex");

        // Verify the hash matches what client sent
        if (documentHash && documentHash !== calculatedHash) {
            return next(
                new ApiError(
                    400,
                    "Document hash mismatch. File may have been tampered with."
                )
            );
        }

        // Store the document
        const result = await storeFile(
            req.file.path,
            `invoice_${req.user.id}_${Date.now()}`,
            "invoice"
        );

        // Get submitter details
        const submitter = await User.findById(req.user.id);

        // Create initial signature from council member
        const councilSignature = {
            signerEmail: submitter.email,
            signerName: submitter.name,
            signerRole: submitter.role,
            signature: initialSignature,
            walletAddress: walletAddress,
            signedAt: new Date(),
            documentHash: calculatedHash,
        };

        // Create Invoice
        const invoice = await Invoice.create({
            eventPermissionId,
            title,
            document: {
                url: result.url,
                path: result.path || "",
                publicId: result.publicId || "",
                filename: req.file.originalname,
                hash: calculatedHash,
                size: req.file.size,
            },
            submittedBy: {
                userId: submitter._id,
                email: submitter.email,
                name: submitter.name,
            },
            recipientsFlow: enrichedRecipients,
            signatures: [councilSignature],
            currentStage: 0,
            status: enrichedRecipients.length > 0 ? "in_progress" : "completed",
            metadata: {
                totalStages: enrichedRecipients.length,
                completedStages: 0,
                isComplete: enrichedRecipients.length === 0,
            },
        });

        res.status(201).json({
            success: true,
            message: "Invoice submitted successfully",
            data: invoice,
        });
    } catch (error) {
        next(new ApiError(500, `Failed to submit Invoice: ${error.message}`));
    }
};

// Get Invoices submitted by council member
exports.getMySubmittedInvoices = async (req, res, next) => {
    try {
        const invoices = await Invoice.find({
            "submittedBy.userId": req.user.id,
        })
            .populate("eventPermissionId", "title")
            .lean()
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: invoices.length,
            data: invoices,
        });
    } catch (error) {
        next(new ApiError(500, error.message));
    }
};

// Get Invoices pending for current user's signature
exports.getPendingInvoices = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id);

        // Find Invoices where current user is the current recipient
        const invoices = await Invoice.find({
            status: { $in: ["pending", "in_progress"] },
            "recipientsFlow.email": user.email.toLowerCase(),
        })
            .populate("eventPermissionId", "title")
            .lean()
            .sort({ createdAt: -1 });

        // Filter to only show Invoices where user is the current signer
        const pendingInvoices = invoices.filter((invoice) => {
            const currentRecipient =
                invoice.recipientsFlow[invoice.currentStage];
            return (
                currentRecipient &&
                currentRecipient.email.toLowerCase() ===
                    user.email.toLowerCase()
            );
        });

        res.status(200).json({
            success: true,
            count: pendingInvoices.length,
            data: pendingInvoices,
        });
    } catch (error) {
        next(new ApiError(500, error.message));
    }
};

// Get all Invoices (with filter options)
exports.getAllInvoices = async (req, res, next) => {
    try {
        const { status, email, eventPermissionId } = req.query;
        const user = await User.findById(req.user.id);

        let query = {};

        // If email filter provided (for faculty/admin to see their Invoices)
        if (email) {
            query["recipientsFlow.email"] = email.toLowerCase();
        } else {
            // Default: show Invoices relevant to current user
            query["recipientsFlow.email"] = user.email.toLowerCase();
        }

        if (status) {
            query.status = status;
        }

        if (eventPermissionId) {
            query.eventPermissionId = eventPermissionId;
        }

        const invoices = await Invoice.find(query)
            .populate("eventPermissionId", "title")
            .lean()
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: invoices.length,
            data: invoices,
        });
    } catch (error) {
        next(new ApiError(500, error.message));
    }
};

// Get single Invoice by ID
exports.getInvoiceById = async (req, res, next) => {
    try {
        const invoice = await Invoice.findById(req.params.id)
            .populate("eventPermissionId", "title")
            .lean();

        if (!invoice) {
            return next(new ApiError(404, "Invoice not found"));
        }

        res.status(200).json({
            success: true,
            data: invoice,
        });
    } catch (error) {
        next(new ApiError(500, error.message));
    }
};

// Sign and approve Invoice
exports.signInvoice = async (req, res, next) => {
    try {
        const { signature, walletAddress, documentHash, signedData } = req.body;
        const invoiceId = req.params.id;

        if (!signature || !walletAddress) {
            return next(
                new ApiError(400, "Signature and wallet address are required")
            );
        }

        const invoice = await Invoice.findById(invoiceId);
        if (!invoice) {
            return next(new ApiError(404, "Invoice not found"));
        }

        const user = await User.findById(req.user.id);

        // Check if user can sign this Invoice
        if (!invoice.canUserSign(user.email)) {
            return next(
                new ApiError(
                    403,
                    "You are not authorized to sign this Invoice at this stage"
                )
            );
        }

        // Verify document hash hasn't changed
        if (documentHash !== invoice.document.hash) {
            return next(
                new ApiError(
                    400,
                    "Document hash mismatch. Document may have been tampered with."
                )
            );
        }

        // Check if user already signed
        const alreadySigned = invoice.signatures.find(
            (sig) => sig.signerEmail.toLowerCase() === user.email.toLowerCase()
        );
        if (alreadySigned) {
            return next(
                new ApiError(400, "You have already signed this Invoice")
            );
        }

        // Add signature
        const signatureData = {
            signerEmail: user.email,
            signerName: user.name,
            signerRole: user.role,
            signature: signature,
            walletAddress: walletAddress,
            signedAt: new Date(),
            documentHash: documentHash,
            signedData: signedData, // Store the data that was signed
        };

        invoice.addSignature(signatureData);
        await invoice.save();

        res.status(200).json({
            success: true,
            message: "Invoice signed successfully",
            data: invoice,
        });
    } catch (error) {
        next(new ApiError(500, `Failed to sign Invoice: ${error.message}`));
    }
};

// Reject Invoice
exports.rejectInvoice = async (req, res, next) => {
    try {
        const { reason } = req.body;
        const invoiceId = req.params.id;

        if (!reason) {
            return next(new ApiError(400, "Rejection reason is required"));
        }

        const invoice = await Invoice.findById(invoiceId);
        if (!invoice) {
            return next(new ApiError(404, "Invoice not found"));
        }

        const user = await User.findById(req.user.id);

        // Check if user can reject this Invoice
        if (!invoice.canUserSign(user.email)) {
            return next(
                new ApiError(
                    403,
                    "You are not authorized to reject this Invoice"
                )
            );
        }

        invoice.status = "rejected";
        invoice.rejectionReason = {
            rejectedBy: user.email,
            reason: reason,
            rejectedAt: new Date(),
        };

        await invoice.save();

        res.status(200).json({
            success: true,
            message: "Invoice rejected",
            data: invoice,
        });
    } catch (error) {
        next(new ApiError(500, `Failed to reject Invoice: ${error.message}`));
    }
};

// Get approved event permissions for dropdown
exports.getApprovedEvents = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id);

        if (!user) {
            return next(new ApiError(404, "User not found"));
        }

        // Get approved/completed event permissions submitted by this user
        const approvedEvents = await EventPermission.find({
            "submittedBy.userId": user._id,
            status: { $in: ["completed", "approved"] },
        })
            .select("title createdAt status")
            .sort({ createdAt: -1 })
            .lean(); // Use lean() to get plain JavaScript objects without virtuals

        console.log("User ID:", user._id);
        console.log("Approved events found:", approvedEvents.length);
        console.log(
            "Approved events data:",
            JSON.stringify(approvedEvents, null, 2)
        );

        res.status(200).json({
            success: true,
            count: approvedEvents ? approvedEvents.length : 0,
            data: approvedEvents || [],
        });
    } catch (error) {
        console.error("Error in getApprovedEvents:", error);
        next(new ApiError(500, error.message));
    }
};
