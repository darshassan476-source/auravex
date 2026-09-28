import type { ReactNode } from "react";
import { Preloader } from "@/components/fx/Preloader";
import { Footer } from "@/components/layout/Footer";
import { MobileCTABar } from "@/components/layout/MobileCTABar";
import { Navbar } from "@/components/layout/Navbar";

/**
 * Public marketing shell. The admin portal deliberately sits outside this
 * group so it gets its own chrome without the site nav or boot sequence.
 */
export default function SiteLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <Preloader />
      <Navbar />
      <main className="flex min-h-screen flex-col">{children}</main>
      <Footer />
      <MobileCTABar />
    </>
  );
}
