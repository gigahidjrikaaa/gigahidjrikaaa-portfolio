"use client";

import React, { useEffect, useState, useMemo, useRef } from 'react';
import { motion, AnimatePresence, useInView, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { ArrowUpRight, Github, ExternalLink, ChevronLeft, ChevronRight, Layers, Star } from 'lucide-react';
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
  is_active?: boolean;
  tech_stack?: string[];
  features?: string[];
  images?: { id: number; url: string; caption?: string; kind?: string; display_order?: number }[];
  metrics_users?: string;
  metrics_performance?: string;
  metrics_impact?: string;
  solo_contributions?: string;
  tech_decisions?: string;
}

// Tilt card hook
function useTilt(maxTilt = 8) {
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useSpring(useTransform(y, [-0.5, 0.5], [maxTilt, -maxTilt]), { stiffness: 300, damping: 30 });
  const rotateY = useSpring(useTransform(x, [-0.5, 0.5], [-maxTilt, maxTilt]), { stiffness: 300, damping: 30 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el) return;
    const { left, top, width, height } = el.getBoundingClientRect();
    x.set((e.clientX - left) / width - 0.5);
    y.set((e.clientY - top) / height - 0.5);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return { ref, rotateX, rotateY, handleMouseMove, handleMouseLeave };
}

const Projects = () => {
  const [projects, setProjects] = useState<ProjectItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProject, setSelectedProject] = useState<ProjectItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'featured' | 'all'>('featured');
  const [carouselIndex, setCarouselIndex] = useState(0);
  const [carouselDir, setCarouselDir] = useState<1 | -1>(1);
  const sectionRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" });

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
  const otherProjects = useMemo(() => projects.filter(p => !p.is_featured), [projects]);
  const activeProjects = useMemo(() => projects.filter(p => p.is_active), [projects]);
  const displayProjects = activeTab === 'featured' ? featuredProjects : otherProjects;

  const handleProjectClick = (project: ProjectItem) => {
    setSelectedProject(project);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedProject(null);
  };

  const nextSlide = () => {
    setCarouselDir(1);
    setCarouselIndex(i => (i + 1) % featuredProjects.length);
  };

  const prevSlide = () => {
    setCarouselDir(-1);
    setCarouselIndex(i => (i - 1 + featuredProjects.length) % featuredProjects.length);
  };

  const getProjectImage = (p: ProjectItem) =>
    p.image_url || p.thumbnail_url || p.ui_image_url || null;

  // ──────────────── Featured Carousel ────────────────
  const FeaturedHero = () => {
    if (featuredProjects.length === 0) return null;
    const project = featuredProjects[carouselIndex];
    const imageUrl = getProjectImage(project);

    const slideVariants = {
      enter: (dir: number) => ({ x: dir > 0 ? 60 : -60, opacity: 0 }),
      center: { x: 0, opacity: 1, transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] } },
      exit: (dir: number) => ({ x: dir > 0 ? -60 : 60, opacity: 0, transition: { duration: 0.3 } }),
    };

    return (
      <div className="relative overflow-hidden rounded-3xl border border-gray-100 bg-gray-950 shadow-2xl">
        {/* Background image with parallax-like gradient */}
        <AnimatePresence custom={carouselDir} mode="wait">
          <motion.div
            key={carouselIndex}
            custom={carouselDir}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            className="relative"
          >
            <div className="grid md:grid-cols-2 min-h-[440px]">
              {/* Left: content */}
              <div className="flex flex-col justify-between p-8 md:p-12 z-10">
                <div>
                  <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-white/70 mb-6"
                  >
                    <Star className="h-3 w-3 text-amber-400" fill="currentColor" />
                    Featured
                  </motion.div>
                  {project.is_active && (
                    <motion.div
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.12 }}
                      className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-semibold text-emerald-300 mb-2"
                    >
                      <span className="relative flex h-1.5 w-1.5">
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                        <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400" />
                      </span>
                      In progress
                    </motion.div>
                  )}
                  <motion.h3
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 }}
                    className="text-3xl md:text-4xl font-bold text-white leading-tight"
                  >
                    {project.title}
                  </motion.h3>
                  <motion.p
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="mt-4 text-base text-white/70 leading-relaxed line-clamp-3"
                  >
                    {project.tagline}
                  </motion.p>
                  {project.tech_stack && project.tech_stack.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.25 }}
                      className="mt-5 flex flex-wrap gap-2"
                    >
                      {project.tech_stack.slice(0, 5).map(t => (
                        <span key={t} className="rounded-full border border-white/20 bg-white/10 px-3 py-0.5 text-xs font-medium text-white/80">
                          {t}
                        </span>
                      ))}
                    </motion.div>
                  )}
                </div>
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="mt-8 flex flex-wrap gap-3"
                >
                  <button
                    onClick={() => handleProjectClick(project)}
                    className="group inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-gray-900 transition-all hover:bg-gray-100 hover:gap-3 active:scale-95"
                  >
                    View details
                    <ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                  </button>
                  {(project.live_url || project.github_url) && (
                    <a
                      href={project.live_url || project.github_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-5 py-2.5 text-sm font-semibold text-white transition-all hover:bg-white/20 active:scale-95"
                    >
                      {project.live_url ? <><ExternalLink className="h-3.5 w-3.5" /> Live demo</> : <><Github className="h-3.5 w-3.5" /> Source code</>}
                    </a>
                  )}
                </motion.div>
              </div>

              {/* Right: image */}
              <div className="relative hidden md:block">
                {imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={imageUrl}
                    alt={project.title}
                    className="absolute inset-0 h-full w-full object-cover opacity-80"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Layers className="h-24 w-24 text-white/10" />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-r from-gray-950 via-gray-950/40 to-transparent" />
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Carousel controls */}
        {featuredProjects.length > 1 && (
          <div className="absolute bottom-6 right-6 z-20 flex items-center gap-3">
            <div className="flex gap-1.5 mr-2">
              {featuredProjects.map((_, i) => (
                <button
                  key={i}
                  onClick={() => { setCarouselDir(i > carouselIndex ? 1 : -1); setCarouselIndex(i); }}
                  className={`h-1.5 rounded-full transition-all duration-300 ${i === carouselIndex ? 'w-6 bg-white' : 'w-1.5 bg-white/30 hover:bg-white/50'}`}
                  aria-label={`Go to slide ${i + 1}`}
                />
              ))}
            </div>
            <button
              onClick={prevSlide}
              className="flex h-8 w-8 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white transition-all hover:bg-white/25 hover:scale-110 active:scale-95"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={nextSlide}
              className="flex h-8 w-8 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white transition-all hover:bg-white/25 hover:scale-110 active:scale-95"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
    );
  };

  // ──────────────── Project Card ────────────────
  const ProjectCard = ({ project, index }: { project: ProjectItem; index: number }) => {
    const { ref, rotateX, rotateY, handleMouseMove, handleMouseLeave } = useTilt(6);
    const cardRef = useRef<HTMLDivElement>(null);
    const inView = useInView(cardRef, { once: true, margin: "-50px" });
    const imageUrl = getProjectImage(project);

    return (
      <motion.div
        ref={cardRef}
        initial={{ opacity: 0, y: 40 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.55, delay: index * 0.07, ease: [0.22, 1, 0.36, 1] }}
        style={{ perspective: 800 }}
      >
        <motion.div
          ref={ref}
          style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          onClick={() => handleProjectClick(project)}
          className="group relative cursor-pointer overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition-shadow hover:shadow-xl"
        >
          {/* Image */}
          <div className="relative aspect-[16/9] overflow-hidden bg-gray-100">
            {imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={imageUrl}
                alt={project.title}
                className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                loading="lazy"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
                <Layers className="h-12 w-12 text-gray-300" />
              </div>
            )}
            {/* Dark vignette on hover */}
            <div className="absolute inset-0 bg-black/0 transition-colors duration-300 group-hover:bg-black/10" />

            {/* Featured badge */}
            {project.is_featured && (
              <div className="absolute left-3 top-3 flex flex-col gap-1">
                <span className="inline-flex items-center gap-1 rounded-full bg-amber-500 px-2.5 py-0.5 text-xs font-semibold text-white shadow">
                  <Star className="h-2.5 w-2.5" fill="currentColor" /> Featured
                </span>
                {project.is_active && (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500 px-2.5 py-0.5 text-xs font-semibold text-white shadow">
                    <span className="relative flex h-1.5 w-1.5">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-75" />
                      <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-white" />
                    </span>
                    Active
                  </span>
                )}
              </div>
            )}
            {!project.is_featured && project.is_active && (
              <div className="absolute left-3 top-3">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500 px-2.5 py-0.5 text-xs font-semibold text-white shadow">
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-75" />
                    <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-white" />
                  </span>
                  Active
                </span>
              </div>
            )}

            {/* Hover overlay with quick links */}
            <div className="absolute inset-0 flex items-center justify-center gap-3 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
              <motion.button
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.95 }}
                onClick={(e) => { e.stopPropagation(); handleProjectClick(project); }}
                className="rounded-full bg-white/95 px-4 py-2 text-xs font-semibold text-gray-900 shadow-lg backdrop-blur-sm"
              >
                <ArrowUpRight className="inline h-3.5 w-3.5 mr-1 -mt-0.5" />
                Details
              </motion.button>
              {project.github_url && (
                <motion.a
                  whileHover={{ scale: 1.08 }}
                  whileTap={{ scale: 0.95 }}
                  href={project.github_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={e => e.stopPropagation()}
                  className="rounded-full bg-gray-900/90 px-4 py-2 text-xs font-semibold text-white shadow-lg backdrop-blur-sm"
                >
                  <Github className="inline h-3.5 w-3.5 mr-1 -mt-0.5" />
                  Code
                </motion.a>
              )}
              {project.live_url && (
                <motion.a
                  whileHover={{ scale: 1.08 }}
                  whileTap={{ scale: 0.95 }}
                  href={project.live_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={e => e.stopPropagation()}
                  className="rounded-full bg-gray-900/90 px-4 py-2 text-xs font-semibold text-white shadow-lg backdrop-blur-sm"
                >
                  <ExternalLink className="inline h-3.5 w-3.5 mr-1 -mt-0.5" />
                  Live
                </motion.a>
              )}
            </div>
          </div>

          {/* Card body */}
          <div className="p-5">
            <h3 className="text-base font-semibold text-gray-900 leading-snug transition-colors group-hover:text-gray-700 line-clamp-1">
              {project.title}
            </h3>
            <p className="mt-1.5 text-sm text-gray-500 leading-relaxed line-clamp-2">
              {project.tagline}
            </p>

            {/* Tech pills */}
            {project.tech_stack && project.tech_stack.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-1.5">
                {project.tech_stack.slice(0, 4).map(t => (
                  <span key={t} className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-600 transition-colors group-hover:bg-gray-200">
                    {t}
                  </span>
                ))}
                {project.tech_stack.length > 4 && (
                  <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-400">
                    +{project.tech_stack.length - 4}
                  </span>
                )}
              </div>
            )}

            {/* Footer row */}
            <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-3">
              <span className="text-xs text-gray-400">{project.role}</span>
              <motion.span
                className="inline-flex items-center gap-1 text-xs font-semibold text-gray-900 opacity-0 transition-opacity group-hover:opacity-100"
                initial={false}
              >
                View <ArrowUpRight className="h-3 w-3" />
              </motion.span>
            </div>
          </div>

          {/* Subtle shine on hover */}
          <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
            style={{ background: "radial-gradient(400px circle at var(--mouse-x, 50%) var(--mouse-y, 50%), rgba(255,255,255,0.06), transparent 40%)" }} />
        </motion.div>
      </motion.div>
    );
  };

  return (
    <section id="projects" className="relative overflow-hidden bg-white py-24 md:py-32" ref={sectionRef}>
      {/* Subtle grid background */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: "linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />

      <div className="container relative z-10 mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          className="mb-14"
        >
          <span className="text-xs font-semibold uppercase tracking-[0.3em] text-gray-400">
            Portfolio
          </span>
          <h2 className="mt-3 text-4xl font-bold text-gray-900 sm:text-5xl">
            My{" "}
            <span className="relative inline-block">
              Projects
              <motion.span
                className="absolute -bottom-1 left-0 h-0.5 bg-gray-900"
                initial={{ scaleX: 0 }}
                animate={isInView ? { scaleX: 1 } : {}}
                transition={{ duration: 0.6, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
                style={{ originX: 0 }}
              />
            </span>
          </h2>
          <p className="mt-4 max-w-xl text-base text-gray-500">
            A selection of projects across AI, blockchain, and full-stack engineering.
          </p>
        </motion.div>

        {/* Currently active banner */}
        {!loading && activeProjects.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.05, ease: [0.22, 1, 0.36, 1] }}
            className="mb-10 flex flex-wrap items-center gap-3 rounded-2xl border border-emerald-100 bg-emerald-50/60 px-5 py-3.5"
          >
            <div className="flex items-center gap-2 text-sm font-semibold text-emerald-700">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
              </span>
              Currently building
            </div>
            <span className="h-3.5 w-px bg-emerald-200" />
            {activeProjects.map((p) => (
              <button
                key={p.id}
                onClick={() => handleProjectClick(p)}
                className="rounded-full border border-emerald-200 bg-white px-3 py-1 text-xs font-medium text-emerald-700 transition-colors hover:border-emerald-300 hover:bg-emerald-50"
              >
                {p.title}
              </button>
            ))}
          </motion.div>
        )}

        {/* Featured Hero Carousel */}
        {!loading && featuredProjects.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 32 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            className="mb-16"
          >
            <FeaturedHero />
          </motion.div>
        )}

        {/* Tab Selector */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mb-8 flex items-center gap-1 rounded-xl bg-gray-100 p-1 w-fit"
        >
          {[
            { key: 'featured', label: `Featured (${featuredProjects.length})` },
            { key: 'all', label: `All Projects (${otherProjects.length})` },
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as 'featured' | 'all')}
              className="relative rounded-lg px-5 py-2 text-sm font-semibold transition-colors"
            >
              {activeTab === tab.key && (
                <motion.span
                  layoutId="tab-bg"
                  className="absolute inset-0 rounded-lg bg-white shadow-sm"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.4 }}
                />
              )}
              <span className={`relative z-10 transition-colors ${activeTab === tab.key ? 'text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}>
                {tab.label}
              </span>
            </button>
          ))}
        </motion.div>

        {/* Grid */}
        {loading ? (
          <LoadingAnimation label="Loading projects..." />
        ) : displayProjects.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="rounded-2xl border border-dashed border-gray-200 p-16 text-center text-gray-400"
          >
            No projects found.
          </motion.div>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3"
            >
              {displayProjects.map((project, i) => (
                <ProjectCard key={project.id} project={project} index={i} />
              ))}
            </motion.div>
          </AnimatePresence>
        )}
      </div>

      {selectedProject && (
        <ProjectModal
          open={isModalOpen}
          onClose={handleCloseModal}
          project={selectedProject}
        />
      )}
    </section>
  );
};

export default Projects;
