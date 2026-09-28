import type { Metadata } from "next";
import { AdminHeader } from "@/components/admin/Primitives";
import { CaseStudyEditor } from "./CaseStudyEditor";

export const metadata: Metadata = { title: "Case Studies" };

export default function CaseStudiesPage() {
  return (
    <>
      <AdminHeader
        title="Case Studies"
        description="Headlines, summaries and the figures on every case study. Edits are live."
      />
      <CaseStudyEditor />
    </>
  );
}
