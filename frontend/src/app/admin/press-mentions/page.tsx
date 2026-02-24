"use client";

import withAdminAuth from "@/hoc/withAdminAuth";
import AdminShell from "@/components/admin/AdminShell";
import PressMentionsManagement from "@/components/admin/PressMentionsManagement";

const AdminPressMentionsPage = () => {
  return (
    <AdminShell>
      <PressMentionsManagement />
    </AdminShell>
  );
};

export default withAdminAuth(AdminPressMentionsPage);
