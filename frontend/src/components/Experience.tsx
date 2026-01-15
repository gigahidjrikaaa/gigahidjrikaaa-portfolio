"use client";
import { useEffect, useState } from 'react';
import { apiService } from '@/services/api';
import Image from 'next/image';
import { motion, useReducedMotion } from 'framer-motion';

interface ExperienceItem {
  id: number;
  title: string;
  company: string;
  period: string;
  description: string;
  company_logo_url?: string;
}

const Experience = () => {
  const [experience, setExperience] = useState<ExperienceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const reduceMotion = useReducedMotion();

  const copy = {
    title: 'Work Experience',
    loading: 'Loading...',
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await apiService.getExperience();
        setExperience(data);
      } catch (error) {
        console.error('Failed to fetch experience', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Always render the section, data will populate when available
  return (
    <section id="experience" className="py-16 sm:py-24 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.h2
          className="text-3xl font-bold text-center mb-10 text-gray-900"
          initial={reduceMotion ? false : { opacity: 0, y: 20 }}
          whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6 }}
        >
          {copy.title}
        </motion.h2>

        {loading ? (
          <div className="text-center text-gray-500">{copy.loading}</div>
        ) : (
          <div className="grid gap-6 lg:grid-cols-2">
            {experience.map((item) => (
              <motion.article
                key={item.id}
                initial={reduceMotion ? false : { opacity: 0, y: 18 }}
                whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.5 }}
                className="p-6 rounded-2xl border border-gray-200 bg-white shadow-sm"
              >
                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                  {item.company_logo_url ? (
                    <div className="relative h-12 w-12 overflow-hidden rounded-full border border-gray-200 bg-white">
                      <Image
                        src={item.company_logo_url}
                        alt={item.company}
                        fill
                        className="object-contain"
                      />
                    </div>
                  ) : null}
                  <div>
                    <h3 className="text-lg sm:text-xl font-semibold text-gray-900">{item.title}</h3>
                    <p className="text-sm sm:text-base text-gray-600">{item.company}</p>
                  </div>
                </div>
                <p className="mt-3 text-sm text-gray-500">{item.period}</p>
                <p className="mt-3 text-sm sm:text-base text-gray-700 leading-relaxed">{item.description}</p>
              </motion.article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default Experience;
