"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";
import { cn } from "@/lib/utils";

const copy = {
  adminPanel: "Admin",
  adminSubtitle: "Portfolio Control Center",
  navigation: "Admin navigation",
  backToSite: "Back to site",
  dashboard: "Dashboard",
  projects: "Projects",
  awards: "Awards",
  certificates: "Certificates",
  experience: "Experience",
  education: "Education",
  skills: "Skills",
  services: "Services",
  blog: "Blog",
  messages: "Messages",
  profile: "Profile",
  media: "Media",
  settings: "Settings",
  seo: "SEO",
  overviewSection: "Overview",
  contentSection: "Content",
  settingsSection: "Settings",
  stories: "Stories & BTS",
  clients: "Client Logos",
  pressMentions: "Press & Media",
  testimonials: "Testimonials",
};

const navSections = [
  {
    title: copy.overviewSection,
    items: [{ href: "/admin", label: copy.dashboard }],
  },
  {
    title: copy.contentSection,
    items: [
      { href: "/admin/projects", label: copy.projects },
      { href: "/admin/awards", label: copy.awards },
      { href: "/admin/certificates", label: copy.certificates },
      { href: "/admin/experience", label: copy.experience },
      { href: "/admin/education", label: copy.education },
      { href: "/admin/skills", label: copy.skills },
      { href: "/admin/services", label: copy.services },
      { href: "/admin/blog", label: copy.blog },
      { href: "/admin/stories", label: copy.stories },
      { href: "/admin/clients", label: copy.clients },
      { href: "/admin/press-mentions", label: copy.pressMentions },
      { href: "/admin/testimonials", label: copy.testimonials },
      { href: "/admin/messages", label: copy.messages },
    ],
  },
  {
    title: copy.settingsSection,
    items: [
      { href: "/admin/profile", label: copy.profile },
      { href: "/admin/media", label: copy.media },
      { href: "/admin/settings", label: copy.settings },
      { href: "/admin/seo", label: copy.seo },
    ],
  },
];

const AdminShell = ({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-slate-50 text-gray-900">
      <header className="border-b border-slate-200 bg-white/80 backdrop-blur">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-xs font-semibold text-white">
              GH
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-900">{copy.adminPanel}</p>
              <p className="text-xs text-slate-500">{copy.adminSubtitle}</p>
            </div>
          </div>
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-600 transition hover:border-slate-300 hover:text-slate-900"
          >
            {copy.backToSite}
          </Link>
        </div>
      </header>

      <div className="mx-auto flex w-full max-w-7xl flex-1 gap-6 px-4 py-6 sm:px-6 lg:px-8">
        <aside className="w-full max-w-[240px] rounded-2xl border border-slate-200 bg-white p-4 shadow-sm" aria-label={copy.navigation}>
          <nav className="space-y-6">
            {navSections.map((section) => (
              <div key={section.title} className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                  {section.title}
                </p>
                <div className="space-y-1">
                  {section.items.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={cn(
                          "block rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                          isActive
                            ? "bg-slate-900 text-white shadow-sm"
                            : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                        )}
                        aria-current={isActive ? "page" : undefined}
                      >
                        {item.label}
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>
        </aside>
        <main className="flex-1 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminShell;
