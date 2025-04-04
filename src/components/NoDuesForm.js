import React, { useState } from "react";
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  FormControl,
  FormControlLabel,
  Checkbox,
  Button,
  Grid,
  Paper,
  TextField,
  Divider,
  IconButton,
} from "@mui/material";
import { ArrowBack as ArrowBackIcon } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import WaveBackground from "./WaveBackground";

const NoDuesForm = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    // Personal Details
    name: "",
    rollNumber: "",
    branch: "",
    semester: "",
    section: "",

    // Department Clearance
    libraryDues: false,
    libraryRemarks: "",
    hostelDues: false,
    hostelRemarks: "",
    departmentDues: false,
    departmentRemarks: "",
    accountsDues: false,
    accountsRemarks: "",
    labDues: false,
    labRemarks: "",
    sportsDues: false,
    sportsRemarks: "",
    examDues: false,
    examRemarks: "",
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCheckboxChange = (e) => {
    const { name, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: checked,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Form submitted:", formData);
    // Here you would typically send the data to your backend
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <WaveBackground />
      <Container
        maxWidth="lg"
        sx={{
          position: "relative",
          zIndex: 1,
          py: 4,
        }}
      >
        <IconButton
          onClick={() => navigate("/dashboard")}
          sx={{
            color: "#fff",
            mb: 2,
          }}
        >
          <ArrowBackIcon />
        </IconButton>
        <Card
          sx={{
            background: "rgba(255,255,255,0.1)",
            backdropFilter: "blur(10px)",
            border: "1px solid rgba(255,255,255,0.2)",
            borderRadius: 2,
          }}
        >
          <CardContent>
            <Typography
              variant="h4"
              component="h1"
              sx={{
                color: "#fff",
                fontWeight: 600,
                mb: 4,
                textAlign: "center",
              }}
            >
              No Dues Form
            </Typography>
            <form onSubmit={handleSubmit}>
              <Grid container spacing={3}>
                {/* Personal Details Section */}
                <Grid item xs={12}>
                  <Typography
                    variant="h6"
                    sx={{
                      color: "#fff",
                      mb: 2,
                      borderBottom: "1px solid rgba(255,255,255,0.2)",
                      pb: 1,
                    }}
                  >
                    Personal Details
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Full Name"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        sx={{
                          "& .MuiOutlinedInput-root": {
                            color: "#fff",
                            "& fieldset": {
                              borderColor: "rgba(255,255,255,0.2)",
                            },
                          },
                          "& .MuiInputLabel-root": {
                            color: "rgba(255,255,255,0.7)",
                          },
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Roll Number"
                        name="rollNumber"
                        value={formData.rollNumber}
                        onChange={handleInputChange}
                        sx={{
                          "& .MuiOutlinedInput-root": {
                            color: "#fff",
                            "& fieldset": {
                              borderColor: "rgba(255,255,255,0.2)",
                            },
                          },
                          "& .MuiInputLabel-root": {
                            color: "rgba(255,255,255,0.7)",
                          },
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <TextField
                        fullWidth
                        label="Branch"
                        name="branch"
                        value={formData.branch}
                        onChange={handleInputChange}
                        sx={{
                          "& .MuiOutlinedInput-root": {
                            color: "#fff",
                            "& fieldset": {
                              borderColor: "rgba(255,255,255,0.2)",
                            },
                          },
                          "& .MuiInputLabel-root": {
                            color: "rgba(255,255,255,0.7)",
                          },
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <TextField
                        fullWidth
                        label="Semester"
                        name="semester"
                        value={formData.semester}
                        onChange={handleInputChange}
                        sx={{
                          "& .MuiOutlinedInput-root": {
                            color: "#fff",
                            "& fieldset": {
                              borderColor: "rgba(255,255,255,0.2)",
                            },
                          },
                          "& .MuiInputLabel-root": {
                            color: "rgba(255,255,255,0.7)",
                          },
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <TextField
                        fullWidth
                        label="Section"
                        name="section"
                        value={formData.section}
                        onChange={handleInputChange}
                        sx={{
                          "& .MuiOutlinedInput-root": {
                            color: "#fff",
                            "& fieldset": {
                              borderColor: "rgba(255,255,255,0.2)",
                            },
                          },
                          "& .MuiInputLabel-root": {
                            color: "rgba(255,255,255,0.7)",
                          },
                        }}
                      />
                    </Grid>
                  </Grid>
                </Grid>

                {/* Department Clearance Section */}
                <Grid item xs={12}>
                  <Typography
                    variant="h6"
                    sx={{
                      color: "#fff",
                      mb: 2,
                      borderBottom: "1px solid rgba(255,255,255,0.2)",
                      pb: 1,
                    }}
                  >
                    Department Clearance
                  </Typography>
                  <Grid container spacing={2}>
                    {[
                      { label: "Library", name: "library" },
                      { label: "Hostel", name: "hostel" },
                      { label: "Department", name: "department" },
                      { label: "Accounts", name: "accounts" },
                      { label: "Laboratory", name: "lab" },
                      { label: "Sports", name: "sports" },
                      { label: "Examination", name: "exam" },
                    ].map((dept) => (
                      <Grid item xs={12} key={dept.name}>
                        <Paper
                          sx={{
                            p: 2,
                            background: "rgba(255,255,255,0.05)",
                            backdropFilter: "blur(5px)",
                            border: "1px solid rgba(255,255,255,0.1)",
                            borderRadius: 1,
                          }}
                        >
                          <Grid container spacing={2} alignItems="center">
                            <Grid item xs={12} sm={4}>
                              <FormControl component="fieldset">
                                <FormControlLabel
                                  control={
                                    <Checkbox
                                      checked={formData[`${dept.name}Dues`]}
                                      onChange={handleCheckboxChange}
                                      name={`${dept.name}Dues`}
                                      sx={{
                                        color: "rgba(255,255,255,0.7)",
                                        "&.Mui-checked": {
                                          color: "#0078D4",
                                        },
                                      }}
                                    />
                                  }
                                  label={
                                    <Typography sx={{ color: "#fff" }}>
                                      {dept.label} Clearance
                                    </Typography>
                                  }
                                />
                              </FormControl>
                            </Grid>
                            <Grid item xs={12} sm={8}>
                              <TextField
                                fullWidth
                                label="Remarks"
                                name={`${dept.name}Remarks`}
                                value={formData[`${dept.name}Remarks`]}
                                onChange={handleInputChange}
                                sx={{
                                  "& .MuiOutlinedInput-root": {
                                    color: "#fff",
                                    "& fieldset": {
                                      borderColor: "rgba(255,255,255,0.2)",
                                    },
                                  },
                                  "& .MuiInputLabel-root": {
                                    color: "rgba(255,255,255,0.7)",
                                  },
                                }}
                              />
                            </Grid>
                          </Grid>
                        </Paper>
                      </Grid>
                    ))}
                  </Grid>
                </Grid>

                <Grid item xs={12}>
                  <Box
                    sx={{ display: "flex", justifyContent: "center", mt: 4 }}
                  >
                    <Button
                      type="submit"
                      variant="contained"
                      sx={{
                        background: "rgba(0,120,212,0.9)",
                        backdropFilter: "blur(10px)",
                        "&:hover": {
                          background: "rgba(0,120,212,1)",
                        },
                        px: 4,
                        py: 1.5,
                      }}
                    >
                      Submit No Dues Form
                    </Button>
                  </Box>
                </Grid>
              </Grid>
            </form>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
};

export default NoDuesForm;
