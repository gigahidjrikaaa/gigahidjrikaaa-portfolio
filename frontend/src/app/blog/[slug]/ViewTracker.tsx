"use client";

import { useEffect } from "react";
import { apiService } from "@/services/api";

const ViewTracker = ({ slug }: { slug: string }) => {
  useEffect(() => {
    if (!slug) return;
    const key = `blog_viewed_${slug}`;
    if (typeof sessionStorage !== "undefined" && sessionStorage.getItem(key)) {
      return;
    }
    apiService
      .trackBlogView(slug)
      .then(() => {
        if (typeof sessionStorage !== "undefined") {
          sessionStorage.setItem(key, "true");
        }
      })
      .catch(() => {
        // ignore tracking errors
      });
  }, [slug]);

  return null;
};

export default ViewTracker;