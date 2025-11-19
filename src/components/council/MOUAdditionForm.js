import React, { useState } from "react";
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

const MOUAdditionForm = () => {
    const navigate = useNavigate();
    const { user } = usePrivy();
    const { wallets } = useWallets();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    // Debug: Log wallets when component mounts
    React.useEffect(() => {
        console.log("User:", user);
        console.log("Wallets available:", wallets);
        if (wallets && wallets.length > 0) {
            wallets.forEach((wallet, index) => {
                console.log(`Wallet ${index}:`, {
                    address: wallet.address,
                    walletClientType: wallet.walletClientType,
                    chainId: wallet.chainId,
                });
            });
        }
    }, [user, wallets]);

    const [formData, setFormData] = useState({
        title: "",
        document: null,
        recipientsFlow: [],
    });

    const [newRecipient, setNewRecipient] = useState("");

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
            console.log("=== Starting Document Signing ===");
            console.log("Available wallets:", wallets);
            console.log("Wallet count:", wallets?.length || 0);

            // Get Privy wallets
            if (!wallets || wallets.length === 0) {
                throw new Error(
                    "No wallet found. Please ensure you're logged in with Privy."
                );
            }

            if (wallets.length > 0) {
                wallets.forEach((wallet, index) => {
                    console.log(`Wallet ${index}:`, {
                        address: wallet.address,
                        walletClientType: wallet.walletClientType,
                        chainId: wallet.chainId,
                    });
                });
            }

            // Find the embedded wallet (Privy creates one automatically)
            const embeddedWallet = wallets.find(
                (wallet) => wallet.walletClientType === "privy"
            );

            if (!embeddedWallet) {
                // If no embedded wallet, use the first available wallet
                console.error(
                    "No embedded wallet found. Available wallet types:",
                    wallets.map((w) => w.walletClientType).join(", ")
                );
                throw new Error(
                    "No embedded wallet found. Available wallets: " +
                        wallets.map((w) => w.walletClientType).join(", ")
                );
            }

            const walletAddress = embeddedWallet.address;
            console.log("✅ Using embedded wallet:", walletAddress);

            // Create message to sign (document hash)
            const message = `MoU Document Signature\n\nDocument Hash: ${documentHash}\n\nTitle: ${formData.title}\n\nBy signing this message, I approve and submit this MoU document.`;

            console.log("Message to sign:", message);

            // Convert message to hex for signing
            const encoder = new TextEncoder();
            const messageBytes = encoder.encode(message);
            const hexMessage =
                "0x" +
                Array.from(messageBytes)
                    .map((b) => b.toString(16).padStart(2, "0"))
                    .join("");

            console.log("Hex message:", hexMessage);

            // Get the wallet provider
            const provider = await embeddedWallet.getEthereumProvider();
            console.log("Provider obtained:", !!provider);

            // Sign the message using personal_sign
            console.log("Requesting signature...");
            const signature = await provider.request({
                method: "personal_sign",
                params: [hexMessage, walletAddress],
            });

            console.log("✅ Signature generated successfully:", signature);

            return {
                signature,
                walletAddress,
                message,
            };
        } catch (err) {
            console.error("Signing error:", err);
            throw new Error(`Failed to sign document: ${err.message}`);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            setLoading(true);
            setError("");
            setSuccess("");

            // Validation
            if (!formData.title.trim()) {
                setError("Please enter a MoU title");
                setLoading(false);
                return;
            }

            if (!formData.document) {
                setError("Please upload a PDF document");
                setLoading(false);
                return;
            }

            if (formData.recipientsFlow.length === 0) {
                setError("Please add at least one recipient to the flow");
                setLoading(false);
                return;
            }

            // Calculate document hash
            setSuccess("Calculating document hash...");
            const documentHash = await calculateFileHash(formData.document);

            // Sign the document
            setSuccess("Signing document with your embedded wallet...");
            const { signature, walletAddress } = await signDocument(
                documentHash
            );

            // Prepare form data for upload
            const uploadData = new FormData();
            uploadData.append("title", formData.title);
            uploadData.append("document", formData.document);
            uploadData.append(
                "recipientsFlow",
                JSON.stringify(formData.recipientsFlow)
            );
            uploadData.append("initialSignature", signature);
            uploadData.append("walletAddress", walletAddress);
            uploadData.append("documentHash", documentHash);

            // Submit MoU
            setSuccess("Uploading MoU...");
            await api.mou.submitMoU(uploadData);

            setSuccess("MoU submitted successfully! Redirecting...");

            // Reset form
            setFormData({
                title: "",
                document: null,
                recipientsFlow: [],
            });

            // Clear file input
            const fileInput = document.getElementById("document-upload");
            if (fileInput) fileInput.value = "";

            // Redirect to MoU status page after 2 seconds
            setTimeout(() => {
                navigate("/council/mou-status");
            }, 2000);
        } catch (err) {
            console.error("Submit error:", err);
            setError(err.message || "Failed to submit MoU");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box sx={{ p: 3 }}>
            <IconButton
                onClick={() => navigate("/council/dashboard")}
                sx={{ mb: 2 }}
            >
                <ArrowBackIcon />
            </IconButton>

            <Paper sx={{ p: 3 }}>
                <Typography variant="h5" component="h2" gutterBottom>
                    Submit New MoU
                </Typography>
                <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mb: 3 }}
                >
                    Upload and submit a MoU for approval. The document will be
                    digitally signed using your Privy embedded wallet.
                </Typography>

                {error && (
                    <Alert
                        severity="error"
                        sx={{ mb: 2 }}
                        onClose={() => setError("")}
                    >
                        {error}
                    </Alert>
                )}

                {success && (
                    <Alert severity="success" sx={{ mb: 2 }}>
                        {success}
                    </Alert>
                )}

                <form onSubmit={handleSubmit}>
                    {/* MoU Title */}
                    <TextField
                        fullWidth
                        label="MoU Title"
                        name="title"
                        value={formData.title}
                        onChange={handleInputChange}
                        required
                        sx={{ mb: 3 }}
                        placeholder="Enter a descriptive title for the MoU"
                        disabled={loading}
                    />

                    {/* Document Upload */}
                    <Box sx={{ mb: 3 }}>
                        <Typography variant="subtitle2" gutterBottom>
                            Upload Document (PDF only)
                        </Typography>
                        <Button
                            variant="outlined"
                            component="label"
                            startIcon={<UploadIcon />}
                            sx={{ mb: 1 }}
                            disabled={loading}
                        >
                            Choose PDF File
                            <input
                                id="document-upload"
                                type="file"
                                hidden
                                accept="application/pdf"
                                onChange={handleFileChange}
                            />
                        </Button>
                        {formData.document && (
                            <Chip
                                label={formData.document.name}
                                onDelete={() =>
                                    setFormData((prev) => ({
                                        ...prev,
                                        document: null,
                                    }))
                                }
                                color="primary"
                                sx={{ ml: 2 }}
                            />
                        )}
                    </Box>

                    {/* Recipients Flow */}
                    <Box sx={{ mb: 3 }}>
                        <Typography variant="subtitle2" gutterBottom>
                            Recipients Flow (In Order)
                        </Typography>
                        <Typography
                            variant="caption"
                            color="text.secondary"
                            display="block"
                            sx={{ mb: 2 }}
                        >
                            Add recipients in the order they should approve and
                            sign the MoU. Each person must sign before it moves
                            to the next.
                        </Typography>

                        <Box sx={{ display: "flex", gap: 1, mb: 2 }}>
                            <TextField
                                fullWidth
                                size="small"
                                placeholder="Enter email address"
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
                                disabled={loading}
                            />
                            <Button
                                variant="contained"
                                onClick={addRecipient}
                                startIcon={<AddIcon />}
                                disabled={loading}
                            >
                                Add
                            </Button>
                        </Box>

                        {formData.recipientsFlow.length > 0 && (
                            <List>
                                {formData.recipientsFlow.map(
                                    (recipient, index) => (
                                        <ListItem
                                            key={index}
                                            sx={{
                                                border: "1px solid",
                                                borderColor: "divider",
                                                borderRadius: 1,
                                                mb: 1,
                                            }}
                                        >
                                            <Chip
                                                label={`#${index + 1}`}
                                                size="small"
                                                color="primary"
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
                                                    disabled={
                                                        index === 0 || loading
                                                    }
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
                                                            formData
                                                                .recipientsFlow
                                                                .length -
                                                                1 || loading
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
                                                    color="error"
                                                    size="small"
                                                    disabled={loading}
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
                    <Button
                        type="submit"
                        variant="contained"
                        size="large"
                        disabled={loading}
                        fullWidth
                    >
                        {loading ? (
                            <>
                                <CircularProgress
                                    size={24}
                                    sx={{ mr: 1 }}
                                    color="inherit"
                                />
                                {success || "Submitting..."}
                            </>
                        ) : (
                            "Sign & Submit MoU"
                        )}
                    </Button>
                </form>
            </Paper>
        </Box>
    );
};

export default MOUAdditionForm;
