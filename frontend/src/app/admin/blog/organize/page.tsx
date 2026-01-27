"use client";

import AdminShell from "@/components/admin/AdminShell";
import AdminSectionHeader from "@/components/admin/AdminSectionHeader";
import withAdminAuth from "@/hoc/withAdminAuth";
import BlogSectionNav from "@/components/admin/blog/BlogSectionNav";
import BlogOrganizationManager from "@/components/admin/blog/BlogOrganizationManager";

const copy = {
  title: "Blog Organization",
  description: "Maintain categories and tags to keep posts easy to discover.",
};

const BlogOrganizationPage = () => (
  <AdminShell>
    <AdminSectionHeader title={copy.title} description={copy.description} />
    <BlogSectionNav />
    <BlogOrganizationManager />
  </AdminShell>
);

export default withAdminAuth(BlogOrganizationPage);
