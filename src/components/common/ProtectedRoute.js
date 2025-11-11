import React from "react";
import { Navigate } from "react-router-dom";
import { usePrivy } from "@privy-io/react-auth";
import { useUser } from "../../context/UserContext";
import { CircularProgress, Box } from "@mui/material";

/**
 * ProtectedRoute component that checks if user is authenticated via Privy
 * and redirects to login page if not
 */
const ProtectedRoute = ({ children }) => {
    const { ready, authenticated } = usePrivy();
    const { isLoading } = useUser();

    // Check if user has Privy token and role
    const hasPrivyToken = localStorage.getItem("privyToken");
    const hasUserRole = localStorage.getItem("userRole");

    // Show loading state while Privy or context is initializing
    if (!ready || isLoading) {
        return (
            <Box
                sx={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    height: "100vh",
                    background:
                        "linear-gradient(135deg, #beb19a 0%, #9a8e7c 50%, #766d5a 100%)",
                }}
            >
                <CircularProgress sx={{ color: "#fff" }} />
            </Box>
        );
    }

    // Redirect to login if not authenticated with Privy or missing session data
    if (!authenticated || !hasPrivyToken || !hasUserRole) {
        console.log(
            "ProtectedRoute: Not authenticated or missing session data, redirecting to /"
        );
        return <Navigate to="/" replace />;
    }

    // If authenticated, render the protected content
    return children;
};

export default ProtectedRoute;
