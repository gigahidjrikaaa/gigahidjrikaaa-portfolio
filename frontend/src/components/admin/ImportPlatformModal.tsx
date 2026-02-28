"use client";

import { useState } from "react";
import Image from "next/image";
import { ArrowLeft, Loader2, AlertCircle, CheckCircle2, ExternalLink, Info, X } from "lucide-react";
import { adminApi, ScrapeResult } from "@/services/api";

// ─── Platform definitions ─────────────────────────────────────────────────────

interface PlatformDef {
  key: string;
  name: string;
  description: string;
  /** What gets imported automatically */
  imports: string[];
  /** Any caveats the user should know */
  caveats?: string;
  /** Example URL the placeholder shows */
  placeholder: string;
  /** Regex to loosely validate the pasted URL */
  urlPattern: RegExp;
  urlHint: string;
  /** Tailwind bg for the card accent bar */
  accentBg: string;
  /** Tailwind text for the platform name label */
  accentText: string;
  /** Single letter / short text used as a visual mark */
  mark: string;
  markBg: string;
}

const PLATFORMS: PlatformDef[] = [
  {
    key: "twitter",
    name: "X (Twitter)",
    description: "Import long-form X Articles written and published on your X profile.",
    imports: ["Title", "Excerpt", "Cover image", "Author", "Published date"],
    caveats: "Short tweets import only their text. X Articles import fully.",
    placeholder: "https://x.com/gigahidjrikaaa/status/2022708767352373656",
    urlPattern: /(?:twitter\.com|x\.com)\/\w+\/status\/\d+/i,
    urlHint: "x.com / twitter.com · Article or tweet URL",
    accentBg: "bg-black",
    accentText: "text-white",
    mark: "𝕏",
    markBg: "bg-black",
  },
  {
    key: "linkedin",
    name: "LinkedIn",
    description: "Import articles you've published on LinkedIn Pulse.",
    imports: ["Title", "Excerpt", "Cover image", "Author"],
    caveats: "Only LinkedIn Articles (/pulse/ URLs) can be imported. Regular profile posts require login and cannot be scraped.",
    placeholder: "https://www.linkedin.com/pulse/your-article-title-yourname",
    urlPattern: /linkedin\.com\/pulse\//i,
    urlHint: "linkedin.com/pulse/… · Article URL only",
    accentBg: "bg-[#0A66C2]",
    accentText: "text-white",
    mark: "in",
    markBg: "bg-[#0A66C2]",
  },
  {
    key: "medium",
    name: "Medium",
    description: "Import any public Medium article — from your own publication or claps-worthy reads.",
    imports: ["Title", "Excerpt", "Cover image", "Author", "Published date", "Tags"],
    placeholder: "https://medium.com/@author/article-slug",
    urlPattern: /medium\.com\//i,
    urlHint: "medium.com/@author/… or custom domain",
    accentBg: "bg-[#242424]",
    accentText: "text-white",
    mark: "M",
    markBg: "bg-[#242424]",
  },
];

// ─── Types ────────────────────────────────────────────────────────────────────

interface ImportPreview {
  title: string;
  source: string;
  imageUrl?: string;
  isPartial: boolean;
}

