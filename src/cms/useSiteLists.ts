"use client";

import { NAV_PRODUCTS_INDEX } from "@/data/chromeCopy";
import { NAV_ITEMS, PROCESS_STEPS, TECH_STACK } from "@/data/site";
import type { NavItem } from "@/lib/types";
import { useTextList } from "./useTextList";

/** Splits a comma-separated field, dropping blanks. */
export function splitList(value: string): string[] {
  return value
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

/**
 * The three process steps (`process.N.title` / `process.N.body`), with the
 * step number and icon kept from code. Shared by the homepage and Contact.
 */
export function useProcessSteps() {
  const copy = useTextList("process", PROCESS_STEPS.length, ["title", "body"] as const);
  return PROCESS_STEPS.map((step, i) => ({ ...step, ...copy[i] }));
}

/**
 * The technology cards (`stack.N.title`, and `stack.N.items` as a
 * comma-separated list). Shared by the homepage and About.
 */
export function useTechStack() {
  const copy = useTextList("stack", TECH_STACK.length, ["title", "items"] as const);
  return TECH_STACK.map((group, i) => ({
    group: copy[i].title,
    items: splitList(copy[i].items),
  }));
}

/** NAV_ITEMS with the labels and descriptions from the store; hrefs stay in code. */
export function useNavItems(): NavItem[] {
  const top = useTextList("nav", NAV_ITEMS.length, ["label", "description"] as const);
  const children = NAV_ITEMS[NAV_PRODUCTS_INDEX].children ?? [];
  const sub = useTextList("nav.products", children.length, ["label", "description"] as const);
  return NAV_ITEMS.map((item, i) => ({
    ...item,
    ...top[i],
    ...(item.children
      ? {
          children: item.children.map((child, j) =>
            i === NAV_PRODUCTS_INDEX ? { ...child, ...sub[j] } : child,
          ),
        }
      : {}),
  }));
}
