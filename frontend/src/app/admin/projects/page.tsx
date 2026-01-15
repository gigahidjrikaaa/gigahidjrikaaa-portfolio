"use client";

import AdminShell from "@/components/admin/AdminShell";
import AdminSectionHeader from "@/components/admin/AdminSectionHeader";
import ProjectManagement from "@/components/admin/ProjectManagement";
import withAdminAuth from "@/hoc/withAdminAuth";

const copy = {
  title: "Projects",
  description: "Create, update, and organize your portfolio projects.",
};

const ProjectsPage = () => (
  <AdminShell>
    <AdminSectionHeader title={copy.title} description={copy.description} />
    <ProjectManagement />
  </AdminShell>
);

export default withAdminAuth(ProjectsPage);
