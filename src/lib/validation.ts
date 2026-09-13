export const kinds = [
  "New idea",
  "Existing business problem",
  "Improve an existing system",
  "Automate a process",
  "Not sure",
];
export class InputError extends Error {}
function field(value: unknown, max: number, required = false): string {
  if (value == null && !required) return "";
  if (typeof value !== "string")
    throw new InputError("Please check the information you entered.");
  const result = value.trim();
  if (result.length > max || (required && !result))
    throw new InputError(
      "Please complete the required fields within the character limits.",
    );
  return result;
}
export function validateLead(value: unknown) {
  if (!value || typeof value !== "object" || Array.isArray(value))
    throw new InputError("Please check your enquiry.");
  const v = value as Record<string, unknown>;
  if (field(v.website, 200))
    throw new InputError("Unable to accept this enquiry.");
  if (
    typeof v.startedAt !== "number" ||
    !Number.isFinite(v.startedAt) ||
    Date.now() - v.startedAt < 2000 ||
    Date.now() - v.startedAt > 86400000
  )
    throw new InputError(
      "Please take a moment to review your enquiry and try again.",
    );
  const name = field(v.name, 120, true),
    contact = field(v.contact, 254, true),
    requirement = field(v.requirement, 5000, true);
  if (requirement.length < 10)
    throw new InputError(
      "Please describe your requirement in at least 10 characters.",
    );
  const email = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact)
    ? contact.toLowerCase()
    : "";
  const phone =
    !email &&
    /^\+?[\d\s().-]{7,30}$/.test(contact) &&
    contact.replace(/\D/g, "").length >= 7 &&
    contact.replace(/\D/g, "").length <= 15
      ? contact
      : "";
  if (!email && !phone)
    throw new InputError(
      "Please enter a valid email or WhatsApp number, including your country code.",
    );
  const requirementType = field(v.requirementType, 80) || "Not sure";
  if (!kinds.includes(requirementType))
    throw new InputError("Please choose a valid project type.");
  const sourcePage = field(v.sourcePage, 200) || "/";
  if (!/^\/[a-zA-Z0-9/_-]*$/.test(sourcePage))
    throw new InputError("Invalid source page.");
  let referrer = field(v.referrer, 2000);
  try {
    referrer = referrer ? new URL(referrer).origin : "";
  } catch {
    referrer = "";
  }
  return {
    name,
    email,
    phone,
    company: field(v.company, 160),
    requirement,
    requirementType,
    sourcePage,
    utmSource: field(v.utmSource, 200),
    utmMedium: field(v.utmMedium, 200),
    utmCampaign: field(v.utmCampaign, 200),
    referrer,
  };
}
export type LeadInput = ReturnType<typeof validateLead>;
