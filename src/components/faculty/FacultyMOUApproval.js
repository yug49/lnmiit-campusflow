import React, { useState, useEffect } from "react";
import {
    Box,
    Container,
    Typography,
    Paper,
    Tabs,
    Tab,
    Grid,
    Button,
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Chip,
    TextField,
    CircularProgress,
    Alert,
    Snackbar,
    Tooltip,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useNavigate } from "react-router-dom";
import WaveBackground from "../WaveBackground";
import CloseIcon from "@mui/icons-material/Close";
import DownloadIcon from "@mui/icons-material/Download";
import VisibilityIcon from "@mui/icons-material/Visibility";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import PendingIcon from "@mui/icons-material/Pending";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import { usePrivy, useWallets } from "@privy-io/react-auth";
import CryptoJS from "crypto-js";
import api from "../../utils/apiClient";
import { ethers } from "ethers";

const FacultyMOUApproval = () => {
    const navigate = useNavigate();
    const { user } = usePrivy();
    const { wallets } = useWallets();

    const [activeTab, setActiveTab] = useState(0);
    const [selectedMOU, setSelectedMOU] = useState(null);
    const [detailsOpen, setDetailsOpen] = useState(false);
    const [rejectionDialog, setRejectionDialog] = useState(false);
    const [rejectionReason, setRejectionReason] = useState("");

    // Data states
    const [pendingMOUs, setPendingMOUs] = useState([]);
    const [inProgressMOUs, setInProgressMOUs] = useState([]);
    const [approvedMOUs, setApprovedMOUs] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");

    // Signing states
    const [isSigning, setIsSigning] = useState(false);
    const [isRejecting, setIsRejecting] = useState(false);
    const [copySuccess, setCopySuccess] = useState("");

    useEffect(() => {
        fetchMOUs();
    }, []);

    const fetchMOUs = async () => {
        try {
            setIsLoading(true);
            setError("");

            // Fetch pending MoUs
            const pendingResponse = await api.mou.getPendingMoUs();
            setPendingMOUs(pendingResponse.data || []);

            // Fetch in-progress MoUs (where faculty has signed but still waiting for others)
            const inProgressResponse = await api.mou.getAllMoUs({
                status: "in_progress",
            });
            setInProgressMOUs(inProgressResponse.data || []);

            // Fetch completed MoUs
            const approvedResponse = await api.mou.getAllMoUs({
                status: "completed",
            });
            setApprovedMOUs(approvedResponse.data || []);
        } catch (err) {
            console.error("Error fetching MoUs:", err);
            setError(err.response?.data?.message || "Failed to fetch MoUs");
        } finally {
            setIsLoading(false);
        }
    };

    const handleTabChange = (event, newValue) => {
        setActiveTab(newValue);
    };

    const handleViewDetails = (mou) => {
        setSelectedMOU(mou);
        setDetailsOpen(true);
    };

    const handleCopyToClipboard = async (text, label) => {
        try {
            await navigator.clipboard.writeText(text);
            setCopySuccess(`${label} copied to clipboard!`);
            setTimeout(() => setCopySuccess(""), 3000);
        } catch (err) {
            console.error("Failed to copy:", err);
            setCopySuccess("Failed to copy");
            setTimeout(() => setCopySuccess(""), 3000);
        }
    };

    const handleApprove = async () => {
        if (!selectedMOU) return;

        // Check if user has wallet
        const embeddedWallet = wallets.find(
            (wallet) => wallet.walletClientType === "privy"
        );

        if (!embeddedWallet) {
            setError(
                "No wallet found. Please ensure your wallet is connected."
            );
            return;
        }

        try {
            setIsSigning(true);
            setError("");

            // Get document hash
            const documentHash = selectedMOU.document.hash;

            // Build the data to sign (chain of signatures)
            let dataToSign;
            if (selectedMOU.signatures && selectedMOU.signatures.length > 0) {
                // Chain: Sign the previous signature data
                const lastSignature =
                    selectedMOU.signatures[selectedMOU.signatures.length - 1];
                dataToSign = JSON.stringify({
                    documentHash,
                    previousSignature: lastSignature.signature,
                    previousWallet: lastSignature.walletAddress,
                    previousSigner: lastSignature.signerEmail,
                });
            } else {
                // First signature: Sign the document hash only
                dataToSign = JSON.stringify({
                    documentHash,
                    firstSigner: true,
                });
            }

            // Sign the data with Privy wallet
            const ethereumProvider = await embeddedWallet.getEthereumProvider();
            const provider = new ethers.BrowserProvider(ethereumProvider);
            const signer = await provider.getSigner();
            const walletAddress = await signer.getAddress();
            const signature = await signer.signMessage(dataToSign);

            // Submit signature to backend
            const response = await api.mou.signMoU(selectedMOU._id, {
                signature,
                walletAddress,
                documentHash,
                signedData: dataToSign, // Include the data that was signed
            });

            if (response.success) {
                setDetailsOpen(false);
                await fetchMOUs(); // Refresh the list
                setError("");
                setCopySuccess("MoU signed successfully!");
                setTimeout(() => setCopySuccess(""), 3000);
            }
        } catch (err) {
            console.error("Error signing MoU:", err);
            setError(
                err.response?.data?.message ||
                    "Failed to sign MoU. Please try again."
            );
        } finally {
            setIsSigning(false);
        }
    };

    const handleOpenRejectionDialog = () => {
        setRejectionDialog(true);
    };

    const handleReject = async () => {
        if (!selectedMOU || !rejectionReason.trim()) return;

        try {
            setIsRejecting(true);
            setError("");

            const response = await api.mou.rejectMoU(
                selectedMOU._id,
                rejectionReason
            );

            if (response.success) {
                setRejectionDialog(false);
                setDetailsOpen(false);
                setRejectionReason("");
                await fetchMOUs(); // Refresh the list
                setCopySuccess("MoU rejected successfully");
                setTimeout(() => setCopySuccess(""), 3000);
            }
        } catch (err) {
            console.error("Error rejecting MoU:", err);
            setError(
                err.response?.data?.message ||
                    "Failed to reject MoU. Please try again."
            );
        } finally {
            setIsRejecting(false);
        }
    };

    const getStatusInfo = (status) => {
        switch (status) {
            case "approved":
            case "completed":
                return {
                    color: "success",
                    icon: <CheckCircleIcon fontSize="small" />,
                    label: "Completed",
                };
            case "rejected":
                return {
                    color: "error",
                    icon: <CancelIcon fontSize="small" />,
                    label: "Rejected",
                };
            case "pending":
            case "in_progress":
                return {
                    color: "warning",
                    icon: <PendingIcon fontSize="small" />,
                    label: status === "in_progress" ? "In Progress" : "Pending",
                };
            default:
                return {
                    color: "default",
                    icon: <PendingIcon fontSize="small" />,
                    label: status,
                };
        }
    };

    const renderMOUDetails = () => {
        if (!selectedMOU) return null;

        const statusInfo = getStatusInfo(selectedMOU.status);
        const isPending =
            selectedMOU.status === "pending" ||
            selectedMOU.status === "in_progress";

        return (
            <Dialog
                open={detailsOpen}
                onClose={() => setDetailsOpen(false)}
                maxWidth="md"
                fullWidth
            >
                <DialogTitle
                    sx={{
                        bgcolor: "primary.main",
                        color: "white",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                    }}
                >
                    <Typography variant="h6">MOU Review</Typography>
                    <IconButton
                        onClick={() => setDetailsOpen(false)}
                        sx={{ color: "white" }}
                    >
                        <CloseIcon />
                    </IconButton>
                </DialogTitle>
                <DialogContent sx={{ mt: 2 }}>
                    {error && (
                        <Alert
                            severity="error"
                            sx={{ mb: 2 }}
                            onClose={() => setError("")}
                        >
                            {error}
                        </Alert>
                    )}

                    <Grid container spacing={3}>
                        {/* Status Banner */}
                        <Grid item xs={12}>
                            <Box
                                sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    p: 2,
                                    borderRadius: 1,
                                    bgcolor:
                                        selectedMOU.status === "completed"
                                            ? "rgba(46, 125, 50, 0.1)"
                                            : selectedMOU.status === "rejected"
                                            ? "rgba(211, 47, 47, 0.1)"
                                            : "rgba(255, 167, 38, 0.1)",
                                }}
                            >
                                <Box sx={{ mr: 1 }}>{statusInfo.icon}</Box>
                                <Typography
                                    variant="h6"
                                    sx={{
                                        color:
                                            selectedMOU.status === "completed"
                                                ? "success.main"
                                                : selectedMOU.status ===
                                                  "rejected"
                                                ? "error.main"
                                                : "warning.main",
                                    }}
                                >
                                    Status: {statusInfo.label}
                                </Typography>
                            </Box>
                        </Grid>

                        {/* Basic MOU Information */}
                        <Grid item xs={12}>
                            <Typography
                                variant="h6"
                                sx={{
                                    borderBottom: "1px solid #eee",
                                    pb: 1,
                                    mb: 2,
                                }}
                            >
                                Basic Information
                            </Typography>
                            <Grid container spacing={2}>
                                <Grid item xs={12}>
                                    <Typography
                                        variant="subtitle1"
                                        fontWeight="bold"
                                    >
                                        MOU Title:
                                    </Typography>
                                    <Typography>{selectedMOU.title}</Typography>
                                </Grid>
                                <Grid item xs={12} md={6}>
                                    <Typography
                                        variant="subtitle1"
                                        fontWeight="bold"
                                    >
                                        Submitted By:
                                    </Typography>
                                    <Typography>
                                        {selectedMOU.submittedBy?.name}
                                    </Typography>
                                </Grid>
                                <Grid item xs={12} md={6}>
                                    <Typography
                                        variant="subtitle1"
                                        fontWeight="bold"
                                    >
                                        Submitter Email:
                                    </Typography>
                                    <Typography>
                                        {selectedMOU.submittedBy?.email}
                                    </Typography>
                                </Grid>
                                <Grid item xs={12} md={6}>
                                    <Typography
                                        variant="subtitle1"
                                        fontWeight="bold"
                                    >
                                        Submission Date:
                                    </Typography>
                                    <Typography>
                                        {new Date(
                                            selectedMOU.createdAt
                                        ).toLocaleString()}
                                    </Typography>
                                </Grid>
                                <Grid item xs={12} md={6}>
                                    <Typography
                                        variant="subtitle1"
                                        fontWeight="bold"
                                    >
                                        Current Status:
                                    </Typography>
                                    <Typography
                                        sx={{ textTransform: "capitalize" }}
                                    >
                                        {selectedMOU.status.replace("_", " ")}
                                    </Typography>
                                </Grid>
                                {selectedMOU.document?.hash && (
                                    <Grid item xs={12}>
                                        <Typography
                                            variant="subtitle1"
                                            fontWeight="bold"
                                        >
                                            Document Hash (SHA-256):
                                        </Typography>
                                        <Box
                                            sx={{
                                                display: "flex",
                                                alignItems: "center",
                                                gap: 1,
                                            }}
                                        >
                                            <Typography
                                                sx={{
                                                    fontFamily: "monospace",
                                                    fontSize: "0.85rem",
                                                    wordBreak: "break-all",
                                                    flex: 1,
                                                }}
                                            >
                                                {selectedMOU.document.hash}
                                            </Typography>
                                            <Tooltip title="Copy hash">
                                                <IconButton
                                                    size="small"
                                                    onClick={() =>
                                                        handleCopyToClipboard(
                                                            selectedMOU.document
                                                                .hash,
                                                            "Document hash"
                                                        )
                                                    }
                                                >
                                                    <ContentCopyIcon fontSize="small" />
                                                </IconButton>
                                            </Tooltip>
                                        </Box>
                                    </Grid>
                                )}
                            </Grid>
                        </Grid>

                        {/* MOU Document */}
                        <Grid item xs={12}>
                            <Typography
                                variant="h6"
                                sx={{
                                    borderBottom: "1px solid #eee",
                                    pb: 1,
                                    mb: 2,
                                }}
                            >
                                MOU Document
                            </Typography>
                            <Grid container spacing={2}>
                                <Grid item xs={12}>
                                    <Typography
                                        variant="subtitle1"
                                        fontWeight="bold"
                                    >
                                        File Name:
                                    </Typography>
                                    <Typography>
                                        {selectedMOU.document?.filename ||
                                            "MOU Document"}
                                    </Typography>
                                </Grid>
                                {selectedMOU.document?.size && (
                                    <Grid item xs={12}>
                                        <Typography
                                            variant="subtitle1"
                                            fontWeight="bold"
                                        >
                                            File Size:
                                        </Typography>
                                        <Typography>
                                            {(
                                                selectedMOU.document.size /
                                                (1024 * 1024)
                                            ).toFixed(2)}{" "}
                                            MB
                                        </Typography>
                                    </Grid>
                                )}
                                <Grid item xs={12}>
                                    <Box
                                        sx={{
                                            display: "flex",
                                            gap: 2,
                                            flexWrap: "wrap",
                                        }}
                                    >
                                        <Button
                                            variant="contained"
                                            startIcon={<VisibilityIcon />}
                                            size="small"
                                            onClick={() => {
                                                if (selectedMOU.document?.url) {
                                                    const fullUrl =
                                                        selectedMOU.document.url.startsWith(
                                                            "http"
                                                        )
                                                            ? selectedMOU
                                                                  .document.url
                                                            : `${
                                                                  process.env
                                                                      .REACT_APP_API_URL ||
                                                                  "http://localhost:5001"
                                                              }${
                                                                  selectedMOU
                                                                      .document
                                                                      .url
                                                              }`;
                                                    window.open(
                                                        fullUrl,
                                                        "_blank"
                                                    );
                                                }
                                            }}
                                            disabled={
                                                !selectedMOU.document?.url
                                            }
                                        >
                                            Preview Document
                                        </Button>
                                    </Box>
                                </Grid>
                            </Grid>
                        </Grid>

                        {/* Recipients Flow */}
                        {selectedMOU.recipientsFlow &&
                            selectedMOU.recipientsFlow.length > 0 && (
                                <Grid item xs={12}>
                                    <Typography
                                        variant="h6"
                                        sx={{
                                            borderBottom: "1px solid #eee",
                                            pb: 1,
                                            mb: 2,
                                        }}
                                    >
                                        Approval Flow
                                    </Typography>
                                    <TableContainer
                                        component={Paper}
                                        variant="outlined"
                                    >
                                        <Table size="small">
                                            <TableHead>
                                                <TableRow>
                                                    <TableCell>Order</TableCell>
                                                    <TableCell>Role</TableCell>
                                                    <TableCell>Name</TableCell>
                                                    <TableCell>Email</TableCell>
                                                    <TableCell>
                                                        Status
                                                    </TableCell>
                                                </TableRow>
                                            </TableHead>
                                            <TableBody>
                                                {selectedMOU.recipientsFlow
                                                    .sort(
                                                        (a, b) =>
                                                            a.order - b.order
                                                    )
                                                    .map((recipient, index) => {
                                                        const hasSigned =
                                                            selectedMOU.signatures?.some(
                                                                (sig) =>
                                                                    sig.signerEmail?.toLowerCase() ===
                                                                    recipient.email?.toLowerCase()
                                                            );
                                                        const isCurrent =
                                                            recipient.order ===
                                                            selectedMOU.currentStage;

                                                        return (
                                                            <TableRow
                                                                key={index}
                                                                sx={{
                                                                    bgcolor:
                                                                        isCurrent
                                                                            ? "rgba(255, 167, 38, 0.1)"
                                                                            : "inherit",
                                                                }}
                                                            >
                                                                <TableCell>
                                                                    {
                                                                        recipient.order
                                                                    }
                                                                    {isCurrent && (
                                                                        <Chip
                                                                            label="Current"
                                                                            size="small"
                                                                            color="warning"
                                                                            sx={{
                                                                                ml: 1,
                                                                            }}
                                                                        />
                                                                    )}
                                                                </TableCell>
                                                                <TableCell>
                                                                    {
                                                                        recipient.role
                                                                    }
                                                                </TableCell>
                                                                <TableCell>
                                                                    {
                                                                        recipient.name
                                                                    }
                                                                </TableCell>
                                                                <TableCell>
                                                                    {
                                                                        recipient.email
                                                                    }
                                                                </TableCell>
                                                                <TableCell>
                                                                    {hasSigned ? (
                                                                        <Chip
                                                                            label="Signed"
                                                                            color="success"
                                                                            size="small"
                                                                            icon={
                                                                                <CheckCircleIcon />
                                                                            }
                                                                        />
                                                                    ) : isCurrent ? (
                                                                        <Chip
                                                                            label="Pending"
                                                                            color="warning"
                                                                            size="small"
                                                                            icon={
                                                                                <PendingIcon />
                                                                            }
                                                                        />
                                                                    ) : (
                                                                        <Chip
                                                                            label="Waiting"
                                                                            color="default"
                                                                            size="small"
                                                                        />
                                                                    )}
                                                                </TableCell>
                                                            </TableRow>
                                                        );
                                                    })}
                                            </TableBody>
                                        </Table>
                                    </TableContainer>
                                </Grid>
                            )}

                        {/* Signature Chain */}
                        <Grid item xs={12}>
                            <Typography
                                variant="h6"
                                sx={{
                                    borderBottom: "1px solid #eee",
                                    pb: 1,
                                    mb: 2,
                                }}
                            >
                                Signature Chain
                            </Typography>
                            {selectedMOU.signatures &&
                            selectedMOU.signatures.length > 0 ? (
                                <TableContainer
                                    component={Paper}
                                    variant="outlined"
                                >
                                    <Table size="small">
                                        <TableHead>
                                            <TableRow>
                                                <TableCell>Signer</TableCell>
                                                <TableCell>Email</TableCell>
                                                <TableCell>
                                                    Wallet Address
                                                </TableCell>
                                                <TableCell>Signed At</TableCell>
                                                <TableCell>Signature</TableCell>
                                                <TableCell>
                                                    Signed Data
                                                </TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {selectedMOU.signatures.map(
                                                (sig, index) => (
                                                    <TableRow key={index}>
                                                        <TableCell>
                                                            {sig.signerName}
                                                        </TableCell>
                                                        <TableCell>
                                                            {sig.signerEmail}
                                                        </TableCell>
                                                        <TableCell>
                                                            <Box
                                                                sx={{
                                                                    display:
                                                                        "flex",
                                                                    alignItems:
                                                                        "center",
                                                                    gap: 0.5,
                                                                }}
                                                            >
                                                                <Typography
                                                                    sx={{
                                                                        fontFamily:
                                                                            "monospace",
                                                                        fontSize:
                                                                            "0.75rem",
                                                                    }}
                                                                >
                                                                    {sig.walletAddress
                                                                        ? `${sig.walletAddress.substring(
                                                                              0,
                                                                              6
                                                                          )}...${sig.walletAddress.substring(
                                                                              sig
                                                                                  .walletAddress
                                                                                  .length -
                                                                                  4
                                                                          )}`
                                                                        : "N/A"}
                                                                </Typography>
                                                                {sig.walletAddress && (
                                                                    <Tooltip title="Copy wallet address">
                                                                        <IconButton
                                                                            size="small"
                                                                            onClick={() =>
                                                                                handleCopyToClipboard(
                                                                                    sig.walletAddress,
                                                                                    "Wallet address"
                                                                                )
                                                                            }
                                                                            sx={{
                                                                                p: 0.5,
                                                                            }}
                                                                        >
                                                                            <ContentCopyIcon
                                                                                sx={{
                                                                                    fontSize: 14,
                                                                                }}
                                                                            />
                                                                        </IconButton>
                                                                    </Tooltip>
                                                                )}
                                                            </Box>
                                                        </TableCell>
                                                        <TableCell>
                                                            {new Date(
                                                                sig.signedAt
                                                            ).toLocaleString()}
                                                        </TableCell>
                                                        <TableCell>
                                                            <Box
                                                                sx={{
                                                                    display:
                                                                        "flex",
                                                                    alignItems:
                                                                        "center",
                                                                    gap: 0.5,
                                                                }}
                                                            >
                                                                <Typography
                                                                    sx={{
                                                                        fontFamily:
                                                                            "monospace",
                                                                        fontSize:
                                                                            "0.75rem",
                                                                    }}
                                                                >
                                                                    {sig.signature
                                                                        ? `${sig.signature.substring(
                                                                              0,
                                                                              10
                                                                          )}...${sig.signature.substring(
                                                                              sig
                                                                                  .signature
                                                                                  .length -
                                                                                  8
                                                                          )}`
                                                                        : "N/A"}
                                                                </Typography>
                                                                {sig.signature && (
                                                                    <Tooltip title="Copy signature">
                                                                        <IconButton
                                                                            size="small"
                                                                            onClick={() =>
                                                                                handleCopyToClipboard(
                                                                                    sig.signature,
                                                                                    "Signature"
                                                                                )
                                                                            }
                                                                            sx={{
                                                                                p: 0.5,
                                                                            }}
                                                                        >
                                                                            <ContentCopyIcon
                                                                                sx={{
                                                                                    fontSize: 14,
                                                                                }}
                                                                            />
                                                                        </IconButton>
                                                                    </Tooltip>
                                                                )}
                                                            </Box>
                                                        </TableCell>
                                                        <TableCell>
                                                            <Box
                                                                sx={{
                                                                    display:
                                                                        "flex",
                                                                    alignItems:
                                                                        "center",
                                                                    gap: 0.5,
                                                                }}
                                                            >
                                                                <Typography
                                                                    sx={{
                                                                        fontFamily:
                                                                            "monospace",
                                                                        fontSize:
                                                                            "0.75rem",
                                                                        maxWidth:
                                                                            "200px",
                                                                        overflow:
                                                                            "hidden",
                                                                        textOverflow:
                                                                            "ellipsis",
                                                                        whiteSpace:
                                                                            "nowrap",
                                                                    }}
                                                                >
                                                                    {sig.signedData ||
                                                                        "N/A"}
                                                                </Typography>
                                                                {sig.signedData && (
                                                                    <Tooltip title="Copy signed data">
                                                                        <IconButton
                                                                            size="small"
                                                                            onClick={() =>
                                                                                handleCopyToClipboard(
                                                                                    sig.signedData,
                                                                                    "Signed data"
                                                                                )
                                                                            }
                                                                            sx={{
                                                                                p: 0.5,
                                                                            }}
                                                                        >
                                                                            <ContentCopyIcon
                                                                                sx={{
                                                                                    fontSize: 14,
                                                                                }}
                                                                            />
                                                                        </IconButton>
                                                                    </Tooltip>
                                                                )}
                                                            </Box>
                                                        </TableCell>
                                                    </TableRow>
                                                )
                                            )}
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                            ) : (
                                <Alert severity="info">
                                    No signatures yet. Awaiting digital
                                    signatures from approvers.
                                </Alert>
                            )}
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions>
                    {isPending && (
                        <>
                            <Button
                                onClick={handleOpenRejectionDialog}
                                variant="outlined"
                                color="error"
                                startIcon={<CancelIcon />}
                                disabled={isSigning || isRejecting}
                            >
                                Reject
                            </Button>
                            <Button
                                onClick={handleApprove}
                                variant="contained"
                                color="success"
                                startIcon={
                                    isSigning ? (
                                        <CircularProgress size={16} />
                                    ) : (
                                        <CheckCircleIcon />
                                    )
                                }
                                disabled={isSigning || isRejecting}
                            >
                                {isSigning
                                    ? "Signing..."
                                    : "Sign & Approve MoU"}
                            </Button>
                        </>
                    )}
                    <Button
                        onClick={() => setDetailsOpen(false)}
                        disabled={isSigning || isRejecting}
                    >
                        Close
                    </Button>
                </DialogActions>
            </Dialog>
        );
    };

    const renderRejectionDialog = () => (
        <Dialog
            open={rejectionDialog}
            onClose={() => !isRejecting && setRejectionDialog(false)}
            maxWidth="sm"
            fullWidth
        >
            <DialogTitle>Reject MOU</DialogTitle>
            <DialogContent>
                <Typography variant="body1" gutterBottom>
                    Please provide a reason for rejecting this MOU.
                </Typography>
                <TextField
                    fullWidth
                    multiline
                    rows={4}
                    margin="normal"
                    label="Reason for Rejection"
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    disabled={isRejecting}
                />
            </DialogContent>
            <DialogActions>
                <Button
                    onClick={() => setRejectionDialog(false)}
                    disabled={isRejecting}
                >
                    Cancel
                </Button>
                <Button
                    onClick={handleReject}
                    variant="contained"
                    color="error"
                    disabled={!rejectionReason.trim() || isRejecting}
                    startIcon={
                        isRejecting ? <CircularProgress size={16} /> : null
                    }
                >
                    {isRejecting ? "Rejecting..." : "Confirm Rejection"}
                </Button>
            </DialogActions>
        </Dialog>
    );

    const renderPendingMOUs = () => {
        if (isLoading) {
            return (
                <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
                    <CircularProgress />
                </Box>
            );
        }

        if (pendingMOUs.length === 0) {
            return (
                <Box sx={{ p: 4, textAlign: "center" }}>
                    <Typography variant="body1" color="text.secondary">
                        No pending MoUs require your approval at this time.
                    </Typography>
                </Box>
            );
        }

        return (
            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Title</TableCell>
                            <TableCell>Submitted By</TableCell>
                            <TableCell>Submission Date</TableCell>
                            <TableCell>Status</TableCell>
                            <TableCell>Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {pendingMOUs.map((mou) => {
                            const statusInfo = getStatusInfo(mou.status);
                            return (
                                <TableRow key={mou._id}>
                                    <TableCell>{mou.title}</TableCell>
                                    <TableCell>
                                        {mou.submittedBy?.name || "N/A"}
                                    </TableCell>
                                    <TableCell>
                                        {new Date(
                                            mou.createdAt
                                        ).toLocaleDateString()}
                                    </TableCell>
                                    <TableCell>
                                        <Chip
                                            label={statusInfo.label}
                                            color={statusInfo.color}
                                            size="small"
                                            icon={statusInfo.icon}
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <Button
                                            variant="contained"
                                            size="small"
                                            onClick={() =>
                                                handleViewDetails(mou)
                                            }
                                        >
                                            Review MoU
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            );
                        })}
                    </TableBody>
                </Table>
            </TableContainer>
        );
    };

    const renderInProgressMOUs = () => {
        if (isLoading) {
            return (
                <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
                    <CircularProgress />
                </Box>
            );
        }

        if (inProgressMOUs.length === 0) {
            return (
                <Box sx={{ p: 4, textAlign: "center" }}>
                    <Typography variant="body1" color="text.secondary">
                        No in-progress MoUs found.
                    </Typography>
                </Box>
            );
        }

        return (
            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Title</TableCell>
                            <TableCell>Submitted By</TableCell>
                            <TableCell>Submission Date</TableCell>
                            <TableCell>Current Stage</TableCell>
                            <TableCell>Signatures Collected</TableCell>
                            <TableCell>Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {inProgressMOUs.map((mou) => {
                            const currentRecipient =
                                mou.recipientsFlow?.[mou.currentStage];
                            const signaturesCount = mou.signatures?.length || 0;
                            const totalSigners =
                                mou.recipientsFlow?.length || 0;

                            return (
                                <TableRow key={mou._id}>
                                    <TableCell>{mou.title}</TableCell>
                                    <TableCell>
                                        {mou.submittedBy?.name || "N/A"}
                                    </TableCell>
                                    <TableCell>
                                        {new Date(
                                            mou.createdAt
                                        ).toLocaleDateString()}
                                    </TableCell>
                                    <TableCell>
                                        <Chip
                                            label={
                                                currentRecipient?.role || "N/A"
                                            }
                                            color="warning"
                                            size="small"
                                        />
                                    </TableCell>
                                    <TableCell>
                                        {signaturesCount} / {totalSigners}
                                    </TableCell>
                                    <TableCell>
                                        <Button
                                            variant="outlined"
                                            size="small"
                                            startIcon={<VisibilityIcon />}
                                            onClick={() =>
                                                handleViewDetails(mou)
                                            }
                                        >
                                            View Status
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            );
                        })}
                    </TableBody>
                </Table>
            </TableContainer>
        );
    };

    const renderApprovedMOUs = () => {
        if (isLoading) {
            return (
                <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
                    <CircularProgress />
                </Box>
            );
        }

        if (approvedMOUs.length === 0) {
            return (
                <Box sx={{ p: 4, textAlign: "center" }}>
                    <Typography variant="body1" color="text.secondary">
                        No completed MoUs found.
                    </Typography>
                </Box>
            );
        }

        return (
            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Title</TableCell>
                            <TableCell>Submitted By</TableCell>
                            <TableCell>Submission Date</TableCell>
                            <TableCell>Completion Date</TableCell>
                            <TableCell>Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {approvedMOUs.map((mou) => {
                            const completionDate =
                                mou.signatures && mou.signatures.length > 0
                                    ? new Date(
                                          mou.signatures[
                                              mou.signatures.length - 1
                                          ].signedAt
                                      ).toLocaleDateString()
                                    : "N/A";
                            return (
                                <TableRow key={mou._id}>
                                    <TableCell>{mou.title}</TableCell>
                                    <TableCell>
                                        {mou.submittedBy?.name || "N/A"}
                                    </TableCell>
                                    <TableCell>
                                        {new Date(
                                            mou.createdAt
                                        ).toLocaleDateString()}
                                    </TableCell>
                                    <TableCell>{completionDate}</TableCell>
                                    <TableCell>
                                        <Button
                                            variant="outlined"
                                            size="small"
                                            startIcon={<VisibilityIcon />}
                                            onClick={() =>
                                                handleViewDetails(mou)
                                            }
                                        >
                                            View Details
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            );
                        })}
                    </TableBody>
                </Table>
            </TableContainer>
        );
    };

    return (
        <>
            <WaveBackground />
            <Container maxWidth="lg" sx={{ py: 4 }}>
                <Box sx={{ mb: 4 }}>
                    <IconButton
                        onClick={() => navigate(-1)}
                        sx={{ color: "#fff", mb: 2 }}
                    >
                        <ArrowBackIcon />
                    </IconButton>
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
                        MOU Approval Dashboard
                    </Typography>
                </Box>

                <Paper
                    elevation={3}
                    sx={{
                        p: 3,
                        background: "rgba(255,255,255,0.9)",
                        backdropFilter: "blur(10px)",
                        borderRadius: 2,
                    }}
                >
                    {error && (
                        <Alert
                            severity="error"
                            sx={{ mb: 3 }}
                            onClose={() => setError("")}
                        >
                            {error}
                        </Alert>
                    )}

                    <Tabs
                        value={activeTab}
                        onChange={handleTabChange}
                        sx={{ borderBottom: 1, borderColor: "divider", mb: 3 }}
                    >
                        <Tab label="Pending Approvals" />
                        <Tab label="In Progress" />
                        <Tab label="Completed MOUs" />
                    </Tabs>

                    <Box sx={{ mt: 2 }}>
                        {activeTab === 0 && renderPendingMOUs()}
                        {activeTab === 1 && renderInProgressMOUs()}
                        {activeTab === 2 && renderApprovedMOUs()}
                    </Box>
                </Paper>
            </Container>
            {renderMOUDetails()}
            {renderRejectionDialog()}

            {/* Snackbar for notifications */}
            <Snackbar
                open={!!copySuccess}
                autoHideDuration={3000}
                onClose={() => setCopySuccess("")}
                message={copySuccess}
                anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
            />
        </>
    );
};

export default FacultyMOUApproval;
