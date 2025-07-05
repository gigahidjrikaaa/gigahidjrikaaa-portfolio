"use client";

import withAdminAuth from '@/hoc/withAdminAuth';
import AdminDashboard from '@/components/pages/admin/AdminDashboard';

const AdminPage = () => {
  return <AdminDashboard />;
};

export default withAdminAuth(AdminPage);