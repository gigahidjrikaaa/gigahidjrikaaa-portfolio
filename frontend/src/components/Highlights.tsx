"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowUpRight, ExternalLink } from "lucide-react";

const modes = [
  {
    index: "01",
    type: "Full-Time",
    title: "Senior / Lead Role",
    tagline: "Small team, high ownership, meaningful product.",
    description:
      "Open to senior or lead engineering positions at product companies. I thrive where engineering quality matters and people care about what they ship.",
    note: "Remote or hybrid · Equity welcome",
    cta: { label: "Get in touch", href: "#contact", external: false },
    highlight: false,
  },
  {
    index: "02",
    type: "Freelance",
    title: "Contract Work",
    tagline: "I scope it, build it, hand it off clean.",
    description:
      "Available for short-to-mid-term contracts. Web apps, AI integrations, backend systems, performance work — anything full-stack.",
    note: "Web · AI · APIs · Code audits",
    cta: { label: "Request a quote", href: "#contact", external: false },
    highlight: false,
  },
  {
    index: "03",
    type: "Full Team",
    title: "Project-Based via PT Sumbu Inovasi Digital",
    tagline: "Officially contracted. Full team. End-to-end.",
    description:
      "As founder & tech lead of PT Sumbu Inovasi Digital — a registered Indonesian tech company — I can take on larger projects with a team covering design, frontend, backend, and AI. Properly invoiced and contracted.",
    note: "Official PT · Full-stack team · Design to deployment",
    cta: { label: "Visit sumbu.xyz", href: "https://sumbu.xyz", external: true },
    ctaSecondary: { label: "Get a quote", href: "#contact" },
    highlight: true,
  },
];

