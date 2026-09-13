"use client";
import { pages, projectTypes, type EventName } from "./tracking";
type Context = {
  visitorId: string;
  landingPage: string;
  referrer: string;
  utmSource: string;
  utmMedium: string;
  utmCampaign: string;
  utmTerm: string;
  utmContent: string;
  createdAt: number;
};
let memory: Context | undefined;
export function visitorContext(): Context {
  if (memory && Date.now() - memory.createdAt < 86400000) return memory;
  memory = undefined;
  try {
    const saved = JSON.parse(
      sessionStorage.getItem("khq_visit") || "null",
    ) as Context | null;
    if (saved && Date.now() - saved.createdAt < 86400000) {
      memory = saved;
      return saved;
    }
  } catch {}
  const params = new URLSearchParams(location.search);
  memory = {
    visitorId: crypto.randomUUID(),
    landingPage: pages.includes(location.pathname) ? location.pathname : "/",
    referrer: document.referrer,
    utmSource: params.get("utm_source") || "",
    utmMedium: params.get("utm_medium") || "",
    utmCampaign: params.get("utm_campaign") || "",
    utmTerm: params.get("utm_term") || "",
    utmContent: params.get("utm_content") || "",
    createdAt: Date.now(),
  };
  try {
    sessionStorage.setItem("khq_visit", JSON.stringify(memory));
  } catch {}
  return memory;
}
export async function ensureAttribution() {
  const response = await fetch("/api/attribution", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(visitorContext()),
    keepalive: true,
  });
  if (!response.ok)
    throw new Error("We couldn’t start your enquiry. Please try again.");
}
export function selectedProject() {
  const value =
    new URLSearchParams(location.search).get("solution") || "not-sure";
  return projectTypes.includes(value) ? value : "not-sure";
}
export function analyticsAllowed() {
  return (
    navigator.doNotTrack !== "1" &&
    !(navigator as Navigator & { globalPrivacyControl?: boolean })
      .globalPrivacyControl
  );
}
export function track(
  event: EventName,
  ctaLocation = "page",
  projectType = "not-sure",
) {
  if (!analyticsAllowed()) return;
  const visitor = visitorContext();
  const id = event === "visit" ? visitor.visitorId : crypto.randomUUID();
  void fetch("/api/events", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      id,
      visitorId: visitor.visitorId,
      event,
      page: pages.includes(location.pathname) ? location.pathname : "/",
      ctaLocation,
      projectType,
    }),
    keepalive: true,
  }).catch(() => {});
}
