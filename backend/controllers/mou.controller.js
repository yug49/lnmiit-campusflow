const MoU = require("../models/MoU");
const User = require("../models/User");
const { ApiError } = require("../utils/errorHandler");
const { storeFile, deleteFile } = require("../utils/fileStorage");
const crypto = require("crypto");
const fs = require("fs");

// Submit MoU (Council only)
exports.submitMoU = async (req, res, next) => {
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
            `mou_${req.user.id}_${Date.now()}`,
            "mou"
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

        // Create MoU
        const mou = await MoU.create({
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
            message: "MoU submitted successfully",
            data: mou,
        });
    } catch (error) {
        next(new ApiError(500, `Failed to submit MoU: ${error.message}`));
    }
};

// Get MoUs submitted by council member
exports.getMySubmittedMoUs = async (req, res, next) => {
    try {
        const mous = await MoU.find({ "submittedBy.userId": req.user.id }).sort(
            { createdAt: -1 }
        );

        res.status(200).json({
            success: true,
            count: mous.length,
            data: mous,
        });
    } catch (error) {
        next(new ApiError(500, error.message));
    }
};

// Get MoUs pending for current user's signature
exports.getPendingMoUs = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id);

        // Find MoUs where current user is the current recipient
        const mous = await MoU.find({
            status: { $in: ["pending", "in_progress"] },
            "recipientsFlow.email": user.email.toLowerCase(),
        }).sort({ createdAt: -1 });

        // Filter to only show MoUs where user is the current signer
        const pendingMoUs = mous.filter((mou) => {
            const currentRecipient = mou.recipientsFlow[mou.currentStage];
            return (
                currentRecipient &&
                currentRecipient.email.toLowerCase() ===
                    user.email.toLowerCase()
            );
        });

        res.status(200).json({
            success: true,
            count: pendingMoUs.length,
            data: pendingMoUs,
        });
    } catch (error) {
        next(new ApiError(500, error.message));
    }
};

// Get all MoUs (with filter options)
exports.getAllMoUs = async (req, res, next) => {
    try {
        const { status, email } = req.query;
        const user = await User.findById(req.user.id);

        let query = {};

        // If email filter provided (for faculty/admin to see their MoUs)
        if (email) {
            query["recipientsFlow.email"] = email.toLowerCase();
        } else {
            // Default: show MoUs relevant to current user
            query["recipientsFlow.email"] = user.email.toLowerCase();
        }

        if (status) {
            query.status = status;
        }

        const mous = await MoU.find(query).sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: mous.length,
            data: mous,
        });
    } catch (error) {
        next(new ApiError(500, error.message));
    }
};

// Get single MoU by ID
exports.getMoUById = async (req, res, next) => {
    try {
        const mou = await MoU.findById(req.params.id);

        if (!mou) {
            return next(new ApiError(404, "MoU not found"));
        }

        res.status(200).json({
            success: true,
            data: mou,
        });
    } catch (error) {
        next(new ApiError(500, error.message));
    }
};

// Sign and approve MoU
exports.signMoU = async (req, res, next) => {
    try {
        const { signature, walletAddress, documentHash, signedData } = req.body;
        const mouId = req.params.id;

        if (!signature || !walletAddress) {
            return next(
                new ApiError(400, "Signature and wallet address are required")
            );
        }

        const mou = await MoU.findById(mouId);
        if (!mou) {
            return next(new ApiError(404, "MoU not found"));
        }

        const user = await User.findById(req.user.id);

        // Check if user can sign this MoU
        if (!mou.canUserSign(user.email)) {
            return next(
                new ApiError(
                    403,
                    "You are not authorized to sign this MoU at this stage"
                )
            );
        }

        // Verify document hash hasn't changed
        if (documentHash !== mou.document.hash) {
            return next(
                new ApiError(
                    400,
                    "Document hash mismatch. Document may have been tampered with."
                )
            );
        }

        // Check if user already signed
        const alreadySigned = mou.signatures.find(
            (sig) => sig.signerEmail.toLowerCase() === user.email.toLowerCase()
        );
        if (alreadySigned) {
            return next(new ApiError(400, "You have already signed this MoU"));
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

        mou.addSignature(signatureData);
        await mou.save();

        res.status(200).json({
            success: true,
            message: "MoU signed successfully",
            data: mou,
        });
    } catch (error) {
        next(new ApiError(500, `Failed to sign MoU: ${error.message}`));
    }
};

// Reject MoU
exports.rejectMoU = async (req, res, next) => {
    try {
        const { reason } = req.body;
        const mouId = req.params.id;

        if (!reason) {
            return next(new ApiError(400, "Rejection reason is required"));
        }

        const mou = await MoU.findById(mouId);
        if (!mou) {
            return next(new ApiError(404, "MoU not found"));
        }

        const user = await User.findById(req.user.id);

        // Check if user can reject this MoU
        if (!mou.canUserSign(user.email)) {
            return next(
                new ApiError(403, "You are not authorized to reject this MoU")
            );
        }

        mou.status = "rejected";
        mou.rejectionReason = {
            rejectedBy: user.email,
            reason: reason,
            rejectedAt: new Date(),
        };

        await mou.save();

        res.status(200).json({
            success: true,
            message: "MoU rejected",
            data: mou,
        });
    } catch (error) {
        next(new ApiError(500, `Failed to reject MoU: ${error.message}`));
    }
};

// Verify signature (utility endpoint)
exports.verifySignature = async (req, res, next) => {
    try {
        const { mouId, signatureIndex } = req.params;

        const mou = await MoU.findById(mouId);
        if (!mou) {
            return next(new ApiError(404, "MoU not found"));
        }

        if (signatureIndex >= mou.signatures.length) {
            return next(new ApiError(404, "Signature not found"));
        }

        const signature = mou.signatures[signatureIndex];

        // Return signature details for client-side verification
        res.status(200).json({
            success: true,
            data: {
                signature: signature,
                documentHash: mou.document.hash,
                isValid: signature.documentHash === mou.document.hash,
            },
        });
    } catch (error) {
        next(new ApiError(500, error.message));
    }
};
