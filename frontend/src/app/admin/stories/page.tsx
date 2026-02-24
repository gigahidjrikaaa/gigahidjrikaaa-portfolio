"use client";

import withAdminAuth from "@/hoc/withAdminAuth";
import AdminShell from "@/components/admin/AdminShell";
import StoriesManagement from "@/components/admin/StoriesManagement";

const AdminStoriesPage = () => {
  return (
    <AdminShell>
      <StoriesManagement />
    </AdminShell>
  );
};

export default withAdminAuth(AdminStoriesPage);
