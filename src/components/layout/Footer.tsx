import Link from "next/link";
import { FOOTER_COLUMNS, SITE } from "@/data/site";
import { Icon } from "../ui/Icon";
import { BrandName } from "./BrandName";
import { Logo } from "./Logo";
import { ThemeSwitcher } from "./ThemeSwitcher";

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="relative overflow-hidden border-t border-[var(--ax-line)] bg-[var(--ax-bg-elevated)] pb-20 md:pb-0">
      <div className="ax-grid-bg absolute inset-0 opacity-[0.35] [mask-image:linear-gradient(180deg,#000,transparent_70%)]" />
      <div
        aria-hidden
        className="absolute -top-40 left-1/2 size-[680px] -translate-x-1/2 rounded-full opacity-50 blur-[130px]"
        style={{ background: "radial-gradient(circle, rgba(var(--ax-glow),0.22), transparent 70%)" }}
      />

      <div className="ax-container-wide relative">
        {/* Top band */}
        <div className="grid gap-12 py-16 lg:grid-cols-[1.4fr_2fr] lg:gap-20 lg:py-20">
          <div className="flex flex-col gap-6">
            <Logo size="md" />
            <p className="ax-text-pretty max-w-sm text-[14px] leading-relaxed text-[var(--ax-ink-muted)]">
              {SITE.description} We partner with visionary enterprises to design, build
              and scale the platforms their next decade depends on.
            </p>

            <div className="flex flex-col gap-2 text-[13px] text-[var(--ax-ink-muted)]">
              <a
                href={`mailto:${SITE.email}`}
                className="ax-focus inline-flex w-fit items-center gap-2 transition-colors hover:text-[var(--ax-accent-soft)]"
              >
                <Icon name="mail" className="size-4" strokeWidth={1.8} />
                {SITE.email}
              </a>
              <span className="inline-flex items-center gap-2">
                <Icon name="globe" className="size-4" strokeWidth={1.8} />
                {SITE.location}
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              {SITE.socials.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ax-glass ax-focus rounded-full px-4 py-2 text-[12px] font-medium text-[var(--ax-ink-muted)] transition-all duration-300 hover:border-[var(--ax-line-strong)] hover:text-[var(--ax-ink)]"
                >
                  {social.label}
                </a>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-10 sm:grid-cols-3">
            {FOOTER_COLUMNS.map((column) => (
              <div key={column.title} className="flex flex-col gap-4">
                <h3 className="ax-eyebrow text-[var(--ax-ink)]">{column.title}</h3>
                <ul className="flex flex-col gap-2.5">
                  {column.links.map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className="ax-focus group inline-flex items-center gap-1.5 text-[13.5px] text-[var(--ax-ink-muted)] transition-colors duration-300 hover:text-[var(--ax-ink)]"
                      >
                        {link.label}
                        <Icon
                          name="arrow-right"
                          className="size-3 -translate-x-1 opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100"
                          strokeWidth={2.4}
                        />
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="ax-hairline" />

        {/* Bottom band */}
        <div className="flex flex-col items-center justify-between gap-5 py-7 md:flex-row">
          <p className="text-[12px] text-[var(--ax-ink-dim)]">
            © {year} <BrandName />. All rights reserved.
          </p>

          <ThemeSwitcher />

          <div className="flex items-center gap-5 text-[12px] text-[var(--ax-ink-dim)]">
            <Link href="/privacy" className="ax-focus transition-colors hover:text-[var(--ax-ink-muted)]">
              Privacy
            </Link>
            <Link href="/terms" className="ax-focus transition-colors hover:text-[var(--ax-ink-muted)]">
              Terms
            </Link>
            <span className="inline-flex items-center gap-1.5">
              <span className="size-1.5 rounded-full bg-[var(--ax-success)]" />
              All systems operational
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
