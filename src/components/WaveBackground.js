import React from "react";
import { Box } from "@mui/material";

// This component now mainly acts as a placeholder
// The actual background gradient is defined in App.css
const WaveBackground = () => {
  return (
    <Box
      sx={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: "100%",
        height: "100%",
        zIndex: -1,
      }}
    >
      {/* Additional overlay for subtle texture */}
      <Box
        sx={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage:
            "radial-gradient(rgba(255,255,255,0.15) 1px, transparent 1px)",
          backgroundSize: "30px 30px",
          opacity: 0.3,
        }}
      />
    </Box>
  );
};

export default WaveBackground;
