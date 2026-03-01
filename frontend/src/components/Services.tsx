"use client";

import { useEffect, useMemo, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { PlayIcon, CheckCircleIcon } from "@heroicons/react/24/solid";
import { apiService, ServiceResponse } from "@/services/api";

const copy = {
  eyebrow: "WHY CHOOSE",
  title: "Why Work With Me",
  subtitle:
    "A polished overview of capabilities, process, and outcomes — designed to help stakeholders align fast.",
  quote:
    "The best projects happen when design, engineering, and strategy operate as one unified thread.",
  reasons: [
    "End-to-end product thinking",
    "Clear, async-friendly communication",
    "Deep technical depth across AI, web, and blockchain",
    "Focus on measurable impact",
    "Transparent timelines and deliverables",
  ],
};

const Services = () => {
  const [services, setServices] = useState<ServiceResponse[]>([]);
  const [, setLoading] = useState(true);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    const load = async () => {
      try {
        const data = await apiService.getServices();
        setServices(data);
      } catch (error) {
        console.error("Failed to fetch services", error);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const reasons = useMemo(() => {
    if (services.length > 0) {
      return services.slice(0, 5).map((s) => s.title);
    }
    return copy.reasons;
  }, [services]);

  return (
    <section id="services" className="relative overflow-hidden bg-zinc-50 py-24 dark:bg-zinc-900 md:py-32">
      <div className="container relative z-10 mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 20 }}
          whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6 }}
          className="grid items-center gap-12 lg:grid-cols-2"
        >
          {/* Left: Video card */}
          <div className="relative aspect-[4/3] overflow-hidden rounded-[32px] bg-gray-100">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/hero-bg.jpg"
              alt="Video preview"
              className="h-full w-full object-cover"
            />
            <div className="pointer-events-none absolute inset-0 bg-black/10" />
            {/* Play button */}
            <button
              type="button"
              aria-label="Play video"
              className="absolute left-1/2 top-1/2 flex h-16 w-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-gray-900 shadow-lg backdrop-blur-sm transition hover:scale-105"
            >
              <PlayIcon className="h-7 w-7" />
            </button>
          </div>

          {/* Right: Text content */}
          <div className="space-y-6">
            <div className="space-y-2">
              <span className="text-xs font-semibold uppercase tracking-[0.25em] text-gray-500">
                {copy.eyebrow}
              </span>
              <h2 className="text-3xl font-semibold leading-tight text-gray-900 sm:text-4xl lg:text-5xl">
                {copy.title}
              </h2>
            </div>
            <p className="text-gray-500 leading-relaxed">{copy.subtitle}</p>

            {/* Checklist */}
            <ul className="space-y-3 pt-2">
              {reasons.map((item) => (
                <li key={item} className="flex items-start gap-3 text-gray-700">
                  <CheckCircleIcon className="mt-0.5 h-5 w-5 flex-shrink-0 text-gray-400" />
                  <span className="text-sm">{item}</span>
                </li>
              ))}
            </ul>

            {/* Quote */}
            <p className="border-l-2 border-gray-200 pl-4 text-sm italic text-gray-500">
              {copy.quote}
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Services;
