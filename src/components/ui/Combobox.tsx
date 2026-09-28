"use client";

import { useEffect, useId, useRef, useState } from "react";
import { Icon } from "./Icon";
import { cn } from "@/lib/utils";

/**
 * A select that also takes a typed answer.
 *
 * Two reasons this is not a native `<select>`:
 *
 * 1. A native dropdown's option list is painted by the operating system, not
 *    the page. On a dark theme that produces dark text on a dark menu — the
 *    options are there but unreadable. This draws its own list, so it is
 *    legible in every theme.
 * 2. Real answers rarely fit a fixed list. Anything typed that does not match
 *    an option is kept verbatim.
 */
export function Combobox({
  value,
  onChange,
  options,
  placeholder,
  invalid,
  allowCustom = true,
  id,
}: {
  value: string;
  onChange: (value: string) => void;
  options: string[];
  placeholder?: string;
  invalid?: boolean;
  /** When false, behaves as a strict picker. */
  allowCustom?: boolean;
  id?: string;
}) {
  const uid = useId();
  const listId = id ?? `cb-${uid.replace(/:/g, "")}`;
  const wrapRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(value);
  const [active, setActive] = useState(0);

  // Keep the visible text in step when the value is changed from outside.
  useEffect(() => setDraft(value), [value]);

  useEffect(() => {
    if (!open) return;
    const onDown = (event: MouseEvent) => {
      if (!wrapRef.current?.contains(event.target as Node)) close();
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, draft]);

  const typed = draft.trim();
  const matches = typed
    ? options.filter((o) => o.toLowerCase().includes(typed.toLowerCase()))
    : options;

  /** Offer to keep what was typed when it is not one of the options. */
  const custom =
    allowCustom &&
    typed.length > 0 &&
    !options.some((o) => o.toLowerCase() === typed.toLowerCase());

  const rows = custom ? [...matches, typed] : matches;

  function close() {
    setOpen(false);
    // Commit whatever is in the box: a typed answer is a real answer.
    if (allowCustom) onChange(draft.trim());
    else setDraft(value);
  }

  function choose(next: string) {
    setDraft(next);
    onChange(next);
    setOpen(false);
    inputRef.current?.blur();
  }

  function onKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      if (!open) {
        setOpen(true);
        return;
      }
      const delta = event.key === "ArrowDown" ? 1 : -1;
      setActive((i) => (i + delta + rows.length) % Math.max(rows.length, 1));
    } else if (event.key === "Enter") {
      if (open && rows[active] !== undefined) {
        event.preventDefault();
        choose(rows[active]);
      }
    } else if (event.key === "Escape") {
      setOpen(false);
      setDraft(value);
    }
  }

  const field = cn(
    "ax-focus w-full rounded-xl border bg-[rgba(var(--ax-glow),0.04)] px-4 py-3 pr-10 text-[14px]",
    "text-[var(--ax-ink)] outline-none transition-colors duration-300",
    "placeholder:text-[var(--ax-ink-dim)]",
    invalid
      ? "border-[var(--ax-danger)]/60"
      : "border-[var(--ax-line)] focus:border-[var(--ax-line-strong)]",
  );

  return (
    <div ref={wrapRef} className="relative">
      <input
        ref={inputRef}
        role="combobox"
        aria-expanded={open}
        aria-controls={listId}
        aria-autocomplete="list"
        value={draft}
        placeholder={placeholder}
        onChange={(e) => {
          setDraft(e.target.value);
          setActive(0);
          setOpen(true);
          // Commit as they type. Waiting for blur meant a value typed and then
          // submitted in the same gesture could be lost.
          if (allowCustom) onChange(e.target.value);
        }}
        onFocus={() => setOpen(true)}
        onKeyDown={onKeyDown}
        className={field}
      />

      <button
        type="button"
        tabIndex={-1}
        aria-label={open ? "Close options" : "Show options"}
        onClick={() => {
          setOpen((v) => !v);
          inputRef.current?.focus();
        }}
        className="absolute right-3 top-1/2 grid size-7 -translate-y-1/2 place-items-center rounded-lg text-[var(--ax-ink-dim)] transition-colors hover:text-[var(--ax-ink)]"
      >
        <Icon
          name="chevron-down"
          className={cn("size-4 transition-transform duration-300", open && "rotate-180")}
          strokeWidth={2}
        />
      </button>

      {open && rows.length > 0 && (
        <ul
          id={listId}
          role="listbox"
          className={cn(
            "absolute left-0 right-0 top-[calc(100%+6px)] z-30 max-h-60 overflow-y-auto",
            "ax-glass-strong rounded-xl border border-[var(--ax-line-strong)] p-1.5 shadow-xl",
          )}
        >
          {rows.map((option, i) => {
            const isCustom = custom && i === rows.length - 1;
            return (
              <li key={`${option}-${i}`} role="option" aria-selected={option === value}>
                <button
                  type="button"
                  onMouseEnter={() => setActive(i)}
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => choose(option)}
                  className={cn(
                    "flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-left text-[13.5px] transition-colors duration-150",
                    i === active
                      ? "bg-[rgba(var(--ax-glow),0.14)] text-[var(--ax-ink)]"
                      : "text-[var(--ax-ink-muted)]",
                  )}
                >
                  {isCustom && (
                    <Icon
                      name="plus"
                      className="size-3.5 shrink-0 text-[var(--ax-accent-soft)]"
                      strokeWidth={2.4}
                    />
                  )}
                  <span className="flex-1 truncate">{option}</span>
                  {isCustom && (
                    <span className="shrink-0 text-[11px] text-[var(--ax-ink-dim)]">
                      use this
                    </span>
                  )}
                  {!isCustom && option === value && (
                    <Icon
                      name="check"
                      className="size-3.5 shrink-0 text-[var(--ax-accent)]"
                      strokeWidth={2.6}
                    />
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
