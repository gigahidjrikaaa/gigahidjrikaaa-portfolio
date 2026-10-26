"use client";

import { Fragment } from "react";
import { motion } from "framer-motion";
import { EASE_OUT } from "@/lib/motion";

const words = [
  { text: "Know", className: "text-zinc-900" },
  { text: "more", className: "text-zinc-400" },
];

/**
 * The /more page headline: each word rises out of a clip mask on load,
 * and the period is the brand's emerald dot, landing last.
 * The accessible text stays "Know more." via aria-label; the visible
 * words are decorative spans, so the dot needs no aria-hidden of its own.
 */
const KnowMoreHeadline = () => (
  <h1
    className="mt-6 max-w-2xl text-4xl font-medium tracking-tight text-zinc-900 md:text-5xl"
    aria-label="Know more."
  >
    {words.map((word, i) => (
      <Fragment key={word.text}>
        {i > 0 && " "}
        <span
          aria-hidden
          className="inline-block overflow-hidden align-bottom pb-[0.1em] -mb-[0.1em]"
        >
          <motion.span
            className={`inline-block ${word.className}`}
            initial={{ y: "110%" }}
            animate={{ y: 0 }}
            transition={{ duration: 0.7, ease: EASE_OUT, delay: 0.15 + i * 0.12 }}
          >
            {word.text}
          </motion.span>
        </span>
      </Fragment>
    ))}
    <motion.span
      className="ml-[0.1em] inline-block h-[0.16em] w-[0.16em] rounded-full bg-emerald-500"
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ duration: 0.4, ease: EASE_OUT, delay: 0.6 }}
    />
  </h1>
);

export default KnowMoreHeadline;
