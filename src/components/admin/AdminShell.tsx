"use client";

import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { useCms } from "@/cms/CmsProvider";
import { AX_EASE } from "@/components/fx/Reveal";
import { Logo } from "@/components/layout/Logo";
import { ThemeSwitcher } from "@/components/layout/ThemeSwitcher";
import { Icon } from "@/components/ui/Icon";
import { PasswordPanel } from "@/app/admin/(dashboard)/settings/SettingsForm";
import { ADMIN_NAV, ADMIN_USER } from "@/data/admin";
import { useAdminSession } from "@/lib/adminAuth";
import { cn } from "@/lib/utils";

/**
 * Admin chrome: persistent sidebar, top bar and the session guard.
 *
 * Middleware already turns away browsers with no session cookie; this asks
 * the server whether the cookie is still good and bounces to /admin/login
 * when it is not.
 */
export function AdminShell({ children }: { children: ReactNode }) {
  const { user, signedIn, checked, signOut } = useAdminSession();
  const { state, synced, error } = useCms();
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);

  const displayName = user?.name ?? ADMIN_USER.name;
  const initials =
    displayName
      .split(/\s+/)
      .map((part) => part[0] ?? "")
      .join("")
      .slice(0, 2)
      .toUpperCase() || ADMIN_USER.initials;
  const roleLabel = user?.role === "owner" ? "Owner Access" : (user?.role ?? ADMIN_USER.role);
  const unread = state.threads.filter((t) => t.unread && !t.archived).length;
  const fresh = state.threads.filter((t) => t.status === "new" && !t.archived).length;
  /** Counts that live on the sidebar, from the server's records. */
  const badgeFor = (href: string) =>
    href === "/admin/messages" ? unread : href === "/admin/demo-requests" ? fresh : 0;

  useEffect(() => {
    if (checked && !signedIn) router.replace("/admin/login");
  }, [checked, signedIn, router]);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  if (!checked || !signedIn) {
    return (
      <div className="grid min-h-screen place-items-center bg-[var(--ax-bg)]">
        <div className="flex flex-col items-center gap-4">
          <span className="size-6 animate-spin rounded-full border-2 border-[var(--ax-line-strong)] border-t-[var(--ax-accent)]" />
          <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-[var(--ax-ink-dim)]">
            Verifying session
          </span>
        </div>
      </div>
    );
  }

  // The seeded demo password opens exactly one door: the one that replaces it.
  if (user?.mustChange) {
    return (
      <div className="grid min-h-screen place-items-center bg-[var(--ax-bg)] px-5 py-10">
        <div className="flex w-full max-w-[520px] flex-col gap-5">
          <div className="flex items-center justify-between">
            <Logo size="sm" href="/admin" label="Admin Portal" />
            <button
              type="button"
              onClick={async () => {
                await signOut();
                router.replace("/admin/login");
              }}
              className="ax-focus inline-flex items-center gap-2 rounded-full border border-[var(--ax-line)] px-3.5 py-1.5 text-[12px] text-[var(--ax-ink-muted)] transition-colors hover:text-[var(--ax-ink)]"
            >
              <Icon name="logout" className="size-3.5" strokeWidth={2} />
              Sign out
            </button>
          </div>
          <p className="flex items-start gap-2.5 rounded-xl border border-[var(--ax-warning)]/35 bg-[var(--ax-warning)]/12 px-4 py-3 text-[12.5px] leading-relaxed text-[var(--ax-ink)]">
            <Icon name="lock" className="mt-0.5 size-4 shrink-0 text-[var(--ax-warning)]" strokeWidth={2.1} />
            <span>
              This account still uses the demo password, which is public. Set your own before
              anything else — the rest of the portal unlocks the moment you do.
            </span>
          </p>
          <PasswordPanel onChanged={() => window.location.assign("/admin")} />
        </div>
      </div>
    );
  }

  /**
   * Exactly one item is active: the longest href the current path sits under.
   *
   * A plain `startsWith` marked both "Add Software" (/admin/products/new) and
   * "Manage Products" (/admin/products) as active, and the shared layout
   * animation then highlighted whichever rendered last — so opening one page
   * lit up its neighbour.
   */
  const activeHref = ADMIN_NAV.flatMap((group) => group.items)
    .map((item) => item.href)
    .filter((href) =>
      href === "/admin" ? pathname === "/admin" : pathname === href || pathname.startsWith(href + "/"),
    )
    .sort((a, b) => b.length - a.length)[0];

  const sidebar = (
    <div className="flex h-full flex-col gap-6 p-5">
      <div className="flex items-center justify-between">
        <Logo size="sm" href="/admin" label="Admin Portal" />
        <button
          type="button"
          onClick={() => setMobileOpen(false)}
          aria-label="Close menu"
          className="ax-focus grid size-9 place-items-center rounded-full text-[var(--ax-ink-muted)] lg:hidden"
        >
          <Icon name="x" className="size-4" strokeWidth={2.2} />
        </button>
      </div>

      <nav className="flex flex-1 flex-col gap-6 overflow-y-auto">
        {ADMIN_NAV.map((group) => (
          <div key={group.group} className="flex flex-col gap-1.5">
            <span className="px-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--ax-ink-dim)]">
              {group.group}
            </span>

            {group.items.map((item) => {
              const active = item.href === activeHref;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "ax-focus group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-[13.5px] font-medium transition-colors duration-300",
                    active
                      ? "text-[var(--ax-ink)]"
                      : "text-[var(--ax-ink-muted)] hover:bg-[rgba(var(--ax-glow),0.07)] hover:text-[var(--ax-ink)]",
                  )}
                >
                  {active && (
                    <motion.span
                      layoutId="admin-nav-active"
                      transition={{ duration: 0.36, ease: AX_EASE }}
                      className="absolute inset-0 rounded-xl bg-[rgba(var(--ax-glow),0.14)] ring-1 ring-[var(--ax-line-strong)]"
                    />
                  )}
                  <Icon
                    name={item.icon}
                    className={cn(
                      "relative size-[17px] shrink-0 transition-colors",
                      active ? "text-[var(--ax-accent-soft)]" : "",
                    )}
                    strokeWidth={1.9}
                  />
                  <span className="relative flex-1 truncate">{item.label}</span>
                  {badgeFor(item.href) > 0 && (
                    <span className="relative rounded-full bg-[var(--ax-accent)]/18 px-2 py-0.5 text-[10px] font-semibold text-[var(--ax-accent-soft)]">
                      {badgeFor(item.href)}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      <div className="flex flex-col gap-3 border-t border-[var(--ax-line)] pt-4">
        <Link
          href="/"
          className="ax-focus flex items-center gap-2.5 rounded-xl px-3 py-2 text-[12.5px] text-[var(--ax-ink-muted)] transition-colors hover:text-[var(--ax-ink)]"
        >
          <Icon name="external-link" className="size-4" strokeWidth={1.9} />
          View live site
        </Link>

        <div className="ax-glass flex items-center gap-3 rounded-xl p-3">
          <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-[linear-gradient(140deg,var(--ax-accent),var(--ax-violet))] text-[12px] font-bold text-white">
            {initials}
          </span>
          <span className="flex min-w-0 flex-1 flex-col">
            <span className="truncate text-[13px] font-semibold text-[var(--ax-ink)]">
              {displayName}
            </span>
            <span className="truncate text-[11px] text-[var(--ax-ink-dim)]" title={user?.email}>
              {roleLabel}
            </span>
          </span>
          <button
            type="button"
            onClick={async () => {
              await signOut();
              router.replace("/admin/login");
            }}
            aria-label="Sign out"
            className="ax-focus shrink-0 rounded-lg p-1.5 text-[var(--ax-ink-dim)] transition-colors hover:text-[var(--ax-danger)]"
          >
            <Icon name="logout" className="size-4" strokeWidth={2} />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="relative min-h-screen bg-[var(--ax-bg)]">
      <div className="ax-grid-bg pointer-events-none fixed inset-0 opacity-25" />

      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-[264px] border-r border-[var(--ax-line)] bg-[var(--ax-bg-elevated)]/80 backdrop-blur-xl lg:block">
        {sidebar}
      </aside>

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] lg:hidden"
          >
            <button
              type="button"
              aria-label="Close menu"
              onClick={() => setMobileOpen(false)}
              className="absolute inset-0 cursor-default bg-[var(--ax-bg)]/80 backdrop-blur-sm"
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ duration: 0.34, ease: AX_EASE }}
              className="absolute inset-y-0 left-0 w-[276px] border-r border-[var(--ax-line)] bg-[var(--ax-bg-elevated)]"
            >
              {sidebar}
            </motion.aside>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Content column */}
      <div className="relative lg:pl-[264px]">
        <header className="sticky top-0 z-30 border-b border-[var(--ax-line)] bg-[color-mix(in_srgb,var(--ax-bg)_85%,transparent)] backdrop-blur-xl">
          <div className="flex h-16 items-center gap-3 px-5 md:px-8">
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              aria-label="Open menu"
              className="ax-focus grid size-9 place-items-center rounded-full text-[var(--ax-ink)] hover:bg-[rgba(var(--ax-glow),0.10)] lg:hidden"
            >
              <Icon name="menu" className="size-5" strokeWidth={2} />
            </button>

            <Breadcrumb pathname={pathname} />

            <div className="ml-auto flex items-center gap-2.5">
              <span
                className="hidden items-center gap-2 rounded-full border border-[var(--ax-line)] px-3 py-1.5 text-[11.5px] text-[var(--ax-ink-muted)] md:inline-flex"
                title={error ?? undefined}
              >
                <span
                  className={cn(
                    "size-1.5 rounded-full",
                    error ? "bg-[var(--ax-danger)]" : synced ? "bg-[var(--ax-success)]" : "bg-[var(--ax-warning)]",
                  )}
                />
                {error ? "Save failed" : synced ? "Connected" : "Connecting"}
              </span>

              <Link
                href="/admin/messages"
                aria-label={unread ? `${unread} unread messages` : "Messages"}
                className="ax-focus relative grid size-9 place-items-center rounded-full text-[var(--ax-ink-muted)] transition-colors hover:bg-[rgba(var(--ax-glow),0.10)] hover:text-[var(--ax-ink)]"
              >
                <Icon name="bell" className="size-[18px]" strokeWidth={1.9} />
                {unread > 0 && (
                  <span className="absolute right-1.5 top-1.5 grid min-w-[16px] place-items-center rounded-full bg-[var(--ax-accent)] px-1 text-[9.5px] font-bold leading-4 text-white">
                    {unread > 9 ? "9+" : unread}
                  </span>
                )}
              </Link>

              <div className="hidden md:block">
                <ThemeSwitcher align="right" direction="down" />
              </div>
            </div>
          </div>
        </header>

        <main className="relative px-5 py-8 md:px-8 md:py-10">{children}</main>
      </div>
    </div>
  );
}

/** Derives a readable trail from the pathname — no per-page config needed. */
function Breadcrumb({ pathname }: { pathname: string }) {
  const segments = pathname.split("/").filter(Boolean).slice(1);

  return (
    <nav className="flex min-w-0 items-center gap-2 text-[13px]">
      <Link
        href="/admin"
        className="ax-focus shrink-0 text-[var(--ax-ink-dim)] transition-colors hover:text-[var(--ax-ink-muted)]"
      >
        Admin
      </Link>
      {segments.map((segment, i) => (
        <span key={segment + i} className="flex min-w-0 items-center gap-2">
          <Icon name="chevron-right" className="size-3.5 shrink-0 text-[var(--ax-ink-dim)]" strokeWidth={2.2} />
          <span className="truncate capitalize text-[var(--ax-ink)]">
            {segment.replace(/-/g, " ")}
          </span>
        </span>
      ))}
    </nav>
  );
}
