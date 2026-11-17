import type { Metadata } from "next";
import { AdminHeader } from "@/components/admin/Primitives";
import { AdoptionManager } from "./AdoptionManager";

export const metadata: Metadata = { title: "Adoption Figures" };

export default function AdoptionPage() {
  return (
    <>
      <AdminHeader
        title="Adoption Figures"
        description="Businesses using each product, deployments, countries served. A figure is shown publicly only when it is verified and marked public."
      />
      <AdoptionManager />
    </>
  );
}
