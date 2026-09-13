import Link from "next/link";
import { Arrow, Mark } from "./brand";
import { services, products } from "@/lib/content";
import { ProjectForm } from "./project-form";
export function SolutionsGrid({ detailed = false }: { detailed?: boolean }) {
  return (
    <div className={`solutions-grid ${detailed ? "detailed" : ""}`}>
      {services.map((s, i) => (
        <Link
          href={
            detailed
              ? "/?solution=" + s.slug + "#project"
              : "/solutions#" + s.slug
          }
          className="solution"
          key={s.slug}
          id={s.slug}
        >
          <div className="solution-top">
            <span className="service-symbol" aria-hidden="true">
              {s.symbol}
            </span>
            <span className="service-number">0{i + 1}</span>
          </div>
          <h3>
            {s.name}
            <Arrow diagonal />
          </h3>
          <p>{detailed ? s.detail : s.description}</p>
          {detailed && (
            <span className="discuss">
              Discuss a Project <Arrow />
            </span>
          )}
        </Link>
      ))}
    </div>
  );
}
export function ProductsBlock({ overview = true }: { overview?: boolean }) {
  return products.length ? (
    <div className="solutions-grid">
      {products.map((p) => (
        <article className="solution" key={p.slug}>
          <span className="eyebrow">
            {p.category} · {p.status === "live" ? "Available" : "Coming soon"}
          </span>
          <h3>{p.name}</h3>
          <p>{p.description}</p>
          {p.website && (
            <a href={p.website}>
              {p.cta || "Explore product"} <Arrow />
            </a>
          )}
        </article>
      ))}
    </div>
  ) : (
    <div className="product-preview">
      <div className="product-symbol">
        <Mark />
      </div>
      <div>
        <span className="status">
          <span /> IN THE MAKING
        </span>
        <h3>Products are taking shape.</h3>
        <p>Built from real needs. Made to be useful.</p>
      </div>
      {overview && (
        <Link
          href="/products"
          className="product-link"
          aria-label="Explore Khalq products"
        >
          <Arrow diagonal />
        </Link>
      )}
    </div>
  );
}
export function Closing() {
  return (
    <section className="closing" id="contact">
      <div className="container closing-inner">
        <div>
          <span className="eyebrow">LET’S MAKE SOMETHING USEFUL</span>
          <h2>
            What’s slowing
            <br />
            your business down?
          </h2>
          <p>
            Tell us the problem.
            <br />
            There may be a better way to build it.
          </p>
        </div>
        <ProjectForm closing />
      </div>
    </section>
  );
}
