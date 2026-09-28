"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import { AX_EASE } from "@/components/fx/Reveal";
import { Logo } from "@/components/layout/Logo";
import { AmbientField } from "@/components/sections/AmbientField";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { DEMO_CREDENTIALS } from "@/data/admin";
import { SITE } from "@/data/site";
import { useAdminSession } from "@/lib/adminAuth";
import { cn } from "@/lib/utils";

/** "AURAVEX" reads as shouting in sentence copy. */
const BRAND = SITE.name.charAt(0) + SITE.name.slice(1).toLowerCase();

/**
 * Admin sign-in — reference 7, left panel.
 *
 * The environment photograph runs full-bleed and the access card sits on the
 * left third over it, with the wordmark floating above and the copyright
 * anchored beneath. Sign-in is a round-trip to /api/auth/login, which sets
 * the httpOnly session cookie. SSO is presented but disabled until an
 * identity provider is configured.
 */
export default function AdminLoginPage() {
  const router = useRouter();
  const { signedIn, checked, signIn, demo } = useAdminSession();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [reveal, setReveal] = useState(false);
  const [remember, setRemember] = useState(true);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  // Already authenticated visitors skip the form entirely.
  useEffect(() => {
    if (checked && signedIn) router.replace("/admin");
  }, [checked, signedIn, router]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setBusy(true);

    const result = await signIn(email, password, remember);
    if (result.ok) {
      // Middleware sends people here with ?next=<where they were going>.
      const next = new URLSearchParams(window.location.search).get("next");
      router.replace(next && next.startsWith("/admin") ? next : "/admin");
    } else {
      setError(result.error);
      setBusy(false);
    }
  }

  function useDemoCredentials() {
    setEmail(DEMO_CREDENTIALS.email);
    setPassword(DEMO_CREDENTIALS.password);
    setError("");
  }

  const fieldClass =
    "ax-focus w-full rounded-xl border border-[var(--ax-line)] bg-[rgba(var(--ax-glow),0.05)] " +
    "px-4 py-3 text-[14px] text-[var(--ax-ink)] outline-none transition-colors duration-300 " +
    "placeholder:text-[var(--ax-ink-dim)] focus:border-[var(--ax-line-strong)]";

  return (
    <main className="relative isolate min-h-screen overflow-hidden">
      <AmbientField page="admin-login" background="dark-hero-04" priority />

      <div className="relative mx-auto flex min-h-screen w-full max-w-[1400px] flex-col px-5 py-8 sm:px-8 lg:px-14">
        {/* Wordmark, floating over the environment */}
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: AX_EASE }}
        >
          <Logo size="md" href="/" label="Admin Portal" />
        </motion.div>

        {/* Access card — left third on desktop, centred on phones */}
        <div className="flex flex-1 items-center justify-center lg:justify-start">
          <motion.div
            initial={{ opacity: 0, y: 26 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: AX_EASE, delay: 0.08 }}
            className="w-full max-w-[420px] py-10 lg:ml-4"
          >
            <form
              onSubmit={submit}
              className="ax-glass-strong ax-edge-light ax-glow-md flex flex-col gap-5 rounded-[24px] p-7 md:p-8"
            >
              <div className="flex flex-col gap-3">
                <span className="inline-flex items-center gap-2 text-[var(--ax-ink-muted)]">
                  <Icon name="lock" className="size-3.5" strokeWidth={2.1} />
                  <span className="ax-eyebrow">Private Access</span>
                </span>
                <h1 className="ax-display text-[32px] leading-none">Admin Login</h1>
                <p className="text-[13.5px] leading-relaxed text-[var(--ax-ink-muted)]">
                  Secure access to the {BRAND} management platform.
                </p>
              </div>

              <label className="flex flex-col gap-2">
                <span className="text-[12.5px] font-medium text-[var(--ax-ink-muted)]">
                  Email Address
                </span>
                <div className="relative">
                  <Icon
                    name="mail"
                    className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-[var(--ax-ink-dim)]"
                    strokeWidth={1.9}
                  />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@auravex.com"
                    autoComplete="username"
                    required
                    className={cn(fieldClass, "pl-11")}
                  />
                </div>
              </label>

              <label className="flex flex-col gap-2">
                <span className="text-[12.5px] font-medium text-[var(--ax-ink-muted)]">
                  Password
                </span>
                <div className="relative">
                  <Icon
                    name="lock"
                    className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-[var(--ax-ink-dim)]"
                    strokeWidth={1.9}
                  />
                  <input
                    type={reveal ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••"
                    autoComplete="current-password"
                    required
                    className={cn(fieldClass, "pl-11 pr-11")}
                  />
                  <button
                    type="button"
                    onClick={() => setReveal((v) => !v)}
                    aria-label={reveal ? "Hide password" : "Show password"}
                    className="ax-focus absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-[var(--ax-ink-dim)] transition-colors hover:text-[var(--ax-ink)]"
                  >
                    <Icon name={reveal ? "eye-off" : "eye"} className="size-4" strokeWidth={1.9} />
                  </button>
                </div>
              </label>

              {/* Keep me signed in · Forgot password */}
              <div className="flex items-center justify-between gap-4">
                <button
                  type="button"
                  role="checkbox"
                  aria-checked={remember}
                  onClick={() => setRemember((v) => !v)}
                  className="ax-focus group flex items-center gap-2.5 rounded-lg text-[12.5px] text-[var(--ax-ink-muted)] transition-colors hover:text-[var(--ax-ink)]"
                >
                  <span
                    className={cn(
                      "grid size-[18px] shrink-0 place-items-center rounded-[6px] border transition-all duration-300",
                      remember
                        ? "border-transparent bg-[linear-gradient(120deg,var(--ax-accent),var(--ax-violet))] text-white"
                        : "border-[var(--ax-line-strong)] text-transparent",
                    )}
                  >
                    <Icon name="check" className="size-3" strokeWidth={3} />
                  </span>
                  Keep me signed in
                </button>

                <span
                  className="cursor-help text-[12.5px] font-medium text-[var(--ax-ink-dim)]"
                  title="Set ADMIN_EMAIL, ADMIN_PASSWORD and ADMIN_RESET=1 in .env and restart the server; the account is reset on start."
                >
                  Forgot it? Reset via .env
                </span>
              </div>

              {error && (
                <motion.p
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-2 rounded-lg border border-[var(--ax-danger)]/30 bg-[var(--ax-danger)]/10 px-3 py-2.5 text-[12.5px] text-[var(--ax-danger)]"
                >
                  <Icon name="x" className="size-3.5 shrink-0" strokeWidth={2.6} />
                  {error}
                </motion.p>
              )}

              <Button
                type="submit"
                size="lg"
                disabled={busy}
                className="w-full"
                magnetic={false}
                icon={busy ? undefined : "arrow-right"}
              >
                {busy ? (
                  <span className="flex items-center gap-2.5">
                    <span className="size-3.5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    Verifying
                  </span>
                ) : (
                  "Sign In"
                )}
              </Button>

              {/* OR divider */}
              <div className="flex items-center gap-4">
                <span className="h-px flex-1 bg-[var(--ax-line)]" />
                <span className="text-[11px] font-medium uppercase tracking-[0.18em] text-[var(--ax-ink-dim)]">
                  or
                </span>
                <span className="h-px flex-1 bg-[var(--ax-line)]" />
              </div>

              <button
                type="button"
                disabled
                title="Single sign-on needs an identity provider"
                className="ax-focus flex h-[52px] w-full items-center justify-center gap-2.5 rounded-full border border-[var(--ax-line-strong)] text-[14.5px] font-semibold text-[var(--ax-ink)] transition-colors duration-300 hover:bg-[rgba(var(--ax-glow),0.10)] disabled:cursor-not-allowed disabled:opacity-55"
              >
                <Icon name="shield" className="size-4" strokeWidth={2.1} />
                Sign in with SSO
              </button>

              {/* Shown only while the seeded demo password is still in force; it
                  disappears the moment the password is changed in Settings. */}
              {demo && (
              <button
                type="button"
                onClick={useDemoCredentials}
                className="ax-focus flex items-start gap-3 rounded-xl border border-[var(--ax-line)] bg-[rgba(var(--ax-glow),0.05)] p-3.5 text-left transition-colors duration-300 hover:border-[var(--ax-line-strong)]"
              >
                <Icon
                  name="sparkles"
                  className="mt-0.5 size-4 shrink-0 text-[var(--ax-accent-soft)]"
                  strokeWidth={1.9}
                />
                <span className="flex flex-col gap-1">
                  <span className="text-[12.5px] font-semibold text-[var(--ax-ink)]">
                    Use demo credentials
                  </span>
                  <span className="font-mono text-[11px] leading-relaxed text-[var(--ax-ink-dim)]">
                    {DEMO_CREDENTIALS.email} · {DEMO_CREDENTIALS.password}
                  </span>
                </span>
              </button>
              )}
            </form>
          </motion.div>
        </div>

        {/* Footer rail */}
        <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-[12px] text-[var(--ax-ink-dim)] lg:justify-start">
          <span>
            © {new Date().getFullYear()} {BRAND}. All rights reserved.
          </span>
          <span className="size-1 rounded-full bg-[var(--ax-line-strong)]" />
          <Link
            href="/"
            className="ax-focus inline-flex items-center gap-1.5 transition-colors hover:text-[var(--ax-ink-muted)]"
          >
            <Icon name="arrow-left" className="size-3.5" strokeWidth={2.2} />
            Back to site
          </Link>
        </div>
      </div>
    </main>
  );
}
