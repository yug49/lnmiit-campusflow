/**
 * API Client for LNMIIT-CampusFlow
 * This utility handles communication with the backend API
 */

// Using relative URLs which will be automatically proxied by React dev server
const API_BASE_URL = "";

/**
 * Generic fetch function with error handling and authorization
 */
const fetchAPI = async (endpoint, options = {}) => {
  // Get the auth token from localStorage if available
  const token = localStorage.getItem("authToken");

  // Set default headers
  const headers = {
    "Content-Type": "application/json",
    Accept: "application/json",
    ...options.headers,
  };

  // Add authorization header if token exists
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
      credentials: "include", // Include cookies if needed
    });

    // For responses without content
    if (response.status === 204) {
      return { success: true };
    }

    // Parse the JSON response - handle case where response might not be JSON
    let data;
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      data = await response.json();
    } else {
      data = { message: await response.text() };
    }

    // Check if the response was successful
    if (!response.ok) {
      throw new Error(
        data.message || "An error occurred with status: " + response.status
      );
    }

    return data;
  } catch (error) {
    // Special handling for network errors (server not available)
    if (error.name === "TypeError" && error.message === "Failed to fetch") {
      console.error("Network error: Could not connect to the server");
      throw new Error(
        "Could not connect to the server. Please check if the backend is running."
      );
    }

    console.error("API request failed:", error);
    throw error;
  }
};

/**
 * Upload files to the API with multipart/form-data
 */
const uploadFile = async (endpoint, formData, options = {}) => {
  // Get the auth token from localStorage if available
  const token = localStorage.getItem("authToken");

  // Headers for file upload (without Content-Type so browser can set it with boundary)
  const headers = { ...options.headers };

  // Add authorization header if token exists
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: "POST",
      body: formData,
      headers,
      ...options,
    });

    // Parse the JSON response
    const data = await response.json();

    // Check if the response was successful
    if (!response.ok) {
      throw new Error(data.message || "An error occurred");
    }

    return data;
  } catch (error) {
    console.error("File upload failed:", error);
    throw error;
  }
};

/**
 * API endpoints
 */
