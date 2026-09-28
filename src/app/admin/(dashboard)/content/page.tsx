import type { Metadata } from "next";
import { AdminHeader } from "@/components/admin/Primitives";
import { ContentEditor } from "./ContentEditor";

export const metadata: Metadata = { title: "Site Content" };

export default function ContentPage() {
  return (
    <>
      <AdminHeader
        title="Site Content"
        description="Every headline, paragraph and button label on the public site. Edits are live — there is no publish step."
      />
      <ContentEditor />
    </>
  );
}
