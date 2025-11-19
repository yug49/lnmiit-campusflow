const StudentNoDues = require("../models/StudentNoDues");
const FacultyNoDues = require("../models/FacultyNoDues");
const { ApiError } = require("../utils/errorHandler");

// Verify document by signature hash
exports.verifyDocument = async (req, res, next) => {
    try {
        const { signatureHash } = req.params;

        if (!signatureHash) {
            return next(new ApiError(400, "Signature hash is required"));
        }

        // Search in StudentNoDues
        const studentNoDues = await StudentNoDues.findOne({
            "signatures.signature": signatureHash,
            status: "approved",
        })
            .populate("studentId", "name email rollNumber")
            .lean();

        if (studentNoDues) {
            return res.status(200).json({
                success: true,
                documentType: "student-nodues",
                data: {
                    _id: studentNoDues._id,
                    type: "Student No Dues Certificate",
                    status: studentNoDues.status,
                    submittedBy: {
                        name: studentNoDues.studentInfo?.name,
                        rollNumber: studentNoDues.studentInfo?.rollNumber,
                        email: studentNoDues.studentInfo?.email,
                        branch: studentNoDues.studentInfo?.branch,
                    },
                    bankDetails: studentNoDues.bankDetails,
                    donation: studentNoDues.donation,
                    approvalFlow: studentNoDues.approvalFlow,
                    signatures: studentNoDues.signatures,
                    documentPath: studentNoDues.document?.path,
                    documentHash: studentNoDues.document?.hash,
                    createdAt: studentNoDues.createdAt,
                    completedAt: studentNoDues.completedAt,
                },
            });
        }

        // Search in FacultyNoDues
        const facultyNoDues = await FacultyNoDues.findOne({
            "signatures.signature": signatureHash,
            status: "approved",
        })
            .populate("facultyId", "name email")
            .lean();

        if (facultyNoDues) {
            return res.status(200).json({
                success: true,
                documentType: "faculty-nodues",
                data: {
                    _id: facultyNoDues._id,
                    type: "Faculty No Dues Certificate",
                    status: facultyNoDues.status,
                    submittedBy: {
                        name: facultyNoDues.facultyInfo?.name,
                        employeeId: facultyNoDues.facultyInfo?.employeeId,
                        email: facultyNoDues.facultyInfo?.email,
                        department: facultyNoDues.facultyInfo?.department,
                        designation: facultyNoDues.facultyInfo?.designation,
                    },
                    bankDetails: facultyNoDues.bankDetails,
                    donation: facultyNoDues.donation,
                    approvalFlow: facultyNoDues.approvalFlow,
                    signatures: facultyNoDues.signatures,
                    documentPath: facultyNoDues.document?.path,
                    documentHash: facultyNoDues.document?.hash,
                    createdAt: facultyNoDues.createdAt,
                    completedAt: facultyNoDues.completedAt,
                },
            });
        }

        // Document not found
        return next(
            new ApiError(
                404,
                "Document not found or not yet approved. Please ensure the QR code is from an approved document."
            )
        );
    } catch (error) {
        next(new ApiError(500, error.message));
    }
};
