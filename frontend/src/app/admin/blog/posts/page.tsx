"use client";

import AdminShell from "@/components/admin/AdminShell";
import AdminSectionHeader from "@/components/admin/AdminSectionHeader";
import withAdminAuth from "@/hoc/withAdminAuth";
import BlogSectionNav from "@/components/admin/blog/BlogSectionNav";
import BlogPostsManagement from "@/components/admin/blog/BlogPostsManagement";

const copy = {
  title: "Blog Posts",
  description: "Draft, edit, and publish posts with structured workflows.",
};

const BlogPostsPage = () => (
  <AdminShell>
    <AdminSectionHeader title={copy.title} description={copy.description} />
    <BlogSectionNav />
    <BlogPostsManagement />
  </AdminShell>
);

export default withAdminAuth(BlogPostsPage);
