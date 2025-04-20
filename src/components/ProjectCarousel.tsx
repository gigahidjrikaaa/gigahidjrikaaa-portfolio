'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import ProjectCard from './ProjectCard';

type Project = {
  title: string;
  description: string;
  imageUrl: string;
  techStack: string[];
  githubUrl?: string;
  liveUrl?: string;
};

type ProjectCarouselProps = {
  projects: Project[];
};

const variants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 300 : -300,
    opacity: 0,
    scale: 0.95,
  }),
  center: {
    x: 0,
    opacity: 1,
    scale: 1,
    transition: { duration: 0.6, ease: [0.6, 0.01, 0.05, 0.95] },
  },
  exit: (direction: number) => ({
    x: direction < 0 ? 300 : -300,
    opacity: 0,
    scale: 0.95,
    transition: { duration: 0.4, ease: 'easeInOut' },
  }),
};

const ProjectCarousel: React.FC<ProjectCarouselProps> = ({ projects }) => {
  const [[page, direction], setPage] = useState<[number, number]>([0, 0]);
  const numProjects = projects.length;

  const paginate = (newDirection: number) => {
    setPage(([prevPage]) => {
      let next = prevPage + newDirection;
      if (next < 0) next = numProjects - 1;
      if (next >= numProjects) next = 0;
      return [next, newDirection];
    });
  };

  // Helper to get adjacent project indices (with wrap-around)
  const getIndex = (offset: number) => {
    let idx = page + offset;
    if (idx < 0) idx += numProjects;
    if (idx >= numProjects) idx -= numProjects;
    return idx;
  };

  // Array of offsets for -2, -1, 0, 1, 2 (previous 2, current, next 2)
  const offsets = [-2, -1, 0, 1, 2];

  // Card styles for each position
  const cardStyles = [
    // Far left
    "absolute left-1/2 -translate-x-[220%] scale-75 opacity-30 z-0 pointer-events-none transition-all duration-300",
    // Left
    "absolute left-1/2 -translate-x-[130%] scale-85 opacity-50 z-10 pointer-events-none transition-all duration-300",
    // Center
    "relative z-20 scale-100 opacity-100 transition-all duration-300",
    // Right
    "absolute left-1/2 translate-x-[30%] scale-85 opacity-50 z-10 pointer-events-none transition-all duration-300",
    // Far right
    "absolute left-1/2 translate-x-[120%] scale-75 opacity-30 z-0 pointer-events-none transition-all duration-300",
  ];

  return (
    <div className="relative w-full max-w-5xl flex items-center justify-center mx-auto">
      {/* Left Arrow */}
      <button
        className="absolute left-0 top-1/2 -translate-y-1/2 z-30 bg-white/10 hover:bg-cyan-500/30 border border-cyan-400/30 text-cyan-200 rounded-full p-3 shadow-lg transition-all duration-200 backdrop-blur-md"
        onClick={() => paginate(-1)}
        aria-label="Previous project"
        tabIndex={0}
      >
        <FaChevronLeft size={20} />
      </button>

      {/* Carousel Cards */}
      <div className="w-full flex items-center justify-center min-h-[480px] relative">
        {offsets.map((offset, i) => {
          const idx = getIndex(offset);
          // Animate only the center card
          if (offset === 0) {
            return (
              <AnimatePresence key={idx} initial={false} custom={direction}>
                <motion.div
                  key={page}
                  custom={direction}
                  variants={variants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  className={cardStyles[i]}
                  transition={{ type: "spring", stiffness: 400, damping: 40 }}
                >
                  <ProjectCard project={projects[idx]} />
                </motion.div>
              </AnimatePresence>
            );
          }
          // Static for previews
          return (
            <div key={idx} className={cardStyles[i]}>
              <ProjectCard project={projects[idx]} />
            </div>
          );
        })}
      </div>

      {/* Right Arrow */}
      <button
        className="absolute right-0 top-1/2 -translate-y-1/2 z-30 bg-white/10 hover:bg-pink-500/30 border border-pink-400/30 text-pink-200 rounded-full p-3 shadow-lg transition-all duration-200 backdrop-blur-md"
        onClick={() => paginate(1)}
        aria-label="Next project"
        tabIndex={0}
      >
        <FaChevronRight size={20} />
      </button>

      {/* Dots */}
      <div className="flex gap-2 mt-6 justify-center absolute left-1/2 -translate-x-1/2 bottom-0">
        {projects.map((_, idx) => (
          <button
            key={idx}
            className={`w-3 h-3 rounded-full border-2 transition-all duration-200 ${
              idx === page
                ? 'bg-gradient-to-br from-cyan-400 to-pink-400 border-cyan-400 shadow-[0_0_8px_2px_rgba(0,255,255,0.3)]'
                : 'bg-white/10 border-white/20'
            }`}
            onClick={() => setPage([idx, idx > page ? 1 : -1])}
            aria-label={`Go to project ${idx + 1}`}
          />
        ))}
      </div>
    </div>
  );
};

export default ProjectCarousel;