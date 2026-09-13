import { ProductsBlock, Closing } from "@/components/sections";
export const metadata = {
  title: "Products",
  description:
    "Useful products built by Khalq, shaped by real business needs. Our first products are taking shape.",
  alternates: { canonical: "/products" },
};
export default function Products() {
  return (
    <main id="main">
      <section className="container page-intro">
        <span className="eyebrow">OUR OWN CREATIONS</span>
        <h1>
          Built by Khalq.
          <br />
          <span className="gradient-text">Made to be useful.</span>
        </h1>
        <p>
          We’re turning real business problems into useful products.
          <br />
          Good things take understanding. We’re starting there.
        </p>
      </section>
      <section className="container products-page">
        <ProductsBlock overview={false} />
      </section>
      <Closing />
    </main>
  );
}
