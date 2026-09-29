/**
 * The About page's lists. Plain data (no React) so both the page and the
 * content registry can import it; the text here is the shipped default for
 * each editable field.
 */

export const ABOUT_PRINCIPLES = [
  {
    icon: "target",
    title: "Start with the number",
    body: "Before a single screen is designed we agree what success looks like numerically, and who owns that number after we leave.",
  },
  {
    icon: "layers",
    title: "Build it to be replaced",
    body: "Every layer is independently deployable. If you outgrow a decision we made, you swap that layer — not the platform.",
  },
  {
    icon: "shield",
    title: "Own your own data",
    body: "Your data stays yours, in your cloud, under your keys. No lock-in disguised as a managed service.",
  },
  {
    icon: "zap",
    title: "Ship in weeks, not quarters",
    body: "Discovery is two weeks because we already know the sector. First production release lands inside the first quarter.",
  },
  {
    icon: "users",
    title: "One team, not a handoff chain",
    body: "The engineers in discovery are the engineers in production. Nothing is thrown over a wall to a delivery unit you never met.",
  },
  {
    icon: "activity",
    title: "Observable by default",
    body: "If it runs in production it emits metrics, traces and logs from day one. You should never need to ask us whether something is working.",
  },
];

export const ABOUT_METHOD = [
  {
    phase: "01",
    title: "Discovery",
    duration: "2 weeks",
    body: "We map the workflow as it actually runs — including the spreadsheets and the WhatsApp groups nobody mentions in the kickoff.",
  },
  {
    phase: "02",
    title: "Architecture",
    duration: "2 weeks",
    body: "Data model, integration contracts and the deployment topology, agreed and signed off before implementation starts.",
  },
  {
    phase: "03",
    title: "Build",
    duration: "8–12 weeks",
    body: "Two-week increments, each one deployed to a live environment your team can use. No big-bang reveal at the end.",
  },
  {
    phase: "04",
    title: "Scale",
    duration: "Ongoing",
    body: "Rollout, training and the operational handover — or we keep running it for you. Both are supported paths.",
  },
];

export const ABOUT_SECURITY = [
  { icon: "lock", label: "SSO & SCIM", detail: "SAML, OIDC and directory sync on every platform." },
  { icon: "shield", label: "Role-based access", detail: "Field-level permissions with a full audit trail." },
  { icon: "database", label: "Data residency", detail: "Deployed in your region, in your cloud account." },
  { icon: "scan", label: "Continuous scanning", detail: "Dependency, container and secret scanning in CI." },
  { icon: "cloud", label: "Encrypted throughout", detail: "TLS 1.3 in transit, AES-256 at rest, keys you hold." },
  { icon: "file", label: "Audit exports", detail: "Immutable event history, exportable on demand." },
];
