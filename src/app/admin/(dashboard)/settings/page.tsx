import type { Metadata } from "next";
import { AdminHeader } from "@/components/admin/Primitives";
import { SettingsForm } from "./SettingsForm";

export const metadata: Metadata = { title: "Website Settings" };

export default function WebsiteSettingsPage() {
  return (
    <>
      <AdminHeader
        title="Website Settings"
        description="Identity and contact details for the public site, your account, and what the server is connected to."
      />

      <SettingsForm />
    </>
  );
}
