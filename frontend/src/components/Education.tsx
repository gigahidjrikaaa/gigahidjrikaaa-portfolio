"use client";
import { useEffect, useState } from 'react';
import { apiService } from '@/services/api';

interface EducationItem {
  id: number;
  degree: string;
  institution: string;
  period: string;
  description: string;
}

const Education = () => {
  const [education, setEducation] = useState<EducationItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await apiService.getEducation();
        setEducation(data);
      } catch (error) {
        console.error('Failed to fetch education', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Always render the section, data will populate when available
  return (
    <section id="education" className="py-16">
      <h2 className="text-3xl font-bold text-center mb-8">Education</h2>
      <div className="space-y-8">
        {education.map((item) => (
          <div key={item.id} className="p-6 border rounded-lg shadow-md">
            <h3 className="text-xl font-semibold">{item.degree}</h3>
            <p className="text-md text-gray-600">{item.institution}</p>
            <p className="text-sm text-gray-500 mb-2">{item.period}</p>
            <p className="text-gray-700">{item.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Education;
