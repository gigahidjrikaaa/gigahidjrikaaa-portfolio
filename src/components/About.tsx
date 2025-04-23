// src/components/About.tsx
import Image from 'next/image';
import { motion } from 'framer-motion';
import { FaGraduationCap, FaBriefcase, FaAward, FaUserAlt } from 'react-icons/fa';

// Education data
const education = [
  {
    degree: 'Bachelor of Engineering in Information Engineering',
    institution: 'Universitas Gadjah Mada',
    location: 'Yogyakarta, Indonesia',
    period: '2021 - Present',
    description: 'Focus on Artificial Intelligence and Blockchain technologies. Relevant coursework includes Machine Learning, Data Structures, and Web Development.',
    gpa: '3.8/4.0'
  },
  // Add more education if needed
];

// Experience data
const experience = [
  {
    title: 'Full Stack Developer',
    company: 'UGM-AICare Project',
    location: 'Yogyakarta, Indonesia',
    period: 'Jun 2023 - Present',
    description: 'Developed an AI-powered mental health chatbot for university students using Next.js, FastAPI, and Redis. Implemented real-time conversation features and data privacy measures.'
  },
  {
    title: 'Blockchain Developer',
    company: 'Decentralized Voting System',
    location: 'Remote',
    period: 'Jan 2023 - May 2023',
    description: 'Created a proof-of-concept blockchain application for secure and transparent voting using Solidity and Ethereum testnet.'
  },
  // Add more experience if needed
];

// Certifications/Awards
const certifications = [
  {
    title: 'TensorFlow Developer Certification',
    issuer: 'Google',
    date: 'March 2023'
  },
  {
    title: 'Blockchain Fundamentals',
    issuer: 'Coursera - UC Berkeley',
    date: 'November 2022'
  },
  // Add more certifications if needed
];

const About = () => {
  return (
    <section id="about" className="py-20 sm:py-28 bg-gray-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="max-w-7xl mx-auto"
        >
          <h2 className="text-3xl font-bold text-center text-text-primary sm:text-4xl mb-12 font-heading">
            About <span className="text-blue-600">Me</span>
          </h2>
          
          {/* Personal Info Card */}
          <div className="bg-white rounded-lg shadow-sm p-8 mb-12 grid grid-cols-1 lg:grid-cols-4 gap-8 items-center">
            {/* Image */}
            <div className="lg:col-span-1 flex justify-center">
              <div className="relative h-48 w-48 rounded-full overflow-hidden border-4 border-blue-100 shadow-md">
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
                <FaUserAlt className="text-blue-600" />
                <h3 className="text-xl font-semibold text-text-primary">Professional Summary</h3>
              </div>
              <p className="text-text-secondary mb-4">
                Hi, I&apos;m <span className="font-semibold text-blue-600">Giga</span>! I&apos;m an Information Engineering student at Universitas Gadjah Mada,
                focusing on Artificial Intelligence and Blockchain technologies. I thrive on solving complex problems and building impactful solutions.
              </p>
              <p className="text-text-secondary">
                My recent work includes UGM-AICare, leveraging AI for mental health support, and blockchain-based secure voting systems.
                I&apos;m particularly interested in NLP applications for healthcare and developing sharia-compliant decentralized finance solutions.
              </p>
              
              {/* Quick Stats */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
                <div className="bg-blue-50 p-3 rounded-lg text-center">
                  <div className="text-blue-600 font-semibold">3+</div>
                  <div className="text-xs text-gray-600">Years Coding</div>
                </div>
                <div className="bg-blue-50 p-3 rounded-lg text-center">
                  <div className="text-blue-600 font-semibold">6+</div>
                  <div className="text-xs text-gray-600">Projects</div>
                </div>
                <div className="bg-blue-50 p-3 rounded-lg text-center">
                  <div className="text-blue-600 font-semibold">3.8</div>
                  <div className="text-xs text-gray-600">GPA</div>
                </div>
                <div className="bg-blue-50 p-3 rounded-lg text-center">
                  <div className="text-blue-600 font-semibold">3+</div>
                  <div className="text-xs text-gray-600">Certifications</div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Education Section */}
          <div className="mb-12">
            <div className="flex items-center gap-2 mb-6">
              <FaGraduationCap className="text-2xl text-blue-600" />
              <h3 className="text-2xl font-semibold text-text-primary">Education</h3>
            </div>
            
            <div className="bg-white rounded-lg shadow-sm">
              {education.map((edu, index) => (
                <div key={index} className="p-6 border-b border-gray-100 last:border-0">
                  <div className="flex flex-col md:flex-row md:justify-between md:items-start mb-2">
                    <h4 className="text-lg font-semibold text-blue-600">{edu.degree}</h4>
                    <span className="text-sm font-medium text-gray-500 md:text-right">{edu.period}</span>
                  </div>
                  <div className="flex flex-col md:flex-row md:justify-between md:items-start mb-2">
                    <div className="text-gray-700">{edu.institution}, {edu.location}</div>
                    <div className="text-sm font-medium text-gray-700 md:text-right">GPA: {edu.gpa}</div>
                  </div>
                  <p className="text-sm text-gray-600 mt-2">{edu.description}</p>
                </div>
              ))}
            </div>
          </div>
          
          {/* Experience Section */}
          <div className="mb-12">
            <div className="flex items-center gap-2 mb-6">
              <FaBriefcase className="text-2xl text-blue-600" />
              <h3 className="text-2xl font-semibold text-text-primary">Experience</h3>
            </div>
            
            <div className="bg-white rounded-lg shadow-sm">
              {experience.map((exp, index) => (
                <div key={index} className="p-6 border-b border-gray-100 last:border-0">
                  <div className="flex flex-col md:flex-row md:justify-between md:items-start mb-2">
                    <h4 className="text-lg font-semibold text-blue-600">{exp.title}</h4>
                    <span className="text-sm font-medium text-gray-500 md:text-right">{exp.period}</span>
                  </div>
                  <div className="text-gray-700 mb-2">{exp.company}, {exp.location}</div>
                  <p className="text-sm text-gray-600">{exp.description}</p>
                </div>
              ))}
            </div>
          </div>
          
          {/* Certifications Section */}
          <div className="mb-12">
            <div className="flex items-center gap-2 mb-6">
              <FaAward className="text-2xl text-blue-600" />
              <h3 className="text-2xl font-semibold text-text-primary">Certifications</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {certifications.map((cert, index) => (
                <div key={index} className="bg-white p-5 rounded-lg shadow-sm border border-gray-100">
                  <h4 className="text-md font-semibold text-blue-600 mb-1">{cert.title}</h4>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">{cert.issuer}</span>
                    <span className="text-gray-500">{cert.date}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default About;