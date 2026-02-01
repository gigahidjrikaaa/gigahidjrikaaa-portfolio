"use client";

import React, { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import { apiService } from "@/services/api";
import ProjectModal from './ProjectModal';
import LoadingAnimation from '@/components/ui/LoadingAnimation';

interface ProjectItem {
  id: number;
  title: string;
  tagline: string;
  description: string;
  github_url: string;
  live_url?: string;
  case_study_url?: string;
  image_url?: string;
  thumbnail_url?: string;
  ui_image_url?: string;
  role: string;
  team_size: number;
  challenges: string;
  solutions: string;
  impact: string;
  is_featured: boolean;
  tech_stack?: string[];
  features?: string[];
  images?: { id: number; url: string; caption?: string; kind?: string; display_order?: number }[];
  metrics_users?: string;
  metrics_performance?: string;
  metrics_impact?: string;
  solo_contributions?: string;
  tech_decisions?: string;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.2 },
  },
};

const itemVariants = {
  hidden: { y: 40, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
  },
};

const carouselVariants = {
  hidden: { x: 0 },
  visible: { x: 0 },
  enter: { x: 0 },
  exit: { x: 0 },
};

const copy = {
  eyebrow: "Portfolio",
  title: "Signature Projects",
  featured: "Featured Projects",
  all: "All Projects",
  loading: "Loading projects...",
  empty: "No projects found.",
  viewFeatured: "View Featured",
  viewAll: "View All",
  featuredLabel: "Featured",
  next: "Next",
  previous: "Previous",
};

