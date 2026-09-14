import { Closing } from "@/components/sections";
import { aboutValues } from "@/lib/content";
export const metadata = {
  title: "About",
  description:
    "Khalq is an independent technology company combining commercial curiosity, product judgment and engineering craft.",
  alternates: { canonical: "/about" },
};
export default function About() {
  return (
    <main id="main">
      <section className="container page-intro about-intro">
        <span className="eyebrow">WHY KHALQ</span>
        <h1>
          A builder’s mindset.
          <br />
          <span className="gradient-text">Grounded in business.</span>
        </h1>
        <div className="about-copy">
          <p>
            Khalq is an independent technology company for organisations with
            meaningful change to make.
          </p>
          <p>
            We combine commercial curiosity, product judgment and engineering
            craft to turn that ambition into a dependable digital asset.
          </p>
        </div>
      </section>
      <section className="container name-section">
        <div className="arabic" lang="ar" dir="rtl">
          خلق
        </div>
        <div>
          <span className="eyebrow">THE IDEA BEHIND THE NAME</span>
          <h2>Khalq. Creation.</h2>
          <p>
            The name means creation in Arabic. For us, creation is not novelty
            for its own sake; it is the discipline of making something that
            deserves to exist.
          </p>
          <h3>Create with intent.</h3>
        </div>
      </section>
      <section className="content-band">
        <div className="container">
          <div className="section-heading">
            <div>
              <span className="eyebrow">HOW WE SHOW UP</span>
              <h2>Judgment matters as much as delivery.</h2>
            </div>
            <p>
              Our role is to challenge, clarify and take responsibility—not
              simply execute a list.
            </p>
          </div>
          <div className="principles-grid">
            {aboutValues.map((principle, index) => (
              <article key={principle.title}>
                <span>0{index + 1}</span>
                <h3>{principle.title}</h3>
                <p>{principle.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
      <Closing
        eyebrow="MEET KHALQ"
        title={["Looking for a thoughtful", "technology partner?"]}
        description="Tell us where the organisation is heading and we’ll explore whether we are the right fit."
        formQuestion="What ambition are you working toward?"
        formPlaceholder="Tell us where you want the business to go…"
        formHint="Direction matters more than a finished specification."
        formButtonLabel="Meet the Team"
      />
    </main>
  );
}
