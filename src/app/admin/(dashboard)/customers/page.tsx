import type { Metadata } from "next";
import { AdminHeader } from "@/components/admin/Primitives";
import { CustomersManager } from "./CustomersManager";

export const metadata: Metadata = { title: "Customers & Deployments" };

export default function CustomersPage() {
  return (
    <>
      <AdminHeader
        title="Customers & Deployments"
        description="Verified customer relationships and deployments. Only verified records you choose to disclose appear on the website."
      />
      <CustomersManager />
    </>
  );
}
