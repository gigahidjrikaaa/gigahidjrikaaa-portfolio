"use client";
import { useEffect, useState } from 'react';
import { apiService } from '@/services/api';

interface SkillItem {
  id: number;
  name: string;
  category: string;
  proficiency: number;
  display_order: number;
}

const Skills = () => {
  const [skills, setSkills] = useState<SkillItem[]>([]);
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
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold tracking-tight text-text-primary sm:text-4xl mb-4 font-heading">
            Skills & Expertise
          </h2>
          <p className="text-lg text-text-secondary max-w-2xl mx-auto">
            A snapshot of the technologies, tools, and concepts I work with regularly.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {Object.entries(skillsByCategory).map(([categoryName, categorySkills]) => (
            <div key={categoryName} className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="text-lg font-semibold font-heading text-primary mb-4">{categoryName}</h3>
              <ul className="space-y-2">
                {categorySkills.map((skill) => (
                  <li key={skill.id} className="flex items-center text-text-secondary">
                    <svg className="w-4 h-4 mr-2 text-accent flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                    <span>{skill.name}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Skills;
