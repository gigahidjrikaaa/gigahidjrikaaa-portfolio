"use client";

import React from "react";
import { motion } from "framer-motion";

export const BackgroundBlob = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10">
      <motion.svg
        viewBox="0 0 800 800"
        className="absolute top-1/2 left-1/2 w-[800px] h-[800px] -translate-x-1/2 -translate-y-1/2 opacity-[0.03] dark:opacity-[0.05]"
        fill="currentColor"
        xmlns="http://www.w3.org/2000/svg"
        animate={{
          scale: [1, 1.1, 1],
          rotate: [0, 90, 180, 270, 360],
          borderRadius: ["40%", "30%", "50%", "40%"],
        }}
        transition={{
          duration: 30,
          repeat: Infinity,
          ease: "linear",
        }}
      >
        <path
          d="M660 380C660 523.594 543.594 640 400 640C256.406 640 140 523.594 140 380C140 236.406 256.406 120 400 120C543.594 120 660 236.406 660 380Z"
          fill="url(#gradient-blob)"
        />
        <defs>
          <radialGradient
            id="gradient-blob"
            cx="0"
            cy="0"
            r="1"
            gradientUnits="userSpaceOnUse"
            gradientTransform="translate(400 380) rotate(90) scale(260)"
          >
            <stop stopColor="currentColor" />
            <stop offset="1" stopColor="currentColor" stopOpacity="0" />
          </radialGradient>
        </defs>
      </motion.svg>
    </div>
  );
};
