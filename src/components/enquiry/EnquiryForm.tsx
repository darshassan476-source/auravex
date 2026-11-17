"use client";

import { useMemo, useState, type ReactNode } from "react";
import { useText } from "@/cms/CmsProvider";
import { useCatalogue, type ResolvedProduct } from "@/cms/useProduct";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { api, errorMessage } from "@/lib/api";
import { COUNTRY_SUGGESTIONS, DEPLOYMENT_CHOICES, INDUSTRIES } from "@/data/enterprise";
import { DEPLOYMENT_LABELS } from "@/data/products";
import type { EnquiryDetails } from "@/lib/enterprise";
import { cn } from "@/lib/utils";

type Path = "configure" | "consult";

export interface EnquiryPrefill {
  productSlug?: string;
  path?: Path;
  modules?: string[];
  proposal?: boolean;
  preview?: boolean;
}

interface Form {
  path: Path;
  productSlug: string;
  modules: string[];
  ai: string[];
  voice: boolean;
  departments: string;
  users: string;
  integrations: string;
  workflows: string;
  deployment: string;
  name: string;
  email: string;
  company: string;
  country: string;
  industry: string;
  notes: string;
  meeting: boolean;
  meetingTimes: string;
  proposal: boolean;
}

type Errors = Partial<Record<"name" | "email" | "company" | "country" | "productSlug" | "departments" | "users", string>>;

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/**
 * "Customize Your Solution" and the enquiry form, as one component.
 *
 * Path A builds a configuration — optional modules, departments, users, AI,
 * voice, integrations, workflows, deployment — and Path B asks for a meeting
 * with none of that. Every selection is optional; only who is asking is
 * required. Submissions land in the portal's Enquiries and Messages.
 */
