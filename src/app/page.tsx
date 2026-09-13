import Link from "next/link";
import { ProjectForm } from "@/components/project-form";
import { SolutionsGrid, ProductsBlock, Closing } from "@/components/sections";
import { Arrow } from "@/components/brand";
import { process } from "@/lib/content";
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
              "Software",
              "AI & Automation",
              "SaaS",
              "Web & Mobile",
              "Integrations",
            ].map((x, i) => (
              <Link
                href={
                  "/solutions#" +
                  [
                    "software",
                    "ai-automation",
                    "saas",
                    "web-mobile",
                    "integrations",
                  ][i]
                }
                key={x}
              >
                {x}
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
            <span className="eyebrow">01 / WHAT WE BUILD</span>
            <h2>From problem to product.</h2>
          </div>
          <Link className="text-link" href="/solutions">
            Explore solutions <Arrow />
          </Link>
        </div>
        <SolutionsGrid />
      </section>
      <section className="statement">
        <div className="container">
          <span className="eyebrow">YOUR BUSINESS. YOUR WAY.</span>
          <h2>
            <span>
              Don’t adapt your business
              <br />
              to software.
            </span>
            <br />
            Build software around
            <br />
            your <span className="gradient-text">business.</span>
          </h2>
          <div className="statement-foot">
            <span className="statement-line" />
            <p>
              The right technology should fit.
              <br />
              Not the other way around.
            </p>
          </div>
        </div>
      </section>
      <section className="section container process">
        <div className="section-heading">
          <div>
            <span className="eyebrow">02 / THE WAY WE WORK</span>
            <h2>A clear path forward.</h2>
          </div>
          <p>
            No complicated starting point.
            <br />
            Just a conversation.
          </p>
        </div>
        <div className="process-grid" aria-label="How Khalq works">
          {process.map((p, i) => (
            <div key={p.name} className="process-step">
              <div className="process-number">
                <span>0{i + 1}</span>
                <Arrow />
              </div>
              <h3>{p.name}</h3>
              <p>{p.text}</p>
            </div>
          ))}
        </div>
      </section>
      <section className="section container products-section">
        <div className="section-heading">
          <div>
            <span className="eyebrow">03 / OUR OWN CREATIONS</span>
            <h2>Built by Khalq.</h2>
          </div>
          <p>
            We’re turning real business problems
            <br />
            into useful products.
          </p>
        </div>
        <ProductsBlock />
      </section>
      <Closing />
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
