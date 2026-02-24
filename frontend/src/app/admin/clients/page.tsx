"use client";

import withAdminAuth from "@/hoc/withAdminAuth";
import AdminShell from "@/components/admin/AdminShell";
import ClientsManagement from "@/components/admin/ClientsManagement";

const AdminClientsPage = () => {
  return (
    <AdminShell>
      <ClientsManagement />
    </AdminShell>
  );
};

export default withAdminAuth(AdminClientsPage);
