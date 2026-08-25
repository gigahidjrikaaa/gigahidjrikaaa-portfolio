// components/Footer.js
'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Github, Linkedin, Twitter, Mail } from 'lucide-react';

const Footer = () => {
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());

  useEffect(() => {
    setCurrentYear(new Date().getFullYear());
  }, []);

  const copy = {
    brand: '[GigaDev]',
    rights: `© ${currentYear} Giga Hidjrika. All Rights Reserved.`,
    attribution: 'Designed and built with Next.js, Framer Motion, and TailwindCSS',
    links: [
      { label: 'About', href: '/#about' },
      { label: 'Projects', href: '/#projects' },
      { label: 'Testimonials', href: '/#testimonials' },
      { label: 'Blog', href: '/blog' },
      { label: 'Know more', href: '/more' },
      { label: 'Contact', href: '/#contact' },
    ],
    socials: [
      { name: 'GitHub', href: 'https://github.com/gigahidjrikaaa', icon: Github },
      { name: 'LinkedIn', href: 'https://linkedin.com/in/gigahidjrikaaa', icon: Linkedin },
      { name: 'Twitter', href: 'https://twitter.com/gigahidjrikaaa', icon: Twitter },
      { name: 'Email', href: 'mailto:contact@gigahidjrikaaa.com', icon: Mail },
    ],
  };

  return (
    <footer className="relative border-t border-zinc-200 bg-white">
      <div className="container relative z-10 mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          {/* Logo & Copyright */}
          <div className="flex flex-col items-center md:items-start">
            <motion.div
              className="text-xl font-semibold mb-3 text-gray-900"
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.2 }}
            >
              {copy.brand}
            </motion.div>
            <div className="text-sm text-gray-500 text-center md:text-left">
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
                className="relative p-2 text-gray-500 hover:text-gray-900 transition-colors duration-300 group"
                whileHover={{ y: -3 }}
                transition={{ duration: 0.2 }}
              >
                <span className="absolute inset-0 rounded-full bg-gray-100 border border-gray-200 scale-0 group-hover:scale-100 transition-transform duration-300"></span>
                <item.icon className="h-5 w-5 relative z-10" aria-hidden="true" />
                <span className="sr-only">{item.name}</span>
                <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-xs text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300">{item.name}</span>
              </motion.a>
            ))}
          </div>

          {/* Quick Links */}
          <div className="flex gap-4 text-xs flex-wrap justify-center">
            {copy.links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-gray-500 hover:text-gray-900 transition-colors duration-300"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>

        <div className="mt-6 h-px w-full bg-gray-200"></div>

        <div className="mt-6 text-xs text-center text-gray-500">
          {copy.attribution}
        </div>
      </div>
    </footer>
  );
};

export default Footer;