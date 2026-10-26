"use client";

import { motion } from "framer-motion";
import { ArrowDownRight } from "lucide-react";

interface CircularBadgeProps {
  className?: string;
}

/**
 * Rotating circular text badge (Snellenberg-style) with an arrow pinned
 * at its center. Pure transform rotation; reduce-motion renders it static.
 */
const CircularBadge = ({ className }: CircularBadgeProps) => (
  <div className={`relative ${className ?? ""}`} aria-hidden>
    <motion.svg
      viewBox="0 0 100 100"
      className="h-full w-full"
      animate={{ rotate: 360 }}
      transition={{ duration: 22, repeat: Infinity, ease: "linear" }}
    >
      <defs>
        <path
          id="badge-circle-path"
          d="M50,50 m-38,0 a38,38 0 1,1 76,0 a38,38 0 1,1 -76,0"
          fill="none"
        />
      </defs>
      <text
        className="fill-zinc-500 uppercase"
        style={{ fontSize: "8px", letterSpacing: "2.6px", fontWeight: 600 }}
      >
        <textPath href="#badge-circle-path">
          Available for work • Let&apos;s build •
        </textPath>
      </text>
    </motion.svg>
    <span className="absolute inset-0 flex items-center justify-center">
      <ArrowDownRight className="h-5 w-5 text-zinc-700" strokeWidth={1.75} />
    </span>
  </div>
);

export default CircularBadge;
