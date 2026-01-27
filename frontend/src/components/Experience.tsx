// src/components/Experience.tsx
"use client";

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { BriefcaseIcon, MapPinIcon } from '@heroicons/react/24/outline';
import { apiService, ExperienceResponse } from '@/services/api';
import LoadingAnimation from '@/components/ui/LoadingAnimation';
import ExperienceModal from './ExperienceModal';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.12, delayChildren: 0.2 },
  },
};

const itemVariants = {
  hidden: { y: 24, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
  },
};

const copy = {
  eyebrow: 'CAREER',
  title: 'Work Experience',
  subtitle: 'Building impactful products across startups, agencies, and enterprise teams.',
  loading: 'Loading experience...',
  empty: 'Experience details coming soon.',
};

const Experience = () => {
  const [experience, setExperience] = useState<ExperienceResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedExperience, setSelectedExperience] = useState<ExperienceResponse | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await apiService.getExperience();
        setExperience(data);
      } catch (error) {
        console.error('Failed to fetch experience', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleExperienceClick = (item: ExperienceResponse) => {
    setSelectedExperience(item);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedExperience(null);
  };

  return (
    <section id="experience" className="relative overflow-hidden bg-white py-24 md:py-32">
      <div className="container relative z-10 mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={containerVariants}
        >
          {/* Header */}
          <motion.div variants={itemVariants} className="mb-16 max-w-2xl">
            <span className="text-xs font-semibold uppercase tracking-[0.25em] text-gray-500">
              {copy.eyebrow}
            </span>
            <h2 className="mt-2 text-3xl font-semibold leading-tight text-gray-900 sm:text-4xl lg:text-5xl">
              {copy.title}
            </h2>
            <p className="mt-4 text-gray-500 leading-relaxed">{copy.subtitle}</p>
          </motion.div>

          {loading ? (
            <LoadingAnimation label={copy.loading} />
          ) : experience.length > 0 ? (
            <div className="relative">
              {/* Timeline line */}
              <div className="absolute left-6 top-0 hidden h-full w-px bg-gray-200 md:block" />

              <div className="space-y-8">
                {experience.map((item) => (
                  <motion.article
                    key={item.id}
                    variants={itemVariants}
                    className="group relative grid gap-6 md:grid-cols-[auto_1fr] md:gap-8"
                  >
                    {/* Timeline dot */}
                    <div className="hidden md:flex md:flex-col md:items-center">
                      <div className="relative z-10 flex h-12 w-12 items-center justify-center rounded-full border border-gray-200 bg-white shadow-sm">
                        {item.company_logo_url ? (
                          <Image
                            src={item.company_logo_url}
                            alt={item.company}
                            width={32}
                            height={32}
                            className="rounded-full object-contain"
                          />
                        ) : (
                          <BriefcaseIcon className="h-5 w-5 text-gray-400" />
                        )}
                      </div>
                    </div>

                    {/* Card */}
                    <div 
                      className="cursor-pointer rounded-[28px] border border-gray-200/60 bg-gray-50/50 p-6 transition-all hover:shadow-lg hover:border-gray-300 md:p-8"
                      onClick={() => handleExperienceClick(item)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => e.key === 'Enter' && handleExperienceClick(item)}
                    >
                      <div className="flex flex-wrap items-start justify-between gap-4">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 sm:text-xl">
                            {item.title}
                          </h3>
                          <p className="mt-1 text-sm font-medium text-gray-700">{item.company}</p>
                        </div>
                        {item.is_current && (
                          <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
                            Current
                          </span>
                        )}
                      </div>

                      <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <MapPinIcon className="h-4 w-4" />
                          {item.location}
                        </span>
                        <span className="rounded-full bg-gray-100 px-3 py-1">{item.period}</span>
                      </div>

                      <p className="mt-4 text-sm leading-relaxed text-gray-600">
                        {item.description}
                      </p>
                    </div>
                  </motion.article>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center text-gray-500">{copy.empty}</div>
          )}
        </motion.div>
      </div>

      {/* Experience Modal */}
      {selectedExperience && (
        <ExperienceModal
          open={isModalOpen}
          onClose={handleCloseModal}
          experience={selectedExperience}
        />
      )}
    </section>
  );
};

export default Experience;
