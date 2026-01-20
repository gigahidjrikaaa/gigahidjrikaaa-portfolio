// src/components/Awards.tsx
"use client";

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { TrophyIcon, ArrowTopRightOnSquareIcon } from '@heroicons/react/24/outline';
import { apiService, AwardResponse } from '@/services/api';
import AwardModal from './AwardModal';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.2 },
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
  eyebrow: 'RECOGNITION',
  title: 'Awards & Achievements',
  subtitle: 'Honors and recognitions from competitions, hackathons, and professional milestones.',
  loading: 'Loading awards...',
  empty: 'Awards coming soon.',
};

const Awards = () => {
  const [awards, setAwards] = useState<AwardResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAward, setSelectedAward] = useState<AwardResponse | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await apiService.getAwards();
        setAwards(data);
      } catch (error) {
        console.error('Failed to fetch awards', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleAwardClick = (award: AwardResponse) => {
    setSelectedAward(award);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedAward(null);
  };

  return (
    <section id="awards" className="relative overflow-hidden bg-gray-900 py-24 md:py-32">
      {/* Background pattern */}
      <div
        className="pointer-events-none absolute inset-0 bg-cover bg-center opacity-10"
        style={{ backgroundImage: "url('/hero-bg.jpg')" }}
      />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-gray-900/90 via-gray-900/80 to-gray-900/90" />

      <div className="container relative z-10 mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={containerVariants}
        >
          {/* Header */}
          <motion.div variants={itemVariants} className="mb-16 text-center">
            <span className="text-xs font-semibold uppercase tracking-[0.25em] text-gray-400">
              {copy.eyebrow}
            </span>
            <h2 className="mt-2 text-3xl font-semibold leading-tight text-white sm:text-4xl lg:text-5xl">
              {copy.title}
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-gray-400 leading-relaxed">{copy.subtitle}</p>
          </motion.div>

          {loading ? (
            <div className="text-center text-gray-400">{copy.loading}</div>
          ) : awards.length > 0 ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {awards.map((award) => (
                <motion.article
                  key={award.id}
                  variants={itemVariants}
                  className="group relative cursor-pointer overflow-hidden rounded-[28px] border border-white/10 bg-white/5 p-6 backdrop-blur-md transition-all hover:border-white/20 hover:bg-white/10"
                  onClick={() => handleAwardClick(award)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => e.key === 'Enter' && handleAwardClick(award)}
                >
                  {/* Trophy icon or image */}
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500/20">
                    {award.image_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={award.image_url}
                        alt={award.title}
                        className="h-8 w-8 object-contain"
                      />
                    ) : (
                      <TrophyIcon className="h-6 w-6 text-amber-400" />
                    )}
                  </div>

                  <h3 className="text-lg font-semibold text-white">{award.title}</h3>
                  {award.issuer && (
                    <p className="mt-1 text-sm text-gray-400">{award.issuer}</p>
                  )}
                  {award.award_date && (
                    <p className="mt-2 text-xs text-gray-500">{award.award_date}</p>
                  )}
                  {award.description && (
                    <p className="mt-3 text-sm leading-relaxed text-gray-300">
                      {award.description}
                    </p>
                  )}

                  {award.credential_url && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        window.open(award.credential_url, '_blank');
                      }}
                      className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-amber-400 hover:text-amber-300"
                    >
                      View credential
                      <ArrowTopRightOnSquareIcon className="h-4 w-4" />
                    </button>
                  )}

                  {/* Decorative glow */}
                  <div className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-amber-500/20 blur-2xl transition-opacity group-hover:opacity-80" />
                </motion.article>
              ))}
            </div>
          ) : (
            <div className="text-center text-gray-400">{copy.empty}</div>
          )}
        </motion.div>
      </div>

      {/* Award Modal */}
      {selectedAward && (
        <AwardModal
          open={isModalOpen}
          onClose={handleCloseModal}
          award={selectedAward}
        />
      )}
    </section>
  );
};

export default Awards;
