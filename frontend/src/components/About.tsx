// src/components/About.tsx
'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { FaGraduationCap, FaBriefcase, FaUserAlt, FaCode } from 'react-icons/fa';
import { adminApi, EducationResponse, ExperienceResponse } from '@/services/api';

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.3,
    },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { 
    y: 0, 
    opacity: 1,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] }
  }
};

const About = () => {
  const [education, setEducation] = useState<EducationResponse[]>([]);
  const [experience, setExperience] = useState<ExperienceResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const educationData = await adminApi.getEducation();
        const experienceData = await adminApi.getExperience();
        setEducation(educationData);
        setExperience(experienceData);
      } catch (err) {
        console.error("Failed to fetch about data:", err);
        setError("Failed to load data. Please try again later.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return <section id="about" className="relative py-24 md:py-32 overflow-hidden bg-gradient-to-b from-white to-blue-50">
      <div className="container relative z-10 mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center text-gray-600">Loading about data...</div>
      </div>
    </section>;
  }

  if (error) {
    return <section id="about" className="relative py-24 md:py-32 overflow-hidden bg-gradient-to-b from-white to-blue-50">
      <div className="container relative z-10 mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center text-red-500">{error}</div>
      </div>
    </section>;
  }

  return (
    <section id="about" className="relative py-24 md:py-32 overflow-hidden bg-gradient-to-b from-white to-blue-50">
      {/* Background Elements */}
      <div className="absolute inset-0 w-full h-full opacity-30">
        <div className="absolute inset-0 bg-grid-pattern-light"></div>
      </div>
      <div className="absolute -top-40 -right-40 w-96 h-96 bg-cyan-500/10 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-pink-500/10 rounded-full blur-[100px] pointer-events-none"></div>
      
      <div className="container relative z-10 mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
          initial="hidden"
          animate="visible"
          variants={containerVariants}
          className="max-w-6xl mx-auto"
        >
          <motion.div variants={itemVariants} className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold font-heading mb-4">
              <span className="bg-gradient-to-r from-cyan-500 to-pink-600 text-transparent bg-clip-text drop-shadow-[0_2px_8px_rgba(0,255,255,0.3)]">
                About Me
              </span>
            </h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Information Engineering student and full-stack developer with focus on AI and blockchain technologies.
            </p>
          </motion.div>
          
          {/* Personal Info Card */}
          <motion.div 
            variants={itemVariants}
            className="backdrop-blur-md bg-white/80 border border-cyan-300/30 rounded-2xl shadow-2xl mb-16 overflow-hidden"
          >
            <div className="p-8 grid grid-cols-1 lg:grid-cols-4 gap-8 items-center">
              {/* Image */}
              <div className="lg:col-span-1 flex justify-center">
                <div className="relative h-48 w-48 rounded-full overflow-hidden border-4 border-gradient-to-r from-cyan-400 via-blue-500 to-pink-500 shadow-[0_0_25px_rgba(0,255,255,0.4)]">
                  <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 to-pink-500/10"></div>
                  <Image
                    src="/profile.jpg"
                    alt="Giga - Professional Headshot"
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    priority
                    className="object-cover"
                  />
                </div>
              </div>
              
              {/* Bio */}
              <div className="lg:col-span-3">
                <div className="flex items-center gap-2 mb-3">
                  <div className="text-cyan-600"><FaUserAlt /></div>
                  <h3 className="text-xl font-semibold text-gray-800">Professional Summary</h3>
                </div>
                <p className="text-gray-600 mb-4">
                  Hi, I&apos;m <span className="font-semibold text-cyan-600">Giga</span>! I&apos;m an Information Engineering student at Universitas Gadjah Mada,
                  focusing on Artificial Intelligence and Blockchain technologies. I thrive on solving complex problems and building impactful solutions.
                </p>
                <p className="text-gray-600">
                  My recent work includes UGM-AICare, leveraging AI for mental health support, and blockchain-based secure voting systems.
                  I&apos;m particularly interested in NLP applications for healthcare and developing sharia-compliant decentralized finance solutions.
                </p>
                
                {/* Quick Stats */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
                  <div className="bg-gradient-to-br from-cyan-50 to-cyan-100 border border-cyan-400/40 p-3 rounded-lg text-center shadow-sm">
                    <div className="text-cyan-600 font-semibold">3+</div>
                    <div className="text-xs text-cyan-700">Years Coding</div>
                  </div>
                  <div className="bg-gradient-to-br from-pink-50 to-pink-100 border border-pink-400/40 p-3 rounded-lg text-center shadow-sm">
                    <div className="text-pink-600 font-semibold">6+</div>
                    <div className="text-xs text-pink-700">Projects</div>
                  </div>
                  <div className="bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-400/40 p-3 rounded-lg text-center shadow-sm">
                    <div className="text-purple-600 font-semibold">3.8</div>
                    <div className="text-xs text-purple-700">GPA</div>
                  </div>
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-400/40 p-3 rounded-lg text-center shadow-sm">
                    <div className="text-blue-600 font-semibold">3+</div>
                    <div className="text-xs text-blue-700">Certifications</div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
          
            {/* Main Content - Education and Experience */}
            <motion.div 
            variants={itemVariants} 
            className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16"
            >
            {/* Education Section */}
            <div className="h-full flex flex-col">
              <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 flex items-center justify-center rounded-lg bg-gradient-to-r from-cyan-100 to-blue-100 border border-cyan-400/50 shadow-md">
                <FaGraduationCap className="text-cyan-600" />
              </div>
              <h3 className="text-2xl font-semibold text-gray-800">Education</h3>
              </div>
              
              <div className="backdrop-blur-md bg-white/80 border border-cyan-300/30 rounded-xl shadow-xl flex-1 overflow-hidden hover:shadow-[0_0_25px_rgba(0,200,255,0.2)] transition-all duration-300">
              {education.map((edu) => (
                <div 
                key={edu.id} 
                className="p-5 sm:p-6 border-b border-gray-100 last:border-0 hover:bg-cyan-50/50 transition-colors duration-200"
                >
                <div className="flex flex-wrap justify-between items-baseline gap-2 mb-2">
                  <h4 className="text-lg font-semibold bg-gradient-to-r from-cyan-600 to-blue-600 text-transparent bg-clip-text">{edu.degree}</h4>
                  <span className="text-sm font-medium text-cyan-600 whitespace-nowrap">{edu.period}</span>
                </div>
                <div className="flex flex-wrap justify-between items-baseline gap-2 mb-3">
                  <div className="text-gray-600 text-sm sm:text-base">{edu.institution}, {edu.location}</div>
                  {edu.gpa && <div className="text-sm font-medium text-cyan-600 bg-cyan-100/50 px-2 py-0.5 rounded-full">{edu.gpa} GPA</div>}
                </div>
                <p className="text-sm text-gray-500 mt-2 leading-relaxed">{edu.description}</p>
                </div>
              ))}
              </div>
            </div>
            
            {/* Experience Section */}
            <div className="h-full flex flex-col">
              <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 flex items-center justify-center rounded-lg bg-gradient-to-r from-pink-100 to-purple-100 border border-pink-400/50 shadow-md">
                <FaBriefcase className="text-pink-600" />
              </div>
              <h3 className="text-2xl font-semibold text-gray-800">Experience</h3>
              </div>
              
              <div className="backdrop-blur-md bg-white/80 border border-pink-300/30 rounded-xl shadow-xl flex-1 overflow-hidden hover:shadow-[0_0_25px_rgba(219,39,119,0.2)] transition-all duration-300">
              {experience.map((exp) => (
                <div 
                key={exp.id} 
                className="p-5 sm:p-6 border-b border-gray-100 last:border-0 hover:bg-pink-50/50 transition-colors duration-200"
                >
                <div className="flex flex-wrap justify-between items-baseline gap-2 mb-2">
                  <h4 className="text-lg font-semibold bg-gradient-to-r from-pink-600 to-purple-600 text-transparent bg-clip-text">{exp.title}</h4>
                  <span className="text-sm font-medium text-pink-600 whitespace-nowrap">{exp.period}</span>
                </div>
                <div className="flex items-center text-gray-600 text-sm sm:text-base mb-3">
                  <span>{exp.company}</span>
                  <span className="mx-2 text-gray-400">•</span>
                  <span>{exp.location}</span>
                </div>
                <p className="text-sm text-gray-500 leading-relaxed">{exp.description}</p>
                </div>
              ))}
              </div>
            </div>
            </motion.div>
          
          
          
          {/* Technical Areas */}
          <motion.div variants={itemVariants}>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 flex items-center justify-center rounded-lg bg-gradient-to-r from-blue-100 to-cyan-100 border border-blue-400/50 shadow-md">
                <FaCode className="text-blue-600" />
              </div>
              <h3 className="text-2xl font-semibold text-gray-800">Technical Interests</h3>
            </div>
            
            <div className="backdrop-blur-md bg-white/80 border border-blue-300/30 rounded-xl p-6 shadow-xl">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {[
                  "Natural Language Processing",
                  "Healthcare AI Applications",
                  "Decentralized Finance (DeFi)",
                  "Ethical AI Development",
                  "Blockchain Governance Models",
                  "Full-Stack Web Development"
                ].map((interest, i) => (
                  <div key={i} className="flex items-center gap-3 group">
                    <div className="w-2 h-2 rounded-full bg-gradient-to-r from-cyan-500 to-pink-600 group-hover:w-3 group-hover:h-3 transition-all duration-300"></div>
                    <span className="text-gray-600 group-hover:text-cyan-600 transition-colors duration-300">{interest}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default About;