import Link from "next/link";
import { Arrow } from "@/components/brand";
import { Closing } from "@/components/sections";
import { useCases } from "@/lib/content";

export const metadata = {
  title: "Use Cases",
  description:
    "Practical ways Khalq uses software, AI, automation and integrations to solve operational problems and create digital products.",
  alternates: { canonical: "/use-cases" },
};

export default function UseCases() {
  return (
    <main id="main">
      <section className="container page-intro">
        <span className="eyebrow">WHERE TECHNOLOGY CAN HELP</span>
        <h1>
          Start with the problem.
          <br />
          <span className="gradient-text">Build what fits.</span>
        </h1>
        <p>
          The best starting point is often a process that takes too long, a
          system that no longer works, or an opportunity worth creating.
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
      <Closing />
    </main>
  );
}