export function EnquiryForm({
  fixedProduct,
  prefill,
}: {
  /** On a product page the product is fixed and its own options are offered. */
  fixedProduct?: ResolvedProduct;
  prefill?: EnquiryPrefill;
}) {
  const catalogue = useCatalogue();
  const [form, setForm] = useState<Form>(() => ({
    path: prefill?.path ?? (fixedProduct ? "configure" : "consult"),
    productSlug: fixedProduct?.slug ?? prefill?.productSlug ?? "",
    modules: prefill?.modules ?? [],
    ai: [],
    voice: false,
    departments: "",
    users: "",
    integrations: "",
    workflows: "",
    deployment: "",
    name: "",
    email: "",
    company: "",
    country: "",
    industry: "",
    notes: prefill?.preview ? "We would like to request an early preview." : "",
    meeting: false,
    meetingTimes: "",
    proposal: Boolean(prefill?.proposal),
  }));
  const [errors, setErrors] = useState<Errors>({});
  const [sending, setSending] = useState(false);
  const [failure, setFailure] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  const product = fixedProduct ?? catalogue.find((p) => p.slug === form.productSlug);
  const set = <K extends keyof Form>(key: K, value: Form[K]) => setForm((f) => ({ ...f, [key]: value }));
  const toggle = (key: "modules" | "ai", id: string) =>
    setForm((f) => ({ ...f, [key]: f[key].includes(id) ? f[key].filter((x) => x !== id) : [...f[key], id] }));

  const t = {
    pathA: useText("ex.enquiry.pathA"),
    pathAbody: useText("ex.enquiry.pathA.body"),
    pathB: useText("ex.enquiry.pathB"),
    pathBbody: useText("ex.enquiry.pathB.body"),
    modules: useText("ex.cfg.modules"),
    departments: useText("ex.cfg.departments"),
    users: useText("ex.cfg.users"),
    ai: useText("ex.cfg.ai"),
    voice: useText("ex.cfg.voice"),
    voiceNote: useText("ex.cfg.voice.note"),
    integrations: useText("ex.cfg.integrations"),
    workflows: useText("ex.cfg.workflows"),
    deployment: useText("ex.cfg.deployment"),
    summary: useText("ex.cfg.summary"),
    summaryEmpty: useText("ex.cfg.summaryEmpty"),
    meetingNote: useText("ex.enquiry.meeting.note"),
    successTitle: useText("ex.enquiry.success.title"),
    successBody: useText("ex.enquiry.success.body"),
    proposal: useText("ex.product.pricing.button"),
  };

  const deploymentChoices = useMemo(() => {
    const supported = product?.deployment;
    if (!supported?.length) return DEPLOYMENT_CHOICES;
    return [
      ...supported.map((id) => ({ id, label: DEPLOYMENT_LABELS[id] })),
      DEPLOYMENT_CHOICES[DEPLOYMENT_CHOICES.length - 1],
    ];
  }, [product]);

  const configuring = form.path === "configure";
  const chosenModules = (product?.optionalModules ?? []).filter((m) => form.modules.includes(m.id));
  const chosenAi = (product?.aiEnhancements ?? []).filter((m) => form.ai.includes(m.id));
  const deploymentLabel = deploymentChoices.find((d) => d.id === form.deployment)?.label;

  function validate(): Errors {
    const e: Errors = {};
    if (form.name.trim().length < 2) e.name = "Please enter your full name.";
    if (!EMAIL.test(form.email.trim())) e.email = "Please enter a valid business email address.";
    if (form.company.trim().length < 2) e.company = "Please enter your company name.";
    if (form.country.trim().length < 2) e.country = "Please enter your country.";
    if (configuring && !product) e.productSlug = "Please choose a solution to configure.";
    for (const key of ["departments", "users"] as const) {
      const v = form[key].trim();
      if (v && !(Number(v) > 0 && Number.isInteger(Number(v)))) e[key] = "Please enter a whole number, or leave it empty.";
    }
    return e;
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    const e = validate();
    setErrors(e);
    if (Object.keys(e).length) return;

    const details: EnquiryDetails = {
      path: form.path,
      country: form.country.trim(),
      industry: form.industry || undefined,
      productSlug: product?.slug,
      productName: product?.name,
      meetingRequested: form.meeting || form.path === "consult" || undefined,
      meetingTimes: form.meetingTimes.trim() || undefined,
      commercialProposal: form.proposal || undefined,
      ...(configuring
        ? {
            modules: chosenModules.map((m) => m.name),
            aiEnhancements: chosenAi.map((m) => m.name),
            voiceAI: form.voice || undefined,
            departments: form.departments ? Number(form.departments) : undefined,
            users: form.users ? Number(form.users) : undefined,
            integrations: form.integrations.trim() || undefined,
            workflows: form.workflows.trim() || undefined,
            deployment: deploymentLabel,
          }
        : {}),
    };

    setSending(true);
    setFailure(null);
    try {
      await api("/api/contact", {
        method: "POST",
        body: {
          name: form.name.trim(),
          email: form.email.trim(),
          company: form.company.trim(),
          subject: product ? product.name : "Consultation",
          body: form.notes.trim(),
          details,
        },
      });
      setSent(true);
    } catch (err) {
      setFailure(errorMessage(err));
    } finally {
      setSending(false);
    }
  }

  if (sent) {
    return (
      <div role="status" className="ax-glass flex flex-col items-center gap-4 rounded-2xl px-6 py-14 text-center">
        <span className="grid size-12 place-items-center rounded-full bg-[var(--ax-success)]/15 text-[var(--ax-success)]">
          <Icon name="check" className="size-6" strokeWidth={2.4} />
        </span>
        <h3 className="text-[22px] font-semibold text-[var(--ax-ink)]">{t.successTitle}</h3>
        <p className="ax-text-pretty max-w-lg text-[14.5px] leading-relaxed text-[var(--ax-ink-muted)]">{t.successBody}</p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} noValidate className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_340px]">
      <div className="flex flex-col gap-8">
        {/* Path choice */}
        <fieldset className="grid gap-3 sm:grid-cols-2">
          <legend className="sr-only">How would you like to proceed?</legend>
          {(
            [
              ["configure", t.pathA, t.pathAbody, "settings"],
              ["consult", t.pathB, t.pathBbody, "calendar"],
            ] as const
          ).map(([id, label, body, icon]) => (
            <label
              key={id}
              className={cn(
                "flex cursor-pointer gap-3 rounded-2xl border p-4 transition-colors",
                form.path === id
                  ? "border-[var(--ax-accent)] bg-[rgba(var(--ax-glow),0.08)]"
                  : "border-[var(--ax-line)] hover:border-[var(--ax-line-strong)]",
              )}
            >
              <input
                type="radio"
                name="path"
                value={id}
                checked={form.path === id}
                onChange={() => set("path", id)}
                className="sr-only"
              />
              <Icon name={icon} className="mt-0.5 size-5 shrink-0 text-[var(--ax-accent-soft)]" strokeWidth={1.8} />
              <span>
                <span className="block text-[14.5px] font-semibold text-[var(--ax-ink)]">{label}</span>
                <span className="mt-1 block text-[13px] leading-snug text-[var(--ax-ink-muted)]">{body}</span>
              </span>
            </label>
          ))}
        </fieldset>

        {!fixedProduct && (
          <Field label="Solution" error={errors.productSlug} optional={!configuring}>
            <select
              value={form.productSlug}
              onChange={(e) => setForm((f) => ({ ...f, productSlug: e.target.value, modules: [], ai: [], deployment: "" }))}
              className={inputClass}
            >
              <option value="">{configuring ? "Choose a solution" : "General enquiry / not sure yet"}</option>
              {catalogue.map((p) => (
                <option key={p.slug} value={p.slug}>
                  {p.name}
                </option>
              ))}
            </select>
          </Field>
        )}

        {configuring && product && (
          <div className="flex flex-col gap-7">
            {(product.optionalModules?.length ?? 0) > 0 && (
              <Group title={t.modules} hint="Optional — select any that apply.">
                <div className="grid gap-2.5 sm:grid-cols-2">
                  {product.optionalModules!.map((m) => (
                    <Check key={m.id} checked={form.modules.includes(m.id)} onChange={() => toggle("modules", m.id)} title={m.name} body={m.description} />
                  ))}
                </div>
              </Group>
            )}

            <div className="grid gap-4 sm:grid-cols-2">
              <Field label={t.departments} error={errors.departments} optional>
                <input inputMode="numeric" value={form.departments} onChange={(e) => set("departments", e.target.value)} placeholder="e.g. 4" className={inputClass} />
              </Field>
              <Field label={t.users} error={errors.users} optional>
                <input inputMode="numeric" value={form.users} onChange={(e) => set("users", e.target.value)} placeholder="e.g. 250" className={inputClass} />
              </Field>
            </div>

            {(product.aiEnhancements?.length ?? 0) > 0 && (
              <Group title={t.ai} hint="Optional.">
                <div className="grid gap-2.5 sm:grid-cols-2">
                  {product.aiEnhancements!.map((m) => (
                    <Check key={m.id} checked={form.ai.includes(m.id)} onChange={() => toggle("ai", m.id)} title={m.name} body={m.description} />
                  ))}
                </div>
              </Group>
            )}

            {product.voiceAI !== false && (
              <Group title={t.voice} hint="Optional advanced capability.">
                <Check checked={form.voice} onChange={() => set("voice", !form.voice)} title="Include voice-to-voice AI" body={t.voiceNote} />
              </Group>
            )}

            <Field label={t.integrations} optional>
              <textarea rows={3} value={form.integrations} onChange={(e) => set("integrations", e.target.value)} placeholder="Systems you would like connected, e.g. SAP, Microsoft 365, Oracle" className={inputClass} />
            </Field>
            <Field label={t.workflows} optional>
              <textarea rows={3} value={form.workflows} onChange={(e) => set("workflows", e.target.value)} placeholder="Describe any additional automation or approval processes" className={inputClass} />
            </Field>

            <Group title={t.deployment} hint="Optional.">
              <div className="flex flex-wrap gap-2">
                {deploymentChoices.map((d) => (
                  <button
                    key={d.id}
                    type="button"
                    aria-pressed={form.deployment === d.id}
                    onClick={() => set("deployment", form.deployment === d.id ? "" : d.id)}
                    className={cn(
                      "rounded-full border px-3.5 py-2 text-[13px] transition-colors",
                      form.deployment === d.id
                        ? "border-[var(--ax-accent)] bg-[rgba(var(--ax-glow),0.12)] text-[var(--ax-ink)]"
                        : "border-[var(--ax-line)] text-[var(--ax-ink-muted)] hover:border-[var(--ax-line-strong)]",
                    )}
                  >
                    {d.label}
                  </button>
                ))}
              </div>
            </Group>
          </div>
        )}

        {/* Who is asking */}
        <div className="grid gap-4 border-t border-[var(--ax-line)] pt-7 sm:grid-cols-2">
          <Field label="Full name" error={errors.name}>
            <input autoComplete="name" value={form.name} onChange={(e) => set("name", e.target.value)} className={inputClass} />
          </Field>
          <Field label="Business email" error={errors.email}>
            <input type="email" autoComplete="email" value={form.email} onChange={(e) => set("email", e.target.value)} className={inputClass} />
          </Field>
          <Field label="Company name" error={errors.company}>
            <input autoComplete="organization" value={form.company} onChange={(e) => set("company", e.target.value)} className={inputClass} />
          </Field>
          <Field label="Country" error={errors.country}>
            <input list="ax-countries" autoComplete="country-name" value={form.country} onChange={(e) => set("country", e.target.value)} className={inputClass} />
            <datalist id="ax-countries">
              {COUNTRY_SUGGESTIONS.map((c) => (
                <option key={c} value={c} />
              ))}
            </datalist>
          </Field>
          <Field label="Industry" optional>
            <select value={form.industry} onChange={(e) => set("industry", e.target.value)} className={inputClass}>
              <option value="">Select an industry</option>
              {INDUSTRIES.map((i) => (
                <option key={i.slug} value={i.title}>
                  {i.title}
                </option>
              ))}
              <option value="Other">Other</option>
            </select>
          </Field>
          <div className="sm:col-span-2">
            <Field label="Additional notes" optional>
              <textarea rows={4} value={form.notes} onChange={(e) => set("notes", e.target.value)} className={inputClass} />
            </Field>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          {form.path === "configure" && (
            <Check checked={form.meeting} onChange={() => set("meeting", !form.meeting)} title="Request a meeting" body="Our team will contact you to arrange a call." />
          )}
          {(form.meeting || form.path === "consult") && (
            <Field label="Preferred meeting times" optional hint={t.meetingNote}>
              <input value={form.meetingTimes} onChange={(e) => set("meetingTimes", e.target.value)} placeholder="e.g. Tue or Wed, 10:00–13:00 GST" className={inputClass} />
            </Field>
          )}
          <Check checked={form.proposal} onChange={() => set("proposal", !form.proposal)} title={t.proposal} body="Receive a commercial proposal based on your requirements." />
        </div>

        {failure && (
          <p role="alert" className="rounded-xl border border-[var(--ax-danger)]/40 bg-[var(--ax-danger)]/10 px-4 py-3 text-[13.5px] text-[var(--ax-ink)]">
            {failure}
          </p>
        )}

        <div>
          <Button type="submit" size="lg" icon="arrow-right" disabled={sending}>
            {sending ? "Sending…" : form.path === "configure" ? "Submit Enquiry" : "Request Consultation"}
          </Button>
        </div>
      </div>

      {/* Running summary */}
      <aside className="h-fit rounded-2xl border border-[var(--ax-line)] bg-[var(--ax-bg-elevated)] p-6 lg:sticky lg:top-28">
        <h3 className="text-[12px] font-semibold uppercase tracking-[0.14em] text-[var(--ax-ink-dim)]">{t.summary}</h3>
        <p className="mt-3 text-[16px] font-semibold text-[var(--ax-ink)]">{product?.name ?? "General consultation"}</p>
        {configuring && product ? (
          <dl className="mt-4 flex flex-col gap-3 text-[13px]">
            <SummaryRow label="Modules" value={chosenModules.map((m) => m.name).join(", ")} />
            <SummaryRow label="AI enhancements" value={chosenAi.map((m) => m.name).join(", ")} />
            <SummaryRow label="Voice-to-voice AI" value={form.voice ? "Requested" : ""} />
            <SummaryRow label="Departments" value={form.departments} />
            <SummaryRow label="Users" value={form.users} />
            <SummaryRow label="Deployment" value={deploymentLabel ?? ""} />
            <SummaryRow label="Integrations" value={form.integrations ? "Described" : ""} />
            <SummaryRow label="Custom workflows" value={form.workflows ? "Described" : ""} />
            {!chosenModules.length && !chosenAi.length && !form.voice && (
              <p className="text-[12.5px] leading-snug text-[var(--ax-ink-dim)]">{t.summaryEmpty}</p>
            )}
          </dl>
        ) : (
          <p className="mt-3 text-[13px] leading-relaxed text-[var(--ax-ink-muted)]">{t.pathBbody}</p>
        )}
      </aside>
    </form>
  );
}

