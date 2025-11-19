import React, { useState } from "react";
import { Box, Container, Typography, Paper, Tabs, Tab } from "@mui/material";
import WaveBackground from "../WaveBackground";
import AdminStudentNoDuesApproval from "./AdminStudentNoDuesApproval";
import AdminFacultyNoDuesApproval from "./AdminFacultyNoDuesApproval";

const AdminNoDuesApproval = () => {
    const [selectedTab, setSelectedTab] = useState(0);

    const handleTabChange = (event, newValue) => {
        setSelectedTab(newValue);
    };

    return (
        <>
            <WaveBackground />
            <Container maxWidth="xl" sx={{ py: 4 }}>
                <Typography
                    variant="h4"
                    component="h1"
                    sx={{
                        color: "#fff",
                        fontWeight: 600,
                        mb: 4,
                        textShadow: "0 2px 4px rgba(0,0,0,0.1)",
                    }}
                >
                    No Dues Approval Management
                </Typography>

                {/* Main Category Tabs */}
                <Paper
                    sx={{
                        mb: 3,
                        background: "rgba(255,255,255,0.1)",
                        backdropFilter: "blur(10px)",
                        border: "1px solid rgba(255,255,255,0.2)",
                    }}
                >
                    <Tabs
                        value={selectedTab}
                        onChange={handleTabChange}
                        centered
                        sx={{
                            "& .MuiTab-root": {
                                color: "rgba(255,255,255,0.7)",
                                fontSize: "1rem",
                                fontWeight: 500,
                                "&.Mui-selected": {
                                    color: "#fff",
                                },
                            },
                            "& .MuiTabs-indicator": {
                                backgroundColor: "#fff",
                                height: 3,
                            },
                        }}
                    >
                        <Tab label="Student No Dues" />
                        <Tab label="Faculty No Dues" />
                    </Tabs>
                </Paper>

                {/* Tab Panels */}
                <Box>
                    {selectedTab === 0 && (
                        <Box>
                            <AdminStudentNoDuesApproval />
                        </Box>
                    )}
                    {selectedTab === 1 && (
                        <Box>
                            <AdminFacultyNoDuesApproval />
                        </Box>
                    )}
                </Box>
            </Container>
        </>
    );
};

export default AdminNoDuesApproval;
