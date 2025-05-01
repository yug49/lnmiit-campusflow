import axios from "axios";
import { notifyProfilePhotoUpdated } from "../context/UserContext";

const getBaseUrl = () => {
  // In production on Vercel, the API and frontend are on the same domain
  if (process.env.NODE_ENV === "production") {
    return ""; // Empty string means same origin, avoiding CORS issues
  }
  // In development, we still use the localhost URLs
  return process.env.REACT_APP_API_BASE_URL || "http://localhost:5001";
};

const API_BASE_URL = `${getBaseUrl()}/api`;

// Create axios instance
const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add token to requests if available
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("authToken");
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Handle response
axiosInstance.interceptors.response.use(
  (response) => response.data,
  (error) => {
    // Handle token expiration
    if (error.response?.status === 401) {
      localStorage.removeItem("authToken");
      localStorage.removeItem("userRole");
      localStorage.removeItem("userData");
      window.location.href = "/login";
    }
    return Promise.reject(error.response?.data || error);
  }
);

// Helper to get the appropriate URL for uploads
const getUploadUrl = (path) => {
  if (!path) return "";
  if (path.startsWith("http")) return path;

  if (process.env.NODE_ENV === "production") {
    // In production, use the same origin for uploads
    return path.startsWith("/") ? path : `/${path}`;
  } else {
    // In development, prepend the base URL
    return `${getBaseUrl()}${path.startsWith("/") ? path : `/${path}`}`;
  }
};

/**
 * Real API endpoints
 */
