"use client";

import { useEffect, useState } from 'react';
import { motion } from "framer-motion";
import { FaGithub, FaStar, FaCodeBranch, FaUser } from "react-icons/fa";
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
  eyebrow: "OPEN SOURCE",
  title: "GitHub Activity",
  subtitle: "Exploring code, contributions, and collaborative projects.",
  loading: "Loading GitHub stats...",
  error: "Unable to fetch GitHub stats.",
  stats: {
    repositories: "Repositories",
    stars: "Total Stars",
    followers: "Followers",
    contributions: "Contributions (2024)",
  },
  viewProfile: "View Full Profile",
  topRepos: "Top Repositories",
  viewRepo: "View Repository",
  language: "Language",
  stars: "stars",
};

interface GitHubUser {
  login: string;
  name: string;
  bio: string;
  public_repos: number;
  followers: number;
  avatar_url: string;
  html_url: string;
}

interface GitHubRepo {
  id: number;
  name: string;
  description: string;
  language: string;
  stargazers_count: number;
  forks_count: number;
  html_url: string;
  topics: string[];
  updated_at: string;
}

const GITHUB_USERNAME = "gigahidjrikaaa";

const GitHubIntegration = () => {
  const [user, setUser] = useState<GitHubUser | null>(null);
  const [repos, setRepos] = useState<GitHubRepo[]>([]);
  const [contributions, setContributions] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const fetchGitHubData = async () => {
      try {
        const userResponse = await fetch(`https://api.github.com/users/${GITHUB_USERNAME}`);
        const userData: GitHubUser = await userResponse.json();
        if (!cancelled) setUser(userData);

        const reposResponse = await fetch(
          `https://api.github.com/users/${GITHUB_USERNAME}/repos?sort=updated&per_page=6&type=owner`
        );
        const reposData: GitHubRepo[] = await reposResponse.json();
        if (!cancelled) setRepos(reposData);

        try {
          const contribResponse = await fetch(
            `https://api.github.com/users/${GITHUB_USERNAME}/events/public?per_page=100`
          );
          const events = await contribResponse.json();
          const pushEvents = events.filter((e: { type: string }) => e.type === "PushEvent");
          if (!cancelled) setContributions(pushEvents.length);
        } catch {
          console.log("Could not fetch contributions");
        }
      } catch (error) {
        console.error("Failed to fetch GitHub data:", error);
        if (!cancelled) setError(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchGitHubData();

    return () => {
      cancelled = true;
    };
  }, []);

  const statCards = [
    {
      label: copy.stats.repositories,
      value: user?.public_repos || 0,
      icon: FaCodeBranch,
      color: "bg-blue-50 text-blue-600",
    },
    {
      label: copy.stats.followers,
      value: user?.followers || 0,
      icon: FaUser,
      color: "bg-purple-50 text-purple-600",
    },
    {
      label: copy.stats.contributions,
      value: contributions,
      icon: FaGithub,
      color: "bg-gray-50 text-gray-600",
    },
  ];

  return (
    <section className="border-b border-gray-200 bg-zinc-50 py-24 dark:bg-zinc-900 md:py-32">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={containerVariants}
          className="space-y-8"
        >
          {/* Header */}
          <motion.div variants={itemVariants} className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div>
              <span className="text-xs font-semibold uppercase tracking-[0.25em] text-gray-500">
                {copy.eyebrow}
              </span>
              <h2 className="mt-2 text-3xl font-semibold leading-tight text-gray-900 sm:text-4xl lg:text-5xl">
                {copy.title}
              </h2>
              <p className="mt-4 text-gray-500 leading-relaxed max-w-xl">{copy.subtitle}</p>
            </div>
            {user && (
              <a
                href={user.html_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full bg-gray-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-gray-800"
              >
                <FaGithub className="h-5 w-5" />
                {copy.viewProfile} →
              </a>
            )}
          </motion.div>

          {/* Stats Grid */}
          <motion.div
            variants={containerVariants}
            className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
          >
            {statCards.map((stat) => (
              <motion.div
                key={stat.label}
                variants={itemVariants}
                whileHover={{ scale: 1.02, y: -4 }}
                className={`rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition-all hover:shadow-md ${stat.color}`}
              >
                <stat.icon className="h-6 w-6" />
                <div>
                  <div className="text-3xl font-bold">{stat.value.toLocaleString()}</div>
                  <div className="mt-1 text-sm font-medium text-gray-500">
                    {stat.label}
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* Top Repositories */}
          <motion.div
            variants={containerVariants}
          >
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {copy.topRepos}
              </h3>
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {repos.slice(0, 6).map((repo) => (
                <motion.a
                  key={repo.id}
                  href={repo.html_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  variants={itemVariants}
                  className="block rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition-all hover:shadow-md hover:border-gray-300"
                >
                  <div className="mb-3">
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="flex-1 font-semibold text-gray-900 line-clamp-2">
                        {repo.name}
                      </h4>
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        {repo.stargazers_count > 0 && (
                          <span className="flex items-center gap-1">
                            <FaStar className="h-3 w-3 text-yellow-500" />
                            {repo.stargazers_count}
                          </span>
                        )}
                        {repo.forks_count > 0 && (
                          <span className="flex items-center gap-1">
                            <FaCodeBranch className="h-3 w-3" />
                            {repo.forks_count}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {repo.description && (
                    <p className="mb-3 line-clamp-2 text-sm text-gray-600">
                      {repo.description}
                    </p>
                  )}

                  <div className="mt-4 flex flex-wrap gap-2">
                    {repo.language && (
                      <span className="rounded-full bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700">
                        {repo.language}
                      </span>
                    )}

                    {repo.topics && repo.topics.slice(0, 3).map((topic) => (
                      <span
                        key={topic}
                        className="rounded-full bg-gray-100 px-2 py-1 text-xs font-medium text-gray-600"
                      >
                        {topic}
                      </span>
                    ))}
                  </div>
                </motion.a>
              ))}
            </div>
          </motion.div>

          {loading ? (
            <LoadingAnimation label={copy.loading} />
          ) : error ? (
            <div className="text-center text-red-600">{copy.error}</div>
          ) : null}
        </motion.div>
      </div>
    </section>
  );
};

export default GitHubIntegration;