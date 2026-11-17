"use client";

import { useMemo, useState } from "react";
import { useCms, useText } from "@/cms/CmsProvider";
import { useCatalogue } from "@/cms/useProduct";
import { UpdateCard } from "@/components/cards/UpdateCard";
import { FilterPills, type FilterOption } from "@/components/ui/FilterPills";

/**
 * Every published update, featured first then newest. The list arrives
 * already filtered on the server: drafts and scheduled posts never reach here.
 */
export function UpdatesList() {
  const { state } = useCms();
  const catalogue = useCatalogue();
  const allLabel = useText("ex.updates.all");
  const empty = useText("ex.updates.empty");
  const [filter, setFilter] = useState("all");

  const updates = useMemo(
    () =>
      [...(state.publicUpdates ?? [])].sort(
        (a, b) => Number(b.featured) - Number(a.featured) || b.date.localeCompare(a.date),
      ),
    [state.publicUpdates],
  );

  const options: FilterOption[] = useMemo(() => {
    const bySlug = new Map<string, number>();
    for (const u of updates) if (u.productSlug) bySlug.set(u.productSlug, (bySlug.get(u.productSlug) ?? 0) + 1);
    return [
      { id: "all", label: allLabel, icon: "grid", count: updates.length },
      ...catalogue
        .filter((p) => bySlug.has(p.slug))
        .map((p) => ({ id: p.slug, label: p.name, icon: "box", count: bySlug.get(p.slug) ?? 0 })),
    ];
  }, [updates, catalogue, allLabel]);

  const shown = filter === "all" ? updates : updates.filter((u) => u.productSlug === filter);

  if (updates.length === 0) {
    return (
      <p className="ax-glass rounded-2xl px-6 py-16 text-center text-[15px] text-[var(--ax-ink-muted)]">{empty}</p>
    );
  }

  return (
    <div className="flex flex-col gap-10">
      {options.length > 2 && (
        <FilterPills options={options} value={filter} onChange={setFilter} layoutId="updates-filter" />
      )}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {shown.map((update) => (
          <UpdateCard key={update.id} update={update} />
        ))}
      </div>
    </div>
  );
}
