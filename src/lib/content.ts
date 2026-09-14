export const navigation = [
  { label: "Solutions", href: "/solutions" },
  { label: "Use Cases", href: "/use-cases" },
  { label: "Process", href: "/process" },
  { label: "About", href: "/about" },
];
export const footerNavigation = [
  ...navigation,
  { label: "Products", href: "/products" },
];
export const contact = {
  email: "",
  socials: [] as { label: string; url: string }[],
};
export const services = [
  {
    slug: "software",
    name: "Software",
    description: "Internal platforms for complex operations.",
    detail:
      "Design secure dashboards, case-management tools and operational applications tailored to the structure of your organisation.",
    symbol: "▤",
  },
  {
    slug: "ai-automation",
    name: "AI & Automation",
    description: "Applied intelligence for high-volume tasks.",
    detail:
      "Introduce assistants, document processing and automated task flows where they can save measurable time.",
    symbol: "✳",
  },
  {
    slug: "saas",
    name: "SaaS",
    description: "Multi-tenant platforms ready for recurring use.",
    detail:
      "Engineer accounts, subscriptions, administration and the product foundations needed to serve a growing customer base.",
    symbol: "◫",
  },
  {
    slug: "web-mobile",
    name: "Web & Mobile",
    description: "Customer-facing experiences across every screen.",
    detail:
      "Deliver responsive portals, commerce journeys and mobile applications with clear interaction design.",
    symbol: "▯",
  },
  {
    slug: "integrations",
    name: "Integrations",
    description: "Reliable connections across your technology stack.",
    detail:
      "Build API connections, synchronisation services and data pipelines that keep critical systems aligned.",
    symbol: "⇄",
  },
  {
    slug: "custom-solutions",
    name: "Custom Solutions",
    description: "Cross-disciplinary builds for unusual requirements.",
    detail:
      "Combine product strategy, experience design and engineering when the requirement does not fit a standard category.",
    symbol: "⌘",
  },
];
export const homeFocus = [
  {
    label: "RUN THE BUSINESS",
    title: "Give operations one reliable rhythm.",
    text: "Create clarity around ownership, progress and the work that matters next.",
    href: "/use-cases#operations",
  },
  {
    label: "JOIN THE DOTS",
    title: "Let information move without chasing it.",
    text: "Reduce handovers and give every team a consistent view of the facts.",
    href: "/use-cases#connected-systems",
  },
  {
    label: "ENTER THE MARKET",
    title: "Test a digital proposition with customers.",
    text: "Move from early conviction to evidence, adoption and a credible path to growth.",
    href: "/use-cases#new-products",
  },
];
export const useCases = [
  {
    slug: "operations",
    solution: "custom-solutions",
    title: "Work disappears between handovers.",
    problem:
      "Requests arrive through several channels, responsibility is unclear and leaders cannot see progress without chasing updates.",
    response:
      "Establish a shared operating view with defined stages, ownership and the information each person needs to move work forward.",
    outcomes: ["Visible workload", "Faster handovers", "Fewer missed actions"],
  },
  {
    slug: "automation",
    solution: "ai-automation",
    title: "Routine admin consumes skilled time.",
    problem:
      "Teams repeatedly prepare the same documents, summaries or data updates instead of focusing on higher-value work.",
    response:
      "Identify the stable rules, automate those steps and keep review points around exceptions or judgment.",
    outcomes: ["Shorter queues", "Consistent execution", "More expert capacity"],
  },
  {
    slug: "connected-systems",
    solution: "integrations",
    title: "Different systems tell different stories.",
    problem:
      "Records fall out of sync, teams reconcile figures by hand and important changes do not reach every place they should.",
    response:
      "Define the source of truth and create dependable flows that carry updates across the organisation.",
    outcomes: ["Trusted records", "Timely updates", "Less reconciliation"],
  },
  {
    slug: "customer-experience",
    solution: "web-mobile",
    title: "Customers wait for tasks they could complete.",
    problem:
      "Simple requests depend on office hours, follow-up calls or internal assistance, adding delay for customers and staff.",
    response:
      "Redesign the journey around clear self-service, transparent status and support at the moments that genuinely need it.",
    outcomes: ["Anytime access", "Lower service demand", "Greater confidence"],
  },
  {
    slug: "new-products",
    solution: "saas",
    title: "A promising idea needs commercial proof.",
    problem:
      "The opportunity feels compelling, but the audience, proposition and release priorities still contain important assumptions.",
    response:
      "Translate the concept into a focused market test that can reveal demand before the investment grows.",
    outcomes: ["Sharper positioning", "Evidence from users", "Informed investment"],
  },
  {
    slug: "existing-software",
    solution: "software",
    title: "A legacy system is limiting the next stage.",
    problem:
      "The technology is costly to change, difficult to navigate or unable to support the organisation’s current direction.",
    response:
      "Assess the constraints, protect what still works and modernise in stages that control risk and disruption.",
    outcomes: ["Reduced technical risk", "Easier change", "A managed transition"],
  },
];
export const engagementTypes = [
  {
    title: "Commission a platform",
    text: "Create a complete digital asset for customers, partners or employees, from product definition through release.",
  },
  {
    title: "Equip an operation",
    text: "Give a team purpose-built infrastructure for specialised work that generic software cannot support well.",
  },
  {
    title: "Extend your stack",
    text: "Add a targeted layer of intelligence, connectivity or modern experience to technology you already own.",
  },
];
export const process = [
  {
    name: "Frame",
    text: "Establish the decision to be made.",
    detail:
      "We gather commercial context, user realities, constraints and evidence until the objective and boundaries are explicit.",
    outputs: ["Opportunity statement", "Decision criteria", "Known constraints"],
  },
  {
    name: "Shape",
    text: "Turn context into a viable route.",
    detail:
      "We map journeys, test assumptions and define the smallest coherent release before engineering effort expands.",
    outputs: ["Experience direction", "Release scope", "Technical blueprint"],
  },
  {
    name: "Deliver",
    text: "Move from plans to working software.",
    detail:
      "Design, engineering and quality assurance progress together, with regular demonstrations and decisions recorded as they happen.",
    outputs: ["Tested increments", "Decision log", "Release readiness"],
  },
  {
    name: "Evolve",
    text: "Learn from operation after launch.",
    detail:
      "Usage, feedback and business change guide the backlog so investment continues where it produces the strongest return.",
    outputs: ["Operational insight", "Prioritised backlog", "Growth roadmap"],
  },
];
export const deliveryPrinciples = [
  {
    title: "Decisions stay visible.",
    text: "Trade-offs, assumptions and ownership are recorded so the team can move without ambiguity.",
  },
  {
    title: "Scope earns its place.",
    text: "Every feature must support the agreed outcome or wait for a later release.",
  },
  {
    title: "Feedback has a cadence.",
    text: "Regular reviews replace late surprises and keep stakeholders close to the product.",
  },
  {
    title: "Release is a beginning.",
    text: "Launch creates evidence; evidence guides what deserves attention next.",
  },
];
export const aboutValues = [
  {
    title: "Business fluency.",
    text: "We listen for commercial context, operational detail and the human reality behind the brief.",
  },
  {
    title: "Independent judgment.",
    text: "We recommend the smallest sensible route, even when that means building less.",
  },
  {
    title: "Craft with purpose.",
    text: "Design and engineering choices earn their place by making the experience clearer, faster or more dependable.",
  },
  {
    title: "Long-term responsibility.",
    text: "We consider ownership, maintainability and future change before the first release.",
  },
];
export type Product = {
  slug: string;
  name: string;
  description: string;
  category: string;
  status: "coming-soon" | "live";
  logo?: string;
  screenshot?: string;
  pricing?: string;
  demo?: string;
  website?: string;
  cta?: string;
};
export const products: Product[] = [];
export const requirementTypes = [
  "New idea",
  "Existing business problem",
  "Improve an existing system",
  "Automate a process",
  "Not sure",
];
