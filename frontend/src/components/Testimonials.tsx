"use client";

import { motion, useReducedMotion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { Star } from "lucide-react";
import LoadingAnimation from "@/components/ui/LoadingAnimation";
import ErrorState from "@/components/ui/ErrorState";
import { useApiData } from "@/hooks/useApiData";
import { apiService, TestimonialResponse } from "@/services/api";

// ─── Copy ─────────────────────────────────────────────────────────────────────

const copy = {
  eyebrow: "Social Proof",
  title: "Kind words",
  subtitle: "Words from people I've built, shipped, and learned with.",
  loading: "Loading testimonials...",
  empty: "No testimonials yet — be the first.",
  ctaText: "Worked with me?",
  ctaLink: "Leave a testimonial",
};

// ─── Avatar ───────────────────────────────────────────────────────────────────

function Avatar({ item, size = "md" }: { item: TestimonialResponse; size?: "sm" | "md" | "lg" }) {
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
      className={`flex flex-shrink-0 items-center justify-center rounded-full bg-zinc-900 font-semibold text-white ${dim}`}
      aria-hidden
    >
      {item.name.charAt(0)}
    </div>
  );
}

// ─── Star rating row ──────────────────────────────────────────────────────────

function Stars({ rating, onDark = false }: { rating: number; onDark?: boolean }) {
  return (
    <div className="flex gap-0.5" aria-label={`Rated ${rating} out of 5`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={`h-4 w-4 ${
            i < rating
              ? onDark
                ? "text-white"
                : "text-zinc-900"
              : onDark
                ? "text-white/20"
                : "text-zinc-200"
          }`}
          fill={i < rating ? "currentColor" : "none"}
        />
      ))}
    </div>
  );
}

// ─── Featured (hero) testimonial card — the section's black anchor ───────────

function FeaturedCard({ item, reduceMotion }: { item: TestimonialResponse; reduceMotion: boolean | null }) {
  return (
    <motion.figure
      initial={reduceMotion ? false : { opacity: 0, y: 28 }}
      whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.35 }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      className="relative col-span-full overflow-hidden rounded-3xl bg-zinc-900 p-8 sm:p-12"
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
          <Avatar item={item} size="lg" />
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
            <p className="mt-0.5 text-xs text-zinc-400">
              {item.role}
              {item.company && ` · ${item.company}`}
            </p>
          </div>
          {item.rating ? <Stars rating={item.rating} onDark /> : null}
          {item.project_relation && (
            <span className="rounded-full border border-white/25 px-3 py-1 text-[11px] font-medium text-zinc-300">
              {item.project_relation}
            </span>
          )}
        </div>

        {/* Right: quote */}
        <blockquote className="flex-1 text-lg font-light italic leading-relaxed text-zinc-100 sm:text-xl">
          &ldquo;{item.content}&rdquo;
        </blockquote>
      </div>
    </motion.figure>
  );
}

// ─── Regular testimonial card ─────────────────────────────────────────────────

function TestimonialCard({ item, reduceMotion, delay }: { item: TestimonialResponse; reduceMotion: boolean | null; delay: number }) {
  return (
    <motion.figure
      initial={reduceMotion ? false : { opacity: 0, y: 24 }}
      whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
      className="flex flex-col rounded-2xl bg-white p-6 shadow-sm ring-1 ring-zinc-200 transition-shadow duration-300 hover:shadow-md"
    >
      {/* Rating */}
      {item.rating ? (
        <div className="mb-4">
          <Stars rating={item.rating} />
        </div>
      ) : null}

      {/* Quote */}
      <blockquote className="flex-1 text-sm leading-relaxed text-zinc-600 italic">
        &ldquo;{item.content}&rdquo;
      </blockquote>

      {/* Context tag */}
      {item.project_relation && (
        <div className="mt-4">
          <span className="rounded-full bg-zinc-100 px-2.5 py-1 text-[11px] font-medium text-zinc-600">
            {item.project_relation}
          </span>
        </div>
      )}

      {/* Author */}
      <figcaption className="mt-5 flex items-center gap-3 border-t border-zinc-100 pt-5">
        <Avatar item={item} size="sm" />
        <div>
          <p className="text-sm font-semibold text-zinc-900">
            {item.linkedin_url ? (
              <a href={item.linkedin_url} target="_blank" rel="noopener noreferrer" className="hover:underline">
                {item.name}
              </a>
            ) : (
              item.name
            )}
          </p>
          <p className="text-[11px] text-zinc-500">
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
  const { data: testimonialsData, loading, error, retry } = useApiData<TestimonialResponse[]>(() => apiService.getTestimonials());
  const testimonials = testimonialsData ?? [];

  const [featured, ...rest] = testimonials;

  return (
    <section
      id="testimonials"
      className="relative overflow-hidden bg-zinc-50 py-24 md:py-32"
    >
      <div className="container relative z-10 mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 20 }}
          whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="mb-14 max-w-2xl"
        >
          <span className="text-xs font-semibold uppercase tracking-[0.25em] text-zinc-500">
            {copy.eyebrow}
          </span>
          <h2 className="mt-2 text-3xl font-semibold tracking-tight text-zinc-900 sm:text-4xl lg:text-5xl">
            {copy.title}
          </h2>
          <p className="mt-4 text-base text-zinc-600">
            {copy.subtitle}
          </p>
        </motion.div>

        {/* Content */}
        <AnimatePresence>
          {loading ? (
            <div className="mt-12">
              <LoadingAnimation label={copy.loading} />
            </div>
          ) : error ? (
            <ErrorState
              title="Testimonials couldn't load"
              message={error}
              onRetry={retry}
            />
          ) : testimonials.length === 0 ? (
            <p className="mt-12 text-zinc-500">{copy.empty}</p>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {/* Featured card always spans full width */}
              {featured && (
                <FeaturedCard item={featured} reduceMotion={reduceMotion ?? false} />
              )}

              {/* Remaining cards fill the grid */}
              {rest.map((item, idx) => (
                <TestimonialCard
                  key={item.id}
                  item={item}
                  reduceMotion={reduceMotion ?? false}
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
          className="mt-14 flex flex-wrap items-center gap-4"
        >
          <p className="text-sm text-zinc-500">{copy.ctaText}</p>
          <Link
            href="/vouch"
            className="inline-flex items-center gap-2 rounded-full bg-zinc-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-zinc-700 focus-visible:ring-2 focus-visible:ring-zinc-900/40 focus-visible:ring-offset-2"
          >
            {copy.ctaLink}
          </Link>
        </motion.div>
      </div>
    </section>
  );
};

export default Testimonials;
