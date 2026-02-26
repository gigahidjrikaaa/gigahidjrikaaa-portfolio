"use client";

import { useCallback, useEffect, useState } from "react";
import {
  FiActivity,
  FiCheck,
  FiClock,
  FiRefreshCw,
  FiSettings,
  FiX,
  FiZap,
} from "react-icons/fi";

import {
  approveAutopilotAction,
  getAutopilotStatus,
  listAutopilotActions,
  rejectAutopilotAction,
  type AdminAutopilotAction,
  type AdminAutopilotStatus,
} from "@/services/adminAutopilotApi";

import AdminShell from "@/components/admin/AdminShell";
import AdminSectionHeader from "@/components/admin/AdminSectionHeader";
import withAdminAuth from "@/hoc/withAdminAuth";

const REVIEWABLE = new Set(["awaiting_approval"]);

const STATUS_STYLES: Record<string, string> = {
  awaiting_approval: "bg-amber-100 text-amber-700 border-amber-200",
  approved: "bg-blue-100 text-blue-700 border-blue-200",
  running: "bg-indigo-100 text-indigo-700 border-indigo-200",
  completed: "bg-emerald-100 text-emerald-700 border-emerald-200",
  rejected: "bg-red-100 text-red-700 border-red-200",
  failed: "bg-red-100 text-red-700 border-red-200",
};

function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${STATUS_STYLES[status] ?? "bg-gray-100 text-gray-700 border-gray-200"}`}
    >
      {status.replace(/_/g, " ")}
    </span>
  );
}

const AutopilotPage = () => {
  const [status, setStatus] = useState<AdminAutopilotStatus | null>(null);
  const [actions, setActions] = useState<AdminAutopilotAction[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [st, acts] = await Promise.all([getAutopilotStatus(), listAutopilotActions()]);
      setStatus(st);
      setActions(acts);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load autopilot data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleApprove = async (id: number) => {
    setActionLoading(id);
    try {
      const updated = await approveAutopilotAction(id);
      setActions((prev) => prev.map((a) => (a.id === id ? updated : a)));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to approve action");
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (id: number) => {
    setActionLoading(id);
    try {
      const updated = await rejectAutopilotAction(id);
      setActions((prev) => prev.map((a) => (a.id === id ? updated : a)));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to reject action");
    } finally {
      setActionLoading(null);
    }
  };

  const pendingCount = actions.filter((a) => REVIEWABLE.has(a.status)).length;

  return (
    <AdminShell>
      <AdminSectionHeader
        title="Autopilot"
        description="Review and manage automated actions queued by the autopilot system."
      />

      {/* Status bar */}
      <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          {
            icon: <FiZap className="h-5 w-5 text-indigo-500" />,
            label: "Status",
            value: status ? (status.enabled ? "Active" : "Paused") : "—",
            accent: status?.enabled ? "text-emerald-600" : "text-gray-500",
          },
          {
            icon: <FiClock className="h-5 w-5 text-amber-500" />,
            label: "Awaiting approval",
            value: String(pendingCount),
            accent: pendingCount > 0 ? "text-amber-600" : "text-gray-600",
          },
          {
            icon: <FiActivity className="h-5 w-5 text-blue-500" />,
            label: "Completed today",
            value: String(status?.actions_completed_today ?? 0),
            accent: "text-gray-700",
          },
          {
            icon: <FiSettings className="h-5 w-5 text-gray-400" />,
            label: "Last run",
            value: status?.last_run
              ? new Date(status.last_run).toLocaleTimeString()
              : "Never",
            accent: "text-gray-500",
          },
        ].map(({ icon, label, value, accent }) => (
          <div
            key={label}
            className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white p-4 shadow-sm"
          >
            {icon}
            <div>
              <p className="text-xs text-gray-500">{label}</p>
              <p className={`text-lg font-semibold tabular-nums ${accent}`}>{value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Error banner */}
      {error && (
        <div className="mb-4 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <FiX className="h-4 w-4 shrink-0" />
          {error}
          <button className="ml-auto underline" onClick={() => setError(null)}>
            Dismiss
          </button>
        </div>
      )}

      {/* Actions table */}
      <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
          <h2 className="text-sm font-semibold text-gray-800">Action Queue</h2>
          <button
            onClick={load}
            disabled={loading}
            className="flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-50"
          >
            <FiRefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16 text-gray-400 text-sm">
            Loading actions…
          </div>
        ) : actions.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 py-16 text-gray-400">
            <FiActivity className="h-8 w-8" />
            <p className="text-sm">No autopilot actions yet.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {actions.map((action) => (
              <div
                key={action.id}
                className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-xs text-gray-400">#{action.id}</span>
                    <span className="rounded bg-gray-100 px-1.5 py-0.5 font-mono text-xs text-gray-600">
                      {action.type}
                    </span>
                    <StatusBadge status={action.status} />
                  </div>
                  <p className="mt-1 truncate text-sm text-gray-700">{action.description}</p>
                  <p className="mt-0.5 text-xs text-gray-400">
                    {new Date(action.created_at).toLocaleString()}
                  </p>
                </div>

                {REVIEWABLE.has(action.status) && (
                  <div className="flex shrink-0 gap-2">
                    <button
                      onClick={() => handleApprove(action.id)}
                      disabled={actionLoading === action.id}
                      className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-emerald-700 disabled:opacity-50"
                    >
                      <FiCheck className="h-3.5 w-3.5" />
                      Approve
                    </button>
                    <button
                      onClick={() => handleReject(action.id)}
                      disabled={actionLoading === action.id}
                      className="flex items-center gap-1.5 rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-100 disabled:opacity-50"
                    >
                      <FiX className="h-3.5 w-3.5" />
                      Reject
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </AdminShell>
  );
};

export default withAdminAuth(AutopilotPage);
