import "server-only";
import {
  PRICE_LINES,
  PRIVATE_RECORD_KEYS,
  toPublicAdoption,
  toPublicCustomers,
  toPublicPricing,
  toPublicUpdates,
  type AdoptionFigure,
  type CustomerRecord,
  type PricingRecord,
  type PrivateRecordKey,
  type UpdatePost,
} from "@/lib/enterprise";
import { getSetting, setSetting } from "./db";

/**
 * Customers, adoption figures, pricing and updates.
 *
 * Stored in the `settings` collection under `private:<key>`, outside the keys
 * the public bundle reads, so only the filtered public views below ever reach
 * a visitor.
 */

const storageKey = (key: PrivateRecordKey) => `private:${key}`;

export function isRecordKey(key: string): key is PrivateRecordKey {
  return (PRIVATE_RECORD_KEYS as readonly string[]).includes(key);
}

export async function readRecords<T>(key: PrivateRecordKey): Promise<T[]> {
  const list = await getSetting<unknown>(storageKey(key), []);
  return Array.isArray(list) ? (list as T[]) : [];
}

const isRecord = (v: unknown): v is Record<string, unknown> =>
  typeof v === "object" && v !== null && !Array.isArray(v);
const text = (v: unknown, max: number, required = false) =>
  typeof v === "string" ? v.length <= max && (!required || v.trim().length > 0) : !required && v === undefined;
const optText = (v: unknown, max: number) => v === undefined || v === null || text(v, max);
const textList = (v: unknown, maxItems = 50, max = 200) =>
  v === undefined || (Array.isArray(v) && v.length <= maxItems && v.every((s) => typeof s === "string" && s.length <= max));
const id = (v: unknown) => typeof v === "string" && /^[A-Za-z0-9_-]{1,64}$/.test(v);
const slug = (v: unknown) => typeof v === "string" && /^[a-z0-9-]{1,80}$/.test(v);

const GUARDS: Record<PrivateRecordKey, (item: unknown) => boolean> = {
  customers: (c) =>
    isRecord(c) &&
    id(c.id) &&
    text(c.company, 160, true) &&
    text(c.country, 80) &&
    text(c.industry, 120) &&
    slug(c.productSlug) &&
    ["planned", "in-progress", "pilot", "live", "completed"].includes(String(c.status)) &&
    optText(c.deploymentDate, 20) &&
    optText(c.customization, 2000) &&
    textList(c.modules) &&
    optText(c.description, 2000) &&
    optText(c.logoId, 64) &&
    typeof c.verified === "boolean" &&
    ["hidden", "named", "confidential"].includes(String(c.disclosure)),
  adoption: (f) =>
    isRecord(f) &&
    id(f.id) &&
    (f.productSlug === "all" || slug(f.productSlug)) &&
    text(f.label, 120, true) &&
    typeof f.value === "number" &&
    Number.isFinite(f.value) &&
    f.value >= 0 &&
    optText(f.suffix, 8) &&
    typeof f.verified === "boolean" &&
    typeof f.public === "boolean" &&
    optText(f.source, 1000),
  pricing: (p) =>
    isRecord(p) &&
    slug(p.productSlug) &&
    text(p.currency, 8, true) &&
    isRecord(p.lines) &&
    Object.entries(p.lines).every(
      ([k, v]) => PRICE_LINES.some((l) => l.key === k) && (v === undefined || v === null || text(v, 200)),
    ) &&
    optText(p.notes, 4000) &&
    typeof p.publicDisplay === "boolean",
  updates: (u) =>
    isRecord(u) &&
    id(u.id) &&
    text(u.title, 200, true) &&
    text(u.summary, 600, true) &&
    optText(u.body, 10_000) &&
    ["ai", "module", "improvement", "integration", "deployment", "industry", "release", "announcement"].includes(
      String(u.kind),
    ) &&
    (u.productSlug === undefined || u.productSlug === null || u.productSlug === "" || slug(u.productSlug)) &&
    optText(u.imageId, 64) &&
    typeof u.featured === "boolean" &&
    typeof u.published === "boolean" &&
    (u.publishAt === undefined || u.publishAt === null || u.publishAt === "" || !Number.isNaN(Date.parse(String(u.publishAt)))),
};

/** Replaces a whole list after checking every item. Throws a 400 Response naming the problem. */
export async function writeRecords(key: PrivateRecordKey, value: unknown) {
  if (!Array.isArray(value) || value.length > 1000) throw badRequest(`"${key}" must be a list.`);
  const bad = value.findIndex((item) => !GUARDS[key](item));
  if (bad >= 0) throw badRequest(`Item ${bad + 1} in "${key}" is missing a required field or has the wrong shape.`);
  if (key === "pricing") {
    const slugs = value.map((p) => (p as PricingRecord).productSlug);
    if (new Set(slugs).size !== slugs.length) throw badRequest("Each product can have only one pricing record.");
  }
  await setSetting(storageKey(key), value);
}

function badRequest(message: string) {
  return new Response(JSON.stringify({ error: message }), {
    status: 400,
    headers: { "Content-Type": "application/json" },
  });
}

/** The public half of every private list, ready for the site bundle. */
export async function publicRecords() {
  const [customers, adoption, pricing, updates] = await Promise.all([
    readRecords<CustomerRecord>("customers"),
    readRecords<AdoptionFigure>("adoption"),
    readRecords<PricingRecord>("pricing"),
    readRecords<UpdatePost>("updates"),
  ]);
  return {
    publicCustomers: toPublicCustomers(customers),
    publicAdoption: toPublicAdoption(adoption),
    publicPricing: toPublicPricing(pricing),
    publicUpdates: toPublicUpdates(updates),
  };
}
