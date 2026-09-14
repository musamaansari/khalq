"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Brand, Arrow } from "./brand";
import { navigation, footerNavigation, contact } from "@/lib/content";
import {
  track,
  visitorContext,
  ensureAttribution,
} from "@/lib/client-tracking";
export function InteractionAnalytics() {
  useEffect(() => {
    visitorContext();
    track("visit");
    function clicked(event: MouseEvent) {
      const target = event.target;
      if (!(target instanceof Element)) return;
      const link = target.closest("a");
      if (!link) return;
      const href = link.getAttribute("href") || "";
      if (href.startsWith("/")) void ensureAttribution().catch(() => {});
      const location = link.closest("footer")
        ? "footer"
        : link.closest("header")
          ? "navigation"
          : "page";
      if (href.includes("#project")) track("start_project", location);
      else if (href === "/products") track("product_interest", location);
      else if (href.startsWith("mailto:") || href.startsWith("tel:"))
        track("contact_clicked", location);
    }
    document.addEventListener("click", clicked);
    return () => document.removeEventListener("click", clicked);
  }, []);
  return null;
}
export function Header() {
  const [open, setOpen] = useState(false);
  const path = usePathname();
  return (
    <header className="header">
      <div className="container nav-wrap">
        <Brand />
        <nav className="desktop-nav" aria-label="Main navigation">
          {navigation.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              aria-current={path === n.href ? "page" : undefined}
            >
              {n.label}
            </Link>
          ))}
        </nav>
        <div className="nav-actions">
          <Link
            className="button button-small"
            href="/#project"
            onClick={() => setOpen(false)}
          >
            Start a Project <Arrow />
          </Link>
          <button
            className="menu-toggle"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            onClick={() => setOpen(!open)}
          >
            {open ? "✕" : "☰"}
          </button>
        </div>
      </div>
      {open && (
        <nav className="mobile-nav" aria-label="Mobile navigation">
          {navigation.map((n) => (
            <Link key={n.href} href={n.href} onClick={() => setOpen(false)}>
              {n.label}
              <Arrow />
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}
export function Footer({
  contactEmail = contact.email,
}: {
  contactEmail?: string;
}) {
  return (
    <footer className="footer container">
      <div className="footer-top">
        <div>
          <Brand />
          <p>Create what’s next.</p>
        </div>
        <nav aria-label="Footer navigation">
          {footerNavigation.map((n) => (
            <Link key={n.href} href={n.href}>
              {n.label}
            </Link>
          ))}
          <Link href="/#project">
            Start a Project <Arrow />
          </Link>
        </nav>
      </div>
      <div className="footer-bottom">
        <span>© {new Date().getFullYear()} Khalq. All rights reserved.</span>
        <div>
          {contactEmail && (
            <a href={`mailto:${contactEmail}`}>{contactEmail}</a>
          )}
          {contact.socials.map((s) => (
            <a key={s.url} href={s.url}>
              {s.label}
            </a>
          ))}
          <Link href="/privacy">Privacy</Link>
          <Link href="/terms">Terms</Link>
          <span className="footer-note">
            Made for what’s next <span className="little-star">✳</span>
          </span>
        </div>
      </div>
    </footer>
  );
}
