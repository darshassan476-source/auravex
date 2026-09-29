"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { useText } from "@/cms/CmsProvider";
import { useTextList } from "@/cms/useTextList";
import { SEARCH_PAGES } from "@/data/chromeCopy";
import { useCatalogue } from "@/cms/useProduct";
import { useIndustries, useSolutions } from "@/cms/useSolutions";
import { CASE_STUDIES } from "@/data/caseStudies";
import { cn } from "@/lib/utils";
import { AX_EASE } from "../fx/Reveal";
import { Icon } from "../ui/Icon";

interface Entry {
  label: string;
  group: string;
  href: string;
  description: string;
  icon: string;
}

export function SearchOverlay({ open, onClose }: { open: boolean; onClose: () => void }) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");
  const [cursor, setCursor] = useState(0);

  const groupProducts = useText("search.group.products");
  const groupSolutions = useText("search.group.solutions");
  const groupIndustries = useText("search.group.industries");
  const groupCaseStudies = useText("search.group.caseStudies");
  const groupPages = useText("search.group.pages");
  const pages = useTextList("search.page", SEARCH_PAGES.length, ["label", "description"] as const);
  const placeholder = useText("search.placeholder");
  const escLabel = useText("search.esc");
  const noResults = useText("search.noResults");
  const hintNavigate = useText("search.hint.navigate");
  const hintOpen = useText("search.hint.open");
  const footerLabel = useText("search.footer");

  // Live lists: products added or renamed in the portal, and edited solution
  // and industry copy, are what search finds.
  const products = useCatalogue();
  const solutions = useSolutions();
  const industries = useIndustries();

  const index = useMemo<Entry[]>(
    () => [
      ...products.map((p) => ({
        label: p.name,
        group: groupProducts,
        href: `/products/${p.slug}`,
        description: p.summary,
        icon: p.icon,
      })),
      ...solutions.map((s) => ({
        label: s.name,
        group: groupSolutions,
        href: `/solutions#${s.slug}`,
        description: s.description,
        icon: s.icon,
      })),
      ...industries.map((i) => ({
        label: i.name,
        group: groupIndustries,
        href: `/industries#${i.slug}`,
        description: i.description,
        icon: i.icon,
      })),
      ...CASE_STUDIES.map((c) => ({
        label: c.title,
        group: groupCaseStudies,
        href: `/our-work/${c.slug}`,
        description: c.summary,
        icon: "file",
      })),
      ...SEARCH_PAGES.map((page, i) => ({
        label: pages[i].label,
        group: groupPages,
        href: page.href,
        description: pages[i].description,
        icon: page.icon,
      })),
    ],
    [products, solutions, industries, groupProducts, groupSolutions, groupIndustries, groupCaseStudies, groupPages, pages],
  );

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return index.slice(0, 7);
    return index
      .filter(
        (e) =>
          e.label.toLowerCase().includes(q) ||
          e.description.toLowerCase().includes(q) ||
          e.group.toLowerCase().includes(q),
      )
      .slice(0, 8);
  }, [query, index]);

  useEffect(() => {
    if (open) {
      setQuery("");
      setCursor(0);
      // Wait for the enter transition before focusing.
      const t = setTimeout(() => inputRef.current?.focus(), 120);
      document.body.style.overflow = "hidden";
      return () => {
        clearTimeout(t);
        document.body.style.overflow = "";
      };
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
      if (event.key === "ArrowDown") {
        event.preventDefault();
        setCursor((c) => (c + 1) % Math.max(results.length, 1));
      }
      if (event.key === "ArrowUp") {
        event.preventDefault();
        setCursor((c) => (c - 1 + results.length) % Math.max(results.length, 1));
      }
      if (event.key === "Enter" && results[cursor]) {
        router.push(results[cursor].href);
        onClose();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, results, cursor, router, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="fixed inset-0 z-[300] flex items-start justify-center px-5 pt-[14vh]"
        >
          <button
            type="button"
            aria-label="Close search"
            onClick={onClose}
            className="absolute inset-0 cursor-default bg-[var(--ax-bg)]/80 backdrop-blur-md"
          />

          <motion.div
            initial={{ opacity: 0, y: -16, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.98 }}
            transition={{ duration: 0.32, ease: AX_EASE }}
            className="ax-glass-strong ax-edge-light ax-glow-lg relative w-full max-w-[620px] overflow-hidden rounded-2xl"
          >
            <div className="flex items-center gap-3 border-b border-[var(--ax-line)] px-5">
              <Icon name="search" className="size-[18px] shrink-0 text-[var(--ax-ink-dim)]" strokeWidth={2} />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setCursor(0);
                }}
                placeholder={placeholder}
                className="h-14 flex-1 bg-transparent text-[15px] text-[var(--ax-ink)] outline-none placeholder:text-[var(--ax-ink-dim)]"
              />
              <kbd className="hidden rounded border border-[var(--ax-line)] px-1.5 py-0.5 font-mono text-[10px] text-[var(--ax-ink-dim)] sm:block">
                {escLabel}
              </kbd>
            </div>

            <div className="max-h-[52vh] overflow-y-auto p-2">
              {results.length === 0 ? (
                <p className="px-4 py-10 text-center text-[13px] text-[var(--ax-ink-dim)]">
                  {noResults} &ldquo;{query}&rdquo;
                </p>
              ) : (
                results.map((entry, i) => (
                  <button
                    key={entry.href + entry.label}
                    type="button"
                    onMouseEnter={() => setCursor(i)}
                    onClick={() => {
                      router.push(entry.href);
                      onClose();
                    }}
                    className={cn(
                      "flex w-full items-center gap-3.5 rounded-xl px-4 py-3 text-left transition-colors duration-200",
                      cursor === i ? "bg-[rgba(var(--ax-glow),0.12)]" : "hover:bg-[rgba(var(--ax-glow),0.07)]",
                    )}
                  >
                    <span className="grid size-9 shrink-0 place-items-center rounded-lg border border-[var(--ax-line)] bg-[rgba(var(--ax-glow),0.10)] text-[var(--ax-accent-soft)]">
                      <Icon name={entry.icon} className="size-4" strokeWidth={1.9} />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[14px] font-medium text-[var(--ax-ink)]">
                        {entry.label}
                      </span>
                      <span className="block truncate text-[12px] text-[var(--ax-ink-dim)]">
                        {entry.description}
                      </span>
                    </span>
                    <span className="shrink-0 text-[10px] uppercase tracking-[0.12em] text-[var(--ax-ink-dim)]">
                      {entry.group}
                    </span>
                  </button>
                ))
              )}
            </div>

            <div className="flex items-center justify-between border-t border-[var(--ax-line)] px-5 py-2.5 text-[11px] text-[var(--ax-ink-dim)]">
              <span className="flex items-center gap-3">
                <span>{hintNavigate}</span>
                <span>{hintOpen}</span>
              </span>
              <span>{footerLabel}</span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
