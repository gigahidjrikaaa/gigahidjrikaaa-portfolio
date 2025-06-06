'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import ProjectCard from './ProjectCard';

type Project = {
  title: string;
  description: string;
  imageUrl?: string;
  techStack?: string[];
  githubUrl?: string;
  liveUrl?: string;
};

type ProjectCarouselProps = {
  projects: Project[];
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
        <AnimatePresence initial={false} custom={direction} mode="popLayout">
          {offsets.map((offset, i) => {
        const idx = getIndex(offset);
        return (
          <motion.div
            key={`${idx}-${i}`}
            custom={direction}
            initial={{ 
          x: offset * 100 + (direction * 200), 
          scale: offset === 0 ? 0.95 : offset === -1 || offset === 1 ? 0.85 : 0.75,
          opacity: offset === 0 ? 0.8 : offset === -1 || offset === 1 ? 0.5 : 0.3,
          zIndex: 20 - Math.abs(offset) * 5
            }}
            animate={{ 
          x: offset === -2 ? '-120%' : offset === -1 ? '-80%' : offset === 0 ? 0 : offset === 1 ? '80%' : '120%', 
          scale: offset === 0 ? 1 : offset === -1 || offset === 1 ? 0.85 : 0.75,
          opacity: offset === 0 ? 1 : offset === -1 || offset === 1 ? 0.5 : 0.3,
          zIndex: 20 - Math.abs(offset) * 5
            }}
            exit={{ 
          x: offset * 100 - (direction * 200),
          scale: 0.8,
          opacity: 0 
            }}
            transition={{
          x: { type: "spring", stiffness: 300, damping: 30, mass: 1 },
          scale: { type: "spring", stiffness: 400, damping: 35 },
          opacity: { duration: 0.4 }
            }}
            className={`absolute left-1/2 transform -translate-x-1/2 ${offset === 0 ? 'pointer-events-auto' : 'pointer-events-none'}`}
          >
            <ProjectCard project={projects[idx]} />
          </motion.div>
        );
          })}
        </AnimatePresence>
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