import isEmail from "validator/lib/isEmail.js";
import { parsePhoneNumberFromString } from "libphonenumber-js/min";
import { cleanAttribution } from "./attribution.ts";
import { pages, projectTypes, uuidPattern } from "./tracking.ts";
import { positiveInt } from "./config.ts";
export const kinds = [
  "New idea",
  "Existing business problem",
  "Improve an existing system",
  "Automate a process",
  "Not sure",
];
export class InputError extends Error {}
export function field(value: unknown, max: number, required = false): string {
  if (value == null && !required) return "";
  if (typeof value !== "string")
    throw new InputError("Please check the information you entered.");
  const result = value.trim().normalize("NFC");
  if (
    result.length > max ||
    (required && !result) ||
    /[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/.test(result)
  )
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
    Date.now() - v.startedAt <
      positiveInt(process.env.SPAM_MIN_FORM_MS, 2000, 60000) ||
    Date.now() - v.startedAt > 86400000
  )
    throw new InputError(
      "Please take a moment to review your enquiry and try again.",
    );
  const name = field(v.name, 120, true),
    contact = field(v.contact, 254, true),
    requirement = field(v.requirement, 5000, true);
  if (/[\r\n]/.test(name))
    throw new InputError("Please enter your name on one line.");
  if (requirement.length < 10)
    throw new InputError(
      "Please describe your requirement in at least 10 characters.",
    );
  let email = "",
    phone = "";
  if (
    isEmail(contact, {
      allow_display_name: false,
      allow_utf8_local_part: true,
      require_tld: true,
    })
  ) {
    const at = contact.lastIndexOf("@");
    email = contact.slice(0, at) + "@" + contact.slice(at + 1).toLowerCase();
  } else if (/^(\+|00)[\d\s().-]+$/.test(contact)) {
    const parsed = parsePhoneNumberFromString(contact.replace(/^00/, "+"));
    if (parsed?.isPossible()) phone = parsed.number;
  }
  if (!email && !phone)
    throw new InputError(
      "Please enter a valid email or an international WhatsApp number starting with + and your country code.",
    );
  const requirementType = field(v.requirementType, 80) || "Not sure";
  if (!kinds.includes(requirementType))
    throw new InputError("Please choose a valid project type.");
  const projectType = field(v.projectType, 40) || "not-sure";
  if (!projectTypes.includes(projectType))
    throw new InputError("Please choose a valid project category.");
  const sourcePage = field(v.sourcePage, 200) || "/";
  if (!pages.includes(sourcePage)) throw new InputError("Invalid source page.");
  const submissionKey = field(v.submissionKey, 36);
  if (submissionKey && !uuidPattern.test(submissionKey))
    throw new InputError("Please restart your enquiry.");
  const attribution = cleanAttribution(v);
  return {
    name,
    email,
    phone,
    company: field(v.company, 160),
    requirement,
    requirementType,
    projectType,
    sourcePage,
    submissionKey,
    ...attribution,
  };
}
export type LeadInput = ReturnType<typeof validateLead>;
