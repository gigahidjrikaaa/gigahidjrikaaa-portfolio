"use client";

import { useState } from "react";
import Image from "next/image";
import { Sparkles, Loader2, AlertCircle, CheckCircle2, Link2, Info } from "lucide-react";
import { adminApi, ScrapeResult } from "@/services/api";

type ContentType = "press_mention" | "blog_article" | "project";

interface ImportFromUrlProps {
  contentType: ContentType;
  onImport: (data: ScrapeResult["data"]) => void;
  className?: string;
}

// ─── Platform detection ───────────────────────────────────────────────────────

interface Platform {
  key: string;
  name: string;
  /** Tailwind bg class for the badge */
  badgeBg: string;
  badgeText: string;
  /** Whether content is login-walled (admin must enter fields manually) */
  loginWalled: boolean;
  /** Whether content may be only partially accessible */
  partial: boolean;
}

const PLATFORMS: { pattern: RegExp; info: Platform }[] = [
  {
    pattern: /(?:twitter\.com|x\.com)\/\w+\/status\//i,
    info: { key: "twitter", name: "X (Twitter)", badgeBg: "bg-black", badgeText: "text-white", loginWalled: false, partial: true },
  },
  {
    pattern: /linkedin\.com\/pulse\//i,
    info: { key: "linkedin-article", name: "LinkedIn Article", badgeBg: "bg-[#0A66C2]", badgeText: "text-white", loginWalled: false, partial: true },
  },
  {
    pattern: /linkedin\.com/i,
    info: { key: "linkedin", name: "LinkedIn", badgeBg: "bg-[#0A66C2]", badgeText: "text-white", loginWalled: true, partial: false },
  },
  {
    pattern: /medium\.com/i,
    info: { key: "medium", name: "Medium", badgeBg: "bg-black", badgeText: "text-white", loginWalled: false, partial: false },
  },
  {
    pattern: /dev\.to/i,
    info: { key: "devto", name: "Dev.to", badgeBg: "bg-[#3B49DF]", badgeText: "text-white", loginWalled: false, partial: false },
  },
  {
    pattern: /hashnode\.(com|dev)/i,
    info: { key: "hashnode", name: "Hashnode", badgeBg: "bg-[#2962FF]", badgeText: "text-white", loginWalled: false, partial: false },
  },
  {
    pattern: /substack\.com/i,
    info: { key: "substack", name: "Substack", badgeBg: "bg-[#FF6719]", badgeText: "text-white", loginWalled: false, partial: false },
  },
  {
    pattern: /instagram\.com/i,
    info: { key: "instagram", name: "Instagram", badgeBg: "bg-gradient-to-r from-purple-500 to-pink-500", badgeText: "text-white", loginWalled: true, partial: false },
  },
  {
    pattern: /github\.com/i,
    info: { key: "github", name: "GitHub", badgeBg: "bg-[#24292E]", badgeText: "text-white", loginWalled: false, partial: false },
  },
];

function detectPlatform(url: string): Platform | null {
  for (const { pattern, info } of PLATFORMS) {
    if (pattern.test(url)) return info;
  }
  return null;
}

// ─── Copy ─────────────────────────────────────────────────────────────────────

const PLACEHOLDER: Record<ContentType, string> = {
  press_mention: "https://techcrunch.com/2024/01/article-about-you",
  blog_article:  "https://x.com/you/status/… or https://medium.com/@you/article",
  project:       "https://github.com/yourname/project",
};

const LABEL: Record<ContentType, string> = {
  press_mention: "Import from article / news URL",
  blog_article:  "Import from blog / article URL",
  project:       "Import from project / GitHub URL",
};

// ─── Component ────────────────────────────────────────────────────────────────

interface ImportPreview {
  title: string;
  source: string;
  imageUrl?: string;
  isPartial?: boolean;
  isLoginWalled?: boolean;
}

/**
 * Reusable "Import & Analyze" widget.
 * Fetches + AI-analyzes a URL, then calls `onImport` with the
 * pre-filled field data so the parent form can populate its fields.
 */
