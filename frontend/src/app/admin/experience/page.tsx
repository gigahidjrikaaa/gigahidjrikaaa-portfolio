"use client";

import AdminShell from "@/components/admin/AdminShell";
import AdminSectionHeader from "@/components/admin/AdminSectionHeader";
import ExperienceManagement from "@/components/admin/ExperienceManagement";
import withAdminAuth from "@/hoc/withAdminAuth";

const copy = {
  title: "Experience",
  description: "Manage your professional experience entries.",
};

const ExperiencePage = () => (
  <AdminShell>
    <AdminSectionHeader title={copy.title} description={copy.description} />
    <ExperienceManagement />
  </AdminShell>
);

export default withAdminAuth(ExperiencePage);
