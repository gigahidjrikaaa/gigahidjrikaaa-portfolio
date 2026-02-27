// src/components/Experience.tsx
"use client";

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { MapPin, ArrowUpRight, Briefcase } from 'lucide-react';
import { apiService, ExperienceResponse } from '@/services/api';
import LoadingAnimation from '@/components/ui/LoadingAnimation';
import ExperienceModal from './ExperienceModal';

// Pull a plain-text preview from markdown-ish description string
function descriptionPreview(raw: string, maxLen = 160): string {
  if (!raw) return '';
  // Strip markdown list markers and extra whitespace
  const clean = raw
    .replace(/^\s*[-*•]\s+/gm, '')
    .replace(/\*\*/g, '')
    .replace(/\n+/g, ' ')
    .trim();
  return clean.length > maxLen ? clean.slice(0, maxLen).trimEnd() + '…' : clean;
}

const Experience = () => {
  const [experience, setExperience] = useState<ExperienceResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedExperience, setSelectedExperience] = useState<ExperienceResponse | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    apiService.getExperience()
      .then(setExperience)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleOpen = (item: ExperienceResponse) => {
    setSelectedExperience(item);
    setIsModalOpen(true);
  };
  const handleClose = () => {
    setIsModalOpen(false);
    setSelectedExperience(null);
  };

  return (
    <section id="experience" className="relative bg-white py-24 md:py-32">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">

        {/* ── Header ─────────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="mb-14"
        >
          <span className="text-[11px] font-semibold uppercase tracking-[0.3em] text-gray-400">
            Career
          </span>
          <div className="mt-3 flex flex-wrap items-end justify-between gap-4">
            <h2 className="text-4xl font-semibold leading-tight text-gray-900 sm:text-5xl">
              Work Experience
            </h2>
            <p className="max-w-md text-sm leading-relaxed text-gray-400">
              Building impactful software across startups, agencies, and enterprise teams.
            </p>
          </div>
        </motion.div>

        {/* ── Entries ────────────────────────────────────────────────── */}
        {loading ? (
          <LoadingAnimation label="Loading experience…" />
        ) : experience.length > 0 ? (
          <div className="divide-y divide-gray-100 border-t border-gray-100">
            {experience.map((item, idx) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.1 }}
                transition={{ duration: 0.4, delay: idx * 0.06, ease: [0.22, 1, 0.36, 1] }}
              >
                <button
                  type="button"
                  onClick={() => handleOpen(item)}
                  className="group w-full py-7 text-left transition-colors duration-150 hover:bg-gray-50/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-900/20"
                >
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-[180px_1fr] sm:gap-8 lg:grid-cols-[220px_1fr]">

                    {/* ── Left: company meta ─────────────────────────── */}
                    <div className="flex items-start gap-3 sm:flex-col sm:gap-2">
                      {/* Logo */}
                      <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center overflow-hidden rounded-lg border border-gray-200 bg-gray-50 sm:h-9 sm:w-9">
                        {item.company_logo_url ? (
                          <Image
                            src={item.company_logo_url}
                            alt={item.company}
                            width={36}
                            height={36}
                            className="object-contain"
                          />
                        ) : (
                          <Briefcase className="h-4 w-4 text-gray-400" />
                        )}
                      </div>

                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-gray-800">
                          {item.company}
                        </p>
                        <p className="mt-0.5 font-mono text-xs text-gray-400">{item.period}</p>
                      </div>
                    </div>

                    {/* ── Right: role + content ──────────────────────── */}
                    <div className="min-w-0 space-y-2">
                      {/* Role row */}
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-base font-semibold text-gray-900 sm:text-lg">
                          {item.title}
                        </h3>
                        {item.is_current && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-700">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                            Now
                          </span>
                        )}
                      </div>

                      {/* Location */}
                      {item.location && (
                        <p className="flex items-center gap-1.5 text-xs text-gray-400">
                          <MapPin className="h-3.5 w-3.5 flex-shrink-0" />
                          {item.location}
                        </p>
                      )}

                      {/* Description preview */}
                      {item.description && (
                        <p className="text-sm leading-relaxed text-gray-500">
                          {descriptionPreview(item.description)}
                        </p>
                      )}

                      {/* View more link */}
                      <span className="inline-flex items-center gap-1 text-xs font-medium text-gray-400 transition-colors group-hover:text-gray-700">
                        View details
                        <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                      </span>
                    </div>
                  </div>
                </button>
              </motion.div>
            ))}
          </div>
        ) : (
          <p className="text-center text-gray-400">Experience details coming soon.</p>
        )}
      </div>

      {selectedExperience && (
        <ExperienceModal
          open={isModalOpen}
          onClose={handleClose}
          experience={selectedExperience}
        />
      )}
    </section>
  );
};

export default Experience;
