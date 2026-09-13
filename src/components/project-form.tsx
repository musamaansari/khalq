"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Arrow } from "./brand";
import { requirementTypes } from "@/lib/content";
const examples = [
  "Tell us your idea or business problem…",
  "I want to automate…",
  "I need a system for…",
  "Our business struggles with…",
  "I have an idea for…",
];
export function track(event: string) {
  if (navigator.doNotTrack === "1") return;
  void fetch("/api/events", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ event, page: location.pathname }),
    keepalive: true,
  }).catch(() => {});
}
export function ProjectForm({ closing = false }: { closing?: boolean }) {
  const [step, setStep] = useState(1),
    [requirement, setRequirement] = useState(""),
    [kind, setKind] = useState("Not sure"),
    [placeholder, setPlaceholder] = useState(0),
    [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  const started = useRef(Date.now()),
    title = useRef<HTMLHeadingElement>(null),
    touched = useRef(false);
  const id = closing ? "closing" : "hero";
  useEffect(() => {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const timer = setInterval(
      () => setPlaceholder((p) => (p + 1) % examples.length),
      6500,
    );
    return () => clearInterval(timer);
  }, []);
  function next() {
    if (requirement.trim().length < 10) {
      setError(
        "A little more detail helps. Please write at least 10 characters.",
      );
      return;
    }
    setError("");
    setStep(2);
    track("start_project");
  }
  useEffect(() => {
    if (step > 1) title.current?.focus();
  }, [step]);
  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setError("");
    const form = new FormData(e.currentTarget);
    const utm = new URLSearchParams(location.search);
    try {
      const response = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          requirement,
          requirementType: kind,
          name: form.get("name"),
          contact: form.get("contact"),
          company: form.get("company"),
          website: form.get("website"),
          startedAt: started.current,
          sourcePage: location.pathname,
          utmSource: utm.get("utm_source"),
          utmMedium: utm.get("utm_medium"),
          utmCampaign: utm.get("utm_campaign"),
          referrer: document.referrer,
        }),
      });
      const data = await response.json();
      if (!response.ok)
        throw new Error(
          data.error || "Something went wrong. Please try again.",
        );
      setStep(4);
      track("requirement_submitted");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to connect. Please try again.",
      );
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className={`project-box ${closing ? "project-box-closing" : ""}`}>
      {step === 1 ? (
        <>
          <label className="form-question" htmlFor={`${id}-requirement`}>
            {closing
              ? "A better way starts here."
              : "What do you want to build?"}
            <span className="form-spark" aria-hidden="true">
              ✳
            </span>
          </label>
          <textarea
            id={`${id}-requirement`}
            maxLength={5000}
            value={requirement}
            onFocus={() => {
              if (!touched.current) {
                track("requirement_interaction");
                touched.current = true;
              }
            }}
            onChange={(e) => setRequirement(e.target.value)}
            placeholder={
              closing ? "Describe what you need…" : examples[placeholder]
            }
            aria-describedby={error ? `${id}-error` : undefined}
          />
          <div className="input-bottom">
            <span className="input-hint">
              <span aria-hidden="true">↳</span> Big idea or small problem. Start
              anywhere.
            </span>
            <button className="button" onClick={next}>
              {closing ? "Let’s Build It" : "Start a Project"}
              <Arrow />
            </button>
          </div>
        </>
      ) : step === 2 ? (
        <div className="form-step">
          <div className="step-top">
            <span>01 — YOUR IDEA</span>
            <button className="text-button" onClick={() => setStep(1)}>
              ← Back
            </button>
          </div>
          <h3 ref={title} tabIndex={-1}>
            What best describes this?
          </h3>
          <p className="form-help">A starting point is all we need.</p>
          <div className="type-options">
            {requirementTypes.map((t) => (
              <button
                key={t}
                aria-pressed={kind === t}
                onClick={() => setKind(t)}
              >
                {t}
              </button>
            ))}
          </div>
          <div className="step-actions">
            <button
              className="text-button"
              onClick={() => {
                setKind("Not sure");
                setStep(3);
              }}
            >
              Skip for now
            </button>
            <button className="button" onClick={() => setStep(3)}>
              Continue
              <Arrow />
            </button>
          </div>
        </div>
      ) : step === 3 ? (
        <form className="form-step" onSubmit={submit}>
          <div className="step-top">
            <span>02 — LET’S CONNECT</span>
            <button
              type="button"
              className="text-button"
              onClick={() => setStep(2)}
            >
              ← Back
            </button>
          </div>
          <h3 tabIndex={-1} ref={title}>
            How should we reach you?
          </h3>
          <div className="contact-fields">
            <label htmlFor={`${id}-name`}>
              Your name
              <input
                id={`${id}-name`}
                name="name"
                autoComplete="name"
                maxLength={120}
                required
              />
            </label>
            <label htmlFor={`${id}-contact`}>
              Email or WhatsApp
              <input
                id={`${id}-contact`}
                name="contact"
                autoComplete="email"
                maxLength={254}
                placeholder="you@company.com or +971…"
                required
              />
            </label>
            <label className="full-field" htmlFor={`${id}-company`}>
              Company <span>(optional)</span>
              <input
                id={`${id}-company`}
                name="company"
                autoComplete="organization"
                maxLength={160}
              />
            </label>
          </div>
          <div className="honeypot" aria-hidden="true">
            <label>
              Website
              <input name="website" tabIndex={-1} autoComplete="off" />
            </label>
          </div>
          <div className="step-actions">
            <span className="privacy-note">
              Used only to discuss your project.
              <br />
              <Link href="/privacy">Privacy policy</Link>
            </span>
            <button className="button" disabled={busy}>
              {busy ? "Sending…" : "Send My Requirement"}
              <Arrow />
            </button>
          </div>
        </form>
      ) : (
        <div className="form-step success">
          <span className="success-icon">✓</span>
          <h3 ref={title} tabIndex={-1}>
            A good place to start.
          </h3>
          <p>
            Your requirement is with us. We’ll be in touch using the contact
            details you shared.
          </p>
          <button
            className="text-button"
            onClick={() => {
              setStep(1);
              setRequirement("");
              started.current = Date.now();
            }}
          >
            Share another idea <Arrow />
          </button>
        </div>
      )}
      {error && (
        <p className="form-error" role="alert" id={`${id}-error`}>
          {error}
        </p>
      )}
    </div>
  );
}
