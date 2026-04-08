"use client";

import React from "react";
import { motion } from "framer-motion";

export const ProjectsGraphic = () => {
  return (
    <div className="relative w-full max-w-sm mx-auto pointer-events-none text-secondary dark:text-secondary/70 opacity-80">
      <motion.svg
        viewBox="0 0 200 200"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        animate={{ y: [0, -10, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
      >
        {/* Back window */}
        <rect x="50" y="30" width="120" height="90" rx="8" stroke="currentColor" strokeWidth="2" fill="currentColor" fillOpacity="0.05" />
        <circle cx="65" cy="45" r="3" fill="currentColor" />
        <circle cx="75" cy="45" r="3" fill="currentColor" />
        <circle cx="85" cy="45" r="3" fill="currentColor" />
        
        {/* Front window */}
        <motion.g
          animate={{ y: [0, 5, 0], x: [0, -5, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        >
          <rect x="25" y="70" width="130" height="100" rx="8" stroke="currentColor" strokeWidth="3" fill="currentColor" fillOpacity="0.1" className="bg-background" />
          <circle cx="40" cy="85" r="3" fill="currentColor" />
          <circle cx="50" cy="85" r="3" fill="currentColor" />
          <circle cx="60" cy="85" r="3" fill="currentColor" />
          <line x1="40" y1="110" x2="90" y2="110" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
          <line x1="40" y1="130" x2="130" y2="130" stroke="currentColor" strokeWidth="2" strokeDasharray="6 6" />
          <line x1="40" y1="145" x2="100" y2="145" stroke="currentColor" strokeWidth="2" />
        </motion.g>
      </motion.svg>
    </div>
  );
};
