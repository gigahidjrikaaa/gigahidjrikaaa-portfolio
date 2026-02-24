"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

/**
 * VisitorCounter — minimal floating live-visitor indicator.
 * Full visitor stats (today / total / countries) are shown in the
 * VisitorMap section further down the page.
 */
const VisitorCounter = () => {
  const [liveCount, setLiveCount] = useState<number>(0);

  useEffect(() => {
    // Simulate concurrent live visitors (client-side only to avoid hydration mismatch)
    setLiveCount(Math.floor(Math.random() * 7) + 1);
    const interval = setInterval(() => {
      setLiveCount(Math.floor(Math.random() * 7) + 1);
    }, 30_000);
    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.8, duration: 0.4, ease: "easeOut" }}
      className="flex items-center gap-2 text-xs font-medium text-gray-500"
    >
      {/* Pulsing green dot */}
      <span className="relative flex h-2 w-2 flex-shrink-0">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
        <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
      </span>
      <span>
        <span className="font-semibold text-emerald-600">{liveCount}</span>
        {" online now"}
      </span>
    </motion.div>
  );
};

export default VisitorCounter;
