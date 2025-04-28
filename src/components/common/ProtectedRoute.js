import React from "react";
import { Navigate } from "react-router-dom";
import { useUser } from "../../context/UserContext";

/**
 * ProtectedRoute component that checks if user is authenticated
 * and redirects to role selection page if not
 */
const ProtectedRoute = ({ children }) => {
  const { isLoading } = useUser();

  // Check if user is authenticated by verifying token existence
  const isAuthenticated = localStorage.getItem("authToken");

  // Show loading state if context is still loading
  if (isLoading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        Loading...
      </div>
    );
  }

  // Redirect to role selection if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  // If authenticated, render the protected content
  return children;
};

export default ProtectedRoute;