const api = {
  // Auth endpoints
  auth: {
    login: async (credentials) => {
      try {
        const response = await axiosInstance.post("/auth/login", credentials);
        localStorage.setItem("authToken", response.token);
        localStorage.setItem("userRole", response.user.role);
        localStorage.setItem("userData", JSON.stringify(response.user));
        return response;
      } catch (error) {
        console.error("Login error:", error);
        throw error;
      }
    },

    register: async (userData) => {
      try {
        const response = await axiosInstance.post("/auth/register", userData);
        localStorage.setItem("authToken", response.token);
        localStorage.setItem("userRole", response.user.role);
        localStorage.setItem("userData", JSON.stringify(response.user));
        return response;
      } catch (error) {
        console.error("Register error:", error);
        throw error;
      }
    },

    logout: async () => {
      // Clear local storage regardless of server response
      localStorage.removeItem("authToken");
      localStorage.removeItem("userRole");
      localStorage.removeItem("userData");
      try {
        await axiosInstance.post("/auth/logout");
      } catch (error) {
        console.error("Logout error:", error);
      }
    },

    verifyToken: async () => {
      try {
        return await axiosInstance.get("/auth/verify");
      } catch (error) {
        console.error("Token verification error:", error);
        throw error;
      }
    },
  },

  // User endpoints
  users: {
    getProfile: async () => {
      try {
        return await axiosInstance.get("/users/profile");
      } catch (error) {
        console.error("Get profile error:", error);
        throw error;
      }
    },

    updateProfile: async (userData) => {
      try {
        return await axiosInstance.put("/users/profile", userData);
      } catch (error) {
        console.error("Update profile error:", error);
        throw error;
      }
    },

    uploadProfilePhoto: async (file) => {
      try {
        const formData = new FormData();
        formData.append("profilePhoto", file);

        const response = await axiosInstance.post(
          "/users/profile-photo",
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );

        // Update user data in localStorage with new profile photo
        const userData = JSON.parse(localStorage.getItem("userData") || "{}");
        const currentRole = localStorage.getItem("userRole") || userData.role;

        // Ensure URL is properly formatted
        if (response.data.profilePhoto && response.data.profilePhoto.url) {
          const photoUrl = response.data.profilePhoto.url;
          userData.profilePhoto = {
            ...response.data.profilePhoto,
            fullUrl: getUploadUrl(photoUrl),
          };

          localStorage.setItem("userData", JSON.stringify(userData));

          // Notify all components that the profile photo has been updated
          // Include the role prefix to ensure it's only used in the correct dashboard
          notifyProfilePhotoUpdated(
            userData.profilePhoto.fullUrl,
            response.data.profilePhoto.rolePrefix || currentRole
          );
        }

        return response;
      } catch (error) {
        console.error("Upload profile photo error:", error);
        throw error;
      }
    },

    uploadDigitalSignature: async (file) => {
      try {
        const formData = new FormData();
        formData.append("signature", file);

        const response = await axiosInstance.post(
          "/users/digital-signature",
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );

        // Update user data in localStorage with new digital signature
        const userData = JSON.parse(localStorage.getItem("userData") || "{}");

        if (
          response.data.digitalSignature &&
          response.data.digitalSignature.url
        ) {
          const signatureUrl = response.data.digitalSignature.url;
          userData.digitalSignature = {
            ...response.data.digitalSignature,
            fullUrl: getUploadUrl(signatureUrl),
          };
          localStorage.setItem("userData", JSON.stringify(userData));
        }

        return response;
      } catch (error) {
        console.error("Upload digital signature error:", error);
        throw error;
      }
    },

    getAllStudents: async () => {
      try {
        return await axiosInstance.get("/users/students");
      } catch (error) {
        console.error("Get all students error:", error);
        throw error;
      }
    },

    searchStudents: async (query) => {
      try {
        return await axiosInstance.get(
          `/users/search?q=${encodeURIComponent(query)}&role=student`
        );
      } catch (error) {
        console.error("Search students error:", error);
        throw error;
      }
    },
  },

  // No Dues endpoints
  noDues: {
    submitRequest: async (requestData) => {
      try {
        return await axiosInstance.post("/nodues/submit", requestData);
      } catch (error) {
        console.error("Submit no dues request error:", error);
        throw error;
      }
    },
    getPendingRequests: async () => {
      try {
        return await axiosInstance.get("/nodues/pending");
      } catch (error) {
        console.error("Get pending requests error:", error);
        throw error;
      }
    },
    getApprovedRequests: async () => {
      try {
        return await axiosInstance.get("/nodues/approved");
      } catch (error) {
        console.error("Get approved requests error:", error);
        throw error;
      }
    },
    getStudentRequest: async (id) => {
      try {
        return await axiosInstance.get(`/nodues/${id}`);
      } catch (error) {
        console.error("Get student request error:", error);
        throw error;
      }
    },
    approveRequest: async (id) => {
      try {
        return await axiosInstance.put(`/nodues/approve/${id}`);
      } catch (error) {
        console.error("Approve request error:", error);
        throw error;
      }
    },
    rejectRequest: async (id, reason) => {
      try {
        return await axiosInstance.put(`/nodues/reject/${id}`, { reason });
      } catch (error) {
        console.error("Reject request error:", error);
        throw error;
      }
    },
    getRequestStatus: async () => {
      try {
        return await axiosInstance.get("/nodues/status");
      } catch (error) {
        console.error("Get request status error:", error);
        throw error;
      }
    },
    uploadDocument: async (id, file) => {
      try {
        const formData = new FormData();
        formData.append("document", file);
        return await axiosInstance.post(`/nodues/upload/${id}`, formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
      } catch (error) {
        console.error("Upload document error:", error);
        throw error;
      }
    },
  },

  mous: {
    submitMOU: async (mouData) => {
      try {
        return await axiosInstance.post("/mous", mouData);
      } catch (error) {
        console.error("Submit MOU error:", error);
        throw error;
      }
    },
    uploadMOUDocuments: async (id, files) => {
      try {
        const formData = new FormData();
        files.forEach((file) => {
          formData.append("documents", file);
        });
        return await axiosInstance.post(`/mous/upload/${id}`, formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
      } catch (error) {
        console.error("Upload MOU documents error:", error);
        throw error;
      }
    },
    getPendingMOUs: async () => {
      try {
        return await axiosInstance.get("/mous/pending");
      } catch (error) {
        console.error("Get pending MOUs error:", error);
        throw error;
      }
    },
    getApprovedMOUs: async () => {
      try {
        return await axiosInstance.get("/mous/approved");
      } catch (error) {
        console.error("Get approved MOUs error:", error);
        throw error;
      }
    },
    getRejectedMOUs: async () => {
      try {
        return await axiosInstance.get("/mous/rejected");
      } catch (error) {
        console.error("Get rejected MOUs error:", error);
        throw error;
      }
    },
    approveMOU: async (id) => {
      try {
        return await axiosInstance.put(`/mous/approve/${id}`);
      } catch (error) {
        console.error("Approve MOU error:", error);
        throw error;
      }
    },
    rejectMOU: async (id, reason) => {
      try {
        return await axiosInstance.put(`/mous/reject/${id}`, { reason });
      } catch (error) {
        console.error("Reject MOU error:", error);
        throw error;
      }
    },
    getMOUStatus: async (id) => {
      try {
        return await axiosInstance.get(`/mous/status/${id}`);
      } catch (error) {
        console.error("Get MOU status error:", error);
        throw error;
      }
    },
  },

  events: {
    submitEvent: async (eventData) => {
      try {
        return await axiosInstance.post("/events", eventData);
      } catch (error) {
        console.error("Submit event error:", error);
        throw error;
      }
    },
    uploadEventDocuments: async (id, files) => {
      try {
        const formData = new FormData();
        files.forEach((file) => {
          formData.append("documents", file);
        });
        return await axiosInstance.post(`/events/upload/${id}`, formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
      } catch (error) {
        console.error("Upload event documents error:", error);
        throw error;
      }
    },
    getPendingEvents: async () => {
      try {
        return await axiosInstance.get("/events/pending");
      } catch (error) {
        console.error("Get pending events error:", error);
        throw error;
      }
    },
    getApprovedEvents: async () => {
      try {
        return await axiosInstance.get("/events/approved");
      } catch (error) {
        console.error("Get approved events error:", error);
        throw error;
      }
    },
    getRejectedEvents: async () => {
      try {
        return await axiosInstance.get("/events/rejected");
      } catch (error) {
        console.error("Get rejected events error:", error);
        throw error;
      }
    },
    approveEvent: async (id) => {
      try {
        return await axiosInstance.put(`/events/approve/${id}`);
      } catch (error) {
        console.error("Approve event error:", error);
        throw error;
      }
    },
    rejectEvent: async (id, reason) => {
      try {
        return await axiosInstance.put(`/events/reject/${id}`, { reason });
      } catch (error) {
        console.error("Reject event error:", error);
        throw error;
      }
    },
    getEventStatus: async (id) => {
      try {
        return await axiosInstance.get(`/events/status/${id}`);
      } catch (error) {
        console.error("Get event status error:", error);
        throw error;
      }
    },
  },

  voting: {
    submitCandidature: async (candidatureData) => {
      try {
        return await axiosInstance.post("/voting/candidature", candidatureData);
      } catch (error) {
        console.error("Submit candidature error:", error);
        throw error;
      }
    },
    getMyCandidatures: async () => {
      try {
        return await axiosInstance.get("/voting/my-candidatures");
      } catch (error) {
        console.error("Get my candidatures error:", error);
        throw error;
      }
    },
    getAllCandidatures: async () => {
      try {
        return await axiosInstance.get("/voting/candidatures");
      } catch (error) {
        console.error("Get all candidatures error:", error);
        throw error;
      }
    },
    updateCandidatureStatus: async (id, statusData) => {
      try {
        return await axiosInstance.put(
          `/voting/candidature/${id}/status`,
          statusData
        );
      } catch (error) {
        console.error("Update candidature status error:", error);
        throw error;
      }
    },
    getApprovedCandidates: async () => {
      try {
        return await axiosInstance.get("/voting/approved-candidates");
      } catch (error) {
        console.error("Get approved candidates error:", error);
        throw error;
      }
    },
    authorizeTemporaryVoter: async (studentId, email, name) => {
      try {
        return await axiosInstance.post("/voting/authorize-temp-voter", {
          email,
          name,
          purpose: "Temporary voting access",
        });
      } catch (error) {
        console.error("Authorize temporary voter error:", error);
        throw error;
      }
    },
    checkVoterAuthorization: async () => {
      try {
        return await axiosInstance.get("/voting/check-voter-authorization");
      } catch (error) {
        console.error("Check voter authorization error:", error);
        throw error;
      }
    },
    authorizeVoter: async (studentId) => {
      try {
        return await axiosInstance.post("/voting/authorize-voter", {
          studentId,
        });
      } catch (error) {
        console.error("Authorize voter error:", error);
        throw error;
      }
    },
    checkVotingAuthorization: async () => {
      try {
        return await axiosInstance.get("/voting/check-authorization");
      } catch (error) {
        console.error("Check voting authorization error:", error);
        throw error;
      }
    },
    castVote: async (votes) => {
      try {
        return await axiosInstance.post("/voting/cast-vote", { votes });
      } catch (error) {
        console.error("Cast vote error:", error);
        throw error;
      }
    },
    getVotingStatistics: async () => {
      try {
        return await axiosInstance.get("/voting/statistics");
      } catch (error) {
        console.error("Get voting statistics error:", error);
        throw error;
      }
    },
    getElectionResults: async () => {
      try {
        return await axiosInstance.get("/voting/results");
      } catch (error) {
        console.error("Get election results error:", error);
        throw error;
      }
    },
    resetElection: async () => {
      try {
        return await axiosInstance.post("/voting/reset-election");
      } catch (error) {
        console.error("Reset election error:", error);
        throw error;
      }
    },
    getVotingSessions: async () => {
      try {
        return await axiosInstance.get("/voting/sessions");
      } catch (error) {
        console.error("Get voting sessions error:", error);
        throw error;
      }
    },
    deactivateVotingSession: async (sessionId) => {
      try {
        return await axiosInstance.put(
          `/voting/session/${sessionId}/deactivate`
        );
      } catch (error) {
        console.error("Deactivate voting session error:", error);
        throw error;
      }
    },
    updateVotingSystemStatus: async (isActive) => {
      try {
        return await axiosInstance.put("/voting/system-status", { isActive });
      } catch (error) {
        console.error("Update voting system status error:", error);
        throw error;
      }
    },
    getVotingSystemStatus: async () => {
      try {
        return await axiosInstance.get("/voting/system-status");
      } catch (error) {
        console.error("Get voting system status error:", error);
        throw error;
      }
    },
    updateCandidaturePortalStatus: async (isOpen) => {
      try {
        return await axiosInstance.put("/voting/candidature-portal-status", {
          isOpen,
        });
      } catch (error) {
        console.error("Update candidature portal status error:", error);
        throw error;
      }
    },
    getCandidaturePortalStatus: async () => {
      try {
        return await axiosInstance.get("/voting/candidature-portal-status");
      } catch (error) {
        console.error("Get candidature portal status error:", error);
        throw error;
      }
    },
    getElectionResults: async () => {
      try {
        return await axiosInstance.get("/voting/results");
      } catch (error) {
        console.error("Get election results error:", error);
        throw error;
      }
    },
    getAllVoters: async () => {
      try {
        return await axiosInstance.get("/voting/voters");
      } catch (error) {
        console.error("Get all voters error:", error);
        throw error;
      }
    },
    updateVoterStatus: async (voterId, statusData) => {
      try {
        return await axiosInstance.put(
          `/voting/voter/${voterId}/status`,
          statusData
        );
      } catch (error) {
        console.error("Update voter status error:", error);
        throw error;
      }
    },
  },
};

export default api;
