"use client";
import React, { useEffect, useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { ArrowRightIcon } from '@heroicons/react/24/outline';
import { apiService } from '@/services/api';
import ProjectModal from './ProjectModal';
import TechStackExplorer from './TechStackExplorer';

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
  features?: string[];
  tech_stack?: string[];
  metrics_users?: string;
  metrics_performance?: string;
  metrics_impact?: string;
  solo_contributions?: string;
  tech_decisions?: string;
}

const copy = {
  eyebrow: 'PORTFOLIO',
  title: 'Signature Projects',
  cta: 'Get full catalog',
  loading: 'Loading projects...',
  empty: 'No projects found.',
  details: 'Check Details',
};

const Projects = () => {
  const [projects, setProjects] = useState<ProjectItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProject, setSelectedProject] = useState<ProjectItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState<string | null>(null);

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

  // Extract all unique technologies from projects
  const allTechnologies = useMemo(() => {
    const techs = projects.flatMap(p => p.tech_stack || []);
    return Array.from(new Set(techs));
  }, [projects]);

  // Filter projects based on active technology
  const filteredProjects = useMemo(() => {
    if (!activeFilter) return projects;
    return projects.filter(p => 
      p.tech_stack?.some(tech => tech.toLowerCase() === activeFilter.toLowerCase())
    );
  }, [projects, activeFilter]);

  const handleProjectClick = (project: ProjectItem) => {
    setSelectedProject(project);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedProject(null);
  };

  return (
    <section id="projects" className="relative overflow-hidden bg-white py-24 md:py-32">
      <div className="container relative z-10 mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header row */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6 }}
          className="mb-12 flex flex-wrap items-end justify-between gap-4"
        >
          <div>
            <span className="text-xs font-semibold uppercase tracking-[0.25em] text-gray-500">
              {copy.eyebrow}
            </span>
            <h2 className="mt-2 text-3xl font-semibold text-gray-900 sm:text-4xl lg:text-5xl">
              {copy.title}
            </h2>
          </div>
          <a
            href="#contact"
            className="flex items-center gap-1 text-sm font-medium text-gray-900 hover:underline"
          >
            {copy.cta} <ArrowRightIcon className="h-4 w-4" />
          </a>
        </motion.div>

        {loading ? (
          <div className="text-center text-gray-500">{copy.loading}</div>
        ) : projects.length > 0 ? (
          <>
            {/* Tech Stack Explorer */}
            {allTechnologies.length > 0 && (
              <TechStackExplorer
                technologies={allTechnologies}
                onFilter={setActiveFilter}
                activeFilter={activeFilter}
              />
            )}

            {filteredProjects.length > 0 ? (
              <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                {filteredProjects.map((project, idx) => {
              const imageSrc =
                project.thumbnail_url || project.image_url || project.ui_image_url;
              return (
                <motion.article
                  key={project.id}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{ duration: 0.5, delay: idx * 0.1 }}
                  className="group flex cursor-pointer flex-col overflow-hidden rounded-[28px] border border-gray-200/60 bg-gray-50/50 transition-all duration-300 hover:shadow-xl hover:border-gray-300"
                  onClick={() => handleProjectClick(project)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => e.key === 'Enter' && handleProjectClick(project)}
                >
                  {/* Image */}
                  <div className="relative aspect-[4/3] w-full overflow-hidden bg-gray-100">
                    {imageSrc ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={imageSrc}
                        alt={project.title}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                        loading="lazy"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-xs text-gray-400">
                        Preview coming soon
                      </div>
                    )}
                    {/* Badge overlay */}
                    <span className="absolute right-4 top-4 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-gray-900 shadow backdrop-blur-sm">
                      {project.role}
                    </span>
                    {project.team_size === 1 && (
                      <span className="absolute left-4 top-4 rounded-full bg-purple-500/90 px-3 py-1 text-xs font-semibold text-white shadow backdrop-blur-sm">
                        Solo Dev
                      </span>
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex flex-1 flex-col p-6">
                    <h3 className="text-lg font-semibold text-gray-900">{project.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-gray-600">
                      {project.tagline}
                    </p>
                    
                    {/* Metrics display */}
                    {(project.metrics_users || project.metrics_performance || project.metrics_impact) && (
                      <div className="mt-4 flex flex-wrap gap-2">
                        {project.metrics_users && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700">
                            <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                            </svg>
                            {project.metrics_users}
                          </span>
                        )}
                        {project.metrics_performance && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-2.5 py-1 text-xs font-medium text-green-700">
                            <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                            {project.metrics_performance}
                          </span>
                        )}
                        {project.metrics_impact && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-700">
                            <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                            </svg>
                            {project.metrics_impact}
                          </span>
                        )}
                      </div>
                    )}
                    <div className="mt-auto pt-6">
                      <button
                        type="button"
                        className="inline-flex items-center gap-1 text-sm font-medium text-gray-900 hover:underline"
                      >
                        {copy.details} <ArrowRightIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </motion.article>
              );
            })}
          </div>
            ) : (
              <div className="text-center text-gray-500">No projects match the selected technology.</div>
            )}
          </>
        ) : (
          <div className="text-center text-gray-500">{copy.empty}</div>
        )}
      </div>

      {/* Project Modal */}
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
