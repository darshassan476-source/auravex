import type { Metadata } from "next";
import { LeadPipeline } from "./LeadPipeline";

export const metadata: Metadata = { title: "Demo Requests" };

export default function DemoRequestsPage() {
  return <LeadPipeline />;
}
