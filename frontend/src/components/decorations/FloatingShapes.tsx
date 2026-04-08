"use client";

import React from "react";
import { motion } from "framer-motion";

export const FloatingShapes = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10">
      {/* Circle 1 */}
      <motion.svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 100 100"
        className="absolute top-[20%] left-[10%] w-16 h-16 text-primary/10 dark:text-primary/20"
        fill="currentColor"
        animate={{ y: [0, -30, 0], rotate: [0, 90, 180] }}
        transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
      >
        <circle cx="50" cy="50" r="40" />
      </motion.svg>

      {/* Square */}
      <motion.svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 100 100"
        className="absolute top-[60%] right-[15%] w-12 h-12 text-accent/10 dark:text-accent/20"
        fill="none"
        stroke="currentColor"
        strokeWidth="6"
        animate={{ y: [0, 40, 0], rotate: [45, 135, 225] }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut", delay: 2 }}
      >
        <rect x="20" y="20" width="60" height="60" rx="10" />
      </motion.svg>

      {/* Hexagon */}
      <motion.svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 100 100"
        className="absolute bottom-[20%] left-[30%] w-20 h-20 text-secondary/10 dark:text-secondary/20"
        fill="none"
        stroke="currentColor"
        strokeWidth="4"
        animate={{ x: [0, 30, 0], rotate: [0, -90, -180] }}
        transition={{ duration: 20, repeat: Infinity, ease: "easeInOut", delay: 1 }}
      >
        <polygon points="50,15 80,32 80,68 50,85 20,68 20,32" />
      </motion.svg>
    </div>
  );
};
