"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PlusIcon, PencilIcon, TrashIcon, NewspaperIcon, ArrowTopRightOnSquareIcon } from "@heroicons/react/24/outline";
import { adminApi, PressMentionResponse } from "@/services/api";
import ImportFromUrl from "@/components/admin/ImportFromUrl";
import { Card, CardContent } from "@/components/ui/card";
import LoadingAnimation from "@/components/ui/LoadingAnimation";
import AdminModal from "@/components/admin/AdminModal";
import { useToast } from "@/components/ui/toast";

const EMPTY_FORM = {
  title: "",
  publication: "",
  publication_url: "",
  publication_date: "",
  excerpt: "",
  image_url: "",
  is_featured: false,
  display_order: 0,
};

const INPUT_CLS =
  "w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/10 transition";

const PressMentionsManagement = () => {
  const { toast } = useToast();
  const [mentions, setMentions] = useState<PressMentionResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingMention, setEditingMention] = useState<PressMentionResponse | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState(EMPTY_FORM);

  const fetchMentions = async () => {
    try {
      setLoading(true);
      const data = await adminApi.getPressMentions();
      setMentions(data);
    } catch {
      toast({ variant: "error", title: "Failed to load press mentions" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchMentions(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const openAdd = () => {
    setEditingMention(null);
    setFormData({ ...EMPTY_FORM, display_order: mentions.length });
    setIsModalOpen(true);
  };

  const openEdit = (mention: PressMentionResponse) => {
    setEditingMention(mention);
    setFormData({
      title: mention.title,
      publication: mention.publication || "",
      publication_url: mention.publication_url || "",
      publication_date: mention.publication_date || "",
      excerpt: mention.excerpt || "",
      image_url: mention.image_url || "",
      is_featured: mention.is_featured,
      display_order: mention.display_order,
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this press mention?")) return;
    try {
      await adminApi.deletePressMention(id);
      setMentions((prev) => prev.filter((m) => m.id !== id));
      toast({ variant: "success", title: "Press mention deleted" });
    } catch {
      toast({ variant: "error", title: "Failed to delete press mention" });
    }
  };

  const handleSave = async () => {
    if (!formData.title.trim()) {
      toast({ variant: "error", title: "Title is required" });
      return;
    }
    setSaving(true);
    try {
      if (editingMention) {
        const updated = await adminApi.updatePressMention(editingMention.id, formData);
        setMentions((prev) => prev.map((m) => (m.id === editingMention.id ? updated : m)));
        toast({ variant: "success", title: "Press mention updated" });
      } else {
        const created = await adminApi.createPressMention(formData);
        setMentions((prev) => [...prev, created]);
        toast({ variant: "success", title: "Press mention added" });
      }
      setIsModalOpen(false);
    } catch {
      toast({ variant: "error", title: "Failed to save press mention" });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingAnimation label="Loading press mentions…" />;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-slate-900">Press &amp; Media Mentions</h2>
          <p className="mt-1 text-sm text-slate-500">Manage articles, podcasts, and interviews featuring you.</p>
        </div>
        <button
          onClick={openAdd}
          className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-700 focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2"
        >
          <PlusIcon className="h-4 w-4" />
          Add Mention
        </button>
      </div>

      {/* Empty state */}
      {mentions.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 py-20 text-center"
        >
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-100">
            <NewspaperIcon className="h-8 w-8 text-slate-400" />
          </div>
          <h3 className="mt-4 text-base font-semibold text-slate-900">No press mentions yet</h3>
          <p className="mt-1 text-sm text-slate-500">Add articles or interviews that feature your work.</p>
          <button
            onClick={openAdd}
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-slate-900 px-5 py-2 text-sm font-semibold text-white transition hover:bg-slate-700"
          >
            <PlusIcon className="h-4 w-4" />
            Add Mention
          </button>
        </motion.div>
      )}

      {/* Grid */}
      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
        <AnimatePresence>
          {mentions.map((mention, index) => (
            <motion.div
              key={mention.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.18, delay: index * 0.04 }}
            >
              <Card className="overflow-hidden shadow-sm transition-shadow hover:shadow-md">
                <CardContent className="p-5">
                  <div className="mb-3 flex items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-purple-50">
                      <NewspaperIcon className="h-5 w-5 text-purple-600" />
                    </div>
                    <div className="min-w-0">
                      <p className="line-clamp-2 text-sm font-semibold text-slate-900 leading-snug">
                        {mention.title}
                      </p>
                      {mention.publication && (
                        <p className="mt-0.5 text-xs font-medium text-purple-700">{mention.publication}</p>
                      )}
                    </div>
                  </div>

                  {mention.publication_date && (
                    <p className="mb-2 text-xs text-slate-400">
                      {new Date(mention.publication_date).toLocaleDateString("en-US", {
                        year: "numeric", month: "short", day: "numeric",
                      })}
                    </p>
                  )}

                  {mention.excerpt && (
                    <p className="mb-3 line-clamp-2 text-xs text-slate-500">{mention.excerpt}</p>
                  )}

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {mention.is_featured && (
                        <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-700">
                          Featured
                        </span>
                      )}
                      {mention.publication_url && (
                        <a
                          href={mention.publication_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-xs font-medium text-purple-600 hover:underline"
                        >
                          View <ArrowTopRightOnSquareIcon className="h-3 w-3" />
                        </a>
                      )}
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => openEdit(mention)}
                        aria-label="Edit mention"
                        className="flex h-7 w-7 items-center justify-center rounded-md transition hover:bg-slate-100"
                      >
                        <PencilIcon className="h-4 w-4 text-slate-600" />
                      </button>
                      <button
                        onClick={() => handleDelete(mention.id)}
                        aria-label="Delete mention"
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

      {/* Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <AdminModal
            title={editingMention ? "Edit Press Mention" : "Add Press Mention"}
            description={editingMention ? "Update the mention details below." : "Fill in the details or import from a URL."}
            onClose={() => setIsModalOpen(false)}
          >
            <div className="space-y-4">
              {/* AI Import */}
              <ImportFromUrl
                contentType="press_mention"
                onImport={(d) =>
                  setFormData((f) => ({
                    ...f,
                    title: (d.title as string) || f.title,
                    publication: (d.publication as string) || f.publication,
                    publication_url: (d.publication_url as string) || f.publication_url,
                    publication_date: (d.publication_date as string) || f.publication_date,
                    excerpt: (d.excerpt as string) || f.excerpt,
                    image_url: (d.image_url as string) || f.image_url,
                  }))
                }
              />

              <div className="border-t border-slate-100 pt-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <label className="mb-1 block text-sm font-medium text-slate-700" htmlFor="pm-title">
                      Title <span className="text-rose-500">*</span>
                    </label>
                    <input
                      id="pm-title"
                      type="text"
                      value={formData.title}
                      onChange={(e) => setFormData((f) => ({ ...f, title: e.target.value }))}
                      placeholder="Article or interview title"
                      className={INPUT_CLS}
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium text-slate-700" htmlFor="pm-pub">
                      Publication
                    </label>
                    <input
                      id="pm-pub"
                      type="text"
                      value={formData.publication}
                      onChange={(e) => setFormData((f) => ({ ...f, publication: e.target.value }))}
                      placeholder="TechCrunch, Forbes, etc."
                      className={INPUT_CLS}
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium text-slate-700" htmlFor="pm-date">
                      Publication Date
                    </label>
                    <input
                      id="pm-date"
                      type="date"
                      value={formData.publication_date}
                      onChange={(e) => setFormData((f) => ({ ...f, publication_date: e.target.value }))}
                      className={INPUT_CLS}
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="mb-1 block text-sm font-medium text-slate-700" htmlFor="pm-url">
                      Publication URL
                    </label>
                    <input
                      id="pm-url"
                      type="url"
                      value={formData.publication_url}
                      onChange={(e) => setFormData((f) => ({ ...f, publication_url: e.target.value }))}
                      placeholder="https://..."
                      className={INPUT_CLS}
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="mb-1 block text-sm font-medium text-slate-700" htmlFor="pm-excerpt">
                      Excerpt
                    </label>
                    <textarea
                      id="pm-excerpt"
                      value={formData.excerpt}
                      onChange={(e) => setFormData((f) => ({ ...f, excerpt: e.target.value }))}
                      rows={3}
                      placeholder="Short quote or summary from the article…"
                      className={INPUT_CLS}
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="mb-1 block text-sm font-medium text-slate-700" htmlFor="pm-img">
                      Image URL
                    </label>
                    <input
                      id="pm-img"
                      type="url"
                      value={formData.image_url}
                      onChange={(e) => setFormData((f) => ({ ...f, image_url: e.target.value }))}
                      placeholder="https://..."
                      className={INPUT_CLS}
                    />
                  </div>
                </div>

                <label className="mt-4 flex cursor-pointer items-center gap-3">
                  <input
                    type="checkbox"
                    checked={formData.is_featured}
                    onChange={(e) => setFormData((f) => ({ ...f, is_featured: e.target.checked }))}
                    className="h-4 w-4 cursor-pointer rounded border-slate-300 text-slate-900 focus:ring-slate-900"
                  />
                  <span className="text-sm font-medium text-slate-700">Mark as Featured</span>
                </label>
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
                  {saving ? "Saving…" : editingMention ? "Update Mention" : "Add Mention"}
                </button>
              </div>
            </div>
          </AdminModal>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PressMentionsManagement;
