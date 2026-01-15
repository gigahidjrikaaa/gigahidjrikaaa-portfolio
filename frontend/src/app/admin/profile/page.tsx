"use client";

import AdminShell from "@/components/admin/AdminShell";
import AdminSectionHeader from "@/components/admin/AdminSectionHeader";
import withAdminAuth from "@/hoc/withAdminAuth";

const copy = {
  title: "Profile",
  description: "Profile management is not yet wired to the backend. Add the API endpoints to enable edits.",
};

const ProfilePage = () => (
  <AdminShell>
    <AdminSectionHeader title={copy.title} description={copy.description} />
    <div className="rounded-lg border border-dashed border-gray-200 p-6 text-sm text-gray-500">
      {copy.description}
    </div>
  </AdminShell>
);

export default withAdminAuth(ProfilePage);