const Projects = () => {
  const [projects, setProjects] = useState<ProjectItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProject, setSelectedProject] = useState<ProjectItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showAll, setShowAll] = useState(false);

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

  const featuredProjects = useMemo(() => projects.filter(p => p.is_featured), [projects]);
  const allProjects = useMemo(() => projects.filter(p => !p.is_featured), [projects]);
  const displayProjects = showAll ? allProjects : featuredProjects;

  const handleProjectClick = (project: ProjectItem) => {
    setSelectedProject(project);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedProject(null);
  };

  const FeaturedCarousel = () => {
    const [currentIndex, setCurrentIndex] = useState(0);

    const nextSlide = () => {
      setCurrentIndex((prev) => (prev + 1) % displayProjects.length);
    };

    const prevSlide = () => {
      setCurrentIndex((prev) => (prev - 1 + displayProjects.length) % displayProjects.length);
    };

    return (
      <div className="relative">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            variants={carouselVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            className="w-full"
          >
            <div className="relative overflow-hidden rounded-2xl border border-gray-200 bg-gray-50">
              <img
                src={displayProjects[currentIndex]?.image_url || displayProjects[currentIndex]?.thumbnail_url || displayProjects[currentIndex]?.ui_image_url || "/placeholder-project.jpg"}
                alt={displayProjects[currentIndex]?.title}
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent" />
              <div className="relative z-10 p-8">
                 <span className="inline-flex items-center gap-2 rounded-full bg-purple-500/90 px-4 py-1 text-xs font-semibold uppercase tracking-widest text-white">
                  {copy.featuredLabel}
                </span>
                <h3 className="mt-4 text-3xl font-bold text-white">
                  {displayProjects[currentIndex]?.title}
                </h3>
                <p className="mt-3 text-white/90 text-lg leading-relaxed line-clamp-2">
                  {displayProjects[currentIndex]?.tagline}
                </p>
                <div className="mt-6 flex gap-3">
                  <button
                    onClick={() => handleProjectClick(displayProjects[currentIndex])}
                    className="flex-1 bg-white/90 text-white px-6 py-3 rounded-lg font-semibold hover:bg-white hover:scale-105 transition-all"
                  >
                    View Details
                  </button>
                  <a
                    href={displayProjects[currentIndex]?.live_url || displayProjects[currentIndex]?.github_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 bg-white/20 text-white px-6 py-3 rounded-lg font-semibold hover:bg-white/30 hover:scale-105 transition-all"
                  >
                    {displayProjects[currentIndex]?.live_url ? "Live Demo" : "View Code"}
                  </a>
                </div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        {displayProjects.length > 1 && (
          <div className="absolute inset-y-0 left-0 z-20 flex items-center">
            <button
              onClick={prevSlide}
              className="p-2 rounded-full bg-white/20 text-white hover:bg-white/30 transition-all hover:scale-110"
            >
              <ChevronLeftIcon className="h-6 w-6" />
            </button>
          </div>
        )}

        {displayProjects.length > 1 && (
          <div className="absolute inset-y-0 right-0 z-20 flex items-center">
            <button
              onClick={nextSlide}
              className="p-2 rounded-full bg-white/20 text-white hover:bg-white/30 transition-all hover:scale-110"
            >
              <ChevronRightIcon
                className={`h-6 w-6 ${currentIndex === displayProjects.length - 1 ? "opacity-50" : ""}`}
              />
            </button>
          </div>
        )}
      </div>
    );
  };

  const ProjectCard = ({ project }: { project: ProjectItem }) => {
    return (
      <motion.article
        key={project.id}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        variants={itemVariants}
        className="group relative overflow-hidden rounded-2xl border border-gray-200 bg-white hover:shadow-2xl transition-all duration-300 cursor-pointer"
        onClick={() => handleProjectClick(project)}
      >
        <div className="relative aspect-[16/9] overflow-hidden">
          <img
            src={project.image_url || project.thumbnail_url || project.ui_image_url || "/placeholder-project.jpg"}
            alt={project.title}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent" />
          
          <div className="relative z-10 p-6">
            {project.is_featured && (
              <span className="absolute top-4 left-4 inline-flex items-center gap-2 rounded-full bg-purple-500/90 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-white">
                {copy.featuredLabel}
              </span>
            )}
            
            <h3 className="text-2xl font-bold text-gray-900 mb-3 line-clamp-2">
              {project.title}
            </h3>
            
            <p className="text-base text-gray-600 leading-relaxed line-clamp-3 mb-4">
              {project.tagline}
            </p>
            
            <div className="space-y-3">
              {project.github_url && (
                <a
                  href={project.github_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 underline"
                >
                  View Code
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.355a1 1 0 0-1.785a1 1 0-1.785H12a5.001 5.001 5.001h-9.991" />
                  </svg>
                </a>
              )}
              
              {project.live_url && (
                <a
                  href={project.live_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-sm text-purple-600 hover:text-purple-800 underline font-medium"
                >
                  Live Demo
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a5 5 0 0 .583 12c-3.95 3.95 0 1.414 6.959 0 0 1-414 6.959M14.5a3.5 3.5 0 1 414 7.657a3.5 3.5 0 0 1.414zM10 12a1 1 0 0-1.414-6.959-3.5-3.5-0 0-1.657z" />
                  </svg>
                </a>
              )}
            </div>
          </div>
        </div>
      </motion.article>
    );
  };

  return (
    <section id="projects" className="relative overflow-hidden bg-white py-24 md:py-32">
      <div className="container relative z-10 mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={containerVariants}
        >
          <div className="mb-12 flex flex-wrap items-center justify-between gap-4">
            <div>
              <span className="text-xs font-semibold uppercase tracking-[0.25em] text-gray-500">
                {copy.eyebrow}
              </span>
              <h2 className="text-4xl font-semibold text-gray-900">{copy.title}</h2>
            </div>
            
            {!showAll && allProjects.length > 0 && (
              <button
                onClick={() => setShowAll(true)}
                className="text-sm font-medium text-purple-600 hover:text-purple-800 underline"
              >
                {copy.viewAll}
              </button>
            )}
          </div>

          {!showAll && (
            <FeaturedCarousel />
          )}

          {!showAll && allProjects.length > 0 && (
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-4">
                <span className="inline-flex items-center gap-2 rounded-full bg-purple-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-purple-700">
                  {copy.featured}
                </span>
                <span className="text-sm text-gray-600">
                  {featuredProjects.length} {featuredProjects.length === 1 ? 'Featured' : ''}
                </span>
              </div>
              <span className="text-sm text-gray-500">
                Handpicked projects demonstrating expertise
              </span>
            </div>
          )}

          <motion.div variants={itemVariants}>
            <h3 className="text-2xl font-semibold text-gray-900 mb-8">
              {showAll ? copy.all : copy.featured}
            </h3>
          </motion.div>

          {loading ? (
            <LoadingAnimation label={copy.loading} />
          ) : displayProjects.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {displayProjects.map((project) => (
                <ProjectCard key={project.id} project={project} />
              ))}
            </div>
          ) : (
            <div className="text-center text-gray-500 py-16">
              {copy.empty}
            </div>
          )}
        </motion.div>

        {selectedProject && (
          <ProjectModal
            open={isModalOpen}
            onClose={handleCloseModal}
            project={selectedProject}
          />
        )}
      </div>
    </section>
  );
};

export default Projects;
