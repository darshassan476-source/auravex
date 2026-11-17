import type { DeploymentOption, Product, ProductFeature, ProductModule } from "@/lib/types";

/**
 * The six Auravex products.
 *
 * Every capability listed here was observed in the live application or is
 * stated by the product's own public site (for products whose interior needs
 * a sign-in). Nothing is added to make a product sound larger. Figures shown
 * inside the demos are demo data and are deliberately not repeated.
 *
 * Every field can be overridden from the portal (Manage Products), so this is
 * the starting point, not the last word.
 */

const mod = (name: string, description: string): ProductModule => ({
  id: name
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, ""),
  name,
  description,
});

const feat = (icon: string, title: string, description: string): ProductFeature => ({ icon, title, description });

/** Deployment routes offered on every product until the portal says otherwise. */
const STANDARD_DEPLOYMENT: DeploymentOption[] = ["cloud", "private-cloud", "custom"];

/** Enhancements that apply to any product; each product adds its own. */
const VOICE_NOTE = true;

const base = {
  stack: [] as string[],
  metrics: [],
  architecture: [],
  timeline: [],
  gallery: [],
  featured: true,
  year: "2026",
  views: 0,
  status: "available" as const,
  voiceAI: VOICE_NOTE,
};

const RECORDS: Product[] = [
  /* ------------------------------------------------------------------ */
  {
    ...base,
    id: "p-aidms",
    slug: "ai-dms",
    order: 1,
    name: "AI DMS",
    tagline: "Every document governed, from capture to disposal",
    category: "document-management",
    sector: "Enterprise Document Management",
    summary:
      "An AI-powered enterprise document and information management system covering capture, classification, search, approvals, records retention and audit in one governed workspace.",
    description:
      "AI DMS manages the complete document lifecycle — capture, classify, index, store, collaborate, review, approve, sign, publish, search, retain, archive and dispose — inside a single workspace structured around your organisation's business units, departments and teams. AI assists with classification, field extraction, duplicate detection, summaries and question answering over your documents, with every AI suggestion confirmed by a person and every action recorded in a tamper-evident audit trail.",
    icon: "file",
    accent: "#6366f1",
    tags: ["Document management", "Records management", "AI classification", "Enterprise search"],
    links: { demo: "https://purple-desert-02022f700.5.azurestaticapps.net/" },
    demoNote: "Use “Try the demo” on the sign-in page — no account is needed. Demo data resets on sign-out.",
    problems: [
      "Documents scattered across shared drives, email and personal folders, with no single source of truth.",
      "Staff losing time finding the current approved version of a document.",
      "Approvals and reviews run by email, with no visibility of where a document is stuck.",
      "Retention, legal holds and disposal handled manually, creating compliance exposure.",
      "No reliable record of who viewed, changed, shared or downloaded sensitive information.",
    ],
    features: [
      feat("scan", "Capture & indexing", "Upload, bulk upload with CSV metadata, folder upload, templates, camera scanning and email ingestion, with a processing queue for items that need review."),
      feat("search", "Enterprise search", "Keyword, exact phrase and Boolean search, plain-language questions, facets by type, department, status, classification and owner, saved searches and full-text search including previous versions."),
      feat("layers", "Document lifecycle", "Statuses from Draft through Under review, Pending approval, Approved and Published to Superseded, Expired and Archived, with versions, check-out, comments and controlled sharing."),
      feat("workflow", "Reviews, approvals & signatures", "Multi-level approval routes with delegation and overdue tracking, review requests, a workflow designer and e-signature requests with signer tracking."),
      feat("shield", "Permissions & security labels", "Role-based access scoped to organisation, workspace or department, a permission matrix, and Public, Internal, Confidential, Restricted and Secret classification labels."),
      feat("database", "Records, retention & legal holds", "Declared records and file plan, retention policies and schedules with disposition, legal holds with custodians, and tiered archiving."),
      feat("chart", "Analytics & audit", "Repository growth, storage and cycle-time analytics, workflow bottlenecks, a hash-chained audit trail with verification and export, and a security centre."),
    ],
    modules: [
      mod("Documents & Workspaces", "The governed repository, organised into workspaces with metadata and categories."),
      mod("Capture & Upload", "Every route for bringing documents in, including bulk and email ingestion."),
      mod("Reviews & Approvals", "Review requests and multi-level approval routes with delegation."),
      mod("Workflows", "Design, run and monitor review, approval, signature and records processes."),
      mod("Signatures", "Electronic signature requests and signer tracking."),
      mod("Templates", "Governed document templates with their own approval."),
      mod("AI Workspace", "Ask AI, AI tools, and review queues for extraction, classification and duplicates."),
      mod("Records & Retention", "Records, retention policies and schedules, legal holds and archive tiers."),
      mod("Organization & Access", "Business units, departments and teams, users, groups, roles and the security centre."),
      mod("Analytics & Audit", "Operational analytics and the tamper-evident audit trail."),
    ],
    aiCapabilities: [
      "AI-suggested document types with confidence scores, alternatives and confirm/correct/reject review.",
      "Field extraction from invoices, contracts and policies, each confirmed by a person.",
      "Duplicate and near-duplicate detection.",
      "Ask AI: answers grounded in all documents, selected documents or a search, citing their sources — Secret documents are always excluded.",
      "AI summaries, key dates, entities and checks of a document against policies.",
      "Natural-language search.",
      "Choice of AI provider (Azure OpenAI, Anthropic or self-hosted) and processing region, with each AI feature switchable on or off.",
    ],
    workflows: [
      "Document review and multi-level approval with delegation",
      "Electronic signature",
      "Template approval",
      "Records declaration, retention and disposition",
      "Legal hold management",
      "AI classification and extraction review",
    ],
    deployment: ["cloud", "private-cloud", "on-premises", "custom"],
    integrations: [
      "SharePoint Online",
      "Microsoft Entra ID",
      "Microsoft 365 & Outlook / Exchange Online",
      "OneDrive, Google Drive, Box and Dropbox",
      "Amazon S3 and Azure Blob Storage",
      "DocuSign and Adobe Acrobat Sign",
      "SAP S/4HANA, Microsoft Dynamics 365 and Oracle NetSuite",
      "Salesforce, ServiceNow and Jira",
      "Enterprise SSO (SAML) and Okta",
      "Custom webhooks and REST API",
    ],
    industries: [
      "Government and Public Sector",
      "Healthcare and Hospitals",
      "Real Estate Development",
      "Construction and Delivery",
      "IT and Technology",
    ],
    optionalModules: [
      mod("Records Management", "File plan, declared records, vital records and disposition."),
      mod("Legal Holds", "Matters, custodians and acknowledgement tracking."),
      mod("Electronic Signatures", "Signature requests connected to your signature provider."),
      mod("Archive Tiers", "Warm, cold and deep archive storage with retrieval requests."),
      mod("Security Center", "Risk score, sign-ins, sharing, downloads and API activity in one view."),
    ],
    aiEnhancements: [
      mod("Ask AI over your documents", "Question answering with cited sources."),
      mod("AI classification", "Suggested document types and security labels."),
      mod("AI field extraction", "Structured data pulled from invoices, contracts and policies."),
      mod("AI summaries & policy checks", "Summaries, key dates and compliance checks on documents."),
    ],
    customization: [
      "Metadata schemas, categories and document types",
      "Organisation structure and permission model",
      "Approval routes and workflow designs",
      "Retention schedules and legal hold rules",
      "Languages (six, including right-to-left) and branding",
    ],
  },

  /* ------------------------------------------------------------------ */
  {
    ...base,
    id: "p-aldar",
    slug: "aldar-sustainability-platform",
    order: 2,
    name: "Aldar Sustainability Platform",
    tagline: "Sustainability and community outreach, managed in one place",
    category: "sustainability",
    sector: "Sustainability & Community",
    summary:
      "An enterprise platform for sustainability operations, community outreach, initiatives, budgets, stakeholders and reporting — bilingual in English and Arabic.",
    description:
      "The Sustainability Platform brings an organisation's environmental performance and community programmes into one governed system. Teams track energy, water, waste and carbon against targets, plan and budget initiatives, run outreach programmes with volunteers and beneficiaries, manage partners and NGOs, and route initiatives, budgets and annual plans through multi-stage approvals — with executive dashboards and a report builder on top.",
    icon: "leaf",
    accent: "#10b981",
    tags: ["Sustainability", "ESG reporting", "Community outreach", "Approvals"],
    links: { demo: "https://aldar-sustainability-platform.netlify.app/" },
    demoNote: "Opens directly into the demo environment with fictional data.",
    problems: [
      "Sustainability data spread across spreadsheets, with no consistent view of KPIs against targets.",
      "Community programmes, volunteers and beneficiaries tracked separately from the budgets that fund them.",
      "Initiatives and budget requests approved by email, with no SLA tracking.",
      "Leadership reports assembled manually for every board or stakeholder meeting.",
    ],
    features: [
      feat("chart", "Executive dashboard", "KPIs for initiatives, beneficiaries, budget, volunteer hours, carbon, energy, water, waste and satisfaction against the prior year, with filters, drill-downs, a location map and PDF export."),
      feat("leaf", "Environmental management", "Energy, water, waste and recycling, and Scope 1, 2 and 3 carbon emissions with intensity and target-versus-actual tracking."),
      feat("users", "Community outreach", "Programmes and campaigns, community events, beneficiaries, volunteers (registration, assignment, attendance, recognition) and community feedback with sentiment analysis."),
      feat("target", "Initiative management", "Initiatives with milestones and tasks, where milestone status follows task completion."),
      feat("trending", "Planning & budgets", "Annual planning, budget allocation and expense tracking with requested, approved, actual and forecast figures."),
      feat("network", "Stakeholder management", "Partner and NGO register, contributions, engagement scoring and a stakeholder map."),
      feat("file", "Reports & report builder", "Standard sustainability, community impact and financial reports with Excel and PDF export, plus a report builder with saved templates."),
    ],
    modules: [
      mod("Executive Dashboard", "The leadership view across sustainability, outreach and budgets."),
      mod("Sustainability Management", "Overview, initiatives, environmental KPIs, energy, water, waste, carbon and green initiatives."),
      mod("Community Outreach", "Programmes, events, beneficiaries, volunteers and community feedback."),
      mod("Planning & Budgets", "Annual planning, budget allocation and expense tracking."),
      mod("Initiative Management", "Initiatives, milestones and tasks, and approvals."),
      mod("Stakeholder Management", "Partners, NGOs and the stakeholder directory."),
      mod("Analytics & Reports", "Sustainability, community impact and financial reports, and the report builder."),
      mod("Administration", "Users, roles and permissions, master data, KPI and workflow configuration, system settings."),
    ],
    aiCapabilities: [],
    workflows: [
      "Multi-stage initiative approval, routed by amount with SLA tracking",
      "Budget request approval",
      "Annual plan approval",
      "Approve, return and reject actions with escalation of overdue approvals",
    ],
    deployment: STANDARD_DEPLOYMENT,
    integrations: ["Excel and PDF exports", "Map services for location reporting"],
    industries: ["Real Estate Development", "Government and Public Sector", "Construction and Delivery"],
    optionalModules: [
      mod("Additional KPI frameworks", "Further KPI definitions and categories configured to your reporting framework."),
      mod("Extended report packs", "Additional standard reports for boards and stakeholders."),
    ],
    aiEnhancements: [
      mod("AI report narratives", "Draft commentary for sustainability and impact reports."),
      mod("AI assistant", "Questions answered from your sustainability and outreach data."),
    ],
    customization: [
      "KPI definitions and targets",
      "Approval stages, approver roles, SLAs and routing conditions",
      "Master data lists, locations and business units",
      "Currency, financial year and date formats",
      "Branding colours and English/Arabic interface",
    ],
  },

  /* ------------------------------------------------------------------ */
  {
    ...base,
    id: "p-agentos",
    slug: "enterprise-agentos",
    order: 3,
    name: "Enterprise AgentOS",
    tagline: "An AI workforce that works across your business systems",
    category: "ai-agents",
    sector: "Enterprise AI Agents",
    summary:
      "An enterprise AI agent operating environment: an executive agent that routes questions to department agents connected to your business systems, with approvals, permissions and a full audit trail.",
    description:
      "Enterprise AgentOS gives an organisation a governed AI workforce. An Executive Agent takes a question or instruction, decides which specialist agents to involve — development, procurement, finance, contracts, project controls, risk and others — gathers their findings and answers with figures, charts or a workflow. Agents work against connected systems within delegated authority: anything above it comes back to a person for approval, and every action is recorded and replayable.",
    icon: "bot",
    accent: "#8b5cf6",
    tags: ["AI agents", "Enterprise automation", "Orchestration", "Human-in-the-loop"],
    links: { demo: "https://enterprise-agentos.netlify.app/agentos" },
    demoNote: "Opens into a demonstration tenant with sample data.",
    problems: [
      "Leaders waiting days for answers that require data from several departments and systems.",
      "Routine checks, reports and follow-ups consuming specialist staff time.",
      "Automation that acts without clear limits, approvals or an audit trail.",
      "Knowledge locked in disconnected systems and document stores.",
    ],
    features: [
      feat("message", "Command Center", "Ask the Executive Agent in plain language; it involves the right agents and returns figures, charts or a workflow. Files can be attached."),
      feat("bot", "AI Workforce", "Department agents for development, design, master planning, costing, planning, procurement, authority, sales, finance, contracts, project controls, risk, documents and reporting."),
      feat("activity", "Live Center & task queue", "What every agent is doing now — running, queued, waiting on a person, completed or failed."),
      feat("workflow", "Agent orchestration", "Multi-agent workflows such as delay impact analysis, report pack assembly, requisition to award and payment application validation."),
      feat("check-circle", "Approvals & exceptions", "Decisions above an agent's delegated authority escalated with its recommendation attached; exceptions tracked by severity and department."),
      feat("plus", "Agent builder", "A step-by-step wizard covering software, identity, skills, knowledge, permissions and connection, with templates for common agents."),
      feat("shield", "Governance", "Per-agent permission modes, human gates, security centre and an audit trail that replays every action against a company system."),
    ],
    modules: [
      mod("Command Center", "Conversation with the Executive Agent."),
      mod("AI Workforce", "The department agents and their details, dashboards and reports."),
      mod("Live Center", "Real-time agent activity and items waiting for people."),
      mod("Work", "Tasks, approvals, exceptions and activity."),
      mod("Intelligence", "Knowledge sources, workflows, reports, dashboards and analytics."),
      mod("Systems", "Connected software and connections."),
      mod("Governance", "Audit trail, permissions, security and settings."),
    ],
    aiCapabilities: [
      "Executive Agent that routes requests to specialist agents and consolidates their findings.",
      "Department agents with their own skills, knowledge sources and system connections.",
      "Multi-agent workflow orchestration.",
      "Agent creation from templates or from scratch.",
      "Agent recommendations attached to every escalated decision.",
    ],
    workflows: [
      "Approval of actions above an agent's delegated authority",
      "Exception handling from open to resolved",
      "Scheduled and on-demand agent runs",
      "Report pack assembly and distribution",
    ],
    deployment: STANDARD_DEPLOYMENT,
    integrations: [
      "Oracle Fusion Cloud ERP and SAP Ariba",
      "Salesforce Sales Cloud",
      "SharePoint Online, Exchange Online and Microsoft Teams",
      "Power BI Service",
      "Primavera P6, Asta Powerproject and Autodesk Construction Cloud",
      "Argus Developer and CostX",
      "Docusign eSignature",
      "PostgreSQL, SQL Server, MongoDB Atlas and Azure Blob Storage",
      "Custom REST and graph gateways",
    ],
    industries: ["Real Estate Development", "Construction and Delivery", "IT and Technology", "Government and Public Sector"],
    optionalModules: [
      mod("Additional department agents", "Further specialist agents for your departments."),
      mod("Custom agent workflows", "Multi-agent workflows designed around your processes."),
      mod("Additional system connections", "Connections to systems beyond the standard set."),
    ],
    aiEnhancements: [
      mod("Custom-trained agent skills", "Skills and knowledge tailored to your organisation."),
      mod("Scheduled autonomous runs", "Agents that run on a schedule within approved limits."),
    ],
    customization: [
      "Which agents exist and what each may read, write and request",
      "Delegated authority and human approval gates",
      "Knowledge sources per agent",
      "Organisation terminology, currency and projects",
    ],
  },

  /* ------------------------------------------------------------------ */
  {
    ...base,
    id: "p-vantage",
    slug: "vantage-enterprise",
    order: 4,
    name: "Vantage Enterprise",
    tagline: "Analytics and operations for every request and decision",
    category: "enterprise-management",
    sector: "Enterprise Analytics & Operations",
    summary:
      "An AI-powered analytics and operations platform: traceable dashboards, forms and structured submissions, multi-stage approvals and governed access in one system.",
    description:
      "Vantage Enterprise combines the dashboards leadership relies on with the operational processes that produce the data. Teams build forms and collect structured submissions, route them through multi-stage approval with return-for-correction, and report on the results with dashboards whose figures can be traced back to their calculation. An AI assistant answers questions from your data and can build or edit dashboards and forms on instruction, asking for confirmation before anything destructive.",
    icon: "chart",
    accent: "#0ea5e9",
    tags: ["Analytics", "Operations", "Forms & approvals", "Governance"],
    links: { demo: "https://vantage-enterprise.netlify.app/" },
    demoNote: "Product site with sign-in for invited users. A guided demonstration is available on request.",
    problems: [
      "Requests and submissions handled through email and spreadsheets with no history.",
      "Dashboards whose numbers nobody can trace back to their source.",
      "Access to sensitive figures that cannot be limited by role or department.",
      "Board packs and recurring reports produced by hand.",
    ],
    features: [
      feat("chart", "Traceable analytics", "Dashboards with calculated fields and measures, comparison and target reporting, and calculation lineage for every figure."),
      feat("file", "Forms & submissions", "Forms that collect structured submissions with a complete request history."),
      feat("workflow", "Multi-stage approval", "Review, approval and return-for-correction on every submission."),
      feat("shield", "Governed access", "Role, department and workspace scoping with field- and row-level restriction and an immutable audit trail."),
      feat("calendar", "Scheduled reports", "Scheduled reports and board packs delivered automatically."),
      feat("sparkles", "AI assistant", "Answers questions from your data and builds or edits dashboards and forms on instruction."),
    ],
    modules: [
      mod("Analytics", "Dashboards, measures, targets and lineage."),
      mod("Operations", "Forms, submissions and request history."),
      mod("Approvals", "Multi-stage review and return-for-correction."),
      mod("Governance", "Access scoping and audit trail."),
      mod("Reporting", "Scheduled reports and board packs."),
    ],
    aiCapabilities: [
      "Questions answered from your organisation's data.",
      "Dashboards and forms built or edited from plain-language instructions.",
      "Confirmation required before any destructive action.",
    ],
    workflows: ["Form submission, review and approval", "Return for correction", "Scheduled report distribution"],
    deployment: STANDARD_DEPLOYMENT,
    integrations: ["Excel and CSV upload", "Operational databases", "Microsoft 365 sign-in", "Outlook and Teams notifications", "Microsoft Dataverse"],
    industries: ["Real Estate Development", "Government and Public Sector", "Healthcare and Hospitals", "IT and Technology"],
    optionalModules: [
      mod("Additional workspaces", "Separate workspaces for further departments."),
      mod("Board pack automation", "Recurring board and committee packs."),
    ],
    aiEnhancements: [mod("AI dashboard and form builder", "Build and edit dashboards and forms by instruction.")],
    customization: [
      "Forms, fields and approval stages",
      "Dashboards, measures and targets",
      "Access scoping by role, department and workspace",
      "Interface language, including Arabic right-to-left",
    ],
  },

  /* ------------------------------------------------------------------ */
  {
    ...base,
    id: "p-dashboards",
    slug: "enterprise-dashboards",
    order: 5,
    name: "Enterprise Dashboards",
    tagline: "Turn every data source into decisions you can trust",
    category: "business-intelligence",
    sector: "Enterprise Business Intelligence",
    summary:
      "A multi-tenant business intelligence platform: connect enterprise data sources, model the data and build dashboards by hand or by instructing an AI assistant.",
    description:
      "Enterprise Dashboards gives organisations one governed data foundation for reporting. Data is connected and imported from enterprise sources, modelled with joins, calculated fields and measures, and turned into dashboards on a drag-and-drop builder with live data and global filters. Dashboards are published as versioned snapshots that can be rolled back and delivered as scheduled email reports. An AI assistant proposes dashboard changes from plain-language requests — working from metadata, not your rows — and nothing is applied until a person accepts it.",
    icon: "chart",
    accent: "#f59e0b",
    tags: ["Business intelligence", "Dashboards", "Data modelling", "AI assist"],
    links: { demo: "https://enterprise-dashboards-app.netlify.app/" },
    demoNote: "Product site with sign-in for accounts created by an administrator. A guided demonstration is available on request.",
    problems: [
      "Reporting data spread across ERP, finance and operational databases.",
      "Dashboards built by a small team, creating a backlog for every new question.",
      "No version control or rollback when a published dashboard changes.",
      "Concern about exposing sensitive data to AI tools.",
    ],
    features: [
      feat("database", "Connect & import", "Connections to enterprise data sources with imports run as background jobs."),
      feat("layers", "Data modelling", "A join canvas, calculated fields and measures, validation and publishing of the model."),
      feat("grid", "Dashboard builder", "A 12-column drag-and-drop grid with live data, global filters, undo and a wide widget library from headline figures to Sankey, treemap, map and matrix."),
      feat("clock", "Publish & share", "Published snapshots, versions with rollback and scheduled email reports."),
      feat("sparkles", "AI Assist", "Describe a dashboard and receive reviewable proposals; changes apply only after you accept them."),
      feat("shield", "Enterprise security", "Multi-tenant isolation, six system roles plus custom roles, SSO and an append-only audit log."),
    ],
    modules: [
      mod("Data Connections", "Sources, credentials and import jobs."),
      mod("Data Model", "Joins, calculated fields, measures and validation."),
      mod("Dashboard Builder", "Layout, widgets, filters and live data."),
      mod("Publishing & Distribution", "Snapshots, versions and scheduled reports."),
      mod("AI Assist", "Conversational dashboard building with review gates."),
      mod("Administration", "Tenants, roles and audit."),
    ],
    aiCapabilities: [
      "Answers in plain language and dashboard changes returned as reviewable proposals.",
      "“Describe it, get a dashboard” generation.",
      "Proposals checked against schema, model and query plan before they can be applied.",
      "The assistant works from metadata only — it never sees data rows.",
    ],
    workflows: ["Connect → import → model → build → share", "Proposal review and acceptance for AI changes", "Versioned publishing with rollback", "Scheduled report delivery"],
    deployment: STANDARD_DEPLOYMENT,
    integrations: ["Excel workbooks", "Microsoft SQL Server", "Oracle Database", "Oracle Fusion Applications", "Microsoft Dataverse", "Microsoft Entra ID (OpenID Connect SSO)"],
    industries: ["Government and Public Sector", "Healthcare and Hospitals", "Real Estate Development", "Construction and Delivery", "IT and Technology"],
    optionalModules: [
      mod("Additional data connectors", "Connectors for further enterprise data sources."),
      mod("Executive dashboard packs", "Pre-designed dashboards for leadership reporting."),
    ],
    aiEnhancements: [mod("AI Assist", "Plain-language dashboard building with proposals you approve.")],
    customization: ["Data model and measures", "Dashboards and widget styling", "Roles and tenant structure", "Report schedules and recipients"],
  },

  /* ------------------------------------------------------------------ */
  {
    ...base,
    id: "p-buildsphere",
    slug: "buildsphere-ai",
    order: 6,
    name: "BuildSphere AI",
    tagline: "From blueprint to digital twin in one model",
    category: "construction",
    sector: "Construction & Development",
    summary:
      "An AI-powered construction and development management solution: design, coordinate, programme, cost, sell and operate a building from one model and its digital twin.",
    description:
      "BuildSphere AI connects the stages of a development around a single building model. An AI Copilot turns a description or an uploaded blueprint into massing, structure, envelope, MEP and interiors. The resulting digital twin can be explored floor by floor, linked to a 4D programme and a 5D cost model, checked for clashes, and carried through into unit sales and inventory and, after handover, operations.",
    icon: "building",
    accent: "#ef4444",
    tags: ["Construction management", "Digital twin", "4D/5D", "AI design"],
    links: { demo: "https://buildsphere-ai-app.netlify.app/command-center/" },
    demoNote: "Sign in with one of the demo accounts offered on the sign-in screen.",
    problems: [
      "Design, programme, cost and sales teams each working from different versions of the project.",
      "Quantities and cost estimates rebuilt manually whenever the design changes.",
      "Clashes discovered on site rather than in the model.",
      "Sales inventory disconnected from the building actually being delivered.",
    ],
    features: [
      feat("sparkles", "AI Copilot", "Generate massing, structure, envelope, MEP and interiors from a sentence or an uploaded blueprint."),
      feat("building", "Digital twin", "Walk the building, isolate a floor, cut a section, see the frame and open individual units."),
      feat("calendar", "4D programme", "Tasks linked to model elements, with the critical path."),
      feat("trending", "5D cost", "Quantities taken from the model, cash flow and change orders."),
      feat("scan", "Clash detection & model understanding", "Clash detection and IFC mapping of classes, identifiers and relationships."),
      feat("users", "Sales & inventory", "Unit matrix, holds, bookings and booking approvals."),
      feat("activity", "Operations twin", "Asset telemetry for the completed building."),
    ],
    modules: [
      mod("Command Center", "The project overview across design, delivery, sales and operations."),
      mod("AI Copilot", "Text- and blueprint-to-building generation."),
      mod("Digital Twin", "Interactive model exploration."),
      mod("Projects", "Programme and cost management."),
      mod("Sales", "Units, holds, bookings and approvals."),
      mod("Operations", "Asset operations and telemetry."),
      mod("Analytics", "Project and portfolio analytics."),
    ],
    aiCapabilities: [
      "Building generation from a text description.",
      "Building generation from an uploaded blueprint.",
      "Model understanding with IFC mapping.",
    ],
    workflows: ["Design to programme to cost", "Clash detection and resolution", "Unit booking and approval", "Handover to operations"],
    deployment: STANDARD_DEPLOYMENT,
    integrations: ["IFC models", "REST API and webhooks", "Single sign-on and user provisioning", "Custom integrations"],
    industries: ["Construction and Delivery", "Real Estate Development"],
    optionalModules: [
      mod("Operations twin", "Telemetry and operations for completed assets."),
      mod("Sales & inventory", "Unit sales, holds and bookings."),
      mod("API & webhooks", "Programmatic access for your own systems."),
    ],
    aiEnhancements: [mod("Blueprint-to-model generation", "Generate the building model from uploaded drawings.")],
    customization: ["Project and portfolio structure", "Cost codes and programme templates", "Roles and approval rules", "Branding"],
  },
];

