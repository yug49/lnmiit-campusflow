import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
    Box,
    Container,
    Typography,
    Button,
    Paper,
    Alert,
    CircularProgress,
    Chip,
} from "@mui/material";
import {
    School as StudentIcon,
    Person as FacultyIcon,
    AdminPanelSettings as AdminIcon,
    Groups as CouncilIcon,
} from "@mui/icons-material";
import { usePrivy } from "@privy-io/react-auth";
import WaveBackground from "./WaveBackground";
import LnmiitLogo from "./common/LnmiitLogo";
import api from "../utils/apiClient";

const Login = () => {
    const navigate = useNavigate();
    const {
        login,
        ready,
        authenticated,
        user,
        getAccessToken,
        logout: privyLogout,
    } = usePrivy();
    const [loading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [successMessage, setSuccessMessage] = useState("");
    const isAuthenticatingRef = useRef(false);
    const processedUserIdRef = useRef(null);
    const hasRedirectedRef = useRef(false);

    // Clear any stale data on component mount
    useEffect(() => {
        console.log("Login component mounted");
        console.log("Privy authenticated:", authenticated);
        console.log(
            "LocalStorage privyToken:",
            localStorage.getItem("privyToken")
        );
        console.log("LocalStorage userRole:", localStorage.getItem("userRole"));

        // If not authenticated by Privy but localStorage has data, clear it
        if (!authenticated) {
            const hasLocalData =
                localStorage.getItem("privyToken") ||
                localStorage.getItem("userRole");
            if (hasLocalData) {
                console.log("Clearing stale localStorage data");
                localStorage.removeItem("privyToken");
                localStorage.removeItem("userRole");
                localStorage.removeItem("userData");
            }
        }
    }, [authenticated]);

    // Handle authentication after Privy login
    useEffect(() => {
        console.log(
            "Auth effect running - ready:",
            ready,
            "authenticated:",
            authenticated,
            "user:",
            user?.id,
            "hasRedirected:",
            hasRedirectedRef.current
        );

        // CRITICAL: If we've already redirected, don't do anything
        if (hasRedirectedRef.current) {
            console.log("Already redirected, skipping");
            return;
        }

        // If not ready yet, wait
        if (!ready) {
            console.log("Privy not ready yet");
            return;
        }

        // If not authenticated, nothing to do
        if (!authenticated || !user) {
            console.log("Not authenticated, showing login button");
            return;
        }

        console.log("User is authenticated with Privy, checking session...");

        // Check if user already has valid session data - if so, redirect immediately WITHOUT API CALL
        const existingRole = localStorage.getItem("userRole");
        const existingToken = localStorage.getItem("privyToken");

        console.log(
            "Checking existing session - role:",
            existingRole,
            "token:",
            existingToken ? "exists" : "none"
        );

        if (existingRole && existingToken) {
            // User is already authenticated, just redirect
            console.log(
                "✅ User already has valid session, redirecting to",
                existingRole,
                "dashboard WITHOUT API call"
            );
            hasRedirectedRef.current = true; // Mark as redirected

            // Navigate immediately
            const path = `/${existingRole}/dashboard`;
            console.log("Navigating to:", path);
            navigate(path, { replace: true });
            return;
        }

        // Check if we've already processed this user
        const userId = user.id;
        console.log(
            "Checking if user",
            userId,
            "already processed:",
            processedUserIdRef.current
        );

        if (isAuthenticatingRef.current) {
            console.log("❌ Already authenticating, skipping");
            return;
        }

        if (processedUserIdRef.current === userId) {
            console.log("❌ User already processed, skipping");
            return;
        }

        console.log("✅ New authentication needed for user", userId);

        const handleAuthenticatedUser = async () => {
            console.log("🚀 Starting authentication for user", userId);
            // Set flag to prevent re-execution
            isAuthenticatingRef.current = true;
            processedUserIdRef.current = userId;
            hasRedirectedRef.current = true; // Mark as processing

            try {
                setLoading(true);
                setErrorMessage("");
                setSuccessMessage("");

                // Get Privy access token
                const accessToken = await getAccessToken();

                // Get user's Google email
                const googleAccount = user.google;
                const email = googleAccount?.email || user.email?.address;

                if (!email) {
                    setErrorMessage(
                        "No email found. Please login with a Google account."
                    );
                    setSuccessMessage("");
                    setLoading(false);
                    isAuthenticatingRef.current = false;
                    return;
                }

                // Show loading message
                setSuccessMessage("Checking your authorization...");

                // Check if user exists in database and get their role
                const response = await api.auth.getUserByEmail(
                    email,
                    accessToken
                );

                if (!response.success || !response.user) {
                    setSuccessMessage(""); // Clear success message
                    setErrorMessage(
                        "Your email is not authorized. Please contact an administrator to get access."
                    );
                    setLoading(false);
                    isAuthenticatingRef.current = false;
                    return;
                }

                // Store Privy token and user data
                localStorage.setItem("privyToken", accessToken);
                localStorage.setItem("userRole", response.user.role);
                localStorage.setItem("userData", JSON.stringify(response.user));

                setSuccessMessage(
                    `Welcome! Redirecting to ${response.user.role} dashboard...`
                );

                // Navigate to the appropriate dashboard based on role
                setTimeout(() => {
                    switch (response.user.role) {
                        case "student":
                            navigate("/student/dashboard");
                            break;
                        case "faculty":
                            navigate("/faculty/dashboard");
                            break;
                        case "admin":
                            navigate("/admin/dashboard");
                            break;
                        case "council":
                            navigate("/council/dashboard");
                            break;
                        default:
                            setErrorMessage(
                                "Invalid user role. Please contact admin."
                            );
                            isAuthenticatingRef.current = false;
                    }
                }, 1000);
            } catch (error) {
                console.error("Authentication error:", error);
                setSuccessMessage(""); // Clear success message
                setErrorMessage(
                    error.message ||
                        "Authentication failed. You may not be authorized to access this system."
                );
                setLoading(false);
                isAuthenticatingRef.current = false;
            }
        };

        handleAuthenticatedUser();

        // No cleanup needed - we want the flags to persist
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [ready, authenticated]);

    const handleLogin = async () => {
        try {
            setLoading(true);
            setErrorMessage("");

            // Open Privy login modal with Google OAuth
            await login();
        } catch (error) {
            console.error("Login error:", error);
            setErrorMessage("Login failed. Please try again.");
            setLoading(false);
        }
    };

    const handleClearCache = async () => {
        try {
            console.log("Clearing all cache and logging out...");

            // Clear localStorage
            localStorage.clear();

            // Logout from Privy
            await privyLogout();

            // Reset refs
            isAuthenticatingRef.current = false;
            processedUserIdRef.current = null;
            hasRedirectedRef.current = false;

            setSuccessMessage("Cache cleared! Please refresh the page.");

            // Refresh page after 1 second
            setTimeout(() => {
                window.location.reload();
            }, 1000);
        } catch (error) {
            console.error("Clear cache error:", error);
            setErrorMessage(
                "Failed to clear cache. Try clearing browser data manually."
            );
        }
    };

    const roles = [
        { name: "Student", icon: <StudentIcon />, color: "#4CAF50" },
        { name: "Faculty", icon: <FacultyIcon />, color: "#2196F3" },
        { name: "Council", icon: <CouncilIcon />, color: "#FF9800" },
        { name: "Admin", icon: <AdminIcon />, color: "#F44336" },
    ];

    return (
        <Box
            sx={{
                minHeight: "100vh",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                position: "relative",
                overflow: "hidden",
            }}
        >
            <WaveBackground />
            <Container maxWidth="md">
                {/* LNMIIT Logo */}
                <Box
                    sx={{
                        display: "flex",
                        justifyContent: "center",
                        mb: 4,
                    }}
                >
                    <LnmiitLogo width={250} height={80} />
                </Box>

                <Paper
                    elevation={0}
                    sx={{
                        p: 5,
                        background: "rgba(255,255,255,0.1)",
                        backdropFilter: "blur(10px)",
                        border: "1px solid rgba(255,255,255,0.2)",
                        borderRadius: 3,
                    }}
                >
                    <Typography
                        variant="h3"
                        component="h1"
                        sx={{
                            color: "#fff",
                            fontWeight: 700,
                            textAlign: "center",
                            mb: 2,
                        }}
                    >
                        Welcome to CampusFlow
                    </Typography>

                    <Typography
                        variant="h6"
                        sx={{
                            color: "rgba(255,255,255,0.9)",
                            textAlign: "center",
                            mb: 4,
                            fontWeight: 400,
                        }}
                    >
                        Unified Portal for All Campus Operations
                    </Typography>

                    {/* Role Indicators */}
                    <Box
                        sx={{
                            display: "flex",
                            justifyContent: "center",
                            gap: 2,
                            mb: 4,
                            flexWrap: "wrap",
                        }}
                    >
                        {roles.map((role) => (
                            <Chip
                                key={role.name}
                                icon={role.icon}
                                label={role.name}
                                sx={{
                                    backgroundColor: role.color,
                                    color: "#fff",
                                    fontWeight: 600,
                                    px: 1,
                                    "& .MuiChip-icon": {
                                        color: "#fff",
                                    },
                                }}
                            />
                        ))}
                    </Box>

                    {errorMessage && (
                        <Alert severity="error" sx={{ mb: 3 }}>
                            {errorMessage}
                        </Alert>
                    )}

                    {successMessage && (
                        <Alert severity="success" sx={{ mb: 3 }}>
                            {successMessage}
                        </Alert>
                    )}

                    {!ready ? (
                        <Box
                            sx={{
                                display: "flex",
                                justifyContent: "center",
                                p: 4,
                            }}
                        >
                            <CircularProgress sx={{ color: "#fff" }} />
                        </Box>
                    ) : (
                        <Box sx={{ textAlign: "center" }}>
                            <Typography
                                variant="body1"
                                sx={{
                                    color: "rgba(255,255,255,0.9)",
                                    mb: 3,
                                    fontSize: "1.1rem",
                                }}
                            >
                                Sign in with your authorized Google account.
                                <br />
                                <strong>
                                    Your role will be automatically detected.
                                </strong>
                            </Typography>
                            <Button
                                fullWidth
                                variant="contained"
                                onClick={handleLogin}
                                disabled={loading || authenticated}
                                size="large"
                                sx={{
                                    py: 2,
                                    background:
                                        "linear-gradient(135deg, rgba(0,120,212,0.7) 0%, rgba(0,100,180,0.8) 100%)",
                                    backdropFilter: "blur(10px)",
                                    border: "1px solid rgba(255,255,255,0.3)",
                                    borderRadius: "30px",
                                    boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
                                    transition: "all 0.3s ease",
                                    color: "white",
                                    fontWeight: 600,
                                    fontSize: "1.1rem",
                                    letterSpacing: "0.5px",
                                    "&:hover": {
                                        background:
                                            "linear-gradient(135deg, rgba(0,120,212,0.8) 0%, rgba(0,100,180,0.9) 100%)",
                                        transform: "translateY(-2px)",
                                        boxShadow: "0 6px 25px rgba(0,0,0,0.2)",
                                    },
                                    "&:active": {
                                        transform: "translateY(1px)",
                                        boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
                                    },
                                }}
                            >
                                {loading ? (
                                    <CircularProgress
                                        size={28}
                                        color="inherit"
                                    />
                                ) : authenticated ? (
                                    "Verifying your role..."
                                ) : (
                                    "Sign in with Google"
                                )}
                            </Button>
                            <Typography
                                variant="caption"
                                sx={{
                                    color: "rgba(255,255,255,0.6)",
                                    mt: 3,
                                    display: "block",
                                }}
                            >
                                Only authorized users can access this system.
                                <br />
                                Contact an administrator if you need access.
                            </Typography>

                            {authenticated && (
                                <Button
                                    onClick={handleClearCache}
                                    size="small"
                                    sx={{
                                        mt: 2,
                                        color: "rgba(255,255,255,0.5)",
                                        "&:hover": {
                                            color: "rgba(255,255,255,0.8)",
                                        },
                                    }}
                                >
                                    Having issues? Clear cache & logout
                                </Button>
                            )}
                        </Box>
                    )}
                </Paper>
            </Container>
        </Box>
    );
};

export default Login;
