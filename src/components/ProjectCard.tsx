'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { FaGithub, FaExternalLinkAlt, FaTimes } from 'react-icons/fa';

type Project = {
  title: string;
  description: string;
  imageUrl: string;
  techStack: string[];
  githubUrl?: string;
  liveUrl?: string;
};

type ProjectCardProps = {
  project: Project;
};

const cardVariants = {
  hidden: { y: 32, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { duration: 0.7, ease: [0.6, 0.01, 0.05, 0.95] },
  },
};

const modalVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.3 } },
  exit: { opacity: 0, scale: 0.95, transition: { duration: 0.2 } },
};

const ProjectCard: React.FC<ProjectCardProps> = ({ project }) => {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Card */}
      <motion.div
        className="relative group cursor-pointer backdrop-blur-md bg-white/10 border border-white/15 rounded-2xl shadow-xl overflow-hidden flex flex-col transition-all duration-300 hover:scale-[1.035] hover:shadow-[0_0_40px_0_rgba(0,255,255,0.18)]"
        variants={cardVariants}
        whileHover={{ y: -10, boxShadow: "0 0 40px 0 rgba(0,255,255,0.22)" }}
        onClick={() => setOpen(true)}
        tabIndex={0}
        onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') setOpen(true); }}
        aria-label={`Open details for ${project.title}`}
      >
        {/* Unique angled neon accent */}
        <div className="absolute -top-4 -left-4 w-24 h-24 bg-gradient-to-br from-cyan-400/40 to-pink-500/30 rotate-12 blur-2xl pointer-events-none" />
        {/* Project Image with animated border */}
        <div className="relative h-48 w-full overflow-hidden">
          <Image
            src={project.imageUrl}
            alt={project.title}
            fill
            className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-500"
          />
          <motion.div
            className="absolute inset-0 rounded-2xl pointer-events-none"
            style={{
              boxShadow: '0 0 0 2px #00fff7, 0 0 24px 0 #ff00cc44',
              opacity: 0.18,
              transition: 'box-shadow 0.3s',
            }}
            whileHover={{ opacity: 0.32 }}
          />
          {/* Animated neon corner lines */}
          <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-cyan-400 rounded-tl-2xl animate-pulse" />
          <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-pink-400 rounded-br-2xl animate-pulse" />
        </div>
        {/* Card Content */}
        <div className="flex-1 flex flex-col p-6 max-w-xl">
          <h3 className="text-xl font-bold text-white mb-2 font-heading flex items-center gap-2">
            {project.title}
            <span className="w-2 h-2 rounded-full bg-gradient-to-br from-cyan-400 to-pink-400 animate-pulse" />
          </h3>
          <p className="text-black text-sm mb-4 flex-1 line-clamp-3">{project.description}</p>
          <div className="flex flex-wrap gap-2 mb-4">
            {project.techStack.map((tech, i) => (
              <span
                key={i}
                className="text-xs px-2 py-1 rounded-md bg-white/10 border border-cyan-400/20 text-cyan-200 font-mono tracking-tight"
              >
                {tech}
              </span>
            ))}
          </div>
          <div className="flex gap-3 mt-auto">
            {project.githubUrl && (
              <a
                href={project.githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-3 py-1.5 rounded-full border border-cyan-400 text-cyan-300 hover:bg-cyan-500/20 hover:text-cyan-100 transition-all text-xs font-semibold shadow neon-glow-cyan"
                onClick={e => e.stopPropagation()}
              >
                <FaGithub className="mr-1" /> Code
              </a>
            )}
            {project.liveUrl && (
              <a
                href={project.liveUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-3 py-1.5 rounded-full border border-pink-400 text-pink-300 hover:bg-pink-500/20 hover:text-pink-100 transition-all text-xs font-semibold shadow neon-glow-pink"
                onClick={e => e.stopPropagation()}
              >
                <FaExternalLinkAlt className="mr-1" /> Live
              </a>
            )}
          </div>
        </div>
      </motion.div>

      {/* Modal */}
      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm"
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={modalVariants}
            onClick={() => setOpen(false)}
          >
            <motion.div
              className="relative bg-white/10 backdrop-blur-lg border border-cyan-400/30 rounded-2xl shadow-2xl max-w-lg w-full mx-4 p-8 flex flex-col items-center"
              initial={{ y: 40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 40, opacity: 0 }}
              transition={{ duration: 0.3 }}
              onClick={e => e.stopPropagation()}
            >
              <button
                className="absolute top-4 right-4 text-cyan-300 hover:text-pink-400 transition-colors text-xl"
                onClick={() => setOpen(false)}
                aria-label="Close"
              >
                <FaTimes />
              </button>
              <div className="w-28 h-28 rounded-xl overflow-hidden mb-4 border-2 border-cyan-400/40 shadow-lg">
                <Image
                  src={project.imageUrl}
                  alt={project.title}
                  width={112}
                  height={112}
                  className="object-cover w-full h-full"
                />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2 text-center">{project.title}</h2>
              <p className="text-gray-200 text-base mb-4 text-center">{project.description}</p>
              <div className="flex flex-wrap gap-2 mb-4 justify-center">
                {project.techStack.map((tech, i) => (
                  <span
                    key={i}
                    className="text-xs px-2 py-1 rounded-md bg-white/10 border border-cyan-400/20 text-cyan-200 font-mono tracking-tight"
                  >
                    {tech}
                  </span>
                ))}
              </div>
              <div className="flex gap-4 justify-center">
                {project.githubUrl && (
                  <a
                    href={project.githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center px-4 py-2 rounded-full border border-cyan-400 text-cyan-300 hover:bg-cyan-500/20 hover:text-cyan-100 transition-all text-sm font-semibold shadow neon-glow-cyan"
                  >
                    <FaGithub className="mr-2" /> GitHub
                  </a>
                )}
                {project.liveUrl && (
                  <a
                    href={project.liveUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center px-4 py-2 rounded-full border border-pink-400 text-pink-300 hover:bg-pink-500/20 hover:text-pink-100 transition-all text-sm font-semibold shadow neon-glow-pink"
                  >
                    <FaExternalLinkAlt className="mr-2" /> Live Site
                  </a>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default ProjectCard;