/**
 * Screens captured from each product's own live site or demo, cropped to
 * leave the host's badges out. Figures visible in them are the demos'
 * fictional data. Screens uploaded in the portal take precedence.
 */
const SCREENS: Record<string, [string, string][]> = {
  "ai-dms": [
    ["Home workspace with approvals, records and AI insight", "1"],
    ["The document lifecycle, stage by stage", "2"],
  ],
  "aldar-sustainability-platform": [
    ["Executive command centre", "1"],
    ["Impact tiles and performance trends", "2"],
  ],
  "enterprise-agentos": [["Command Center — the Executive Agent and its specialists", "1"]],
  "vantage-enterprise": [
    ["Vantage Enterprise", "1"],
    ["Analytics, operations, governance and the AI assistant", "2"],
  ],
  "enterprise-dashboards": [
    ["Turn every data source into decisions", "1"],
    ["The dashboard builder", "2"],
    ["The assistant proposes changes before anything is applied", "3"],
  ],
  "buildsphere-ai": [
    ["Describe a building — get the whole thing", "1"],
    ["The live digital twin", "2"],
  ],
};

export const CATALOGUE: Product[] = RECORDS.map((p) => ({
  ...p,
  gallery: (SCREENS[p.slug] ?? []).map(([alt, n]) => ({
    id: `${p.slug}-screen-${n}`,
    type: "image" as const,
    src: `/products/${p.slug}/${n}.webp`,
    alt: `${p.name} — ${alt}`,
  })),
}));
