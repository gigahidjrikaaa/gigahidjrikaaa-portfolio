"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PlusIcon, PencilIcon, TrashIcon, CodeBracketIcon, RocketLaunchIcon } from "@heroicons/react/24/outline";
import { adminApi, CurrentlyWorkingOnResponse } from "@/services/api";
import { Card, CardContent } from "@/components/ui/card";
import LoadingAnimation from "@/components/ui/LoadingAnimation";
import AdminModal from "@/components/admin/AdminModal";
import { useToast } from "@/components/ui/toast";


type ProjectStatus = "planning" | "in_progress" | "paused" | "completed";

const STATUS_LABELS: Record<ProjectStatus, string> = {
  planning: "Planning",
  in_progress: "In Progress",
  paused: "Paused",
  completed: "Completed",
};

const STATUS_COLORS: Record<ProjectStatus, string> = {
  planning: "bg-slate-100 text-slate-700",
  in_progress: "bg-emerald-100 text-emerald-700",
  paused: "bg-amber-100 text-amber-700",
  completed: "bg-blue-100 text-blue-700",
};

const EMPTY_FORM = {
  title: "",
  description: "",
  project_url: "",
  status: "in_progress" as ProjectStatus,
  progress_percentage: 0,
  tags: "",
  is_public: true,
  display_order: 0,
};

const INPUT_CLS =
  "w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/10 transition";

