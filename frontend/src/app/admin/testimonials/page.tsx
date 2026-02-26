"use client";

import React, { useCallback, useEffect, useState } from "react";
import AdminShell from "@/components/admin/AdminShell";
import AdminSectionHeader from "@/components/admin/AdminSectionHeader";
import withAdminAuth from "@/hoc/withAdminAuth";
import { adminApi, TestimonialResponse } from "@/services/api";
import { StarIcon } from "@heroicons/react/24/solid";
import {
  CheckCircleIcon,
  XCircleIcon,
  TrashIcon,
  ArrowTopRightOnSquareIcon,
} from "@heroicons/react/24/outline";

// ─── Copy ─────────────────────────────────────────────────────────────────────

const copy = {
  title: "Testimonials",
  description: "Review and approve public testimonial submissions.",
  pendingTitle: "Pending Review",
  approvedTitle: "Approved",
  rejectedTitle: "Rejected",
  emptyPending: "No pending testimonials. All caught up!",
  emptyApproved: "No approved testimonials yet.",
  emptyRejected: "No rejected testimonials.",
  approve: "Approve",
  reject: "Reject",
  delete: "Delete",
  loadError: "Failed to load testimonials. Please refresh.",
};

// ─── Status badge ─────────────────────────────────────────────────────────────

const statusConfig: Record<
  string,
  { label: string; className: string }
> = {
  pending: { label: "Pending", className: "bg-amber-100 text-amber-700" },
  approved: { label: "Approved", className: "bg-emerald-100 text-emerald-700" },
  rejected: { label: "Rejected", className: "bg-red-100 text-red-700" },
};

