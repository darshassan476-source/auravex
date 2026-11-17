import type { Metadata } from "next";
import { AdminHeader } from "@/components/admin/Primitives";
import { EnquiriesBoard } from "./EnquiriesBoard";

export const metadata: Metadata = { title: "Enquiries" };

export default function EnquiriesPage() {
  return (
    <>
      <AdminHeader
        title="Enquiries & Meeting Requests"
        description="Solution configurations and consultation requests from the website. Reply from the conversation in Messages."
      />
      <EnquiriesBoard />
    </>
  );
}
