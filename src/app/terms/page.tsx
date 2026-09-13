import Link from "next/link";
export const metadata = {
  title: "Terms",
  description:
    "Terms for using the Khalq website and submitting a project enquiry. Project agreements are handled separately.",
  alternates: { canonical: "/terms" },
};
export default function Terms() {
  const email = process.env.CONTACT_EMAIL;
  return (
    <main id="main" className="container legal">
      <span className="eyebrow">A FEW BASICS</span>
      <h1>Terms.</h1>
      <p>Last updated: 13 September 2026.</p>
      <h2>About this website</h2>
      <p>
        This website introduces Khalq and provides a way to discuss potential
        projects. Information here is general and may change. Descriptions of
        future products do not promise availability or a release date.
      </p>
      <h2>Project enquiries and proposals</h2>
      <p>
        Submitting an enquiry does not create a service agreement or a
        commitment to deliver a project. Scope, pricing, timelines, ownership
        and support are agreed separately in writing before work begins. A
        signed project agreement takes precedence over general website
        information.
      </p>
      <h2>Using the website</h2>
      <p>
        Please provide accurate contact details and only share material you are
        entitled to share. Do not submit spam, attempt unauthorized access,
        interfere with the service or use the website unlawfully.
      </p>
      <h2>Intellectual property</h2>
      <p>
        The Khalq name, original website content and design belong to Khalq or
        their respective owners. You may view and share links to this website.
        Reusing protected material beyond what the law permits requires
        permission.
      </p>
      <h2>Third-party services</h2>
      <p>
        Links or integrations may involve services operated by others. Their own
        terms and privacy practices apply. Khalq does not control third-party
        websites or guarantee their availability or content.
      </p>
      <h2>Availability and limitations</h2>
      <p>
        We aim to keep this website accurate and available but cannot promise
        uninterrupted or error-free access. Use reasonable judgment before
        relying on general website information. To the extent permitted by
        applicable law, Khalq is not responsible for indirect loss arising
        solely from use of this informational website. Nothing here excludes
        rights or responsibilities that cannot lawfully be excluded.
      </p>
      <h2>Changes and contact</h2>
      <p>
        We may revise these website terms as the service evolves; the date above
        identifies the current version. For questions, contact us through{" "}
        {email ? (
          <a href={`mailto:${email}`}>{email}</a>
        ) : (
          <Link href="/#project">the project form</Link>
        )}
        .
      </p>
    </main>
  );
}
