import { WORK_HERO_STATS } from "@/data/caseStudies";
import { DEPTH_POINTS } from "@/data/industriesCopy";
import { INDUSTRIES, SOLUTION_FILTERS, SOLUTION_HERO_STATS, SOLUTIONS } from "@/data/solutions";
import type { ContentField, ContentGroup } from "../contentSchema";
import { listFields } from "../lists";

/** One solution's editable copy: name, description, checklist and the two figures on its card. */
function solutionFields(): ContentField[] {
  return SOLUTIONS.flatMap((s, i) => {
    const n = i + 1;
    const prefix = `solutions.list.${n}`;
    return [
      { id: `${prefix}.name`, label: `Solution ${n} — name`, value: s.name },
      { id: `${prefix}.description`, label: `Solution ${n} — description`, value: s.description, long: true },
      ...listFields(
        `${prefix}.bullets`,
        `Solution ${n} — checklist item`,
        s.bullets.map((text) => ({ text })),
        [{ key: "text", label: "text" }],
      ),
      ...listFields(`${prefix}.stats`, `Solution ${n} — figure`, s.stats, [
        { key: "label", label: "label" },
        { key: "value", label: "value" },
        { key: "delta", label: "change", hint: "Optional, e.g. +12%. Leave empty to hide it." },
      ]),
    ];
  });
}

/** One industry's editable copy: name, description, outcomes and headline figure. */
function industryFields(): ContentField[] {
  return INDUSTRIES.flatMap((ind, i) => {
    const n = i + 1;
    const prefix = `industries.list.${n}`;
    return [
      { id: `${prefix}.name`, label: `Industry ${n} — name`, value: ind.name },
      { id: `${prefix}.description`, label: `Industry ${n} — description`, value: ind.description, long: true },
      ...listFields(
        `${prefix}.outcomes`,
        `Industry ${n} — outcome`,
        ind.outcomes.map((text) => ({ text })),
        [{ key: "text", label: "text" }],
      ),
      { id: `${prefix}.stat.value`, label: `Industry ${n} — figure`, value: ind.stat.value },
      { id: `${prefix}.stat.label`, label: `Industry ${n} — figure label`, value: ind.stat.label },
    ];
  });
}

