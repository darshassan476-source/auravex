import type { ContentGroup } from "../contentSchema";
import { listFields } from "../lists";
import { ABOUT_METHOD, ABOUT_PRINCIPLES, ABOUT_SECURITY } from "@/data/aboutCopy";
import { CONTACT_BUDGETS, CONTACT_FAQS, CONTACT_TRUST } from "@/data/contactCopy";

/** Editable copy: About and Contact pages. */
export const ABOUT_CONTACT_GROUPS: ContentGroup[] = [
  {
    id: "about",
    label: "About page",
    description: "Everything on the About page, from the hero down to the closing call to action.",
    fields: [
      { id: "about.meta.title", label: "Browser tab title", value: "About" },
      {
        id: "about.meta.description",
        label: "Search engine description",
        value:
          "The team, the method and the mission behind AURAVEX — an engineering studio building intelligent software for enterprises across MENA.",
        long: true,
      },
      {
        id: "about.hero.eyebrow",
        label: "Hero pill",
        value: "About",
        hint: "The company name is added after this automatically",
      },
      { id: "about.hero.title", label: "Hero heading", value: "An Engineering Studio for\nSoftware That" },
      { id: "about.hero.accent", label: "Hero heading — accented words", value: "Has to Work.", hint: "Rendered in the gradient" },
      {
        id: "about.hero.introBefore",
        label: "Hero paragraph — before the location",
        value: "We are a small senior team based in",
        hint: "Follows the company description; the location is inserted after this",
        long: true,
      },
      {
        id: "about.hero.introAfter",
        label: "Hero paragraph — after the location",
        value: ", building the platforms enterprises run their operations on.",
        long: true,
      },
      { id: "about.hero.primaryCta", label: "Hero main button", value: "Work with us" },
      { id: "about.hero.secondaryCta", label: "Hero second button", value: "See the results" },
      {
        id: "about.hero.statement",
        label: "Statement beside the figures",
        value: "Senior Team.\nSector Depth.\nMeasured Outcomes.",
        long: true,
        hint: "One line per phrase",
      },
      { id: "about.mission.eyebrow", label: "Mission — small label", value: "The mission" },
      { id: "about.mission.title", label: "Mission — heading", value: "Software for a" },
      { id: "about.mission.accent", label: "Mission — accented words", value: "brighter tomorrow." },
      {
        id: "about.mission.p1",
        label: "Mission — paragraph 1",
        value:
          "Most enterprise software fails quietly. It gets bought, rolled out, half-adopted, and two years later the team is back in spreadsheets because the platform never quite fit how the work actually happens.",
        long: true,
      },
      {
        id: "about.mission.p2",
        label: "Mission — paragraph 2",
        value:
          "We started AURAVEX to build the other kind — systems shaped around real operations, deployed fast enough that they still match the business when they land, and architected so they keep matching it as the business changes.",
        long: true,
      },
      {
        id: "about.mission.p3",
        label: "Mission — paragraph 3",
        value:
          "That means fewer clients, deeper sector knowledge and senior engineers on every engagement. It is a deliberately unscalable model, and it is why the numbers on our case studies look the way they do.",
        long: true,
      },
      { id: "about.principles.eyebrow", label: "Commitments — small label", value: "How we work" },
      { id: "about.principles.title", label: "Commitments — heading", value: "Six commitments we make" },
      { id: "about.principles.accent", label: "Commitments — accented words", value: "on every engagement." },
      {
        id: "about.principles.description",
        label: "Commitments — intro",
        value: "These are not values on a wall. Each one shows up as a clause in the statement of work.",
        long: true,
      },
      ...listFields("about.principles", "Commitment", ABOUT_PRINCIPLES, [
        { key: "title", label: "title" },
        { key: "body", label: "text", long: true },
      ]),
      { id: "about.method.eyebrow", label: "Method — small label", value: "The method" },
      { id: "about.method.title", label: "Method — heading", value: "Four phases, and you can" },
      { id: "about.method.accent", label: "Method — accented words", value: "use it from week four." },
      {
        id: "about.method.description",
        label: "Method — intro",
        value: "Nothing is hidden until launch day. Every increment ships to an environment your team can log into.",
        long: true,
      },
      ...listFields("about.method", "Phase", ABOUT_METHOD, [
        { key: "title", label: "name" },
        { key: "duration", label: "duration" },
        { key: "body", label: "text", long: true },
      ]),
      { id: "about.marquee.label", label: "Label above the sector rail", value: "Organisations we build for" },
      { id: "about.stack.title", label: "Technology — heading", value: "The stack we", hint: "The small label is shared with the homepage (Home — sections › Technology eyebrow)" },
      { id: "about.stack.accent", label: "Technology — accented words", value: "stand behind." },
      {
        id: "about.stack.description",
        label: "Technology — intro",
        value:
          "Chosen for a ten-year horizon, not a launch demo. Typed end to end, observable in production, and yours to take over whenever you want it.",
        long: true,
      },
      { id: "about.security.eyebrow", label: "Security — small label", value: "Security" },
      { id: "about.security.title", label: "Security — heading", value: "Built for procurement" },
      { id: "about.security.accent", label: "Security — accented words", value: "from day one." },
      {
        id: "about.security.description",
        label: "Security — intro",
        value:
          "Every platform ships with the controls enterprise security teams ask for — because we have answered those questionnaires enough times to design around them.",
        long: true,
      },
      ...listFields("about.security", "Security item", ABOUT_SECURITY, [
        { key: "label", label: "title" },
        { key: "detail", label: "detail", long: true },
      ]),
      { id: "about.cta.eyebrow", label: "Closing section — small label", value: "Get in touch" },
      { id: "about.cta.title", label: "Closing section — heading", value: "Tell us what you are" },
      { id: "about.cta.accent", label: "Closing section — accented words", value: "trying to build." },
      { id: "about.cta.primary", label: "Closing section — main button", value: "Start a conversation" },
      { id: "about.cta.secondary", label: "Closing section — link", value: "Read case studies" },
    ],
  },
  {
    id: "contact",
    label: "Contact page",
    description: "The Contact page around the demo form: hero, process and FAQs.",
    fields: [
      { id: "contact.meta.title", label: "Browser tab title", value: "Contact" },
      {
        id: "contact.meta.description",
        label: "Search engine description",
        value: "Request a demo or book a discovery call with AURAVEX. We reply within one working day.",
        long: true,
      },
      { id: "contact.hero.eyebrow", label: "Hero pill", value: "Let’s Connect" },
      { id: "contact.hero.title", label: "Hero heading", value: "Let’s Build Your\nNext Digital" },
      { id: "contact.hero.accent", label: "Hero heading — accented word", value: "Advantage.", hint: "Sits on its own line, in the gradient" },
      {
        id: "contact.hero.intro",
        label: "Hero paragraph",
        value:
          "Talk to our experts and see how AURAVEX can help you automate operations, unlock new opportunities, and build a more connected enterprise.",
        long: true,
      },
      ...listFields("contact.trust", "Trust badge", CONTACT_TRUST, [
        { key: "label", label: "text", hint: "Press Enter for a line break" },
      ]),
      { id: "contact.faq.eyebrow", label: "FAQ — small label", value: "Before you write" },
      { id: "contact.faq.title", label: "FAQ — heading", value: "The questions we get" },
      { id: "contact.faq.accent", label: "FAQ — accented words", value: "every time." },
      ...listFields("contact.faq", "FAQ", CONTACT_FAQS, [
        { key: "q", label: "question" },
        { key: "a", label: "answer", long: true },
      ]),
    ],
  },
  {
    id: "contact-form",
    label: "Contact form",
    description: "The demo request form on the Contact page, including its error and thank-you messages.",
    fields: [
      { id: "contact.form.heading", label: "Form heading", value: "Request a Demo" },
      {
        id: "contact.form.intro",
        label: "Form intro",
        value: "Tell us about your goals, and our team will tailor a personalised demo experience.",
        long: true,
      },
      { id: "contact.form.label.name", label: "Name — label", value: "Full name" },
      { id: "contact.form.placeholder.name", label: "Name — example text", value: "Amira Hassan" },
      { id: "contact.form.label.email", label: "Email — label", value: "Work email" },
      { id: "contact.form.placeholder.email", label: "Email — example text", value: "you@company.com" },
      { id: "contact.form.label.company", label: "Company — label", value: "Company" },
      { id: "contact.form.placeholder.company", label: "Company — example text", value: "Organisation name" },
      { id: "contact.form.label.interest", label: "Interest — label", value: "Primary interest" },
      { id: "contact.form.placeholder.interest", label: "Interest — example text", value: "Pick one, or describe it" },
      {
        id: "contact.form.otherOption",
        label: "Interest — last choice",
        value: "Something else entirely",
        hint: "Listed after the products",
      },
      { id: "contact.form.label.budget", label: "Budget — label", value: "Indicative budget" },
      { id: "contact.form.placeholder.budget", label: "Budget — example text", value: "Prefer not to say" },
      ...listFields("contact.form.budgets", "Budget choice", CONTACT_BUDGETS, [{ key: "label", label: "text" }]),
      { id: "contact.form.optional", label: "“Optional” marker", value: "optional" },
      { id: "contact.form.label.message", label: "Message — label", value: "What are you trying to solve?" },
      {
        id: "contact.form.placeholder.message",
        label: "Message — example text",
        value:
          "The workflow that is costing you the most time right now, and what it would be worth to fix it.",
        long: true,
      },
      { id: "contact.form.submit", label: "Send button", value: "Request a Demo" },
      { id: "contact.form.sending", label: "Send button while sending", value: "Sending" },
      {
        id: "contact.form.privacy",
        label: "Privacy note under the button",
        value: "Your information is secure and will never be shared.",
      },
      { id: "contact.form.error.name", label: "Error — name missing", value: "We need a name to address you by." },
      { id: "contact.form.error.emailMissing", label: "Error — email missing", value: "An email address is required." },
      {
        id: "contact.form.error.emailInvalid",
        label: "Error — email not valid",
        value: "That does not look like a valid email address.",
      },
      {
        id: "contact.form.error.company",
        label: "Error — company missing",
        value: "Which organisation are you writing from?",
      },
      {
        id: "contact.form.error.message",
        label: "Error — message too short",
        value: "A sentence or two about the problem helps us prepare properly.",
      },
      { id: "contact.form.sent.title", label: "Thank-you heading", value: "Request received" },
      {
        id: "contact.form.sent.body",
        label: "Thank-you message",
        value:
          "Thanks {name} — we will come back to you within one working day with a time and a short agenda, not a brochure.",
        long: true,
        hint: "{name} is replaced with the visitor's first name",
      },
      { id: "contact.form.sent.again", label: "Thank-you button", value: "Send another" },
    ],
  },
  {
    id: "contact-booking",
    label: "Booking panel",
    description: "The calendar beside the demo form, where visitors hold a call slot.",
    fields: [
      { id: "contact.booking.heading", label: "Heading", value: "Or Book a Time Directly" },
      { id: "contact.booking.intro", label: "Line under the heading", value: "Choose a time that works for you." },
      { id: "contact.booking.button", label: "Button before a slot is picked", value: "Book Demo Call" },
      {
        id: "contact.booking.buttonPicked",
        label: "Button once a slot is picked",
        value: "Book {date}, {time}",
        hint: "{date} becomes e.g. “Oct 14”, {time} the chosen slot",
      },
      { id: "contact.booking.holding", label: "Button while booking", value: "Holding the slot…" },
      {
        id: "contact.booking.needDetails",
        label: "Reminder to fill in the form first",
        value: "Add your name and email in the form first, so we know who the slot is for.",
        long: true,
      },
      {
        id: "contact.booking.held",
        label: "Confirmation message",
        value: "Held for {date} at {time}. We will confirm to {email}.",
        long: true,
        hint: "{date} becomes e.g. “October 14”, {time} the slot, {email} the visitor's email",
      },
    ],
  },
];
