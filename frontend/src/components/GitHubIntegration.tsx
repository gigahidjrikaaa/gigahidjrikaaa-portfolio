"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowUpRight, Github, GitBranch, Star } from "lucide-react";
import LoadingAnimation from "@/components/ui/LoadingAnimation";
import LanguageDecoration from "@/components/github/LanguageDecoration";
import { apiService, HighlightedGitHubRepoResponse } from "@/services/api";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.15 },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] },
  },
};

const copy = {
  eyebrow: "LIVE GITHUB SIGNAL",
  title: "Open Source Footprint",
  subtitle: "A split view of curated highlights and latest repository momentum.",
  loading: "Loading GitHub signal...",
  error: "Unable to load GitHub data right now.",
  fallback: "The feed is temporarily unavailable, but the full profile is still accessible.",
  profilePanelTitle: "Public Profile",
  profileFallbackName: "GitHub Profile",
  profileCta: "Explore Full Profile",
  highlightedRepos: "Highlighted Repositories",
  topRepos: "Top Repositories",
  noHighlightedRepos: "No highlighted repositories selected yet.",
  noTopRepos: "No repositories available right now.",
  stats: {
    repositories: "Repositories",
    stars: "Stars",
    forks: "Forks",
    followers: "Followers",
    activity: "Recent Push Events",
  },
  updated: "Updated",
  noBio: "Building practical products with clear engineering signals.",
  defaultRepoDescription: "No description provided yet.",
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

interface GitHubRepoOwner {
  login: string;
}

interface GitHubRepo {
  id: number;
  name: string;
  full_name: string;
  description: string | null;
  language: string | null;
  stargazers_count: number;
  forks_count: number;
  html_url: string;
  topics: string[];
  updated_at: string;
  owner: GitHubRepoOwner;
}

interface GitHubEvent {
  type: string;
}

const GITHUB_USERNAME = "gigahidjrikaaa";

const formatDate = (isoDate: string): string => {
  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) {
    return "Unknown";
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  }).format(date);
};

const getRepoKey = (owner: string, repoName: string): string =>
  `${owner.toLowerCase()}/${repoName.toLowerCase()}`;

interface RepositoryCardProps {
  repo: GitHubRepo;
  emphasized?: boolean;
  shouldReduceMotion: boolean;
}

const RepositoryCard = ({ repo, emphasized = false, shouldReduceMotion }: RepositoryCardProps) => {
  return (
    <motion.a
      href={repo.html_url}
      target="_blank"
      rel="noopener noreferrer"
      variants={itemVariants}
      whileHover={shouldReduceMotion ? undefined : { y: -4 }}
      className={`group relative block overflow-hidden rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm transition-all hover:border-zinc-300 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 ${
        emphasized ? "sm:p-6" : ""
      }`}
      aria-label={`Open repository ${repo.full_name} in a new tab`}
    >
      <LanguageDecoration language={repo.language} className={emphasized ? "h-28 w-52" : "h-24 w-48"} />

      <div className="relative z-10">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-zinc-500">{repo.owner.login}</p>
            <h4 className="mt-1 line-clamp-2 text-base font-semibold text-zinc-900">{repo.name}</h4>
          </div>
          <ArrowUpRight className="mt-1 h-3 w-3 shrink-0 text-zinc-400 transition group-hover:text-zinc-700" />
        </div>

        <p className={`mt-3 text-sm leading-relaxed text-zinc-600 ${emphasized ? "line-clamp-4" : "line-clamp-3"}`}>
          {repo.description || copy.defaultRepoDescription}
        </p>

        <div className="mt-4 flex flex-wrap items-center gap-2 text-xs">
          <span className="inline-flex items-center gap-1 rounded-full bg-zinc-100 px-2.5 py-1 font-medium text-zinc-700">
            <span className="h-1.5 w-1.5 rounded-full bg-zinc-500" />
            {repo.language || "Unknown"}
          </span>

          {repo.topics?.slice(0, emphasized ? 3 : 2).map((topic) => (
            <span
              key={topic}
              className="rounded-full border border-zinc-200 bg-white px-2.5 py-1 font-medium text-zinc-600"
            >
              {topic}
            </span>
          ))}
        </div>

        <div className="mt-5 flex items-center justify-between border-t border-zinc-100 pt-4 text-xs text-zinc-500">
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1">
              <Star className="h-3 w-3 text-zinc-700" fill="currentColor" />
              {repo.stargazers_count}
            </span>
            <span className="inline-flex items-center gap-1">
              <GitBranch className="h-3 w-3" />
              {repo.forks_count}
            </span>
          </div>
          <span>
            {copy.updated} {formatDate(repo.updated_at)}
          </span>
        </div>
      </div>
    </motion.a>
  );
};

