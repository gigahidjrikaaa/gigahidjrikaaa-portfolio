"use client";

import { useMemo } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { CircleCheck } from "lucide-react";
import { apiService, ServiceResponse } from "@/services/api";
import { useApiData } from "@/hooks/useApiData";

const copy = {
  eyebrow: "WHY CHOOSE",
  title: "Why Work With Me",
  subtitle:
    "I work best with teams that want clear execution: strong architecture, honest trade-offs, and predictable delivery.",
  quote:
    "Good products are built in small, reliable steps. The process should feel clear for both engineering and product teams.",
  reasons: [
    "End-to-end product thinking",
    "Clear, async-friendly communication",
    "Deep technical depth across AI, web, and blockchain",
    "Focus on measurable impact",
    "Transparent timelines and deliverables",
  ],
};

const Services = () => {
  // Services are optional enhancement content: on failure the section
  // degrades to the static copy below instead of showing an error.
  const { data: servicesData } = useApiData<ServiceResponse[]>(() => apiService.getServices());
  const services = useMemo(() => servicesData ?? [], [servicesData]);
  const reduceMotion = useReducedMotion();

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
          {/* Left: Visual card */}
          <div className="relative aspect-[4/3] overflow-hidden rounded-[32px] bg-gray-100">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/giga-pics/giga-4.jpg"
              alt="Product planning and delivery workflow"
              className="h-full w-full object-cover"
            />
            <div className="pointer-events-none absolute inset-0 bg-black/20" />
            <div className="absolute bottom-4 left-4 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-gray-900">
              Delivery process
            </div>
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
                  <CircleCheck className="mt-0.5 h-5 w-5 flex-shrink-0 text-gray-400" />
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
