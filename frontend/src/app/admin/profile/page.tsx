"use client";

import AdminShell from "@/components/admin/AdminShell";
import AdminSectionHeader from "@/components/admin/AdminSectionHeader";
import ProfileManagement from "@/components/admin/ProfileManagement";
import withAdminAuth from "@/hoc/withAdminAuth";

const copy = {
  title: "Profile",
  description: "Manage the public profile details used across the landing page.",
};

const ProfilePage = () => (
  <AdminShell>
    <AdminSectionHeader title={copy.title} description={copy.description} />
    <ProfileManagement />
  </AdminShell>
);

export default withAdminAuth(ProfilePage);
