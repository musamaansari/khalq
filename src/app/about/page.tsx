import { Closing } from "@/components/sections";
import { principles } from "@/lib/content";
export const metadata = {
  title: "About",
  description:
    "Khalq exists to turn ideas, operational challenges and opportunities into useful technology.",
  alternates: { canonical: "/about" },
};
export default function About() {
  return (
    <main id="main">
      <section className="container page-intro about-intro">
        <span className="eyebrow">THIS IS KHALQ</span>
        <h1>
          We create technology
          <br />
          around <span className="gradient-text">real problems.</span>
        </h1>
        <div className="about-copy">
          <p>
            Khalq exists to turn ideas, operational challenges and opportunities
            into useful technology.
          </p>
          <p>
            We design and build software, AI, automation and digital products
            around how businesses actually work.
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
          <p>A simple idea that guides everything we do.</p>
          <h3>Create something useful.</h3>
        </div>
      </section>
      <section className="content-band">
        <div className="container">
          <div className="section-heading">
            <div>
              <span className="eyebrow">WHAT GUIDES THE WORK</span>
              <h2>Useful before impressive.</h2>
            </div>
            <p>
              Clear thinking, practical technology
              <br />
              and products people can actually use.
            </p>
          </div>
          <div className="principles-grid">
            {principles.map((principle, index) => (
              <article key={principle.title}>
                <span>0{index + 1}</span>
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
