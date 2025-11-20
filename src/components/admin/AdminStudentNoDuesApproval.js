import React, { useState, useEffect } from "react";
import {
    Box,
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
    Tabs,
    Tab,
} from "@mui/material";
import {
    Visibility as VisibilityIcon,
    CheckCircle as CheckCircleIcon,
    Cancel as CancelIcon,
    Close as CloseIcon,
} from "@mui/icons-material";
import { useWallets } from "@privy-io/react-auth";
import { ethers } from "ethers";
import api from "../../utils/apiClient";

const AdminStudentNoDuesApproval = () => {
    const { wallets } = useWallets();
    const [loading, setLoading] = useState(true);
    const [allNoDues, setAllNoDues] = useState([]);
    const [filteredNoDues, setFilteredNoDues] = useState([]);
    const [selectedTab, setSelectedTab] = useState(0);
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
        fetchAllNoDues();
    }, []);

    useEffect(() => {
        filterNoDues();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedTab, allNoDues]);

    const fetchAllNoDues = async () => {
        try {
            setLoading(true);
            const response = await api.studentNoDues.getAllNoDues();
            setAllNoDues(response.data || []);
        } catch (error) {
            console.error("Error fetching no dues:", error);
            setNotification({
                open: true,
                message: "Failed to load no dues requests.",
                severity: "error",
            });
        } finally {
            setLoading(false);
        }
    };

    const filterNoDues = () => {
        let filtered = [];
        switch (selectedTab) {
            case 0: // All
                filtered = allNoDues;
                break;
            case 1: // Pending
                filtered = allNoDues.filter((nd) => nd.status === "pending");
                break;
            case 2: // In Progress
                filtered = allNoDues.filter(
                    (nd) => nd.status === "in_progress"
                );
                break;
            case 3: // Approved
                filtered = allNoDues.filter((nd) => nd.status === "approved");
                break;
            case 4: // Rejected
                filtered = allNoDues.filter((nd) => nd.status === "rejected");
                break;
            default:
                filtered = allNoDues;
        }
        setFilteredNoDues(filtered);
    };

    const handleTabChange = (event, newValue) => {
        setSelectedTab(newValue);
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

    const canApprove = (noDues) => {
        if (!noDues) return false;
        if (noDues.status !== "pending" && noDues.status !== "in_progress")
            return false;

        const currentApprover = noDues.approvalFlow?.[noDues.currentStage];
        if (!currentApprover) return false;

        // Check if current user's email matches the current approver
        const userData = JSON.parse(localStorage.getItem("userData") || "{}");
        return (
            currentApprover.email.toLowerCase() ===
            userData.email?.toLowerCase()
        );
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
            fetchAllNoDues();
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
            fetchAllNoDues();
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
        );
    }

    return (
        <Box>
            {/* Tabs */}
            <Paper
                sx={{
                    mb: 3,
                    background: "rgba(255,255,255,0.1)",
                    backdropFilter: "blur(10px)",
                    border: "1px solid rgba(255,255,255,0.2)",
                }}
            >
                <Tabs
                    value={selectedTab}
                    onChange={handleTabChange}
                    sx={{
                        "& .MuiTab-root": {
                            color: "rgba(255,255,255,0.7)",
                            "&.Mui-selected": {
                                color: "#fff",
                            },
                        },
                        "& .MuiTabs-indicator": {
                            backgroundColor: "#fff",
                        },
                    }}
                >
                    <Tab label="All" />
                    <Tab label="Pending" />
                    <Tab label="In Progress" />
                    <Tab label="Approved" />
                    <Tab label="Rejected" />
                </Tabs>
            </Paper>

            {filteredNoDues.length === 0 ? (
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
                        No student no dues requests found
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
                            {filteredNoDues.map((noDues) => (
                                <TableRow key={noDues._id}>
                                    <TableCell sx={{ color: "#fff" }}>
                                        {noDues.studentInfo?.name || "N/A"}
                                    </TableCell>
                                    <TableCell sx={{ color: "#fff" }}>
                                        {noDues.studentInfo?.rollNumber ||
                                            "N/A"}
                                    </TableCell>
                                    <TableCell sx={{ color: "#fff" }}>
                                        {noDues.studentInfo?.branch || "N/A"}
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
                                        <Button
                                            variant="outlined"
                                            size="small"
                                            startIcon={<VisibilityIcon />}
                                            onClick={() =>
                                                handleViewDetails(noDues)
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
                                            <Typography sx={{ color: "#fff" }}>
                                                {
                                                    selectedNoDues.studentInfo
                                                        ?.name
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
                                            <Typography sx={{ color: "#fff" }}>
                                                {
                                                    selectedNoDues.studentInfo
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
                                            <Typography sx={{ color: "#fff" }}>
                                                {
                                                    selectedNoDues.studentInfo
                                                        ?.email
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
                                            <Typography sx={{ color: "#fff" }}>
                                                {
                                                    selectedNoDues.studentInfo
                                                        ?.branch
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
                                            <Typography sx={{ color: "#fff" }}>
                                                {
                                                    selectedNoDues.bankDetails
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
                                            <Typography sx={{ color: "#fff" }}>
                                                {
                                                    selectedNoDues.bankDetails
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
                                            <Typography sx={{ color: "#fff" }}>
                                                {
                                                    selectedNoDues.bankDetails
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
                                            <Typography sx={{ color: "#fff" }}>
                                                {
                                                    selectedNoDues.bankDetails
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
                                            <Typography sx={{ color: "#fff" }}>
                                                {
                                                    selectedNoDues.bankDetails
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
                                        background: "rgba(255,255,255,0.05)",
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
                                                        selectedNoDues.donation
                                                            .amount
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
                                        activeStep={selectedNoDues.currentStage}
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
                                                        completed={!!signature}
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

                            {/* Rejection Details */}
                            {selectedNoDues.status === "rejected" && (
                                <Alert severity="error" sx={{ mb: 3 }}>
                                    <Typography variant="body2">
                                        <strong>Rejection Reason:</strong>{" "}
                                        {selectedNoDues.rejectionDetails
                                            ?.reason || "Not specified"}
                                    </Typography>
                                    <Typography variant="body2" sx={{ mt: 1 }}>
                                        Rejected by:{" "}
                                        {
                                            selectedNoDues.rejectionDetails
                                                ?.rejectedBy?.name
                                        }{" "}
                                        (
                                        {
                                            selectedNoDues.rejectionDetails
                                                ?.rejectedBy?.department
                                        }
                                        )
                                    </Typography>
                                </Alert>
                            )}
                        </Box>
                    )}
                </DialogContent>
                <DialogActions sx={{ p: 3 }}>
                    {canApprove(selectedNoDues) && (
                        <>
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
                                        backgroundColor:
                                            "rgba(244, 67, 54, 0.1)",
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
                        </>
                    )}
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
                <DialogTitle sx={{ color: "#fff" }}>Reject No Dues</DialogTitle>
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
                        {processing ? <CircularProgress size={24} /> : "Reject"}
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
        </Box>
    );
};

export default AdminStudentNoDuesApproval;
