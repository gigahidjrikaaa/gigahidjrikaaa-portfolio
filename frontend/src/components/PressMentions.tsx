"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowUpRight, Newspaper, X } from "lucide-react";
import { apiService, PressMentionResponse } from "@/services/api";

// ─── utils ────────────────────────────────────────────────────────────────────

function getDomain(url: string): string {
  try { return new URL(url).hostname.replace(/^www\./, ""); }
  catch { return url; }
}

function formatDate(dateStr: string): string {
  try {
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short", day: "numeric", year: "numeric",
    });
  } catch { return dateStr; }
}

function getFaviconUrl(url?: string | null): string | null {
  if (!url) return null;
  return `https://www.google.com/s2/favicons?sz=32&domain_url=https://${getDomain(url)}`;
}

// ─── Social platform detection ────────────────────────────────────────────────

type SocialPlatform = "twitter" | "instagram" | "facebook" | "linkedin";

function detectPlatform(url?: string | null): SocialPlatform | null {
  if (!url) return null;
  if (/(?:twitter\.com|x\.com)/i.test(url)) return "twitter";
  if (/instagram\.com/i.test(url)) return "instagram";
  if (/(?:facebook\.com|fb\.com)/i.test(url)) return "facebook";
  if (/linkedin\.com/i.test(url)) return "linkedin";
  return null;
}

const PLATFORM_CONFIG: Record<
  SocialPlatform,
  { label: string; badge: string; bar: string; border: string }
> = {
  twitter:   { label: "X (Twitter)", badge: "bg-slate-900 text-white",  bar: "bg-slate-900",  border: "border-slate-300" },
  instagram: { label: "Instagram",   badge: "bg-gradient-to-r from-purple-500 to-pink-500 text-white", bar: "bg-gradient-to-r from-purple-500 to-pink-500", border: "border-pink-300" },
  facebook:  { label: "Facebook",    badge: "bg-blue-600 text-white",   bar: "bg-blue-600",   border: "border-blue-300" },
  linkedin:  { label: "LinkedIn",    badge: "bg-sky-600 text-white",    bar: "bg-sky-600",    border: "border-sky-300" },
};

// ─── Publication Marquee ──────────────────────────────────────────────────────

