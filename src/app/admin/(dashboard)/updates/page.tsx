import type { Metadata } from "next";
import { AdminHeader } from "@/components/admin/Primitives";
import { UpdatesManager } from "./UpdatesManager";

export const metadata: Metadata = { title: "Latest Updates" };

export default function UpdatesPage() {
  return (
    <>
      <AdminHeader
        title="Latest Updates"
        description="Product news, new modules, AI capabilities, releases and announcements. Published updates appear on the website automatically."
      />
      <UpdatesManager />
    </>
  );
}