const Highlights = () => {
  const reduceMotion = useReducedMotion();

  return (
    <section
      id="highlights"
      className="relative overflow-hidden bg-zinc-950 py-24 md:py-32"
    >
      <div className="container relative z-10 mx-auto px-4 sm:px-6 lg:px-8">

        {/* ── Header ────────────────────────────────────────────── */}
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 16 }}
          whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="mb-16 grid gap-6 lg:grid-cols-2 lg:items-end"
        >
          <div>
            <span className="text-[11px] font-semibold uppercase tracking-[0.3em] text-zinc-500">
              Availability
            </span>
            <h2 className="mt-3 text-4xl font-semibold leading-[1.1] tracking-tight text-white sm:text-5xl lg:text-6xl">
              Available now.
              <br />
              <span className="text-zinc-500">Three ways to work.</span>
            </h2>
          </div>
          <p className="max-w-md text-base leading-relaxed text-zinc-400 lg:text-right">
            Whether you need a single engineer or a full development team,
            there&apos;s an engagement that fits.
          </p>
        </motion.div>

        {/* ── Mode rows ─────────────────────────────────────────── */}
        <div className="divide-y divide-zinc-800/60 border-t border-zinc-800/60">
          {modes.map((mode, i) => (
            <motion.div
              key={mode.index}
              initial={reduceMotion ? false : { opacity: 0, y: 12 }}
              whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.15 }}
              transition={{ duration: 0.45, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] }}
              className={`group relative py-8 transition-colors duration-200 ${
                mode.highlight
                  ? "before:absolute before:inset-y-0 before:left-0 before:w-[3px] before:bg-emerald-500 pl-6"
                  : ""
              }`}
            >
              <div className="grid gap-4 sm:grid-cols-[auto_1fr] sm:gap-8 lg:grid-cols-[80px_1fr_auto] lg:items-center lg:gap-12">

                {/* Index + type */}
                <div className="flex items-center gap-3 sm:flex-col sm:items-start sm:gap-0">
                  <span className="font-mono text-xs text-zinc-600">{mode.index}</span>
                  <span className={`sm:mt-1 text-[11px] font-semibold uppercase tracking-[0.2em] ${
                    mode.highlight ? "text-emerald-500" : "text-zinc-500"
                  }`}>
                    {mode.type}
                  </span>
                </div>

                {/* Main content */}
                <div className="space-y-2">
                  <div className="flex flex-wrap items-baseline gap-x-3">
                    <h3 className="text-lg font-semibold text-white sm:text-xl">
                      {mode.title}
                    </h3>
                    <span className="text-sm text-zinc-500">{mode.tagline}</span>
                  </div>
                  <p className="text-sm leading-relaxed text-zinc-400 max-w-xl">
                    {mode.description}
                  </p>
                  <p className="text-xs text-zinc-600">{mode.note}</p>

                  {/* Mobile CTAs */}
                  <div className="flex flex-wrap gap-2 pt-1 sm:hidden">
                    {mode.cta.external ? (
                      <a
                        href={mode.cta.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-sm font-medium text-emerald-400 hover:text-emerald-300 transition-colors"
                      >
                        {mode.cta.label}
                        <ExternalLink size={13} />
                      </a>
                    ) : (
                      <Link
                        href={mode.cta.href}
                        className="inline-flex items-center gap-1.5 text-sm font-medium text-zinc-300 hover:text-white transition-colors"
                      >
                        {mode.cta.label}
                        <ArrowUpRight size={13} />
                      </Link>
                    )}
                    {"ctaSecondary" in mode && mode.ctaSecondary && (
                      <Link
                        href={mode.ctaSecondary.href}
                        className="inline-flex items-center gap-1.5 text-sm text-zinc-500 hover:text-zinc-300 transition-colors"
                      >
                        {mode.ctaSecondary.label}
                        <ArrowUpRight size={13} />
                      </Link>
                    )}
                  </div>
                </div>

                {/* Desktop CTAs */}
                <div className="hidden flex-col items-end gap-2 sm:flex">
                  {mode.cta.external ? (
                    <a
                      href={mode.cta.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border border-emerald-500/40 px-4 py-2 text-sm font-medium text-emerald-400 transition-all hover:border-emerald-400/60 hover:text-emerald-300"
                    >
                      {mode.cta.label}
                      <ExternalLink size={13} />
                    </a>
                  ) : (
                    <Link
                      href={mode.cta.href}
                      className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border border-zinc-700 px-4 py-2 text-sm font-medium text-zinc-300 transition-all hover:border-zinc-500 hover:text-white"
                    >
                      {mode.cta.label}
                      <ArrowUpRight size={13} />
                    </Link>
                  )}
                  {"ctaSecondary" in mode && mode.ctaSecondary && (
                    <Link
                      href={mode.ctaSecondary.href}
                      className="inline-flex items-center gap-1.5 text-xs text-zinc-500 transition-colors hover:text-zinc-300"
                    >
                      {mode.ctaSecondary.label}
                      <ArrowUpRight size={11} />
                    </Link>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* ── PT Sumbu banner ───────────────────────────────────── */}
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 12 }}
          whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.45, delay: 0.32, ease: [0.22, 1, 0.36, 1] }}
          className="mt-10 flex flex-col items-start justify-between gap-4 rounded-2xl border border-zinc-800 bg-zinc-900/60 px-6 py-5 sm:flex-row sm:items-center"
        >
          <div>
            <p className="text-sm font-semibold text-white">PT Sumbu Inovasi Digital</p>
            <p className="mt-0.5 text-xs text-zinc-500">
              Registered Indonesian tech company &middot; Official invoicing &middot; Full-stack team
            </p>
          </div>
          <div className="flex items-center gap-3">
            <a
              href="https://sumbu.xyz"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/40 px-4 py-2 text-sm font-medium text-emerald-400 transition-all hover:border-emerald-400/60 hover:text-emerald-300"
            >
              sumbu.xyz
              <ExternalLink size={13} />
            </a>
            <Link
              href="#contact"
              className="inline-flex items-center gap-1.5 rounded-full border border-zinc-700 px-4 py-2 text-sm font-medium text-zinc-300 transition-all hover:border-zinc-500 hover:text-white"
            >
              Get a quote
              <ArrowUpRight size={13} />
            </Link>
          </div>
        </motion.div>

      </div>
    </section>
  );
};

export default Highlights;
