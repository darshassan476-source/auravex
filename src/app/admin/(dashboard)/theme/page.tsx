import type { Metadata } from "next";
import { AdminHeader } from "@/components/admin/Primitives";
import { THEMES } from "@/themes/themes";
import { ThemeStudio } from "./ThemeStudio";

export const metadata: Metadata = { title: "Theme Settings" };

export default function ThemeSettingsPage() {
  return (
    <>
      <AdminHeader
        title="Theme Settings"
        description={`Themes and colours for both halves: what visitors see, what your portal opens in, and ${THEMES.length} presets or any colours of your own.`}
      />

      <ThemeStudio />
    </>
  );
}
