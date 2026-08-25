import "server-only";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000/api/v1";

export const HOME_REVALIDATE_SECONDS = 300;

/**
 * Server-side data fetchers for ISR-rendered homepage sections.
 *
 * Contract: never throw. On any failure (network, non-OK status, unexpected
 * shape) they resolve to `null` so the page can prerender with fallback
 * content and self-heal on the next revalidation window.
 */

async function fetchJsonISR<T>(path: string): Promise<T | null> {
  try {
    const res = await fetch(`${API_BASE}${path}`, {
      next: { revalidate: HOME_REVALIDATE_SECONDS },
    });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

export interface ServerProfile {
  headline?: string | null;
  bio?: string | null;
  location?: string | null;
  availability?: string | null;
  avatar_url?: string | null;
  resume_url?: string | null;
  cv_url?: string | null;
}

export function getProfileISR(): Promise<ServerProfile | null> {
  return fetchJsonISR<ServerProfile>("/profile");
}

export interface ServerProject {
  id: number;
  title: string;
  tagline: string;
  description: string;
  github_url: string;
  live_url?: string;
  case_study_url?: string;
  image_url?: string;
  thumbnail_url?: string;
  ui_image_url?: string;
  role: string;
  team_size: number;
  challenges: string;
  solutions: string;
  impact: string;
  is_featured: boolean;
  is_active?: boolean;
  tech_stack?: string[];
  features?: string[];
  images?: { id: number; url: string; caption?: string; kind?: string; display_order?: number }[];
  metrics_users?: string;
  metrics_performance?: string;
  metrics_impact?: string;
  solo_contributions?: string;
  tech_decisions?: string;
}

export function getProjectsISR(): Promise<ServerProject[] | null> {
  return fetchJsonISR<ServerProject[]>("/projects").then((data) =>
    Array.isArray(data) ? data : null
  );
}
