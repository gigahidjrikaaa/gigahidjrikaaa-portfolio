"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowDownIcon,
  ArrowUpIcon,
  PencilIcon,
  PlusIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import {
  adminApi,
  HighlightedGitHubRepoBase,
  HighlightedGitHubRepoResponse,
} from "@/services/api";
import LoadingAnimation from "@/components/ui/LoadingAnimation";
import AdminModal from "@/components/admin/AdminModal";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/components/ui/toast";

const EMPTY_FORM: HighlightedGitHubRepoBase = {
  owner: "gigahidjrikaaa",
  repo_name: "",
  is_active: true,
  display_order: 0,
};

const INPUT_CLS =
  "w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/10 transition";

const GitHubReposManagement = () => {
  const { toast } = useToast();
  const [repos, setRepos] = useState<HighlightedGitHubRepoResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRepo, setEditingRepo] = useState<HighlightedGitHubRepoResponse | null>(null);
  const [formData, setFormData] = useState<HighlightedGitHubRepoBase>(EMPTY_FORM);

  const fetchRepos = async () => {
    try {
      setLoading(true);
      const data = await adminApi.getAdminHighlightedGitHubRepos();
      setRepos(data);
    } catch {
      toast({ variant: "error", title: "Failed to load highlighted repositories" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRepos();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const openAdd = () => {
    setEditingRepo(null);
    setFormData({ ...EMPTY_FORM, display_order: repos.length });
    setIsModalOpen(true);
  };

  const openEdit = (repo: HighlightedGitHubRepoResponse) => {
    setEditingRepo(repo);
    setFormData({
      owner: repo.owner,
      repo_name: repo.repo_name,
      is_active: repo.is_active,
      display_order: repo.display_order,
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to remove this highlighted repository?")) {
      return;
    }

    try {
      await adminApi.deleteHighlightedGitHubRepo(id);
      setRepos((prev) => prev.filter((repo) => repo.id !== id));
      toast({ variant: "success", title: "Highlighted repository removed" });
    } catch {
      toast({ variant: "error", title: "Failed to remove highlighted repository" });
    }
  };

  const handleSave = async () => {
    if (!formData.owner.trim() || !formData.repo_name.trim()) {
      toast({ variant: "error", title: "Owner and repository name are required" });
      return;
    }

    setSaving(true);
    try {
      if (editingRepo) {
        const updated = await adminApi.updateHighlightedGitHubRepo(editingRepo.id, formData);
        setRepos((prev) => prev.map((repo) => (repo.id === editingRepo.id ? updated : repo)));
        toast({ variant: "success", title: "Highlighted repository updated" });
      } else {
        const created = await adminApi.createHighlightedGitHubRepo(formData);
        setRepos((prev) => [...prev, created]);
        toast({ variant: "success", title: "Highlighted repository added" });
      }
      setIsModalOpen(false);
    } catch {
      toast({
        variant: "error",
        title: "Failed to save repository. Make sure this owner/repo pair is not duplicated.",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleMove = async (index: number, direction: number) => {
    const newIndex = index + direction;
    if (newIndex < 0 || newIndex >= repos.length) {
      return;
    }

    const reordered = [...repos];
    [reordered[index], reordered[newIndex]] = [reordered[newIndex], reordered[index]];

    try {
      const updated = await Promise.all(
        reordered.map((repo, order) =>
          adminApi.updateHighlightedGitHubRepo(repo.id, { display_order: order })
        )
      );
      setRepos(updated);
      toast({ variant: "success", title: "Display order updated" });
    } catch {
      toast({ variant: "error", title: "Failed to reorder highlighted repositories" });
    }
  };

  if (loading) {
    return <LoadingAnimation label="Loading highlighted repositories..." />;
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-slate-900">Highlighted GitHub Repositories</h2>
          <p className="mt-1 text-sm text-slate-500">
            Pin repositories that should appear in the highlighted section first.
          </p>
        </div>
        <button
          onClick={openAdd}
          className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-700 focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2"
        >
          <PlusIcon className="h-4 w-4" />
          Add Highlight
        </button>
      </div>

      {repos.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border-2 border-dashed border-slate-200 py-16 text-center"
        >
          <p className="text-base font-semibold text-slate-900">No highlighted repositories yet</p>
          <p className="mt-1 text-sm text-slate-500">Add a repository to control your Highlighted section.</p>
          <button
            onClick={openAdd}
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-slate-900 px-5 py-2 text-sm font-semibold text-white transition hover:bg-slate-700"
          >
            <PlusIcon className="h-4 w-4" />
            Add Highlight
          </button>
        </motion.div>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        <AnimatePresence>
          {repos.map((repo, index) => (
            <motion.div
              key={repo.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.97 }}
              transition={{ duration: 0.2 }}
            >
              <Card className="overflow-hidden shadow-sm transition-shadow hover:shadow-md">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">GitHub Repo</p>
                      <p className="mt-1 text-base font-semibold text-slate-900">
                        {repo.owner}/{repo.repo_name}
                      </p>
                      <a
                        href={`https://github.com/${repo.owner}/${repo.repo_name}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-1 inline-block text-xs font-medium text-blue-600 hover:underline"
                      >
                        Open on GitHub ↗
                      </a>
                    </div>
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                        repo.is_active ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {repo.is_active ? "Active" : "Hidden"}
                    </span>
                  </div>

                  <div className="mt-4 flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleMove(index, -1)}
                        disabled={index === 0}
                        aria-label="Move up"
                        className="flex h-7 w-7 items-center justify-center rounded-md transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-30"
                      >
                        <ArrowUpIcon className="h-4 w-4 text-slate-600" />
                      </button>
                      <button
                        onClick={() => handleMove(index, 1)}
                        disabled={index === repos.length - 1}
                        aria-label="Move down"
                        className="flex h-7 w-7 items-center justify-center rounded-md transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-30"
                      >
                        <ArrowDownIcon className="h-4 w-4 text-slate-600" />
                      </button>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => openEdit(repo)}
                        aria-label="Edit repository"
                        className="flex h-7 w-7 items-center justify-center rounded-md transition hover:bg-slate-100"
                      >
                        <PencilIcon className="h-4 w-4 text-slate-600" />
                      </button>
                      <button
                        onClick={() => handleDelete(repo.id)}
                        aria-label="Delete repository"
                        className="flex h-7 w-7 items-center justify-center rounded-md text-rose-600 transition hover:bg-rose-50"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {isModalOpen && (
          <AdminModal
            title={editingRepo ? "Edit Highlighted Repository" : "Add Highlighted Repository"}
            description="Use owner and repository name exactly as on GitHub."
            onClose={() => setIsModalOpen(false)}
            maxWidthClass="max-w-lg"
          >
            <div className="space-y-4">
              <div>
                <label htmlFor="repo-owner" className="mb-1 block text-sm font-medium text-slate-700">
                  Owner
                </label>
                <input
                  id="repo-owner"
                  type="text"
                  value={formData.owner}
                  onChange={(event) => setFormData((prev) => ({ ...prev, owner: event.target.value }))}
                  placeholder="gigahidjrikaaa"
                  className={INPUT_CLS}
                />
              </div>

              <div>
                <label htmlFor="repo-name" className="mb-1 block text-sm font-medium text-slate-700">
                  Repository Name
                </label>
                <input
                  id="repo-name"
                  type="text"
                  value={formData.repo_name}
                  onChange={(event) => setFormData((prev) => ({ ...prev, repo_name: event.target.value }))}
                  placeholder="repo-name"
                  className={INPUT_CLS}
                />
              </div>

              <label className="flex cursor-pointer items-center gap-3">
                <input
                  type="checkbox"
                  checked={formData.is_active}
                  onChange={(event) => setFormData((prev) => ({ ...prev, is_active: event.target.checked }))}
                  className="h-4 w-4 cursor-pointer rounded border-slate-300 text-slate-900 focus:ring-slate-900"
                />
                <span className="text-sm font-medium text-slate-700">Visible in highlighted section</span>
              </label>

              <div>
                <label htmlFor="repo-order" className="mb-1 block text-sm font-medium text-slate-700">
                  Display Order
                </label>
                <input
                  id="repo-order"
                  type="number"
                  value={formData.display_order}
                  onChange={(event) =>
                    setFormData((prev) => ({ ...prev, display_order: Number(event.target.value) || 0 }))
                  }
                  className={INPUT_CLS}
                />
              </div>

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
                  {saving ? "Saving..." : editingRepo ? "Update Highlight" : "Add Highlight"}
                </button>
              </div>
            </div>
          </AdminModal>
        )}
      </AnimatePresence>
    </div>
  );
};

export default GitHubReposManagement;
