"use client";

import { motion, useReducedMotion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { StarIcon } from "@heroicons/react/24/solid";
import LoadingAnimation from "@/components/ui/LoadingAnimation";
import { apiService, TestimonialResponse } from "@/services/api";

// ─── Copy ─────────────────────────────────────────────────────────────────────

const copy = {
  eyebrow: "Social Proof",
  title: "Testimonials",
  subtitle: "Words from people I've built, shipped, and learned with.",
  loading: "Loading testimonials...",
  empty: "No testimonials yet — be the first.",
  ctaText: "Worked with me?",
  ctaLink: "Leave a testimonial →",
};

// ─── Avatar ───────────────────────────────────────────────────────────────────

const AVATAR_GRADIENTS = [
  "from-sky-500 to-indigo-600",
  "from-violet-500 to-purple-700",
  "from-emerald-500 to-teal-600",
  "from-rose-500 to-pink-600",
  "from-amber-500 to-orange-600",
  "from-cyan-500 to-blue-600",
];

function Avatar({ item, index, size = "md" }: { item: TestimonialResponse; index: number; size?: "sm" | "md" | "lg" }) {
  const grad = AVATAR_GRADIENTS[index % AVATAR_GRADIENTS.length];
  const dim = size === "lg" ? "h-14 w-14 text-xl" : size === "sm" ? "h-8 w-8 text-xs" : "h-10 w-10 text-sm";

  if (item.avatar_url) {
    return (
      <div className={`relative flex-shrink-0 overflow-hidden rounded-full ${dim}`}>
        <Image src={item.avatar_url} alt={item.name} fill className="object-cover" />
      </div>
    );
  }
  return (
    <div
      className={`flex flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br font-semibold text-white ${grad} ${dim}`}
    >
      {item.name.charAt(0)}
    </div>
  );
}

// ─── Star rating row ──────────────────────────────────────────────────────────

function Stars({ rating, size = 4 }: { rating: number; size?: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <StarIcon
          key={i}
          className={`h-${size} w-${size} ${i < rating ? "text-amber-400" : "text-white/10"}`}
        />
      ))}
    </div>
  );
}

// ─── Featured (hero) testimonial card ────────────────────────────────────────

function FeaturedCard({ item, reduceMotion, index }: { item: TestimonialResponse; reduceMotion: boolean | null; index: number }) {
  return (
    <motion.figure
      initial={reduceMotion ? false : { opacity: 0, y: 28 }}
      whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.35 }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      className="relative col-span-full overflow-hidden rounded-3xl bg-gradient-to-br from-slate-800 to-slate-900 p-8 sm:p-12 ring-1 ring-white/10"
    >
      {/* Giant decorative quote mark */}
      <span
        aria-hidden
        className="pointer-events-none absolute right-8 top-4 select-none font-serif text-[10rem] leading-none text-white/5 sm:right-12 sm:text-[14rem]"
      >
        &ldquo;
      </span>

      <div className="relative z-10 flex flex-col gap-6 sm:flex-row sm:items-start sm:gap-10">
        {/* Left: author */}
        <div className="flex flex-col items-center gap-3 sm:w-40 sm:flex-shrink-0 sm:items-start">
          <Avatar item={item} index={index} size="lg" />
          <div>
            <p className="font-semibold text-white">
              {item.linkedin_url ? (
                <a href={item.linkedin_url} target="_blank" rel="noopener noreferrer" className="hover:underline">
                  {item.name}
                </a>
              ) : (
                item.name
              )}
            </p>
            <p className="mt-0.5 text-xs text-slate-400">
              {item.role}
              {item.company && ` · ${item.company}`}
            </p>
          </div>
          {item.rating && <Stars rating={item.rating} size={4} />}
          {item.project_relation && (
            <span className="rounded-full bg-sky-500/15 px-3 py-1 text-[11px] font-medium text-sky-300">
              {item.project_relation}
            </span>
          )}
        </div>

        {/* Right: quote */}
        <blockquote className="flex-1 text-lg font-light italic leading-relaxed text-slate-200 sm:text-xl">
          &ldquo;{item.content}&rdquo;
        </blockquote>
      </div>
    </motion.figure>
  );
}

// ─── Regular testimonial card ─────────────────────────────────────────────────

