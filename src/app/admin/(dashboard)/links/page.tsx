import type { Metadata } from "next";
import { AdminHeader } from "@/components/admin/Primitives";
import { LinksManager } from "./LinksManager";

export const metadata: Metadata = { title: "Manage Links" };

export default function ManageLinksPage() {
  return (
    <>
      <AdminHeader
        title="Manage Links"
        description="Outbound destinations, each with a tracked address that counts clicks before redirecting."
      />
      <LinksManager />
    </>
  );
}
