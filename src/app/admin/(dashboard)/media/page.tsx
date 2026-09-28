import type { Metadata } from "next";
import { AdminHeader } from "@/components/admin/Primitives";
import { MediaLibrary } from "./MediaLibrary";

export const metadata: Metadata = { title: "Media Library" };

export default function MediaLibraryPage() {
  return (
    <>
      <AdminHeader
        title="Media Library"
        description="Every image uploaded to the site, stored on the server and offered wherever a picture can be placed."
      />
      <MediaLibrary />
    </>
  );
}
