import type { Metadata } from "next";
import { AdminHeader } from "@/components/admin/Primitives";
import { AppearanceStudio } from "./AppearanceStudio";

export const metadata: Metadata = { title: "Appearance" };

export default function AppearancePage() {
  return (
    <>
      <AdminHeader
        title="Appearance"
        description="The photograph behind every page, your logo and the image library. Colours and themes live under Theme Settings."
      />
      <AppearanceStudio />
    </>
  );
}
