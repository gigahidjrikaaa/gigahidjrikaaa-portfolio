"use client";

import React from "react";
import { motion } from "framer-motion";

export const HeroGraphic = () => {
  return (
    <div className="relative w-full max-w-sm mx-auto pointer-events-none text-primary dark:text-primary/80 opacity-80 backdrop-blur-3xl">
      <motion.svg
        viewBox="0 0 200 200"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        animate={{ y: [0, -15, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
      >
        {/* Core geometry representing tech/innovation */}
        <polygon
          points="100,20 180,70 180,150 100,190 20,150 20,70"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <polygon
          points="100,20 100,105 180,70"
          stroke="currentColor"
          strokeWidth="2"
        />
        <polygon
          points="100,20 20,70 100,105"
          stroke="currentColor"
          strokeWidth="2"
        />
        <polygon
          points="100,105 180,150 100,190"
          stroke="currentColor"
          strokeWidth="2"
        />
        <polygon
          points="100,105 100,190 20,150"
          stroke="currentColor"
          strokeWidth="2"
        />
        
        {/* Orbit ring around the gem */}
        <motion.circle
          cx="100"
          cy="105"
          r="90"
          stroke="currentColor"
          strokeWidth="1"
          strokeDasharray="10 20"
          animate={{ rotate: [0, 360] }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          style={{ originX: "50%", originY: "50%" }}
        />
      </motion.svg>
    </div>
  );
};
