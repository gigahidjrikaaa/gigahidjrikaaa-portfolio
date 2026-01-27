// src/components/Skills.tsx
"use client";

import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { apiService, SkillResponse } from '@/services/api';
import LoadingAnimation from '@/components/ui/LoadingAnimation';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.2 },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] },
  },
};

const PROFICIENCY_LEVELS = [
  { value: 1, label: 'Beginner' },
  { value: 2, label: 'Intermediate' },
  { value: 3, label: 'Advanced' },
  { value: 4, label: 'Expert' },
  { value: 5, label: 'Master' },
] as const;

const clampProficiency = (value: number | null | undefined) => {
  if (typeof value !== 'number' || Number.isNaN(value)) return 0;
  return Math.max(0, Math.min(5, Math.round(value)));
};

const getProficiencyLabel = (value: number | null | undefined) => {
  const clamped = clampProficiency(value);
  const match = PROFICIENCY_LEVELS.find((l) => l.value === clamped);
  return match?.label ?? 'Unspecified';
};

const levelDotVariants = {
  hidden: { scale: 0.9, opacity: 0.5 },
  visible: { scale: 1, opacity: 1, transition: { duration: 0.25 } },
};

const copy = {
  eyebrow: 'EXPERTISE',
  title: 'Skills & Technologies',
  subtitle: 'A curated toolkit spanning languages, frameworks, tools, and methodologies.',
  loading: 'Loading skills...',
  empty: 'Skills coming soon.',
  codingChallenges: {
    title: 'Coding Challenge Progress',
    subtitle: 'Tracking problem-solving skills across competitive platforms',
    leetcode: 'LeetCode',
    hackerrank: 'HackerRank',
    widgetNote: 'If the widget does not load, open the profile in a new tab.',
  },
};

const widgets = {
  leetcode: {
    profileUrl: 'https://leetcode.com/u/gigahidjrikaaa/',
    // Repo-backed card example: https://github.com/KnlnKS/leetcode-stats
    cardUrl: 'https://leetcode-stats-six.vercel.app/?username=gigahidjrikaaa&theme=light',
  },
  hackerrank: {
    profileUrl: 'https://www.hackerrank.com/profile/gigahidjrikaaa',
    // Repo-backed badges SVG: https://github.com/VenkataRamanaRao5/hackerrank
    badgesSvgUrl: 'https://hackerrank-badges.vercel.app/gigahidjrikaaa',
  },
};

const Skills = () => {
  const [skills, setSkills] = useState<SkillResponse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await apiService.getSkills();
        setSkills(data);
      } catch (error) {
        console.error('Failed to fetch skills', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Group skills by category
  const skillsByCategory = useMemo(() => {
    return skills.reduce((acc, skill) => {
      const cat = skill.category || 'Other';
      if (!acc[cat]) acc[cat] = [];
      acc[cat].push(skill);
      return acc;
    }, {} as Record<string, SkillResponse[]>);
  }, [skills]);

  const categories = Object.keys(skillsByCategory);

  return (
    <section id="skills" className="relative overflow-hidden bg-white py-24 md:py-32">
      <div className="container relative z-10 mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={containerVariants}
        >
          {/* Header */}
          <motion.div variants={itemVariants} className="mb-16 max-w-2xl">
            <span className="text-xs font-semibold uppercase tracking-[0.25em] text-gray-500">
              {copy.eyebrow}
            </span>
            <h2 className="mt-2 text-3xl font-semibold leading-tight text-gray-900 sm:text-4xl lg:text-5xl">
              {copy.title}
            </h2>
            <p className="mt-4 text-gray-500 leading-relaxed">{copy.subtitle}</p>
          </motion.div>

          {loading ? (
            <LoadingAnimation label={copy.loading} />
          ) : categories.length > 0 ? (
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {categories.map((category) => (
                <motion.div
                  key={category}
                  variants={itemVariants}
                  className="rounded-[28px] border border-gray-200/60 bg-gray-50/50 p-6"
                >
                  <h3 className="mb-6 text-sm font-semibold uppercase tracking-[0.2em] text-gray-500">
                    {category}
                  </h3>
                  <div className="space-y-5">
                    {skillsByCategory[category].map((skill) => (
                      <div key={skill.id}>
                        <div className="mb-2 flex items-center justify-between">
                          <span className="text-sm font-medium text-gray-900">{skill.name}</span>
                          <span className="text-xs text-gray-500">{getProficiencyLabel(skill.proficiency)}</span>
                        </div>
                        <div
                          className="flex items-center gap-1"
                          role="img"
                          aria-label={`Skill level: ${getProficiencyLabel(skill.proficiency)}`}
                        >
                          {Array.from({ length: 5 }).map((_, i) => {
                            const level = clampProficiency(skill.proficiency);
                            const filled = i < level;
                            return (
                              <motion.span
                                key={i}
                                variants={levelDotVariants}
                                className={
                                  'h-2.5 w-2.5 rounded-full ' +
                                  (filled ? 'bg-gray-900' : 'bg-gray-200')
                                }
                              />
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center text-gray-500">{copy.empty}</div>
          )}

          {/* Coding Challenges Section */}
          <motion.div
            variants={itemVariants}
            className="mt-16 rounded-[28px] border border-gray-200/60 bg-gradient-to-br from-gray-50/50 to-white p-8"
          >
            <div className="mb-8">
              <h3 className="text-2xl font-semibold text-gray-900">
                {copy.codingChallenges.title}
              </h3>
              <p className="mt-2 text-sm text-gray-500">{copy.codingChallenges.subtitle}</p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              {/* LeetCode */}
              <div className="rounded-xl border border-gray-200 bg-white p-6">
                <div className="mb-4 flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-orange-100">
                    <span className="text-xl font-bold text-orange-600">LC</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">{copy.codingChallenges.leetcode}</h4>
                    <a
                      href={widgets.leetcode.profileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 hover:underline"
                    >
                      View Profile →
                    </a>
                  </div>
                </div>
                  <div className="w-full overflow-hidden rounded-lg border border-gray-100 bg-gray-50">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={widgets.leetcode.cardUrl}
                      alt="LeetCode stats card"
                      loading="lazy"
                      className="h-auto w-full"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                <p className="mt-3 text-xs text-gray-500">{copy.codingChallenges.widgetNote}</p>
              </div>

              {/* HackerRank */}
              <div className="rounded-xl border border-gray-200 bg-white p-6">
                <div className="mb-4 flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-100">
                    <span className="text-xl font-bold text-green-600">HR</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">{copy.codingChallenges.hackerrank}</h4>
                    <a
                      href={widgets.hackerrank.profileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 hover:underline"
                    >
                      View Profile →
                    </a>
                  </div>
                </div>
                <div className="w-full overflow-hidden rounded-lg border border-gray-100 bg-gray-50">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={widgets.hackerrank.badgesSvgUrl}
                    alt="HackerRank badges"
                    loading="lazy"
                    className="h-auto w-full"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <p className="mt-3 text-xs text-gray-500">{copy.codingChallenges.widgetNote}</p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default Skills;
