"use client";
import { useEffect, useState } from 'react';
import { apiService } from '@/services/api';
import Image from 'next/image';
import { motion, useReducedMotion } from 'framer-motion';

interface SkillItem {
  id: number;
  name: string;
  category: string;
  proficiency: number;
  display_order: number;
  icon_url?: string;
}

const Skills = () => {
  const [skills, setSkills] = useState<SkillItem[]>([]);
  const reduceMotion = useReducedMotion();

  const copy = {
    title: 'Skills & Expertise',
    subtitle: 'A snapshot of the technologies, tools, and concepts I work with regularly.',
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await apiService.getSkills();
        setSkills(data);
      } catch (error) {
        console.error('Failed to fetch skills', error);
      }
    };
    fetchData();
  }, []);

  // Group skills by category
  const skillsByCategory = skills.reduce((acc, skill) => {
    if (!acc[skill.category]) {
      acc[skill.category] = [];
    }
    acc[skill.category].push(skill);
    return acc;
  }, {} as Record<string, SkillItem[]>);

  // Always render the section, data will populate when available
  return (
    <section id="skills" className="py-16 sm:py-24 bg-gray-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          className="text-center mb-12"
          initial={reduceMotion ? false : { opacity: 0, y: 20 }}
          whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl font-bold tracking-tight text-text-primary sm:text-4xl mb-4 font-heading">
            {copy.title}
          </h2>
          <p className="text-base sm:text-lg text-text-secondary max-w-2xl mx-auto">
            {copy.subtitle}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {Object.entries(skillsByCategory).map(([categoryName, categorySkills]) => (
            <motion.div
              key={categoryName}
              initial={reduceMotion ? false : { opacity: 0, y: 18 }}
              whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.5 }}
              className="bg-white/90 p-6 rounded-xl shadow-sm border border-gray-200/70"
            >
              <h3 className="text-lg font-semibold font-heading text-primary mb-4">{categoryName}</h3>
              <ul className="space-y-2">
                {categorySkills.map((skill) => (
                  <li key={skill.id} className="flex items-center text-text-secondary">
                    {skill.icon_url ? (
                      <span className="relative mr-2 h-5 w-5 flex-shrink-0 overflow-hidden rounded bg-white">
                        <Image src={skill.icon_url} alt={skill.name} fill className="object-contain" />
                      </span>
                    ) : (
                      <svg className="w-4 h-4 mr-2 text-accent flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                    )}
                    <span>{skill.name}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Skills;
