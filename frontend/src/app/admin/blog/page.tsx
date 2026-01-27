"use client";

import AdminShell from "@/components/admin/AdminShell";
import AdminSectionHeader from "@/components/admin/AdminSectionHeader";
import withAdminAuth from "@/hoc/withAdminAuth";
import BlogSectionNav from "@/components/admin/blog/BlogSectionNav";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const copy = {
  title: "Blog Studio",
  description: "Create, organize, and publish articles with a dedicated workflow.",
  postsTitle: "Posts",
  postsDescription: "Write, edit, and publish blog posts with rich content tools.",
  organizeTitle: "Organization",
  organizeDescription: "Manage categories and tags across your blog library.",
  openPosts: "Manage posts",
  openOrganize: "Organize content",
};

const BlogPage = () => (
  <AdminShell>
    <AdminSectionHeader title={copy.title} description={copy.description} />
    <BlogSectionNav />
    <div className="grid gap-6 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>{copy.postsTitle}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-slate-500">{copy.postsDescription}</p>
          <Link
            href="/admin/blog/posts"
            className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-slate-900 hover:underline"
          >
            {copy.openPosts} →
          </Link>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>{copy.organizeTitle}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-slate-500">{copy.organizeDescription}</p>
          <Link
            href="/admin/blog/organize"
            className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-slate-900 hover:underline"
          >
            {copy.openOrganize} →
          </Link>
        </CardContent>
      </Card>
    </div>
  </AdminShell>
);

export default withAdminAuth(BlogPage);
