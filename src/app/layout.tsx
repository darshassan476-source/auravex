import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import type { ReactNode } from "react";
import { CmsProvider } from "@/cms/CmsProvider";
import { getSiteBundle } from "@/server/cache";
import { revealWatcherScript } from "@/components/fx/revealWatcher";
import { SmoothScroll } from "@/components/fx/SmoothScroll";
import { SEO_KEYWORDS } from "@/data/chromeCopy";
import { SITE } from "@/data/site";
import { themeNoFlashScript } from "@/themes/noFlash";
import { ThemeProvider } from "@/themes/ThemeProvider";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

/** Titles and previews use the name and lines typed in Settings, not the shipped defaults. */
export async function generateMetadata(): Promise<Metadata> {
  const text = (await getSiteBundle()).text ?? {};
  const name = text["site.name"] || SITE.name;
  const tagline = text["site.tagline"] || SITE.tagline;
  const headline = text["site.headline"] || SITE.headline;
  const description = text["site.description"] || SITE.description;
  const keywords = (text["seo.keywords"] || SEO_KEYWORDS.join(", "))
    .split(",")
    .map((k) => k.trim())
    .filter(Boolean);
  return {
  metadataBase: new URL("https://auravex.com"),
  title: {
    default: `${name} — ${tagline}`,
    template: `%s · ${name}`,
  },
  description: description,
  keywords,
  authors: [{ name: name }],
  openGraph: {
    type: "website",
    siteName: name,
    title: `${name} — ${headline}`,
    description: description,
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: `${name} — ${headline}`,
    description: description,
  },
  };
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#04070f" },
    { media: "(prefers-color-scheme: light)", color: "#f6f8fd" },
  ],
};

/**
 * The edited content rides in the first HTML a visitor receives — no flash
 * of stock copy while the browser fetches the bundle. Pages stay static: the
 * bundle is cached under a tag that every admin write invalidates.
 */
export default async function RootLayout({ children }: { children: ReactNode }) {
  const bundle = await getSiteBundle();
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`} suppressHydrationWarning>
      <head>
        {/* Applies the persisted theme before first paint — no flash of default. */}
        <script dangerouslySetInnerHTML={{ __html: themeNoFlashScript({ site: bundle.siteTheme, portal: bundle.portalTheme, custom: bundle.customThemes ?? [] }) }} />
      </head>
      <body className="min-h-full">
        <ThemeProvider defaults={{ site: bundle.siteTheme, portal: bundle.portalTheme, custom: bundle.customThemes ?? [] }}>
          <CmsProvider initial={bundle}>
            <SmoothScroll>
              {children}
            </SmoothScroll>
          </CmsProvider>
        </ThemeProvider>
        {/* Runs before hydration so scroll entrances never wait on the bundle. */}
        <script dangerouslySetInnerHTML={{ __html: revealWatcherScript }} />
      </body>
    </html>
  );
}
