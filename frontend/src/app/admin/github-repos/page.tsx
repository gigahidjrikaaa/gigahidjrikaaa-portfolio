"use client";

import withAdminAuth from "@/hoc/withAdminAuth";
import AdminShell from "@/components/admin/AdminShell";
import GitHubReposManagement from "@/components/admin/GitHubReposManagement";

const AdminGitHubReposPage = () => {
  return (
    <AdminShell>
      <GitHubReposManagement />
    </AdminShell>
  );
};

export default withAdminAuth(AdminGitHubReposPage);
