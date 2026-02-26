// src/components/About.tsx
'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  FaBrain,
  FaCode,
  FaCubes,
  FaPalette,
  FaChartLine,
  FaUsers,
} from 'react-icons/fa';
import { apiService, ProfileResponse } from '@/services/api';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.2 },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
  },
};

const amenities = [
  { title: 'AI Strategy', icon: FaBrain },
  { title: 'Full-Stack Dev', icon: FaCode },
  { title: 'Web3 Architecture', icon: FaCubes },
  { title: 'Design Systems', icon: FaPalette },
  { title: 'Analytics', icon: FaChartLine },
  { title: 'Collaboration', icon: FaUsers },
];

const copy = {
  title: 'About Me',
  intro:
    'A software engineer working across AI, blockchain, and modern web development — building products from concept to production.',
  body: 'My work covers the full product lifecycle — from user interfaces and backend systems to AI integrations. I focus on writing clean code and shipping things that actually hold up.',
  videoCaption: 'MY WORKSPACE',
  videoCaptionBody: 'Where ideas become reality',
  videoSrc: '/about-me-video.mp4', // Replace with your video URL or path
  videoPoster: '/hero-bg.jpg', // Fallback poster image
};

const About = () => {
  const [profile, setProfile] = useState<ProfileResponse | null>(null);
  const [, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const profileData = await apiService.getProfile();
        setProfile(profileData);
      } catch (err) {
        console.error('Failed to fetch profile data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const intro = profile?.headline || copy.intro;
  const body = profile?.bio || copy.body;

  return (
    <section id="about" className="relative overflow-hidden bg-white py-24 md:py-32">
      <div className="container relative z-10 mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={containerVariants}
          className="grid items-center gap-12 lg:grid-cols-[1fr_1fr]"
        >
          {/* Left: Text content */}
          <div className="space-y-6">
            <motion.h2
              variants={itemVariants}
              className="text-3xl font-semibold leading-tight text-gray-900 sm:text-4xl lg:text-5xl"
            >
              {copy.title}
            </motion.h2>

            <motion.p variants={itemVariants} className="text-gray-500 leading-relaxed">
              {intro}
            </motion.p>

            <motion.p variants={itemVariants} className="text-gray-500 leading-relaxed">
              {body}
            </motion.p>

            {/* Amenities grid */}
            <motion.div variants={itemVariants} className="grid grid-cols-2 gap-x-8 gap-y-4 pt-4">
              {amenities.map((item) => (
                <div key={item.title} className="flex items-center gap-3 text-gray-700">
                  <item.icon className="h-5 w-5 text-gray-400" />
                  <span className="text-sm">{item.title}</span>
                </div>
              ))}
            </motion.div>
          </div>

          {/* Right: Video with caption overlay */}
          <motion.div variants={itemVariants} className="relative">
            <div className="relative overflow-hidden rounded-[32px]">
              <div className="relative aspect-[4/5] w-full">
                <video
                  className="h-full w-full object-cover"
                  poster={copy.videoPoster}
                  controls
                  preload="metadata"
                >
                  <source src={copy.videoSrc} type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
              </div>
              {/* Caption card */}
              <div className="absolute bottom-6 left-6 right-6 rounded-2xl bg-white/90 p-4 backdrop-blur-sm">
                <div className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-500">
                  {copy.videoCaption}
                </div>
                <div className="mt-1 text-sm font-medium text-gray-900">
                  {copy.videoCaptionBody}
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default About;