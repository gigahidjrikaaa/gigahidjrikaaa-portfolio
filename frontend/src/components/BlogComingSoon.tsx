"use client";

import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import Image from "next/image";
import { apiService, BlogPostResponse } from "@/services/api";

const copy = {
  title: "Blog",
  subtitle: "Insights, experiments, and behind-the-scenes notes. Fresh stories are on the way.",
  comingSoon: "Coming soon",
  empty: "No posts yet — stay tuned.",
};

const BlogComingSoon = () => {
  const [posts, setPosts] = useState<BlogPostResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    const load = async () => {
      try {
        const data = await apiService.getBlogPosts();
        setPosts(data);
      } catch (error) {
        console.error("Failed to fetch blog posts", error);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  return (
    <section id="blog" className="relative overflow-hidden bg-white py-16 sm:py-24">
      <div className="absolute inset-0">
        <div className="absolute -top-24 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-cyan-500/10 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-72 w-72 rounded-full bg-pink-500/10 blur-3xl" />
      </div>

      <div className="container relative z-10 mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          className="mx-auto max-w-3xl text-center"
          initial={reduceMotion ? false : { opacity: 0, y: 20 }}
          whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">{copy.title}</h2>
          <p className="mt-4 text-base text-gray-600 sm:text-lg">{copy.subtitle}</p>
        </motion.div>

        <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {loading ? (
            <div className="text-sm text-gray-500">Loading...</div>
          ) : posts.length === 0 ? (
            <motion.div
              initial={reduceMotion ? false : { opacity: 0, y: 18 }}
              whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.5 }}
              className="rounded-2xl border border-dashed border-gray-300 bg-white p-8 text-center"
            >
              <div className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-500">
                {copy.comingSoon}
              </div>
              <p className="mt-3 text-sm text-gray-500">{copy.empty}</p>
            </motion.div>
          ) : (
            posts.map((post, index) => (
              <motion.article
                key={post.id}
                initial={reduceMotion ? false : { opacity: 0, y: 18 }}
                whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.5, delay: index * 0.05 }}
                className="flex h-full flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm"
              >
                <div className="relative h-44 w-full bg-gray-100">
                  {post.cover_image_url ? (
                    <Image src={post.cover_image_url} alt={post.title} fill className="object-cover" />
                  ) : null}
                </div>
                <div className="flex flex-1 flex-col p-6">
                  <div className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-500">
                    {post.status === "coming_soon" ? copy.comingSoon : post.status}
                  </div>
                  <h3 className="mt-2 text-lg font-semibold text-gray-900">{post.title}</h3>
                  {post.excerpt ? (
                    <p className="mt-3 text-sm text-gray-600">{post.excerpt}</p>
                  ) : null}
                </div>
              </motion.article>
            ))
          )}
        </div>
      </div>
    </section>
  );
};

export default BlogComingSoon;
