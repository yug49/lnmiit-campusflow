import React, { useState, useEffect } from "react";
import {
    Box,
    Paper,
    Typography,
    Button,
    TextField,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    Alert,
    Chip,
    CircularProgress,
} from "@mui/material";
import {
    Add as AddIcon,
    Delete as DeleteIcon,
    Edit as EditIcon,
    Refresh as RefreshIcon,
} from "@mui/icons-material";
import api from "../../utils/apiClient";

const UserManagement = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [openDialog, setOpenDialog] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        role: "student",
        permissions: [],
    });

    const roles = [
        { value: "student", label: "Student" },
        { value: "faculty", label: "Faculty" },
        { value: "council", label: "Council Member" },
        { value: "admin", label: "Admin" },
    ];

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            setError("");
            const response = await api.users.getAllUsers();
            setUsers(response.data || []);
        } catch (err) {
            console.error("Error fetching users:", err);
            setError("Failed to fetch users");
        } finally {
            setLoading(false);
        }
    };

    const handleOpenDialog = (user = null) => {
        if (user) {
            setEditMode(true);
            setSelectedUser(user);
            setFormData({
                name: user.name,
                email: user.email,
                role: user.role,
                permissions: user.permissions || [],
            });
        } else {
            setEditMode(false);
            setSelectedUser(null);
            setFormData({
                name: "",
                email: "",
                role: "student",
                permissions: [],
            });
        }
        setOpenDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
        setEditMode(false);
        setSelectedUser(null);
        setFormData({
            name: "",
            email: "",
            role: "student",
            permissions: [],
        });
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = async () => {
        try {
            setError("");
            setSuccess("");
            setLoading(true);

            if (!formData.email.includes("@")) {
                setError("Please enter a valid email address");
                setLoading(false);
                return;
            }

            // Validate Google email format (must be a Gmail account or Google Workspace)
            const emailDomain = formData.email.split("@")[1];
            if (!formData.email.endsWith("@gmail.com") && !emailDomain) {
                console.warn(
                    "Note: User should have a Google account to login via Privy"
                );
            }

            if (editMode && selectedUser) {
                // Update existing user
                await api.users.updateUser(selectedUser._id, formData);
                setSuccess("User updated successfully");
            } else {
                // Create new user (pre-authorize in database)
                await api.users.createUser(formData);
                setSuccess(
                    `User pre-authorized successfully! ${formData.name} can now login at the portal using their Google account (${formData.email}). They will be automatically assigned the ${formData.role} role on first login.`
                );
            }

            handleCloseDialog();
            fetchUsers();
        } catch (err) {
            console.error("Error saving user:", err);
            setError(err.message || "Failed to save user");
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteUser = async (userId) => {
        if (!window.confirm("Are you sure you want to delete this user?")) {
            return;
        }

        try {
            setError("");
            setSuccess("");
            setLoading(true);
            await api.users.deleteUser(userId);
            setSuccess("User deleted successfully");
            fetchUsers();
        } catch (err) {
            console.error("Error deleting user:", err);
            setError(err.message || "Failed to delete user");
        } finally {
            setLoading(false);
        }
    };

    const getRoleColor = (role) => {
        const colors = {
            student: "primary",
            faculty: "success",
            council: "warning",
            admin: "error",
        };
        return colors[role] || "default";
    };

    return (
        <Box sx={{ p: 3 }}>
            <Paper sx={{ p: 3 }}>
                <Box
                    sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        mb: 3,
                    }}
                >
                    <Typography variant="h5" component="h2">
                        User Management
                    </Typography>
                    <Box>
                        <IconButton onClick={fetchUsers} sx={{ mr: 1 }}>
                            <RefreshIcon />
                        </IconButton>
                        <Button
                            variant="contained"
                            startIcon={<AddIcon />}
                            onClick={() => handleOpenDialog()}
                        >
                            Add User
                        </Button>
                    </Box>
                </Box>

                <Alert severity="info" sx={{ mb: 3 }}>
                    <Typography variant="body2">
                        <strong>How user authentication works:</strong>
                        <br />• Users listed here are{" "}
                        <strong>pre-authorized</strong> to access the system
                        <br />
                        • When they login with Google (via Privy), they'll
                        automatically get the role assigned here
                        <br />
                        • You don't need to add users to Privy - it happens
                        automatically on first login
                        <br />• MongoDB (this list) = authorization • Privy =
                        authentication
                    </Typography>
                </Alert>

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
                    <Alert
                        severity="success"
                        sx={{ mb: 2 }}
                        onClose={() => setSuccess("")}
                    >
                        {success}
                    </Alert>
                )}

                {loading && !openDialog ? (
                    <Box
                        sx={{ display: "flex", justifyContent: "center", p: 3 }}
                    >
                        <CircularProgress />
                    </Box>
                ) : (
                    <TableContainer>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Name</TableCell>
                                    <TableCell>Email</TableCell>
                                    <TableCell>Role</TableCell>
                                    <TableCell align="right">Actions</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {users.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={4} align="center">
                                            No users found
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    users.map((user) => (
                                        <TableRow key={user._id}>
                                            <TableCell>{user.name}</TableCell>
                                            <TableCell>{user.email}</TableCell>
                                            <TableCell>
                                                <Chip
                                                    label={user.role}
                                                    color={getRoleColor(
                                                        user.role
                                                    )}
                                                    size="small"
                                                />
                                            </TableCell>
                                            <TableCell align="right">
                                                <IconButton
                                                    size="small"
                                                    onClick={() =>
                                                        handleOpenDialog(user)
                                                    }
                                                >
                                                    <EditIcon />
                                                </IconButton>
                                                <IconButton
                                                    size="small"
                                                    color="error"
                                                    onClick={() =>
                                                        handleDeleteUser(
                                                            user._id
                                                        )
                                                    }
                                                >
                                                    <DeleteIcon />
                                                </IconButton>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                )}
            </Paper>

            {/* Add/Edit User Dialog */}
            <Dialog
                open={openDialog}
                onClose={handleCloseDialog}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle>
                    {editMode ? "Edit User" : "Add New User"}
                </DialogTitle>
                <DialogContent>
                    <Box sx={{ pt: 2 }}>
                        <TextField
                            fullWidth
                            label="Name"
                            name="name"
                            value={formData.name}
                            onChange={handleInputChange}
                            sx={{ mb: 2 }}
                            required
                        />
                        <TextField
                            fullWidth
                            label="Email (Google Account)"
                            name="email"
                            type="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            sx={{ mb: 2 }}
                            required
                            helperText="Enter the user's Google email address. They will login using Google OAuth."
                            disabled={editMode}
                        />
                        <FormControl fullWidth sx={{ mb: 2 }}>
                            <InputLabel>Role</InputLabel>
                            <Select
                                name="role"
                                value={formData.role}
                                onChange={handleInputChange}
                                label="Role"
                            >
                                {roles.map((role) => (
                                    <MenuItem
                                        key={role.value}
                                        value={role.value}
                                    >
                                        {role.label}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                        <Alert severity="info" sx={{ mb: 2 }}>
                            <Typography variant="body2">
                                <strong>How it works:</strong>
                                <br />
                                1. Adding a user here pre-authorizes them in the
                                system
                                <br />
                                2. The user logs in at the portal using their
                                Google account
                                <br />
                                3. Privy (authentication provider) verifies
                                their Google identity
                                <br />
                                4. They are automatically assigned the role you
                                specified
                            </Typography>
                        </Alert>
                        <Typography variant="caption" color="text.secondary">
                            Note: Users authenticate via Google OAuth through
                            Privy. No password required.
                        </Typography>
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDialog}>Cancel</Button>
                    <Button
                        onClick={handleSubmit}
                        variant="contained"
                        disabled={loading}
                    >
                        {loading ? (
                            <CircularProgress size={24} />
                        ) : editMode ? (
                            "Update"
                        ) : (
                            "Create"
                        )}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default UserManagement;
