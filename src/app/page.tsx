import Link from "next/link";
import { ProjectForm } from "@/components/project-form";
import { HomeFocus } from "@/components/sections";
import { Arrow } from "@/components/brand";
export const metadata = { alternates: { canonical: "/" } };
export default function Home() {
  return (
    <main id="main">
      <section className="hero">
        <div className="hero-light" aria-hidden="true" />
        <div className="container hero-inner">
          <div className="hero-kicker">
            <span className="tiny-line" /> IDEAS INTO USEFUL TECHNOLOGY
          </div>
          <h1>
            Create
            <br />
            what’s <span className="gradient-text">next.</span>
          </h1>
          <p className="hero-description">
            Software, AI and automation
            <br className="mobile-break" /> built around your ideas.
          </p>
          <div id="project" className="hero-form">
            <ProjectForm />
            <p className="form-caption">
              Tell us what you need.{" "}
              <span>We’ll figure out the technology.</span>
            </p>
          </div>
          <div className="category-shortcuts">
            {[
              ["Software", "software"],
              ["AI & Automation", "ai-automation"],
              ["Digital Products", "saas"],
            ].map((x) => (
              <Link href={`/solutions#${x[1]}`} key={x[1]}>
                {x[0]}
              </Link>
            ))}
          </div>
          <div className="hero-bottom">
            <span>BUILT AROUND YOUR BUSINESS. FROM DAY ONE.</span>
            <a href="#solutions" aria-label="Explore what Khalq builds">
              SCROLL TO EXPLORE <span>↓</span>
            </a>
          </div>
        </div>
      </section>
      <section id="solutions" className="section container">
        <div className="section-heading">
          <div>
            <span className="eyebrow">01 / WHAT WE HELP WITH</span>
            <h2>Technology built around the need.</h2>
          </div>
          <Link className="text-link" href="/use-cases">
            Explore use cases <Arrow />
          </Link>
        </div>
        <HomeFocus />
      </section>
      <section className="home-next">
        <div className="container home-next-inner">
          <div>
            <span className="eyebrow">A CLEAR WAY FORWARD</span>
            <h2>Start with the business problem.</h2>
            <p>We’ll help shape the right product, system or improvement.</p>
          </div>
          <div className="home-next-links">
            <Link href="/solutions">
              Explore solutions <Arrow />
            </Link>
            <Link href="/process">
              See how we work <Arrow />
            </Link>
            <Link className="button" href="#project">
              Start a Project <Arrow />
            </Link>
          </div>
        </div>
      </section>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Organization",
            name: "Khalq",
            url: "https://khalq.io",
            description: "Software, AI and automation built around your ideas.",
          }),
        }}
      />
    </main>
  );
}
