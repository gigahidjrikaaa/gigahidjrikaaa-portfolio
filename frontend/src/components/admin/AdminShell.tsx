"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";
import { cn } from "@/lib/utils";

const copy = {
  adminPanel: "Admin Panel",
  navigation: "Admin navigation",
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
};

const navItems = [
  { href: "/admin", label: copy.dashboard },
  { href: "/admin/projects", label: copy.projects },
  { href: "/admin/awards", label: copy.awards },
  { href: "/admin/certificates", label: copy.certificates },
  { href: "/admin/experience", label: copy.experience },
  { href: "/admin/education", label: copy.education },
  { href: "/admin/skills", label: copy.skills },
  { href: "/admin/services", label: copy.services },
  { href: "/admin/blog", label: copy.blog },
  { href: "/admin/messages", label: copy.messages },
  { href: "/admin/profile", label: copy.profile },
  { href: "/admin/media", label: copy.media },
  { href: "/admin/settings", label: copy.settings },
  { href: "/admin/seo", label: copy.seo },
];

const AdminShell = ({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <div className="mx-auto flex w-full max-w-7xl gap-6 px-4 py-6 sm:px-6 lg:px-8">
        <aside className="w-full max-w-[220px] rounded-xl border border-gray-200 bg-white p-4 shadow-sm" aria-label={copy.navigation}>
          <div className="mb-4 text-lg font-semibold text-gray-800">{copy.adminPanel}</div>
          <nav className="space-y-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "block rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-blue-50 text-blue-700"
                      : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                  )}
                  aria-current={isActive ? "page" : undefined}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </aside>
        <main className="flex-1 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminShell;
