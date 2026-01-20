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
    <section id="testimonials" className="relative overflow-hidden bg-[#f7f7f5] py-16 sm:py-24">
      <div className="absolute inset-0">
        <div className="absolute left-1/2 top-0 h-72 w-72 -translate-x-1/2 rounded-full bg-cyan-200/50 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-72 w-72 rounded-full bg-pink-200/50 blur-3xl" />
      </div>

      <div className="container relative z-10 mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 20 }}
          whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="mx-auto max-w-3xl text-center"
        >
          <span className="text-xs font-semibold uppercase tracking-[0.3em] text-gray-500">
            {copy.eyebrow}
          </span>
          <h2 className="mt-4 text-3xl font-semibold text-gray-900 sm:text-4xl lg:text-5xl">
            {copy.title}
          </h2>
          <p className="mt-4 text-base text-gray-600 sm:text-lg">
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
              className="relative rounded-3xl border border-gray-200/70 bg-white p-6 shadow-[0_20px_40px_rgba(15,23,42,0.08)]"
            >
              <div className="absolute right-6 top-6 text-gray-200">
                <FaQuoteLeft aria-hidden="true" className="h-8 w-8" />
              </div>
              <blockquote className="text-sm leading-relaxed text-gray-600">“{item.quote}”</blockquote>
              <figcaption className="mt-6">
                <div className="text-base font-semibold text-gray-900">{item.name}</div>
                <div className="text-xs text-gray-500">{item.role}</div>
              </figcaption>
            </motion.figure>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
