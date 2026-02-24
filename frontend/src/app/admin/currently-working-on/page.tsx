"use client";

import withAdminAuth from "@/hoc/withAdminAuth";
import AdminShell from "@/components/admin/AdminShell";
import CurrentlyWorkingOnManagement from "@/components/admin/CurrentlyWorkingOnManagement";

const AdminCurrentlyWorkingOnPage = () => {
  return (
    <AdminShell>
      <CurrentlyWorkingOnManagement />
    </AdminShell>
  );
};

export default withAdminAuth(AdminCurrentlyWorkingOnPage);
