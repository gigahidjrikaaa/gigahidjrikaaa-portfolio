"use client";

import { motion, useReducedMotion } from "framer-motion";
import { FaBrain, FaCubes, FaBolt, FaPalette } from "react-icons/fa";

const copy = {
  eyebrow: "What I Do",
  title: "Highlights & Focus Areas",
  subtitle:
    "A snapshot of the disciplines where I create the most impact — blending research, engineering, and design.",
  cards: [
    {
      title: "AI-Powered Experiences",
      description:
        "Building human-centered AI systems with practical NLP, responsible automation, and measurable impact.",
      icon: FaBrain,
      accent: "from-cyan-400/20 via-blue-400/10 to-transparent",
    },
    {
      title: "Blockchain & Trust Systems",
      description:
        "Designing secure, transparent architectures that scale across Web3 ecosystems and regulated use cases.",
      icon: FaCubes,
      accent: "from-pink-400/20 via-purple-400/10 to-transparent",
    },
    {
      title: "Full-Stack Delivery",
      description:
        "Shipping performant web apps with delightful UX, robust APIs, and clear operational visibility.",
      icon: FaBolt,
      accent: "from-amber-400/20 via-orange-400/10 to-transparent",
    },
    {
      title: "Visual Product Design",
      description:
        "Crafting immersive interfaces, motion systems, and visual storytelling that elevates personal brands.",
      icon: FaPalette,
      accent: "from-emerald-400/20 via-teal-400/10 to-transparent",
    },
  ],
};

const Highlights = () => {
  const reduceMotion = useReducedMotion();

  return (
    <section id="highlights" className="relative overflow-hidden bg-[#05070f] py-16 sm:py-24">
      <div className="absolute inset-0">
        <div className="absolute -top-32 right-0 h-72 w-72 rounded-full bg-cyan-500/10 blur-3xl" />
        <div className="absolute -bottom-24 left-0 h-80 w-80 rounded-full bg-pink-500/10 blur-3xl" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.08),_transparent_45%)]" />
      </div>

      <div className="container relative z-10 mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 20 }}
          whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="mx-auto max-w-3xl text-center"
        >
          <span className="text-xs font-semibold uppercase tracking-[0.3em] text-cyan-300/80">
            {copy.eyebrow}
          </span>
          <h2 className="mt-4 text-3xl font-bold text-white sm:text-4xl lg:text-5xl">
            {copy.title}
          </h2>
          <p className="mt-4 text-base text-gray-300 sm:text-lg">
            {copy.subtitle}
          </p>
        </motion.div>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {copy.cards.map((card, index) => (
            <motion.div
              key={card.title}
              initial={reduceMotion ? false : { opacity: 0, y: 24 }}
              whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.6, delay: index * 0.1, ease: "easeOut" }}
              className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-6 shadow-[0_0_30px_rgba(14,165,233,0.1)] backdrop-blur-lg"
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${card.accent} opacity-0 transition-opacity duration-500 group-hover:opacity-100`} />
              <div className="relative z-10">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-white/10 bg-white/10 text-cyan-200">
                  <card.icon aria-hidden="true" className="h-5 w-5" />
                </div>
                <h3 className="mt-6 text-lg font-semibold text-white">{card.title}</h3>
                <p className="mt-3 text-sm text-gray-300">{card.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Highlights;
