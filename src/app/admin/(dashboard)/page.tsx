import { ADMIN_USER } from "@/data/admin";
import { DashboardLive } from "./DashboardLive";

export default function AdminDashboardPage() {
  return <DashboardLive name={ADMIN_USER.name} />;
}
