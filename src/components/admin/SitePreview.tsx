"use client";

import { useEffect, useRef, useState } from "react";
import { Icon } from "@/components/ui/Icon";
import { Select } from "@/components/ui/Select";
import { cn } from "@/lib/utils";

const PAGES = [
  { value: "/", label: "Home" },
  { value: "/products", label: "Products" },
  { value: "/products/real-estate-os", label: "Product detail" },
  { value: "/solutions", label: "Solutions" },
  { value: "/industries", label: "Industries" },
  { value: "/our-work", label: "Our Work" },
  { value: "/about", label: "About" },
  { value: "/contact", label: "Contact" },
];

const DEVICES = [
  { id: "desktop", label: "Desktop", width: 1440, icon: "grid" },
  { id: "tablet", label: "Tablet", width: 900, icon: "image" },
  { id: "phone", label: "Phone", width: 420, icon: "file" },
] as const;

/**
 * The live public site, inside the portal.
 *
 * A real iframe, not a mock-up — it is the same build every visitor gets, on
 * the same origin, reading the same store. So when a colour or a line of copy
 * changes here, the frame repaints with it: `localStorage` writes raise a
 * `storage` event in every other document of the origin, and the provider
 * inside the frame listens for it.
 *
 * That means what you see is genuinely what is shipping, not an approximation
 * that can drift away from the real thing.
 */
export function SitePreview({
  className,
  height = 520,
  defaultPath = "/",
}: {
  className?: string;
  height?: number;
  /** Page to open first. Remount with `key` to change it from outside. */
  defaultPath?: string;
}) {
  const [path, setPath] = useState(defaultPath);
  const [device, setDevice] = useState<(typeof DEVICES)[number]["id"]>("desktop");
  const [nonce, setNonce] = useState(0);
  const wrapRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.5);

  const width = DEVICES.find((d) => d.id === device)?.width ?? 1440;

  // Fit the chosen viewport into whatever room the panel has.
  useEffect(() => {
    const measure = () => {
      const available = wrapRef.current?.clientWidth ?? 0;
      if (available) setScale(Math.min(1, available / width));
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [width]);

  return (
    <div className={cn("flex flex-col gap-3", className)}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Select
            label="Page to preview"
            value={path}
            onChange={setPath}
            options={PAGES}
            size="sm"
            className="w-[168px]"
          />

          <div className="flex rounded-full border border-[var(--ax-line)] p-0.5">
            {DEVICES.map((d) => (
              <button
                key={d.id}
                type="button"
                onClick={() => setDevice(d.id)}
                title={d.label}
                aria-label={d.label}
                className={cn(
                  "ax-focus grid size-7 place-items-center rounded-full transition-colors duration-200",
                  d.id === device
                    ? "bg-[linear-gradient(110deg,var(--ax-accent),var(--ax-violet))] text-white"
                    : "text-[var(--ax-ink-muted)] hover:text-[var(--ax-ink)]",
                )}
              >
                <Icon name={d.icon} className="size-3.5" strokeWidth={2} />
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="font-mono text-[10.5px] text-[var(--ax-ink-dim)]">
            {width}px · {Math.round(scale * 100)}%
          </span>
          <button
            type="button"
            onClick={() => setNonce((n) => n + 1)}
            title="Reload the preview"
            aria-label="Reload the preview"
            className="ax-focus grid size-7 place-items-center rounded-lg text-[var(--ax-ink-muted)] transition-colors hover:bg-[rgba(var(--ax-glow),0.10)] hover:text-[var(--ax-ink)]"
          >
            <Icon name="activity" className="size-3.5" strokeWidth={2} />
          </button>
          <a
            href={path}
            target="_blank"
            rel="noreferrer"
            title="Open in a new tab"
            className="ax-focus grid size-7 place-items-center rounded-lg text-[var(--ax-ink-muted)] transition-colors hover:bg-[rgba(var(--ax-glow),0.10)] hover:text-[var(--ax-ink)]"
          >
            <Icon name="external-link" className="size-3.5" strokeWidth={2} />
          </a>
        </div>
      </div>

      {/* Browser frame */}
      <div className="overflow-hidden rounded-xl border border-[var(--ax-line-strong)] bg-[var(--ax-bg)]">
        <div className="flex items-center gap-2 border-b border-[var(--ax-line)] bg-[rgba(var(--ax-glow),0.06)] px-3 py-2">
          <span className="flex gap-1.5">
            {["var(--ax-danger)", "var(--ax-warning)", "var(--ax-success)"].map((c) => (
              <span key={c} className="size-2 rounded-full opacity-70" style={{ background: c }} />
            ))}
          </span>
          <span className="truncate font-mono text-[10px] text-[var(--ax-ink-dim)]">
            auravex.com{path === "/" ? "" : path}
          </span>
          <span className="ml-auto flex items-center gap-1.5 text-[10px] text-[var(--ax-success)]">
            <span className="relative flex size-1.5">
              <span className="absolute inline-flex size-full animate-[pulse-ring_2.6s_ease-out_infinite] rounded-full bg-current" />
              <span className="relative inline-flex size-1.5 rounded-full bg-current" />
            </span>
            Live
          </span>
        </div>

        <div ref={wrapRef} className="relative overflow-hidden" style={{ height }}>
          <iframe
            key={`${path}-${nonce}`}
            src={path}
            title="Live preview of the public site"
            className="absolute left-0 top-0 origin-top-left border-0 bg-[var(--ax-bg)]"
            style={{
              width,
              height: height / scale,
              transform: `scale(${scale})`,
            }}
          />
        </div>
      </div>

      <p className="text-[11px] leading-relaxed text-[var(--ax-ink-dim)]">
        This is the real site, not a mock-up. Colours and copy you change repaint it as you
        type; a new image or a background change may need the reload button.
      </p>
    </div>
  );
}
