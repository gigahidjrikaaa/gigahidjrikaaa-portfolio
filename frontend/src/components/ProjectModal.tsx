'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { createPortal } from 'react-dom';
import { X, Github, ExternalLink, BookOpen, Users, Briefcase, CheckCircle2, ChevronLeft, ChevronRight } from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────

type ProjectImage = { id: number; url: string; caption?: string; kind?: string; display_order?: number };

type Project = {
  id?: number;
  title: string;
  tagline?: string;
  description: string;
  github_url?: string;
  live_url?: string;
  case_study_url?: string;
  role?: string;
  team_size?: number;
  challenges?: string;
  solutions?: string;
  impact?: string;
  image_url?: string;
  thumbnail_url?: string;
  ui_image_url?: string;
  images?: ProjectImage[];
  is_featured?: boolean;
  display_order?: number;
  features?: string[];
  tech_stack?: string[];
};

type ProjectModalProps = {
  open: boolean;
  onClose: () => void;
  project: Project;
};

// ─── Animation variants ───────────────────────────────────────────────────────

const overlayVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.22 } },
  exit: { opacity: 0, transition: { duration: 0.18 } },
};

const modalVariants = {
  hidden: { opacity: 0, y: 32, scale: 0.97 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1] } },
  exit: { opacity: 0, y: 24, scale: 0.97, transition: { duration: 0.2 } },
};

// ─── Component ────────────────────────────────────────────────────────────────

