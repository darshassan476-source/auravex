"use client";

import { motion } from "framer-motion";
import { AX_EASE } from "@/components/fx/Reveal";
import { Icon } from "@/components/ui/Icon";
import { cn } from "@/lib/utils";

export interface FilterOption {
  id: string;
  label: string;
  icon?: string;
  count?: number;
}

/**
 * The filter rail from references 2 and 8: the active option is a solid blue
 * pill, the rest are glass outlines. The active background slides between
 * options rather than cutting.
 */
export function FilterPills({
  options,
  value,
  onChange,
  layoutId = "filter-pill",
  className,
}: {
  options: FilterOption[];
  value: string;
  onChange: (id: string) => void;
  layoutId?: string;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-wrap gap-2.5", className)}>
      {options.map((option) => {
        const active = option.id === value;

        return (
          <button
            key={option.id}
            type="button"
            onClick={() => onChange(option.id)}
            className={cn(
              "ax-focus relative inline-flex items-center gap-2 rounded-full px-5 py-2.5",
              "text-[13.5px] font-medium transition-colors duration-300",
              active
                ? "text-white"
                : "ax-glass text-[var(--ax-ink-muted)] hover:border-[var(--ax-line-strong)] hover:text-[var(--ax-ink)]",
            )}
          >
            {active && (
              <motion.span
                layoutId={layoutId}
                transition={{ duration: 0.4, ease: AX_EASE }}
                className="absolute inset-0 rounded-full bg-[linear-gradient(110deg,var(--ax-accent),var(--ax-violet))] shadow-[0_10px_30px_-10px_rgba(var(--ax-glow),0.9)]"
              />
            )}
            {option.icon && (
              <Icon name={option.icon} className="relative size-4 shrink-0" strokeWidth={2} />
            )}
            <span className="relative whitespace-nowrap">
              {option.label}
              {typeof option.count === "number" && (
                <span className={cn("ml-1.5", active ? "text-white/70" : "text-[var(--ax-ink-dim)]")}>
                  ({option.count})
                </span>
              )}
            </span>
          </button>
        );
      })}
    </div>
  );
}
