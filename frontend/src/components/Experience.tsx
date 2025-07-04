"use client";
import { useEffect, useState } from 'react';
import { apiService } from '@/services/api';

interface ExperienceItem {
  id: number;
  title: string;
  company: string;
  period: string;
  description: string;
}

const Experience = () => {
  const [experience, setExperience] = useState<ExperienceItem[]>([]);
  const [loading, setLoading] = useState(true);

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
    <section id="experience" className="py-16">
      <h2 className="text-3xl font-bold text-center mb-8">Work Experience</h2>
      {loading ? (
        <div className="text-center">Loading...</div>
      ) : (
        <div className="space-y-8">
          {experience.map((item) => (
            <div key={item.id} className="p-6 border rounded-lg shadow-md">
              <h3 className="text-xl font-semibold">{item.title}</h3>
              <p className="text-md text-gray-600">{item.company}</p>
              <p className="text-sm text-gray-500 mb-2">{item.period}</p>
              <p className="text-gray-700">{item.description}</p>
            </div>
          ))}
        </div>
      )}
    </section>
  );
};

export default Experience;
