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
    description: "Business systems designed around real workflows.",
    detail:
      "Bring your operations into one place, with software that fits the way your team works.",
    symbol: "▤",
  },
  {
    slug: "ai-automation",
    name: "AI & Automation",
    description: "Intelligent tools that remove repetitive work.",
    detail:
      "Give your team time back. Connect repetitive tasks, make information easier to find, and put AI to practical use.",
    symbol: "✳",
  },
  {
    slug: "saas",
    name: "SaaS",
    description: "Scalable products built for recurring use.",
    detail:
      "Take a product from the first useful version to a platform your customers can rely on.",
    symbol: "◫",
  },
  {
    slug: "web-mobile",
    name: "Web & Mobile",
    description: "Digital experiences designed around users.",
    detail:
      "Build responsive web applications and mobile experiences that make everyday tasks feel simple.",
    symbol: "▯",
  },
  {
    slug: "integrations",
    name: "Integrations",
    description: "Connect the tools your business already depends on.",
    detail:
      "Let your systems talk to each other. Connect APIs, share data, and reduce work between tools.",
    symbol: "⇄",
  },
  {
    slug: "custom-solutions",
    name: "Custom Solutions",
    description: "When an off-the-shelf solution isn’t enough.",
    detail:
      "Create custom business systems around a challenge that existing tools don’t quite solve.",
    symbol: "⌘",
  },
];
export const homeFocus = [
  {
    label: "RUN BETTER",
    title: "Improve how work gets done.",
    text: "Replace scattered steps with clear software and practical automation.",
    href: "/use-cases#operations",
  },
  {
    label: "CONNECT THE BUSINESS",
    title: "Make your systems work together.",
    text: "Connect tools, data and teams so information moves without repeated effort.",
    href: "/use-cases#connected-systems",
  },
  {
    label: "CREATE WHAT’S NEXT",
    title: "Turn an idea into a useful product.",
    text: "Shape, build and improve a digital product around a real customer need.",
    href: "/use-cases#new-products",
  },
];
export const useCases = [
  {
    slug: "operations",
    solution: "custom-solutions",
    title: "Bring operations into one place.",
    problem:
      "Important work is spread across spreadsheets, inboxes, messages and disconnected tools.",
    response:
      "Create one practical system for the workflow, information and decisions your team handles every day.",
    outcomes: [
      "Clear ownership",
      "Less repeated entry",
      "A reliable view of work",
    ],
  },
  {
    slug: "automation",
    solution: "ai-automation",
    title: "Remove repetitive work.",
    problem:
      "People spend valuable time copying information, preparing routine updates or following the same steps manually.",
    response:
      "Automate the predictable parts while keeping people in control of the decisions that need judgment.",
    outcomes: [
      "Faster turnaround",
      "Fewer avoidable errors",
      "More time for useful work",
    ],
  },
  {
    slug: "connected-systems",
    solution: "integrations",
    title: "Connect systems and data.",
    problem:
      "Your business tools work separately, creating gaps, delays and conflicting versions of the same information.",
    response:
      "Build secure integrations and shared workflows that move the right data to the right place.",
    outcomes: [
      "Consistent information",
      "Smoother handovers",
      "Less manual coordination",
    ],
  },
  {
    slug: "customer-experience",
    solution: "web-mobile",
    title: "Make customer interactions simpler.",
    problem:
      "Customers rely on calls, emails or slow internal steps for tasks they should be able to complete easily.",
    response:
      "Create a focused portal, web application or mobile experience around the customer journey.",
    outcomes: [
      "Easier self-service",
      "Clearer communication",
      "A more useful experience",
    ],
  },
  {
    slug: "new-products",
    solution: "saas",
    title: "Launch a new digital product.",
    problem:
      "You have a strong idea, but need to define the first useful version and make the right technical choices.",
    response:
      "Turn the idea into a clear product scope, build the essential experience and create a foundation that can evolve.",
    outcomes: [
      "A focused first release",
      "Real user learning",
      "A scalable direction",
    ],
  },
  {
    slug: "existing-software",
    solution: "software",
    title: "Improve software that no longer fits.",
    problem:
      "An existing system is difficult to use, expensive to maintain or holding back the way the business now operates.",
    response:
      "Simplify, integrate or rebuild the parts that create the most friction without changing everything at once.",
    outcomes: [
      "Lower operational friction",
      "Better adoption",
      "A practical path forward",
    ],
  },
];
export const engagementTypes = [
  {
    title: "A new product",
    text: "Define and build the first useful version of a SaaS platform, portal, web application or mobile experience.",
  },
  {
    title: "A business system",
    text: "Create software around a workflow that generic tools, spreadsheets or manual processes cannot handle well.",
  },
  {
    title: "An improvement",
    text: "Automate a bottleneck, connect existing tools or modernize the part of a system causing the most friction.",
  },
];
export const process = [
  {
    name: "Tell us",
    text: "Share the idea, problem or process you want to improve.",
    detail:
      "We begin with the business context: what is happening now, who is affected and what a better outcome would look like.",
    outputs: ["Business goal", "Current workflow", "Success measure"],
  },
  {
    name: "We understand",
    text: "We identify the right technology and approach.",
    detail:
      "We turn the problem into a clear, prioritized plan. Technology follows the need rather than leading the conversation.",
    outputs: ["Focused scope", "Recommended approach", "Delivery plan"],
  },
  {
    name: "We build",
    text: "We design, develop and deliver the solution.",
    detail:
      "We create the experience and the system together, sharing useful progress early so decisions stay grounded in the real product.",
    outputs: ["Working releases", "Regular feedback", "Quality checks"],
  },
  {
    name: "You grow",
    text: "Use, improve and scale it as your business evolves.",
    detail:
      "After launch, we learn from real use, improve what matters and help the technology continue to fit the business.",
    outputs: [
      "Launch support",
      "Measured improvements",
      "A scalable foundation",
    ],
  },
];
export const principles = [
  {
    title: "Start with the problem.",
    text: "A clear understanding of the business need prevents unnecessary features and the wrong technical choices.",
  },
  {
    title: "Make it useful early.",
    text: "Working progress creates better feedback than long documents and keeps the project focused on real value.",
  },
  {
    title: "Design for adoption.",
    text: "The right solution should feel clear to the people who use it and fit naturally into the way work happens.",
  },
  {
    title: "Build for change.",
    text: "Businesses evolve. The product should be able to improve without becoming fragile or unnecessarily complex.",
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
