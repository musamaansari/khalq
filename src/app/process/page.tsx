import { Closing } from "@/components/sections";
import { principles, process } from "@/lib/content";

export const metadata = {
  title: "Process",
  description:
    "A clear, practical process for understanding, designing, building and improving useful technology with Khalq.",
  alternates: { canonical: "/process" },
};

export default function Process() {
  return (
    <main id="main">
      <section className="container page-intro">
        <span className="eyebrow">HOW WE WORK</span>
        <h1>
          A clear path
          <br />
          <span className="gradient-text">from need to useful.</span>
        </h1>
        <p>
          No complicated starting point. We begin with your business, make the
          important decisions clear and build in useful steps.
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
              <h2>Simple principles. Better decisions.</h2>
            </div>
          </div>
          <div className="principles-grid compact">
            {principles.map((principle) => (
              <article key={principle.title}>
                <h3>{principle.title}</h3>
                <p>{principle.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
      <Closing />
    </main>
  );
}
