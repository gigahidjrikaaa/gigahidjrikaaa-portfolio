"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronLeft, ChevronRight, Sparkles } from "lucide-react";
import Image from "next/image";
import { apiService, StoryResponse } from "@/services/api";
import LoadingAnimation from "@/components/ui/LoadingAnimation";

// Duration each story auto-advances (ms)
const STORY_DURATION = 5000;

// ---------------------------------------------------------------------------
// Story bubble — circular avatar with gradient ring for featured items
// ---------------------------------------------------------------------------
interface StoryBubbleProps {
  story: StoryResponse;
  onClick: () => void;
  delay: number;
}

const StoryBubble = ({ story, onClick, delay }: StoryBubbleProps) => (
  <motion.button
    initial={{ opacity: 0, scale: 0.85 }}
    whileInView={{ opacity: 1, scale: 1 }}
    viewport={{ once: true }}
    transition={{ duration: 0.4, delay, ease: [0.22, 1, 0.36, 1] }}
    whileHover={{ scale: 1.06 }}
    whileTap={{ scale: 0.96 }}
    onClick={onClick}
    className="flex flex-shrink-0 flex-col items-center gap-2"
    aria-label={story.title || "View story"}
  >
    {/* Ring wrapper */}
    <div
      className={`rounded-full p-[3px] ${
        story.is_featured
          ? "bg-gradient-to-tr from-yellow-400 via-rose-500 to-violet-500"
          : "bg-gray-200"
      }`}
    >
      <div className="relative h-20 w-20 overflow-hidden rounded-full border-2 border-white bg-gray-100">
        {(story.thumbnail_url || story.image_url) && (
          <Image
            src={story.thumbnail_url || story.image_url}
            alt={story.title || "Story"}
            fill
            sizes="80px"
            className="object-cover"
          />
        )}
      </div>
    </div>

    {/* Label */}
    <span className="w-20 truncate text-center text-xs font-medium text-gray-600">
      {story.title || "Moment"}
    </span>
  </motion.button>
);

// ---------------------------------------------------------------------------
// Story modal with top progress bars
// ---------------------------------------------------------------------------
interface StoryModalProps {
  stories: StoryResponse[];
  startIndex: number;
  onClose: () => void;
}

const StoryModal = ({ stories, startIndex, onClose }: StoryModalProps) => {
  const [currentIndex, setCurrentIndex] = useState(startIndex);
  const [progress, setProgress] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const story = stories[currentIndex];

  const goTo = (index: number) => {
    if (index < 0 || index >= stories.length) {
      onClose();
      return;
    }
    setCurrentIndex(index);
    setProgress(0);
  };

  // Auto advance
  useEffect(() => {
    setProgress(0);
    const start = Date.now();
    intervalRef.current = setInterval(() => {
      const elapsed = Date.now() - start;
      const pct = Math.min((elapsed / STORY_DURATION) * 100, 100);
      setProgress(pct);
      if (pct >= 100) {
        clearInterval(intervalRef.current!);
        goTo(currentIndex + 1);
      }
    }, 50);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentIndex]);

  // Keyboard navigation
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") goTo(currentIndex - 1);
      if (e.key === "ArrowRight") goTo(currentIndex + 1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentIndex]);

  if (!story) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/95"
    >
      {/* Close */}
      <button
        onClick={onClose}
        className="absolute right-5 top-5 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-sm transition hover:bg-white/20"
        aria-label="Close"
      >
        <X className="h-5 w-5" />
      </button>

      {/* Prev / Next tap zones */}
      <button
        onClick={() => goTo(currentIndex - 1)}
        className="absolute left-4 top-1/2 z-10 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-sm transition hover:bg-white/20"
        aria-label="Previous story"
      >
        <ChevronLeft className="h-6 w-6" />
      </button>
      <button
        onClick={() => goTo(currentIndex + 1)}
        className="absolute right-4 top-1/2 z-10 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-sm transition hover:bg-white/20"
        aria-label="Next story"
      >
        <ChevronRight className="h-6 w-6" />
      </button>

      {/* Card */}
      <motion.div
        key={currentIndex}
        initial={{ scale: 0.96, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.96, opacity: 0 }}
        transition={{ duration: 0.22 }}
        className="relative mx-4 w-full max-w-sm overflow-hidden rounded-3xl bg-gray-900"
        style={{ maxHeight: "85vh", aspectRatio: "9/16" }}
      >
        {/* Progress bars */}
        <div className="absolute left-0 right-0 top-3 z-20 flex gap-1 px-4">
          {stories.map((_, i) => (
            <div key={i} className="h-[3px] flex-1 overflow-hidden rounded-full bg-white/25">
              {i < currentIndex && (
                <div className="h-full w-full rounded-full bg-white" />
              )}
              {i === currentIndex && (
                <div
                  className="h-full rounded-full bg-white transition-none"
                  style={{ width: `${progress}%` }}
                />
              )}
            </div>
          ))}
        </div>

        {/* Image */}
        <Image
          src={story.image_url}
          alt={story.title || "Story"}
          fill
          sizes="(max-width: 640px) 100vw, 400px"
          className="object-cover"
          priority
        />

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-black/30" />

        {/* Content */}
        <div className="absolute bottom-0 left-0 right-0 p-6">
          {story.is_featured && (
            <div className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-[11px] font-semibold text-white backdrop-blur-sm">
              <Sparkles className="h-3 w-3" />
              Featured Moment
            </div>
          )}
          {story.title && (
            <h3 className="mb-1 text-xl font-bold leading-snug text-white">
              {story.title}
            </h3>
          )}
          {story.caption && (
            <p className="text-sm leading-relaxed text-white/80">{story.caption}</p>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};

// ---------------------------------------------------------------------------
// Main section
// ---------------------------------------------------------------------------
const Stories = () => {
  const [stories, setStories] = useState<StoryResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalStartIndex, setModalStartIndex] = useState<number | null>(null);

  useEffect(() => {
    apiService
      .getStories()
      .then(setStories)
      .catch((err) => console.error("Failed to fetch stories", err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <section className="bg-white py-24 dark:bg-zinc-900 md:py-32">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <LoadingAnimation label="Loading stories…" />
        </div>
      </section>
    );
  }

  if (stories.length === 0) return null;

  return (
    <section id="stories" className="relative overflow-hidden bg-white py-24 dark:bg-zinc-900 md:py-32">
      <div className="container relative z-10 mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          className="mb-12 text-center"
        >
          <span className="text-xs font-semibold uppercase tracking-[0.25em] text-gray-400">
            Behind the Scenes
          </span>
          <h2 className="mt-2 text-3xl font-semibold leading-tight text-gray-900 sm:text-4xl lg:text-5xl">
            Moments &amp; Stories
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-gray-500 leading-relaxed">
            A glimpse into my workspace, late-night builds, and the people who make
            the journey worth it.
          </p>
        </motion.div>

        {/* Story bubbles horizontal strip */}
        <div className="flex justify-center gap-6 overflow-x-auto pb-4">
          {stories.map((story, index) => (
            <StoryBubble
              key={story.id}
              story={story}
              delay={index * 0.06}
              onClick={() => setModalStartIndex(index)}
            />
          ))}
        </div>
      </div>

      {/* Fullscreen modal */}
      <AnimatePresence>
        {modalStartIndex !== null && (
          <StoryModal
            stories={stories}
            startIndex={modalStartIndex}
            onClose={() => setModalStartIndex(null)}
          />
        )}
      </AnimatePresence>
    </section>
  );
};

export default Stories;