/** Editable copy: Industries, Solutions and Our Work pages. */
export const SECTORS_WORK_GROUPS: ContentGroup[] = [
  {
    id: "solutions-page",
    label: "Solutions page",
    description:
      "Headings, hero figures and the closing band on the Solutions page. The eyebrow and main heading are shared with the homepage (Home — sections).",
    fields: [
      { id: "solutions.meta.title", label: "Browser tab title", value: "Solutions" },
      {
        id: "solutions.meta.description",
        label: "Search engine description",
        value:
          "Outcome-led software for real business problems — property operations, workflow automation, analytics, customer experience and custom platforms.",
        long: true,
      },
      {
        id: "solutions.hero.body",
        label: "Hero paragraph",
        value:
          "A powerful suite of enterprise software solutions designed for the real estate and urban economy — helping you automate, connect and grow with confidence.",
        long: true,
      },
      ...listFields("solutions.hero.stats", "Hero figure", SOLUTION_HERO_STATS, [
        { key: "value", label: "number" },
        { key: "label", label: "label" },
      ]),
      {
        id: "solutions.hero.note",
        label: "Short statement beside the hero",
        value: "One Platform.\nA Smarter\nEnterprise Future.",
        long: true,
        hint: "Each line break is kept",
      },
      { id: "solutions.card.button", label: "Button on each solution card", value: "Explore Solution" },
      { id: "solutions.cta.eyebrow", label: "Closing band — eyebrow", value: "Next step" },
      { id: "solutions.cta.title", label: "Closing band — heading", value: "Bring us the number you" },
      { id: "solutions.cta.accent", label: "Closing band — accented phrase", value: "cannot move." },
      { id: "solutions.cta.primary", label: "Closing band — main button", value: "Book a discovery call" },
      { id: "solutions.cta.secondary", label: "Closing band — second button", value: "Browse industries" },
    ],
  },
  {
    id: "solutions-list",
    label: "Solutions list",
    description:
      "The six solutions shown on the Solutions page and the homepage, and the category names used on the filter buttons and card tags.",
    fields: [
      ...listFields("solutions.filters", "Category", SOLUTION_FILTERS, [
        { key: "label", label: "name", hint: "Shown on the filter buttons and on each solution's tag" },
      ]),
      ...solutionFields(),
    ],
  },
  {
    id: "industries-page",
    label: "Industries page",
    description: "Headings, buttons, the “Why it matters” cards and the closing band on the Industries page.",
    fields: [
      { id: "industries.meta.title", label: "Browser tab title", value: "Industries" },
      {
        id: "industries.meta.description",
        label: "Search engine description",
        value:
          "Built for the sectors we know deeply — real estate development, construction, hospitality, asset management, retail and government.",
        long: true,
      },
      { id: "industries.hero.eyebrow", label: "Hero eyebrow", value: "Industries" },
      {
        id: "industries.hero.title",
        label: "Hero heading",
        value: "Deep in a Few Sectors,\nNot Shallow in",
        hint: "Each line break is kept",
      },
      { id: "industries.hero.accent", label: "Hero heading — accented words", value: "All of Them." },
      {
        id: "industries.hero.body",
        label: "Hero paragraph",
        value:
          "We have chosen to know a small number of industries properly. That is why our discovery phase takes two weeks instead of two quarters.",
        long: true,
      },
      { id: "industries.hero.primary", label: "Hero main button", value: "Talk to a specialist" },
      { id: "industries.hero.secondary", label: "Hero second button", value: "See sector results" },
      {
        id: "industries.hero.note",
        label: "Short statement beside the hero",
        value: "Six Sectors.\nOne Standard\nof Delivery.",
        long: true,
        hint: "Each line break is kept",
      },
      { id: "industries.marquee.label", label: "Scrolling sector band — heading", value: "Sectors we operate in every day" },
      { id: "industries.why.eyebrow", label: "“Why it matters” eyebrow", value: "Why it matters" },
      { id: "industries.why.title", label: "“Why it matters” heading", value: "Sector depth is what makes" },
      { id: "industries.why.accent", label: "“Why it matters” accented phrase", value: "the timeline believable." },
      {
        id: "industries.why.description",
        label: "“Why it matters” paragraph",
        value: "Generalist vendors spend the first quarter learning your business. We spend it building.",
        long: true,
      },
      ...listFields("industries.why.points", "Reason", DEPTH_POINTS, [
        { key: "title", label: "title" },
        { key: "body", label: "text", long: true },
      ]),
      { id: "industries.cta.eyebrow", label: "Closing band — eyebrow", value: "Your sector" },
      { id: "industries.cta.title", label: "Closing band — heading", value: "Not seeing your industry" },
      { id: "industries.cta.accent", label: "Closing band — accented phrase", value: "on the list?" },
      {
        id: "industries.cta.description",
        label: "Closing band — paragraph",
        value:
          "The pattern underneath is usually the same: fragmented data, manual coordination and decisions made on stale numbers. Tell us how it shows up in your world.",
        long: true,
      },
      { id: "industries.cta.primary", label: "Closing band — main button", value: "Start a conversation" },
      { id: "industries.cta.secondary", label: "Closing band — second button", value: "Browse solutions" },
    ],
  },
  {
    id: "industries-list",
    label: "Industries list",
    description: "The six industries on the Industries page, with their outcomes and headline figures.",
    fields: industryFields(),
  },
  {
    id: "our-work-page",
    label: "Our Work page",
    description:
      "Headings, figures and the closing band on the Our Work page. The case-study cards themselves are edited under Case studies; the section heading is shared with the homepage (Home — sections).",
    fields: [
      { id: "work.meta.title", label: "Browser tab title", value: "Our Work" },
      {
        id: "work.meta.description",
        label: "Search engine description",
        value:
          "Case studies and measurable results from enterprise platforms AURAVEX has designed, built and scaled.",
        long: true,
      },
      { id: "work.hero.eyebrow", label: "Hero eyebrow", value: "Success Stories" },
      { id: "work.hero.title", label: "Hero heading", value: "Real Outcomes\nfor a Smarter", hint: "Each line break is kept" },
      { id: "work.hero.accent", label: "Hero heading — accented word", value: "Tomorrow." },
      {
        id: "work.hero.body",
        label: "Hero paragraph",
        value:
          "See how leading real estate and construction enterprises use AURAVEX to streamline operations, unlock insights, and build what’s next — faster, smarter, and at scale.",
        long: true,
      },
      { id: "work.hero.button", label: "Hero button", value: "View All Case Studies" },
      ...listFields("work.hero.stats", "Hero figure", WORK_HERO_STATS, [
        { key: "value", label: "number" },
        { key: "label", label: "label" },
      ]),
      { id: "work.hero.card1", label: "Floating card 1", value: "Higher Productivity" },
      { id: "work.hero.card2", label: "Floating card 2", value: "Smarter Operations" },
      { id: "work.hero.card3", label: "Floating card 3", value: "Stronger Business Outcomes" },
      {
        id: "work.cases.description",
        label: "Case studies paragraph",
        value:
          "From complex developments to large-scale operations, explore how our customers turn challenges into measurable growth with AURAVEX.",
        long: true,
      },
      { id: "work.cases.button", label: "Case studies button", value: "More Success Stories" },
      { id: "work.cta.eyebrow", label: "Closing band — eyebrow", value: "Your turn" },
      { id: "work.cta.title", label: "Closing band — heading", value: "Let's put your numbers on" },
      { id: "work.cta.accent", label: "Closing band — accented phrase", value: "this page." },
      { id: "work.cta.primary", label: "Closing band — main button", value: "Request a Demo" },
      { id: "work.cta.secondary", label: "Closing band — second button", value: "Explore products" },
    ],
  },
  {
    id: "case-study-page",
    label: "Case study page",
    description:
      "The wording around every individual case study. The story itself is edited under Case studies. Where you see {name}, the product's name is filled in.",
    fields: [
      { id: "casestudy.meta.notfound", label: "Browser tab title when a case study is missing", value: "Case study not found" },
      { id: "casestudy.breadcrumb", label: "Back link at the top", value: "Our Work" },
      { id: "casestudy.hero.primary", label: "Hero main button", value: "Talk through your version" },
      { id: "casestudy.hero.product", label: "Hero product button", value: "See {name}", hint: "{name} becomes the product name" },
      {
        id: "casestudy.hero.card1",
        label: "Floating card 1 — title if the study has no figures",
        value: "Measured outcome",
      },
      { id: "casestudy.hero.card2", label: "Floating card 2 — title", value: "Smarter Operations" },
      { id: "casestudy.hero.card3", label: "Floating card 3 — title", value: "Stronger Business Outcomes" },
      {
        id: "casestudy.hero.card3body",
        label: "Floating card 3 — text",
        value: "Running on {name}",
        hint: "{name} becomes the product name",
      },
      { id: "casestudy.challenge.eyebrow", label: "Challenge eyebrow", value: "The challenge" },
      { id: "casestudy.challenge.title", label: "Challenge heading", value: "What they were" },
      { id: "casestudy.challenge.accent", label: "Challenge heading — accented phrase", value: "actually up against." },
      { id: "casestudy.approach.eyebrow", label: "Approach eyebrow", value: "The approach" },
      { id: "casestudy.timeline.label", label: "Timeline panel heading", value: "Delivery timeline" },
      { id: "casestudy.platform.eyebrow", label: "Platform eyebrow", value: "Built on" },
      { id: "casestudy.platform.title", label: "Platform heading", value: "The platform behind" },
      { id: "casestudy.platform.accent", label: "Platform heading — accented phrase", value: "these numbers." },
      { id: "casestudy.platform.button", label: "Platform button", value: "Explore {name}", hint: "{name} becomes the product name" },
      { id: "casestudy.next.label", label: "Next case study label", value: "Next case study" },
      { id: "casestudy.cta.eyebrow", label: "Closing band — eyebrow", value: "Same problem?" },
      { id: "casestudy.cta.title", label: "Closing band — heading", value: "These numbers started with" },
      { id: "casestudy.cta.accent", label: "Closing band — accented phrase", value: "a thirty-minute call." },
      { id: "casestudy.cta.primary", label: "Closing band — main button", value: "Book yours" },
      { id: "casestudy.cta.secondary", label: "Closing band — second button", value: "More case studies" },
    ],
  },
];
