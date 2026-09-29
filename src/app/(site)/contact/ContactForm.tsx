"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState, type FormEvent } from "react";
import { useCms, useText } from "@/cms/CmsProvider";
import { useTextList } from "@/cms/useTextList";
import { useCatalogue } from "@/cms/useProduct";
import { AX_EASE } from "@/components/fx/Reveal";
import { Button } from "@/components/ui/Button";
import { Combobox } from "@/components/ui/Combobox";
import { Icon } from "@/components/ui/Icon";
import { CONTACT_BUDGETS } from "@/data/contactCopy";
import { PRODUCTS } from "@/data/products";
import { cn } from "@/lib/utils";

interface FormState {
  name: string;
  email: string;
  company: string;
  interest: string;
  budget: string;
  message: string;
}

const EMPTY: FormState = {
  name: "",
  email: "",
  company: "",
  interest: PRODUCTS[0]?.name ?? "",
  budget: "",
  message: "",
};

type Errors = Partial<Record<keyof FormState, string>>;

/** The subset the booking calendar needs to attach a name to a slot. */
export interface ContactDetails {
  name: string;
  email: string;
  company: string;
  subject: string;
}

/** The five validation messages, as edited in the portal. */
interface ErrorCopy {
  name: string;
  emailMissing: string;
  emailInvalid: string;
  company: string;
  message: string;
}

function validate(values: FormState, copy: ErrorCopy): Errors {
  const errors: Errors = {};
  if (!values.name.trim()) errors.name = copy.name;
  if (!values.email.trim()) errors.email = copy.emailMissing;
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(values.email.trim()))
    errors.email = copy.emailInvalid;
  if (!values.company.trim()) errors.company = copy.company;
  if (values.message.trim().length < 20) errors.message = copy.message;
  return errors;
}

/**
 * Demo request form.
 *
 * Submission posts to /api/contact; the enquiry becomes a conversation in
 * the portal inbox and the operator is notified.
 */
