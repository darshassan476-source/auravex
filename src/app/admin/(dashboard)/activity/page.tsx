import type { Metadata } from "next";
import { AdminHeader } from "@/components/admin/Primitives";
import { ActivityLog } from "./ActivityLog";

export const metadata: Metadata = { title: "Activity Logs" };

export default function ActivityPage() {
  return (
    <>
      <AdminHeader
        title="Activity Logs"
        description="Every change made through the portal, newest first, as the server recorded it."
      />
      <ActivityLog />
    </>
  );
}
