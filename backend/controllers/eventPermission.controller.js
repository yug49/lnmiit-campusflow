const EventPermission = require("../models/EventPermission");
const User = require("../models/User");
const { ApiError } = require("../utils/errorHandler");
const { storeFile, deleteFile } = require("../utils/fileStorage");
const crypto = require("crypto");
const fs = require("fs");

// Submit EventPermission (Council only)
exports.submitEventPermission = async (req, res, next) => {
    try {
        const {
            title,
            recipientsFlow,
            initialSignature,
            walletAddress,
            documentHash,
        } = req.body;

        if (!req.file) {
            return next(new ApiError(400, "Please upload a PDF document"));
        }

        // Validate PDF
        if (req.file.mimetype !== "application/pdf") {
            return next(new ApiError(400, "Only PDF files are supported"));
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
            `eventPermission_${req.user.id}_${Date.now()}`,
            "eventPermission"
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

        // Create EventPermission
        const eventPermission = await EventPermission.create({
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
            message: "EventPermission submitted successfully",
            data: eventPermission,
        });
    } catch (error) {
        next(
            new ApiError(
                500,
                `Failed to submit EventPermission: ${error.message}`
            )
        );
    }
};

// Get EventPermissions submitted by council member
exports.getMySubmittedPermissions = async (req, res, next) => {
    try {
        const eventPermissions = await EventPermission.find({
            "submittedBy.userId": req.user.id,
        }).sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: eventPermissions.length,
            data: eventPermissions,
        });
    } catch (error) {
        next(new ApiError(500, error.message));
    }
};

// Get EventPermissions pending for current user's signature
exports.getPendingPermissions = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id);

        // Find EventPermissions where current user is the current recipient
        const eventPermissions = await EventPermission.find({
            status: { $in: ["pending", "in_progress"] },
            "recipientsFlow.email": user.email.toLowerCase(),
        }).sort({ createdAt: -1 });

        // Filter to only show EventPermissions where user is the current signer
        const pendingEventPermissions = eventPermissions.filter(
            (eventPermission) => {
                const currentRecipient =
                    eventPermission.recipientsFlow[
                        eventPermission.currentStage
                    ];
                return (
                    currentRecipient &&
                    currentRecipient.email.toLowerCase() ===
                        user.email.toLowerCase()
                );
            }
        );

        res.status(200).json({
            success: true,
            count: pendingEventPermissions.length,
            data: pendingEventPermissions,
        });
    } catch (error) {
        next(new ApiError(500, error.message));
    }
};

// Get all EventPermissions (with filter options)
exports.getAllPermissions = async (req, res, next) => {
    try {
        const { status, email } = req.query;
        const user = await User.findById(req.user.id);

        let query = {};

        // If email filter provided (for faculty/admin to see their EventPermissions)
        if (email) {
            query["recipientsFlow.email"] = email.toLowerCase();
        } else {
            // Default: show EventPermissions relevant to current user
            query["recipientsFlow.email"] = user.email.toLowerCase();
        }

        if (status) {
            query.status = status;
        }

        const eventPermissions = await EventPermission.find(query).sort({
            createdAt: -1,
        });

        res.status(200).json({
            success: true,
            count: eventPermissions.length,
            data: eventPermissions,
        });
    } catch (error) {
        next(new ApiError(500, error.message));
    }
};

// Get single EventPermission by ID
exports.getPermissionById = async (req, res, next) => {
    try {
        const eventPermission = await EventPermission.findById(req.params.id);

        if (!eventPermission) {
            return next(new ApiError(404, "EventPermission not found"));
        }

        res.status(200).json({
            success: true,
            data: eventPermission,
        });
    } catch (error) {
        next(new ApiError(500, error.message));
    }
};

// Sign and approve EventPermission
exports.signPermission = async (req, res, next) => {
    try {
        const { signature, walletAddress, documentHash, signedData } = req.body;
        const eventPermissionId = req.params.id;

        if (!signature || !walletAddress) {
            return next(
                new ApiError(400, "Signature and wallet address are required")
            );
        }

        const eventPermission = await EventPermission.findById(
            eventPermissionId
        );
        if (!eventPermission) {
            return next(new ApiError(404, "EventPermission not found"));
        }

        const user = await User.findById(req.user.id);

        // Check if user can sign this EventPermission
        if (!eventPermission.canUserSign(user.email)) {
            return next(
                new ApiError(
                    403,
                    "You are not authorized to sign this EventPermission at this stage"
                )
            );
        }

        // Verify document hash hasn't changed
        if (documentHash !== eventPermission.document.hash) {
            return next(
                new ApiError(
                    400,
                    "Document hash mismatch. Document may have been tampered with."
                )
            );
        }

        // Check if user already signed
        const alreadySigned = eventPermission.signatures.find(
            (sig) => sig.signerEmail.toLowerCase() === user.email.toLowerCase()
        );
        if (alreadySigned) {
            return next(
                new ApiError(
                    400,
                    "You have already signed this EventPermission"
                )
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

        eventPermission.addSignature(signatureData);
        await eventPermission.save();

        res.status(200).json({
            success: true,
            message: "EventPermission signed successfully",
            data: eventPermission,
        });
    } catch (error) {
        next(
            new ApiError(
                500,
                `Failed to sign EventPermission: ${error.message}`
            )
        );
    }
};

// Reject EventPermission
exports.rejectPermission = async (req, res, next) => {
    try {
        const { reason } = req.body;
        const eventPermissionId = req.params.id;

        if (!reason) {
            return next(new ApiError(400, "Rejection reason is required"));
        }

        const eventPermission = await EventPermission.findById(
            eventPermissionId
        );
        if (!eventPermission) {
            return next(new ApiError(404, "EventPermission not found"));
        }

        const user = await User.findById(req.user.id);

        // Check if user can reject this EventPermission
        if (!eventPermission.canUserSign(user.email)) {
            return next(
                new ApiError(
                    403,
                    "You are not authorized to reject this EventPermission"
                )
            );
        }

        eventPermission.status = "rejected";
        eventPermission.rejectionReason = {
            rejectedBy: user.email,
            reason: reason,
            rejectedAt: new Date(),
        };

        await eventPermission.save();

        res.status(200).json({
            success: true,
            message: "EventPermission rejected",
            data: eventPermission,
        });
    } catch (error) {
        next(
            new ApiError(
                500,
                `Failed to reject EventPermission: ${error.message}`
            )
        );
    }
};

// Verify signature (utility endpoint)
exports.verifySignature = async (req, res, next) => {
    try {
        const { eventPermissionId, signatureIndex } = req.params;

        const eventPermission = await EventPermission.findById(
            eventPermissionId
        );
        if (!eventPermission) {
            return next(new ApiError(404, "EventPermission not found"));
        }

        if (signatureIndex >= eventPermission.signatures.length) {
            return next(new ApiError(404, "Signature not found"));
        }

        const signature = eventPermission.signatures[signatureIndex];

        // Return signature details for client-side verification
        res.status(200).json({
            success: true,
            data: {
                signature: signature,
                documentHash: eventPermission.document.hash,
                isValid:
                    signature.documentHash === eventPermission.document.hash,
            },
        });
    } catch (error) {
        next(new ApiError(500, error.message));
    }
};
