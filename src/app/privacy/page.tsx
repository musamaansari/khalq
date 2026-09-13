import Link from "next/link";
export const metadata = {
  title: "Privacy",
  description:
    "How Khalq handles project enquiries, contact details, essential attribution and minimal website analytics.",
  alternates: { canonical: "/privacy" },
};
export default function Privacy() {
  const entity = process.env.LEGAL_ENTITY_NAME;
  const email = process.env.CONTACT_EMAIL;
  return (
    <main id="main" className="container legal">
      <span className="eyebrow">YOUR INFORMATION</span>
      <h1>Privacy.</h1>
      <p>Last updated: 13 September 2026.</p>
      <p>
        Khalq{entity ? `, operated by ${entity},` : ""} uses information you
        share to understand your project, respond to you and improve how this
        website works.
      </p>
      <h2>Project enquiries</h2>
      <p>
        We collect your name, email or international phone number, optional
        company, and the idea or problem you describe. We also record the
        project category, enquiry status, source page, initial landing page and
        available campaign information. Please do not submit passwords, payment
        details or confidential information that is unnecessary for the
        conversation.
      </p>
      <h2>Essential storage and technical information</h2>
      <p>
        After you interact with the site, an essential first-party cookie
        preserves your original campaign and referring website for up to 24
        hours. It is signed to detect changes and is not accessible to page
        scripts. The browser also keeps the initial visit context in session
        storage so it survives navigation. Referring paths and query strings are
        discarded.
      </p>
      <p>
        To prevent abuse we use a hashed network identifier rather than storing
        your raw IP address in the enquiry database. The enquiry’s anti-abuse
        hash is removed after 24 hours by the background maintenance process.
        Hosting and email providers may separately process technical logs
        necessary to operate their services.
      </p>
      <h2>Minimal analytics</h2>
      <p>
        We record visits and genuine actions such as starting a requirement,
        completing it and submitting a lead. A short-lived, pseudonymous
        browser-tab identifier connects these actions for conversion
        measurement. Analytics does not receive your name, contact details or
        requirement text. We use no advertising trackers and respect Do Not
        Track and Global Privacy Control. Analytics records are normally removed
        after 90 days.
      </p>
      <h2>How information is used and shared</h2>
      <p>
        We use enquiry information for project assessment and communication,
        follow-up, security and service improvement. Our hosting, database and
        configured email providers process information needed to provide those
        services. Internal notification emails contain the enquiry and contact
        details. We do not sell your personal information.
      </p>
      <h2>Security and retention</h2>
      <p>
        We use restricted database access, encrypted website connections and
        other proportionate safeguards. No online system can guarantee absolute
        security. We review inactive enquiries after 12 months and keep
        information only while needed for the enquiry, an ongoing relationship
        or applicable obligations. Email and backup copies follow their own
        retention schedules.
      </p>
      <h2>International visitors</h2>
      <p>
        Khalq welcomes international enquiries. Depending on the hosting region
        and providers selected, information may be processed outside your
        country. We consider appropriate safeguards when choosing and
        configuring those services.
      </p>
      <h2>Your questions and choices</h2>
      <p>
        You can ask about access, correction or deletion of your information, or
        stop project follow-up, by{" "}
        {email ? (
          <a href={`mailto:${email}`}>{email}</a>
        ) : (
          <>
            using the <Link href="/#project">project form</Link>
          </>
        )}{" "}
        or replying to our project conversation. We may need to verify your
        request. Some information may need to be retained for legitimate
        operational or legal reasons.
      </p>
      <h2>Policy updates</h2>
      <p>
        We may update this policy as our services or practices change. The date
        above identifies the current version.
      </p>
    </main>
  );
}
