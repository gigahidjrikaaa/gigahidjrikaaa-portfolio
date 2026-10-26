"use client";

import React from "react";
import { motion, useReducedMotion } from "framer-motion";
import { EASE_OUT } from "@/lib/motion";

const gemPolygons = [
  "100,20 180,70 180,150 100,190 20,150 20,70",
  "100,20 100,105 180,70",
  "100,20 20,70 100,105",
  "100,105 180,150 100,190",
  "100,105 100,190 20,150",
];

/**
 * Orbital system behind the hero photo cards: the brand's node-and-orbit
 * motif drawn large. The core gem draws itself on load; rings fade in and
 * carry emerald/sky nodes on counter-rotating orbits. Everything is
 * transform/pathLength only and renders settled for reduced motion.
 */
export const HeroGraphic = () => {
  const reduceMotion = useReducedMotion();
  const drawStart = reduceMotion ? { pathLength: 1 } : { pathLength: 0 };

  return (
    <div className="relative aspect-square w-full">
      {/* Orbit rings */}
      <motion.div
        className="absolute inset-0 rounded-full border border-zinc-200"
        initial={{ opacity: 0, scale: 0.92 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.2, ease: EASE_OUT, delay: 0.3 }}
      />
      <motion.div
        className="absolute inset-[13%] rounded-full border border-dashed border-zinc-300/80"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.2, ease: EASE_OUT, delay: 0.45 }}
      />
      <motion.div
        className="absolute inset-[26%] rounded-full border border-zinc-200"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.2, ease: EASE_OUT, delay: 0.6 }}
      />

      {/* Traveling nodes: full-size carriers rotating around the center,
          each with a node pinned to the rim. */}
      <motion.div
        className="absolute inset-0"
        animate={reduceMotion ? undefined : { rotate: 360 }}
        transition={{ duration: 28, repeat: Infinity, ease: "linear" }}
      >
        <span className="absolute left-1/2 top-0 h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-emerald-500" />
      </motion.div>
      <motion.div
        className="absolute inset-[13%]"
        animate={reduceMotion ? undefined : { rotate: -360 }}
        transition={{ duration: 44, repeat: Infinity, ease: "linear" }}
      >
        <span className="absolute left-1/2 top-0 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-sky-500" />
      </motion.div>
      <motion.div
        className="absolute inset-[26%]"
        animate={reduceMotion ? undefined : { rotate: 360 }}
        transition={{ duration: 16, repeat: Infinity, ease: "linear" }}
      >
        <span className="absolute left-1/2 top-0 h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-zinc-400" />
      </motion.div>

      {/* Core gem, drawn stroke by stroke on load */}
      <motion.svg
        viewBox="0 0 200 200"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="absolute inset-0 m-auto h-[46%] w-[46%] text-zinc-300"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.5 }}
      >
        {gemPolygons.map((points) => (
          <motion.polygon
            key={points}
            points={points}
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={drawStart}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1.4, ease: EASE_OUT, delay: 0.6 }}
          />
        ))}
      </motion.svg>
    </div>
  );
};
