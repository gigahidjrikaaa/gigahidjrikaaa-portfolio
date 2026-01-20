"use client";
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRightIcon } from '@heroicons/react/24/outline';
import { apiService } from '@/services/api';
import ProjectModal from './ProjectModal';

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
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {projects.map((project, idx) => {
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
                  </div>

                  {/* Content */}
                  <div className="flex flex-1 flex-col p-6">
                    <h3 className="text-lg font-semibold text-gray-900">{project.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-gray-600">
                      {project.tagline}
                    </p>
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
