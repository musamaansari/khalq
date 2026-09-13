"use client";
import Link from "next/link";
export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <main id="main" className="container page-intro">
      <span className="eyebrow">A SMALL INTERRUPTION</span>
      <h1>
        Let’s try
        <br />
        that again.
      </h1>
      <p>Something didn’t load as expected. Please try again in a moment.</p>
      <button className="button" onClick={reset}>
        Try again →
      </button>
      <p>
        <Link className="text-link" href="/">
          Go to Khalq →
        </Link>
      </p>
    </main>
  );
}
