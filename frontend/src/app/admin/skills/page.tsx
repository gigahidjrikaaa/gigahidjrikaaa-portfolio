"use client";

import AdminShell from "@/components/admin/AdminShell";
import AdminSectionHeader from "@/components/admin/AdminSectionHeader";
import SkillManagement from "@/components/admin/SkillManagement";
import withAdminAuth from "@/hoc/withAdminAuth";

const copy = {
  title: "Skills",
  description: "Organize your skills, categories, and proficiency levels.",
};

const SkillsPage = () => (
  <AdminShell>
    <AdminSectionHeader title={copy.title} description={copy.description} />
    <SkillManagement />
  </AdminShell>
);

export default withAdminAuth(SkillsPage);
