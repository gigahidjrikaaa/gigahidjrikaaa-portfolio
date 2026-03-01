"use client";

import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { apiService, SkillResponse } from '@/services/api';
import LoadingAnimation from '@/components/ui/LoadingAnimation';
import { Layers, Database, Globe, Wrench, Cpu, Code, Terminal, Boxes } from 'lucide-react';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { type: 'spring', stiffness: 100, damping: 15 },
  },
};

const clampProficiency = (value: number | null | undefined) => {
  if (typeof value !== 'number' || Number.isNaN(value)) return 0;
  return Math.max(0, Math.min(5, Math.round(value)));
};

const copy = {
  eyebrow: 'EXPERTISE',
  title: 'Skills & Technologies',
  subtitle: 'A curated toolkit spanning languages, frameworks, tools, and methodologies.',
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
    <section id="skills" className="relative overflow-hidden bg-zinc-50 py-24 dark:bg-black md:py-32">
      {/* Background Ambience */}
      <div className="pointer-events-none absolute inset-0 -z-10 flex items-center justify-center opacity-30 dark:opacity-20">
        <div className="h-[40rem] w-[40rem] rounded-full bg-gradient-to-tr from-emerald-500 to-sky-500 blur-[128px]" />
      </div>

      <div className="container relative z-10 mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
          variants={containerVariants}
        >
          {/* Header */}
          <motion.div variants={itemVariants} className="mb-16 md:mb-24 flex flex-col items-center text-center">
            <div className="flex items-center gap-2 mb-6 font-mono text-sm tracking-widest uppercase text-emerald-600 dark:text-emerald-400">
              <span className="w-8 h-px bg-emerald-600/30 dark:bg-emerald-400/30" />
              <Layers className="h-4 w-4" />
              <span>{copy.eyebrow}</span>
              <span className="w-8 h-px bg-emerald-600/30 dark:bg-emerald-400/30" />
            </div>
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-gray-900 dark:text-white mb-4">
              {copy.title}
            </h2>
            <p className="max-w-2xl text-lg text-gray-500 dark:text-zinc-400">
              {copy.subtitle}
            </p>
          </motion.div>

          {loading ? (
            <div className="flex justify-center py-20">
              <LoadingAnimation label={copy.loading} />
            </div>
          ) : categories.length > 0 ? (
            <div className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6">
              {categories.map((category) => {
                const Icon = getCategoryIcon(category);
                return (
                  <motion.div
                    key={category}
                    variants={itemVariants}
                    className="break-inside-avoid relative overflow-hidden rounded-3xl border border-white/40 bg-white/60 p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] backdrop-blur-xl dark:border-white/10 dark:bg-zinc-900/40 dark:shadow-[0_8px_30px_rgb(0,0,0,0.12)] transition-all hover:bg-white/80 dark:hover:bg-zinc-900/60"
                  >
                    {/* Category Header */}
                    <div className="mb-6 flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300">
                        <Icon className="h-5 w-5" />
                      </div>
                      <h3 className="text-lg font-semibold capitalize tracking-wide text-gray-900 dark:text-white">
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
                            className="group relative flex flex-col gap-1.5 rounded-xl bg-zinc-50 dark:bg-zinc-950/50 p-3 hover:bg-white dark:hover:bg-zinc-800 transition-colors border border-transparent hover:border-zinc-200 dark:hover:border-zinc-700/60"
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-medium text-zinc-900 dark:text-zinc-100 text-sm">
                                {skill.name}
                              </span>
                            </div>
                            
                            {/* Visual Progress Bar instead of dots */}
                            <div className="h-1.5 w-full overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-800">
                              <motion.div
                                initial={{ width: 0 }}
                                whileInView={{ width: `${percentage}%` }}
                                viewport={{ once: true }}
                                transition={{ duration: 1, delay: 0.2 + idx * 0.1, ease: 'easeOut' }}
                                className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-sky-400"
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
              <Boxes className="h-12 w-12 text-zinc-300 dark:text-zinc-700 mb-4" />
              <p>{copy.empty}</p>
            </div>
          )}
        </motion.div>
      </div>
    </section>
  );
};

export default Skills;