function TestimonialCard({ item, reduceMotion, index, delay }: { item: TestimonialResponse; reduceMotion: boolean | null; index: number; delay: number }) {
  return (
    <motion.figure
      initial={reduceMotion ? false : { opacity: 0, y: 24 }}
      whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
      className="flex flex-col rounded-2xl bg-slate-800/60 p-6 ring-1 ring-white/8 hover:ring-white/18 transition-all duration-300"
    >
      {/* Rating */}
      {item.rating && (
        <div className="mb-4">
          <Stars rating={item.rating} size={3} />
        </div>
      )}

      {/* Quote */}
      <blockquote className="flex-1 text-sm leading-relaxed text-slate-300 italic">
        &ldquo;{item.content}&rdquo;
      </blockquote>

      {/* Context tag */}
      {item.project_relation && (
        <div className="mt-4">
          <span className="rounded-full bg-white/8 px-2.5 py-1 text-[11px] font-medium text-slate-400">
            {item.project_relation}
          </span>
        </div>
      )}

      {/* Author */}
      <figcaption className="mt-5 flex items-center gap-3 border-t border-white/8 pt-5">
        <Avatar item={item} index={index} size="sm" />
        <div>
          <p className="text-sm font-semibold text-white">
            {item.linkedin_url ? (
              <a href={item.linkedin_url} target="_blank" rel="noopener noreferrer" className="hover:underline">
                {item.name}
              </a>
            ) : (
              item.name
            )}
          </p>
          <p className="text-[11px] text-slate-500">
            {item.role}
            {item.company && ` · ${item.company}`}
          </p>
        </div>
      </figcaption>
    </motion.figure>
  );
}

// ─── Main section ─────────────────────────────────────────────────────────────

const Testimonials = () => {
  const reduceMotion = useReducedMotion();
  const [testimonials, setTestimonials] = useState<TestimonialResponse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiService
      .getTestimonials()
      .then(setTestimonials)
      .catch((e) => console.error("Failed to fetch testimonials", e))
      .finally(() => setLoading(false));
  }, []);

  const [featured, ...rest] = testimonials;

  return (
    <section
      id="testimonials"
      className="relative overflow-hidden bg-slate-900 py-20 sm:py-28"
    >
      {/* Background accent blobs */}
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-32 left-1/4 h-96 w-96 rounded-full bg-violet-600/10 blur-[120px]" />
        <div className="absolute -bottom-32 right-1/4 h-96 w-96 rounded-full bg-sky-600/10 blur-[120px]" />
      </div>

      <div className="container relative z-10 mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 20 }}
          whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="mb-14 flex flex-col items-center text-center"
        >
          <span className="text-[11px] font-semibold uppercase tracking-[0.3em] text-sky-400/80">
            {copy.eyebrow}
          </span>
          <h2 className="mt-3 text-3xl font-semibold text-white sm:text-4xl lg:text-5xl">
            {copy.title}
          </h2>
          <p className="mt-3 max-w-lg text-base text-slate-400">
            {copy.subtitle}
          </p>
        </motion.div>

        {/* Content */}
        <AnimatePresence>
          {loading ? (
            <div className="mt-12">
              <LoadingAnimation label={copy.loading} />
            </div>
          ) : testimonials.length === 0 ? (
            <p className="mt-12 text-center text-slate-500">{copy.empty}</p>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {/* Featured card always spans full width */}
              {featured && (
                <FeaturedCard item={featured} reduceMotion={reduceMotion ?? false} index={0} />
              )}

              {/* Remaining cards fill the grid */}
              {rest.map((item, idx) => (
                <TestimonialCard
                  key={item.id}
                  item={item}
                  reduceMotion={reduceMotion ?? false}
                  index={idx + 1}
                  delay={idx * 0.08}
                />
              ))}
            </div>
          )}
        </AnimatePresence>

        {/* CTA */}
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 16 }}
          whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.8 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="mt-14 flex flex-col items-center gap-3"
        >
          <p className="text-sm text-slate-500">{copy.ctaText}</p>
          <Link
            href="/vouch"
            className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold text-slate-900 shadow-md transition hover:bg-slate-100 focus-visible:ring-2 focus-visible:ring-white/40 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900"
          >
            {copy.ctaLink}
          </Link>
        </motion.div>
      </div>
    </section>
  );
};

export default Testimonials;

