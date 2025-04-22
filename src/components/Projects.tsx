import React from 'react';
import { motion } from 'framer-motion';
import ProjectCarousel from './ProjectCarousel';

// --- Placeholder Project Data ---
const myProjects = [
    {
      title: 'UGM-AICare Chatbot',
      tagline: 'AI-powered mental health support for students',
      description: 'A mental health support chatbot for university students, providing accessible resources and empathetic conversation using advanced AI and NLP.',
      features: [
        'Conversational AI with NLP',
        'Resource recommendation',
        'Anonymous chat',
        '24/7 availability',
        'Admin dashboard for analytics'
      ],
      techStack: ['Next.js', 'FastAPI', 'Redis', 'Python', 'AI/NLP', 'Tailwind CSS'],
      githubUrl: 'https://github.com/yourusername/ugm-aicare-frontend',
      liveUrl: undefined,
      caseStudyUrl: 'https://yourblog.com/ugm-aicare-case-study',
      role: 'Full Stack Developer',
      teamSize: 3,
      challenges: 'Ensuring privacy and real-time performance for sensitive conversations.',
      solutions: 'Implemented Redis for fast session management and strict data anonymization.',
      impact: 'Adopted by 500+ students in the first semester.',
      // imageUrl: '/project-aicare.jpg',
    },
    {
      title: 'Decentralized Voting System',
      tagline: 'Secure, transparent blockchain voting',
      description: 'A proof-of-concept blockchain application for secure and transparent voting using Solidity and Ethereum testnet.',
      features: [
        'Immutable vote records',
        'Voter authentication',
        'Live result tally',
        'Smart contract auditing'
      ],
      techStack: ['Solidity', 'Hardhat', 'Ethers.js', 'React', 'Blockchain'],
      githubUrl: 'https://github.com/yourusername/blockchain-voting',
      liveUrl: undefined,
      caseStudyUrl: undefined,
      role: 'Blockchain Engineer',
      teamSize: 2,
      challenges: 'Preventing double voting and ensuring contract security.',
      solutions: 'Used cryptographic signatures and thorough smart contract testing.',
      impact: 'Demoed at a university hackathon, praised for transparency.',
      // imageUrl: '/project-voting.jpg',
    },
    {
      title: 'AI Image Analyzer',
      tagline: 'Automated image classification with ML',
      description: 'A tool utilizing machine learning models to analyze and classify image content for various business use cases.',
      features: [
        'Batch image upload',
        'Real-time classification',
        'Custom model training',
        'REST API integration'
      ],
      techStack: ['Python', 'TensorFlow', 'Flask', 'Machine Learning', 'API'],
      githubUrl: 'https://github.com/yourusername/ai-image-analyzer',
      liveUrl: undefined,
      caseStudyUrl: 'https://yourblog.com/ai-image-analyzer',
      role: 'Machine Learning Engineer',
      teamSize: 1,
      challenges: 'Handling large image datasets efficiently.',
      solutions: 'Optimized preprocessing and used GPU acceleration.',
      impact: 'Reduced manual image sorting time by 80%.',
      // imageUrl: '/project-ai-image.jpg',
    },
    {
      title: 'Portfolio Website',
      tagline: 'Showcasing my work and skills',
      description: 'My personal portfolio showcasing projects, skills, and experiences, built with Next.js and Tailwind CSS.',
      features: [
        'Responsive design',
        'Animated hero section',
        'Project carousel',
        'Contact form with email integration'
      ],
      techStack: ['Next.js', 'Tailwind CSS', 'React'],
      githubUrl: 'https://github.com/gigahidjrikaaa/gigahidjrikaaa-portfolio',
      liveUrl: 'https://gigahidjrikaaa.vercel.app',
      caseStudyUrl: undefined,
      role: 'Designer & Developer',
      teamSize: 1,
      challenges: 'Creating a unique, interactive UI with fast load times.',
      solutions: 'Used static generation and optimized images.',
      impact: 'Received positive feedback from recruiters and peers.',
      // imageUrl: '/project-portfolio.jpg',
    },
    {
      title: 'E-commerce Platform',
      tagline: 'Full-stack online store with payments',
      description: 'A full-stack e-commerce application with user authentication, product management, and Stripe payment integration.',
      features: [
        'User authentication',
        'Product catalog & search',
        'Shopping cart',
        'Stripe payments',
        'Admin dashboard'
      ],
      techStack: ['React', 'Node.js', 'Express', 'MongoDB', 'Stripe'],
      githubUrl: 'https://github.com/gigahidjrikaaa',
      liveUrl: undefined,
      caseStudyUrl: undefined,
      role: 'Lead Developer',
      teamSize: 4,
      challenges: 'Integrating secure payments and managing inventory in real-time.',
      solutions: 'Used Stripe for PCI compliance and MongoDB change streams.',
      impact: 'Handled 1000+ orders in the first month.',
      // imageUrl: '/project-ecommerce.jpg',
    },
    {
      title: 'Event Management App',
      tagline: 'Organize and track events easily',
      description: 'A web app for creating, managing, and tracking events with real-time updates and notifications.',
      features: [
        'Event creation & RSVP',
        'Calendar integration',
        'Push notifications',
        'Admin analytics'
      ],
      techStack: ['Vue.js', 'Firebase', 'Tailwind CSS', 'PWA'],
      githubUrl: 'https://github.com/yourusername/event-management-app',
      liveUrl: 'https://events.example.com',
      caseStudyUrl: 'https://yourblog.com/event-management-app',
      role: 'Frontend Developer',
      teamSize: 2,
      challenges: 'Ensuring real-time updates and offline support.',
      solutions: 'Leveraged Firebase real-time database and PWA features.',
      impact: 'Used for 20+ community events with 1000+ attendees.',
      // imageUrl: '/project-event.jpg',
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