interface ImportPlatformModalProps {
  onImport: (platform: PlatformDef, data: ScrapeResult["data"]) => void;
  onClose: () => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function ImportPlatformModal({ onImport, onClose }: ImportPlatformModalProps) {
  const [step, setStep] = useState<"pick" | "import">("pick");
  const [platform, setPlatform] = useState<PlatformDef | null>(null);
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<ImportPreview | null>(null);
  const [importedData, setImportedData] = useState<ScrapeResult["data"] | null>(null);

  const selectPlatform = (p: PlatformDef) => {
    setPlatform(p);
    setUrl("");
    setError(null);
    setPreview(null);
    setImportedData(null);
    setStep("import");
  };

  const goBack = () => {
    setStep("pick");
    setPlatform(null);
    setUrl("");
    setError(null);
    setPreview(null);
    setImportedData(null);
  };

  const validateUrl = (): string | null => {
    const trimmed = url.trim();
    if (!trimmed) return "Please paste the article URL.";
    if (!/^https?:\/\//i.test(trimmed)) return "URL must start with https://";
    if (platform && !platform.urlPattern.test(trimmed))
      return `That doesn't look like a ${platform.name} URL. ${platform.urlHint}`;
    return null;
  };

  const handleImport = async () => {
    const validationError = validateUrl();
    if (validationError) { setError(validationError); return; }

    setLoading(true);
    setError(null);
    setPreview(null);
    setImportedData(null);

    const trimmed = url.trim();
    try {
      const result = await adminApi.scrapeUrl(trimmed, "blog_article");
      const d = result.data;

      const title = (d.title as string) || "Untitled";
      const source = (d.external_source as string) || platform?.name || new URL(trimmed).hostname;
      const imageUrl = (d.cover_image_url as string) || (d.image_url as string) || undefined;
      const isPartial = Boolean(d._social_platform);

      setPreview({ title, source, imageUrl, isPartial });
      setImportedData(d);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to fetch the article. Check the URL and try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenInEditor = () => {
    if (platform && importedData) {
      onImport(platform, importedData);
    }
  };

  return (
    /* Backdrop */
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      role="dialog"
      aria-modal="true"
      aria-label="Import article"
    >
      <div className="relative flex w-full max-w-2xl flex-col rounded-2xl bg-white shadow-2xl ring-1 ring-slate-900/5">

        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <div className="flex items-center gap-3">
            {step === "import" && platform && (
              <button
                type="button"
                onClick={goBack}
                className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                aria-label="Back to platform picker"
              >
                <ArrowLeft className="h-4 w-4" />
              </button>
            )}
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">
                {step === "pick" ? "Import" : platform?.name}
              </p>
              <h2 className="text-lg font-semibold leading-tight text-slate-900">
                {step === "pick" ? "Import Article" : "Paste Article URL"}
              </h2>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          {/* ── Step 1: Pick platform ── */}
          {step === "pick" && (
            <div className="space-y-3">
              <p className="text-sm text-slate-500">
                Choose where your article lives. Each platform has a different import method.
              </p>
              <div className="grid gap-3 sm:grid-cols-3">
                {PLATFORMS.map((p) => (
                  <button
                    key={p.key}
                    type="button"
                    onClick={() => selectPlatform(p)}
                    className="group relative flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white text-left transition hover:border-slate-300 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900"
                  >
                    {/* Accent bar */}
                    <div className={`h-1.5 w-full ${p.accentBg}`} />

                    <div className="flex flex-1 flex-col gap-3 p-4">
                      {/* Platform mark + name */}
                      <div className="flex items-center gap-2.5">
                        <span
                          className={`inline-flex h-8 w-8 items-center justify-center rounded-lg text-sm font-bold ${p.markBg} ${p.accentText} shrink-0`}
                        >
                          {p.mark}
                        </span>
                        <span className="text-sm font-semibold text-slate-900">{p.name}</span>
                      </div>

                      {/* Description */}
                      <p className="text-xs leading-relaxed text-slate-500 flex-1">{p.description}</p>

                      {/* Imports list */}
                      <ul className="space-y-1">
                        {p.imports.map((item) => (
                          <li key={item} className="flex items-center gap-1.5 text-[11px] text-slate-500">
                            <CheckCircle2 className="h-3 w-3 shrink-0 text-emerald-500" />
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ── Step 2: URL input + result ── */}
          {step === "import" && platform && (
            <div className="space-y-4">

              {/* Caveat / tip */}
              {platform.caveats && !preview && (
                <div className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2.5">
                  <Info className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
                  <p className="text-xs leading-snug text-amber-800">{platform.caveats}</p>
                </div>
              )}

              {/* URL input */}
              <div className="space-y-2">
                <label htmlFor="import-url" className="text-sm font-medium text-slate-700">
                  Article URL
                  <span className="ml-2 text-xs font-normal text-slate-400">{platform.urlHint}</span>
                </label>
                <div className="flex gap-2">
                  <input
                    id="import-url"
                    type="url"
                    value={url}
                    onChange={(e) => { setUrl(e.target.value); setError(null); setPreview(null); setImportedData(null); }}
                    onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleImport(); } }}
                    placeholder={platform.placeholder}
                    disabled={loading}
                    className="flex-1 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/10 disabled:opacity-60 transition"
                  />
                  <button
                    type="button"
                    onClick={handleImport}
                    disabled={loading || !url.trim()}
                    className="inline-flex shrink-0 items-center gap-2 rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                    {loading ? "Importing…" : "Import"}
                  </button>
                </div>
              </div>

              {/* Error */}
              {error && (
                <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2.5">
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-500" />
                  <p className="text-xs text-red-700">{error}</p>
                </div>
              )}

              {/* Success preview */}
              {preview && !loading && (
                <div className="overflow-hidden rounded-xl border border-emerald-200 bg-emerald-50">
                  {/* Cover image */}
                  {preview.imageUrl && (
                    <div className="relative h-40 w-full bg-slate-100">
                      <Image
                        src={preview.imageUrl}
                        alt="Article cover"
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    </div>
                  )}

                  <div className="p-4 space-y-3">
                    {/* Title + source */}
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" />
                        <span className="text-[10px] font-semibold uppercase tracking-wider text-emerald-600">
                          {preview.source}
                        </span>
                      </div>
                      <p className="text-base font-semibold leading-snug text-slate-900">
                        {preview.title}
                      </p>
                    </div>

                    {/* External redirect note — always shown for external posts */}
                    {importedData?.is_external && (
                      <p className="text-xs text-sky-700 bg-sky-50 border border-sky-200 rounded-lg px-3 py-2 leading-snug">
                        <strong>External article</strong> — visitors clicking this card will be sent directly to the original URL. No body content needed.
                      </p>
                    )}

                    {/* Partial warning — only relevant for internal posts where body is missing */}
                    {preview.isPartial && !importedData?.is_external && (
                      <p className="text-xs text-amber-700 bg-amber-100 rounded-lg px-3 py-2 leading-snug">
                        <strong>Partial import</strong> — title and metadata were captured. The article body will need to be added manually in the editor.
                      </p>
                    )}

                    {/* Action */}
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={handleOpenInEditor}
                        className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-700"
                      >
                        <ExternalLink className="h-4 w-4" />
                        {importedData?.is_external ? "Add to Blog" : "Open in Editor"}
                      </button>
                      <button
                        type="button"
                        onClick={() => { setPreview(null); setImportedData(null); setUrl(""); }}
                        className="text-sm text-slate-500 hover:text-slate-700 transition"
                      >
                        Import different URL
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
