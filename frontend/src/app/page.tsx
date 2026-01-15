"use client";
// src/app/page.js
import Hero from '@/components/Hero';
import About from '@/components/About';
import Highlights from '@/components/Highlights';
import AwardsCertificates from '@/components/AwardsCertificates';
import Projects from '@/components/Projects';
import Skills from '@/components/Skills';
import Experience from '@/components/Experience';
import Education from '@/components/Education';
import Services from '@/components/Services';
import Testimonials from '@/components/Testimonials';
import BlogComingSoon from '@/components/BlogComingSoon';
import Contact from '@/components/Contact';

export default function Home() {
  return (
    <>
      {/* Using fragments <>...</> to return multiple sections */}
      <Hero />
      <About />
      <Highlights />
      <AwardsCertificates />
      <Projects />
      <Skills />
      <Experience />
      <Education />
      <Services />
      <Testimonials />
      <BlogComingSoon />
      <Contact />
    </>
  );
}