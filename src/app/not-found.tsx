import Link from "next/link";
export default function NotFound() {
  return (
    <main id="main" className="container page-intro">
      <span className="eyebrow">404 / A SMALL DETOUR</span>
      <h1>
        Nothing here.
        <br />
        Plenty <span className="gradient-text">ahead.</span>
      </h1>
      <p>This page may have moved, or hasn’t been created yet.</p>
      <Link href="/" className="button">
        Back to Khalq →
      </Link>
    </main>
  );
}
