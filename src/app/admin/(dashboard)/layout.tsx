import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Reminders } from "@/cms/Reminders";
import { AdminShell } from "@/components/admin/AdminShell";

export const metadata: Metadata = {
  title: {
    default: "Admin Portal",
    template: "%s · AURAVEX Admin",
  },
  description: "AURAVEX management portal.",
  robots: { index: false, follow: false },
};

/**
 * Wraps every authenticated admin route. `/admin/login` deliberately sits
 * outside this group so the guard cannot redirect into itself.
 */
export default function AdminDashboardLayout({ children }: { children: ReactNode }) {
  return (
    <AdminShell>
      <Reminders />
      {children}
    </AdminShell>
  );
}
