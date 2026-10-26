// src/components/Awards.tsx
"use client";

import { useRef, useState, type MouseEvent } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Trophy, ArrowUpRight } from 'lucide-react';
import { apiService, AwardResponse } from '@/services/api';
import AwardModal from './AwardModal';
import LoadingAnimation from '@/components/ui/LoadingAnimation';
import ErrorState from '@/components/ui/ErrorState';
import { useApiData } from '@/hooks/useApiData';
import { containerVariants, itemVariants, EASE_OUT } from '@/lib/motion';

const copy = {
  eyebrow: 'RECOGNITION',
  title: 'Awards & Achievements',
  subtitle: 'A shortlist of competitions, programs, and milestones that mark the work I am most proud of.',
  loading: 'Loading awards...',
  empty: 'Awards coming soon.',
};

/** Card reveal with the extra scale-settle the spotlight moment wants. */
const awardCardVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.96 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.55, ease: EASE_OUT },
  },
};

/**
 * Cursor-following 3D tilt around the card's center. Plain div + CSS
 * transition — cursor-tracking handlers on motion.div don't fire in this
 * stack, and the article inside animates its own transform via variants.
 */
const Tilt3D = ({ children }: { children: React.ReactNode }) => {
  const ref = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();
  const [tilt, setTilt] = useState({ rx: 0, ry: 0 });

  if (reduceMotion) {
    return <div className="h-full">{children}</div>;
  }

  const handleMove = (event: MouseEvent) => {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    const px = (event.clientX - rect.left) / rect.width - 0.5;
    const py = (event.clientY - rect.top) / rect.height - 0.5;
    setTilt({
      rx: Math.round(-py * 7 * 10) / 10,
      ry: Math.round(px * 9 * 10) / 10,
    });
  };

  const reset = () => setTilt({ rx: 0, ry: 0 });
  const settled = tilt.rx === 0 && tilt.ry === 0;

  return (
    <div
      ref={ref}
      onMouseMove={handleMove}
      onMouseLeave={reset}
      className="h-full"
      style={{
        transform: `perspective(900px) rotateX(${tilt.rx}deg) rotateY(${tilt.ry}deg)`,
        transition: settled
          ? 'transform 0.6s cubic-bezier(0.22, 1, 0.36, 1)'
          : 'transform 0.08s linear',
        transformStyle: 'preserve-3d',
      }}
    >
      {children}
    </div>
  );
};

const Awards = () => {
  const { data: awardsData, loading, error, retry } = useApiData<AwardResponse[]>(() => apiService.getAwards());
  const awards = awardsData ?? [];
  const [selectedAward, setSelectedAward] = useState<AwardResponse | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleAwardClick = (award: AwardResponse) => {
    setSelectedAward(award);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedAward(null);
  };

  return (
    <section id="awards" className="relative bg-zinc-50 py-24 md:py-32">
      <div className="container relative z-10 mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={containerVariants}
        >
          {/* Header */}
          <motion.div variants={itemVariants} className="mb-16 max-w-2xl">
            <span className="text-xs font-semibold uppercase tracking-[0.25em] text-zinc-500">
              {copy.eyebrow}
            </span>
            <h2 className="mt-2 text-3xl font-semibold tracking-tight text-zinc-900 sm:text-4xl lg:text-5xl">
              {copy.title}
            </h2>
            <p className="mt-4 text-zinc-600 leading-relaxed">{copy.subtitle}</p>
          </motion.div>

          {loading ? (
              <LoadingAnimation label={copy.loading} />
          ) : error ? (
            <ErrorState
              title="Awards couldn't load"
              message={error}
              onRetry={retry}
            />
          ) : awards.length > 0 ? (
            // Self-contained reveal scope: the grid mounts after the fetch
            // resolves, so it cannot rely on the parent container's variant
            // propagation (late children stay stuck at `hidden`).
            <motion.div
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.1 }}
              className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
            >
              {awards.map((award) => (
                <Tilt3D key={award.id}>
                  <motion.article
                    variants={awardCardVariants}
                    className="group relative h-full cursor-pointer overflow-hidden rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg"
                    onClick={() => handleAwardClick(award)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => e.key === 'Enter' && handleAwardClick(award)}
                  >
                    {/* One-time shine sweep after the card settles */}
                    <motion.span
                      aria-hidden
                      className="pointer-events-none absolute inset-y-0 -left-1/2 w-1/2 -skew-x-12 bg-gradient-to-r from-transparent via-white/60 to-transparent"
                      initial={{ x: '-140%' }}
                      whileInView={{ x: '360%' }}
                      viewport={{ once: true, amount: 0.4 }}
                      transition={{ duration: 0.9, ease: EASE_OUT, delay: 0.9 }}
                    />
                    {/* Trophy icon or image */}
                    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-zinc-100">
                      {award.image_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={award.image_url}
                          alt={award.title}
                          className="h-8 w-8 object-contain"
                        />
                      ) : (
                        <Trophy className="h-6 w-6 text-zinc-600" />
                      )}
                    </div>

                    <h3 className="text-lg font-semibold text-zinc-900">{award.title}</h3>
                    {award.issuer && (
                      <p className="mt-1 text-sm text-zinc-500">{award.issuer}</p>
                    )}
                    {award.award_date && (
                      <p className="mt-2 text-[11px] font-semibold uppercase tracking-[0.15em] text-zinc-400">{award.award_date}</p>
                    )}
                    {award.description && (
                      <p className="mt-3 text-sm leading-relaxed text-zinc-600">
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
                        className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-zinc-900 underline decoration-zinc-300 underline-offset-4 transition-colors hover:decoration-zinc-900"
                      >
                        View credential
                        <ArrowUpRight className="h-4 w-4" />
                      </button>
                    )}
                  </motion.article>
                </Tilt3D>
              ))}
            </motion.div>
          ) : (
            <div className="text-zinc-500">{copy.empty}</div>
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