const CurrentlyWorkingOnManagement = () => {
  const { toast } = useToast();
  const [projects, setProjects] = useState<CurrentlyWorkingOnResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingProject, setEditingProject] = useState<CurrentlyWorkingOnResponse | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState(EMPTY_FORM);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const data = await adminApi.getCurrentlyWorkingOn();
      setProjects(data);
    } catch {
      toast({ variant: "error", title: "Failed to load projects" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProjects(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const openAdd = () => {
    setEditingProject(null);
    setFormData({ ...EMPTY_FORM, display_order: projects.length });
    setIsModalOpen(true);
  };

  const openEdit = (project: CurrentlyWorkingOnResponse) => {
    setEditingProject(project);
    setFormData({
      title: project.title,
      description: project.description,
      project_url: project.project_url || "",
      status: project.status as ProjectStatus,
      progress_percentage: project.progress_percentage || 0,
      tags: project.tags || "",
      is_public: project.is_public,
      display_order: project.display_order,
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this project?")) return;
    try {
      await adminApi.deleteCurrentlyWorkingOn(id);
      setProjects((prev) => prev.filter((p) => p.id !== id));
      toast({ variant: "success", title: "Project deleted" });
    } catch {
      toast({ variant: "error", title: "Failed to delete project" });
    }
  };

  const handleSave = async () => {
    if (!formData.title.trim()) {
      toast({ variant: "error", title: "Project title is required" });
      return;
    }
    setSaving(true);
    try {
      if (editingProject) {
        const updated = await adminApi.updateCurrentlyWorkingOn(editingProject.id, formData);
        setProjects((prev) => prev.map((p) => (p.id === editingProject.id ? updated : p)));
        toast({ variant: "success", title: "Project updated" });
      } else {
        const created = await adminApi.createCurrentlyWorkingOn(formData);
        setProjects((prev) => [...prev, created]);
        toast({ variant: "success", title: "Project added" });
      }
      setIsModalOpen(false);
    } catch {
      toast({ variant: "error", title: "Failed to save project" });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingAnimation label="Loading projects…" />;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-slate-900">Currently Working On</h2>
          <p className="mt-1 text-sm text-slate-500">Manage active projects and their progress.</p>
        </div>
        <button
          onClick={openAdd}
          className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-900"
        >
          <PlusIcon className="h-4 w-4" />
          Add Project
        </button>
      </div>

      {/* Empty state */}
      {projects.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 py-20 text-center"
        >
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-100">
            <RocketLaunchIcon className="h-8 w-8 text-slate-400" />
          </div>
          <h3 className="mt-4 text-base font-semibold text-slate-900">No active projects yet</h3>
          <p className="mt-1 text-sm text-slate-500">Add a project you&apos;re currently working on.</p>
          <button
            onClick={openAdd}
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-slate-900 px-5 py-2 text-sm font-semibold text-white transition hover:bg-slate-700"
          >
            <PlusIcon className="h-4 w-4" />
            Add Project
          </button>
        </motion.div>
      )}

      {/* Grid */}
      <div className="grid gap-4 sm:grid-cols-2">
        <AnimatePresence>
          {projects.map((project, index) => {
            const status = project.status as ProjectStatus;
            const progress = project.progress_percentage ?? 0;
            return (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.96 }}
                transition={{ duration: 0.18, delay: index * 0.04 }}
              >
                <Card className="overflow-hidden shadow-sm transition-shadow hover:shadow-md">
                  <CardContent className="p-5">
                    {/* Title row */}
                    <div className="mb-3 flex items-start gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-purple-50">
                        <CodeBracketIcon className="h-5 w-5 text-purple-600" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-slate-900">{project.title}</p>
                        <div className="mt-1 flex items-center gap-2">
                          <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${STATUS_COLORS[status] ?? "bg-slate-100 text-slate-700"}`}>
                            {STATUS_LABELS[status] ?? status}
                          </span>
                          <span className="text-xs text-slate-500">{progress}%</span>
                        </div>
                      </div>
                    </div>

                    {project.description && (
                      <p className="mb-3 line-clamp-2 text-xs text-slate-500">{project.description}</p>
                    )}

                    {/* Progress bar */}
                    <div className="mb-3">
                      <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-purple-600 to-pink-500 transition-all duration-300"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>

                    {/* Tags */}
                    {project.tags && (
                      <div className="mb-3 flex flex-wrap gap-1.5">
                        {project.tags.split(",").map((tag, i) => (
                          <span
                            key={i}
                            className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600"
                          >
                            {tag.trim()}
                          </span>
                        ))}
                      </div>
                    )}

                    <div className="flex items-center justify-between">
                      {project.project_url ? (
                        <a
                          href={project.project_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs font-medium text-purple-600 hover:underline"
                        >
                          View project ↗
                        </a>
                      ) : (
                        <span />
                      )}
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => openEdit(project)}
                          aria-label="Edit project"
                          className="flex h-7 w-7 items-center justify-center rounded-md transition hover:bg-slate-100"
                        >
                          <PencilIcon className="h-4 w-4 text-slate-600" />
                        </button>
                        <button
                          onClick={() => handleDelete(project.id)}
                          aria-label="Delete project"
                          className="flex h-7 w-7 items-center justify-center rounded-md text-rose-600 transition hover:bg-rose-50"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <AdminModal
            title={editingProject ? "Edit Project" : "Add Project"}
            description={editingProject ? "Update the project details below." : "Fill in the details for the new active project."}
            onClose={() => setIsModalOpen(false)}
          >
            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700" htmlFor="cwo-title">
                  Project Title <span className="text-rose-500">*</span>
                </label>
                <input
                  id="cwo-title"
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData((f) => ({ ...f, title: e.target.value }))}
                  placeholder="E.g. Portfolio Redesign"
                  className={INPUT_CLS}
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700" htmlFor="cwo-desc">
                  Description
                </label>
                <textarea
                  id="cwo-desc"
                  value={formData.description}
                  onChange={(e) => setFormData((f) => ({ ...f, description: e.target.value }))}
                  rows={3}
                  placeholder="What are you building?"
                  className={INPUT_CLS}
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700" htmlFor="cwo-status">
                    Status
                  </label>
                  <select
                    id="cwo-status"
                    value={formData.status}
                    onChange={(e) => setFormData((f) => ({ ...f, status: e.target.value as ProjectStatus }))}
                    className={INPUT_CLS}
                  >
                    {(Object.keys(STATUS_LABELS) as ProjectStatus[]).map((s) => (
                      <option key={s} value={s}>{STATUS_LABELS[s]}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700" htmlFor="cwo-progress">
                    Progress ({formData.progress_percentage}%)
                  </label>
                  <input
                    id="cwo-progress"
                    type="range"
                    min={0}
                    max={100}
                    step={5}
                    value={formData.progress_percentage}
                    onChange={(e) => setFormData((f) => ({ ...f, progress_percentage: parseInt(e.target.value) }))}
                    className="w-full accent-slate-900"
                  />
                  <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-purple-600 to-pink-500"
                      style={{ width: `${formData.progress_percentage}%` }}
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700" htmlFor="cwo-url">
                  Project URL
                </label>
                <input
                  id="cwo-url"
                  type="url"
                  value={formData.project_url}
                  onChange={(e) => setFormData((f) => ({ ...f, project_url: e.target.value }))}
                  placeholder="https://github.com/..."
                  className={INPUT_CLS}
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700" htmlFor="cwo-tags">
                  Tags <span className="text-xs font-normal text-slate-400">(comma-separated)</span>
                </label>
                <input
                  id="cwo-tags"
                  type="text"
                  value={formData.tags}
                  onChange={(e) => setFormData((f) => ({ ...f, tags: e.target.value }))}
                  placeholder="React, TypeScript, Next.js"
                  className={INPUT_CLS}
                />
              </div>

              <label className="flex cursor-pointer items-center gap-3">
                <input
                  type="checkbox"
                  checked={formData.is_public}
                  onChange={(e) => setFormData((f) => ({ ...f, is_public: e.target.checked }))}
                  className="h-4 w-4 cursor-pointer rounded border-slate-300 text-slate-900 focus:ring-slate-900"
                />
                <span className="text-sm font-medium text-slate-700">Visible to public</span>
              </label>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-full border border-slate-200 px-5 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={saving}
                  className="rounded-full bg-slate-900 px-5 py-2 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:opacity-60"
                >
                  {saving ? "Saving…" : editingProject ? "Update Project" : "Add Project"}
                </button>
              </div>
            </div>
          </AdminModal>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CurrentlyWorkingOnManagement;
