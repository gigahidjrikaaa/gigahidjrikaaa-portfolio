"use client";

import AdminShell from "@/components/admin/AdminShell";
import AdminSectionHeader from "@/components/admin/AdminSectionHeader";
import EducationManagement from "@/components/admin/EducationManagement";
import withAdminAuth from "@/hoc/withAdminAuth";

const copy = {
  title: "Education",
  description: "Manage education records shown on your portfolio.",
};

const EducationPage = () => (
  <AdminShell>
    <AdminSectionHeader title={copy.title} description={copy.description} />
    <EducationManagement />
  </AdminShell>
);

export default withAdminAuth(EducationPage);
