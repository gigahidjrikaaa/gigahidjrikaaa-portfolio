"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { NewspaperIcon, ArrowTopRightOnSquareIcon } from "@heroicons/react/24/outline";
import { apiService, PressMentionResponse } from "@/services/api";
import LoadingAnimation from "@/components/ui/LoadingAnimation";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.2 },
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

const copy = {
  eyebrow: "PRESS & MEDIA",
  title: "Featured In",
  subtitle: "Articles, podcasts, and interviews where I've been featured or mentioned.",
  loading: "Loading press mentions...",
  empty: "Press mentions coming soon.",
  readMore: "Read article",
};

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
          <LoadingAnimation label={copy.loading} />
        </div>
      </section>
    );
  }

  if (mentions.length === 0) {
    return (
      <section className="relative overflow-hidden bg-gray-100 py-24 md:py-32">
        <div className="container relative z-10 mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-gray-500">{copy.empty}</p>
        </div>
      </section>
    );
  }

  return (
    <section id="press" className="relative overflow-hidden bg-gray-100 py-24 md:py-32">
      <div className="container relative z-10 mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={containerVariants}
        >
          <motion.div variants={itemVariants} className="mb-16 text-center">
            <span className="text-xs font-semibold uppercase tracking-[0.25em] text-gray-500">
              {copy.eyebrow}
            </span>
            <h2 className="mt-2 text-3xl font-semibold leading-tight text-gray-900 sm:text-4xl lg:text-5xl">
              {copy.title}
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-gray-600 leading-relaxed">{copy.subtitle}</p>
          </motion.div>

          <motion.div
            variants={itemVariants}
            className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
          >
            {mentions.map((mention) => (
              <motion.a
                key={mention.id}
                href={mention.publication_url || "#"}
                target={mention.publication_url ? "_blank" : undefined}
                rel={mention.publication_url ? "noopener noreferrer" : undefined}
                variants={itemVariants}
                whileHover={{ y: -4, transition: { duration: 0.2 } }}
                className="group relative flex h-full flex-col overflow-hidden rounded-[28px] border border-gray-200 bg-white p-6 shadow-sm transition-all hover:shadow-xl hover:border-gray-300"
              >
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-purple-50">
                  <NewspaperIcon className="h-8 w-8 text-purple-600" />
                </div>

                <div className="flex-1">
                  {mention.publication && (
                    <div className="mb-2">
                      <span className="inline-block rounded-full bg-purple-100 px-3 py-1 text-xs font-medium text-purple-700">
                        {mention.publication}
                      </span>
                    </div>
                  )}

                  {mention.publication_date && (
                    <p className="mb-2 text-xs text-gray-500">
                      {new Date(mention.publication_date).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </p>
                  )}

                  <h3 className="text-lg font-semibold text-gray-900 mb-3 line-clamp-2">
                    {mention.title}
                  </h3>

                  {mention.excerpt && (
                    <p className="text-sm text-gray-600 leading-relaxed line-clamp-3">
                      {mention.excerpt}
                    </p>
                  )}
                </div>

                <div className="mt-4 pt-4 border-t border-gray-200">
                  <span className="inline-flex items-center gap-1 text-sm font-semibold text-purple-600 group-hover:text-purple-800">
                    {copy.readMore}
                    <ArrowTopRightOnSquareIcon className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </span>
                </div>

                {mention.is_featured && (
                  <div className="absolute top-4 right-4">
                    <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700">
                      Featured
                    </span>
                  </div>
                )}
              </motion.a>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default PressMentions;
