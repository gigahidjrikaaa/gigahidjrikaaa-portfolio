"use client";

import React from "react";
import { motion } from "framer-motion";

export const AboutGraphic = () => {
  return (
    <div className="relative w-full max-w-sm mx-auto pointer-events-none text-accent dark:text-accent/80 opacity-90">
      <motion.svg
        viewBox="0 0 200 200"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <motion.circle
          cx="100"
          cy="100"
          r="80"
          stroke="currentColor"
          strokeWidth="2"
          strokeDasharray="4 12"
          animate={{ rotate: 360 }}
          transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
          style={{ originX: "50%", originY: "50%" }}
        />
        
        {/* Central brain/node abstract */}
        <motion.path
          d="M80 70 A30 30 0 1 1 120 70 A40 40 0 0 1 80 130 A30 30 0 1 1 80 70 Z"
          stroke="currentColor"
          strokeWidth="3"
          fill="currentColor"
          fillOpacity="0.1"
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        />
        <circle cx="100" cy="100" r="10" fill="currentColor" />
        <line x1="100" y1="110" x2="100" y2="150" stroke="currentColor" strokeWidth="2" />
        <line x1="80" y1="130" x2="60" y2="160" stroke="currentColor" strokeWidth="2" />
        <line x1="120" y1="130" x2="140" y2="160" stroke="currentColor" strokeWidth="2" />
      </motion.svg>
    </div>
  );
};
