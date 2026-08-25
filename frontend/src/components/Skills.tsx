"use client";

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { apiService, SkillResponse } from '@/services/api';
import LoadingAnimation from '@/components/ui/LoadingAnimation';
import ErrorState from '@/components/ui/ErrorState';
import { useApiData } from '@/hooks/useApiData';
import { containerVariants, itemVariants } from '@/lib/motion';
import { Database, Globe, Wrench, Cpu, Code, Terminal, Boxes } from 'lucide-react';

const clampProficiency = (value: number | null | undefined) => {
  if (typeof value !== 'number' || Number.isNaN(value)) return 0;
  return Math.max(0, Math.min(5, Math.round(value)));
};

const copy = {
  eyebrow: 'EXPERTISE',
  title: 'Skills & Technologies',
  subtitle: 'Tools I use in production, grouped by where they help most in the build process.',
  loading: 'Loading skills...',
  empty: 'Skills coming soon.',
};

const getCategoryIcon = (category: string) => {
  const cat = category.toLowerCase();
  if (cat.includes('front')) return Globe;
  if (cat.includes('back') || cat.includes('database')) return Database;
  if (cat.includes('tool') || cat.includes('devops')) return Wrench;
  if (cat.includes('lang')) return Code;
  if (cat.includes('ai') || cat.includes('machine')) return Cpu;
  if (cat.includes('block') || cat.includes('web3')) return Boxes;
  return Terminal;
};

const Skills = () => {
  const { data: skillsData, loading, error, retry } = useApiData<SkillResponse[]>(() => apiService.getSkills());
  const skills = useMemo(() => skillsData ?? [], [skillsData]);

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
    <section id="skills" className="relative overflow-hidden bg-zinc-50 py-24 md:py-32">
      <div className="container relative z-10 mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
          variants={containerVariants}
        >
          {/* Header */}
          <motion.div variants={itemVariants} className="mb-16 md:mb-24 max-w-2xl">
            <span className="mb-4 block text-xs font-semibold uppercase tracking-[0.25em] text-zinc-500">
              {copy.eyebrow}
            </span>
            <h2 className="text-4xl md:text-5xl font-semibold tracking-tight text-gray-900 mb-4">
              {copy.title}
            </h2>
            <p className="text-lg text-gray-500">
              {copy.subtitle}
            </p>
          </motion.div>

          {loading ? (
            <div className="flex justify-center py-20">
              <LoadingAnimation label={copy.loading} />
            </div>
          ) : error ? (
            <ErrorState
              title="Skills couldn't load"
              message={error}
              onRetry={retry}
            />
          ) : categories.length > 0 ? (
            <div className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6">
              {categories.map((category) => {
                const Icon = getCategoryIcon(category);
                return (
                  <motion.div
                    key={category}
                    variants={itemVariants}
                    className="break-inside-avoid relative overflow-hidden rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm transition-colors hover:border-zinc-300"
                  >
                    {/* Category Header */}
                    <div className="mb-6 flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-zinc-100 text-zinc-600">
                        <Icon className="h-5 w-5" />
                      </div>
                      <h3 className="text-lg font-semibold capitalize tracking-wide text-gray-900">
                        {category}
                      </h3>
                    </div>

                    {/* Skills List */}
                    <div className="space-y-3">
                      {skillsByCategory[category].map((skill, idx) => {
                        const level = clampProficiency(skill.proficiency);
                        // Convert 5 level to percentage for the bar
                        const percentage = (level / 5) * 100;
                        
                        return (
                          <div 
                            key={skill.id}
                            className="group relative flex flex-col gap-1.5 rounded-xl bg-zinc-50 p-3 hover:bg-white transition-colors border border-transparent hover:border-zinc-200"
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-medium text-zinc-900 text-sm">
                                {skill.name}
                              </span>
                            </div>
                            
                            {/* Visual Progress Bar instead of dots */}
                            <div className="h-1.5 w-full overflow-hidden rounded-full bg-zinc-200">
                              <motion.div
                                initial={{ width: 0 }}
                                whileInView={{ width: `${percentage}%` }}
                                viewport={{ once: true }}
                                transition={{ duration: 1, delay: 0.2 + idx * 0.1, ease: 'easeOut' }}
                                className="h-full rounded-full bg-zinc-900"
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-gray-500">
              <Boxes className="h-12 w-12 text-zinc-300 mb-4" />
              <p>{copy.empty}</p>
            </div>
          )}
        </motion.div>
      </div>
    </section>
  );
};

export default Skills;
