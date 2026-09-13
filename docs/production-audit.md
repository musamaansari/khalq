# Production-readiness audit — 2026-09-13

Completed before data-layer changes. Scope: preserve Khalq V1's design and conversational flow; prepare deployment without publishing or inventing production configuration.

## Baseline

- Next.js 16 App Router, React 19, TypeScript, Tailwind; self-hosted Geist/Inter fonts.
- Home, Solutions, Products, About, Privacy, Terms; generated Open Graph image, icon, canonical metadata, robots and sitemap already exist.
- SQLite uses parameterized queries, transactional lead/outbox inserts, a fixed-window database rate limiter, length/type validation, honeypot, minimum completion time and same-origin POST checks.
- Eight existing backend tests pass. Git working tree was clean at audit start.
- README, environment template, data layer, APIs, analytics, SEO and build settings inspected. Only `.env.example` exists; no production environment variable names were found in the current shell. No `NEXT_PUBLIC_*` secrets found. Actual production credentials were neither requested nor printed.

## Material gaps

1. SQLite-only storage and runtime schema creation do not suit Railway's ephemeral app containers. No versioned migrations or PostgreSQL adapter.
2. Lead schema lacks landing page, project category, two UTM fields, updated timestamp and normalized lowercase statuses. Existing records need a non-destructive migration path.
3. Attribution reads only the current URL at submission; internal navigation loses the original campaign. Client metadata is not signed.
4. Notifications are an optional webhook with an outbox, but no email provider or scheduled retry deployment. Failure logs are insufficient.
5. Analytics has daily event counts but no visit/session denominator, deduplication or reliable persisted-lead event. Several event names differ from the requested funnel.
6. Production environment validation is limited to a rate-limit secret. Missing trusted IP configuration makes all visitors share the same limit.
7. No health endpoint, generic error boundary, CI lint gate, Railway configuration, migration command or backup/restore verification procedure.
8. Phone input is accepted without international normalization. Email syntax validation is basic. The contact step loses its fields when navigating back.
9. Security headers omit production HSTS and canonical host redirects. APIs need consistent safe logs and error handling.
10. Privacy/Terms need processor, international visitor, storage/retention and website-specific terms updates. No legal entity or contact identity has been supplied.

## Architecture decision

Use the small `pg` driver for production and retain Node's SQLite driver locally. Keep SQL execution adapters separate from shared asynchronous lead, rate-limit, event and outbox logic; no ORM. Add versioned dialect migrations, upgrade existing SQLite records in place, and provide an explicit SQLite-to-PostgreSQL import tool. PostgreSQL migrations run before deployment, never during a request. Local SQLite migrations remain automatic for the simple developer experience.

Keep the transactional outbox. Add interchangeable Resend and Google Workspace Gmail OAuth email adapters and preserve a configured legacy webhook adapter. Verify provider behavior with isolated test doubles; live delivery remains a launch blocker until the user supplies configuration and verifies receipt.

Attribution will be first-touch, session-scoped and signed by the server. It remains untrusted marketing metadata, not proof of a campaign. Analytics will use short-lived pseudonymous browser-tab sessions, fixed event/category enums and an atomic server-side submitted-lead event. No lead text or contact data goes into analytics.

## External verification still required

No Railway project, production PostgreSQL credentials, email credentials, DNS targets, legal contact details or backup configuration are available locally. The implementation can be completed and tested without them; production launch cannot honestly be declared verified until these are configured and tested.
