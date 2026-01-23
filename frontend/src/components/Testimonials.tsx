"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useEffect, useState } from 'react';
import Image from 'next/image';
import { FaQuoteLeft } from "react-icons/fa";
import { StarIcon } from '@heroicons/react/24/solid';

interface TestimonialItem {
  id: number;
  name: string;
  role: string;
  company?: string;
  avatar_url?: string;
  content: string;
  rating?: number;
  project_relation?: string;
  linkedin_url?: string;
  is_featured: boolean;
  display_order: number;
  created_at: string;
}

const copy = {
  eyebrow: "Social Proof",
  title: "Testimonials & Collaborations",
  subtitle:
    "A few words from peers, mentors, and collaborators who have worked alongside me.",
  loading: 'Loading testimonials...',
  empty: 'No testimonials yet.',
};

const Testimonials = () => {
  const reduceMotion = useReducedMotion();
  const [testimonials, setTestimonials] = useState<TestimonialItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api/v1'}/testimonials/featured`);
        const data = await response.json();
        setTestimonials(data);
      } catch (error) {
        console.error('Failed to fetch testimonials', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

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

        {loading ? (
          <div className="mt-12 text-center text-gray-500">{copy.loading}</div>
        ) : testimonials.length > 0 ? (
          <div className="mt-12 grid gap-6 lg:grid-cols-3">
            {testimonials.map((item, index) => (
              <motion.figure
                key={item.id}
                initial={reduceMotion ? false : { opacity: 0, y: 24 }}
                whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.6, delay: index * 0.1, ease: "easeOut" }}
                className="relative flex flex-col rounded-3xl border border-gray-200/70 bg-white p-6 shadow-[0_20px_40px_rgba(15,23,42,0.08)]"
              >
                <div className="absolute right-6 top-6 text-gray-200">
                  <FaQuoteLeft aria-hidden="true" className="h-8 w-8" />
                </div>
                
                {item.rating && (
                  <div className="mb-3 flex gap-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <StarIcon
                        key={i}
                        className={`h-4 w-4 ${
                          i < item.rating! ? 'text-amber-400' : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                )}

                <blockquote className="flex-1 text-sm leading-relaxed text-gray-600">
                  &ldquo;{item.content}&rdquo;
                </blockquote>
                
                {item.project_relation && (
                  <div className="mt-4">
                    <span className="inline-block rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
                      {item.project_relation}
                    </span>
                  </div>
                )}

                <figcaption className="mt-6 flex items-center gap-3">
                  {item.avatar_url ? (
                    <div className="relative h-10 w-10 flex-shrink-0 overflow-hidden rounded-full">
                      <Image
                        src={item.avatar_url}
                        alt={item.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                  ) : (
                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-gray-200 text-gray-600 text-sm font-semibold">
                      {item.name.charAt(0)}
                    </div>
                  )}
                  <div>
                    <div className="text-base font-semibold text-gray-900">
                      {item.linkedin_url ? (
                        <a
                          href={item.linkedin_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:underline"
                        >
                          {item.name}
                        </a>
                      ) : (
                        item.name
                      )}
                    </div>
                    <div className="text-xs text-gray-500">
                      {item.role}
                      {item.company && ` at ${item.company}`}
                    </div>
                  </div>
                </figcaption>
              </motion.figure>
            ))}
          </div>
        ) : (
          <div className="mt-12 text-center text-gray-500">{copy.empty}</div>
        )}
      </div>
    </section>
  );
};

export default Testimonials;