const inputClass =
  "w-full rounded-xl border border-[var(--ax-line)] bg-[var(--ax-bg)] px-3.5 py-2.5 text-[14px] text-[var(--ax-ink)] outline-none transition-colors placeholder:text-[var(--ax-ink-dim)] focus:border-[var(--ax-accent)]";

function Field({
  label,
  error,
  optional,
  hint,
  children,
}: {
  label: string;
  error?: string;
  optional?: boolean;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-[13px] font-medium text-[var(--ax-ink)]">
        {label}
        {optional && <span className="ml-1.5 font-normal text-[var(--ax-ink-dim)]">(optional)</span>}
      </span>
      {children}
      {hint && <span className="text-[12px] text-[var(--ax-ink-dim)]">{hint}</span>}
      {error && (
        <span role="alert" className="text-[12.5px] text-[var(--ax-danger)]">
          {error}
        </span>
      )}
    </label>
  );
}

function Group({ title, hint, children }: { title: string; hint?: string; children: ReactNode }) {
  return (
    <fieldset className="flex flex-col gap-3">
      <legend className="mb-3 text-[14px] font-semibold text-[var(--ax-ink)]">
        {title}
        {hint && <span className="ml-2 text-[12.5px] font-normal text-[var(--ax-ink-dim)]">{hint}</span>}
      </legend>
      {children}
    </fieldset>
  );
}

function Check({ checked, onChange, title, body }: { checked: boolean; onChange: () => void; title: string; body?: string }) {
  return (
    <label
      className={cn(
        "flex cursor-pointer gap-3 rounded-xl border p-3.5 transition-colors",
        checked ? "border-[var(--ax-accent)] bg-[rgba(var(--ax-glow),0.07)]" : "border-[var(--ax-line)] hover:border-[var(--ax-line-strong)]",
      )}
    >
      <input type="checkbox" checked={checked} onChange={onChange} className="mt-0.5 size-4 shrink-0 accent-[var(--ax-accent)]" />
      <span>
        <span className="block text-[13.5px] font-medium text-[var(--ax-ink)]">{title}</span>
        {body && <span className="mt-0.5 block text-[12.5px] leading-snug text-[var(--ax-ink-muted)]">{body}</span>}
      </span>
    </label>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  if (!value) return null;
  return (
    <div className="flex flex-col gap-0.5">
      <dt className="text-[11.5px] uppercase tracking-[0.1em] text-[var(--ax-ink-dim)]">{label}</dt>
      <dd className="text-[var(--ax-ink)]">{value}</dd>
    </div>
  );
}
