import Link from "next/link";
import { Arrow } from "@/components/brand";
import { Closing } from "@/components/sections";
import { useCases } from "@/lib/content";

export const metadata = {
  title: "Use Cases",
  description:
    "Recognise the operational signals that point to a digital opportunity, from broken handovers and routine admin to legacy constraints.",
  alternates: { canonical: "/use-cases" },
};

export default function UseCases() {
  return (
    <main id="main">
      <section className="container page-intro">
        <span className="eyebrow">WHEN TO CALL KHALQ</span>
        <h1>
          Recognise the friction.
          <br />
          <span className="gradient-text">See the opportunity.</span>
        </h1>
        <p>
          These situations signal that a digital intervention could change the
          economics, pace or quality of how the organisation performs.
        </p>
      </section>
      <section className="container use-case-list">
        {useCases.map((useCase, index) => (
          <article id={useCase.slug} key={useCase.slug}>
            <div className="use-case-number">0{index + 1}</div>
            <div className="use-case-copy">
              <h2>{useCase.title}</h2>
              <p className="use-case-problem">{useCase.problem}</p>
              <p>{useCase.response}</p>
              <Link href={`/?solution=${useCase.solution}#project`}>
                Discuss this need <Arrow />
              </Link>
            </div>
            <ul aria-label={`Potential outcomes for ${useCase.title}`}>
              {useCase.outcomes.map((outcome) => (
                <li key={outcome}>{outcome}</li>
              ))}
            </ul>
          </article>
        ))}
      </section>
      <Closing
        eyebrow="TURN FRICTION INTO A BRIEF"
        title={["Recognise one of", "these situations?"]}
        description="Describe what is happening today and we’ll map the opportunity behind it."
        formQuestion="Where is the friction showing up?"
        formPlaceholder="Explain what happens today…"
        formHint="Symptoms, delays and workarounds are useful clues."
        formButtonLabel="Map the Opportunity"
      />
    </main>
  );
}
