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
import Stories from '@/components/Stories';
import Clients from '@/components/Clients';
import PressMentions from '@/components/PressMentions';
import CurrentlyWorkingOn from '@/components/CurrentlyWorkingOn';
import VisitorMap from '@/components/VisitorMap';
import VisitorCounter from '@/components/VisitorCounter';

export default function Home() {
  return (
    <>
      <Hero />

      <div className="fixed top-20 right-4 z-40 bg-white/90 backdrop-blur-md rounded-full px-6 py-3 shadow-lg border border-gray-200">
        <VisitorCounter />
      </div>

      <Stories />

      <About />

      <CurrentlyWorkingOn />

      <Clients />

      <Highlights />

      <Experience />

      <Education />

      <Skills />

      <TechStackMarquee />

      <GitHubIntegration />

      <ArticlesPreview />

      <Projects />

      <Awards />

      <Certificates />

      <PressMentions />

      <VisitorMap />

      <Testimonials />

      <Services />

      <Contact />
    </>
  );
}