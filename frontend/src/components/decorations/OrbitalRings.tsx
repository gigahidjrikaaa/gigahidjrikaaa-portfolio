"use client";

import React from "react";
import { motion } from "framer-motion";

export const OrbitalRings = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10 flex items-center justify-center">
      <motion.svg
        viewBox="0 0 400 400"
        className="absolute w-[400px] h-[400px] text-primary/10 dark:text-primary/20"
        animate={{ rotate: 360 }}
        transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
      >
        <circle
          cx="200"
          cy="200"
          r="150"
          fill="none"
          stroke="currentColor"
          strokeWidth="1"
          strokeDasharray="4 8"
        />
        <circle cx="50" cy="200" r="4" fill="currentColor" />
        <circle cx="350" cy="200" r="4" fill="currentColor" />
      </motion.svg>

      <motion.svg
        viewBox="0 0 400 400"
        className="absolute w-[300px] h-[300px] text-accent/10 dark:text-accent/20"
        animate={{ rotate: -360 }}
        transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
      >
        <circle
          cx="200"
          cy="200"
          r="100"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeDasharray="10 15"
        />
        <circle cx="100" cy="200" r="6" fill="currentColor" />
      </motion.svg>
    </div>
  );
};
