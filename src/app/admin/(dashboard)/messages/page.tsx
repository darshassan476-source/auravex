import type { Metadata } from "next";
import { AdminHeader } from "@/components/admin/Primitives";
import { MessagesInbox } from "./MessagesInbox";

export const metadata: Metadata = { title: "Messages" };

export default function MessagesPage() {
  return (
    <>
      <AdminHeader
        title="Messages"
        description="Everyone who has written in, and the conversation with each of them."
      />
      <MessagesInbox />
    </>
  );
}
