"use client";

import { useMemo } from "react";
import { useCms } from "@/cms/CmsProvider";
import { AdminHeader } from "@/components/admin/Primitives";
import { Button } from "@/components/ui/Button";
import type { DemoRequest } from "@/lib/types";
import { RequestBoard } from "./RequestBoard";

/**
 * The inbox seen as a pipeline. Each thread is a lead; its stage lives on
 * the thread, so this board and the Messages screen never disagree.
 */
export function LeadPipeline() {
  const { state, ready, setThreadStatus } = useCms();

  const requests = useMemo<DemoRequest[]>(
    () =>
      state.threads
        .filter((t) => !t.archived)
        .map((t) => ({
          id: t.id,
          name: t.name,
          company: t.company ?? "—",
          interest: t.subject ?? "General enquiry",
          status: t.status ?? "new",
          date: new Date(t.createdAt).toLocaleDateString(undefined, {
            month: "short",
            day: "numeric",
            year: "numeric",
          }),
          email: t.email,
        })),
    [state.threads],
  );

  const open = requests.filter((r) => r.status !== "closed").length;

  return (
    <>
      <AdminHeader
        title="Demo Requests"
        description={
          ready
            ? `${open} open in the pipeline. Every enquiry from the contact form lands here.`
            : "Loading the pipeline…"
        }
        action={
          <Button href="/admin/messages" size="sm" variant="secondary" icon="message" iconPosition="left">
            Open the inbox
          </Button>
        }
      />

      <RequestBoard requests={requests} onMove={setThreadStatus} />
    </>
  );
}
