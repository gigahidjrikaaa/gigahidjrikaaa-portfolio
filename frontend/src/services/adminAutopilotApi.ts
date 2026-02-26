/**
 * Admin Autopilot API service
 * Wraps all autopilot-related admin endpoints.
 */

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000/api/v1";

// ─── Types ────────────────────────────────────────────────────────────────────

export type AutopilotActionStatus =
  | "awaiting_approval"
  | "approved"
  | "rejected"
  | "running"
  | "completed"
  | "failed";

export interface AdminAutopilotAction {
  id: number;
  type: string;
  description: string;
  status: AutopilotActionStatus;
  payload: Record<string, unknown>;
  result?: unknown;
  error?: string;
  created_at: string;
  updated_at: string;
}

export interface AdminAutopilotStatus {
  enabled: boolean;
  actions_pending: number;
  actions_completed_today: number;
  last_run?: string;
  policy: AutopilotPolicy;
}

export interface AutopilotPolicy {
  auto_approve_types: string[];
  require_approval_types: string[];
  max_daily_actions: number;
  enabled: boolean;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getAuthHeaders(): HeadersInit {
  if (typeof document === "undefined") return { "Content-Type": "application/json" };
  const token = document.cookie.match(/(?:^|; )admin_token=([^;]*)/)?.[1];
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${decodeURIComponent(token)}` } : {}),
  };
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: { ...getAuthHeaders(), ...(init?.headers ?? {}) },
  });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Autopilot API error ${res.status}: ${body}`);
  }
  // 204 No Content
  if (res.status === 204) return undefined as unknown as T;
  return res.json() as Promise<T>;
}

// ─── API functions ────────────────────────────────────────────────────────────

/** Fetch the current autopilot status and policy. */
export async function getAutopilotStatus(): Promise<AdminAutopilotStatus> {
  return request<AdminAutopilotStatus>("/admin/autopilot/status");
}

/** Fetch the list of all autopilot actions (ordered by created_at desc). */
export async function listAutopilotActions(): Promise<AdminAutopilotAction[]> {
  return request<AdminAutopilotAction[]>("/admin/autopilot/actions");
}

/** Approve an autopilot action that is awaiting approval. */
export async function approveAutopilotAction(id: number): Promise<AdminAutopilotAction> {
  return request<AdminAutopilotAction>(`/admin/autopilot/actions/${id}/approve`, {
    method: "POST",
  });
}

/** Reject an autopilot action that is awaiting approval. */
export async function rejectAutopilotAction(id: number): Promise<AdminAutopilotAction> {
  return request<AdminAutopilotAction>(`/admin/autopilot/actions/${id}/reject`, {
    method: "POST",
  });
}

/** Update the autopilot policy settings. */
export async function updateAutopilotPolicy(
  payload: Partial<AutopilotPolicy>
): Promise<AdminAutopilotStatus> {
  return request<AdminAutopilotStatus>("/admin/autopilot/policy", {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}
