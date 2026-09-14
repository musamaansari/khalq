import { ProductsBlock, Closing } from "@/components/sections";
export const metadata = {
  title: "Products",
  description:
    "Independent digital ventures developed by Khalq from recurring market gaps and overlooked needs.",
  alternates: { canonical: "/products" },
};
export default function Products() {
  return (
    <main id="main">
      <section className="container page-intro">
        <span className="eyebrow">OUR PRODUCT STUDIO</span>
        <h1>
          Ideas we choose
          <br />
          <span className="gradient-text">to pursue ourselves.</span>
        </h1>
        <p>
          We also invest in independent ventures inspired by recurring market
          gaps and overlooked moments in everyday work. Each begins with
          validation, not a launch announcement.
        </p>
      </section>
      <section className="container products-page">
        <ProductsBlock overview={false} />
      </section>
      <Closing
        eyebrow="SPOT A RECURRING GAP"
        title={["Could an overlooked pattern", "become a product?"]}
        description="Share the pattern you keep seeing. We’re always curious about unmet demand."
        formQuestion="What market gap have you noticed?"
        formPlaceholder="Describe the recurring need…"
        formHint="A repeated frustration can signal a bigger opportunity."
        formButtonLabel="Share the Pattern"
      />
    </main>
  );
}
