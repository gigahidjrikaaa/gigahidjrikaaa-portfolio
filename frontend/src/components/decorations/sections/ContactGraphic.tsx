"use client";

import React from "react";
import { motion } from "framer-motion";

export const ContactGraphic = () => {
  return (
    <div className="relative w-full max-w-sm mx-auto pointer-events-none text-primary dark:text-primary/80 opacity-90">
      <motion.svg
        viewBox="0 0 200 200"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Dashed trajectory line */}
        <motion.path
          d="M20 180 Q 80 160 120 100 T 180 30"
          stroke="currentColor"
          strokeWidth="2"
          strokeDasharray="6 6"
          fill="none"
          className="text-secondary/50"
        />
        
        {/* Paper Plane */}
        <motion.g
          animate={{
            x: [0, 20, 0],
            y: [0, -10, 0],
            rotate: [0, 5, 0]
          }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        >
          <path
            d="M80 120 L160 40 L100 140 Z"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinejoin="round"
            fill="currentColor"
            fillOpacity="0.2"
          />
          <path
            d="M80 120 L160 40 L60 80 Z"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinejoin="round"
          />
          <path
            d="M80 120 L100 140 L90 160 Z"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinejoin="round"
            fill="currentColor"
          />
        </motion.g>

        {/* Subtle background pulse */}
        <motion.circle
          cx="160"
          cy="40"
          r="40"
          fill="currentColor"
          className="text-accent/10"
          animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        />
      </motion.svg>
    </div>
  );
};