const api = {
  // Auth endpoints
  auth: {
    login: (credentials) =>
      fetchAPI("/api/auth/login", {
        method: "POST",
        body: JSON.stringify(credentials),
      }),
    register: (userData) =>
      fetchAPI("/api/auth/register", {
        method: "POST",
        body: JSON.stringify(userData),
      }),
    logout: () => {
      localStorage.removeItem("authToken");
      localStorage.removeItem("userRole");
      localStorage.removeItem("userData");
      return Promise.resolve();
    },
    verifyToken: () => fetchAPI("/api/auth/verify"),
  },

  // User endpoints
  users: {
    getProfile: () => fetchAPI("/api/users/profile"),
    updateProfile: (userData) =>
      fetchAPI("/api/users/profile", {
        method: "PUT",
        body: JSON.stringify(userData),
      }),
  },

  // No-Dues endpoints
  noDues: {
    submitRequest: (formData) =>
      fetchAPI("/api/nodues", {
        method: "POST",
        body: JSON.stringify(formData),
      }),
    getPendingRequests: () => fetchAPI("/api/nodues/pending"),
    getApprovedRequests: () => fetchAPI("/api/nodues/approved"),
    getStudentRequest: (studentId) =>
      fetchAPI(`/api/nodues/student/${studentId}`),
    approveRequest: (requestId, approvalData) =>
      fetchAPI(`/api/nodues/${requestId}/approve`, {
        method: "PUT",
        body: JSON.stringify(approvalData),
      }),
    rejectRequest: (requestId, rejectionData) =>
      fetchAPI(`/api/nodues/${requestId}/reject`, {
        method: "PUT",
        body: JSON.stringify(rejectionData),
      }),
    getRequestStatus: (requestId) =>
      fetchAPI(`/api/nodues/${requestId}/status`),
    uploadDocument: (requestId, fileFormData) =>
      uploadFile(`/api/nodues/${requestId}/documents`, fileFormData),
  },

  // MOU endpoints
  mous: {
    submitMOU: (mouData) =>
      fetchAPI("/api/mous", {
        method: "POST",
        body: JSON.stringify(mouData),
      }),
    uploadMOUDocuments: (mouId, fileFormData) =>
      uploadFile(`/api/mous/${mouId}/documents`, fileFormData),
    getPendingMOUs: () => fetchAPI("/api/mous/pending"),
    getApprovedMOUs: () => fetchAPI("/api/mous/approved"),
    getRejectedMOUs: () => fetchAPI("/api/mous/rejected"),
    approveMOU: (mouId, approvalData) =>
      fetchAPI(`/api/mous/${mouId}/approve`, {
        method: "PUT",
        body: JSON.stringify(approvalData),
      }),
    rejectMOU: (mouId, rejectionData) =>
      fetchAPI(`/api/mous/${mouId}/reject`, {
        method: "PUT",
        body: JSON.stringify(rejectionData),
      }),
    getMOUStatus: (mouId) => fetchAPI(`/api/mous/${mouId}/status`),
  },

  // Event endpoints
  events: {
    submitEvent: (eventData) =>
      fetchAPI("/api/events", {
        method: "POST",
        body: JSON.stringify(eventData),
      }),
    uploadEventDocuments: (eventId, fileFormData) =>
      uploadFile(`/api/events/${eventId}/documents`, fileFormData),
    getPendingEvents: () => fetchAPI("/api/events/pending"),
    getApprovedEvents: () => fetchAPI("/api/events/approved"),
    getRejectedEvents: () => fetchAPI("/api/events/rejected"),
    approveEvent: (eventId, approvalData) =>
      fetchAPI(`/api/events/${eventId}/approve`, {
        method: "PUT",
        body: JSON.stringify(approvalData),
      }),
    rejectEvent: (eventId, rejectionData) =>
      fetchAPI(`/api/events/${eventId}/reject`, {
        method: "PUT",
        body: JSON.stringify(rejectionData),
      }),
    getEventStatus: (eventId) => fetchAPI(`/api/events/${eventId}/status`),
  },

  // Voting/Election endpoints
  voting: {
    submitCandidature: (candidatureData) =>
      fetchAPI("/api/admin/candidatures", {
        method: "POST",
        body: JSON.stringify(candidatureData),
      }),
    uploadCandidatureDocuments: (candidatureId, fileFormData) =>
      uploadFile(
        `/api/admin/candidatures/${candidatureId}/documents`,
        fileFormData
      ),
    getCandidatures: () => fetchAPI("/api/admin/candidatures"),
    approveCandidature: (candidatureId, approvalData) =>
      fetchAPI(`/api/admin/candidatures/${candidatureId}/approve`, {
        method: "PUT",
        body: JSON.stringify(approvalData),
      }),
    rejectCandidature: (candidatureId, rejectionData) =>
      fetchAPI(`/api/admin/candidatures/${candidatureId}/reject`, {
        method: "PUT",
        body: JSON.stringify(rejectionData),
      }),
    getVoters: () => fetchAPI("/api/admin/voters"),
    approveVoter: (voterId) =>
      fetchAPI(`/api/admin/voters/${voterId}/approve`, {
        method: "PUT",
      }),
    revokeVoter: (voterId) =>
      fetchAPI(`/api/admin/voters/${voterId}/revoke`, {
        method: "PUT",
      }),
    castVote: (voteData) =>
      fetchAPI("/api/admin/votes", {
        method: "POST",
        body: JSON.stringify(voteData),
      }),
    getElectionStatus: () => fetchAPI("/api/admin/election/status"),
    toggleElectionStatus: (status) =>
      fetchAPI("/api/admin/election/toggle", {
        method: "PUT",
        body: JSON.stringify({ active: status }),
      }),
  },
};

export default api;
