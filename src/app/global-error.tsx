"use client";
export default function GlobalError({ reset }: { reset: () => void }) {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          padding: "12vh 8vw",
          fontFamily: "Arial,sans-serif",
          background: "#fafaf8",
          color: "#202323",
        }}
      >
        <p>khalq.</p>
        <h1>Let’s try that again.</h1>
        <p>Something didn’t load as expected.</p>
        <button
          onClick={reset}
          style={{
            padding: "16px 24px",
            border: 0,
            borderRadius: 6,
            background: "#2060e8",
            color: "white",
          }}
        >
          Try again →
        </button>
      </body>
    </html>
  );
}
