import React, {
    createContext,
    useState,
    useContext,
    useEffect,
    useCallback,
} from "react";
import { usePrivy } from "@privy-io/react-auth";
import api from "../utils/apiClient";

// Get the API base URL from environment or use default
const BASE_URL = process.env.REACT_APP_API_BASE_URL || "http://localhost:5001";

// Create context
const UserContext = createContext();

// Create a global event system for context updates
export const USER_PHOTO_UPDATED = "USER_PHOTO_UPDATED";
const eventTarget = new EventTarget();

export const UserProvider = ({ children }) => {
    const {
        ready: privyReady,
        authenticated,
        user: privyUser,
        logout: privyLogout,
    } = usePrivy();
    const [userProfilePhoto, setUserProfilePhoto] = useState(null);
    const [userName, setUserName] = useState("");
    const [userRole, setUserRole] = useState("");
    const [userEmail, setUserEmail] = useState("");
    const [isLoading, setIsLoading] = useState(true);

    // Load user data from Privy and localStorage
    useEffect(() => {
        const loadData = async () => {
            if (!privyReady) {
                return;
            }

            if (authenticated && privyUser) {
                // Get email from Privy user
                const googleAccount = privyUser.google;
                const email = googleAccount?.email || privyUser.email?.address;
                setUserEmail(email || "");

                // Load from localStorage
                try {
                    const userData = JSON.parse(
                        localStorage.getItem("userData") || "{}"
                    );
                    const currentRole =
                        localStorage.getItem("userRole") || userData.role;

                    if (userData.name) {
                        setUserName(userData.name);
                    }

                    if (currentRole) {
                        setUserRole(currentRole);
                    }

                    // Handle profile photo
                    const timestamp = new Date().getTime();
                    if (
                        userData.profilePhoto &&
                        userData.profilePhoto.rolePrefix === currentRole
                    ) {
                        if (userData.profilePhoto.fullUrl) {
                            setUserProfilePhoto(
                                `${userData.profilePhoto.fullUrl}?t=${timestamp}`
                            );
                        } else if (userData.profilePhoto.url) {
                            const photoUrl = userData.profilePhoto.url;
                            if (photoUrl && photoUrl.startsWith("/")) {
                                setUserProfilePhoto(
                                    `${BASE_URL}${photoUrl}?t=${timestamp}`
                                );
                            } else if (photoUrl) {
                                setUserProfilePhoto(
                                    `${photoUrl}?t=${timestamp}`
                                );
                            }
                        }
                    }
                } catch (error) {
                    console.error("Error loading user data:", error);
                }
            }

            setIsLoading(false);
        };

        loadData();
    }, [privyReady, authenticated, privyUser]);

    // Function to load user data from localStorage
    const loadUserData = useCallback(() => {
        try {
            const userData = JSON.parse(
                localStorage.getItem("userData") || "{}"
            );
            const currentRole =
                localStorage.getItem("userRole") || userData.role;

            if (userData.name) {
                setUserName(userData.name);
            }

            if (currentRole) {
                setUserRole(currentRole);
            }

            setUserProfilePhoto(null);

            const timestamp = new Date().getTime();
            if (
                userData.profilePhoto &&
                userData.profilePhoto.rolePrefix === currentRole
            ) {
                if (userData.profilePhoto.fullUrl) {
                    setUserProfilePhoto(
                        `${userData.profilePhoto.fullUrl}?t=${timestamp}`
                    );
                } else if (userData.profilePhoto.url) {
                    const photoUrl = userData.profilePhoto.url;
                    if (photoUrl && photoUrl.startsWith("/")) {
                        setUserProfilePhoto(
                            `${BASE_URL}${photoUrl}?t=${timestamp}`
                        );
                    } else if (photoUrl) {
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
                const currentRole =
                    localStorage.getItem("userRole") || userData.role;

                localStorage.setItem("userData", JSON.stringify(userData));

                if (userData.name) {
                    setUserName(userData.name);
                }

                if (userData.role) {
                    setUserRole(userData.role);
                }

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

                        userData.profilePhoto.fullUrl = `${BASE_URL}${photoUrl}`;
                        localStorage.setItem(
                            "userData",
                            JSON.stringify(userData)
                        );
                    } else {
                        setUserProfilePhoto(`${photoUrl}?t=${timestamp}`);
                    }
                } else {
                    setUserProfilePhoto(null);
                }
            }
        } catch (error) {
            console.error("Error fetching profile data:", error);
            loadUserData();
        } finally {
            setIsLoading(false);
        }
    }, [loadUserData]);

    // Logout function that clears both Privy and local state
    const handleLogout = useCallback(async () => {
        try {
            await privyLogout();
            localStorage.removeItem("authToken");
            localStorage.removeItem("privyToken");
            localStorage.removeItem("userRole");
            localStorage.removeItem("userData");
            setUserProfilePhoto(null);
            setUserName("");
            setUserRole("");
            setUserEmail("");
        } catch (error) {
            console.error("Logout error:", error);
        }
    }, [privyLogout]);

    // Set up event listeners for photo updates
    useEffect(() => {
        const handlePhotoUpdate = (event) => {
            if (
                event.detail &&
                event.detail.photoUrl &&
                event.detail.rolePrefix
            ) {
                const currentRole = localStorage.getItem("userRole");

                if (event.detail.rolePrefix === currentRole) {
                    const timestamp = new Date().getTime();
                    const photoUrl = event.detail.photoUrl.includes("?")
                        ? `${event.detail.photoUrl}&t=${timestamp}`
                        : `${event.detail.photoUrl}?t=${timestamp}`;

                    setUserProfilePhoto(photoUrl);
                }
            } else {
                loadUserData();
            }
        };

        eventTarget.addEventListener(USER_PHOTO_UPDATED, handlePhotoUpdate);

        return () => {
            eventTarget.removeEventListener(
                USER_PHOTO_UPDATED,
                handlePhotoUpdate
            );
        };
    }, [loadUserData]);

    // Function to directly update the profile photo URL
    const updateProfilePhoto = useCallback((photoUrl, rolePrefix) => {
        const currentRole = localStorage.getItem("userRole");

        if (photoUrl && (!rolePrefix || rolePrefix === currentRole)) {
            const timestamp = new Date().getTime();
            const urlWithTimestamp = photoUrl.includes("?")
                ? `${photoUrl}&t=${timestamp}`
                : `${photoUrl}?t=${timestamp}`;

            setUserProfilePhoto(urlWithTimestamp);

            try {
                const userData = JSON.parse(
                    localStorage.getItem("userData") || "{}"
                );
                if (userData.profilePhoto) {
                    userData.profilePhoto.fullUrl = photoUrl;
                    userData.profilePhoto.rolePrefix =
                        rolePrefix || currentRole;
                    localStorage.setItem("userData", JSON.stringify(userData));
                }
            } catch (error) {
                console.error(
                    "Error updating userData in localStorage:",
                    error
                );
            }
        }
    }, []);

    return (
        <UserContext.Provider
            value={{
                userProfilePhoto,
                userName,
                userRole,
                userEmail,
                updateProfilePhoto,
                loadUserData,
                fetchProfileData,
                logout: handleLogout,
                isLoading,
                isAuthenticated: authenticated,
                privyUser,
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
