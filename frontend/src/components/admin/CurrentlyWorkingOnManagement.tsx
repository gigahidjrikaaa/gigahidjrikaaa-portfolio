"use client";

import { useEffect, useState } from "react";
import { PlusIcon, PencilIcon, TrashIcon, CodeBracketIcon } from "@heroicons/react/24/outline";
import { adminApi, CurrentlyWorkingOnResponse } from "@/services/api";
import { Card, CardContent } from "@/components/ui/card";
import LoadingAnimation from "@/components/ui/LoadingAnimation";

const copy = {
  title: "Currently Working On",
  subtitle: "Manage active projects and their progress.",
  add: "Add Project",
  delete: "Delete Project",
  edit: "Edit Project",
  confirmDelete: "Are you sure you want to delete this project?",
  title: "Project Title",
  description: "Description",
  projectUrl: "Project URL",
  status: "Status",
  progress: "Progress (%)",
  tags: "Tags (comma separated)",
  save: "Save",
  cancel: "Cancel",
  loading: "Loading...",
  statuses: {
    planning: "Planning",
    in_progress: "In Progress",
    paused: "Paused",
    completed: "Completed",
  },
};

const CurrentlyWorkingOnManagement = () => {
  const [projects, setProjects] = useState<CurrentlyWorkingOnResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingProject, setEditingProject] = useState<CurrentlyWorkingOnResponse | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    project_url: "",
    status: "in_progress" as const,
    progress_percentage: 0,
    tags: "",
    is_public: true,
    display_order: 0,
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await adminApi.getCurrentlyWorkingOn();
        setProjects(data);
      } catch (error) {
        console.error("Failed to fetch current projects", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleAdd = () => {
    setEditingProject(null);
    setFormData({
      title: "",
      description: "",
      project_url: "",
      status: "in_progress",
      progress_percentage: 0,
      tags: "",
      is_public: true,
      display_order: projects.length,
    });
    setIsModalOpen(true);
  };

  const handleEdit = (project: CurrentlyWorkingOnResponse) => {
    setEditingProject(project);
    setFormData({
      title: project.title,
      description: project.description,
      project_url: project.project_url || "",
      status: project.status,
      progress_percentage: project.progress_percentage || 0,
      tags: project.tags || "",
      is_public: project.is_public,
      display_order: project.display_order,
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm(copy.confirmDelete)) return;

    try {
      await adminApi.deleteCurrentlyWorkingOn(id);
      setProjects(projects.filter((p) => p.id !== id));
    } catch (error) {
      console.error("Failed to delete project", error);
    }
  };

  const handleSave = async () => {
    try {
      if (editingProject) {
        const updated = await adminApi.updateCurrentlyWorkingOn(editingProject.id, formData);
        setProjects(projects.map((p) => (p.id === editingProject.id ? updated : p)));
      } else {
        const created = await adminApi.createCurrentlyWorkingOn(formData);
        setProjects([...projects, created]);
      }
      setIsModalOpen(false);
    } catch (error) {
      console.error("Failed to save project", error);
    }
  };

  if (loading) {
    return <LoadingAnimation label={copy.loading} />;
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">{copy.title}</h2>
          <p className="text-sm text-gray-500">{copy.subtitle}</p>
        </div>
        <button
          onClick={handleAdd}
          className="inline-flex items-center gap-2 rounded-full bg-gray-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-gray-800"
        >
          <PlusIcon className="h-4 w-4" />
          {copy.add}
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {projects.map((project) => (
          <Card key={project.id} className="overflow-hidden">
            <CardContent className="p-6">
              <div className="flex items-start gap-4 mb-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-50">
                  <CodeBracketIcon className="h-6 w-6 text-purple-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 mb-2">
                    {project.title}
                  </h3>
                  <div className="flex items-center gap-2">
                    <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
                      {copy.statuses[project.status]}
                    </span>
                    {project.progress_percentage !== undefined && (
                      <span className="text-sm text-gray-600">
                        {project.progress_percentage}% complete
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {project.description && (
                <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                  {project.description}
                </p>
              )}

              {project.progress_percentage !== undefined && (
                <div className="mb-4">
                  <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-purple-600 to-pink-600"
                      style={{ width: `${project.progress_percentage}%` }}
                    />
                  </div>
                </div>
              )}

              {project.tags && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {project.tags.split(",").map((tag, index) => (
                    <span
                      key={index}
                      className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700"
                    >
                      {tag.trim()}
                    </span>
                  ))}
                </div>
              )}

              <div className="flex items-center justify-between">
                {project.project_url && (
                  <a
                    href={project.project_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-purple-600 hover:underline"
                  >
                    View Project
                  </a>
                )}
                <div className="flex items-center gap-2">
                  <button onClick={() => handleEdit(project)} className="p-1 rounded hover:bg-gray-100">
                    <PencilIcon className="h-4 w-4 text-gray-600" />
                  </button>
                  <button onClick={() => handleDelete(project.id)} className="p-1 rounded hover:bg-gray-100 text-red-600">
                    <TrashIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">
            <h3 className="text-xl font-semibold text-gray-900 mb-6">
              {editingProject ? copy.edit : copy.add}
            </h3>

            <div className="space-y-4 max-h-[70vh] overflow-y-auto">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {copy.title}
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {copy.description}
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {copy.projectUrl}
                </label>
                <input
                  type="text"
                  value={formData.project_url}
                  onChange={(e) => setFormData({ ...formData, project_url: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {copy.status}
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as 'planning' | 'in_progress' | 'paused' | 'completed' })}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2"
                >
                  <option value="planning">{copy.statuses.planning}</option>
                  <option value="in_progress">{copy.statuses.in_progress}</option>
                  <option value="paused">{copy.statuses.paused}</option>
                  <option value="completed">{copy.statuses.completed}</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {copy.progress}
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={formData.progress_percentage}
                  onChange={(e) => setFormData({ ...formData, progress_percentage: parseInt(e.target.value) || 0 })}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {copy.tags}
                </label>
                <input
                  type="text"
                  value={formData.tags}
                  onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2"
                  placeholder="React, TypeScript, Next.js"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="public"
                  checked={formData.is_public}
                  onChange={(e) => setFormData({ ...formData, is_public: e.target.checked })}
                  className="h-4 w-4 rounded border-gray-300"
                />
                <label htmlFor="public" className="text-sm text-gray-700">
                  Public
                </label>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button onClick={() => setIsModalOpen(false)} className="rounded-full border border-gray-300 px-6 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-50">
                {copy.cancel}
              </button>
              <button onClick={handleSave} className="rounded-full bg-gray-900 px-6 py-2 text-sm font-semibold text-white transition hover:bg-gray-800">
                {copy.save}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CurrentlyWorkingOnManagement;
