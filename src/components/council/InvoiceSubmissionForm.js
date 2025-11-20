import React, { useState, useEffect } from "react";
import {
    Box,
    Paper,
    Typography,
    TextField,
    Button,
    IconButton,
    Alert,
    CircularProgress,
    Chip,
    List,
    ListItem,
    ListItemText,
    ListItemSecondaryAction,
    MenuItem,
    Select,
    FormControl,
    InputLabel,
} from "@mui/material";
import {
    CloudUpload as UploadIcon,
    Delete as DeleteIcon,
    Add as AddIcon,
    ArrowUpward as ArrowUpIcon,
    ArrowDownward as ArrowDownIcon,
    ArrowBack as ArrowBackIcon,
} from "@mui/icons-material";
import { usePrivy, useWallets } from "@privy-io/react-auth";
import { useNavigate } from "react-router-dom";
import api from "../../utils/apiClient";
import CryptoJS from "crypto-js";
import { ethers } from "ethers";

const InvoiceSubmissionForm = () => {
    const navigate = useNavigate();
    const { wallets } = useWallets();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [approvedEvents, setApprovedEvents] = useState([]);
    const [loadingEvents, setLoadingEvents] = useState(true);

    const [formData, setFormData] = useState({
        eventPermissionId: "",
        title: "",
        document: null,
        recipientsFlow: [],
    });

    const [newRecipient, setNewRecipient] = useState("");

    useEffect(() => {
        fetchApprovedEvents();
    }, []);

    const fetchApprovedEvents = async () => {
        try {
            setLoadingEvents(true);
            const response = await api.invoice.getApprovedEvents();

            // Backend returns {success, count, data: [...]}
            // Axios response.data should contain {success, count, data}
            const events = response.data?.data || response.data || [];

            console.log("Approved events fetched:", events);
            setApprovedEvents(events);
        } catch (err) {
            console.error("Error fetching approved events:", err);
            setError("Failed to fetch approved events");
        } finally {
            setLoadingEvents(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];

        if (file) {
            // Validate file type
            if (file.type !== "application/pdf") {
                setError("Only PDF files are supported");
                return;
            }

            // Validate file size (max 10MB)
            if (file.size > 10 * 1024 * 1024) {
                setError("File size must be less than 10MB");
                return;
            }

            setFormData((prev) => ({ ...prev, document: file }));
            setError("");
        }
    };

    const addRecipient = () => {
        const email = newRecipient.trim().toLowerCase();

        if (!email) {
            setError("Please enter an email address");
            return;
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            setError("Please enter a valid email address");
            return;
        }

        // Check for duplicates
        if (formData.recipientsFlow.find((r) => r.email === email)) {
            setError("This email is already in the recipients list");
            return;
        }

        setFormData((prev) => ({
            ...prev,
            recipientsFlow: [
                ...prev.recipientsFlow,
                { email, order: prev.recipientsFlow.length },
            ],
        }));

        setNewRecipient("");
        setError("");
    };

    const removeRecipient = (index) => {
        setFormData((prev) => ({
            ...prev,
            recipientsFlow: prev.recipientsFlow
                .filter((_, i) => i !== index)
                .map((r, i) => ({ ...r, order: i })),
        }));
    };

    const moveRecipient = (index, direction) => {
        const newRecipients = [...formData.recipientsFlow];
        const newIndex = direction === "up" ? index - 1 : index + 1;

        if (newIndex < 0 || newIndex >= newRecipients.length) return;

        [newRecipients[index], newRecipients[newIndex]] = [
            newRecipients[newIndex],
            newRecipients[index],
        ];

        // Update order
        newRecipients.forEach((r, i) => (r.order = i));

        setFormData((prev) => ({ ...prev, recipientsFlow: newRecipients }));
    };

    const calculateFileHash = async (file) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();

            reader.onload = (e) => {
                const wordArray = CryptoJS.lib.WordArray.create(
                    e.target.result
                );
                const hash = CryptoJS.SHA256(wordArray).toString();
                resolve(hash);
            };

            reader.onerror = reject;
            reader.readAsArrayBuffer(file);
        });
    };

    const signDocument = async (documentHash) => {
        try {
            if (!wallets || wallets.length === 0) {
                throw new Error(
                    "No wallet found. Please ensure your wallet is connected."
                );
            }

            const embeddedWallet = wallets.find(
                (wallet) => wallet.walletClientType === "privy"
            );

            if (!embeddedWallet) {
                throw new Error("Embedded wallet not found");
            }

            // Prepare data to sign
            const dataToSign = JSON.stringify({
                documentHash,
                firstSigner: true,
            });

            // Get Ethereum provider and signer
            const ethereumProvider = await embeddedWallet.getEthereumProvider();
            const provider = new ethers.BrowserProvider(ethereumProvider);
            const signer = await provider.getSigner();

            // Get wallet address
            const walletAddress = await signer.getAddress();

            // Sign the message
            const signature = await signer.signMessage(dataToSign);

            return { signature, walletAddress };
        } catch (err) {
            console.error("Error signing document:", err);
            throw err;
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setSuccess("");

        // Validation
        if (!formData.eventPermissionId) {
            setError("Please select an approved event");
            return;
        }

        if (!formData.title.trim()) {
            setError("Please enter invoice title");
            return;
        }

        if (!formData.document) {
            setError("Please upload a PDF document");
            return;
        }

        if (formData.recipientsFlow.length === 0) {
            setError("Please add at least one recipient to the approval flow");
            return;
        }

        try {
            setLoading(true);
            console.log("Starting invoice submission...");

            // Calculate document hash
            console.log("Calculating document hash...");
            const documentHash = await calculateFileHash(formData.document);
            console.log("Document hash:", documentHash);

            // Sign the document
            console.log("Requesting signature...");
            const { signature, walletAddress } = await signDocument(
                documentHash
            );
            console.log("Signature received:", signature);
            console.log("Wallet address:", walletAddress);

            // Prepare form data
            const uploadData = new FormData();
            uploadData.append("eventPermissionId", formData.eventPermissionId);
            uploadData.append("title", formData.title);
            uploadData.append("document", formData.document);
            uploadData.append(
                "recipientsFlow",
                JSON.stringify(formData.recipientsFlow)
            );
            uploadData.append("initialSignature", signature);
            uploadData.append("walletAddress", walletAddress);
            uploadData.append("documentHash", documentHash);

            console.log("Submitting to backend...");
            // Submit to backend
            const response = await api.invoice.submitInvoice(uploadData);
            console.log("Backend response:", response);

            // Backend returns {success, message, data}
            // Check if submission was successful (either response.data has invoice data or response has success flag)
            if (
                response.data &&
                (response.data._id || response.data.eventPermissionId)
            ) {
                console.log("Invoice submitted successfully!");
                setSuccess("Invoice submitted successfully!");
                setTimeout(() => {
                    navigate("/council/dashboard");
                }, 2000);
            } else {
                setError("Unexpected response from server");
            }
        } catch (err) {
            console.error("Error submitting invoice:", err);
            console.error("Error details:", err.response?.data);
            setError(
                err.response?.data?.message ||
                    err.message ||
                    "Failed to submit invoice. Please try again."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box
            sx={{
                minHeight: "100vh",
                backgroundColor: "#f5f5f5",
                py: 4,
            }}
        >
            <Paper
                sx={{
                    maxWidth: 800,
                    mx: "auto",
                    p: 4,
                }}
            >
                <Box sx={{ mb: 3, display: "flex", alignItems: "center" }}>
                    <IconButton onClick={() => navigate(-1)} sx={{ mr: 2 }}>
                        <ArrowBackIcon />
                    </IconButton>
                    <Typography variant="h5" component="h1">
                        Submit Invoice
                    </Typography>
                </Box>

                {error && (
                    <Alert
                        severity="error"
                        sx={{ mb: 3 }}
                        onClose={() => setError("")}
                    >
                        {error}
                    </Alert>
                )}

                {success && (
                    <Alert severity="success" sx={{ mb: 3 }}>
                        {success}
                    </Alert>
                )}

                <form onSubmit={handleSubmit}>
                    {/* Event Selection */}
                    <FormControl fullWidth sx={{ mb: 3 }}>
                        <InputLabel>Select Approved Event</InputLabel>
                        <Select
                            name="eventPermissionId"
                            value={formData.eventPermissionId}
                            onChange={handleInputChange}
                            label="Select Approved Event"
                            disabled={loadingEvents}
                        >
                            {approvedEvents.length === 0 && !loadingEvents && (
                                <MenuItem disabled value="">
                                    No approved events available
                                </MenuItem>
                            )}
                            {approvedEvents.map((event) => (
                                <MenuItem key={event._id} value={event._id}>
                                    {event.title} -{" "}
                                    {new Date(
                                        event.createdAt
                                    ).toLocaleDateString()}
                                </MenuItem>
                            ))}
                        </Select>
                        {loadingEvents && (
                            <Typography
                                variant="caption"
                                color="text.secondary"
                                sx={{ mt: 1 }}
                            >
                                Loading approved events...
                            </Typography>
                        )}
                        {!loadingEvents && approvedEvents.length === 0 && (
                            <Typography
                                variant="caption"
                                color="error"
                                sx={{ mt: 1 }}
                            >
                                No approved events found. Please submit and get
                                approval for an event first.
                            </Typography>
                        )}
                    </FormControl>

                    {/* Invoice Title */}
                    <TextField
                        fullWidth
                        label="Invoice Title"
                        name="title"
                        value={formData.title}
                        onChange={handleInputChange}
                        required
                        sx={{ mb: 3 }}
                        placeholder="e.g., Tech Fest 2024 Invoice"
                    />

                    {/* Document Upload */}
                    <Box sx={{ mb: 3 }}>
                        <Typography variant="subtitle1" gutterBottom>
                            Upload Invoice Document (PDF) *
                        </Typography>
                        <Button
                            variant="outlined"
                            component="label"
                            startIcon={<UploadIcon />}
                            fullWidth
                        >
                            {formData.document
                                ? formData.document.name
                                : "Choose PDF File"}
                            <input
                                type="file"
                                hidden
                                accept="application/pdf"
                                onChange={handleFileChange}
                            />
                        </Button>
                        {formData.document && (
                            <Chip
                                label={`${(
                                    formData.document.size /
                                    (1024 * 1024)
                                ).toFixed(2)} MB`}
                                size="small"
                                sx={{ mt: 1 }}
                            />
                        )}
                    </Box>

                    {/* Recipients Flow */}
                    <Box sx={{ mb: 3 }}>
                        <Typography variant="subtitle1" gutterBottom>
                            Approval Flow (Signature Chain) *
                        </Typography>
                        <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{ mb: 2 }}
                        >
                            Add email addresses in the order they should sign.
                            Each person can only sign after the previous person
                            has signed.
                        </Typography>

                        <Box sx={{ display: "flex", gap: 1, mb: 2 }}>
                            <TextField
                                fullWidth
                                size="small"
                                label="Recipient Email"
                                value={newRecipient}
                                onChange={(e) =>
                                    setNewRecipient(e.target.value)
                                }
                                onKeyPress={(e) => {
                                    if (e.key === "Enter") {
                                        e.preventDefault();
                                        addRecipient();
                                    }
                                }}
                                placeholder="faculty@lnmiit.ac.in"
                            />
                            <Button
                                variant="contained"
                                onClick={addRecipient}
                                startIcon={<AddIcon />}
                            >
                                Add
                            </Button>
                        </Box>

                        {formData.recipientsFlow.length > 0 && (
                            <List sx={{ bgcolor: "background.paper" }}>
                                {formData.recipientsFlow.map(
                                    (recipient, index) => (
                                        <ListItem
                                            key={index}
                                            sx={{
                                                border: "1px solid #e0e0e0",
                                                mb: 1,
                                                borderRadius: 1,
                                            }}
                                        >
                                            <Chip
                                                label={index + 1}
                                                size="small"
                                                sx={{ mr: 2 }}
                                            />
                                            <ListItemText
                                                primary={recipient.email}
                                            />
                                            <ListItemSecondaryAction>
                                                <IconButton
                                                    edge="end"
                                                    onClick={() =>
                                                        moveRecipient(
                                                            index,
                                                            "up"
                                                        )
                                                    }
                                                    disabled={index === 0}
                                                    size="small"
                                                >
                                                    <ArrowUpIcon />
                                                </IconButton>
                                                <IconButton
                                                    edge="end"
                                                    onClick={() =>
                                                        moveRecipient(
                                                            index,
                                                            "down"
                                                        )
                                                    }
                                                    disabled={
                                                        index ===
                                                        formData.recipientsFlow
                                                            .length -
                                                            1
                                                    }
                                                    size="small"
                                                >
                                                    <ArrowDownIcon />
                                                </IconButton>
                                                <IconButton
                                                    edge="end"
                                                    onClick={() =>
                                                        removeRecipient(index)
                                                    }
                                                    size="small"
                                                >
                                                    <DeleteIcon />
                                                </IconButton>
                                            </ListItemSecondaryAction>
                                        </ListItem>
                                    )
                                )}
                            </List>
                        )}
                    </Box>

                    {/* Submit Button */}
                    <Box sx={{ display: "flex", gap: 2, mt: 4 }}>
                        <Button
                            variant="outlined"
                            onClick={() => navigate(-1)}
                            fullWidth
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            variant="contained"
                            fullWidth
                            disabled={loading}
                            startIcon={
                                loading ? <CircularProgress size={20} /> : null
                            }
                        >
                            {loading
                                ? "Submitting..."
                                : "Sign & Submit Invoice"}
                        </Button>
                    </Box>
                </form>
            </Paper>
        </Box>
    );
};

export default InvoiceSubmissionForm;
