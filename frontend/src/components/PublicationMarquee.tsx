"use client";

import type { PressMentionResponse } from "@/services/api";

function getDomain(url: string): string {
  try { return new URL(url).hostname.replace(/^www\./, ""); }
  catch { return url; }
}

export function getFaviconUrl(url?: string | null): string | null {
  if (!url) return null;
  return `https://www.google.com/s2/favicons?sz=32&domain_url=https://${getDomain(url)}`;
}

/**
 * Slim "featured in" publication strip: unique outlets as favicon chips in a
 * seamless, hover-pausable loop. Second track half is an aria-hidden clone
 * that completes the loop; screen readers read the outlets once.
 */
export default function PublicationMarquee({ mentions }: { mentions: PressMentionResponse[] }) {
  const seen = new Set<string>();
  const pubs = mentions
    .filter((m) => m.publication && !seen.has(m.publication) && !!seen.add(m.publication))
    .map((m) => ({ name: m.publication!, url: m.publication_url }));

  if (pubs.length < 2) return null;

  const duration = Math.max(14, pubs.length * 4);

  return (
    <>
      <style>{`@keyframes pm-scroll{0%{transform:translateX(0)}100%{transform:translateX(-50%)}}.pm-track:hover{animation-play-state:paused}`}</style>
      <div className="relative overflow-hidden py-5 before:pointer-events-none before:absolute before:inset-y-0 before:left-0 before:z-10 before:w-16 before:bg-gradient-to-r before:from-white before:to-transparent after:pointer-events-none after:absolute after:inset-y-0 after:right-0 after:z-10 after:w-16 after:bg-gradient-to-l after:from-white after:to-transparent">
        {/* Second half is an aria-hidden clone that completes the seamless
            loop; hover pauses the scroll so favicons can be read. */}
        <div
          className="pm-track inline-flex w-max"
          style={{ animation: `pm-scroll ${duration}s linear infinite` }}
        >
          {[false, true].map((isClone) => (
            <div
              key={String(isClone)}
              aria-hidden={isClone || undefined}
              className="flex shrink-0 items-center gap-3 pr-3"
            >
              {pubs.map((pub) => {
                const favicon = getFaviconUrl(pub.url);
                return (
                  <div
                    key={`${isClone ? "clone-" : ""}${pub.name}`}
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
          ))}
        </div>
      </div>
    </>
  );
}