const ProjectModal: React.FC<ProjectModalProps> = ({ open, onClose, project }) => {
  const [mounted, setMounted] = useState(false);
  const [activeIdx, setActiveIdx] = useState(0);

  // Sorted gallery list
  const gallery: { url: string; caption?: string }[] = (() => {
    const imgs = (project.images ?? []).slice().sort((a, b) => (a.display_order ?? 0) - (b.display_order ?? 0));
    if (imgs.length) return imgs;
    const fallback = project.ui_image_url || project.image_url || project.thumbnail_url || '/placeholder.png';
    return [{ url: fallback }];
  })();

  useEffect(() => { setMounted(true); }, []);

  // Reset image index when project changes
  useEffect(() => { setActiveIdx(0); }, [project]);

  // Body scroll lock
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  // Esc to close
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape' && open) onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  // Arrow key navigation
  useEffect(() => {
    if (!open || gallery.length <= 1) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') setActiveIdx(i => (i - 1 + gallery.length) % gallery.length);
      if (e.key === 'ArrowRight') setActiveIdx(i => (i + 1) % gallery.length);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, gallery.length]);

  if (!mounted) return null;

  const activeImage = gallery[activeIdx];
  const hasMeta = project.role || project.team_size;
  const hasNarrative = project.challenges || project.solutions || project.impact;

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[9999] flex items-end justify-center sm:items-center sm:p-4 md:p-6"
          initial="hidden"
          animate="visible"
          exit="exit"
        >
          {/* Backdrop */}
          <motion.div
            variants={overlayVariants}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Modal sheet */}
          <motion.div
            variants={modalVariants}
            className="relative flex w-full max-w-4xl flex-col overflow-hidden rounded-t-3xl bg-white shadow-2xl dark:bg-zinc-900 sm:rounded-3xl"
            style={{ maxHeight: 'min(92vh, 900px)' }}
            onClick={(e: React.MouseEvent) => e.stopPropagation()}
          >
            {/* ── HERO IMAGE ─────────────────────────────────────────────── */}
            <div className="relative w-full shrink-0 overflow-hidden bg-zinc-900" style={{ aspectRatio: '16/7' }}>
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeImage.url}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.25 }}
                  className="absolute inset-0"
                >
                  <Image
                    src={activeImage.url}
                    alt={activeImage.caption ?? project.title}
                    fill
                    className="object-cover"
                    priority
                    sizes="(max-width: 896px) 100vw, 896px"
                  />
                </motion.div>
              </AnimatePresence>

              {/* Gradient vignette */}
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />

              {/* Close button */}
              <button
                onClick={onClose}
                aria-label="Close"
                className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-sm transition hover:bg-black/60"
              >
                <X className="h-4 w-4" />
              </button>

              {/* Image counter badge */}
              {gallery.length > 1 && (
                <span className="absolute left-4 top-4 rounded-full bg-black/40 px-2.5 py-1 text-[11px] font-semibold tabular-nums text-white backdrop-blur-sm">
                  {activeIdx + 1} / {gallery.length}
                </span>
              )}

              {/* Arrow nav */}
              {gallery.length > 1 && (
                <>
                  <button
                    onClick={() => setActiveIdx(i => (i - 1 + gallery.length) % gallery.length)}
                    aria-label="Previous image"
                    className="absolute left-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-sm transition hover:bg-black/60"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => setActiveIdx(i => (i + 1) % gallery.length)}
                    aria-label="Next image"
                    className="absolute right-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-sm transition hover:bg-black/60"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </>
              )}

              {/* Title + tagline overlay */}
              <div className="absolute inset-x-0 bottom-0 px-6 pb-5 pt-12">
                <h2 className="text-xl font-bold leading-tight text-white sm:text-2xl md:text-3xl">
                  {project.title}
                </h2>
                {project.tagline && (
                  <p className="mt-1 text-sm font-medium text-white/65">{project.tagline}</p>
                )}
              </div>
            </div>

            {/* ── THUMBNAIL STRIP ────────────────────────────────────────── */}
            {gallery.length > 1 && (
              <div className="flex shrink-0 gap-2 overflow-x-auto border-b border-zinc-100 bg-zinc-50 px-5 py-3 dark:border-zinc-800 dark:bg-zinc-950">
                {gallery.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveIdx(i)}
                    className={`relative h-14 w-20 shrink-0 overflow-hidden rounded-lg border-2 transition ${
                      i === activeIdx
                        ? 'border-zinc-900 dark:border-white'
                        : 'border-transparent opacity-60 hover:opacity-90'
                    }`}
                  >
                    <Image src={img.url} alt={img.caption ?? `Image ${i + 1}`} fill className="object-cover" sizes="80px" />
                  </button>
                ))}
              </div>
            )}

            {/* ── SCROLLABLE BODY ────────────────────────────────────────── */}
            <div className="flex-1 overflow-y-auto">
              {/* Action links + meta row */}
              <div className="flex flex-wrap items-center gap-3 border-b border-zinc-100 px-6 py-4 dark:border-zinc-800">
                <div className="flex flex-wrap gap-2">
                  {project.live_url && (
                    <a
                      href={project.live_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-full bg-zinc-900 px-4 py-2 text-xs font-semibold text-white transition hover:bg-zinc-700 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                      Live Demo
                    </a>
                  )}
                  {project.github_url && (
                    <a
                      href={project.github_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-full border border-zinc-200 bg-white px-4 py-2 text-xs font-semibold text-zinc-700 transition hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700"
                    >
                      <Github className="h-3.5 w-3.5" />
                      GitHub
                    </a>
                  )}
                  {project.case_study_url && (
                    <a
                      href={project.case_study_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-full border border-zinc-200 bg-white px-4 py-2 text-xs font-semibold text-zinc-700 transition hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700"
                    >
                      <BookOpen className="h-3.5 w-3.5" />
                      Case Study
                    </a>
                  )}
                </div>
                {hasMeta && (
                  <div className="ml-auto flex flex-wrap gap-3 text-xs text-zinc-400 dark:text-zinc-500">
                    {project.role && (
                      <span className="flex items-center gap-1.5">
                        <Briefcase className="h-3.5 w-3.5" />
                        {project.role}
                      </span>
                    )}
                    {project.team_size && (
                      <span className="flex items-center gap-1.5">
                        <Users className="h-3.5 w-3.5" />
                        Team of {project.team_size}
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Content sections */}
              <div className="space-y-8 px-6 py-6">
                <section>
                  <h3 className="mb-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-zinc-400 dark:text-zinc-500">
                    Overview
                  </h3>
                  <p className="text-sm leading-relaxed text-zinc-600 dark:text-zinc-300">{project.description}</p>
                </section>

                {project.features && project.features.length > 0 && (
                  <section>
                    <h3 className="mb-3 text-[11px] font-semibold uppercase tracking-[0.2em] text-zinc-400 dark:text-zinc-500">
                      Key Features
                    </h3>
                    <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                      {project.features.map((feature, i) => (
                        <li key={i} className="flex items-start gap-2.5 text-sm text-zinc-600 dark:text-zinc-300">
                          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </section>
                )}

                {project.tech_stack && project.tech_stack.length > 0 && (
                  <section>
                    <h3 className="mb-3 text-[11px] font-semibold uppercase tracking-[0.2em] text-zinc-400 dark:text-zinc-500">
                      Tech Stack
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {project.tech_stack.map((tech, i) => (
                        <span
                          key={i}
                          className="rounded-md border border-zinc-200 bg-zinc-50 px-2.5 py-1 font-mono text-[11px] font-medium text-zinc-700 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  </section>
                )}

                {hasNarrative && (
                  <section className="grid gap-3">
                    {project.challenges && (
                      <div className="rounded-xl border-l-4 border-amber-400 bg-amber-50 px-5 py-4 dark:border-amber-500 dark:bg-amber-950/30">
                        <p className="mb-1 text-[10px] font-bold uppercase tracking-widest text-amber-600 dark:text-amber-400">
                          Challenge
                        </p>
                        <p className="text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">{project.challenges}</p>
                      </div>
                    )}
                    {project.solutions && (
                      <div className="rounded-xl border-l-4 border-sky-400 bg-sky-50 px-5 py-4 dark:border-sky-500 dark:bg-sky-950/30">
                        <p className="mb-1 text-[10px] font-bold uppercase tracking-widest text-sky-600 dark:text-sky-400">
                          Solution
                        </p>
                        <p className="text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">{project.solutions}</p>
                      </div>
                    )}
                    {project.impact && (
                      <div className="rounded-xl border-l-4 border-emerald-400 bg-emerald-50 px-5 py-4 dark:border-emerald-500 dark:bg-emerald-950/30">
                        <p className="mb-1 text-[10px] font-bold uppercase tracking-widest text-emerald-600 dark:text-emerald-400">
                          Impact
                        </p>
                        <p className="text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">{project.impact}</p>
                      </div>
                    )}
                  </section>
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
};

export default ProjectModal;
