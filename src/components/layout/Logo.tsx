"use client";

import Link from "next/link";
import { useCms, useText } from "@/cms/CmsProvider";
import { cn } from "@/lib/utils";

type Size = "sm" | "md" | "lg";

const MARK_SIZE: Record<Size, string> = {
  sm: "size-7",
  md: "size-9",
  lg: "size-12",
};

const WORD_SIZE: Record<Size, string> = {
  sm: "text-[15px] tracking-[0.24em]",
  md: "text-[19px] tracking-[0.26em]",
  lg: "text-[26px] tracking-[0.28em]",
};

const TAG_SIZE: Record<Size, string> = {
  sm: "text-[5px] tracking-[0.20em]",
  md: "text-[6px] tracking-[0.22em]",
  lg: "text-[8px] tracking-[0.24em]",
};

/** The AURAVEX "A" — two angled strokes with an offset counter-stroke. */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" fill="none" className={className} aria-hidden>
      <defs>
        <linearGradient id="ax-logo-a" x1="4" y1="36" x2="34" y2="6" gradientUnits="userSpaceOnUse">
          <stop stopColor="var(--ax-accent)" />
          <stop offset="1" stopColor="var(--ax-accent-soft)" />
        </linearGradient>
        <linearGradient id="ax-logo-b" x1="18" y1="38" x2="38" y2="10" gradientUnits="userSpaceOnUse">
          <stop stopColor="var(--ax-violet)" />
          <stop offset="1" stopColor="var(--ax-accent)" />
        </linearGradient>
      </defs>
      {/* Left leg + apex */}
      <path
        d="M19.4 3.2 4.1 35.4a1.4 1.4 0 0 0 1.27 2h4.44a1.4 1.4 0 0 0 1.27-.8L21.94 13.9a1.4 1.4 0 0 1 2.54 0l1.1 2.32 2.83-5.95-6.47-7.06a1.4 1.4 0 0 0-2.54 0Z"
        fill="url(#ax-logo-a)"
      />
      {/* Right leg */}
      <path
        d="M27.3 18.4 35.9 36.5a1.4 1.4 0 0 1-1.27 2h-4.5a1.4 1.4 0 0 1-1.27-.81l-5.2-11.03 3.64-8.26Z"
        fill="url(#ax-logo-b)"
        opacity="0.92"
      />
      {/* Crossbar highlight */}
      <path d="M15.6 25.6h9.6l1.5 3.2h-12.6l1.5-3.2Z" fill="var(--ax-accent-soft)" opacity="0.55" />
    </svg>
  );
}

interface LogoProps {
  size?: Size;
  /** Hides the wordmark, leaving only the mark. */
  markOnly?: boolean;
  href?: string | null;
  className?: string;
  /** Overrides the strapline, for contexts like "Admin Portal". */
  label?: string;
}

/**
 * The wordmark.
 *
 * The mark, the name and the strapline all come from the store, so a logo
 * uploaded in Appearance and a name typed in Site Content both show up here
 * without touching this file.
 */
export function Logo({
  size = "md",
  markOnly = false,
  href = "/",
  className,
  label,
}: LogoProps) {
  const { state } = useCms();
  const name = useText("site.name");
  const tagline = useText("site.tagline");
  const uploaded = state.logoId
    ? state.media.find((m) => m.id === state.logoId)?.src
    : undefined;

  const content = (
    <span className={cn("group inline-flex items-center gap-2.5", className)}>
      {uploaded ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={uploaded}
          alt=""
          className={cn(
            MARK_SIZE[size],
            "shrink-0 rounded-md object-contain transition-transform duration-500 group-hover:scale-105",
          )}
        />
      ) : (
        <LogoMark
          className={cn(
            MARK_SIZE[size],
            "shrink-0 transition-transform duration-500 group-hover:scale-105",
          )}
        />
      )}
      {!markOnly && (
        <span className="flex flex-col justify-center leading-none">
          <span className={cn("font-semibold text-[var(--ax-ink)]", WORD_SIZE[size])}>
            {name}
          </span>
          <span
            className={cn(
              "mt-[3px] font-medium uppercase text-[var(--ax-ink-dim)]",
              TAG_SIZE[size],
            )}
          >
            {label ?? tagline}
          </span>
        </span>
      )}
    </span>
  );

  if (!href) return content;

  return (
    <Link href={href} aria-label={`${name} home`} className="ax-focus">
      {content}
    </Link>
  );
}
