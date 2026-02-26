"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  PencilIcon,
  TrashIcon,
  NewspaperIcon,
  ArrowTopRightOnSquareIcon,
  StarIcon,
} from "@heroicons/react/24/outline";
import { StarIcon as StarSolid } from "@heroicons/react/24/solid";
import { adminApi, PressMentionResponse } from "@/services/api";
import AdminModal from "@/components/admin/AdminModal";
import LoadingAnimation from "@/components/ui/LoadingAnimation";
import { useToast } from "@/components/ui/toast";
import { Sparkles, Loader2, AlertCircle, CheckCircle2, Link, PlusCircle } from "lucide-react";

// ─── constants ────────────────────────────────────────────────────────────────

const EMPTY_FORM = {
  title: "",
  publication: "",
  publication_url: "",
  publication_date: "",
  excerpt: "",
  image_url: "",
  is_featured: false,
  display_order: 0,
  social_username: "",
};

const INPUT_CLS =
  "w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/10 transition";

// ─── helpers ──────────────────────────────────────────────────────────────────

function getDomain(url: string) {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

function formatDate(dateStr: string) {
  try {
    return new Date(dateStr).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return dateStr;
  }
}

// ─── social-platform helpers ──────────────────────────────────────────────────

type SocialPlatform = "twitter" | "instagram" | "facebook" | "linkedin";

const SOCIAL_DETECT: [SocialPlatform, RegExp][] = [
  ["twitter",   /(?:twitter\.com|x\.com)\/\w+\/status\/\d+/i],
  ["instagram", /instagram\.com\/(?:p|reel|tv)\/[A-Za-z0-9_-]+/i],
  ["facebook",  /(?:facebook\.com|fb\.com|fb\.watch)/i],
  ["linkedin",  /linkedin\.com\/(?:posts?|feed\/update|pulse|in\/|company\/)/i],
];

const SOCIAL_META: Record<SocialPlatform, { name: string; ring: string; bg: string; text: string; border: string }> = {
  twitter:   { name: "X (Twitter)", ring: "ring-slate-300",  bg: "bg-slate-50",  text: "text-slate-700",  border: "border-slate-200" },
  instagram: { name: "Instagram",   ring: "ring-pink-300",   bg: "bg-pink-50",   text: "text-pink-700",   border: "border-pink-200" },
  facebook:  { name: "Facebook",    ring: "ring-blue-300",   bg: "bg-blue-50",   text: "text-blue-700",   border: "border-blue-200" },
  linkedin:  { name: "LinkedIn",    ring: "ring-sky-300",    bg: "bg-sky-50",    text: "text-sky-700",    border: "border-sky-200" },
};

/** Platforms whose HTML is blocked by a login wall — handled via inline form */
const SOCIAL_BLOCKED: SocialPlatform[] = ["instagram", "facebook", "linkedin"];

function detectPlatform(url: string): SocialPlatform | null {
  for (const [p, re] of SOCIAL_DETECT) {
    if (re.test(url)) return p;
  }
  return null;
}

/** Best-effort extraction of a social username from a URL. */
function extractSocialUsername(url: string, platform: SocialPlatform): string {
  try {
    const parts = new URL(url).pathname.split("/").filter(Boolean);
    if (platform === "twitter" && parts[0]) return `@${parts[0]}`;
    if (platform === "linkedin" && parts.length >= 2) return parts[1];
    if (platform === "facebook" && parts[0] && !["pages", "groups"].includes(parts[0])) return parts[0];
  } catch { /* ignore */ }
  return "";
}

// ─── quick-add bar ────────────────────────────────────────────────────────────

interface QuickAddBarProps {
  onSaved: (mention: PressMentionResponse) => void;
  nextOrder: number;
}

function QuickAddBar({ onSaved, nextOrder }: QuickAddBarProps) {
  const { toast } = useToast();
  const [url, setUrl] = useState("");
  const [status, setStatus] = useState<"idle" | "scraping" | "saving" | "done" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [savedTitle, setSavedTitle] = useState<string | null>(null);

  // Social-specific state
  const [detectedPlatform, setDetectedPlatform] = useState<SocialPlatform | null>(null);
  const [socialTitle, setSocialTitle] = useState("");
  const [socialDate, setSocialDate] = useState("");
  const [socialUsername, setSocialUsername] = useState("");

  const inputRef = useRef<HTMLInputElement>(null);
  const isLoading = status === "scraping" || status === "saving";
  const isBlocked = detectedPlatform !== null && SOCIAL_BLOCKED.includes(detectedPlatform);

  const reset = () => {
    setErrorMsg(null);
    setSavedTitle(null);
    if (status !== "idle") setStatus("idle");
  };

  const handleUrlChange = (value: string) => {
    setUrl(value);
    reset();
    const platform = detectPlatform(value.trim());
    setDetectedPlatform(platform);
    // Reset social form fields when URL changes
    setSocialTitle("");
    setSocialDate("");
    setSocialUsername(platform ? extractSocialUsername(value.trim(), platform) : "");
  };

  const handleAdd = async () => {
    const trimmed = url.trim();
    if (!trimmed) { setErrorMsg("Paste a URL first."); return; }
    if (!/^https?:\/\//i.test(trimmed)) { setErrorMsg("URL must start with https://"); return; }

    setErrorMsg(null);
    setSavedTitle(null);

    try {
      if (isBlocked && detectedPlatform) {
        // ── Blocked social platform (Instagram / Facebook / LinkedIn) ──
        // Skip scraping; user fills in the caption in the inline mini-form.
        if (!socialTitle.trim()) { setErrorMsg("Please enter a caption or title for this post."); return; }

        const meta = SOCIAL_META[detectedPlatform];
        setStatus("saving");

        const created = await adminApi.createPressMention({
          title:            socialTitle.trim(),
          publication:      meta.name,
          publication_url:  trimmed,
          publication_date: socialDate.trim() || "",
          excerpt:          "",
          image_url:        "",
          is_featured:      false,
          display_order:    nextOrder,
          social_username:  socialUsername.trim(),
        });

        setSavedTitle(created.title);
        setStatus("done");
        setUrl("");
        setDetectedPlatform(null);
        setSocialTitle("");
        setSocialDate("");
        setSocialUsername("");
        onSaved(created);
        toast({ variant: "success", title: "Social post added" });
        setTimeout(() => setStatus("idle"), 4000);

      } else {
        // ── Normal scrape (all non-blocked URLs, including Twitter/X) ──
        setStatus("scraping");
        const result = await adminApi.scrapeUrl(trimmed, "press_mention");
        const d = result.data as Record<string, string | boolean | null>;

        setStatus("saving");

        const created = await adminApi.createPressMention({
          title:            (d.title           as string) || getDomain(trimmed),
          publication:      (d.publication     as string) || getDomain(trimmed),
          publication_url:  (d.publication_url as string) || trimmed,
          publication_date: (d.publication_date as string) || "",
          excerpt:          (d.excerpt         as string) || "",
          image_url:        (d.image_url       as string) || "",
          is_featured:      false,
          display_order:    nextOrder,
          social_username:  (d._social_username as string) || "",
        });

        setSavedTitle(created.title);
        setStatus("done");
        setUrl("");
        setDetectedPlatform(null);
        onSaved(created);
        toast({ variant: "success", title: "Press mention added" });
        setTimeout(() => setStatus("idle"), 4000);
      }
    } catch (err: unknown) {
      setStatus("error");
      setErrorMsg(err instanceof Error ? err.message : "Failed — check the URL and try again.");
    }
  };

  const platformMeta = detectedPlatform ? SOCIAL_META[detectedPlatform] : null;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center gap-2 border-b border-slate-100 px-5 py-3">
        <Sparkles className="h-4 w-4 text-violet-500" />
        <span className="text-sm font-semibold text-slate-700">Quick-Add from URL</span>
        <span className="ml-auto hidden text-xs text-slate-400 sm:block">
          Paste a news link → metadata extracted &amp; saved instantly
        </span>
      </div>

      <div className="flex items-center gap-3 px-5 py-4">
        <div className="relative flex-1">
          <Link className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            ref={inputRef}
            type="url"
            value={url}
            onChange={(e) => handleUrlChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") { e.preventDefault(); if (!isBlocked) handleAdd(); }
              if (e.key === "Escape") { setUrl(""); handleUrlChange(""); }
            }}
            placeholder="https://kompas.id/artikel/... or any news/media/social URL"
            disabled={isLoading}
            aria-label="Article URL"
            className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm text-slate-900 placeholder:text-slate-400 focus:border-violet-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-violet-400/20 transition disabled:opacity-60"
          />
        </div>
        {!isBlocked && (
          <button
            type="button"
            onClick={handleAdd}
            disabled={isLoading || !url.trim()}
            className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-violet-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-violet-700 active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-40"
          >
            {isLoading ? (
              <><Loader2 className="h-4 w-4 animate-spin" />{status === "scraping" ? "Reading…" : "Saving…"}</>
            ) : (
              <><PlusCircle className="h-4 w-4" />Add</>
            )}
          </button>
        )}
      </div>

      {/* ── Social-platform detected banner + mini form ── */}
      <AnimatePresence>
        {detectedPlatform && platformMeta && (
          <motion.div
            key="social-panel"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className={`mx-5 mb-4 rounded-xl border ${platformMeta.border} ${platformMeta.bg} p-4`}>
              <div className={`mb-3 flex items-center gap-2 text-xs font-semibold ${platformMeta.text}`}>
                <span className={`inline-flex items-center rounded-full ring-1 ${platformMeta.ring} px-2.5 py-0.5 font-bold`}>
                  {platformMeta.name}
                </span>
                {isBlocked ? (
                  <span className="text-slate-500">
                    This platform blocks scrapers. Enter the post details manually.
                  </span>
                ) : (
                  <span className="text-slate-500">
                    Tweet will be fetched automatically via oEmbed.
                  </span>
                )}
              </div>

              {isBlocked && (
                <div className="flex flex-col gap-2">
                  <input
                    type="text"
                    value={socialTitle}
                    onChange={(e) => setSocialTitle(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleAdd(); } }}
                    placeholder="Caption or headline for this post *"
                    disabled={isLoading}
                    aria-label="Post caption or title"
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-violet-400 focus:outline-none focus:ring-2 focus:ring-violet-400/20 transition disabled:opacity-60"
                  />
                  <input
                    type="text"
                    value={socialUsername}
                    onChange={(e) => setSocialUsername(e.target.value)}
                    placeholder="@username (optional)"
                    disabled={isLoading}
                    aria-label="Social username"
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-violet-400 focus:outline-none focus:ring-2 focus:ring-violet-400/20 transition disabled:opacity-60"
                  />
                  <div className="flex items-center gap-2">
                    <input
                      type="date"
                      value={socialDate}
                      onChange={(e) => setSocialDate(e.target.value)}
                      disabled={isLoading}
                      aria-label="Post date (optional)"
                      className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:border-violet-400 focus:outline-none focus:ring-2 focus:ring-violet-400/20 transition disabled:opacity-60"
                    />
                    <span className="text-xs text-slate-400">Date (optional)</span>
                    <button
                      type="button"
                      onClick={handleAdd}
                      disabled={isLoading || !socialTitle.trim()}
                      className="ml-auto inline-flex shrink-0 items-center gap-2 rounded-xl bg-violet-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-violet-700 active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      {isLoading ? (
                        <><Loader2 className="h-4 w-4 animate-spin" />Saving…</>
                      ) : (
                        <><PlusCircle className="h-4 w-4" />Add Post</>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {(errorMsg || status === "done") && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden px-5 pb-4">
            {errorMsg && (
              <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
                <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                <span className="flex-1">{errorMsg}</span>
                <button onClick={() => { setStatus("idle"); setErrorMsg(null); }} className="text-red-400 hover:text-red-600">✕</button>
              </div>
            )}
            {status === "done" && savedTitle && (
              <div className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs text-emerald-800">
                <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-emerald-500" />
                <span>Added: <strong>&ldquo;{savedTitle}&rdquo;</strong> — live on your portfolio.</span>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── mention card ─────────────────────────────────────────────────────────────

interface CardProps {
  mention: PressMentionResponse;
  onEdit: () => void;
  onDelete: () => void;
  onToggleFeatured: () => void;
}

function MentionCard({ mention, onEdit, onDelete, onToggleFeatured }: CardProps) {
  const domain = mention.publication_url ? getDomain(mention.publication_url) : null;
  const faviconUrl = domain ? `https://www.google.com/s2/favicons?sz=32&domain_url=https://${domain}` : null;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.2 }}
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-shadow hover:shadow-md"
    >
      {mention.image_url && (
        <div className="relative h-36 shrink-0 overflow-hidden bg-slate-100">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={mention.image_url} alt={mention.title} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            onError={(e) => { const p = (e.currentTarget as HTMLImageElement).parentElement; if (p) p.style.display = "none"; }} />
          {mention.is_featured && (
            <span className="absolute left-3 top-3 rounded-full bg-amber-400/90 px-2.5 py-0.5 text-xs font-semibold text-amber-900 backdrop-blur-sm">Featured</span>
          )}
        </div>
      )}

      <div className="flex flex-1 flex-col gap-2 p-4">
        <div className="flex items-center gap-1.5 min-w-0">
          {faviconUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={faviconUrl} alt="" className="h-4 w-4 shrink-0 rounded-sm object-contain"
              onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }} />
          ) : (
            <NewspaperIcon className="h-4 w-4 shrink-0 text-slate-400" />
          )}
          <span className="truncate text-xs font-semibold text-violet-700">{mention.publication || domain || "Unknown"}</span>
          {mention.publication_date && (
            <span className="ml-auto shrink-0 text-xs text-slate-400">{formatDate(mention.publication_date)}</span>
          )}
        </div>

        <p className="line-clamp-3 text-sm font-semibold leading-snug text-slate-900">{mention.title}</p>

        {mention.social_username && (
          <p className="text-xs text-slate-400">{mention.social_username}</p>
        )}

        {mention.excerpt && !mention.image_url && (
          <p className="line-clamp-2 text-xs text-slate-500">{mention.excerpt}</p>
        )}

        <div className="mt-auto flex items-center justify-between pt-2">
          {mention.publication_url ? (
            <a href={mention.publication_url} target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs text-slate-400 hover:text-violet-600 transition"
              onClick={(e) => e.stopPropagation()}>
              {domain} <ArrowTopRightOnSquareIcon className="h-3 w-3" />
            </a>
          ) : <span />}

          <div className="flex items-center gap-0.5">
            <button onClick={onToggleFeatured} title={mention.is_featured ? "Unfeature" : "Feature"}
              className="flex h-7 w-7 items-center justify-center rounded-md transition hover:bg-amber-50">
              {mention.is_featured ? <StarSolid className="h-4 w-4 text-amber-400" /> : <StarIcon className="h-4 w-4 text-slate-400" />}
            </button>
            <button onClick={onEdit} title="Edit" className="flex h-7 w-7 items-center justify-center rounded-md transition hover:bg-slate-100">
              <PencilIcon className="h-4 w-4 text-slate-500" />
            </button>
            <button onClick={onDelete} title="Delete" className="flex h-7 w-7 items-center justify-center rounded-md transition hover:bg-rose-50">
              <TrashIcon className="h-4 w-4 text-rose-500" />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ─── main ─────────────────────────────────────────────────────────────────────

const PressMentionsManagement = () => {
  const { toast } = useToast();
  const [mentions, setMentions] = useState<PressMentionResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingMention, setEditingMention] = useState<PressMentionResponse | null>(null);
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
      social_username: mention.social_username || "",
    });
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this press mention?")) return;
    try {
      await adminApi.deletePressMention(id);
      setMentions((prev) => prev.filter((m) => m.id !== id));
      toast({ variant: "success", title: "Deleted" });
    } catch {
      toast({ variant: "error", title: "Failed to delete" });
    }
  };

  const handleToggleFeatured = async (mention: PressMentionResponse) => {
    try {
      const updated = await adminApi.updatePressMention(mention.id, {
        ...mention,
        is_featured: !mention.is_featured,
      });
      setMentions((prev) => prev.map((m) => (m.id === mention.id ? updated : m)));
    } catch {
      toast({ variant: "error", title: "Failed to update" });
    }
  };

  const handleSave = async () => {
    if (!formData.title.trim()) {
      toast({ variant: "error", title: "Title is required" });
      return;
    }
    if (!editingMention) return;
    setSaving(true);
    try {
      const updated = await adminApi.updatePressMention(editingMention.id, formData);
      setMentions((prev) => prev.map((m) => (m.id === editingMention.id ? updated : m)));
      toast({ variant: "success", title: "Updated" });
      setEditingMention(null);
    } catch {
      toast({ variant: "error", title: "Failed to save" });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingAnimation label="Loading press mentions…" />;

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-semibold text-slate-900">Press &amp; Media Mentions</h2>
        <p className="mt-1 text-sm text-slate-500">
          Paste any news or media link — metadata is extracted automatically and saved instantly.
        </p>
      </div>

      <QuickAddBar
        onSaved={(mention) => setMentions((prev) => [mention, ...prev])}
        nextOrder={mentions.length}
      />

      {mentions.length === 0 && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 py-20 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-100">
            <NewspaperIcon className="h-8 w-8 text-slate-400" />
          </div>
          <h3 className="mt-4 text-base font-semibold text-slate-900">No press mentions yet</h3>
          <p className="mt-1 text-sm text-slate-500">Paste a news URL above to add your first mention.</p>
        </motion.div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
        <AnimatePresence>
          {mentions.map((mention) => (
            <MentionCard
              key={mention.id}
              mention={mention}
              onEdit={() => openEdit(mention)}
              onDelete={() => handleDelete(mention.id)}
              onToggleFeatured={() => handleToggleFeatured(mention)}
            />
          ))}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {editingMention && (
          <AdminModal
            title="Edit Press Mention"
            description="Adjust any details extracted from the article."
            onClose={() => setEditingMention(null)}
          >
            <div className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label className="mb-1 block text-sm font-medium text-slate-700" htmlFor="pm-title">
                    Title <span className="text-rose-500">*</span>
                  </label>
                  <input id="pm-title" type="text" value={formData.title}
                    onChange={(e) => setFormData((f) => ({ ...f, title: e.target.value }))}
                    placeholder="Article or interview title" className={INPUT_CLS} />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700" htmlFor="pm-pub">Publication</label>
                  <input id="pm-pub" type="text" value={formData.publication}
                    onChange={(e) => setFormData((f) => ({ ...f, publication: e.target.value }))}
                    placeholder="TechCrunch, Kompas.id…" className={INPUT_CLS} />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700" htmlFor="pm-date">Publication Date</label>
                  <input id="pm-date" type="date" value={formData.publication_date}
                    onChange={(e) => setFormData((f) => ({ ...f, publication_date: e.target.value }))}
                    className={INPUT_CLS} />
                </div>

                <div className="sm:col-span-2">
                  <label className="mb-1 block text-sm font-medium text-slate-700" htmlFor="pm-url">Article URL</label>
                  <input id="pm-url" type="url" value={formData.publication_url}
                    onChange={(e) => setFormData((f) => ({ ...f, publication_url: e.target.value }))}
                    placeholder="https://…" className={INPUT_CLS} />
                </div>

                <div className="sm:col-span-2">
                  <label className="mb-1 block text-sm font-medium text-slate-700" htmlFor="pm-excerpt">Excerpt</label>
                  <textarea id="pm-excerpt" value={formData.excerpt} rows={3}
                    onChange={(e) => setFormData((f) => ({ ...f, excerpt: e.target.value }))}
                    placeholder="Short quote or summary…" className={INPUT_CLS} />
                </div>

                <div className="sm:col-span-2">
                  <label className="mb-1 block text-sm font-medium text-slate-700" htmlFor="pm-img">Cover Image URL</label>
                  <input id="pm-img" type="url" value={formData.image_url}
                    onChange={(e) => setFormData((f) => ({ ...f, image_url: e.target.value }))}
                    placeholder="https://…" className={INPUT_CLS} />
                  {formData.image_url && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={formData.image_url} alt="preview"
                      className="mt-2 h-24 w-full rounded-lg object-cover"
                      onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }} />
                  )}
                </div>

                <div className="sm:col-span-2">
                  <label className="mb-1 block text-sm font-medium text-slate-700" htmlFor="pm-username">
                    Social Username
                  </label>
                  <input id="pm-username" type="text" value={formData.social_username || ""}
                    onChange={(e) => setFormData((f) => ({ ...f, social_username: e.target.value }))}
                    placeholder="@username (optional — for social media posts)" className={INPUT_CLS} />
                </div>
              </div>

              <label className="flex cursor-pointer items-center gap-3">
                <input type="checkbox" checked={formData.is_featured}
                  onChange={(e) => setFormData((f) => ({ ...f, is_featured: e.target.checked }))}
                  className="h-4 w-4 cursor-pointer rounded border-slate-300 text-slate-900 focus:ring-slate-900" />
                <span className="text-sm font-medium text-slate-700">Mark as Featured</span>
              </label>

              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setEditingMention(null)}
                  className="rounded-full border border-slate-200 px-5 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50">
                  Cancel
                </button>
                <button type="button" onClick={handleSave} disabled={saving}
                  className="rounded-full bg-slate-900 px-5 py-2 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:opacity-60">
                  {saving ? "Saving…" : "Save Changes"}
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
