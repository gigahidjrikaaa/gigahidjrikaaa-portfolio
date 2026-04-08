"use client";

import React from "react";
import { motion } from "framer-motion";

export const ExperienceGraphic = () => {
  return (
    <div className="relative w-full max-w-sm mx-auto pointer-events-none text-primary dark:text-primary/70 opacity-90">
      <motion.svg
        viewBox="0 0 200 200"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Timeline Path */}
        <motion.path
          d="M20 150 L60 110 L100 130 L160 50"
          stroke="currentColor"
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 4, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }}
        />
        
        {/* Nodes */}
        <motion.circle cx="20" cy="150" r="6" fill="currentColor" animate={{ scale: [1, 1.5, 1] }} transition={{ duration: 2, repeat: Infinity }} />
        <motion.circle cx="60" cy="110" r="6" fill="currentColor" animate={{ scale: [1, 1.5, 1] }} transition={{ duration: 2, repeat: Infinity, delay: 0.5 }} />
        <motion.circle cx="100" cy="130" r="6" fill="currentColor" animate={{ scale: [1, 1.5, 1] }} transition={{ duration: 2, repeat: Infinity, delay: 1 }} />
        <motion.circle cx="160" cy="50" r="8" fill="currentColor" className="text-accent" animate={{ scale: [1, 1.5, 1], boxShadow: ["0px 0px 0px 0px currentColor", "0px 0px 20px 5px currentColor", "0px 0px 0px 0px currentColor"] }} transition={{ duration: 2, repeat: Infinity, delay: 1.5 }} />
        
        {/* Abstract gear / structure in background */}
        <motion.g
          animate={{ rotate: 360 }}
          transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
          style={{ originX: "50%", originY: "50%" }}
          className="text-secondary/20"
        >
          <circle cx="100" cy="100" r="80" stroke="currentColor" strokeWidth="1" strokeDasharray="5 15" />
          <circle cx="100" cy="100" r="60" stroke="currentColor" strokeWidth="2" strokeDasharray="10 20" />
        </motion.g>
      </motion.svg>
    </div>
  );
};
