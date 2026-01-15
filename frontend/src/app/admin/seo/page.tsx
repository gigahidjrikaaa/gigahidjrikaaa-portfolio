"use client";

import AdminShell from "@/components/admin/AdminShell";
import AdminSectionHeader from "@/components/admin/AdminSectionHeader";
import withAdminAuth from "@/hoc/withAdminAuth";

const copy = {
  title: "SEO",
  description: "SEO settings are not yet connected to the backend. Add SEO endpoints to enable updates.",
};

const SeoPage = () => (
  <AdminShell>
    <AdminSectionHeader title={copy.title} description={copy.description} />
    <div className="rounded-lg border border-dashed border-gray-200 p-6 text-sm text-gray-500">
      {copy.description}
    </div>
  </AdminShell>
);

export default withAdminAuth(SeoPage);
