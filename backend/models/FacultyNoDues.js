const mongoose = require("mongoose");

const facultyNoDuesSchema = new mongoose.Schema(
    {
        // Faculty ID (reference to User model)
        facultyId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        // Faculty Information
        facultyInfo: {
            name: { type: String, required: true },
            email: { type: String, required: true },
            employeeId: { type: String, required: true },
            department: { type: String, required: true },
            designation: { type: String, required: true },
            phone: { type: String },
        },

        // Bank Details
        bankDetails: {
            accountHolderName: { type: String, required: true },
            accountNumber: { type: String, required: true },
            ifscCode: { type: String, required: true },
            bankName: { type: String, required: true },
            branchName: { type: String, required: true },
        },

        // Donation (optional)
        donation: {
            amount: { type: Number, default: 0 },
            purpose: { type: String, default: "Faculty Welfare Fund" },
        },

        // Document Information (PDF)
        document: {
            path: { type: String, required: true },
            url: { type: String, required: true },
            hash: { type: String, required: true },
            size: { type: Number, required: true },
        },

        // Approval Flow (copied from admin config)
        approvalFlow: [
            {
                email: { type: String, required: true },
                department: { type: String, required: true },
            },
        ],

        // Signatures (ECDSA signature chain)
        signatures: [
            {
                signerEmail: { type: String, required: true },
                signerName: { type: String, required: true },
                department: { type: String, required: true },
                walletAddress: { type: String, required: true },
                signature: { type: String, required: true },
                signedData: { type: String, required: true },
                timestamp: { type: Date, default: Date.now },
                order: { type: Number, required: true },
            },
        ],

        // Current stage in approval flow (0 = initial submission, increments with each signature)
        currentStage: {
            type: Number,
            default: 0,
        },

        // Status
        status: {
            type: String,
            enum: ["pending", "in_progress", "approved", "rejected"],
            default: "pending",
        },

        // Rejection details (if rejected)
        rejectionDetails: {
            reason: String,
            rejectedBy: {
                userId: mongoose.Schema.Types.ObjectId,
                name: String,
                email: String,
                department: String,
            },
            rejectedAt: Date,
        },

        // Completion timestamp
        completedAt: Date,
    },
    {
        timestamps: true,
    }
);

// Index to ensure one-time approval per faculty (only one approved no dues allowed)
facultyNoDuesSchema.index(
    { facultyId: 1, status: 1 },
    {
        unique: true,
        partialFilterExpression: { status: "approved" },
    }
);

// Method to check if a user can sign at current stage
facultyNoDuesSchema.methods.canUserSign = function (userEmail) {
    if (this.status !== "pending" && this.status !== "in_progress") {
        return false;
    }

    const currentApprover = this.approvalFlow[this.currentStage];
    if (!currentApprover) {
        return false;
    }

    return currentApprover.email.toLowerCase() === userEmail.toLowerCase();
};

// Method to get current approver
facultyNoDuesSchema.methods.getCurrentApprover = function () {
    if (this.currentStage >= this.approvalFlow.length) {
        return null;
    }
    return this.approvalFlow[this.currentStage];
};

// Method to verify signature chain integrity
facultyNoDuesSchema.methods.verifySignatureChain = function () {
    if (this.signatures.length === 0) {
        return false;
    }

    // Check each signature builds on previous
    for (let i = 0; i < this.signatures.length; i++) {
        const sig = this.signatures[i];

        // Verify order
        if (sig.order !== i) {
            return false;
        }

        // Verify signed data includes document hash
        try {
            const signedData = JSON.parse(sig.signedData);
            if (!signedData.documentHash) {
                return false;
            }

            // If not first signature, verify it includes previous signature
            if (i > 0 && !signedData.previousSignature) {
                return false;
            }
        } catch (e) {
            return false;
        }
    }

    return true;
};

module.exports = mongoose.model("FacultyNoDues", facultyNoDuesSchema);
