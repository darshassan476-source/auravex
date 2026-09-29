import Link from "next/link";
import { Text } from "@/cms/Text";
import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";
import { AmbientField } from "@/components/sections/AmbientField";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { Eyebrow } from "@/components/ui/Primitives";
import { NAV_ITEMS } from "@/data/site";

/**
 * Root-level 404. It sits outside the (site) group, so it brings its own
 * navbar and footer rather than inheriting the marketing shell.
 */
export default function NotFound() {
  return (
    <>
      <Navbar />

      <main className="ax-halo relative isolate flex min-h-screen flex-col items-center justify-center overflow-hidden px-5 py-32">
        <AmbientField background="dark-hero-03" priority />

        <div className="relative flex max-w-xl flex-col items-center gap-7 text-center">
          <Eyebrow>
            <Text id="notfound.eyebrow" />
          </Eyebrow>

          <h1 className="ax-display ax-gradient-text text-[clamp(5rem,16vw,11rem)] leading-none">
            <Text id="notfound.code" />
          </h1>

          <h2 className="ax-display ax-text-balance text-[clamp(1.5rem,3.4vw,2.4rem)]">
            <Text id="notfound.title" />
          </h2>

          <p className="ax-text-pretty max-w-md text-[15px] leading-relaxed text-[var(--ax-ink-muted)]">
            <Text id="notfound.body" />
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3">
            <Button href="/" size="lg" icon="home" iconPosition="left">
              <Text id="notfound.home" />
            </Button>
            <Button href="/products" size="lg" variant="secondary" icon="arrow-right">
              <Text id="notfound.products" />
            </Button>
          </div>

          <nav className="mt-6 flex flex-wrap items-center justify-center gap-2 border-t border-[var(--ax-line)] pt-7">
            {NAV_ITEMS.map((item, i) => (
              <Link
                key={item.href}
                href={item.href}
                className="ax-glass ax-focus group inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-[12.5px] text-[var(--ax-ink-muted)] transition-all duration-300 hover:border-[var(--ax-line-strong)] hover:text-[var(--ax-ink)]"
              >
                <Text id={`nav.${i + 1}.label`} />
                <Icon
                  name="arrow-up-right"
                  className="size-3 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                  strokeWidth={2.4}
                />
              </Link>
            ))}
          </nav>
        </div>
      </main>

      <Footer />
    </>
  );
}
