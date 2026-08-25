// src/app/page.tsx
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import Hero from '@/components/Hero';
import About from '@/components/About';
import Highlights from '@/components/Highlights';
import Experience from '@/components/Experience';
import Education from '@/components/Education';
import Skills from '@/components/Skills';
import ArticlesPreview from '@/components/ArticlesPreview';
import Projects from '@/components/Projects';
import Testimonials from '@/components/Testimonials';
import Contact from '@/components/Contact';
import {
  getProfileISR,
  getProjectsISR,
  type ServerProfile,
  type ServerProject,
} from '@/lib/server-data';

// Route segment config must be a literal (not an imported identifier).
// Keep in sync with HOME_REVALIDATE_SECONDS in lib/server-data.ts.
export const revalidate = 300;

function KnowMoreBand() {
  return (
    <section aria-label="More about Giga" className="border-y border-zinc-200 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <Link
          href="/more"
          className="group flex flex-wrap items-center justify-between gap-4 py-8 md:py-10"
        >
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-zinc-400">
              Know more
            </p>
            <p className="mt-1.5 text-lg font-medium tracking-tight text-zinc-900 md:text-xl">
              Stories, press features, clients, GitHub activity, awards &amp; credentials.
            </p>
          </div>
          <span className="inline-flex items-center gap-2 rounded-full border border-zinc-200 px-5 py-2.5 text-sm font-medium text-zinc-700 transition-colors group-hover:border-zinc-400 group-hover:text-zinc-900">
            Explore the extras
            <ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden />
          </span>
        </Link>
      </div>
    </section>
  );
}

export default async function Home() {
  // Fetched on the server (ISR): content ships in the initial HTML and
  // revalidates every HOME_REVALIDATE_SECONDS. Null on API failure —
  // components below fall back to their built-in defaults/client fetch.
  const [profile, projects] = await Promise.all([
    getProfileISR() as Promise<ServerProfile | null>,
    getProjectsISR() as Promise<ServerProject[] | null>,
  ]);

  return (
    <>
      <Hero initialProfile={profile} />

      <Projects initialProjects={projects} />

      <Highlights />

      <About />

      <Experience />

      <Education />

      <Skills />

      <Testimonials />

      <ArticlesPreview />

      <KnowMoreBand />

      <Contact />
    </>
  );
}
