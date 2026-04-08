"use client";

import React from "react";
import { motion } from "framer-motion";

export const EducationGraphic = () => {
  return (
    <div className="relative w-full max-w-sm mx-auto pointer-events-none text-accent dark:text-accent/70 opacity-90">
      <motion.svg
        viewBox="0 0 200 200"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        animate={{ y: [0, -10, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
      >
        {/* Abstract books/pages */}
        <motion.path
          d="M100 40 L160 70 L100 100 L40 70 Z"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinejoin="round"
          fill="currentColor"
          fillOpacity="0.1"
        />
        <motion.path
          d="M40 90 L100 120 L160 90"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          animate={{ y: [0, 5, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.path
          d="M40 110 L100 140 L160 110"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
        />

        {/* Floating particles */}
        <motion.circle cx="150" cy="40" r="3" fill="currentColor" animate={{ y: [0, -20], opacity: [1, 0] }} transition={{ duration: 2, repeat: Infinity }} />
        <motion.circle cx="130" cy="20" r="2" fill="currentColor" animate={{ y: [0, -15], opacity: [1, 0] }} transition={{ duration: 2.5, repeat: Infinity, delay: 0.5 }} />
        <motion.circle cx="60" cy="30" r="4" fill="currentColor" animate={{ y: [0, -25], opacity: [1, 0] }} transition={{ duration: 3, repeat: Infinity, delay: 1 }} />
      </motion.svg>
    </div>
  );
};
