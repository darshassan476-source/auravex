"use client";

import { useEffect, useId, useRef, useState } from "react";
import { Icon } from "./Icon";
import { cn } from "@/lib/utils";

export interface SelectOption<T extends string = string> {
  value: T;
  label: string;
  /** Optional colour dot, for statuses. */
  tone?: string;
}

/**
 * A picker that draws its own menu.
 *
 * Native `<select>` menus are painted by the operating system, which means two
 * things we cannot accept: the option text ignores the theme (dark on dark, so
 * it reads as empty), and the menu escapes the panel it belongs to. This keeps
 * the list inside the page, styled with the same tokens as everything else.
 */
export function Select<T extends string = string>({
  value,
  onChange,
  options,
  label,
  className,
  menuClassName,
  size = "md",
}: {
  value: T;
  onChange: (value: T) => void;
  options: SelectOption<T>[];
  /** Accessible name; also used as the title. */
  label: string;
  className?: string;
  menuClassName?: string;
  size?: "sm" | "md";
}) {
  const uid = useId().replace(/:/g, "");
  const wrapRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  /** Flip the menu upward when there is no room beneath the trigger. */
  const [up, setUp] = useState(false);

  const selected = options.find((o) => o.value === value) ?? options[0];

  useEffect(() => {
    if (!open) return;

    const onDown = (event: MouseEvent) => {
      if (!wrapRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };

    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  function toggle() {
    const rect = wrapRef.current?.getBoundingClientRect();
    if (rect) {
      const needed = Math.min(options.length * 38 + 12, 260);
      setUp(rect.bottom + needed > window.innerHeight && rect.top > needed);
    }
    setActive(Math.max(0, options.findIndex((o) => o.value === value)));
    setOpen((v) => !v);
  }

  function onKeyDown(event: React.KeyboardEvent<HTMLButtonElement>) {
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      if (!open) {
        toggle();
        return;
      }
      const delta = event.key === "ArrowDown" ? 1 : -1;
      setActive((i) => (i + delta + options.length) % options.length);
    } else if (event.key === "Enter" || event.key === " ") {
      if (open) {
        event.preventDefault();
        onChange(options[active].value);
        setOpen(false);
      }
    }
  }

  const pad = size === "sm" ? "px-2.5 py-1.5 text-[11.5px]" : "px-3 py-2 text-[12.5px]";

  return (
    <div ref={wrapRef} className={cn("relative", className)}>
      <button
        type="button"
        onClick={toggle}
        onKeyDown={onKeyDown}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={label}
        title={label}
        className={cn(
          "ax-focus flex w-full items-center justify-between gap-2 rounded-lg border",
          "border-[var(--ax-line)] bg-[rgba(var(--ax-glow),0.05)] text-left text-[var(--ax-ink)]",
          "transition-colors duration-200 hover:border-[var(--ax-line-strong)]",
          pad,
        )}
      >
        <span className="flex min-w-0 items-center gap-2">
          {selected?.tone && (
            <span
              className="size-2 shrink-0 rounded-full"
              style={{ background: selected.tone }}
            />
          )}
          <span className="truncate">{selected?.label}</span>
        </span>
        <Icon
          name="chevron-down"
          className={cn(
            "size-3.5 shrink-0 text-[var(--ax-ink-dim)] transition-transform duration-200",
            open && "rotate-180",
          )}
          strokeWidth={2}
        />
      </button>

      {open && (
        <ul
          id={`sel-${uid}`}
          role="listbox"
          className={cn(
            "absolute left-0 z-40 max-h-64 min-w-full overflow-y-auto rounded-xl border p-1.5",
            "border-[var(--ax-line-strong)] bg-[var(--ax-bg-elevated)] shadow-2xl",
            up ? "bottom-[calc(100%+6px)]" : "top-[calc(100%+6px)]",
            menuClassName,
          )}
        >
          {options.map((option, i) => (
            <li key={option.value} role="option" aria-selected={option.value === value}>
              <button
                type="button"
                onMouseEnter={() => setActive(i)}
                onClick={() => {
                  onChange(option.value);
                  setOpen(false);
                }}
                className={cn(
                  "flex w-full items-center gap-2 whitespace-nowrap rounded-lg px-2.5 py-2 text-left text-[12.5px] transition-colors duration-150",
                  i === active
                    ? "bg-[rgba(var(--ax-glow),0.14)] text-[var(--ax-ink)]"
                    : "text-[var(--ax-ink-muted)]",
                )}
              >
                {option.tone && (
                  <span
                    className="size-2 shrink-0 rounded-full"
                    style={{ background: option.tone }}
                  />
                )}
                <span className="flex-1">{option.label}</span>
                {option.value === value && (
                  <Icon
                    name="check"
                    className="size-3.5 shrink-0 text-[var(--ax-accent)]"
                    strokeWidth={2.6}
                  />
                )}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