function PublicationMarquee({ mentions }: { mentions: PressMentionResponse[] }) {
  const seen = new Set<string>();
  const pubs = mentions
    .filter((m) => m.publication && !seen.has(m.publication) && !!seen.add(m.publication))
    .map((m) => ({ name: m.publication!, url: m.publication_url }));

  if (pubs.length < 2) return null;

  const doubled = [...pubs, ...pubs];
  const duration = Math.max(14, pubs.length * 4);

  return (
    <>
      <style>{`@keyframes pm-scroll{0%{transform:translateX(0)}100%{transform:translateX(-50%)}}`}</style>
      <div className="relative overflow-hidden py-5 before:pointer-events-none before:absolute before:inset-y-0 before:left-0 before:z-10 before:w-16 before:bg-gradient-to-r before:from-white before:to-transparent after:pointer-events-none after:absolute after:inset-y-0 after:right-0 after:z-10 after:w-16 after:bg-gradient-to-l after:from-white after:to-transparent">
        <div style={{ animation: `pm-scroll ${duration}s linear infinite`, display: "inline-flex", gap: "0.75rem" }}>
          {doubled.map((pub, i) => {
            const favicon = getFaviconUrl(pub.url);
            return (
              <div
                key={i}
                className="inline-flex shrink-0 items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-1.5 text-sm font-semibold text-slate-600 shadow-sm"
              >
                {favicon && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={favicon}
                    alt=""
                    className="h-4 w-4 rounded-sm"
                    onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
                  />
                )}
                {pub.name}
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}

// ─── Featured Card (horizontal layout) ───────────────────────────────────────

function FeaturedCard({ mention }: { mention: PressMentionResponse }) {
  const domain = mention.publication_url ? getDomain(mention.publication_url) : null;
  const favicon = getFaviconUrl(mention.publication_url);
  const platform = detectPlatform(mention.publication_url);
  const pCfg = platform ? PLATFORM_CONFIG[platform] : null;

  return (
    <motion.a
      href={mention.publication_url || "#"}
      target={mention.publication_url ? "_blank" : undefined}
      rel="noopener noreferrer"
      initial={{ opacity: 0, y: 32 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -6 }}
      className={`group relative flex flex-col overflow-hidden rounded-3xl border bg-white shadow-sm transition-shadow duration-300 hover:shadow-xl sm:flex-row ${pCfg ? pCfg.border : "border-slate-200"}`}
    >
      {/* Left: image or colored panel */}
      {mention.image_url ? (
        <div className="relative h-60 w-full shrink-0 overflow-hidden sm:h-auto sm:w-72 lg:w-96">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={mention.image_url}
            alt={mention.title}
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
            onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent sm:bg-gradient-to-r" />
        </div>
      ) : (
        <div className={`hidden h-auto w-20 shrink-0 items-center justify-center sm:flex ${pCfg ? pCfg.bar : "bg-slate-100"}`}>
          <Newspaper className="h-8 w-8 text-white/50" />
        </div>
      )}

      {/* Right: content */}
      <div className="flex flex-1 flex-col justify-between p-7 lg:p-8">
        <div>
          {/* Badges */}
          <div className="mb-4 flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-700">
              ⭐ Featured
            </span>
            {pCfg && (
              <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-bold ${pCfg.badge}`}>
                {pCfg.label}
              </span>
            )}
          </div>

          {/* Publication + date */}
          <div className="mb-3 flex items-center gap-2">
            {favicon && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={favicon} alt="" className="h-4 w-4 rounded-sm" onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }} />
            )}
            <span className="text-sm font-semibold text-slate-500">{mention.publication || domain}</span>
            {mention.publication_date && (
              <>
                <span className="text-slate-300">·</span>
                <span className="text-sm text-slate-400">{formatDate(mention.publication_date)}</span>
              </>
            )}
          </div>

          {/* Title */}
          <h3 className="text-xl font-bold leading-snug text-slate-900 group-hover:text-slate-700 sm:text-2xl">
            {mention.title}
          </h3>

          {/* Social username */}
          {mention.social_username && (
            <p className="mt-1.5 text-sm font-medium text-slate-400">{mention.social_username}</p>
          )}

          {/* Excerpt */}
          {mention.excerpt && (
            <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-slate-500">{mention.excerpt}</p>
          )}
        </div>

        {/* CTA */}
        <div className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-slate-800 transition-colors group-hover:text-violet-600">
          <span>Read the full story</span>
          <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </div>
      </div>
    </motion.a>
  );
}

// ─── Regular Card ─────────────────────────────────────────────────────────────

function MentionCard({ mention, index }: { mention: PressMentionResponse; index: number }) {
  const domain = mention.publication_url ? getDomain(mention.publication_url) : null;
  const favicon = getFaviconUrl(mention.publication_url);
  const platform = detectPlatform(mention.publication_url);
  const pCfg = platform ? PLATFORM_CONFIG[platform] : null;

  return (
    <motion.a
      href={mention.publication_url || "#"}
      target={mention.publication_url ? "_blank" : undefined}
      rel="noopener noreferrer"
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1], delay: index * 0.06 }}
      whileHover={{ y: -5 }}
      className={`group relative flex h-full flex-col overflow-hidden rounded-2xl border bg-white shadow-sm transition-all duration-300 hover:shadow-lg ${pCfg ? pCfg.border : "border-slate-200"}`}
    >
      {/* Platform accent bar */}
      {pCfg && <div className={`h-1 w-full ${pCfg.bar}`} />}

      {/* Cover image */}
      {mention.image_url && (
        <div className="relative h-44 shrink-0 overflow-hidden bg-slate-100">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={mention.image_url}
            alt={mention.title}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
          />
        </div>
      )}

      {/* Content */}
      <div className="flex flex-1 flex-col p-5">
        {/* Publication + date */}
        <div className="mb-3 flex items-center gap-1.5">
          {favicon && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={favicon}
              alt=""
              className="h-4 w-4 shrink-0 rounded-sm"
              onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
            />
          )}
          <span className="truncate text-xs font-semibold text-slate-500">
            {mention.publication || domain || "Press"}
          </span>
          {mention.publication_date && (
            <span className="ml-auto shrink-0 text-xs text-slate-400">
              {formatDate(mention.publication_date)}
            </span>
          )}
        </div>

        {/* Title */}
        <h3 className="flex-1 text-sm font-bold leading-snug text-slate-900 line-clamp-3 group-hover:text-slate-700">
          {mention.title}
        </h3>

        {/* Social username */}
        {mention.social_username && (
          <span className="mt-1.5 text-xs font-medium text-slate-400">{mention.social_username}</span>
        )}

        {/* Excerpt — only when no cover image */}
        {!mention.image_url && mention.excerpt && (
          <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-slate-500">{mention.excerpt}</p>
        )}

        {/* Footer */}
        <div className="mt-4 flex items-center gap-1 text-xs font-bold text-slate-800 transition-colors group-hover:text-violet-600">
          <span>{domain || "Read article"}</span>
          <ArrowUpRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </div>
      </div>
    </motion.a>
  );
}

// ─── Modal row (compact horizontal item inside the modal) ──────────────────────

function ModalMentionRow({ mention }: { mention: PressMentionResponse }) {
  const domain = mention.publication_url ? getDomain(mention.publication_url) : null;
  const favicon = getFaviconUrl(mention.publication_url);
  const platform = detectPlatform(mention.publication_url);
  const pCfg = platform ? PLATFORM_CONFIG[platform] : null;

  return (
    <a
      href={mention.publication_url || "#"}
      target={mention.publication_url ? "_blank" : undefined}
      rel="noopener noreferrer"
      className="group flex items-start gap-4 rounded-xl border border-slate-100 bg-white p-4 transition-all duration-200 hover:border-violet-200 hover:bg-violet-50/40 hover:shadow-sm"
    >
      {/* Favicon / platform colour dot */}
      <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-slate-50">
        {favicon ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={favicon}
            alt=""
            className="h-5 w-5 rounded-sm"
            onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
          />
        ) : (
          <Newspaper className="h-4 w-4 text-slate-400" />
        )}
      </div>

      {/* Text */}
      <div className="min-w-0 flex-1">
        <div className="mb-0.5 flex flex-wrap items-center gap-2">
          {mention.is_featured && (
            <span className="inline-flex items-center rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-700">⭐ Featured</span>
          )}
          {pCfg && (
            <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold ${pCfg.badge}`}>{pCfg.label}</span>
          )}
        </div>
        <p className="truncate text-sm font-semibold text-slate-900 group-hover:text-violet-700">
          {mention.title}
        </p>
        <div className="mt-1 flex flex-wrap items-center gap-1.5 text-xs text-slate-400">
          <span className="font-medium text-slate-500">{mention.publication || domain || "Press"}</span>
          {mention.publication_date && (
            <><span>·</span><span>{formatDate(mention.publication_date)}</span></>
          )}
          {mention.social_username && (
            <><span>·</span><span className="text-slate-400">{mention.social_username}</span></>
          )}
        </div>
      </div>

      {/* Arrow */}
      <ArrowUpRight className="mt-0.5 h-4 w-4 shrink-0 text-slate-300 transition-all group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-violet-500" />
    </a>
  );
}

// ─── All Mentions Modal ───────────────────────────────────────────────────────

function AllMentionsModal({
  mentions,
  onClose,
}: {
  mentions: PressMentionResponse[];
  onClose: () => void;
}) {
  const overlayRef = useRef<HTMLDivElement>(null);

  // Close on Escape
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  // Lock body scroll
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  const featured = mentions.filter((m) => m.is_featured);
  const regular  = mentions.filter((m) => !m.is_featured);

  return (
    <motion.div
      ref={overlayRef}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: "rgba(0,0,0,0.55)", backdropFilter: "blur(4px)" }}
      onClick={(e) => { if (e.target === overlayRef.current) onClose(); }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 24 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 24 }}
        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
        className="relative flex max-h-[88vh] w-full max-w-2xl flex-col overflow-hidden rounded-3xl bg-white shadow-2xl"
      >
        {/* Header */}
        <div className="flex shrink-0 items-center justify-between border-b border-slate-100 px-6 py-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900">All Media Coverage</h2>
            <p className="text-xs text-slate-400">{mentions.length} article{mentions.length !== 1 ? "s" : ""}</p>
          </div>
          <button
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 text-slate-400 transition-colors hover:border-slate-300 hover:bg-slate-100 hover:text-slate-700"
            aria-label="Close modal"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Scrollable list */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {featured.length > 0 && (
            <div className="mb-5">
              <p className="mb-3 text-[11px] font-bold uppercase tracking-wider text-slate-400">Featured</p>
              <div className="flex flex-col gap-2">
                {featured.map((m) => (
                  <ModalMentionRow key={m.id} mention={m} />
                ))}
              </div>
            </div>
          )}
          {regular.length > 0 && (
            <div>
              {featured.length > 0 && (
                <p className="mb-3 text-[11px] font-bold uppercase tracking-wider text-slate-400">All Articles</p>
              )}
              <div className="flex flex-col gap-2">
                {regular.map((m) => (
                  <ModalMentionRow key={m.id} mention={m} />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="shrink-0 border-t border-slate-100 px-6 py-3 text-center">
          <button
            onClick={onClose}
            className="text-sm font-semibold text-slate-400 transition-colors hover:text-slate-700"
          >
            Close
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── Section ──────────────────────────────────────────────────────────────────

const REGULAR_PREVIEW = 6;

const PressMentions = () => {
  const [mentions, setMentions] = useState<PressMentionResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    apiService.getPressMentions()
      .then(setMentions)
      .catch((e) => console.error("Failed to fetch press mentions", e))
      .finally(() => setLoading(false));
  }, []);

  if (loading || mentions.length === 0) return null;

  const featured    = mentions.filter((m) => m.is_featured);
  const regular     = mentions.filter((m) => !m.is_featured);
  const hasMore     = regular.length > REGULAR_PREVIEW;
  const visibleGrid = regular.slice(0, REGULAR_PREVIEW);

  return (
    <section id="press" className="relative overflow-hidden bg-white py-24 dark:bg-zinc-900 md:py-32">
      {/* Decorative background */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_120%_50%_at_50%_-5%,theme(colors.violet.50)_0%,transparent_70%)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-0 h-px w-3/4 -translate-x-1/2 bg-gradient-to-r from-transparent via-violet-200 to-transparent"
      />

      <div className="container relative z-10 mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="mb-12 text-center"
        >
          <h2 className="mt-4 text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
            Featured In
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-slate-500 leading-relaxed">
            Articles, interviews, and features across press and social media.
          </p>
        </motion.div>

        {/* Scrolling publication marquee */}
        <PublicationMarquee mentions={mentions} />

        {/* Featured mentions — horizontal layout */}
        {featured.length > 0 && (
          <div className="mt-10 flex flex-col gap-6">
            {featured.map((m) => (
              <FeaturedCard key={m.id} mention={m} />
            ))}
          </div>
        )}

        {/* Regular card grid */}
        {regular.length > 0 && (
          <div className={featured.length > 0 ? "mt-8" : "mt-10"}>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {visibleGrid.map((m, i) => (
                <MentionCard key={m.id} mention={m} index={i} />
              ))}
            </div>

            {/* Show more button */}
            {hasMore && (
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                className="mt-8 flex justify-center"
              >
                <button
                  onClick={() => setModalOpen(true)}
                  className="group inline-flex items-center gap-2.5 rounded-full border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-700 shadow-sm transition-all duration-200 hover:border-violet-300 hover:bg-violet-50 hover:text-violet-700 hover:shadow-md"
                >
                  <span>Show all {mentions.length} articles</span>
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-100 text-xs font-bold text-slate-500 transition-colors group-hover:bg-violet-100 group-hover:text-violet-600">
                    +{mentions.length - REGULAR_PREVIEW}
                  </span>
                </button>
              </motion.div>
            )}
          </div>
        )}
      </div>

      {/* All mentions modal */}
      <AnimatePresence>
        {modalOpen && (
          <AllMentionsModal mentions={mentions} onClose={() => setModalOpen(false)} />
        )}
      </AnimatePresence>
    </section>
  );
};

export default PressMentions;

