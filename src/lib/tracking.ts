export const pages = [
  "/",
  "/solutions",
  "/use-cases",
  "/process",
  "/products",
  "/about",
  "/privacy",
  "/terms",
];
export const projectTypes = [
  "not-sure",
  "software",
  "ai-automation",
  "saas",
  "web-mobile",
  "integrations",
  "custom-solutions",
];
export const events = [
  "visit",
  "start_project",
  "requirement_started",
  "requirement_completed",
  "lead_submitted",
  "contact_clicked",
  "product_interest",
] as const;
export type EventName = (typeof events)[number];
export const ctaLocations = [
  "hero",
  "closing",
  "navigation",
  "footer",
  "solution",
  "page",
];
export const uuidPattern =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
