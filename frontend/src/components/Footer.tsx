// components/Footer.js
'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { FaGithub, FaLinkedinIn, FaTwitter, FaEnvelope } from 'react-icons/fa';

const Footer = () => {
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());

  useEffect(() => {
    setCurrentYear(new Date().getFullYear());
  }, []);

  const copy = {
    brand: '[GigaDev]',
    rights: `© ${currentYear} Giga Hidjrika. All Rights Reserved.`,
    attribution: 'Designed and built with ❤️ using Next.js, Framer Motion, and TailwindCSS',
    links: [
      { label: 'About', href: '#about' },
      { label: 'Awards', href: '#awards' },
      { label: 'Projects', href: '#projects' },
      { label: 'Testimonials', href: '#testimonials' },
      { label: 'Blog', href: '#blog' },
      { label: 'Contact', href: '#contact' },
    ],
    socials: [
      { name: 'GitHub', href: 'https://github.com/gigahidjrikaaa', icon: FaGithub },
      { name: 'LinkedIn', href: 'https://linkedin.com/in/gigahidjrikaaa', icon: FaLinkedinIn },
      { name: 'Twitter', href: 'https://twitter.com/gigahidjrikaaa', icon: FaTwitter },
      { name: 'Email', href: 'mailto:contact@gigahidjrikaaa.com', icon: FaEnvelope },
    ],
  };

  return (
    <footer className="relative bg-[#0a0a12] border-t border-cyan-400/20 overflow-hidden">
      {/* Decorative Elements */}
      <div className="absolute -top-40 left-1/2 w-96 h-96 bg-cyan-500/5 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute -bottom-20 right-1/4 w-64 h-64 bg-pink-500/5 rounded-full blur-[80px] pointer-events-none"></div>
      
      {/* Grid Pattern Overlay */}
      <div className="absolute inset-0 bg-grid-pattern opacity-10 pointer-events-none"></div>
      
      <div className="container relative z-10 mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          {/* Logo & Copyright */}
          <div className="flex flex-col items-center md:items-start">
            <motion.div 
              className="text-xl font-bold mb-3 bg-gradient-to-r from-cyan-400 to-pink-500 text-transparent bg-clip-text drop-shadow-[0_2px_8px_rgba(0,255,255,0.3)]"
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.2 }}
            >
              {copy.brand}
            </motion.div>
            <div className="text-sm text-gray-400 text-center md:text-left">
              {copy.rights}
            </div>
          </div>

          {/* Social Media Links */}
          <div className="flex space-x-4">
            {copy.socials.map((item) => (
              <motion.a
                key={item.name}
                href={item.href}
                target="_blank"
                rel="noopener noreferrer"
                className="relative p-2 text-gray-300 hover:text-cyan-400 transition-colors duration-300 group"
                whileHover={{ y: -3 }}
                transition={{ duration: 0.2 }}
              >
                <span className="absolute inset-0 rounded-full bg-white/5 border border-cyan-400/20 backdrop-blur-sm scale-0 group-hover:scale-100 transition-transform duration-300"></span>
                <item.icon className="h-5 w-5 relative z-10" aria-hidden="true" />
                <span className="sr-only">{item.name}</span>
                <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-xs text-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300">{item.name}</span>
              </motion.a>
            ))}
          </div>

          {/* Quick Links */}
          <div className="flex gap-4 text-xs flex-wrap justify-center">
            {copy.links.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-gray-400 hover:text-cyan-400 transition-colors duration-300"
              >
                {link.label}
              </a>
            ))}
          </div>
        </div>
        
        {/* Neon Border Line */}
        <div className="mt-6 h-px w-full bg-gradient-to-r from-cyan-500/0 via-cyan-500/30 to-pink-500/0"></div>
        
        {/* Attribution */}
        <div className="mt-6 text-xs text-center text-gray-600">
          {copy.attribution}
        </div>
      </div>
    </footer>
  );
};

export default Footer;