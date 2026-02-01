"use client";

import AdminShell from "@/components/admin/AdminShell";
import AdminSectionHeader from "@/components/admin/AdminSectionHeader";
import SeoManagement from "@/components/admin/SeoManagement";
import withAdminAuth from "@/hoc/withAdminAuth";

const copy = {
  title: "SEO",
  description: "Manage your site's SEO settings for better search engine visibility.",
};

const SeoPage = () => (
  <AdminShell>
    <AdminSectionHeader title={copy.title} description={copy.description} />
    <SeoManagement />
  </AdminShell>
  );

export default withAdminAuth(SeoPage);

