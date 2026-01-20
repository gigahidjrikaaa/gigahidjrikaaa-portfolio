'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { FaGithub, FaExternalLinkAlt, FaTimes, FaUsers, FaUserTie, FaCheckCircle } from 'react-icons/fa';
import { createPortal } from 'react-dom';

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
  images?: { id: number; url: string; caption?: string; kind?: string; display_order?: number }[];
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

const modalVariants = {
  hidden: { opacity: 0, scale: 0.95, y: 20 },
  visible: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.25, ease: [0.22, 1, 0.36, 1] } },
  exit: { opacity: 0, scale: 0.95, y: 20, transition: { duration: 0.2 } },
};

const overlayVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.2 } },
  exit: { opacity: 0, transition: { duration: 0.15 } },
};

const ProjectModal: React.FC<ProjectModalProps> = ({ open, onClose, project }) => {
  const [mounted, setMounted] = useState(false);
  const [activeImage, setActiveImage] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const images = project.images?.length ? [...project.images] : [];
    images.sort((a, b) => (a.display_order ?? 0) - (b.display_order ?? 0));
    const fallback = project.ui_image_url || project.image_url || project.thumbnail_url || '/placeholder.png';
    setActiveImage(images[0]?.url ?? fallback);
  }, [project]);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && open) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, onClose]);

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6"
          initial="hidden"
          animate="visible"
          exit="exit"
        >
          {/* Overlay */}
          <motion.div
            variants={overlayVariants}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={onClose}
          />

          <motion.div
            variants={modalVariants}
            className="relative w-full max-w-5xl overflow-hidden rounded-3xl bg-white shadow-2xl"
            onClick={(e: React.MouseEvent) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="relative bg-white px-6 sm:px-8 py-5 sm:py-6 text-gray-900 border-b border-gray-100">
              <button
                onClick={onClose}
                className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-gray-600 transition-colors hover:bg-gray-200 hover:text-gray-900"
                aria-label="Close modal"
              >
                <FaTimes />
              </button>

              <div className="flex flex-col gap-3">
                <div className="flex flex-wrap items-center gap-3">
                  <h2 className="text-xl sm:text-2xl font-bold">{project.title}</h2>
                  {project.tagline && (
                    <span className="text-sm text-gray-500">{project.tagline}</span>
                  )}
                </div>

                {project.role && (
                  <div className="flex flex-wrap items-center gap-2 text-sm text-gray-500">
                    <FaUserTie /> <span>{project.role}</span>
                    {project.team_size && (
                      <>
                        <FaUsers className="ml-2" /> <span>Team of {project.team_size}</span>
                      </>
                    )}
                  </div>
                )}

                <div className="flex flex-wrap gap-2">
                  {project.github_url && (
                    <a
                      href={project.github_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 rounded-full bg-gray-100 px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-200"
                    >
                      <FaGithub /> GitHub
                    </a>
                  )}
                  {project.live_url && (
                    <a
                      href={project.live_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 rounded-full bg-gray-100 px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-200"
                    >
                      <FaExternalLinkAlt /> Live
                    </a>
                  )}
                  {project.case_study_url && (
                    <a
                      href={project.case_study_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 rounded-full bg-gray-100 px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-200"
                    >
                      Case Study
                    </a>
                  )}
                </div>
              </div>
            </div>

            {/* Main Content */}
            <div className="flex flex-col md:flex-row gap-6 p-6 sm:p-8 max-h-[70vh] overflow-y-auto">
              {/* Left: Visual */}
              <div className="flex flex-col items-center md:items-start md:w-1/3 flex-shrink-0 gap-3">
                <div className="w-full max-w-xs rounded-2xl overflow-hidden border border-gray-200 bg-gray-50">
                  <Image
                    src={activeImage || '/placeholder.png'}
                    width={320}
                    height={240}
                    alt={project.title}
                    className="object-cover w-full h-full"
                  />
                </div>
                {project.images && project.images.length > 1 && (
                  <div className="flex flex-wrap gap-2">
                    {project.images
                      .slice()
                      .sort((a, b) => (a.display_order ?? 0) - (b.display_order ?? 0))
                      .map((image) => (
                        <button
                          key={image.id}
                          type="button"
                          onClick={() => setActiveImage(image.url)}
                          className={`h-12 w-12 overflow-hidden rounded-lg border ${
                            activeImage === image.url
                              ? 'border-gray-900'
                              : 'border-gray-200'
                          }`}
                          aria-label={image.caption ?? 'Project image'}
                        >
                          <Image src={image.url} alt={image.caption ?? project.title} width={48} height={48} className="object-cover h-full w-full" />
                        </button>
                      ))}
                  </div>
                )}
              </div>

              {/* Right: Details */}
              <div className="flex-1 min-w-0 flex flex-col gap-6">
                <div>
                  <h4 className="text-sm font-semibold uppercase tracking-wider text-gray-500">Overview</h4>
                  <p className="mt-2 text-sm leading-relaxed text-gray-600">{project.description}</p>
                </div>

                {project.features && project.features.length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold uppercase tracking-wider text-gray-500">Key Features</h4>
                    <ul className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2 text-sm text-gray-600">
                      {project.features.map((feature: string, i: number) => (
                        <li key={i} className="flex items-center gap-2">
                          <FaCheckCircle className="text-gray-400" /> <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {project.tech_stack && project.tech_stack.length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold uppercase tracking-wider text-gray-500">Tech Stack</h4>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {project.tech_stack.map((tech: string, i: number) => (
                        <span
                          key={i}
                          className="text-xs px-2 py-1 rounded bg-gray-100 border border-gray-200 text-gray-700 font-mono"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {(project.challenges || project.solutions || project.impact) && (
                  <div className="grid gap-3">
                    {project.challenges && (
                      <div className="text-sm text-gray-600 bg-gray-50 border border-gray-200 rounded-lg px-4 py-3">
                        <span className="font-semibold text-gray-800">Challenge:</span>
                        <span className="ml-2">{project.challenges}</span>
                      </div>
                    )}
                    {project.solutions && (
                      <div className="text-sm text-gray-600 bg-gray-50 border border-gray-200 rounded-lg px-4 py-3">
                        <span className="font-semibold text-gray-800">Solution:</span>
                        <span className="ml-2">{project.solutions}</span>
                      </div>
                    )}
                    {project.impact && (
                      <div className="text-sm text-gray-600 bg-gray-50 border border-gray-200 rounded-lg px-4 py-3">
                        <span className="font-semibold text-gray-800">Impact:</span>
                        <span className="ml-2">{project.impact}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="border-t border-gray-100 px-6 sm:px-8 py-4">
              <button
                onClick={onClose}
                className="w-full rounded-xl bg-gray-900 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-gray-800"
              >
                Close
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
};

export default ProjectModal;