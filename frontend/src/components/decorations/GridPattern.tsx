"use client";

import React from "react";
import { motion } from "framer-motion";

export const GridPattern = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none -z-20">
      <motion.svg
        className="absolute inset-0 w-full h-full opacity-[0.02] dark:opacity-[0.03]"
        xmlns="http://www.w3.org/2000/svg"
        animate={{ opacity: [0.01, 0.03, 0.01] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      >
        <defs>
          <pattern
            id="dotted-grid"
            width="40"
            height="40"
            patternUnits="userSpaceOnUse"
          >
            <circle cx="2" cy="2" r="1.5" fill="currentColor" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#dotted-grid)" />
      </motion.svg>
      {/* Gradient Mask to fade out edges */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/50 to-background pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-r from-background via-transparent to-background pointer-events-none" />
    </div>
  );
};
