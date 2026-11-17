"use client";

import type { ReactNode } from "react";
import { useCms } from "@/cms/CmsProvider";
import { useCatalogue } from "@/cms/useProduct";
import { Select } from "@/components/ui/Select";
import { Toggle } from "@/components/ui/Toggle";
import { cn } from "@/lib/utils";

/**
 * Form pieces shared by the portal's record screens (customers, adoption,
 * pricing, updates, enquiries). Styled exactly like the product editor's
 * fields so the new screens read as part of the same portal.
 */

export const FIELD =
  "ax-focus w-full rounded-xl border border-[var(--ax-line)] bg-[rgba(var(--ax-glow),0.05)] " +
  "px-3.5 py-2.5 text-[13px] text-[var(--ax-ink)] outline-none transition-colors duration-300 " +
  "placeholder:text-[var(--ax-ink-dim)] focus:border-[var(--ax-line-strong)]";

/** A record id the server accepts: letters, digits, `-` and `_`, at most 64. */
export function newId(prefix: string) {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

/** "AI document capture" → "ai-document-capture". */
export function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

export const splitList = (value: string, separator: RegExp = /[,\n]/) =>
  value
    .split(separator)
    .map((s) => s.trim())
    .filter(Boolean);

export function Field({
  label,
  hint,
  error,
  children,
  className,
}: {
  label: string;
  hint?: string;
  error?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <label className={cn("flex flex-col gap-1.5", className)}>
      <span className="flex flex-wrap items-baseline gap-x-2">
        <span className="text-[12.5px] font-medium text-[var(--ax-ink-muted)]">{label}</span>
        {hint && <span className="text-[11px] text-[var(--ax-ink-dim)]">{hint}</span>}
      </span>
      {children}
      {error && <span className="text-[11.5px] text-[var(--ax-danger)]">{error}</span>}
    </label>
  );
}

/** A switch with a title and a line of explanation beside it. */
export function SwitchRow({
  checked,
  onChange,
  title,
  body,
}: {
  checked: boolean;
  onChange: (next: boolean) => void;
  title: string;
  body?: string;
}) {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-[var(--ax-line)] p-3.5">
      <Toggle checked={checked} onChange={onChange} label={title} />
      <span className="flex flex-col gap-0.5">
        <span className="text-[13px] font-semibold text-[var(--ax-ink)]">{title}</span>
        {body && <span className="text-[11.5px] leading-relaxed text-[var(--ax-ink-dim)]">{body}</span>}
      </span>
    </div>
  );
}

/** Every product in the catalogue, hidden ones included, as select options. */
export function useProductOptions() {
  const catalogue = useCatalogue({ includeHidden: true });
  return catalogue.map((p) => ({ value: p.slug, label: p.name }));
}

export function useProductName() {
  const catalogue = useCatalogue({ includeHidden: true });
  return (slug?: string) => (slug ? catalogue.find((p) => p.slug === slug)?.name ?? slug : "");
}

/** Pick an image already in the media library (upload new ones in Media Library). */
export function MediaPicker({
  label,
  value,
  onChange,
}: {
  label: string;
  value?: string;
  onChange: (id: string | undefined) => void;
}) {
  const { state } = useCms();
  const images = state.media.filter((m) => !m.mime || m.mime.startsWith("image/"));
  const current = images.find((m) => m.id === value);
  return (
    <div className="flex items-center gap-3">
      <span className="grid size-12 shrink-0 place-items-center overflow-hidden rounded-lg border border-[var(--ax-line)] bg-[rgba(var(--ax-glow),0.05)]">
        {current ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={current.src} alt="" className="size-full object-contain" />
        ) : (
          <span className="text-[10px] text-[var(--ax-ink-dim)]">None</span>
        )}
      </span>
      <Select
        label={label}
        className="min-w-0 flex-1"
        value={value ?? ""}
        onChange={(v) => onChange(v || undefined)}
        options={[
          { value: "", label: images.length ? "No image" : "No images in the library yet" },
          ...images.map((m) => ({ value: m.id, label: m.name })),
        ]}
      />
    </div>
  );
}

/** A small status chip. */
export function Chip({ tone, children }: { tone: "success" | "warning" | "muted" | "accent" | "danger"; children: ReactNode }) {
  const tones = {
    success: "text-[var(--ax-success)] border-[var(--ax-success)]/30 bg-[var(--ax-success)]/10",
    warning: "text-[var(--ax-warning)] border-[var(--ax-warning)]/30 bg-[var(--ax-warning)]/10",
    danger: "text-[var(--ax-danger)] border-[var(--ax-danger)]/30 bg-[var(--ax-danger)]/10",
    accent: "text-[var(--ax-accent-soft)] border-[var(--ax-accent)]/30 bg-[var(--ax-accent)]/10",
    muted: "text-[var(--ax-ink-muted)] border-[var(--ax-line-strong)] bg-[rgba(var(--ax-glow),0.06)]",
  } as const;
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10.5px] font-semibold uppercase tracking-[0.08em]",
        tones[tone],
      )}
    >
      {children}
    </span>
  );
}

/** The error/notice line under a form. */
export function FormMessage({ error, notice }: { error?: string | null; notice?: string | null }) {
  if (error) return <p className="text-[12.5px] text-[var(--ax-danger)]">{error}</p>;
  if (notice) return <p className="text-[12.5px] text-[var(--ax-success)]">{notice}</p>;
  return null;
}

/** Small text action used for Edit / Delete in record lists. */
export function RowAction({
  onClick,
  children,
  danger,
}: {
  onClick: () => void;
  children: ReactNode;
  danger?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "ax-focus rounded-lg px-2.5 py-1.5 text-[12px] font-medium transition-colors hover:bg-[rgba(var(--ax-glow),0.10)]",
        danger ? "text-[var(--ax-danger)]" : "text-[var(--ax-ink-muted)] hover:text-[var(--ax-ink)]",
      )}
    >
      {children}
    </button>
  );
}
