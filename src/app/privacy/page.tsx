export const metadata = {
  title: "Privacy",
  alternates: { canonical: "/privacy" },
};
export default function Privacy() {
  return (
    <main id="main" className="container legal">
      <span className="eyebrow">YOUR INFORMATION</span>
      <h1>Privacy.</h1>
      <p>
        When you submit a project requirement, Khalq collects your name, email
        or phone number, optional company name and the requirement you share. We
        use this information to assess and respond to your enquiry.
      </p>
      <h2>What we store</h2>
      <p>
        We also store the source page, campaign parameters and referring website
        supplied with your enquiry to understand how people find us. Please
        avoid including passwords, payment details or other sensitive
        information in your description.
      </p>
      <h2>Analytics and protection</h2>
      <p>
        We count a small set of website interactions, such as starting a project
        and completing a requirement. These counts do not contain your form
        content or use advertising cookies. We respect the browser’s Do Not
        Track setting. For abuse prevention, we temporarily store a hashed
        network identifier.
      </p>
      <h2>Access and retention</h2>
      <p>
        Enquiries are stored privately and used for project conversations.
        Access is limited to the people and infrastructure needed to handle
        them. Khalq does not sell enquiry data. Information is kept while it
        remains necessary to handle the enquiry or an ongoing business
        relationship.
      </p>
      <h2>Your choices</h2>
      <p>
        You can request access, correction or deletion by replying to the person
        who contacts you about your enquiry, or by using the project form and
        stating your request. Information needed to meet legal obligations may
        be retained.
      </p>
    </main>
  );
}
