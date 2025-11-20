const StudentNoDues = require("../models/StudentNoDues");
const FacultyNoDues = require("../models/FacultyNoDues");
const MoU = require("../models/MoU");
const EventPermission = require("../models/EventPermission");
const Invoice = require("../models/Invoice");
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

        // Search in MoU
        const mou = await MoU.findOne({
            "signatures.signature": signatureHash,
            status: "completed",
        }).lean();

        if (mou) {
            return res.status(200).json({
                success: true,
                documentType: "mou",
                data: {
                    _id: mou._id,
                    type: "Memorandum of Understanding",
                    status: mou.status,
                    title: mou.title,
                    submittedBy: {
                        name: mou.submittedBy?.name,
                        email: mou.submittedBy?.email,
                        userId: mou.submittedBy?.userId,
                    },
                    recipientsFlow: mou.recipientsFlow,
                    signatures: mou.signatures,
                    documentPath: mou.document?.path,
                    qrDocumentPath: mou.qrDocument?.path,
                    documentHash: mou.document?.hash,
                    createdAt: mou.createdAt,
                    completedAt: mou.updatedAt,
                },
            });
        }

        // Search in EventPermission
        const eventPermission = await EventPermission.findOne({
            "signatures.signature": signatureHash,
            status: "completed",
        }).lean();

        if (eventPermission) {
            return res.status(200).json({
                success: true,
                documentType: "event-permission",
                data: {
                    _id: eventPermission._id,
                    type: "Event Permission",
                    status: eventPermission.status,
                    title: eventPermission.title,
                    submittedBy: {
                        name: eventPermission.submittedBy?.name,
                        email: eventPermission.submittedBy?.email,
                        userId: eventPermission.submittedBy?.userId,
                    },
                    recipientsFlow: eventPermission.recipientsFlow,
                    signatures: eventPermission.signatures,
                    documentPath: eventPermission.document?.path,
                    qrDocumentPath: eventPermission.qrDocument?.path,
                    documentHash: eventPermission.document?.hash,
                    createdAt: eventPermission.createdAt,
                    completedAt: eventPermission.updatedAt,
                },
            });
        }

        // Search in Invoice
        const invoice = await Invoice.findOne({
            "signatures.signature": signatureHash,
            status: "completed",
        }).lean();

        if (invoice) {
            return res.status(200).json({
                success: true,
                documentType: "invoice",
                data: {
                    _id: invoice._id,
                    type: "Invoice",
                    status: invoice.status,
                    title: invoice.title,
                    submittedBy: {
                        name: invoice.submittedBy?.name,
                        email: invoice.submittedBy?.email,
                        userId: invoice.submittedBy?.userId,
                    },
                    eventPermissionId: invoice.eventPermissionId,
                    recipientsFlow: invoice.recipientsFlow,
                    signatures: invoice.signatures,
                    documentPath: invoice.document?.path,
                    qrDocumentPath: invoice.qrDocument?.path,
                    documentHash: invoice.document?.hash,
                    createdAt: invoice.createdAt,
                    completedAt: invoice.updatedAt,
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
