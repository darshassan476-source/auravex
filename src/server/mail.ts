import "server-only";
import nodemailer from "nodemailer";
import { mailSettings } from "./appSecrets";

/**
 * Outgoing email, used for inbox replies and operator notifications.
 *
 * Nothing is sent unless SMTP_HOST is set. Every caller gets back whether
 * the message went, so the portal can say "stored, not emailed" honestly
 * instead of implying a delivery that never happened.
 */

export type MailResult = { sent: true } | { sent: false; reason: string };

async function transport() {
  const s = await mailSettings();
  if (!s.host) return null;
  return nodemailer.createTransport({
    host: s.host,
    port: s.port,
    secure: s.secure,
    auth: s.user ? { user: s.user, pass: s.pass } : undefined,
    connectionTimeout: 15_000,
    greetingTimeout: 15_000,
    socketTimeout: 30_000,
  });
}

export const mailConfigured = async () => Boolean((await mailSettings()).host);

export async function sendMail(message: { to: string; subject: string; text: string }): Promise<MailResult> {
  const mailer = await transport();
  if (!mailer) return { sent: false, reason: "Email delivery is not configured: add your mail server under Settings → Connections." };
  if (!message.to) return { sent: false, reason: "The visitor left no email address." };
  try {
    const s = await mailSettings();
    await mailer.sendMail({
      from: s.from || s.user,
      to: message.to,
      subject: message.subject,
      text: message.text,
    });
    return { sent: true };
  } catch (error) {
    const reason = error instanceof Error ? error.message : String(error);
    console.error("[mail]", reason);
    return { sent: false, reason };
  }
}

/** Forwards a heads-up to the operator's address, when both sides are set. */
export async function notifyOperator(message: { subject: string; text: string }) {
  const to = (await mailSettings()).adminEmail;
  if (!to || !(await mailConfigured())) return;
  await sendMail({ to, ...message }).catch(() => undefined);
}
