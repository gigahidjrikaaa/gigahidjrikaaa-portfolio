"use client";

import AdminShell from "@/components/admin/AdminShell";
import AdminSectionHeader from "@/components/admin/AdminSectionHeader";
import ContactMessageManagement from "@/components/admin/ContactMessageManagement";
import withAdminAuth from "@/hoc/withAdminAuth";

const copy = {
  title: "Messages",
  description: "Review and respond to contact form submissions.",
};

const MessagesPage = () => (
  <AdminShell>
    <AdminSectionHeader title={copy.title} description={copy.description} />
    <ContactMessageManagement />
  </AdminShell>
);

export default withAdminAuth(MessagesPage);
