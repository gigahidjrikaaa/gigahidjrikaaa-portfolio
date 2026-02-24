"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { apiService, PressMentionResponse } from "@/services/api";
import LoadingAnimation from "@/components/ui/LoadingAnimation";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
  },
};

function getDomain(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

function formatDate(dateStr: string): string {
  try {
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return dateStr;
  }
}

interface MentionCardProps {
  mention: PressMentionResponse;
}

function MentionCard({ mention }: MentionCardProps) {
  const domain = mention.publication_url ? getDomain(mention.publication_url) : null;
  const faviconUrl = domain
    ? `https://www.google.com/s2/favicons?sz=32&domain_url=https://${domain}`
    : null;

  return (
    <motion.a
      href={mention.publication_url || "#"}
      target={mention.publication_url ? "_blank" : undefined}
      rel={mention.publication_url ? "noopener noreferrer" : undefined}
      variants={itemVariants}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition-all hover:shadow-lg hover:border-gray-300"
    >
      {/* Cover image or gradient placeholder */}
      {mention.image_url ? (
        <div className="relative h-44 overflow-hidden bg-gray-100 shrink-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={mention.image_url}
            alt={mention.title}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).style.display = "none";
            }}
          />
          {mention.is_featured && (
            <span className="absolute top-3 left-3 rounded-full bg-amber-400/90 px-2.5 py-0.5 text-xs font-semibold text-amber-900 backdrop-blur-sm">
              Featured
            </span>
          )}
        </div>
      ) : (
        <div className="relative h-14 shrink-0 bg-gradient-to-r from-slate-100 to-gray-50 flex items-center px-5">
          {mention.is_featured && (
            <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-semibold text-amber-700">
              Featured
            </span>
          )}
        </div>
      )}

      {/* Content */}
      <div className="flex flex-1 flex-col p-5">
        {/* Publication row */}
        <div className="mb-3 flex items-center gap-2">
          {faviconUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={faviconUrl}
              alt=""
              width={14}
              height={14}
              className="rounded-sm opacity-80"
              onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
            />
          )}
          <span className="text-xs font-medium text-gray-500 truncate">
            {mention.publication || domain || "Press"}
          </span>
          {mention.publication_date && (
            <>
              <span className="text-gray-300">·</span>
              <span className="text-xs text-gray-400 shrink-0">
                {formatDate(mention.publication_date)}
              </span>
            </>
          )}
        </div>

        {/* Title */}
        <h3 className="flex-1 text-sm font-semibold leading-snug text-gray-900 line-clamp-3 group-hover:text-gray-700">
          {mention.title}
        </h3>

        {/* Excerpt — only show if there's space (no cover image) */}
        {mention.excerpt && !mention.image_url && (
          <p className="mt-2 text-xs text-gray-500 leading-relaxed line-clamp-2">
            {mention.excerpt}
          </p>
        )}

        {/* Footer */}
        <div className="mt-4 flex items-center gap-1 text-xs font-semibold text-gray-900 group-hover:text-gray-600">
          <span>{domain || "Read article"}</span>
          <ArrowUpRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </div>
      </div>
    </motion.a>
  );
}

const PressMentions = () => {
  const [mentions, setMentions] = useState<PressMentionResponse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await apiService.getPressMentions();
        setMentions(data);
      } catch (error) {
        console.error("Failed to fetch press mentions", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <section className="relative overflow-hidden bg-gray-100 py-24 md:py-32">
        <div className="container relative z-10 mx-auto px-4 sm:px-6 lg:px-8">
          <LoadingAnimation label="Loading press mentions..." />
        </div>
      </section>
    );
  }

  if (mentions.length === 0) return null;

  return (
    <section id="press" className="relative overflow-hidden bg-gray-100 py-24 md:py-32">
      <div className="container relative z-10 mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.15 }}
          variants={containerVariants}
        >
          {/* Section header */}
          <motion.div variants={itemVariants} className="mb-16 text-center">
            <span className="text-xs font-semibold uppercase tracking-[0.25em] text-gray-500">
              PRESS &amp; MEDIA
            </span>
            <h2 className="mt-2 text-3xl font-semibold leading-tight text-gray-900 sm:text-4xl lg:text-5xl">
              Featured In
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-gray-600 leading-relaxed">
              Articles, podcasts, and interviews where I&apos;ve been featured or mentioned.
            </p>
          </motion.div>

          {/* Cards grid */}
          <motion.div
            variants={containerVariants}
            className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3"
          >
            {mentions.map((mention) => (
              <MentionCard key={mention.id} mention={mention} />
            ))}
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default PressMentions;
