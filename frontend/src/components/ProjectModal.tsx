'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { FaGithub, FaExternalLinkAlt, FaTimes, FaUsers, FaUserTie, FaCheckCircle } from 'react-icons/fa';
import { createPortal } from 'react-dom';

type Project = {
  title: string;
  tagline?: string;
  description: string;
  features?: string[];
  techStack?: string[];
  githubUrl?: string;
  liveUrl?: string;
  caseStudyUrl?: string;
  role?: string;
  teamSize?: number;
  challenges?: string;
  solutions?: string;
  impact?: string;
  imageUrl?: string;
};

type ProjectModalProps = {
  open: boolean;
  onClose: () => void;
  project: Project;
};

const modalVariants = {
  hidden: { opacity: 0, scale: 0.98, y: 40 },
  visible: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.28 } },
  exit: { opacity: 0, scale: 0.98, y: 40, transition: { duration: 0.18 } },
};

const ProjectModal: React.FC<ProjectModalProps> = ({ open, onClose, project }) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-[2px]"
          initial="hidden"
          animate="visible"
          exit="exit"
          variants={modalVariants}
          onClick={onClose}
        >
          <motion.div
            className="relative bg-gradient-to-br from-[#0a192f] via-[#0f223a] to-[#1a0e2a] border border-cyan-400/30 rounded-3xl shadow-2xl max-w-4xl w-full max-h-5/6 h-full mx-4 p-0 overflow-hidden"
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 40, opacity: 0 }}
            transition={{ duration: 0.28 }}
            onClick={e => e.stopPropagation()}
          >
            {/* Decorative Neon Glow */}
            <div className="absolute -top-16 -left-16 w-56 h-56 bg-cyan-400/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-16 -right-16 w-56 h-56 bg-pink-500/10 rounded-full blur-3xl pointer-events-none" />
            {/* Close Button */}
            <button
              className="absolute top-4 right-4 text-cyan-200 hover:text-pink-400 transition-colors text-2xl z-10 focus:outline-none focus:ring-2 focus:ring-pink-400"
              onClick={onClose}
              aria-label="Close"
            >
              <FaTimes />
            </button>
            {/* Main Content */}
            <div className="flex flex-col md:flex-row gap-6 p-6 md:p-8 flex-1 min-h-0">
              {/* Left: Visual & Meta */}
              <div className="flex flex-col items-center md:items-start md:w-1/3 flex-shrink-0 gap-3">
                <div className="w-24 h-24 md:w-28 md:h-28 rounded-xl overflow-hidden border-2 border-cyan-400/40 shadow-lg bg-black/30">
                  <Image
                    src={project.imageUrl || '/placeholder.png'}
                    width={112} // 28 * 4 
                    height={112} // 28 * 4
                    alt={project.title}
                    className="object-cover w-full h-full"
                  />
                </div>
                <h2 className="text-xl md:text-2xl font-bold text-white font-heading tracking-tight text-center md:text-left truncate w-full">
                  {project.title}
                </h2>
                {project.tagline && (
                  <span className="text-cyan-200 text-xs text-center md:text-left line-clamp-2">{project.tagline}</span>
                )}
                {project.role && (
                  <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 text-xs text-cyan-300">
                    <FaUserTie /> <span>{project.role}</span>
                    {project.teamSize && (
                      <>
                        <FaUsers className="ml-2" /> <span>Team of {project.teamSize}</span>
                      </>
                    )}
                  </div>
                )}
                {/* Links */}
                <div className="flex gap-2 mt-2 flex-wrap justify-center md:justify-start">
                  {project.githubUrl && (
                    <a
                      href={project.githubUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center px-3 py-1.5 rounded-full border border-cyan-400 text-cyan-200 hover:bg-cyan-500/20 hover:text-cyan-100 transition-all text-xs font-semibold shadow"
                    >
                      <FaGithub className="mr-1" /> GitHub
                    </a>
                  )}
                  {project.liveUrl && (
                    <a
                      href={project.liveUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center px-3 py-1.5 rounded-full border border-pink-400 text-pink-200 hover:bg-pink-500/20 hover:text-pink-100 transition-all text-xs font-semibold shadow"
                    >
                      <FaExternalLinkAlt className="mr-1" /> Live
                    </a>
                  )}
                  {project.caseStudyUrl && (
                    <a
                      href={project.caseStudyUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center px-3 py-1.5 rounded-full border border-white/20 text-white hover:bg-white/10 transition-all text-xs font-semibold shadow"
                    >
                      Case Study
                    </a>
                  )}
                </div>
              </div>
              {/* Right: Scrollable Info */}
              <div className="flex-1 min-w-0 flex flex-col gap-4 overflow-hidden">
                {/* Description */}
                <div className="overflow-y-auto max-h-24 md:max-h-28 pr-1">
                  <p className="text-gray-200 text-sm leading-relaxed break-words text-center md:text-left">
                    {project.description}
                  </p>
                </div>
                {/* Features */}
                {project.features && project.features.length > 0 && (
                  <div className="overflow-y-auto max-h-20 md:max-h-24 pr-1">
                    <h4 className="text-cyan-300 font-semibold mb-1 text-xs uppercase tracking-wider">Key Features</h4>
                    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1 text-cyan-200 text-xs">
                      {project.features.map((feature, i) => (
                        <li key={i} className="flex items-center gap-2">
                          <FaCheckCircle className="text-cyan-400 min-w-[1em]" /> <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {/* Tech Stack */}
                <div className="overflow-y-auto max-h-12 md:max-h-16 pr-1">
                  <h4 className="text-cyan-300 font-semibold mb-1 text-xs uppercase tracking-wider">Tech Stack</h4>
                  <div className="flex flex-wrap gap-2">
                    {project.techStack?.map((tech, i) => (
                      <span
                        key={i}
                        className="text-xs px-2 py-1 rounded bg-cyan-400/10 border border-cyan-400/20 text-cyan-200 font-mono"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
                {/* Challenges, Solutions, Impact */}
                {(project.challenges || project.solutions || project.impact) && (
                  <div className="flex flex-col gap-2 mt-1 overflow-y-auto max-h-20 md:max-h-24 pr-1">
                    {project.challenges && (
                      <div className="text-xs text-pink-200 bg-pink-400/10 border border-pink-400/20 rounded px-3 py-2">
                        <span className="font-semibold">Challenge:</span>
                        <span className="ml-2">{project.challenges}</span>
                      </div>
                    )}
                    {project.solutions && (
                      <div className="text-xs text-cyan-200 bg-cyan-400/10 border border-cyan-400/20 rounded px-3 py-2">
                        <span className="font-semibold">Solution:</span>
                        <span className="ml-2">{project.solutions}</span>
                      </div>
                    )}
                    {project.impact && (
                      <div className="text-xs text-green-200 bg-green-400/10 border border-green-400/20 rounded px-3 py-2">
                        <span className="font-semibold">Impact:</span>
                        <span className="ml-2">{project.impact}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
            {/* Subtle Border */}
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute inset-0 border border-cyan-400/10 rounded-3xl pointer-events-none" />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
};

export default ProjectModal;