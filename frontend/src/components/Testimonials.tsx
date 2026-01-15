"use client";

import { motion, useReducedMotion } from "framer-motion";
import { FaQuoteLeft } from "react-icons/fa";

const copy = {
  eyebrow: "Social Proof",
  title: "Testimonials & Collaborations",
  subtitle:
    "A few words from peers, mentors, and collaborators who have worked alongside me.",
  testimonials: [
    {
      quote:
        "Giga consistently bridges complex engineering goals with clean, thoughtful user experiences. His delivery velocity is rare.",
      name: "Dina Pratama",
      role: "Product Lead, UGM-AICare",
    },
    {
      quote:
        "Reliable, proactive, and exceptionally curious. He quickly translates research into deployable systems.",
      name: "Rizky Mahendra",
      role: "AI Research Mentor",
    },
    {
      quote:
        "An outstanding collaborator who owns the problem and elevates the team with clear communication.",
      name: "Kevin Santoso",
      role: "Full-Stack Engineer",
    },
  ],
};

const Testimonials = () => {
  const reduceMotion = useReducedMotion();

  return (
    <section id="testimonials" className="relative overflow-hidden bg-gradient-to-b from-[#0b0d17] via-[#0a0f1f] to-[#0b0d17] py-16 sm:py-24">
      <div className="absolute inset-0">
        <div className="absolute left-1/2 top-0 h-72 w-72 -translate-x-1/2 rounded-full bg-cyan-500/10 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-72 w-72 rounded-full bg-pink-500/10 blur-3xl" />
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

        <div className="mt-12 grid gap-6 lg:grid-cols-3">
          {copy.testimonials.map((item, index) => (
            <motion.figure
              key={item.name}
              initial={reduceMotion ? false : { opacity: 0, y: 24 }}
              whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.6, delay: index * 0.1, ease: "easeOut" }}
              className="relative rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-lg"
            >
              <div className="absolute right-6 top-6 text-cyan-300/30">
                <FaQuoteLeft aria-hidden="true" className="h-8 w-8" />
              </div>
              <blockquote className="text-sm leading-relaxed text-gray-200">“{item.quote}”</blockquote>
              <figcaption className="mt-6">
                <div className="text-base font-semibold text-white">{item.name}</div>
                <div className="text-xs text-cyan-200/80">{item.role}</div>
              </figcaption>
            </motion.figure>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
