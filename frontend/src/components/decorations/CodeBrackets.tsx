"use client";

import React from "react";
import { motion } from "framer-motion";

export const CodeBrackets = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10 group">
      {/* Left Bracket */}
      <motion.svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="absolute top-1/4 left-[5%] w-24 h-24 text-primary/5 dark:text-primary/10"
        animate={{ y: [0, 15, 0], opacity: [0.05, 0.1, 0.05] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
      >
        <path d="M16 18l6-6-6-6" />
        <path d="M8 6l-6 6 6 6" />
      </motion.svg>

      {/* Curly Braces */}
      <motion.svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="absolute bottom-1/4 right-[10%] w-32 h-32 text-accent/5 dark:text-accent/10"
        animate={{ y: [0, -20, 0], rotate: [0, -5, 0] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 1 }}
      >
        <path d="M7 4a2 2 0 0 0-2 2v3a2 3 0 0 1-2 3 2 3 0 0 1 2 3v3a2 2 0 0 0 2 2" />
        <path d="M17 4a2 2 0 0 1 2 2v3a2 3 0 0 0 2 3 2 3 0 0 0-2 3v3a2 2 0 0 1-2 2" />
      </motion.svg>
    </div>
  );
};
