"use client";

import { useEffect, useState, useRef } from "react";
import { motion, useInView } from "framer-motion";
import {
  Code2,
  Clock,
  CheckCircle2,
  PauseCircle,
  FileText,
  ArrowUpRight,
  Hammer,
} from "lucide-react";
import { apiService, CurrentlyWorkingOnResponse } from "@/services/api";
import LoadingAnimation from "@/components/ui/LoadingAnimation";

// ---------------------------------------------------------------------------
// Status config
// ---------------------------------------------------------------------------
type Status = CurrentlyWorkingOnResponse["status"];

const STATUS_CONFIG: Record<
  Status,
  { label: string; icon: React.ElementType; bg: string; text: string; pulse?: boolean }
> = {
  planning: {
    label: "Planning",
    icon: FileText,
    bg: "bg-blue-50",
    text: "text-blue-700",
  },
  in_progress: {
    label: "In Progress",
    icon: Clock,
    bg: "bg-emerald-50",
    text: "text-emerald-700",
    pulse: true,
  },
  paused: {
    label: "Paused",
    icon: PauseCircle,
    bg: "bg-amber-50",
    text: "text-amber-700",
  },
  completed: {
    label: "Completed",
    icon: CheckCircle2,
    bg: "bg-gray-100",
    text: "text-gray-600",
  },
};

// ---------------------------------------------------------------------------
// Tag pill
// ---------------------------------------------------------------------------
const TagPill = ({ label }: { label: string }) => (
  <span className="rounded-full border border-gray-200 bg-white px-3 py-1 text-[11px] font-medium text-gray-600">
    {label}
  </span>
);

// ---------------------------------------------------------------------------
// Project card
// ---------------------------------------------------------------------------
interface ProjectCardProps {
  project: CurrentlyWorkingOnResponse;
  index: number;
}

const ProjectCard = ({ project, index }: ProjectCardProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.25 });

  const cfg = STATUS_CONFIG[project.status] ?? STATUS_CONFIG.in_progress;
  const StatusIcon = cfg.icon;
  const tags = project.tags ? project.tags.split(",").map((t) => t.trim()) : [];

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 24 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay: index * 0.1, ease: [0.22, 1, 0.36, 1] }}
    >
      <motion.a
        href={project.project_url || "#"}
        target={project.project_url ? "_blank" : undefined}
        rel={project.project_url ? "noopener noreferrer" : undefined}
        whileHover={{ y: -4 }}
        transition={{ type: "spring", stiffness: 400, damping: 22 }}
        className="group relative flex h-full flex-col overflow-hidden rounded-[28px] border border-gray-100 bg-white p-7 shadow-sm hover:shadow-lg hover:border-gray-200 transition-shadow"
      >
        {/* Top row: icon + status badge */}
        <div className="mb-5 flex items-start justify-between">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-gray-100 bg-gray-50 text-gray-500">
            <Code2 className="h-5 w-5" />
          </div>

          <span
            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold ${cfg.bg} ${cfg.text}`}
          >
            {cfg.pulse && project.status === "in_progress" && (
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
              </span>
            )}
            {!cfg.pulse && <StatusIcon className="h-3.5 w-3.5" />}
            {cfg.label}
          </span>
        </div>

        {/* Title + description */}
        <h3 className="mb-2 text-lg font-semibold text-gray-900 leading-snug">
          {project.title}
        </h3>
        <p className="mb-5 flex-1 text-sm leading-relaxed text-gray-500">
          {project.description}
        </p>

        {/* Progress bar */}
        {project.progress_percentage !== undefined && (
          <div className="mb-5">
            <div className="mb-2 flex items-center justify-between text-xs">
              <span className="font-medium text-gray-500">Progress</span>
              <span className="tabular-nums font-semibold text-gray-700">
                {project.progress_percentage}%
              </span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-100">
              <motion.div
                initial={{ width: 0 }}
                animate={inView ? { width: `${project.progress_percentage}%` } : {}}
                transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1], delay: 0.3 }}
                className="h-full rounded-full bg-gray-800"
              />
            </div>
          </div>
        )}

        {/* Tags */}
        {tags.length > 0 && (
          <div className="mb-5 flex flex-wrap gap-1.5">
            {tags.map((tag) => (
              <TagPill key={tag} label={tag} />
            ))}
          </div>
        )}

        {/* Footer CTA */}
        <div className="flex items-center gap-1.5 border-t border-gray-100 pt-4">
          <Hammer className="h-3.5 w-3.5 text-gray-400" />
          <span className="text-xs font-semibold text-gray-500 group-hover:text-gray-900 transition-colors">
            {project.project_url ? "View project" : "Coming soon"}
          </span>
          {project.project_url && (
            <ArrowUpRight className="ml-auto h-4 w-4 text-gray-400 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-gray-700" />
          )}
        </div>
      </motion.a>
    </motion.div>
  );
};

// ---------------------------------------------------------------------------
// Main section
// ---------------------------------------------------------------------------
const CurrentlyWorkingOn = () => {
  const [projects, setProjects] = useState<CurrentlyWorkingOnResponse[]>([]);
  const [loading, setLoading] = useState(true);

  const sectionRef = useRef<HTMLDivElement>(null);
  const inView = useInView(sectionRef, { once: true, amount: 0.15 });

  useEffect(() => {
    apiService
      .getCurrentlyWorkingOn()
      .then(setProjects)
      .catch((err) => console.error("Failed to fetch current projects", err))
      .finally(() => setLoading(false));
  }, []);

  const activeCount = projects.filter((p) => p.status === "in_progress").length;

  if (loading) {
    return (
      <section className="bg-white py-24 md:py-32">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <LoadingAnimation label="Loading projects…" />
        </div>
      </section>
    );
  }

  if (projects.length === 0) return null;

  return (
    <section
      id="currently-working-on"
      ref={sectionRef}
      className="relative overflow-hidden bg-white py-24 md:py-32"
    >
      <div className="container relative z-10 mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          className="mb-16 flex flex-col items-center text-center"
        >
          <span className="text-xs font-semibold uppercase tracking-[0.25em] text-gray-400">
            Now
          </span>
          <h2 className="mt-2 text-3xl font-semibold leading-tight text-gray-900 sm:text-4xl lg:text-5xl">
            Currently Building
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-gray-500 leading-relaxed">
            What I&apos;m actively shipping right now — tracked honestly by status and
            progress.
          </p>

          {activeCount > 0 && (
            <div className="mt-5 inline-flex items-center gap-2 rounded-full border border-emerald-100 bg-emerald-50 px-4 py-2 text-sm font-medium text-emerald-700">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
              </span>
              {activeCount} project{activeCount > 1 ? "s" : ""} in progress
            </div>
          )}
        </motion.div>

        {/* Cards grid */}
        <div className="grid gap-6 md:grid-cols-2">
          {projects.map((project, idx) => (
            <ProjectCard key={project.id} project={project} index={idx} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default CurrentlyWorkingOn;
