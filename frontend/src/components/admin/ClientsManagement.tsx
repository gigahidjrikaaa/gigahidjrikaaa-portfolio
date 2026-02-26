"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PlusIcon, PencilIcon, TrashIcon, PhotoIcon, BuildingOffice2Icon } from "@heroicons/react/24/outline";
import { adminApi, ClientResponse } from "@/services/api";
import { Card, CardContent } from "@/components/ui/card";
import LoadingAnimation from "@/components/ui/LoadingAnimation";
import AdminModal from "@/components/admin/AdminModal";
import { useToast } from "@/components/ui/toast";

const EMPTY_FORM = {
  name: "",
  logo_url: "",
  website_url: "",
  description: "",
  is_featured: false,
  display_order: 0,
};

const INPUT_CLS =
  "w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/10 transition";

const ClientsManagement = () => {
  const { toast } = useToast();
  const [clients, setClients] = useState<ClientResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingClient, setEditingClient] = useState<ClientResponse | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState(EMPTY_FORM);

  const fetchClients = async () => {
    try {
      setLoading(true);
      const data = await adminApi.getClients();
      setClients(data);
    } catch {
      toast({ variant: "error", title: "Failed to load clients" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchClients(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const openAdd = () => {
    setEditingClient(null);
    setFormData({ ...EMPTY_FORM, display_order: clients.length });
    setIsModalOpen(true);
  };

  const openEdit = (client: ClientResponse) => {
    setEditingClient(client);
    setFormData({
      name: client.name,
      logo_url: client.logo_url,
      website_url: client.website_url || "",
      description: client.description || "",
      is_featured: client.is_featured,
      display_order: client.display_order,
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this client?")) return;
    try {
      await adminApi.deleteClient(id);
      setClients((prev) => prev.filter((c) => c.id !== id));
      toast({ variant: "success", title: "Client deleted" });
    } catch {
      toast({ variant: "error", title: "Failed to delete client" });
    }
  };

  const handleSave = async () => {
    if (!formData.name.trim()) {
      toast({ variant: "error", title: "Client name is required" });
      return;
    }
    setSaving(true);
    try {
      if (editingClient) {
        const updated = await adminApi.updateClient(editingClient.id, formData);
        setClients((prev) => prev.map((c) => (c.id === editingClient.id ? updated : c)));
        toast({ variant: "success", title: "Client updated" });
      } else {
        const created = await adminApi.createClient(formData);
        setClients((prev) => [...prev, created]);
        toast({ variant: "success", title: "Client added" });
      }
      setIsModalOpen(false);
    } catch {
      toast({ variant: "error", title: "Failed to save client" });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingAnimation label="Loading clients…" />;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-slate-900">Client Logos</h2>
          <p className="mt-1 text-sm text-slate-500">Manage companies and organisations you&apos;ve worked with.</p>
        </div>
        <button
          onClick={openAdd}
          className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-700 focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2"
        >
          <PlusIcon className="h-4 w-4" />
          Add Client
        </button>
      </div>

      {/* Empty state */}
      {clients.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 py-20 text-center"
        >
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-100">
            <BuildingOffice2Icon className="h-8 w-8 text-slate-400" />
          </div>
          <h3 className="mt-4 text-base font-semibold text-slate-900">No clients yet</h3>
          <p className="mt-1 text-sm text-slate-500">Add your first client logo to showcase your collaborations.</p>
          <button
            onClick={openAdd}
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-slate-900 px-5 py-2 text-sm font-semibold text-white transition hover:bg-slate-700"
          >
            <PlusIcon className="h-4 w-4" />
            Add Client
          </button>
        </motion.div>
      )}

      {/* Grid */}
      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        <AnimatePresence>
          {clients.map((client, index) => (
            <motion.div
              key={client.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.18, delay: index * 0.04 }}
            >
              <Card className="overflow-hidden shadow-sm transition-shadow hover:shadow-md">
                <CardContent className="p-5">
                  {/* Logo preview */}
                  <div className="relative mb-4 flex h-20 items-center justify-center overflow-hidden rounded-xl bg-slate-50">
                    {client.logo_url ? (
                      <Image
                        fill
                        src={client.logo_url}
                        alt={client.name}
                        className="object-contain"
                        sizes="80px"
                      />
                    ) : (
                      <PhotoIcon className="h-10 w-10 text-slate-300" />
                    )}
                  </div>

                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-slate-900">{client.name}</p>
                      {client.description && (
                        <p className="mt-0.5 line-clamp-2 text-xs text-slate-500">
                          {client.description}
                        </p>
                      )}
                      {client.is_featured && (
                        <span className="mt-2 inline-block rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-semibold text-amber-700">
                          Featured
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="mt-4 flex items-center justify-between">
                    {client.website_url ? (
                      <a
                        href={client.website_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs font-medium text-purple-600 hover:underline"
                      >
                        Visit site ↗
                      </a>
                    ) : (
                      <span />
                    )}
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => openEdit(client)}
                        aria-label="Edit client"
                        className="flex h-7 w-7 items-center justify-center rounded-md transition hover:bg-slate-100"
                      >
                        <PencilIcon className="h-4 w-4 text-slate-600" />
                      </button>
                      <button
                        onClick={() => handleDelete(client.id)}
                        aria-label="Delete client"
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
            title={editingClient ? "Edit Client" : "Add Client"}
            description={editingClient ? "Update the client details below." : "Fill in the details for the new client."}
            onClose={() => setIsModalOpen(false)}
            maxWidthClass="max-w-lg"
          >
            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700" htmlFor="client-name">
                  Client Name <span className="text-rose-500">*</span>
                </label>
                <input
                  id="client-name"
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData((f) => ({ ...f, name: e.target.value }))}
                  placeholder="Acme Corporation"
                  className={INPUT_CLS}
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700" htmlFor="client-logo">
                  Logo URL
                </label>
                <input
                  id="client-logo"
                  type="url"
                  value={formData.logo_url}
                  onChange={(e) => setFormData((f) => ({ ...f, logo_url: e.target.value }))}
                  placeholder="https://..."
                  className={INPUT_CLS}
                />
                {formData.logo_url && (
                  <div className="relative mt-2 flex h-16 w-full items-center justify-center overflow-hidden rounded-lg bg-slate-50">
                    <Image fill src={formData.logo_url} alt="preview" className="object-contain" sizes="200px" />
                  </div>
                )}
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700" htmlFor="client-website">
                  Website URL
                </label>
                <input
                  id="client-website"
                  type="url"
                  value={formData.website_url}
                  onChange={(e) => setFormData((f) => ({ ...f, website_url: e.target.value }))}
                  placeholder="https://..."
                  className={INPUT_CLS}
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700" htmlFor="client-desc">
                  Description
                </label>
                <textarea
                  id="client-desc"
                  value={formData.description}
                  onChange={(e) => setFormData((f) => ({ ...f, description: e.target.value }))}
                  rows={3}
                  placeholder="Brief description of the client or collaboration…"
                  className={INPUT_CLS}
                />
              </div>

              <label className="flex cursor-pointer items-center gap-3">
                <input
                  type="checkbox"
                  checked={formData.is_featured}
                  onChange={(e) => setFormData((f) => ({ ...f, is_featured: e.target.checked }))}
                  className="h-4 w-4 cursor-pointer rounded border-slate-300 text-slate-900 focus:ring-slate-900"
                />
                <span className="text-sm font-medium text-slate-700">Mark as Featured</span>
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
                  {saving ? "Saving…" : editingClient ? "Update Client" : "Add Client"}
                </button>
              </div>
            </div>
          </AdminModal>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ClientsManagement;