export default function ImportFromUrl({ contentType, onImport, className = "" }: ImportFromUrlProps) {
  const [url, setUrl]         = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState<string | null>(null);
  const [preview, setPreview] = useState<ImportPreview | null>(null);

  const detectedPlatform = detectPlatform(url.trim());

  const handleImport = async () => {
    const trimmed = url.trim();
    if (!trimmed) {
      setError("Please enter a URL first.");
      return;
    }
    if (!/^https?:\/\//i.test(trimmed)) {
      setError("URL must start with http:// or https://");
      return;
    }

    setLoading(true);
    setError(null);
    setPreview(null);

    try {
      const result = await adminApi.scrapeUrl(trimmed, contentType);
      const d = result.data;

      const title =
        (d.title as string) || (d.name as string) || "Untitled";
      const source =
        (d.external_source as string) ||
        (d.publication as string) ||
        (detectedPlatform?.name ?? new URL(trimmed).hostname);
      const imageUrl =
        (d.cover_image_url as string) ||
        (d.image_url as string) ||
        undefined;

      // `_social_platform` being set means the backend hit a limited-access path
      const hasSocialPlatformHint = Boolean(d._social_platform);
      const isLoginWalled  = detectedPlatform?.loginWalled  ?? false;
      const isPartial      = hasSocialPlatformHint && (detectedPlatform?.partial ?? false);

      setPreview({ title, source, imageUrl, isPartial, isLoginWalled });
      onImport(d);
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : "Failed to analyze URL. Please check the link and try again.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleImport();
    }
  };

  return (
    <div className={`rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-3 ${className}`}>
      {/* Header row */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 flex-wrap">
          <Sparkles className="h-3.5 w-3.5 text-slate-400 shrink-0" />
          <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">
            {LABEL[contentType]}
          </span>
          {/* Platform badge — shown as soon as a URL is typed */}
          {detectedPlatform && (
            <span
              className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold ${detectedPlatform.badgeBg} ${detectedPlatform.badgeText}`}
            >
              {detectedPlatform.name}
            </span>
          )}
        </div>
        <span className="text-xs text-slate-400 italic shrink-0">Powered by Z.AI</span>
      </div>

      {/* Login-walled warning (shown before import attempt) */}
      {detectedPlatform?.loginWalled && !preview && !loading && (
        <div className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2">
          <Info className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
          <p className="text-xs text-amber-800 leading-snug">
            <strong>{detectedPlatform.name}</strong> requires a login to access posts.
            Auto-fill will be limited — you&apos;ll need to enter the title and content manually.
          </p>
        </div>
      )}

      {/* URL input + button */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
          <input
            type="url"
            value={url}
            onChange={(e) => {
              setUrl(e.target.value);
              setError(null);
              setPreview(null);
            }}
            onKeyDown={handleKeyDown}
            placeholder={PLACEHOLDER[contentType]}
            className="w-full rounded-lg border border-slate-200 bg-white pl-9 pr-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/10 transition disabled:opacity-60"
            disabled={loading}
            aria-label="URL to analyze"
          />
        </div>

        <button
          type="button"
          onClick={handleImport}
          disabled={loading || !url.trim()}
          className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
          aria-label="Import and analyze URL"
        >
          {loading ? (
            <>
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              <span>Analyzing…</span>
            </>
          ) : (
            <>
              <Sparkles className="h-3.5 w-3.5" />
              <span>Import &amp; Analyze</span>
            </>
          )}
        </button>
      </div>

      {/* ── Success state ── */}
      {preview && !loading && (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 overflow-hidden">
          <div className="flex items-start gap-3 px-3 py-2.5">
            {/* Cover image thumbnail */}
            {preview.imageUrl && (
              <div className="relative h-14 w-20 shrink-0 overflow-hidden rounded-md border border-emerald-100">
                <Image
                  src={preview.imageUrl}
                  alt="Article cover"
                  fill
                  className="object-cover"
                  unoptimized
                />
              </div>
            )}

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                <span className="text-xs font-semibold text-emerald-700 truncate max-w-[260px]">
                  {preview.title}
                </span>
                {preview.source && (
                  <span className="text-[10px] font-medium text-emerald-600 bg-emerald-100 rounded-full px-2 py-0.5 shrink-0">
                    {preview.source}
                  </span>
                )}
              </div>

              {preview.isPartial ? (
                <p className="mt-1 text-[11px] text-amber-700 leading-snug">
                  <strong>Partial import</strong> — title and metadata were auto-filled. Review the excerpt and content fields below.
                </p>
              ) : preview.isLoginWalled ? (
                <p className="mt-1 text-[11px] text-amber-700 leading-snug">
                  Content is login-walled — fill in the title and body manually.
                </p>
              ) : (
                <p className="mt-1 text-[11px] text-emerald-600 leading-snug">
                  Fields filled from source. Review and adjust as needed.
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Error state ── */}
      {error && (
        <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2">
          <AlertCircle className="h-4 w-4 text-red-500 mt-0.5 shrink-0" />
          <span className="text-xs text-red-700">{error}</span>
        </div>
      )}
    </div>
  );
}
