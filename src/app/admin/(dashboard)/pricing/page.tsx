import type { Metadata } from "next";
import { AdminHeader } from "@/components/admin/Primitives";
import { PricingManager } from "./PricingManager";

export const metadata: Metadata = { title: "Pricing" };

export default function PricingPage() {
  return (
    <>
      <AdminHeader
        title="Pricing"
        description="Internal commercial figures per product. The website shows “Enterprise pricing tailored to your organization’s requirements” unless you turn on public display for a product."
      />
      <PricingManager />
    </>
  );
}
