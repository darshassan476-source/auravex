"use client";

import { NAV_ITEMS } from "@/data/site";
import type { NavItem } from "@/lib/types";
import { useTextList } from "./useTextList";

/** Splits a comma-separated field, dropping blanks. */
export function splitList(value: string): string[] {
  return value
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

/** NAV_ITEMS with the labels and descriptions from the store; hrefs stay in code. */
export function useNavItems(): NavItem[] {
  const top = useTextList("ex.nav", NAV_ITEMS.length, ["label", "description"] as const);
  return NAV_ITEMS.map((item, i) => ({ ...item, ...top[i] }));
}
