import React from "react";
import { Box } from "@mui/material";
import { motion } from "framer-motion";

const WaveBackground = () => {
  return (
    <Box
      sx={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        overflow: "hidden",
        zIndex: -1,
        background:
          "linear-gradient(135deg, #5c6bc0 0%, #3949ab 50%, #283593 100%)",
      }}
    >
      <motion.div
        style={{
          position: "absolute",
          width: "100%",
          height: "100%",
          background:
            "linear-gradient(135deg, rgba(156, 39, 176, 0.3) 0%, rgba(103, 58, 183, 0.3) 50%, rgba(63, 81, 181, 0.3) 100%)",
          opacity: 0.5,
        }}
        animate={{
          scale: [1, 1.2, 1],
          rotate: [0, 5, 0],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      <motion.div
        style={{
          position: "absolute",
          width: "100%",
          height: "100%",
          background:
            "linear-gradient(135deg, rgba(103, 58, 183, 0.3) 0%, rgba(63, 81, 181, 0.3) 50%, rgba(156, 39, 176, 0.3) 100%)",
          opacity: 0.3,
        }}
        animate={{
          scale: [1.2, 1, 1.2],
          rotate: [5, 0, 5],
        }}
        transition={{
          duration: 15,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
    </Box>
  );
};

export default WaveBackground;
