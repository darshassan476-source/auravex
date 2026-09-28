import type { Metadata } from "next";
import { AdminHeader } from "@/components/admin/Primitives";
import { BookingsBoard } from "./BookingsBoard";

export const metadata: Metadata = { title: "Bookings" };

export default function BookingsPage() {
  return (
    <>
      <AdminHeader
        title="Bookings & Reminders"
        description="Scheduled demos, with a reminder before each one that reaches you after this tab is closed."
      />
      <BookingsBoard />
    </>
  );
}
