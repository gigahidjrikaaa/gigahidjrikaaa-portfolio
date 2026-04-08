"use client";

import AdminShell from "@/components/admin/AdminShell";
import AdminSectionHeader from "@/components/admin/AdminSectionHeader";
import SettingsManagement from "@/components/admin/SettingsManagement";
import withAdminAuth from "@/hoc/withAdminAuth";

const copy = {
  title: "Settings",
  description:
    "Review secure integration settings and run non-sensitive health checks for admin tooling.",
};

const SettingsPage = () => (
  <AdminShell>
    <AdminSectionHeader title={copy.title} description={copy.description} />
    <SettingsManagement />
  </AdminShell>
);

export default withAdminAuth(SettingsPage);
