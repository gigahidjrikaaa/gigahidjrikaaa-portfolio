"use client";

import { useEffect, useState } from "react";
import { adminApi, DashboardStats } from "@/services/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const copy = {
  title: "Dashboard",
  subtitle: "Overview of your portfolio content",
  loading: "Loading dashboard stats…",
  error: "Unable to load dashboard stats. Please try again.",
  totalProjects: "Total Projects",
  featuredProjects: "Featured Projects",
  totalSkills: "Total Skills",
  totalExperience: "Total Experience",
  totalEducation: "Total Education",
  unreadMessages: "Unread Messages",
  totalMessages: "Total Messages",
};

const StatCard = ({ label, value }: { label: string; value: number }) => (
  <Card className="border-gray-200">
    <CardHeader className="pb-2">
      <CardTitle className="text-sm font-medium text-gray-500">{label}</CardTitle>
    </CardHeader>
    <CardContent>
      <p className="text-2xl font-semibold text-gray-900">{value}</p>
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
    return <p className="text-sm text-gray-500">{copy.loading}</p>;
  }

  if (error || !stats) {
    return <p className="text-sm text-red-600">{copy.error}</p>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">{copy.title}</h1>
        <p className="text-sm text-gray-500">{copy.subtitle}</p>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <StatCard label={copy.totalProjects} value={stats.total_projects} />
        <StatCard label={copy.featuredProjects} value={stats.featured_projects} />
        <StatCard label={copy.totalSkills} value={stats.total_skills} />
        <StatCard label={copy.totalExperience} value={stats.total_experience} />
        <StatCard label={copy.totalEducation} value={stats.total_education} />
        <StatCard label={copy.unreadMessages} value={stats.unread_messages} />
        <StatCard label={copy.totalMessages} value={stats.total_messages} />
      </div>
    </div>
  );
};

export default AdminOverview;
