import React from "react";
import { Box } from "@mui/material";

const LnmiitLogo = ({ width = 200, height = 60, alt = "LNMIIT Logo" }) => {
  return (
    <Box
      component="img"
      src="/images/LNMIIT-logo.png"
      alt={alt}
      width={width}
      height={height}
      sx={{
        objectFit: "contain",
        flexShrink: 0,
      }}
    />
  );
};

export default LnmiitLogo;
