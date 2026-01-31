"use client";
// src/app/page.tsx
import Hero from '@/components/Hero';
import About from '@/components/About';
import Highlights from '@/components/Highlights';
import Experience from '@/components/Experience';
import Education from '@/components/Education';
import Skills from '@/components/Skills';
import GitHubIntegration from '@/components/GitHubIntegration';
import TechStackMarquee from '@/components/TechStackMarquee';
import ArticlesPreview from '@/components/ArticlesPreview';
import Projects from '@/components/Projects';
import Awards from '@/components/Awards';
import Certificates from '@/components/Certificates';
import Services from '@/components/Services';
import Testimonials from '@/components/Testimonials';
import Contact from '@/components/Contact';

export default function Home() {
  return (
    <>
      {/* Hero - Full-screen intro */}
      <Hero />

      {/* About - Overview with capabilities */}
      <About />

      {/* Highlights - Location & collaboration stats */}
      <Highlights />

      {/* Experience - Work history timeline */}
      <Experience />

      {/* Education - Academic background */}
      <Education />

      {/* Skills - Technical expertise */}
      <Skills />

      {/* Tech Stack Marquee - Technologies I work with */}
      <TechStackMarquee />

      {/* GitHub Integration - Open source activity */}
      <GitHubIntegration />

      {/* Articles - Blog previews */}
      <ArticlesPreview />

      {/* Projects - Portfolio showcase */}
      <Projects />

      {/* Awards - Recognition (dark section) */}
      <Awards />

      {/* Certificates - Credentials */}
      <Certificates />

      {/* Testimonials - Social proof */}
      <Testimonials />

      {/* Services - Why work with me */}
      <Services />

      {/* Contact - Get in touch */}
      <Contact />
    </>
  );
}