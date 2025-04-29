import React from "react";
import { Box, Typography } from "@mui/material";

const Footer = () => {
  return (
    <Box
      component="footer"
      sx={{
        py: 2,
        mt: "auto",
        textAlign: "center",
        backgroundColor: "rgba(0,0,0,0.2)",
        borderTop: "1px solid rgba(255,255,255,0.1)",
        width: "100%",
      }}
    >
      <Typography
        variant="body2"
        sx={{ color: "rgba(255,255,255,0.7)", mb: 3 }}
      >
        © {new Date().getFullYear()} LNMIIT-CampusConnect • All rights reserved
      </Typography>

      <hr />
      <Typography
        variant="body2"
        sx={{ color: "rgba(255,255,255,0.7)", mt: 3 }}
      >
        Developed by:{" "}
        <Box component="span" fontWeight="bold">
          Yug Agarwal
        </Box>{" "}
        : 22UCS233,{" "}
        <Box component="span" fontWeight="bold">
          Atharva Gulajkar
        </Box>{" "}
        : 22UCS039,{" "}
        <Box component="span" fontWeight="bold">
          Tushar
        </Box>{" "}
        : 22UCS218
      </Typography>
      <Typography
        variant="body2"
        sx={{ color: "rgba(255,255,255,0.7)", mt: 1 }}
      >
        under the esteemed guidance of{" "}
        <Box component="span" fontWeight="bold">
          Dr. Richa Priyadarshani
        </Box>
      </Typography>
    </Box>
  );
};

export default Footer;
