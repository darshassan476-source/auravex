"use client";

import Link from "next/link";
import { useText } from "@/cms/CmsProvider";
import { Text } from "@/cms/Text";
import { useCatalogue } from "@/cms/useProduct";
import { isActive } from "@/data/products";
import { FOOTER_COLUMNS, SOCIAL_PROFILES } from "@/data/site";
import { Icon } from "../ui/Icon";
import { BrandName } from "./BrandName";
import { Logo } from "./Logo";
import { SiteEmailLink } from "./SiteEmail";
import { ThemeSwitcher } from "./ThemeSwitcher";

/** Only a real web address becomes a social button; anything else is ignored. */
const isUrl = (value: string) => /^https?:\/\/[^\s/]+\.[^\s]+/i.test(value.trim());

function FooterLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="ax-focus group inline-flex items-center gap-1.5 text-[13.5px] text-[var(--ax-ink-muted)] transition-colors duration-300 hover:text-[var(--ax-ink)]"
    >
      {children}
      <Icon
        name="arrow-right"
        className="size-3 -translate-x-1 opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100"
        strokeWidth={2.4}
      />
    </Link>
  );
}

function SocialButton({ id, label }: { id: string; label: string }) {
  const url = useText(`ex.social.${id}.url`);
  if (!isUrl(url)) return null;
  return (
    <a
      href={url.trim()}
      target="_blank"
      rel="noopener noreferrer"
      className="ax-glass ax-focus rounded-full px-4 py-2 text-[12px] font-medium text-[var(--ax-ink-muted)] transition-all duration-300 hover:border-[var(--ax-line-strong)] hover:text-[var(--ax-ink)]"
    >
      {label}
    </a>
  );
}

export function Footer() {
  const year = new Date().getFullYear();
  // The solutions column lists what is on sale today, live from the catalogue.
  const products = useCatalogue().filter(isActive);

  return (
    <footer className="relative overflow-hidden border-t border-[var(--ax-line)] bg-[var(--ax-bg-elevated)] pb-20 md:pb-0">
      <div className="ax-grid-bg absolute inset-0 opacity-[0.35] [mask-image:linear-gradient(180deg,#000,transparent_70%)]" />

      <div className="ax-container-wide relative">
        <div className="grid gap-12 py-16 lg:grid-cols-[1.2fr_2fr] lg:gap-20 lg:py-20">
          <div className="flex flex-col gap-6">
            <Logo size="md" />
            <p className="ax-text-pretty max-w-sm text-[14px] leading-relaxed text-[var(--ax-ink-muted)]">
              <Text id="site.description" />
            </p>

            <div className="flex flex-col gap-2 text-[13px] text-[var(--ax-ink-muted)]">
              <SiteEmailLink className="ax-focus inline-flex w-fit items-center gap-2 transition-colors hover:text-[var(--ax-accent-soft)]">
                <Icon name="mail" className="size-4" strokeWidth={1.8} />
              </SiteEmailLink>
              <span className="inline-flex items-center gap-2">
                <Icon name="globe" className="size-4" strokeWidth={1.8} />
                <Text id="site.location" />
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              {SOCIAL_PROFILES.map((social) => (
                <SocialButton key={social.id} id={social.id} label={social.label} />
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-10 sm:grid-cols-3">
            {FOOTER_COLUMNS.map((column, c) => (
              <div key={column.title} className={c === 0 ? "col-span-2 flex flex-col gap-4 sm:col-span-1" : "flex flex-col gap-4"}>
                <h3 className="ax-eyebrow text-[var(--ax-ink)]">
                  <Text id={`ex.footer.col.${c + 1}.title`} />
                </h3>
                <ul className="flex flex-col gap-2.5">
                  {column.links.map((link, l) => (
                    <li key={link.href}>
                      <FooterLink href={link.href}>
                        <Text id={`ex.footer.col.${c + 1}.link.${l + 1}`} />
                      </FooterLink>
                    </li>
                  ))}
                  {c === 0 &&
                    products.map((product) => (
                      <li key={product.slug}>
                        <FooterLink href={`/products/${product.slug}`}>{product.name}</FooterLink>
                      </li>
                    ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="ax-hairline" />

        <div className="flex flex-col items-center justify-between gap-5 py-7 md:flex-row">
          <p className="text-[12px] text-[var(--ax-ink-dim)]">
            © {year} <BrandName />. <Text id="footer.rights" />
          </p>
          <ThemeSwitcher />
        </div>
      </div>
    </footer>
  );
}
