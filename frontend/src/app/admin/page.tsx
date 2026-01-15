"use client";

import withAdminAuth from '@/hoc/withAdminAuth';
import AdminShell from '@/components/admin/AdminShell';
import AdminOverview from '@/components/admin/AdminOverview';

const AdminPage = () => {
  return (
    <AdminShell>
      <AdminOverview />
    </AdminShell>
  );
};

export default withAdminAuth(AdminPage);