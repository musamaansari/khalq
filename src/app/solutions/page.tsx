import { SolutionsGrid, Closing } from "@/components/sections";
import { engagementTypes } from "@/lib/content";
export const metadata = {
  title: "Solutions",
  description:
    "Explore Khalq’s capabilities across internal platforms, applied AI, SaaS, customer experiences, integrations and bespoke digital systems.",
  alternates: { canonical: "/solutions" },
};
export default function Solutions() {
  return (
    <main id="main">
      <section className="container page-intro">
        <span className="eyebrow">WHAT WE BUILD</span>
        <h1>
          Choose the right
          <br />
          <span className="gradient-text">digital capability.</span>
        </h1>
        <p>
          Khalq assembles product design, engineering and systems expertise
          around the type of asset your organisation needs to own.
        </p>
      </section>
      <section className="container page-solutions">
        <SolutionsGrid detailed />
      </section>
      <section className="content-band">
        <div className="container content-band-inner">
          <div className="content-band-heading">
            <span className="eyebrow">ENGAGEMENT SHAPES</span>
            <h2>Three ways to commission the work.</h2>
            <p>
              The right structure depends on whether you are creating a new
              asset, enabling a team or adding to an existing estate.
            </p>
          </div>
          <div className="content-list">
            {engagementTypes.map((item, index) => (
              <article key={item.title}>
                <span>0{index + 1}</span>
                <div>
                  <h3>{item.title}</h3>
                  <p>{item.text}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
      <Closing
        eyebrow="CHOOSE THE RIGHT CAPABILITY"
        title={["Know what needs", "to be commissioned?"]}
        description="Share the desired outcome and we’ll recommend the most suitable technical route."
        formQuestion="What capability are you looking for?"
        formPlaceholder="Describe the asset or capability…"
        formHint="A short brief is enough to identify the right discipline."
        formButtonLabel="Discuss the Brief"
      />
    </main>
  );
}
