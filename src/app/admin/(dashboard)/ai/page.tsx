import type { Metadata } from "next";
import { AdminHeader } from "@/components/admin/Primitives";
import { AiWorkspace } from "./AiWorkspace";

export const metadata: Metadata = { title: "AI Studio" };

export default function AiPage() {
  return (
    <>
      <AdminHeader
        title="AI Studio"
        description="Ask for an outcome and watch the work: every step, every token, every pound spent."
      />
      <AiWorkspace />
    </>
  );
}
