"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ChartBarIcon,
  ClipboardDocumentListIcon,
  EnvelopeIcon,
  SparklesIcon,
  StarIcon,
  WrenchScrewdriverIcon,
} from "@heroicons/react/24/outline";
import { adminApi, DashboardStats } from "@/services/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const copy = {
  title: "Dashboard",
  subtitle: "Track content performance and manage updates faster.",
  loading: "Loading dashboard stats…",
  error: "Unable to load dashboard stats. Please try again.",
  totalProjects: "Total Projects",
  featuredProjects: "Featured Projects",
  totalSkills: "Total Skills",
  totalExperience: "Total Experience",
  totalEducation: "Total Education",
  unreadMessages: "Unread Messages",
  totalMessages: "Total Messages",
  quickActions: "Quick Actions",
  manageContent: "Manage content",
  viewMessages: "View messages",
  updateProfile: "Update profile",
  systemInsights: "System Insights",
  featuredRatio: "Featured ratio",
  contentHealth: "Content health",
  manageProjects: "Projects",
  manageExperience: "Experience",
  manageEducation: "Education",
  manageSkills: "Skills",
  manageAwards: "Awards",
  manageCertificates: "Certificates",
  manageServices: "Services",
  manageBlog: "Blog",
};

const StatCard = ({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: number;
  icon: React.ElementType;
}) => (
  <Card className="border-slate-200 shadow-sm">
    <CardHeader className="flex flex-row items-center justify-between pb-2">
      <CardTitle className="text-sm font-medium text-slate-500">{label}</CardTitle>
      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-600">
        <Icon className="h-4 w-4" />
      </div>
    </CardHeader>
    <CardContent>
      <p className="text-2xl font-semibold text-slate-900">{value}</p>
    </CardContent>
  </Card>
);

const AdminOverview = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const data = await adminApi.getDashboardStats();
        setStats(data);
      } catch {
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, []);

  if (loading) {
    return <p className="text-sm text-slate-500">{copy.loading}</p>;
  }

  if (error || !stats) {
    return <p className="text-sm text-red-600">{copy.error}</p>;
  }

  const featuredRatio = stats.total_projects
    ? Math.round((stats.featured_projects / stats.total_projects) * 100)
    : 0;

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-2">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">{copy.title}</p>
        <h1 className="text-2xl font-semibold text-slate-900">{copy.title}</h1>
        <p className="text-sm text-slate-500">{copy.subtitle}</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <StatCard label={copy.totalProjects} value={stats.total_projects} icon={ClipboardDocumentListIcon} />
        <StatCard label={copy.featuredProjects} value={stats.featured_projects} icon={StarIcon} />
        <StatCard label={copy.totalSkills} value={stats.total_skills} icon={SparklesIcon} />
        <StatCard label={copy.totalExperience} value={stats.total_experience} icon={ChartBarIcon} />
        <StatCard label={copy.totalEducation} value={stats.total_education} icon={WrenchScrewdriverIcon} />
        <StatCard label={copy.unreadMessages} value={stats.unread_messages} icon={EnvelopeIcon} />
        <StatCard label={copy.totalMessages} value={stats.total_messages} icon={EnvelopeIcon} />
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.3fr_1fr]">
        <Card className="border-slate-200">
          <CardHeader>
            <CardTitle className="text-base text-slate-900">{copy.quickActions}</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-2">
            <Link
              href="/admin/projects"
              className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-white"
            >
              {copy.manageProjects}
              <span className="text-xs text-slate-400">{copy.manageContent}</span>
            </Link>
            <Link
              href="/admin/messages"
              className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-white"
            >
              {copy.viewMessages}
              <span className="text-xs text-slate-400">{stats.unread_messages} unread</span>
            </Link>
            <Link
              href="/admin/profile"
              className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-white"
            >
              {copy.updateProfile}
              <span className="text-xs text-slate-400">{copy.profile}</span>
            </Link>
            <Link
              href="/admin/services"
              className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-white"
            >
              {copy.manageServices}
              <span className="text-xs text-slate-400">{copy.manageContent}</span>
            </Link>
          </CardContent>
        </Card>

        <Card className="border-slate-200">
          <CardHeader>
            <CardTitle className="text-base text-slate-900">{copy.systemInsights}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-xl border border-slate-200 bg-white px-4 py-3">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                {copy.featuredRatio}
              </p>
              <p className="mt-2 text-2xl font-semibold text-slate-900">{featuredRatio}%</p>
              <p className="text-xs text-slate-500">
                {stats.featured_projects} of {stats.total_projects} projects are featured.
              </p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                {copy.contentHealth}
              </p>
              <p className="mt-2 text-sm text-slate-600">
                Keep content fresh by reviewing services, awards, and certificates monthly.
              </p>
              <div className="mt-3 flex flex-wrap gap-2 text-xs font-semibold text-slate-600">
                <Link href="/admin/experience" className="rounded-full border border-slate-200 bg-white px-3 py-1">
                  {copy.manageExperience}
                </Link>
                <Link href="/admin/education" className="rounded-full border border-slate-200 bg-white px-3 py-1">
                  {copy.manageEducation}
                </Link>
                <Link href="/admin/awards" className="rounded-full border border-slate-200 bg-white px-3 py-1">
                  {copy.manageAwards}
                </Link>
                <Link href="/admin/certificates" className="rounded-full border border-slate-200 bg-white px-3 py-1">
                  {copy.manageCertificates}
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminOverview;
