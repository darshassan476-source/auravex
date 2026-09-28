import type { Metadata } from "next";
import { AdminHeader } from "@/components/admin/Primitives";
import { VisitorAnalytics } from "./VisitorAnalytics";

export const metadata: Metadata = { title: "Analytics" };

export default function AnalyticsPage() {
  return (
    <>
      <AdminHeader
        title="Analytics"
        description="Who visited, when, from where and on what — read from the site's own visit log."
      />
      <VisitorAnalytics />
    </>
  );
}