function StatusBadge({ status }: { status: string }) {
  const cfg = statusConfig[status] ?? {
    label: status,
    className: "bg-gray-100 text-gray-600",
  };
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${cfg.className}`}
    >
      {cfg.label}
    </span>
  );
}

// ─── Testimonial card ─────────────────────────────────────────────────────────

function TestimonialCard({
  item,
  onApprove,
  onReject,
  onDelete,
  loading,
}: {
  item: TestimonialResponse;
  onApprove?: () => void;
  onReject?: () => void;
  onDelete: () => void;
  loading: boolean;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      {/* Header row */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-slate-200 text-sm font-semibold text-slate-700">
            {item.name.charAt(0)}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-gray-900">{item.name}</span>
              {item.linkedin_url && (
                <a
                  href={item.linkedin_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 hover:text-blue-700"
                  aria-label="LinkedIn profile"
                >
                  <ArrowTopRightOnSquareIcon className="h-4 w-4" />
                </a>
              )}
            </div>
            <p className="text-xs text-gray-500">
              {item.role}
              {item.company && ` @ ${item.company}`}
            </p>
          </div>
        </div>
        <StatusBadge status={item.status ?? "approved"} />
      </div>

      {/* Context tag */}
      {item.project_relation && (
        <div className="mt-3">
          <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700">
            {item.project_relation}
          </span>
        </div>
      )}

      {/* Rating */}
      {item.rating && (
        <div className="mt-3 flex gap-0.5">
          {Array.from({ length: 5 }).map((_, i) => (
            <StarIcon
              key={i}
              className={`h-4 w-4 ${
                i < item.rating! ? "text-amber-400" : "text-gray-200"
              }`}
            />
          ))}
        </div>
      )}

      {/* Content */}
      <blockquote className="mt-3 text-sm leading-relaxed text-gray-700">
        &ldquo;{item.content}&rdquo;
      </blockquote>

      {/* Meta */}
      <div className="mt-3 text-xs text-gray-400">
        Submitted:{" "}
        {new Date(item.created_at).toLocaleDateString("en-US", {
          year: "numeric",
          month: "short",
          day: "numeric",
        })}
        {item.submitter_email && ` · ${item.submitter_email}`}
      </div>

      {/* Actions */}
      <div className="mt-4 flex flex-wrap gap-2">
        {onApprove && (
          <button
            onClick={onApprove}
            disabled={loading}
            className="inline-flex items-center gap-1.5 rounded-full bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-50"
          >
            <CheckCircleIcon className="h-4 w-4" />
            {copy.approve}
          </button>
        )}
        {onReject && (
          <button
            onClick={onReject}
            disabled={loading}
            className="inline-flex items-center gap-1.5 rounded-full bg-amber-500 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-amber-600 disabled:opacity-50"
          >
            <XCircleIcon className="h-4 w-4" />
            {copy.reject}
          </button>
        )}
        <button
          onClick={onDelete}
          disabled={loading}
          className="inline-flex items-center gap-1.5 rounded-full border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-600 transition hover:bg-red-100 disabled:opacity-50"
        >
          <TrashIcon className="h-4 w-4" />
          {copy.delete}
        </button>
      </div>
    </div>
  );
}

// ─── Section ──────────────────────────────────────────────────────────────────

function Section({
  title,
  count,
  empty,
  children,
  highlight,
}: {
  title: string;
  count: number;
  empty: string;
  children: React.ReactNode;
  highlight?: boolean;
}) {
  return (
    <section>
      <div className="mb-4 flex items-center gap-3">
        <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
        <span
          className={`flex h-6 min-w-[1.5rem] items-center justify-center rounded-full px-2 text-xs font-bold ${
            highlight && count > 0
              ? "bg-amber-400 text-white"
              : "bg-slate-200 text-slate-600"
          }`}
        >
          {count}
        </span>
      </div>
      {count === 0 ? (
        <p className="text-sm text-gray-500">{empty}</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{children}</div>
      )}
    </section>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

const TestimonialsAdminPage = () => {
  const [all, setAll] = useState<TestimonialResponse[]>([]);
  const [loadError, setLoadError] = useState("");
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  const reload = useCallback(async () => {
    setLoadError("");
    try {
      const data = await adminApi.adminGetAllTestimonials();
      setAll(data);
    } catch {
      setLoadError(copy.loadError);
    }
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  const act = async (id: number, fn: () => Promise<unknown>) => {
    setActionLoading(id);
    try {
      await fn();
      await reload();
    } finally {
      setActionLoading(null);
    }
  };

  const pending = all.filter((t) => t.status === "pending");
  const approved = all.filter((t) => t.status === "approved");
  const rejected = all.filter((t) => t.status === "rejected");

  return (
    <AdminShell>
      <AdminSectionHeader
        title={copy.title}
        description={copy.description}
      />

      {loadError && (
        <p className="mb-6 rounded-lg bg-red-50 p-3 text-sm text-red-600">
          {loadError}
        </p>
      )}

      <div className="space-y-12">
        {/* Pending */}
        <Section
          title={copy.pendingTitle}
          count={pending.length}
          empty={copy.emptyPending}
          highlight
        >
          {pending.map((item) => (
            <TestimonialCard
              key={item.id}
              item={item}
              loading={actionLoading === item.id}
              onApprove={() =>
                act(item.id, () => adminApi.adminApproveTestimonial(item.id))
              }
              onReject={() =>
                act(item.id, () => adminApi.adminRejectTestimonial(item.id))
              }
              onDelete={() =>
                act(item.id, () => adminApi.adminDeleteTestimonial(item.id))
              }
            />
          ))}
        </Section>

        {/* Approved */}
        <Section
          title={copy.approvedTitle}
          count={approved.length}
          empty={copy.emptyApproved}
        >
          {approved.map((item) => (
            <TestimonialCard
              key={item.id}
              item={item}
              loading={actionLoading === item.id}
              onReject={() =>
                act(item.id, () => adminApi.adminRejectTestimonial(item.id))
              }
              onDelete={() =>
                act(item.id, () => adminApi.adminDeleteTestimonial(item.id))
              }
            />
          ))}
        </Section>

        {/* Rejected */}
        <Section
          title={copy.rejectedTitle}
          count={rejected.length}
          empty={copy.emptyRejected}
        >
          {rejected.map((item) => (
            <TestimonialCard
              key={item.id}
              item={item}
              loading={actionLoading === item.id}
              onApprove={() =>
                act(item.id, () => adminApi.adminApproveTestimonial(item.id))
              }
              onDelete={() =>
                act(item.id, () => adminApi.adminDeleteTestimonial(item.id))
              }
            />
          ))}
        </Section>
      </div>
    </AdminShell>
  );
};

export default withAdminAuth(TestimonialsAdminPage);
