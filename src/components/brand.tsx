import Link from "next/link";
export function Mark() {
  return (
    <svg viewBox="0 0 36 36" fill="none" aria-hidden="true">
      <path
        d="M3 2h8v14L23 2h10L18 19l15 15H22L11 23v11H3V2Z"
        fill="currentColor"
      />
    </svg>
  );
}
export function Brand() {
  return (
    <Link href="/" className="brand" aria-label="Khalq home">
      <Mark />
      <span>
        khalq<span className="brand-dot">.</span>
      </span>
    </Link>
  );
}
export function Arrow({ diagonal = false }: { diagonal?: boolean }) {
  return (
    <span aria-hidden="true" className="arrow">
      {diagonal ? "↗" : "→"}
    </span>
  );
}
