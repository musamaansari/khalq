"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Arrow } from "./brand";
import { requirementTypes } from "@/lib/content";
import {
  track,
  visitorContext,
  ensureAttribution,
  selectedProject,
  analyticsAllowed,
} from "@/lib/client-tracking";
const examples = [
  "Tell us your idea or business problem…",
  "I want to automate…",
  "I need a system for…",
  "Our business struggles with…",
  "I have an idea for…",
];
type ProjectFormProps = {
  closing?: boolean;
  question?: string;
  placeholder?: string;
  hint?: string;
  buttonLabel?: string;
};

export function ProjectForm({
  closing = false,
  question,
  placeholder,
  hint,
  buttonLabel,
}: ProjectFormProps) {
  const [step, setStep] = useState(1),
    [requirement, setRequirement] = useState(""),
    [kind, setKind] = useState("Not sure"),
    [placeholderIndex, setPlaceholder] = useState(0),
    [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  const [reference, setReference] = useState("");
  const [details, setDetails] = useState({
    name: "",
    contact: "",
    company: "",
  });
  const submissionKey = useRef("");
  const started = useRef(0),
    title = useRef<HTMLHeadingElement>(null),
    touched = useRef(false);
  const id = closing ? "closing" : "hero";
  const StepHeading = closing ? "h3" : "h2";
  useEffect(() => {
    started.current = Date.now();
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const timer = setInterval(
      () => setPlaceholder((p) => (p + 1) % examples.length),
      6500,
    );
    return () => clearInterval(timer);
  }, []);
  async function next() {
    track("start_project", id, selectedProject());
    if (requirement.trim().length < 10) {
      setError(
        "A little more detail helps. Please write at least 10 characters.",
      );
      return;
    }
    setError("");
    try {
      await ensureAttribution();
    } catch {
      setError("We couldn’t start your enquiry. Please try again.");
      return;
    }
    if (!submissionKey.current) submissionKey.current = crypto.randomUUID();
    setStep(2);
    track("requirement_completed", id, selectedProject());
  }
  useEffect(() => {
    if (step > 1) title.current?.focus();
  }, [step]);
  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setError("");
    const form = new FormData(e.currentTarget);
    try {
      await ensureAttribution();
      const visitor = visitorContext();
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
          projectType: selectedProject(),
          submissionKey: submissionKey.current,
          visitorId: visitor.visitorId,
          ctaLocation: id,
          analyticsAllowed: analyticsAllowed(),
        }),
      });
      const data = await response.json();
      if (!response.ok)
        throw new Error(
          data.error || "Something went wrong. Please try again.",
        );
      setStep(4);
      setReference(data.reference);
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
            {question ??
              (closing
                ? "A better way starts here."
                : "What do you want to build?")}
            <span className="form-spark" aria-hidden="true">
              ✳
            </span>
          </label>
          <textarea
            id={`${id}-requirement`}
            maxLength={5000}
            value={requirement}
            onFocus={() => {
              void ensureAttribution().catch(() => {});
            }}
            onChange={(e) => {
              setRequirement(e.target.value);
              if (!touched.current && e.target.value.trim()) {
                track("requirement_started", id, selectedProject());
                touched.current = true;
              }
            }}
            placeholder={
              closing
                ? (placeholder ?? "Describe what you need…")
                : examples[placeholderIndex]
            }
            aria-describedby={error ? `${id}-error` : undefined}
            aria-invalid={!!error && step === 1}
          />
          <div className="input-bottom">
            <span className="input-hint">
              <span aria-hidden="true">↳</span>{" "}
              {hint ?? "Big idea or small problem. Start anywhere."}
            </span>
            <button className="button" onClick={next}>
              {closing ? (buttonLabel ?? "Let’s Build It") : "Start a Project"}
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
          <StepHeading ref={title} tabIndex={-1}>
            What best describes this?
          </StepHeading>
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
          <StepHeading tabIndex={-1} ref={title}>
            How should we reach you?
          </StepHeading>
          <div className="contact-fields">
            <label htmlFor={`${id}-name`}>
              Your name
              <input
                id={`${id}-name`}
                name="name"
                autoComplete="name"
                value={details.name}
                onChange={(e) =>
                  setDetails({ ...details, name: e.target.value })
                }
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
                value={details.contact}
                onChange={(e) =>
                  setDetails({ ...details, contact: e.target.value })
                }
                maxLength={254}
                placeholder="you@company.com or +country code…"
                aria-describedby={error ? `${id}-error` : undefined}
                required
              />
            </label>
            <label className="full-field" htmlFor={`${id}-company`}>
              Company <span>(optional)</span>
              <input
                id={`${id}-company`}
                name="company"
                autoComplete="organization"
                value={details.company}
                onChange={(e) =>
                  setDetails({ ...details, company: e.target.value })
                }
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
        <div className="form-step success" role="status">
          <span className="success-icon">✓</span>
          <StepHeading ref={title} tabIndex={-1}>
            Your idea is with Khalq.
          </StepHeading>
          <p>
            We’ll review your requirement and identify the best way to build it.
          </p>
          {reference && (
            <p className="enquiry-reference">Reference: {reference}</p>
          )}
          <button
            className="text-button"
            onClick={() => {
              setStep(1);
              setRequirement("");
              setDetails({ name: "", contact: "", company: "" });
              submissionKey.current = "";
              touched.current = false;
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
