"use client";

import AdminShell from "@/components/admin/AdminShell";
import AdminSectionHeader from "@/components/admin/AdminSectionHeader";
import AwardsManagement from "@/components/admin/AwardsManagement";
import withAdminAuth from "@/hoc/withAdminAuth";

const copy = {
  title: "Awards",
  description: "Manage awards and recognition showcased on the landing page.",
};

const AwardsPage = () => (
  <AdminShell>
    <AdminSectionHeader title={copy.title} description={copy.description} />
    <AwardsManagement />
  </AdminShell>
);

export default withAdminAuth(AwardsPage);
