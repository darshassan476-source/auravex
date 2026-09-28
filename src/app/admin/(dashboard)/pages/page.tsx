import type { Metadata } from "next";
import { AdminHeader } from "@/components/admin/Primitives";
import { PageBuilder } from "./PageBuilder";

export const metadata: Metadata = { title: "Page Builder" };

export default function PagesPage() {
  return (
    <>
      <AdminHeader
        title="Page Builder"
        description="Drop images, text, figures, quotes and video onto any page — under the hero, or above the closing call to action."
      />
      <PageBuilder />
    </>
  );
}
