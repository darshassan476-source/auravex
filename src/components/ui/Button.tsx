"use client";

import Link from "next/link";
import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Icon } from "./Icon";
import { Magnetic } from "../fx/Magnetic";

type Variant = "primary" | "secondary" | "ghost" | "outline" | "danger";
type Size = "sm" | "md" | "lg";

const VARIANTS: Record<Variant, string> = {
  primary:
    "text-white border-transparent bg-[linear-gradient(110deg,var(--ax-accent),var(--ax-violet))] " +
    "shadow-[0_10px_40px_-12px_rgba(var(--ax-glow),0.85)] hover:shadow-[0_16px_50px_-10px_rgba(var(--ax-glow),1)]",
  secondary:
    "ax-glass text-[var(--ax-ink)] hover:border-[var(--ax-line-strong)] " +
    "hover:bg-[rgba(var(--ax-glow),0.10)]",
  outline:
    "border border-[var(--ax-line-strong)] text-[var(--ax-ink)] bg-transparent " +
    "hover:bg-[rgba(var(--ax-glow),0.10)]",
  ghost:
    "border-transparent text-[var(--ax-ink-muted)] hover:text-[var(--ax-ink)] " +
    "hover:bg-[rgba(var(--ax-glow),0.08)]",
  danger:
    "border-transparent text-white bg-[var(--ax-danger)]/90 hover:bg-[var(--ax-danger)]",
};

const SIZES: Record<Size, string> = {
  sm: "h-9 px-4 text-[13px] gap-1.5 rounded-full",
  md: "h-11 px-6 text-sm gap-2 rounded-full",
  lg: "h-[54px] px-8 text-[15px] gap-2.5 rounded-full",
};

interface BaseProps {
  variant?: Variant;
  size?: Size;
  icon?: string;
  iconPosition?: "left" | "right";
  magnetic?: boolean;
  className?: string;
  children?: ReactNode;
}

export interface ButtonProps
  extends BaseProps,
    Omit<ButtonHTMLAttributes<HTMLButtonElement>, "color"> {
  href?: string;
  external?: boolean;
}

const BASE =
  "relative inline-flex items-center justify-center font-semibold tracking-[-0.01em] " +
  "border transition-all duration-300 ax-focus select-none group/btn overflow-hidden " +
  "disabled:opacity-45 disabled:pointer-events-none active:scale-[0.98]";

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    variant = "primary",
    size = "md",
    icon,
    iconPosition = "right",
    magnetic = true,
    className,
    children,
    href,
    external,
    ...rest
  },
  ref,
) {
  const classes = cn(BASE, VARIANTS[variant], SIZES[size], className);

  const inner = (
    <>
      {/* Sheen sweep — reads as light travelling across a glass surface */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 -translate-x-full bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.22),transparent)] transition-transform duration-700 group-hover/btn:translate-x-full"
      />
      {icon && iconPosition === "left" && (
        <Icon name={icon} className="relative size-4 shrink-0" strokeWidth={2.2} />
      )}
      <span className="relative">{children}</span>
      {icon && iconPosition === "right" && (
        <Icon
          name={icon}
          className="relative size-4 shrink-0 transition-transform duration-300 group-hover/btn:translate-x-0.5"
          strokeWidth={2.2}
        />
      )}
    </>
  );

  const node = href ? (
    external ? (
      <a href={href} target="_blank" rel="noopener noreferrer" className={classes}>
        {inner}
      </a>
    ) : (
      <Link href={href} className={classes}>
        {inner}
      </Link>
    )
  ) : (
    <button ref={ref} className={classes} {...rest}>
      {inner}
    </button>
  );

  return magnetic ? <Magnetic>{node}</Magnetic> : node;
});
