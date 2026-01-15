"use client";
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import ProjectCarousel from './ProjectCarousel';
import { apiService } from '@/services/api';

interface ProjectItem {
  id: number;
  title: string;
  tagline: string;
  description: string;
  github_url: string;
  live_url?: string;
  case_study_url?: string;
  role: string;
  team_size: number;
  challenges: string;
  solutions: string;
  impact: string;
  image_url?: string;
  thumbnail_url?: string;
  ui_image_url?: string;
  images?: { id: number; url: string; caption?: string; kind?: string; display_order?: number }[];
  is_featured: boolean;
  display_order: number;
}

const Projects = () => {
  const [projects, setProjects] = useState<ProjectItem[]>([]);
  const [loading, setLoading] = useState(true);

  const copy = {
    title: 'My Projects',
    intro: "Here are some of the projects I've worked on, showcasing my skills in:",
    tags: ['Web Development', 'Artificial Intelligence', 'Blockchain'],
    loading: 'Loading projects...',
    empty: 'No projects found.',
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await apiService.getProjects();
        setProjects(data);
      } catch (error) {
        console.error('Failed to fetch projects', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Always render the section, data will populate when available
  return (
    <section id="projects" className="relative py-16 sm:py-24 bg-background overflow-hidden">
      {/* Background Image & Neon Overlays */}
      <div className="absolute inset-0 z-0">
        {/* Neon gradient overlays */}
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/30 via-transparent to-pink-600/20 pointer-events-none" />
        <div className="absolute top-0 left-0 w-1/2 h-1/2 bg-cyan-400/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-1/3 h-1/3 bg-pink-500/20 rounded-full blur-2xl" />
      </div>

      {/* Animated Neon Grid */}
      <motion.svg
        className="absolute inset-0 w-full h-full z-10 pointer-events-none"
        viewBox="0 0 1440 800"
        preserveAspectRatio="none"
        aria-hidden="true"
        initial={{ opacity: 0.7 }}
        animate={{ opacity: [0.7, 1, 0.7], y: [0, 10, 0] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      >
        {[...Array(18)].map((_, i) => (
          <motion.line
            key={`v-${i}`}
            x1={80 * i}
            y1="0"
            x2={80 * i}
            y2="800"
            stroke={i % 2 === 0 ? "#00fff7" : "#ff00cc"}
            strokeWidth="1"
            strokeOpacity="0.13"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ delay: i * 0.05, duration: 1.2, repeat: Infinity, repeatType: "reverse" }}
          />
        ))}
        {[...Array(11)].map((_, i) => (
          <motion.line
            key={`h-${i}`}
            x1="0"
            y1={80 * i}
            x2="1440"
            y2={80 * i}
            stroke={i % 2 === 0 ? "#00fff7" : "#ff00cc"}
            strokeWidth="1"
            strokeOpacity="0.13"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ delay: i * 0.07, duration: 1.2, repeat: Infinity, repeatType: "reverse" }}
          />
        ))}
      </motion.svg>

      <div className="relative z-20 container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
        >
          <div className="flex flex-col items-start text-left">
            <h2 className="text-3xl sm:text-5xl md:text-6xl font-bold tracking-tight text-white mb-6 font-heading">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-pink-500 drop-shadow-[0_0_15px_rgba(0,255,255,0.6)]">
                {copy.title}
              </span>
            </h2>
            
            <div className="backdrop-blur-md bg-white/10 rounded-xl border border-white/20 p-6 shadow-xl max-w-2xl">
                <p className="text-base sm:text-lg leading-relaxed mb-4 bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-pink-500">
                {copy.intro}
                </p>
              
              <div className="flex flex-wrap gap-3 mt-2">
                {copy.tags.map((tag, idx) => (
                  <span
                    key={tag}
                    className={`inline-block text-white bg-gradient-to-r ${
                      idx === 0
                        ? 'from-cyan-500/40 to-cyan-500/20 border-cyan-400/30 shadow-[0_0_8px_rgba(0,255,255,0.3)]'
                        : idx === 1
                          ? 'from-pink-500/40 to-pink-500/20 border-pink-400/30 shadow-[0_0_8px_rgba(255,0,204,0.3)]'
                          : 'from-purple-500/40 to-purple-500/20 border-purple-400/30 shadow-[0_0_8px_rgba(128,0,255,0.3)]'
                    } backdrop-blur-sm rounded-md px-4 py-1.5 text-sm font-medium border`}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </motion.div>

        {loading ? (
          <div className="text-center text-white/70">{copy.loading}</div>
        ) : projects.length > 0 ? (
          <ProjectCarousel projects={projects} />
        ) : (
          <div className="text-center text-white/70">{copy.empty}</div>
        )}

      </div>
    </section>
  );
};

export default Projects;
