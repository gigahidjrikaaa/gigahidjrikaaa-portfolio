"use client";

import { useState } from "react";
import { Sparkles, Loader2, AlertCircle, CheckCircle2, Link } from "lucide-react";
import { adminApi, ScrapeResult } from "@/services/api";

type ContentType = "press_mention" | "blog_article" | "project";

interface ImportFromUrlProps {
  contentType: ContentType;
  onImport: (data: ScrapeResult["data"]) => void;
  className?: string;
}

const PLACEHOLDER: Record<ContentType, string> = {
  press_mention: "https://techcrunch.com/2024/01/article-about-you",
  blog_article: "https://medium.com/@author/article-title",
  project: "https://github.com/yourname/project",
};

const LABEL: Record<ContentType, string> = {
  press_mention: "Import from article / news URL",
  blog_article: "Import from blog / article URL",
  project: "Import from project / GitHub URL",
};

/**
 * Reusable "Import & Analyze" widget.
 * Fetches + AI-analyzes a URL, then calls `onImport` with the
 * pre-filled field data so the parent form can populate its fields.
 */
export default function ImportFromUrl({ contentType, onImport, className = "" }: ImportFromUrlProps) {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<{ title?: string; source?: string } | null>(null);

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

      // Build a small preview so the admin can confirm before the form fills
      const previewTitle =
        (result.data.title as string) ||
        (result.data.name as string) ||
        "Untitled";
      const previewSource =
        (result.data.publication as string) ||
        (result.data.external_source as string) ||
        new URL(trimmed).hostname;

      setPreview({ title: previewTitle, source: previewSource });
      onImport(result.data);
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
        <div className="flex items-center gap-1.5">
          <Sparkles className="h-3.5 w-3.5 text-slate-400 shrink-0" />
          <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">
            {LABEL[contentType]}
          </span>
        </div>
        <span className="text-xs text-slate-400 italic">Powered by Z.AI</span>
      </div>

      {/* URL input + button */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Link className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
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

      {/* Success state */}
      {preview && !loading && (
        <div className="flex items-start gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2">
          <CheckCircle2 className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" />
          <div className="text-xs text-emerald-800 leading-snug">
            <span>Fields filled from </span>
            <span className="font-semibold">&ldquo;{preview.title}&rdquo;</span>
            {preview.source && (
              <span className="text-emerald-600"> — {preview.source}</span>
            )}
            <p className="mt-0.5 text-emerald-600">Review the form below and adjust as needed.</p>
          </div>
        </div>
      )}

      {/* Error state */}
      {error && (
        <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2">
          <AlertCircle className="h-4 w-4 text-red-500 mt-0.5 shrink-0" />
          <span className="text-xs text-red-700">{error}</span>
        </div>
      )}
    </div>
  );
}
