const mongoose = require("mongoose");

const studentNoDuesSchema = new mongoose.Schema(
    {
        // Student Information
        studentId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        studentInfo: {
            name: { type: String, required: true },
            email: { type: String, required: true },
            rollNumber: { type: String, required: true },
            branch: String,
            semester: String,
            phone: String,
        },

        // Bank Details
        bankDetails: {
            accountHolderName: String,
            accountNumber: String,
            ifscCode: String,
            bankName: String,
            branchName: String,
        },

        // Donation Details
        donation: {
            amount: { type: Number, default: 0 },
            purpose: String,
        },

        // Document Details
        document: {
            url: String,
            path: String,
            hash: String, // SHA-256 hash of the PDF
            size: Number,
            generatedAt: { type: Date, default: Date.now },
        },

        // Approval Flow (copied from admin config)
        approvalFlow: [
            {
                email: { type: String, required: true },
                department: { type: String, required: true },
                order: { type: Number, required: true },
            },
        ],

        // Signature Chain
        signatures: [
            {
                signerEmail: { type: String, required: true },
                signerName: String,
                department: String,
                walletAddress: { type: String, required: true },
                signature: { type: String, required: true },
                signedData: String, // The data that was signed
                timestamp: { type: Date, default: Date.now },
                order: Number,
            },
        ],

        currentStage: {
            type: Number,
            default: 0, // Index of current approver in approvalFlow
        },

        status: {
            type: String,
            enum: ["pending", "in_progress", "approved", "rejected"],
            default: "pending",
        },

        // Rejection Details
        rejectionDetails: {
            rejectedBy: {
                email: String,
                name: String,
                department: String,
            },
            reason: String,
            timestamp: Date,
        },

        // Metadata
        submittedAt: {
            type: Date,
            default: Date.now,
        },
        completedAt: Date,
    },
    {
        timestamps: true,
    }
);

// Index to ensure one student can only have one approved no dues
studentNoDuesSchema.index(
    { studentId: 1, status: 1 },
    {
        unique: true,
        partialFilterExpression: { status: "approved" },
    }
);

// Method to verify signature chain
studentNoDuesSchema.methods.verifySignatureChain = function () {
    if (this.signatures.length === 0) return true;

    const crypto = require("crypto");

    for (let i = 0; i < this.signatures.length; i++) {
        const sig = this.signatures[i];

        // Reconstruct the data that should have been signed
        let dataToVerify;
        if (i === 0) {
            // First signature: just document hash
            dataToVerify = JSON.stringify({
                documentHash: this.document.hash,
                firstSigner: true,
            });
        } else {
            // Subsequent signatures: previous signature + document hash
            dataToVerify = JSON.stringify({
                previousSignature: this.signatures[i - 1].signature,
                documentHash: this.document.hash,
            });
        }

        // In production, verify the ECDSA signature here
        // For now, just check if signedData matches
        if (sig.signedData && sig.signedData !== dataToVerify) {
            return false;
        }
    }

    return true;
};

// Method to get current approver
studentNoDuesSchema.methods.getCurrentApprover = function () {
    if (this.currentStage >= this.approvalFlow.length) {
        return null;
    }
    return this.approvalFlow[this.currentStage];
};

// Method to check if user can sign
studentNoDuesSchema.methods.canUserSign = function (userEmail) {
    const currentApprover = this.getCurrentApprover();
    if (!currentApprover) return false;

    return (
        currentApprover.email.toLowerCase() === userEmail.toLowerCase() &&
        (this.status === "pending" || this.status === "in_progress")
    );
};

module.exports = mongoose.model("StudentNoDues", studentNoDuesSchema);
