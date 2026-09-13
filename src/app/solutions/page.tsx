import { SolutionsGrid, Closing } from "@/components/sections";
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
      <Closing />
    </main>
  );
}
