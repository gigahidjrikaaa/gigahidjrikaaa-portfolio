"use client";

import AdminShell from "@/components/admin/AdminShell";
import AdminSectionHeader from "@/components/admin/AdminSectionHeader";
import ServicesManagement from "@/components/admin/ServicesManagement";
import withAdminAuth from "@/hoc/withAdminAuth";

const copy = {
  title: "Services",
  description: "Create and manage services featured on the landing page.",
};

const ServicesPage = () => (
  <AdminShell>
    <AdminSectionHeader title={copy.title} description={copy.description} />
    <ServicesManagement />
  </AdminShell>
);

export default withAdminAuth(ServicesPage);
