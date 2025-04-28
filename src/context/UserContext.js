import React, {
  createContext,
  useState,
  useContext,
  useEffect,
  useCallback,
} from "react";
import api from "../utils/apiClient";

// Get the API base URL from environment or use default
const BASE_URL = process.env.REACT_APP_API_BASE_URL || "http://localhost:5001";

// Create context
const UserContext = createContext();

// Create a global event system for context updates
export const USER_PHOTO_UPDATED = "USER_PHOTO_UPDATED";
const eventTarget = new EventTarget();

export const UserProvider = ({ children }) => {
  const [userProfilePhoto, setUserProfilePhoto] = useState(null);
  const [userName, setUserName] = useState("");
  const [userRole, setUserRole] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  // Function to load user data from localStorage
  const loadUserData = useCallback(() => {
    try {
      const userData = JSON.parse(localStorage.getItem("userData") || "{}");
      const currentRole = localStorage.getItem("userRole") || userData.role;

      // Set user name if available
      if (userData.name) {
        setUserName(userData.name);
      }

      // Set user role if available
      if (currentRole) {
        setUserRole(currentRole);
      }

      // Clear existing photo first to ensure state updates
      setUserProfilePhoto(null);

      // Handle profile photo with cache-busting timestamp
      const timestamp = new Date().getTime();

      // Check for profile photo in userData
      if (
        userData.profilePhoto &&
        userData.profilePhoto.rolePrefix === currentRole
      ) {
        if (userData.profilePhoto.fullUrl) {
          // Use full URL directly if available
          setUserProfilePhoto(
            `${userData.profilePhoto.fullUrl}?t=${timestamp}`
          );
        } else if (userData.profilePhoto.url) {
          const photoUrl = userData.profilePhoto.url;
          if (photoUrl && photoUrl.startsWith("/")) {
            // Prepend base URL for relative paths
            setUserProfilePhoto(`${BASE_URL}${photoUrl}?t=${timestamp}`);
          } else if (photoUrl) {
            // Use absolute URL directly
            setUserProfilePhoto(`${photoUrl}?t=${timestamp}`);
          }
        }
      }

      setIsLoading(false);
    } catch (error) {
      console.error("Error loading user data in UserContext:", error);
      setIsLoading(false);
    }
  }, []);

  // Function to fetch fresh profile data from API
  const fetchProfileData = useCallback(async () => {
    try {
      const response = await api.users.getProfile();

      if (response && response.data) {
        const userData = response.data;
        const currentRole = localStorage.getItem("userRole") || userData.role;

        // Update local storage with latest data
        localStorage.setItem("userData", JSON.stringify(userData));

        // Update state with new data
        if (userData.name) {
          setUserName(userData.name);
        }

        if (userData.role) {
          setUserRole(userData.role);
        }

        // Process profile photo URL if it exists and matches the current role
        if (
          userData.profilePhoto &&
          userData.profilePhoto.url &&
          userData.profilePhoto.rolePrefix === currentRole
        ) {
          const photoUrl = userData.profilePhoto.url;
          const timestamp = new Date().getTime();

          if (photoUrl.startsWith("/")) {
            const fullUrl = `${BASE_URL}${photoUrl}?t=${timestamp}`;
            setUserProfilePhoto(fullUrl);

            // Update the localStorage entry to include fullUrl
            userData.profilePhoto.fullUrl = `${BASE_URL}${photoUrl}`;
            localStorage.setItem("userData", JSON.stringify(userData));
          } else {
            setUserProfilePhoto(`${photoUrl}?t=${timestamp}`);
          }
        } else {
          // Clear profile photo if role doesn't match
          setUserProfilePhoto(null);
        }
      }
    } catch (error) {
      console.error("Error fetching profile data:", error);
      // Fall back to localStorage if API request fails
      loadUserData();
    } finally {
      setIsLoading(false);
    }
  }, [loadUserData]);

  // Load user data immediately and set up event listeners
  useEffect(() => {
    // Set up event listener for photo updates
    const handlePhotoUpdate = (event) => {
      if (event.detail && event.detail.photoUrl && event.detail.rolePrefix) {
        const currentRole = localStorage.getItem("userRole");

        // Only update photo if role matches
        if (event.detail.rolePrefix === currentRole) {
          // Add timestamp to prevent caching
          const timestamp = new Date().getTime();
          const photoUrl = event.detail.photoUrl.includes("?")
            ? `${event.detail.photoUrl}&t=${timestamp}`
            : `${event.detail.photoUrl}?t=${timestamp}`;

          setUserProfilePhoto(photoUrl);
        }
      } else {
        loadUserData(); // Fallback to reload all user data
      }
    };

    eventTarget.addEventListener(USER_PHOTO_UPDATED, handlePhotoUpdate);

    // Initial load of user data from localStorage
    loadUserData();

    // Try to fetch fresh profile data from API if we have a token
    const token = localStorage.getItem("authToken");
    if (token) {
      fetchProfileData();
    } else {
      setIsLoading(false);
    }

    return () => {
      eventTarget.removeEventListener(USER_PHOTO_UPDATED, handlePhotoUpdate);
    };
  }, [loadUserData, fetchProfileData]);

  // Function to directly update the profile photo URL
  const updateProfilePhoto = useCallback((photoUrl, rolePrefix) => {
    const currentRole = localStorage.getItem("userRole");

    // Only update if the role matches
    if (photoUrl && (!rolePrefix || rolePrefix === currentRole)) {
      const timestamp = new Date().getTime();
      // Add timestamp to prevent caching
      const urlWithTimestamp = photoUrl.includes("?")
        ? `${photoUrl}&t=${timestamp}`
        : `${photoUrl}?t=${timestamp}`;

      setUserProfilePhoto(urlWithTimestamp);

      // Update localStorage to match
      try {
        const userData = JSON.parse(localStorage.getItem("userData") || "{}");
        if (userData.profilePhoto) {
          userData.profilePhoto.fullUrl = photoUrl;
          userData.profilePhoto.rolePrefix = rolePrefix || currentRole;
          localStorage.setItem("userData", JSON.stringify(userData));
        }
      } catch (error) {
        console.error("Error updating userData in localStorage:", error);
      }
    }
  }, []);

  return (
    <UserContext.Provider
      value={{
        userProfilePhoto,
        userName,
        userRole,
        updateProfilePhoto,
        loadUserData,
        fetchProfileData,
        isLoading,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

// Create a hook for easy context use
export const useUser = () => useContext(UserContext);

// Function to notify all components about photo updates
export const notifyProfilePhotoUpdated = (photoUrl, rolePrefix) => {
  eventTarget.dispatchEvent(
    new CustomEvent(USER_PHOTO_UPDATED, {
      detail: { photoUrl, rolePrefix },
    })
  );
};

export default UserContext;
