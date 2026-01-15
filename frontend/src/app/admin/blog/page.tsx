"use client";

import AdminShell from "@/components/admin/AdminShell";
import AdminSectionHeader from "@/components/admin/AdminSectionHeader";
import BlogManagement from "@/components/admin/BlogManagement";
import withAdminAuth from "@/hoc/withAdminAuth";

const copy = {
  title: "Blog",
  description: "Manage blog posts, drafts, and coming-soon entries.",
};

const BlogPage = () => (
  <AdminShell>
    <AdminSectionHeader title={copy.title} description={copy.description} />
    <BlogManagement />
  </AdminShell>
);

export default withAdminAuth(BlogPage);