const GitHubIntegration = () => {
  const shouldReduceMotion = useReducedMotion();
  const reduceMotion = Boolean(shouldReduceMotion);

  const [user, setUser] = useState<GitHubUser | null>(null);
  const [repos, setRepos] = useState<GitHubRepo[]>([]);
  const [highlightedRepos, setHighlightedRepos] = useState<GitHubRepo[]>([]);
  const [highlightedConfig, setHighlightedConfig] = useState<HighlightedGitHubRepoResponse[]>([]);
  const [contributions, setContributions] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const fetchGitHubData = async () => {
      try {
        const [userResponse, reposResponse, highlightedResponse] = await Promise.all([
          fetch(`https://api.github.com/users/${GITHUB_USERNAME}`),
          fetch(`https://api.github.com/users/${GITHUB_USERNAME}/repos?sort=updated&per_page=30&type=owner`),
          apiService.getHighlightedGitHubRepos().catch(() => []),
        ]);

        if (!userResponse.ok || !reposResponse.ok) {
          throw new Error("GitHub API request failed");
        }

        const userData: GitHubUser = await userResponse.json();
        const repoData: GitHubRepo[] = await reposResponse.json();

        if (!cancelled) {
          setUser(userData);
          setRepos(repoData);
        }

        const activeHighlighted = highlightedResponse
          .filter((item) => item.is_active)
          .sort((a, b) => a.display_order - b.display_order);

        if (!cancelled) {
          setHighlightedConfig(activeHighlighted);
        }

        if (activeHighlighted.length > 0) {
          const highlightedResults = await Promise.all(
            activeHighlighted.map(async (item) => {
              const response = await fetch(
                `https://api.github.com/repos/${encodeURIComponent(item.owner)}/${encodeURIComponent(item.repo_name)}`
              );
              if (!response.ok) {
                return null;
              }
              const repo: GitHubRepo = await response.json();
              return repo;
            })
          );

          const highlightedMap = new Map<string, GitHubRepo>();
          highlightedResults.forEach((repo) => {
            if (!repo) {
              return;
            }
            highlightedMap.set(getRepoKey(repo.owner.login, repo.name), repo);
          });

          const orderedHighlighted = activeHighlighted
            .map((item) => highlightedMap.get(getRepoKey(item.owner, item.repo_name)))
            .filter((repo): repo is GitHubRepo => Boolean(repo));

          if (!cancelled) {
            setHighlightedRepos(orderedHighlighted);
          }
        } else if (!cancelled) {
          setHighlightedRepos([]);
        }

        try {
          const contributionResponse = await fetch(
            `https://api.github.com/users/${GITHUB_USERNAME}/events/public?per_page=100`
          );
          if (contributionResponse.ok) {
            const events: GitHubEvent[] = await contributionResponse.json();
            const pushEvents = events.filter((event) => event.type === "PushEvent");
            if (!cancelled) {
              setContributions(pushEvents.length);
            }
          }
        } catch {
          if (!cancelled) {
            setContributions(0);
          }
        }
      } catch (requestError) {
        console.error("Failed to fetch GitHub data:", requestError);
        if (!cancelled) {
          setError(true);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchGitHubData();

    return () => {
      cancelled = true;
    };
  }, []);

  const highlightedKeys = useMemo(
    () => new Set(highlightedRepos.map((repo) => getRepoKey(repo.owner.login, repo.name))),
    [highlightedRepos]
  );

  const topRepos = useMemo(
    () => repos.filter((repo) => !highlightedKeys.has(getRepoKey(repo.owner.login, repo.name))).slice(0, 6),
    [highlightedKeys, repos]
  );

  const stats = useMemo(() => {
    const totalStars = repos.reduce((sum, repo) => sum + repo.stargazers_count, 0);
    const totalForks = repos.reduce((sum, repo) => sum + repo.forks_count, 0);

    return {
      repositories: user?.public_repos || 0,
      stars: totalStars,
      forks: totalForks,
      followers: user?.followers || 0,
    };
  }, [repos, user]);

  const profileUrl = user?.html_url ?? `https://github.com/${GITHUB_USERNAME}`;
  const profileName = user?.name || copy.profileFallbackName;

  const animationContainer = reduceMotion
    ? { hidden: { opacity: 1 }, visible: { opacity: 1 } }
    : containerVariants;

  const animationItem = reduceMotion
    ? { hidden: { opacity: 1, y: 0 }, visible: { opacity: 1, y: 0 } }
    : itemVariants;

  if (loading) {
    return (
      <section className="border-b border-zinc-200 bg-zinc-50 py-24 md:py-32">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <LoadingAnimation label={copy.loading} />
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="border-b border-zinc-200 bg-zinc-50 py-24 md:py-32">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl rounded-3xl border border-zinc-200 bg-white p-8 text-center shadow-sm">
            <h2 className="text-2xl font-semibold text-zinc-900">{copy.error}</h2>
            <p className="mt-3 text-sm leading-relaxed text-zinc-600">{copy.fallback}</p>
            <a
              href={profileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-zinc-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-zinc-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400"
              aria-label="Open GitHub profile in a new tab"
            >
              <Github className="h-4 w-4" />
              {copy.profileCta}
            </a>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section aria-labelledby="github-section-title" className="relative overflow-hidden border-b border-zinc-200 bg-zinc-50 py-24 md:py-32">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(0,0,0,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(0,0,0,0.03)_1px,transparent_1px)] bg-[size:46px_46px]" />
      </div>

      <div className="relative container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={reduceMotion ? false : "hidden"}
          whileInView={reduceMotion ? undefined : "visible"}
          viewport={{ once: true, amount: 0.25 }}
          variants={animationContainer}
          className="space-y-10"
        >
          <motion.div variants={animationItem} className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <span className="text-xs font-semibold uppercase tracking-[0.24em] text-zinc-500">{copy.eyebrow}</span>
              <h2 id="github-section-title" className="mt-3 text-3xl font-semibold leading-tight text-zinc-900 sm:text-4xl lg:text-5xl">
                {copy.title}
              </h2>
              <p className="mt-4 max-w-2xl text-zinc-600">{copy.subtitle}</p>
            </div>

            <a
              href={profileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 self-start rounded-full bg-zinc-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-zinc-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 lg:self-auto"
              aria-label="Open GitHub profile in a new tab"
            >
              <Github className="h-4 w-4" />
              {copy.profileCta}
              <ArrowUpRight className="h-3 w-3" />
            </a>
          </motion.div>

          <motion.div variants={animationContainer} className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
            <motion.article variants={animationItem} className="rounded-3xl border border-zinc-200 bg-white/95 p-6 shadow-sm backdrop-blur-sm sm:p-8">
              <div className="flex items-start gap-4 sm:gap-5">
                <Image
                  src={user?.avatar_url || "https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png"}
                  alt={`${profileName} avatar`}
                  width={80}
                  height={80}
                  className="h-16 w-16 rounded-2xl border border-zinc-200 object-cover sm:h-20 sm:w-20"
                />

                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">{copy.profilePanelTitle}</p>
                  <h3 className="mt-2 truncate text-2xl font-semibold text-zinc-900">{profileName}</h3>
                  <p className="mt-1 text-sm text-zinc-500">@{user?.login || GITHUB_USERNAME}</p>
                </div>
              </div>

              <p className="mt-5 text-sm leading-relaxed text-zinc-600">{user?.bio || copy.noBio}</p>

              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4">
                  <p className="text-xs uppercase tracking-[0.14em] text-zinc-500">{copy.stats.followers}</p>
                  <p className="mt-2 text-2xl font-semibold text-zinc-900">{stats.followers.toLocaleString()}</p>
                </div>
                <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4">
                  <p className="text-xs uppercase tracking-[0.14em] text-zinc-500">{copy.stats.activity}</p>
                  <p className="mt-2 text-2xl font-semibold text-zinc-900">{contributions.toLocaleString()}</p>
                </div>
              </div>
            </motion.article>

            <motion.div variants={animationContainer} className="grid gap-4 sm:grid-cols-2">
              <motion.div variants={animationItem} className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
                <p className="text-xs uppercase tracking-[0.14em] text-zinc-500">{copy.stats.repositories}</p>
                <p className="mt-3 text-3xl font-semibold text-zinc-900">{stats.repositories.toLocaleString()}</p>
              </motion.div>
              <motion.div variants={animationItem} className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
                <p className="text-xs uppercase tracking-[0.14em] text-zinc-500">{copy.stats.stars}</p>
                <p className="mt-3 text-3xl font-semibold text-zinc-900">{stats.stars.toLocaleString()}</p>
              </motion.div>
              <motion.div variants={animationItem} className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
                <p className="text-xs uppercase tracking-[0.14em] text-zinc-500">{copy.stats.forks}</p>
                <p className="mt-3 text-3xl font-semibold text-zinc-900">{stats.forks.toLocaleString()}</p>
              </motion.div>
              <motion.div variants={animationItem} className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
                <p className="text-xs uppercase tracking-[0.14em] text-zinc-500">{copy.highlightedRepos}</p>
                <p className="mt-3 text-3xl font-semibold text-zinc-900">{highlightedConfig.length}</p>
              </motion.div>
            </motion.div>
          </motion.div>

          <motion.div variants={animationContainer} className="space-y-8">
            <motion.div variants={animationItem}>
              <div className="mb-5 flex items-center justify-between gap-3">
                <h3 className="text-xl font-semibold text-zinc-900">{copy.highlightedRepos}</h3>
                <span className="text-xs font-semibold uppercase tracking-[0.14em] text-zinc-500">Curated from admin</span>
              </div>

              {highlightedRepos.length === 0 ? (
                <p className="text-sm text-zinc-500">{copy.noHighlightedRepos}</p>
              ) : (
                <div className="grid gap-4 lg:grid-cols-2">
                  {highlightedRepos.map((repo) => (
                    <RepositoryCard
                      key={getRepoKey(repo.owner.login, repo.name)}
                      repo={repo}
                      emphasized
                      shouldReduceMotion={reduceMotion}
                    />
                  ))}
                </div>
              )}
            </motion.div>

            <motion.div variants={animationItem}>
              <div className="mb-5">
                <h3 className="text-xl font-semibold text-zinc-900">{copy.topRepos}</h3>
              </div>

              {topRepos.length === 0 ? (
                <p className="text-sm text-zinc-500">{copy.noTopRepos}</p>
              ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {topRepos.map((repo) => (
                    <RepositoryCard
                      key={getRepoKey(repo.owner.login, repo.name)}
                      repo={repo}
                      shouldReduceMotion={reduceMotion}
                    />
                  ))}
                </div>
              )}
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default GitHubIntegration;