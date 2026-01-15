"use client";
import { useEffect, useState } from 'react';
import { apiService } from '@/services/api';
import Image from 'next/image';
import { motion, useReducedMotion } from 'framer-motion';

interface EducationItem {
  id: number;
  degree: string;
  institution: string;
  period: string;
  description: string;
  institution_logo_url?: string;
}

const Education = () => {
  const [education, setEducation] = useState<EducationItem[]>([]);
  const reduceMotion = useReducedMotion();

  const copy = {
    title: 'Education',
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await apiService.getEducation();
        setEducation(data);
      } catch (error) {
        console.error('Failed to fetch education', error);
      }
    };
    fetchData();
  }, []);

  // Always render the section, data will populate when available
  return (
    <section id="education" className="py-16 sm:py-24 bg-gray-50">
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
        <div className="grid gap-6 lg:grid-cols-2">
          {education.map((item) => (
            <motion.article
              key={item.id}
              initial={reduceMotion ? false : { opacity: 0, y: 18 }}
              whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.5 }}
              className="p-6 rounded-2xl border border-gray-200 bg-white shadow-sm"
            >
              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                {item.institution_logo_url ? (
                  <div className="relative h-12 w-12 overflow-hidden rounded-full border border-gray-200 bg-white">
                    <Image
                      src={item.institution_logo_url}
                      alt={item.institution}
                      fill
                      className="object-contain"
                    />
                  </div>
                ) : null}
                <div>
                  <h3 className="text-lg sm:text-xl font-semibold text-gray-900">{item.degree}</h3>
                  <p className="text-sm sm:text-base text-gray-600">{item.institution}</p>
                </div>
              </div>
              <p className="mt-3 text-sm text-gray-500">{item.period}</p>
              <p className="mt-3 text-sm sm:text-base text-gray-700 leading-relaxed">{item.description}</p>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Education;