export function ContactForm({
  onDetailsChange,
}: {
  onDetailsChange?: (details: ContactDetails) => void;
} = {}) {
  const { addThread } = useCms();
  const catalogue = useCatalogue();
  const [values, setValues] = useState<FormState>(EMPTY);
  const [errors, setErrors] = useState<Errors>({});
  const [status, setStatus] = useState<"idle" | "sending" | "sent">("idle");

  const errorCopy: ErrorCopy = {
    name: useText("contact.form.error.name"),
    emailMissing: useText("contact.form.error.emailMissing"),
    emailInvalid: useText("contact.form.error.emailInvalid"),
    company: useText("contact.form.error.company"),
    message: useText("contact.form.error.message"),
  };
  const budgets = useTextList("contact.form.budgets", CONTACT_BUDGETS.length, ["label"]).map((b) => b.label);
  const otherOption = useText("contact.form.otherOption");
  const sentBody = useText("contact.form.sent.body");
  const t = {
    heading: useText("contact.form.heading"),
    intro: useText("contact.form.intro"),
    sentTitle: useText("contact.form.sent.title"),
    again: useText("contact.form.sent.again"),
    nameLabel: useText("contact.form.label.name"),
    namePlaceholder: useText("contact.form.placeholder.name"),
    emailLabel: useText("contact.form.label.email"),
    emailPlaceholder: useText("contact.form.placeholder.email"),
    companyLabel: useText("contact.form.label.company"),
    companyPlaceholder: useText("contact.form.placeholder.company"),
    interestLabel: useText("contact.form.label.interest"),
    interestPlaceholder: useText("contact.form.placeholder.interest"),
    budgetLabel: useText("contact.form.label.budget"),
    budgetPlaceholder: useText("contact.form.placeholder.budget"),
    messageLabel: useText("contact.form.label.message"),
    messagePlaceholder: useText("contact.form.placeholder.message"),
    submit: useText("contact.form.submit"),
    sending: useText("contact.form.sending"),
    privacy: useText("contact.form.privacy"),
  };

  // Mirror the identifying fields outward; the booking panel beside this one
  // uses them so a visitor does not type their name twice.
  useEffect(() => {
    onDetailsChange?.({
      name: values.name,
      email: values.email,
      company: values.company,
      subject: values.interest,
    });
  }, [values.name, values.email, values.company, values.interest, onDetailsChange]);

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setValues((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: undefined }));
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const found = validate(values, errorCopy);
    setErrors(found);
    if (Object.keys(found).length > 0) return;

    setStatus("sending");

    const result = await addThread({
      name: values.name.trim(),
      email: values.email.trim(),
      company: values.company.trim() || undefined,
      subject: values.interest || undefined,
      body: [
        values.message.trim(),
        values.budget ? `\n\nIndicative budget: ${values.budget}` : "",
      ].join(""),
    });

    if (!result.ok) {
      setErrors({ message: result.reason });
      setStatus("idle");
      return;
    }
    setStatus("sent");
  }

  const fieldClass = (invalid?: string) =>
    cn(
      "ax-focus w-full rounded-xl border bg-[rgba(var(--ax-glow),0.04)] px-4 py-3 text-[14px]",
      "text-[var(--ax-ink)] outline-none transition-colors duration-300",
      "placeholder:text-[var(--ax-ink-dim)]",
      invalid
        ? "border-[var(--ax-danger)]/60"
        : "border-[var(--ax-line)] focus:border-[var(--ax-line-strong)]",
    );

  return (
    <div className="relative">
      <div className="mb-6 flex flex-col gap-1.5">
        <h3 className="text-[20px] font-semibold tracking-[-0.01em] text-[var(--ax-ink)]">
          {t.heading}
        </h3>
        <p className="text-[13px] leading-relaxed text-[var(--ax-ink-muted)]">
          {t.intro}
        </p>
      </div>

      <AnimatePresence mode="wait">
        {status === "sent" ? (
          <motion.div
            key="sent"
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: AX_EASE }}
            className="flex min-h-[420px] flex-col items-center justify-center gap-5 text-center"
          >
            <span className="grid size-14 place-items-center rounded-full border border-[var(--ax-success)]/40 bg-[var(--ax-success)]/10 text-[var(--ax-success)]">
              <Icon name="check" className="size-7" strokeWidth={2.4} />
            </span>
            <h3 className="ax-display text-[26px]">{t.sentTitle}</h3>
            <p className="max-w-sm text-[14px] leading-relaxed text-[var(--ax-ink-muted)]">
              {sentBody.replace(/\{name\}/g, values.name.split(" ")[0])}
            </p>
            <Button
              variant="secondary"
              icon="arrow-left"
              iconPosition="left"
              onClick={() => {
                setValues(EMPTY);
                setStatus("idle");
              }}
            >
              {t.again}
            </Button>
          </motion.div>
        ) : (
          <motion.form
            key="form"
            onSubmit={submit}
            noValidate
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col gap-5"
          >
            <div className="grid gap-5 sm:grid-cols-2">
              <Field label={t.nameLabel} error={errors.name}>
                <input
                  value={values.name}
                  onChange={(e) => update("name", e.target.value)}
                  placeholder={t.namePlaceholder}
                  autoComplete="name"
                  className={fieldClass(errors.name)}
                />
              </Field>

              <Field label={t.emailLabel} error={errors.email}>
                <input
                  type="email"
                  value={values.email}
                  onChange={(e) => update("email", e.target.value)}
                  placeholder={t.emailPlaceholder}
                  autoComplete="email"
                  className={fieldClass(errors.email)}
                />
              </Field>
            </div>

            <Field label={t.companyLabel} error={errors.company}>
              <input
                value={values.company}
                onChange={(e) => update("company", e.target.value)}
                placeholder={t.companyPlaceholder}
                autoComplete="organization"
                className={fieldClass(errors.company)}
              />
            </Field>

            <div className="grid gap-5 sm:grid-cols-2">
              <Field label={t.interestLabel}>
                <Combobox
                  value={values.interest}
                  onChange={(v) => update("interest", v)}
                  options={[...catalogue.map((p) => p.name), otherOption]}
                  placeholder={t.interestPlaceholder}
                />
              </Field>

              <Field label={t.budgetLabel} optional>
                <Combobox
                  value={values.budget}
                  onChange={(v) => update("budget", v)}
                  options={budgets}
                  placeholder={t.budgetPlaceholder}
                />
              </Field>
            </div>

            <Field label={t.messageLabel} error={errors.message}>
              <textarea
                value={values.message}
                onChange={(e) => update("message", e.target.value)}
                rows={5}
                placeholder={t.messagePlaceholder}
                className={cn(fieldClass(errors.message), "resize-none")}
              />
            </Field>

            <div className="flex flex-col gap-3 pt-1">
              <Button
                type="submit"
                size="lg"
                icon={status === "sending" ? undefined : "arrow-right"}
                disabled={status === "sending"}
                magnetic={false}
                className="w-full"
              >
                {status === "sending" ? (
                  <span className="flex items-center gap-2.5">
                    <span className="size-3.5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    {t.sending}
                  </span>
                ) : (
                  t.submit
                )}
              </Button>

              <p className="flex items-center justify-center gap-1.5 text-[11.5px] text-[var(--ax-ink-dim)]">
                <Icon name="lock" className="size-3" strokeWidth={2.2} />
                {t.privacy}
              </p>
            </div>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
}

function Field({
  label,
  error,
  optional,
  children,
}: {
  label: string;
  error?: string;
  optional?: boolean;
  children: React.ReactNode;
}) {
  const optionalLabel = useText("contact.form.optional");
  return (
    <label className="flex flex-col gap-2">
      <span className="flex items-center gap-2 text-[12.5px] font-medium text-[var(--ax-ink-muted)]">
        {label}
        {optional && <span className="text-[11px] text-[var(--ax-ink-dim)]">{optionalLabel}</span>}
      </span>
      {children}
      <AnimatePresence>
        {error && (
          <motion.span
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="flex items-center gap-1.5 text-[11.5px] text-[var(--ax-danger)]"
          >
            <Icon name="x" className="size-3" strokeWidth={2.6} />
            {error}
          </motion.span>
        )}
      </AnimatePresence>
    </label>
  );
}
