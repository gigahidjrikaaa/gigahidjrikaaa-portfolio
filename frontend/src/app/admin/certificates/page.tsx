"use client";

import AdminShell from "@/components/admin/AdminShell";
import AdminSectionHeader from "@/components/admin/AdminSectionHeader";
import CertificatesManagement from "@/components/admin/CertificatesManagement";
import withAdminAuth from "@/hoc/withAdminAuth";

const copy = {
  title: "Certificates",
  description: "Manage certifications and credentials displayed on the landing page.",
};

const CertificatesPage = () => (
  <AdminShell>
    <AdminSectionHeader title={copy.title} description={copy.description} />
    <CertificatesManagement />
  </AdminShell>
);

export default withAdminAuth(CertificatesPage);
