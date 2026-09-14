import { SolutionsGrid, Closing } from "@/components/sections";
import { engagementTypes } from "@/lib/content";
export const metadata = {
  title: "Solutions",
  description:
    "Custom software, AI solutions, business automation, SaaS development, web and mobile applications, and integrations built around your business.",
  alternates: { canonical: "/solutions" },
};
export default function Solutions() {
  return (
    <main id="main">
      <section className="container page-intro">
        <span className="eyebrow">WHAT WE BUILD</span>
        <h1>
          Real problems.
          <br />
          <span className="gradient-text">Useful technology.</span>
        </h1>
        <p>
          You know your business. We bring the technology.
          <br />
          Together, we build what you need.
        </p>
      </section>
      <section className="container page-solutions">
        <SolutionsGrid detailed />
      </section>
      <section className="content-band">
        <div className="container content-band-inner">
          <div className="content-band-heading">
            <span className="eyebrow">WAYS TO BEGIN</span>
            <h2>Start where the need is clearest.</h2>
            <p>
              You do not need a finished specification. A business problem,
              opportunity or early idea is enough to begin.
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
      <Closing />
    </main>
  );
}
