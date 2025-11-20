import React, { useState, useEffect } from "react";
import {
    Box,
    Container,
    Typography,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Chip,
    CircularProgress,
    Alert,
    Snackbar,
    IconButton,
    Stepper,
    Step,
    StepLabel,
    Grid,
    Card,
    CardContent,
} from "@mui/material";
import {
    Visibility as VisibilityIcon,
    CheckCircle as CheckCircleIcon,
    Cancel as CancelIcon,
    Close as CloseIcon,
} from "@mui/icons-material";
import { usePrivy, useWallets } from "@privy-io/react-auth";
import { ethers } from "ethers";
import WaveBackground from "../WaveBackground";
import api from "../../utils/apiClient";

const FacultyStudentNoDuesApproval = () => {
    const { wallets } = useWallets();
    const [loading, setLoading] = useState(true);
    const [pendingNoDues, setPendingNoDues] = useState([]);
    const [selectedNoDues, setSelectedNoDues] = useState(null);
    const [viewDialogOpen, setViewDialogOpen] = useState(false);
    const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
    const [rejectionReason, setRejectionReason] = useState("");
    const [processing, setProcessing] = useState(false);
    const [notification, setNotification] = useState({
        open: false,
        message: "",
        severity: "success",
    });

    useEffect(() => {
        fetchPendingNoDues();
    }, []);

    const fetchPendingNoDues = async () => {
        try {
            setLoading(true);
            const response = await api.studentNoDues.getPendingNoDues();
            setPendingNoDues(response.data || []);
        } catch (error) {
            console.error("Error fetching pending no dues:", error);
            setNotification({
                open: true,
                message: "Failed to load pending no dues requests.",
                severity: "error",
            });
        } finally {
            setLoading(false);
        }
    };

    const handleViewDetails = (noDues) => {
        setSelectedNoDues(noDues);
        setViewDialogOpen(true);
    };

    const handleCloseViewDialog = () => {
        setViewDialogOpen(false);
        setSelectedNoDues(null);
    };

    const handleOpenRejectDialog = (noDues) => {
        setSelectedNoDues(noDues);
        setRejectDialogOpen(true);
    };

    const handleCloseRejectDialog = () => {
        setRejectDialogOpen(false);
        setSelectedNoDues(null);
        setRejectionReason("");
    };

    const handleApprove = async (noDues) => {
        // Find the embedded wallet
        const embeddedWallet = wallets.find(
            (wallet) => wallet.walletClientType === "privy"
        );

        if (!embeddedWallet) {
            setNotification({
                open: true,
                message: "Please connect your wallet to sign.",
                severity: "error",
            });
            return;
        }

        const walletAddress = embeddedWallet.address;

        try {
            setProcessing(true);
            setSelectedNoDues(noDues);

            // Prepare data to sign
            let dataToSign;
            if (noDues.signatures.length === 0) {
                // First signature: just document hash
                dataToSign = JSON.stringify({
                    documentHash: noDues.document.hash,
                    firstSigner: true,
                });
            } else {
                // Subsequent signatures: previous signature + document hash
                const previousSignature =
                    noDues.signatures[noDues.signatures.length - 1];
                dataToSign = JSON.stringify({
                    previousSignature: previousSignature.signature,
                    documentHash: noDues.document.hash,
                });
            }

            // Sign with wallet
            const ethereumProvider = await embeddedWallet.getEthereumProvider();
            const ethersSigner = await new ethers.BrowserProvider(
                ethereumProvider
            ).getSigner();
            const signature = await ethersSigner.signMessage(dataToSign);

            // Submit signature to backend
            const signatureData = {
                signature,
                walletAddress: walletAddress,
                documentHash: noDues.document.hash,
                signedData: dataToSign,
            };

            await api.studentNoDues.signNoDues(noDues._id, signatureData);

            setNotification({
                open: true,
                message: "No dues approved successfully!",
                severity: "success",
            });

            // Refresh the list
            fetchPendingNoDues();
            handleCloseViewDialog();
        } catch (error) {
            console.error("Error approving no dues:", error);
            setNotification({
                open: true,
                message: error.message || "Failed to approve no dues.",
                severity: "error",
            });
        } finally {
            setProcessing(false);
            setSelectedNoDues(null);
        }
    };

    const handleReject = async () => {
        if (!rejectionReason.trim()) {
            setNotification({
                open: true,
                message: "Please provide a rejection reason.",
                severity: "warning",
            });
            return;
        }

        try {
            setProcessing(true);

            await api.studentNoDues.rejectNoDues(
                selectedNoDues._id,
                rejectionReason
            );

            setNotification({
                open: true,
                message: "No dues rejected successfully.",
                severity: "success",
            });

            // Refresh the list
            fetchPendingNoDues();
            handleCloseRejectDialog();
        } catch (error) {
            console.error("Error rejecting no dues:", error);
            setNotification({
                open: true,
                message: error.message || "Failed to reject no dues.",
                severity: "error",
            });
        } finally {
            setProcessing(false);
        }
    };

    const handleCloseNotification = () => {
        setNotification((prev) => ({ ...prev, open: false }));
    };

    const getStatusColor = (status) => {
        switch (status) {
            case "approved":
                return "success";
            case "rejected":
                return "error";
            case "in_progress":
                return "info";
            default:
                return "default";
        }
    };

    if (loading) {
        return (
            <>
                <WaveBackground />
                <Container maxWidth="xl" sx={{ py: 4 }}>
                    <Box
                        sx={{
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                            minHeight: "60vh",
                        }}
                    >
                        <CircularProgress sx={{ color: "#fff" }} />
                    </Box>
                </Container>
            </>
        );
    }

    return (
        <>
            <WaveBackground />
            <Container maxWidth="xl" sx={{ py: 4 }}>
                <Typography
                    variant="h4"
                    component="h1"
                    sx={{
                        color: "#fff",
                        fontWeight: 600,
                        mb: 4,
                        textShadow: "0 2px 4px rgba(0,0,0,0.1)",
                    }}
                >
                    Student No Dues Approval
                </Typography>

                {pendingNoDues.length === 0 ? (
                    <Paper
                        elevation={3}
                        sx={{
                            p: 4,
                            background: "rgba(255,255,255,0.1)",
                            backdropFilter: "blur(10px)",
                            border: "1px solid rgba(255,255,255,0.2)",
                            borderRadius: 2,
                            textAlign: "center",
                        }}
                    >
                        <Typography variant="h6" sx={{ color: "#fff" }}>
                            No pending student no dues requests
                        </Typography>
                    </Paper>
                ) : (
                    <TableContainer
                        component={Paper}
                        sx={{
                            background: "rgba(255,255,255,0.1)",
                            backdropFilter: "blur(10px)",
                            border: "1px solid rgba(255,255,255,0.2)",
                        }}
                    >
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell
                                        sx={{ color: "#fff", fontWeight: 600 }}
                                    >
                                        Student Name
                                    </TableCell>
                                    <TableCell
                                        sx={{ color: "#fff", fontWeight: 600 }}
                                    >
                                        Roll Number
                                    </TableCell>
                                    <TableCell
                                        sx={{ color: "#fff", fontWeight: 600 }}
                                    >
                                        Branch
                                    </TableCell>
                                    <TableCell
                                        sx={{ color: "#fff", fontWeight: 600 }}
                                    >
                                        Status
                                    </TableCell>
                                    <TableCell
                                        sx={{ color: "#fff", fontWeight: 600 }}
                                    >
                                        Progress
                                    </TableCell>
                                    <TableCell
                                        sx={{ color: "#fff", fontWeight: 600 }}
                                    >
                                        Submitted
                                    </TableCell>
                                    <TableCell
                                        sx={{ color: "#fff", fontWeight: 600 }}
                                    >
                                        Actions
                                    </TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {pendingNoDues.map((noDues) => (
                                    <TableRow key={noDues._id}>
                                        <TableCell sx={{ color: "#fff" }}>
                                            {noDues.studentInfo?.name || "N/A"}
                                        </TableCell>
                                        <TableCell sx={{ color: "#fff" }}>
                                            {noDues.studentInfo?.rollNumber ||
                                                "N/A"}
                                        </TableCell>
                                        <TableCell sx={{ color: "#fff" }}>
                                            {noDues.studentInfo?.branch ||
                                                "N/A"}
                                        </TableCell>
                                        <TableCell>
                                            <Chip
                                                label={noDues.status}
                                                color={getStatusColor(
                                                    noDues.status
                                                )}
                                                size="small"
                                            />
                                        </TableCell>
                                        <TableCell sx={{ color: "#fff" }}>
                                            {noDues.currentStage} /{" "}
                                            {noDues.approvalFlow?.length || 0}
                                        </TableCell>
                                        <TableCell sx={{ color: "#fff" }}>
                                            {new Date(
                                                noDues.createdAt
                                            ).toLocaleDateString()}
                                        </TableCell>
                                        <TableCell>
                                            <Box
                                                sx={{ display: "flex", gap: 1 }}
                                            >
                                                <Button
                                                    variant="outlined"
                                                    size="small"
                                                    startIcon={
                                                        <VisibilityIcon />
                                                    }
                                                    onClick={() =>
                                                        handleViewDetails(
                                                            noDues
                                                        )
                                                    }
                                                    sx={{
                                                        color: "#fff",
                                                        borderColor:
                                                            "rgba(255,255,255,0.3)",
                                                        "&:hover": {
                                                            borderColor: "#fff",
                                                            backgroundColor:
                                                                "rgba(255,255,255,0.1)",
                                                        },
                                                    }}
                                                >
                                                    View
                                                </Button>
                                            </Box>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                )}

                {/* View Details Dialog */}
                <Dialog
                    open={viewDialogOpen}
                    onClose={handleCloseViewDialog}
                    maxWidth="md"
                    fullWidth
                    PaperProps={{
                        sx: {
                            background: "rgba(30, 30, 30, 0.95)",
                            backdropFilter: "blur(10px)",
                            border: "1px solid rgba(255,255,255,0.2)",
                        },
                    }}
                >
                    <DialogTitle
                        sx={{
                            color: "#fff",
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                        }}
                    >
                        <Typography variant="h6">No Dues Details</Typography>
                        <IconButton
                            onClick={handleCloseViewDialog}
                            sx={{ color: "#fff" }}
                        >
                            <CloseIcon />
                        </IconButton>
                    </DialogTitle>
                    <DialogContent>
                        {selectedNoDues && (
                            <Box>
                                {/* Student Information */}
                                <Card
                                    sx={{
                                        mb: 3,
                                        background: "rgba(255,255,255,0.05)",
                                    }}
                                >
                                    <CardContent>
                                        <Typography
                                            variant="h6"
                                            sx={{ color: "#fff", mb: 2 }}
                                        >
                                            Student Information
                                        </Typography>
                                        <Grid container spacing={2}>
                                            <Grid item xs={6}>
                                                <Typography
                                                    variant="body2"
                                                    sx={{
                                                        color: "rgba(255,255,255,0.7)",
                                                    }}
                                                >
                                                    Name
                                                </Typography>
                                                <Typography
                                                    sx={{ color: "#fff" }}
                                                >
                                                    {
                                                        selectedNoDues
                                                            .studentInfo?.name
                                                    }
                                                </Typography>
                                            </Grid>
                                            <Grid item xs={6}>
                                                <Typography
                                                    variant="body2"
                                                    sx={{
                                                        color: "rgba(255,255,255,0.7)",
                                                    }}
                                                >
                                                    Roll Number
                                                </Typography>
                                                <Typography
                                                    sx={{ color: "#fff" }}
                                                >
                                                    {
                                                        selectedNoDues
                                                            .studentInfo
                                                            ?.rollNumber
                                                    }
                                                </Typography>
                                            </Grid>
                                            <Grid item xs={6}>
                                                <Typography
                                                    variant="body2"
                                                    sx={{
                                                        color: "rgba(255,255,255,0.7)",
                                                    }}
                                                >
                                                    Email
                                                </Typography>
                                                <Typography
                                                    sx={{ color: "#fff" }}
                                                >
                                                    {
                                                        selectedNoDues
                                                            .studentInfo?.email
                                                    }
                                                </Typography>
                                            </Grid>
                                            <Grid item xs={6}>
                                                <Typography
                                                    variant="body2"
                                                    sx={{
                                                        color: "rgba(255,255,255,0.7)",
                                                    }}
                                                >
                                                    Branch
                                                </Typography>
                                                <Typography
                                                    sx={{ color: "#fff" }}
                                                >
                                                    {
                                                        selectedNoDues
                                                            .studentInfo?.branch
                                                    }
                                                </Typography>
                                            </Grid>
                                        </Grid>
                                    </CardContent>
                                </Card>

                                {/* Bank Details */}
                                <Card
                                    sx={{
                                        mb: 3,
                                        background: "rgba(255,255,255,0.05)",
                                    }}
                                >
                                    <CardContent>
                                        <Typography
                                            variant="h6"
                                            sx={{ color: "#fff", mb: 2 }}
                                        >
                                            Bank Details
                                        </Typography>
                                        <Grid container spacing={2}>
                                            <Grid item xs={12}>
                                                <Typography
                                                    variant="body2"
                                                    sx={{
                                                        color: "rgba(255,255,255,0.7)",
                                                    }}
                                                >
                                                    Account Holder Name
                                                </Typography>
                                                <Typography
                                                    sx={{ color: "#fff" }}
                                                >
                                                    {
                                                        selectedNoDues
                                                            .bankDetails
                                                            ?.accountHolderName
                                                    }
                                                </Typography>
                                            </Grid>
                                            <Grid item xs={6}>
                                                <Typography
                                                    variant="body2"
                                                    sx={{
                                                        color: "rgba(255,255,255,0.7)",
                                                    }}
                                                >
                                                    Account Number
                                                </Typography>
                                                <Typography
                                                    sx={{ color: "#fff" }}
                                                >
                                                    {
                                                        selectedNoDues
                                                            .bankDetails
                                                            ?.accountNumber
                                                    }
                                                </Typography>
                                            </Grid>
                                            <Grid item xs={6}>
                                                <Typography
                                                    variant="body2"
                                                    sx={{
                                                        color: "rgba(255,255,255,0.7)",
                                                    }}
                                                >
                                                    IFSC Code
                                                </Typography>
                                                <Typography
                                                    sx={{ color: "#fff" }}
                                                >
                                                    {
                                                        selectedNoDues
                                                            .bankDetails
                                                            ?.ifscCode
                                                    }
                                                </Typography>
                                            </Grid>
                                            <Grid item xs={6}>
                                                <Typography
                                                    variant="body2"
                                                    sx={{
                                                        color: "rgba(255,255,255,0.7)",
                                                    }}
                                                >
                                                    Bank Name
                                                </Typography>
                                                <Typography
                                                    sx={{ color: "#fff" }}
                                                >
                                                    {
                                                        selectedNoDues
                                                            .bankDetails
                                                            ?.bankName
                                                    }
                                                </Typography>
                                            </Grid>
                                            <Grid item xs={6}>
                                                <Typography
                                                    variant="body2"
                                                    sx={{
                                                        color: "rgba(255,255,255,0.7)",
                                                    }}
                                                >
                                                    Branch
                                                </Typography>
                                                <Typography
                                                    sx={{ color: "#fff" }}
                                                >
                                                    {
                                                        selectedNoDues
                                                            .bankDetails
                                                            ?.branchName
                                                    }
                                                </Typography>
                                            </Grid>
                                        </Grid>
                                    </CardContent>
                                </Card>

                                {/* Donation */}
                                {selectedNoDues.donation?.amount > 0 && (
                                    <Card
                                        sx={{
                                            mb: 3,
                                            background:
                                                "rgba(255,255,255,0.05)",
                                        }}
                                    >
                                        <CardContent>
                                            <Typography
                                                variant="h6"
                                                sx={{ color: "#fff", mb: 2 }}
                                            >
                                                Donation
                                            </Typography>
                                            <Grid container spacing={2}>
                                                <Grid item xs={6}>
                                                    <Typography
                                                        variant="body2"
                                                        sx={{
                                                            color: "rgba(255,255,255,0.7)",
                                                        }}
                                                    >
                                                        Amount
                                                    </Typography>
                                                    <Typography
                                                        sx={{ color: "#fff" }}
                                                    >
                                                        ₹
                                                        {
                                                            selectedNoDues
                                                                .donation.amount
                                                        }
                                                    </Typography>
                                                </Grid>
                                                <Grid item xs={6}>
                                                    <Typography
                                                        variant="body2"
                                                        sx={{
                                                            color: "rgba(255,255,255,0.7)",
                                                        }}
                                                    >
                                                        Purpose
                                                    </Typography>
                                                    <Typography
                                                        sx={{ color: "#fff" }}
                                                    >
                                                        {selectedNoDues.donation
                                                            .purpose ||
                                                            "Student Welfare Fund"}
                                                    </Typography>
                                                </Grid>
                                            </Grid>
                                        </CardContent>
                                    </Card>
                                )}

                                {/* Approval Progress */}
                                <Card
                                    sx={{
                                        mb: 3,
                                        background: "rgba(255,255,255,0.05)",
                                    }}
                                >
                                    <CardContent>
                                        <Typography
                                            variant="h6"
                                            sx={{ color: "#fff", mb: 2 }}
                                        >
                                            Approval Progress
                                        </Typography>
                                        <Stepper
                                            activeStep={
                                                selectedNoDues.currentStage
                                            }
                                            orientation="vertical"
                                        >
                                            {selectedNoDues.approvalFlow?.map(
                                                (approver, index) => {
                                                    const signature =
                                                        selectedNoDues.signatures?.find(
                                                            (sig) =>
                                                                sig.order ===
                                                                index + 1
                                                        );
                                                    return (
                                                        <Step
                                                            key={index}
                                                            completed={
                                                                !!signature
                                                            }
                                                        >
                                                            <StepLabel>
                                                                <Box>
                                                                    <Typography
                                                                        sx={{
                                                                            color: "#fff",
                                                                        }}
                                                                    >
                                                                        {
                                                                            approver.department
                                                                        }
                                                                    </Typography>
                                                                    <Typography
                                                                        variant="body2"
                                                                        sx={{
                                                                            color: "rgba(255,255,255,0.6)",
                                                                        }}
                                                                    >
                                                                        {
                                                                            approver.email
                                                                        }
                                                                    </Typography>
                                                                    {signature && (
                                                                        <Typography
                                                                            variant="caption"
                                                                            sx={{
                                                                                color: "#4caf50",
                                                                            }}
                                                                        >
                                                                            Signed
                                                                            on{" "}
                                                                            {new Date(
                                                                                signature.timestamp
                                                                            ).toLocaleString()}
                                                                        </Typography>
                                                                    )}
                                                                </Box>
                                                            </StepLabel>
                                                        </Step>
                                                    );
                                                }
                                            )}
                                        </Stepper>
                                    </CardContent>
                                </Card>
                            </Box>
                        )}
                    </DialogContent>
                    <DialogActions sx={{ p: 3 }}>
                        <Button
                            onClick={() =>
                                handleOpenRejectDialog(selectedNoDues)
                            }
                            startIcon={<CancelIcon />}
                            disabled={processing}
                            sx={{
                                color: "#f44336",
                                borderColor: "#f44336",
                                "&:hover": {
                                    backgroundColor: "rgba(244, 67, 54, 0.1)",
                                },
                            }}
                        >
                            Reject
                        </Button>
                        <Button
                            onClick={() => handleApprove(selectedNoDues)}
                            variant="contained"
                            startIcon={<CheckCircleIcon />}
                            disabled={processing}
                            sx={{
                                backgroundColor: "#4caf50",
                                "&:hover": {
                                    backgroundColor: "#45a049",
                                },
                            }}
                        >
                            {processing ? (
                                <CircularProgress size={24} />
                            ) : (
                                "Approve & Sign"
                            )}
                        </Button>
                    </DialogActions>
                </Dialog>

                {/* Reject Dialog */}
                <Dialog
                    open={rejectDialogOpen}
                    onClose={handleCloseRejectDialog}
                    maxWidth="sm"
                    fullWidth
                    PaperProps={{
                        sx: {
                            background: "rgba(30, 30, 30, 0.95)",
                            backdropFilter: "blur(10px)",
                            border: "1px solid rgba(255,255,255,0.2)",
                        },
                    }}
                >
                    <DialogTitle sx={{ color: "#fff" }}>
                        Reject No Dues
                    </DialogTitle>
                    <DialogContent>
                        <TextField
                            autoFocus
                            margin="dense"
                            label="Rejection Reason"
                            fullWidth
                            multiline
                            rows={4}
                            value={rejectionReason}
                            onChange={(e) => setRejectionReason(e.target.value)}
                            sx={{
                                "& .MuiOutlinedInput-root": {
                                    color: "#fff",
                                    "& fieldset": {
                                        borderColor: "rgba(255,255,255,0.3)",
                                    },
                                },
                                "& .MuiInputLabel-root": {
                                    color: "rgba(255,255,255,0.7)",
                                },
                            }}
                        />
                    </DialogContent>
                    <DialogActions sx={{ p: 3 }}>
                        <Button
                            onClick={handleCloseRejectDialog}
                            sx={{ color: "#fff" }}
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleReject}
                            variant="contained"
                            color="error"
                            disabled={processing}
                        >
                            {processing ? (
                                <CircularProgress size={24} />
                            ) : (
                                "Reject"
                            )}
                        </Button>
                    </DialogActions>
                </Dialog>

                {/* Notification Snackbar */}
                <Snackbar
                    open={notification.open}
                    autoHideDuration={6000}
                    onClose={handleCloseNotification}
                    anchorOrigin={{ vertical: "top", horizontal: "center" }}
                >
                    <Alert
                        onClose={handleCloseNotification}
                        severity={notification.severity}
                        elevation={6}
                        variant="filled"
                    >
                        {notification.message}
                    </Alert>
                </Snackbar>
            </Container>
        </>
    );
};

export default FacultyStudentNoDuesApproval;
