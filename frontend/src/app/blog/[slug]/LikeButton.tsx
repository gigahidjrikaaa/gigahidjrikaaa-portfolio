"use client";

import { useEffect, useState } from "react";
import { apiService } from "@/services/api";

const LikeButton = ({ slug, initialCount }: { slug: string; initialCount: number }) => {
  const [count, setCount] = useState(initialCount);
  const [liked, setLiked] = useState(false);

  useEffect(() => {
    if (typeof localStorage === "undefined") return;
    const key = `blog_liked_${slug}`;
    setLiked(Boolean(localStorage.getItem(key)));
  }, [slug]);

  const handleLike = async () => {
    if (liked) return;
    try {
      const res = await apiService.trackBlogLike(slug);
      setCount(res.like_count);
      if (typeof localStorage !== "undefined") {
        localStorage.setItem(`blog_liked_${slug}`, "true");
      }
      setLiked(true);
    } catch {
      // ignore
    }
  };

  return (
    <button
      type="button"
      onClick={handleLike}
      className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition-colors ${
        liked ? "border-gray-200 bg-gray-100 text-gray-500" : "border-gray-300 text-gray-700 hover:bg-gray-50"
      }`}
      aria-pressed={liked}
      aria-label="Like this post"
    >
      ❤️ {count}
    </button>
  );
};

export default LikeButton;
