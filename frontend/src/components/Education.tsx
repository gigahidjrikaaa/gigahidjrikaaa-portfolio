// src/components/Education.tsx
"use client";

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { AcademicCapIcon, CalendarIcon } from '@heroicons/react/24/outline';
import { apiService, EducationResponse } from '@/services/api';
import LoadingAnimation from '@/components/ui/LoadingAnimation';
import EducationModal from './EducationModal';
import DescriptionList from '@/components/ui/DescriptionList';

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
  eyebrow: 'BACKGROUND',
  title: 'Education',
  subtitle: 'Academic foundation in engineering, computer science, and emerging technologies.',
  loading: 'Loading education...',
  empty: 'Education details coming soon.',
};

const Education = () => {
  const [education, setEducation] = useState<EducationResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEducation, setSelectedEducation] = useState<EducationResponse | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await apiService.getEducation();
        setEducation(data);
      } catch (error) {
        console.error('Failed to fetch education', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleEducationClick = (item: EducationResponse) => {
    setSelectedEducation(item);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedEducation(null);
  };

  return (
    <section id="education" className="relative overflow-hidden bg-gray-100 py-24 md:py-32">
      <div className="container relative z-10 mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={containerVariants}
        >
          {/* Header */}
          <motion.div variants={itemVariants} className="mb-16 text-center">
            <span className="text-xs font-semibold uppercase tracking-[0.25em] text-gray-500">
              {copy.eyebrow}
            </span>
            <h2 className="mt-2 text-3xl font-semibold leading-tight text-gray-900 sm:text-4xl lg:text-5xl">
              {copy.title}
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-gray-500 leading-relaxed">{copy.subtitle}</p>
          </motion.div>

          {loading ? (
            <LoadingAnimation label={copy.loading} />
          ) : education.length > 0 ? (
            <div className="mx-auto max-w-4xl space-y-6">
              {education.map((item) => (
                <motion.article
                  key={item.id}
                  variants={itemVariants}
                  className="group cursor-pointer overflow-hidden rounded-[28px] border border-gray-200/60 bg-white p-6 shadow-sm transition-all hover:shadow-lg hover:border-gray-300 md:p-8"
                  onClick={() => handleEducationClick(item)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => e.key === 'Enter' && handleEducationClick(item)}
                >
                  <div className="flex flex-col gap-6 md:flex-row md:items-start">
                    {/* Logo */}
                    <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-2xl border border-gray-200 bg-gray-50">
                      {item.institution_logo_url ? (
                        <Image
                          src={item.institution_logo_url}
                          alt={item.institution}
                          width={48}
                          height={48}
                          className="object-contain"
                        />
                      ) : (
                        <AcademicCapIcon className="h-8 w-8 text-gray-400" />
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1">
                      <div className="flex flex-wrap items-start justify-between gap-4">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 sm:text-xl">
                            {item.degree}
                          </h3>
                          <p className="mt-1 text-sm font-medium text-gray-700">{item.institution}</p>
                          <p className="mt-1 text-xs text-gray-500">{item.location}</p>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          {item.is_current && (
                            <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">
                              Current
                            </span>
                          )}
                          <span className="flex items-center gap-1 text-xs text-gray-500">
                            <CalendarIcon className="h-4 w-4" />
                            {item.period}
                          </span>
                        </div>
                      </div>

                      {item.gpa && (
                        <div className="mt-3">
                          <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700">
                            GPA: {item.gpa}
                          </span>
                        </div>
                      )}

                      {item.description && (
                        <div className="mt-4">
                          <DescriptionList description={item.description} />
                        </div>
                      )}
                    </div>
                  </div>
                </motion.article>
              ))}
            </div>
          ) : (
            <div className="text-center text-gray-500">{copy.empty}</div>
          )}
        </motion.div>
      </div>

      {/* Education Modal */}
      {selectedEducation && (
        <EducationModal
          open={isModalOpen}
          onClose={handleCloseModal}
          education={selectedEducation}
        />
      )}
    </section>
  );
};

export default Education;
