const mongoose = require("mongoose");

const signatureSchema = new mongoose.Schema(
    {
        signerEmail: {
            type: String,
            required: true,
            lowercase: true,
        },
        signerName: {
            type: String,
            required: true,
        },
        signerRole: {
            type: String,
            required: true,
        },
        signature: {
            type: String, // ECDSA signature hex string
            required: true,
        },
        walletAddress: {
            type: String, // Privy embedded wallet address
            required: true,
        },
        signedAt: {
            type: Date,
            default: Date.now,
        },
        documentHash: {
            type: String, // Hash of the document at the time of signing
            required: true,
        },
        signedData: {
            type: String, // The actual data that was signed (for chain verification)
        },
    },
    { _id: false }
);

const mouSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
            trim: true,
        },
        document: {
            url: String,
            path: String,
            publicId: String,
            filename: String,
            hash: String, // SHA-256 hash of the original document
            size: Number,
        },
        submittedBy: {
            userId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
                required: true,
            },
            email: {
                type: String,
                required: true,
                lowercase: true,
            },
            name: {
                type: String,
                required: true,
            },
        },
        recipientsFlow: [
            {
                email: {
                    type: String,
                    required: true,
                    lowercase: true,
                },
                name: String,
                role: String,
                order: {
                    type: Number,
                    required: true,
                },
            },
        ],
        signatures: [signatureSchema],
        currentStage: {
            type: Number,
            default: 0, // Index in recipientsFlow
        },
        status: {
            type: String,
            enum: [
                "pending",
                "in_progress",
                "approved",
                "rejected",
                "completed",
            ],
            default: "pending",
        },
        rejectionReason: {
            rejectedBy: String,
            reason: String,
            rejectedAt: Date,
        },
        metadata: {
            totalStages: Number,
            completedStages: Number,
            isComplete: {
                type: Boolean,
                default: false,
            },
        },
    },
    {
        timestamps: true,
    }
);

// Index for efficient queries
mouSchema.index({ "submittedBy.email": 1 });
mouSchema.index({ "recipientsFlow.email": 1 });
mouSchema.index({ status: 1 });
mouSchema.index({ currentStage: 1 });

// Virtual to get current recipient
mouSchema.virtual("currentRecipient").get(function () {
    if (this.currentStage < this.recipientsFlow.length) {
        return this.recipientsFlow[this.currentStage];
    }
    return null;
});

// Method to check if user can sign
mouSchema.methods.canUserSign = function (userEmail) {
    const currentRecipient = this.recipientsFlow[this.currentStage];
    return (
        currentRecipient &&
        currentRecipient.email.toLowerCase() === userEmail.toLowerCase()
    );
};

// Method to advance to next stage
mouSchema.methods.advanceStage = function () {
    this.currentStage += 1;
    this.metadata.completedStages = this.currentStage;

    if (this.currentStage >= this.recipientsFlow.length) {
        this.status = "completed";
        this.metadata.isComplete = true;
    } else if (this.currentStage > 0) {
        this.status = "in_progress";
    }
};

// Method to add signature
mouSchema.methods.addSignature = function (signatureData) {
    this.signatures.push(signatureData);
    this.advanceStage();
};

// Set virtuals to be included in JSON
mouSchema.set("toJSON", { virtuals: true });
mouSchema.set("toObject", { virtuals: true });

module.exports = mongoose.model("MoU", mouSchema);
