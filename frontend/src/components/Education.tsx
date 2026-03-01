// src/components/Education.tsx
"use client";

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { MapPin, ArrowUpRight } from 'lucide-react';
import { apiService, EducationResponse } from '@/services/api';
import LoadingAnimation from '@/components/ui/LoadingAnimation';
import EducationModal from './EducationModal';

// Fallback gradients when no background image is set
const FALLBACK_GRADIENTS = [
  'from-indigo-950 via-indigo-900 to-blue-900',
  'from-zinc-900 via-zinc-800 to-zinc-700',
  'from-emerald-950 via-emerald-900 to-teal-900',
  'from-violet-950 via-violet-900 to-purple-900',
  'from-rose-950 via-rose-900 to-pink-900',
];

const Education = () => {
  const [education, setEducation] = useState<EducationResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<EducationResponse | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    apiService.getEducation()
      .then(setEducation)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const open = (item: EducationResponse) => { setSelected(item); setModalOpen(true); };
  const close = () => { setModalOpen(false); setSelected(null); };

  return (
    <section id="education" className="relative bg-white py-24 dark:bg-zinc-900 md:py-32">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">

        {/* ── Header ─────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="mb-14"
        >
          <span className="text-xs font-semibold uppercase tracking-[0.25em] text-gray-500">
            Background
          </span>
          <div className="mt-2 flex flex-wrap items-end justify-between gap-4">
            <h2 className="text-3xl font-semibold leading-tight text-gray-900 dark:text-white sm:text-4xl lg:text-5xl">
              Education
            </h2>
            <p className="max-w-md text-sm leading-relaxed text-gray-600 dark:text-zinc-400">
              Academic foundation in engineering, computer science, and emerging technologies.
            </p>
          </div>
        </motion.div>

        {/* ── Cards ──────────────────────────────────────────────── */}
        {loading ? (
          <LoadingAnimation label="Loading education…" />
        ) : education.length > 0 ? (
          <div className="grid gap-5 sm:grid-cols-2">
            {education.map((item, idx) => (
              <motion.button
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.1 }}
                transition={{ duration: 0.45, delay: idx * 0.08, ease: [0.22, 1, 0.36, 1] }}
                onClick={() => open(item)}
                className="group w-full overflow-hidden rounded-2xl text-left shadow-sm ring-1 ring-zinc-200/80 transition-shadow duration-200 hover:shadow-xl hover:shadow-black/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900/30 dark:ring-zinc-800"
              >
                {/* ── Banner (background image or gradient) ── */}
                <div className="relative h-44 overflow-hidden">
                  {item.institution_background_url ? (
                    <Image
                      src={item.institution_background_url}
                      alt={`${item.institution} campus`}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                      sizes="(max-width: 640px) 100vw, 50vw"
                      quality={85}
                    />
                  ) : (
                    <div
                      className={`h-full w-full bg-gradient-to-br ${FALLBACK_GRADIENTS[idx % FALLBACK_GRADIENTS.length]} transition-transform duration-500 group-hover:scale-105`}
                    />
                  )}

                  {/* Darkening overlay */}
                  <div className="absolute inset-0 bg-black/45 transition-opacity duration-200 group-hover:bg-black/55" />

                  {/* Logo */}
                  {item.institution_logo_url && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10 p-2 ring-1 ring-white/25 backdrop-blur-md">
                        <Image
                          src={item.institution_logo_url}
                          alt={item.institution}
                          width={48}
                          height={48}
                          className="object-contain drop-shadow-md"
                          unoptimized
                        />
                      </div>
                    </div>
                  )}

                  {/* Institution name overlay at bottom of banner */}
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent px-5 pb-3 pt-8">
                    <p className="truncate text-sm font-semibold text-white/90">{item.institution}</p>
                  </div>

                  {/* Now chip */}
                  {item.is_current && (
                    <div className="absolute right-4 top-4">
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/90 px-2.5 py-1 text-[11px] font-semibold text-white backdrop-blur-sm">
                        <span className="h-1.5 w-1.5 rounded-full bg-white" />
                        Now
                      </span>
                    </div>
                  )}
                </div>

                {/* ── Content ─────────────────────────────────── */}
                <div className="bg-white px-5 pb-5 pt-4 dark:bg-zinc-900">
                  <p className="font-mono text-[11px] tracking-wide text-zinc-400 dark:text-zinc-500">
                    {item.period}
                  </p>
                  <h3 className="mt-1 text-base font-semibold leading-snug text-zinc-900 dark:text-white sm:text-lg">
                    {item.degree}
                  </h3>

                  {/* Meta row */}
                  <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1.5">
                    {item.location && (
                      <span className="flex items-center gap-1 text-xs text-zinc-400 dark:text-zinc-500">
                        <MapPin className="h-3 w-3 flex-shrink-0" />
                        {item.location}
                      </span>
                    )}
                    {item.gpa && (
                      <span className="rounded-full bg-zinc-100 px-2.5 py-0.5 font-mono text-[11px] text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
                        GPA {item.gpa}
                      </span>
                    )}
                  </div>

                  {/* View details */}
                  <div className="mt-4 flex items-center gap-1 text-xs font-medium text-zinc-400 transition-colors duration-150 group-hover:text-zinc-700 dark:group-hover:text-zinc-200">
                    View details
                    <ArrowUpRight className="h-3.5 w-3.5 transition-transform duration-150 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </div>
                </div>
              </motion.button>
            ))}
          </div>
        ) : (
          <p className="text-center text-zinc-400">Education details coming soon.</p>
        )}
      </div>

      {selected && (
        <EducationModal open={modalOpen} onClose={close} education={selected} />
      )}
    </section>
  );
};

export default Education;
