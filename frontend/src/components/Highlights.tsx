"use client";

import { motion, useReducedMotion } from "framer-motion";

const copy = {
  eyebrow: "GLOBAL REACH",
  title: "Remote-First — Worldwide Collaboration",
  subtitle:
    "Remote-first workflows with reliable handoffs, clear documentation, and global-friendly schedules.",
  stats: [
    { number: "02", label: "Continents covered" },
    { number: "08", label: "Timezone overlap hours" },
    { number: "10", label: "Projects delivered" },
  ],
  insight: {
    title: "MARKET INSIGHT",
    body: "Async-first communication paired with strategic overlap windows ensures fast iteration and minimal blockers. Ideal for distributed teams shipping products worldwide.",
  },
};

const Highlights = () => {
  const reduceMotion = useReducedMotion();

  return (
    <section
      id="highlights"
      className="relative overflow-hidden bg-gray-900 py-24 md:py-32"
    >
      {/* Background image overlay */}
      <div
        className="pointer-events-none absolute inset-0 bg-cover bg-center opacity-30"
        style={{ backgroundImage: "url('/hero-bg.jpg')" }}
      />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-gray-900/90 via-gray-900/70 to-gray-900/50" />

      <div className="container relative z-10 mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 24 }}
          whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="grid items-end gap-12 lg:grid-cols-2"
        >
          {/* Left: Text */}
          <div className="space-y-6">
            <span className="text-xs font-semibold uppercase tracking-[0.25em] text-gray-400">
              {copy.eyebrow}
            </span>
            <h2 className="text-3xl font-semibold leading-tight text-white sm:text-4xl lg:text-5xl">
              {copy.title}
            </h2>
            <p className="max-w-md text-gray-400">{copy.subtitle}</p>

            {/* Stat row */}
            <div className="flex flex-wrap gap-10 pt-4">
              {copy.stats.map((s, i) => (
                <div key={i} className="flex items-baseline gap-2">
                  <span className="text-4xl font-bold text-white">{s.number}</span>
                  <span className="max-w-[100px] text-xs uppercase leading-tight tracking-widest text-gray-400">
                    {s.label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Insight card */}
          <motion.div
            initial={reduceMotion ? false : { opacity: 0, y: 24 }}
            whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="rounded-[28px] border border-white/10 bg-white/5 p-6 backdrop-blur-md"
          >
            <div className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-400">
              {copy.insight.title}
            </div>
            <p className="mt-3 text-sm leading-relaxed text-gray-300">
              {copy.insight.body}
            </p>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default Highlights;
