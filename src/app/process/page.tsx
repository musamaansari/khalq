import { Closing } from "@/components/sections";
import { deliveryPrinciples, process } from "@/lib/content";

export const metadata = {
  title: "Process",
  description:
    "Discover Khalq’s four-stage delivery method for framing decisions, shaping scope, releasing software and guiding post-launch evolution.",
  alternates: { canonical: "/process" },
};

export default function Process() {
  return (
    <main id="main">
      <section className="container page-intro">
        <span className="eyebrow">HOW WE WORK</span>
        <h1>
          From first conversation
          <br />
          <span className="gradient-text">to confident release.</span>
        </h1>
        <p>
          A visible sequence of decisions keeps scope, investment and
          expectations aligned from discovery through operation.
        </p>
      </section>
      <section className="container process-list">
        {process.map((step, index) => (
          <article key={step.name}>
            <div className="process-list-number">0{index + 1}</div>
            <div>
              <span className="eyebrow">{step.text}</span>
              <h2>{step.name}</h2>
              <p>{step.detail}</p>
            </div>
            <ul aria-label={`What ${step.name} produces`}>
              {step.outputs.map((output) => (
                <li key={output}>{output}</li>
              ))}
            </ul>
          </article>
        ))}
      </section>
      <section className="content-band">
        <div className="container">
          <div className="section-heading">
            <div>
              <span className="eyebrow">THROUGHOUT THE WORK</span>
              <h2>The disciplines that protect delivery.</h2>
            </div>
          </div>
          <div className="principles-grid compact">
            {deliveryPrinciples.map((principle) => (
              <article key={principle.title}>
                <h3>{principle.title}</h3>
                <p>{principle.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
      <Closing
        eyebrow="BEGIN WITH CONTEXT"
        title={["Ready for the", "first conversation?"]}
        description="Bring the background, constraints and goal. Together, we’ll define the next decision."
        formQuestion="What context should we understand first?"
        formPlaceholder="Share the background and constraints…"
        formHint="Context now prevents false assumptions later."
        formButtonLabel="Begin the Conversation"
      />
    </main>
  );
}
