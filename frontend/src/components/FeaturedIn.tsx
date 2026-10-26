"use client";

import PublicationMarquee from "./PublicationMarquee";
import { apiService, PressMentionResponse } from "@/services/api";
import { useApiData } from "@/hooks/useApiData";
import { motion } from "framer-motion";
import { EASE_OUT } from "@/lib/motion";

/**
 * Slim trust band under the hero: unique press outlets as a scrolling
 * favicon strip. Renders nothing when there are fewer than two outlets —
 * an empty "featured in" reads worse than no band at all.
 */
const FeaturedIn = () => {
  const { data } = useApiData<PressMentionResponse[]>(() => apiService.getPressMentions());
  const mentions = data ?? [];

  const hasOutletStrip =
    new Set(mentions.map((m) => m.publication).filter(Boolean)).size >= 2;

  if (!hasOutletStrip) return null;

  return (
    <motion.section
      aria-label="Featured in"
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, ease: EASE_OUT }}
      className="border-y border-zinc-200 bg-white"
    >
      <div className="container mx-auto flex flex-col items-center gap-1 px-4 pt-6 sm:px-6 lg:px-8">
        <span className="text-[10px] font-semibold uppercase tracking-[0.3em] text-zinc-400">
          Featured in
        </span>
      </div>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <PublicationMarquee mentions={mentions} />
      </div>
    </motion.section>
  );
};

export default FeaturedIn;
