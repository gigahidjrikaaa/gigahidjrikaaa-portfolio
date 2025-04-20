import React from 'react';
import { motion } from 'framer-motion';
import ProjectCarousel from './ProjectCarousel';

// --- Placeholder Project Data ---
const myProjects = [
    {
        title: 'UGM-AICare Chatbot',
        description: 'A mental health support chatbot for university students, using Next.js, FastAPI, and Redis to provide accessible resources and conversation.',
        imageUrl: '/profile.jpg',
        techStack: ['Next.js', 'FastAPI', 'Redis', 'Python', 'AI/NLP', 'Tailwind CSS'],
        githubUrl: 'https://github.com/yourusername/ugm-aicare-frontend',
        liveUrl: undefined,
    },
    {
        title: 'Decentralized Voting System',
        description: 'Proof-of-concept blockchain application for secure and transparent voting using Solidity and Ethereum testnet.',
        imageUrl: '/placeholder-project-blockchain.jpg',
        techStack: ['Solidity', 'Hardhat', 'Ethers.js', 'React', 'Blockchain'],
        githubUrl: 'https://github.com/yourusername/blockchain-voting',
        liveUrl: undefined,
    },
    {
        title: 'AI Image Analyzer',
        description: 'A tool utilizing machine learning models (e.g., TensorFlow/PyTorch) to analyze and classify image content.',
        imageUrl: '/placeholder-project-ai.jpg',
        techStack: ['Python', 'TensorFlow', 'Flask', 'Machine Learning', 'API'],
        githubUrl: 'https://github.com/yourusername/ai-image-analyzer',
        liveUrl: undefined,
    },
    {
        title: 'Portfolio Website',
        description: 'My personal portfolio showcasing projects, skills, and experiences, built with Next.js and Tailwind CSS.',
        imageUrl: '/placeholder-project-portfolio.jpg',
        techStack: ['Next.js', 'Tailwind CSS', 'React'],
        githubUrl: 'https://github.com/gigahidjrikaaa/gigahidjrikaaa-portfolio',
        liveUrl: 'https://gigahidjrikaaa.vercel.app',
    },
    {
        title: 'E-commerce Platform',
        description: 'A full-stack e-commerce application with user authentication, product management, and payment integration.',
        imageUrl: '/placeholder-project-ecommerce.jpg',
        techStack: ['React', 'Node.js', 'Express', 'MongoDB', 'Stripe'],
        githubUrl: 'https://github.com/gigahidjrikaaa',
        liveUrl: undefined,
    },
];
// --- End Placeholder Data ---

const Projects = () => {
  return (
    <section id="projects" className="relative py-16 sm:py-24 bg-background overflow-hidden">
      {/* Background Image & Neon Overlays */}
      <div className="absolute inset-0 z-0">
        {/* Neon gradient overlays */}
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/30 via-transparent to-pink-600/20 pointer-events-none" />
        <div className="absolute top-0 left-0 w-1/2 h-1/2 bg-cyan-400/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-1/3 h-1/3 bg-pink-500/20 rounded-full blur-2xl" />
      </div>

      {/* Animated Neon Grid */}
      <motion.svg
        className="absolute inset-0 w-full h-full z-10 pointer-events-none"
        viewBox="0 0 1440 800"
        preserveAspectRatio="none"
        aria-hidden="true"
        initial={{ opacity: 0.7 }}
        animate={{ opacity: [0.7, 1, 0.7], y: [0, 10, 0] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      >
        {[...Array(18)].map((_, i) => (
          <motion.line
            key={`v-${i}`}
            x1={80 * i}
            y1="0"
            x2={80 * i}
            y2="800"
            stroke={i % 2 === 0 ? "#00fff7" : "#ff00cc"}
            strokeWidth="1"
            strokeOpacity="0.13"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ delay: i * 0.05, duration: 1.2, repeat: Infinity, repeatType: "reverse" }}
          />
        ))}
        {[...Array(11)].map((_, i) => (
          <motion.line
            key={`h-${i}`}
            x1="0"
            y1={80 * i}
            x2="1440"
            y2={80 * i}
            stroke={i % 2 === 0 ? "#00fff7" : "#ff00cc"}
            strokeWidth="1"
            strokeOpacity="0.13"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ delay: i * 0.07, duration: 1.2, repeat: Infinity, repeatType: "reverse" }}
          />
        ))}
      </motion.svg>

      <div className="relative z-20 container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl mb-4 font-heading drop-shadow-[0_2px_16px_rgba(0,255,255,0.15)]">
            My Projects
          </h2>
          <p className="text-lg text-gray-300 max-w-2xl mx-auto">
            Here are some of the projects I&apos;ve worked on, showcasing my skills in web development, AI, and blockchain.
          </p>
        </div>

        <ProjectCarousel projects={myProjects} />

      </div>
    </section>
  );
};

export default Projects;