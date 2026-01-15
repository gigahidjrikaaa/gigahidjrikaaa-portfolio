"use client";

import AdminShell from "@/components/admin/AdminShell";
import AdminSectionHeader from "@/components/admin/AdminSectionHeader";
import MediaManagement from "@/components/admin/MediaManagement";
import withAdminAuth from "@/hoc/withAdminAuth";

const copy = {
  title: "Media",
  description: "Upload and organize images used across your portfolio.",
};

const MediaPage = () => (
  <AdminShell>
    <AdminSectionHeader title={copy.title} description={copy.description} />
    <MediaManagement />
  </AdminShell>
);

export default withAdminAuth(MediaPage);
