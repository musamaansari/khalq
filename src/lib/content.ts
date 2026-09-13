export const navigation = [
  { label: "Solutions", href: "/solutions" },
  { label: "Products", href: "/products" },
  { label: "About", href: "/about" },
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
export const process = [
  {
    name: "Tell us",
    text: "Share the idea, problem or process you want to improve.",
  },
  {
    name: "We understand",
    text: "We identify the right technology and approach.",
  },
  { name: "We build", text: "We design, develop and deliver the solution." },
  {
    name: "You grow",
    text: "Use, improve and scale it as your business evolves.",
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
