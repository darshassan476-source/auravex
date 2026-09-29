/**
 * The Contact page's lists. Plain data (no React) so both the page and the
 * content registry can import it; the text here is the shipped default for
 * each editable field.
 */

export const CONTACT_TRUST = [
  { icon: "building", label: "Enterprise\nFocus" },
  { icon: "shield", label: "Trusted\nBy Leaders" },
  { icon: "globe", label: "Global Expertise\nwith Local Insight" },
];

export const CONTACT_FAQS = [
  {
    q: "What happens after I submit this?",
    a: "A senior engineer reads it — not a sales development rep. You get a reply within one working day with a proposed time and a short agenda based on what you wrote.",
  },
  {
    q: "Do I need to know what I want built?",
    a: "No. Most engagements start from a problem, not a specification. If you can describe what is costing you time or money, that is enough to have a useful first call.",
  },
  {
    q: "Will the demo be generic?",
    a: "No. We build the walkthrough around your sector and, where you are comfortable sharing it, your own data shape. Thirty minutes, no slide deck.",
  },
  {
    q: "What does an engagement typically cost?",
    a: "A first production release usually lands between $50K and $250K depending on integration surface. We give a fixed number after discovery, not before.",
  },
];

/** Budget choices in the demo form. The chosen text is sent as-is with the enquiry. */
export const CONTACT_BUDGETS = [
  { label: "Under $50K" },
  { label: "$50K – $150K" },
  { label: "$150K – $500K" },
  { label: "$500K+" },
  { label: "Not sure yet" },
];
