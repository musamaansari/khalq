# Khalq

Khalq turns ideas and business problems into software, AI and automation. This repository preserves the minimal V1 website and conversational project flow while adding a production PostgreSQL data layer, first-touch attribution, email notifications, privacy-conscious conversion events and Railway deployment preparation.

**Launch status: NOT READY FOR PRODUCTION until the external checks in [the launch checklist](docs/launch-checklist.md) are completed.** A passing local build does not verify production credentials, email receipt, DNS, backups or Railway.

## 1. Local setup

Use Node **24.x** and npm. Next.js serves this application; Apache/PHP does not.

```powershell
npm ci
Copy-Item .env.example .env.local
npm run dev
```

Open http://localhost:3000. Defaults use SQLite and disable external notifications. Keep `.env.local` private. If using another port, change `APP_URL` and run `npm run dev -- --port 3001`.

The root `.htaccess` blocks Apache from serving this repository, including source files and local databases. Keep it while working under XAMPP's document root; use the Next.js port. Its enforcement still requires a check if Apache is enabled.

## 2. Environment variables

All settings appear in [.env.example](.env.example). **There are no `NEXT_PUBLIC_*` variables.** Public display values below are read on the server and intentionally rendered. Everything else remains server-only. Never paste secrets into source, screenshots, logs or issue trackers.

| Variable                                                           | Local default / production requirement                                                              |
| ------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------- |
| `APP_URL`                                                          | `http://localhost:3000` locally; **`https://khalq.io`** in production, present at build and runtime |
| `CONTACT_EMAIL`                                                    | Optional real public contact address; displayed in footer/policies                                  |
| `LEGAL_ENTITY_NAME`                                                | Optional actual operator name; displayed in Privacy; no invented registration details               |
| `NODE_ENV`                                                         | Next.js sets this for dev/build; start defaults to `production`; Railway must use `production`      |
| `APP_ENV`                                                          | `local` only for a localhost production-build preview; omit on Railway                              |
| `DATABASE_URL`                                                     | PostgreSQL connection URL; **required in production**                                               |
| `DATABASE_PATH`                                                    | Local SQLite file, default `./data/khalq.sqlite`; unused with PostgreSQL                            |
| `RATE_LIMIT_SECRET`                                                | **Required in production**, random value at least 32 characters                                     |
| `ATTRIBUTION_SECRET`                                               | **Required in production**, a separate random value at least 32 characters                          |
| `TRUST_PROXY`                                                      | `false` locally; **`true` after verifying the production proxy/header contract**                    |
| `TRUSTED_IP_HEADER`                                                | Required in production; candidate on Railway: `x-real-ip`; verify spoof resistance before launch    |
| `TRUSTED_PROXY_HOPS`                                               | `1`; select the trusted client entry from the right of a comma-separated header                     |
| `RATE_LIMIT_MAX`                                                   | `5` enquiry attempts per address per window                                                         |
| `RATE_LIMIT_WINDOW_SECONDS`                                        | `3600`                                                                                              |
| `SPAM_MIN_FORM_MS`                                                 | `2000`, applies to form time and server-issued attribution timestamp                                |
| `EMAIL_PROVIDER`                                                   | `disabled` locally; production `resend`, `gmail`, or an existing `webhook` integration              |
| `NOTIFICATION_EMAIL`                                               | Internal recipient; required for Resend/Gmail; never implicitly displayed publicly                  |
| `EMAIL_FROM`                                                       | Authorized sender mailbox/address; required for Resend/Gmail                                        |
| `EMAIL_API_KEY`                                                    | Resend sending API key; server-only                                                                 |
| `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_REFRESH_TOKEN` | Gmail OAuth configuration, only for `EMAIL_PROVIDER=gmail`                                          |
| `LEAD_NOTIFICATION_WEBHOOK`, `LEAD_NOTIFICATION_TOKEN`             | Existing internal integration URL and optional bearer token, only for `webhook`                     |
| `ANALYTICS_ENABLED`                                                | `true`; `false` disables analytics collection without disabling enquiries                           |
| `ANALYTICS_RETENTION_DAYS`                                         | `90`; update the Privacy text if the operational policy changes                                     |
| `PORT`                                                             | Railway injects it; local start defaults to `3000`                                                  |
| `SQLITE_IMPORT_PATH`                                               | Maintenance-only source for `npm run db:import`                                                     |
| `TEST_DATABASE_URL`                                                | Isolated integration-test database only; never production                                           |

Generate each random secret separately:

```powershell
node -e "console.log(require('node:crypto').randomBytes(32).toString('hex'))"
```

Save results directly in your private environment manager. Startup fails safely on missing or malformed production configuration; errors list variable names, never values. `SITE_URL` remains a deprecated local compatibility fallback; production requires `APP_URL`.

## 3. Database and migrations

`src/lib/database` contains SQLite/PostgreSQL SQL adapters; `src/lib/db.ts` owns shared asynchronous business logic. No ORM is used. PostgreSQL uses `pg` with a five-connection pool, bounded connection/query timeouts and parameterized statements. Transactions reserve a single connection. [node-postgres transaction guidance](https://node-postgres.com/features/transactions).

Versioned SQL lives in `migrations/sqlite` and `migrations/postgres`. `schema_migrations` records normalized checksums. An applied migration cannot be silently edited. PostgreSQL migrations use a transaction and advisory lock; local SQLite upgrades verify foreign keys before committing.

```powershell
npm run db:migrate
```

Production runs this as a **pre-deploy command**, never inside a request. Later schema changes must use new, backward-compatible migrations. Do not edit an applied migration or automatically run destructive down migrations.

Lead fields include random internal ID, random public reference, submission idempotency key, contact details, requirement/type/category, full requested attribution, lowercase status, timestamps, and a short-lived hashed anti-abuse identifier. `user_agent` is reserved but left empty: V1 does not need to retain the full header. No raw IP is stored in leads. Statuses: `new → reviewing → contacted → qualified → proposal → won / lost`. Database triggers update the timestamp when a lead changes.

An enquiry, its notification job, and its eligible `lead_submitted` event commit together. Repeating the same submission key returns the original reference without creating another lead or email. There is no public API to read/list leads.

## 4. Local SQLite

Without `DATABASE_URL`, development creates and migrates the private file automatically. Existing V1 leads, notification jobs and aggregate event counts are preserved; statuses become lowercase. Node 24 labels its SQLite API experimental.

Before upgrading a meaningful local database, stop writers and create a consistent backup using SQLite's backup API or a database-aware backup tool. Copying only the `.sqlite` file while its WAL is active is not a valid backup strategy. Tests use isolated temporary files; QA uses ignored test data.

## 5. Production PostgreSQL

In Railway, add PostgreSQL and set the application's `DATABASE_URL` to the service reference, typically `${{Postgres.DATABASE_URL}}` (match the actual service name). The app needs no attached data volume. Use private networking for the app/database connection. Public PostgreSQL connections require verified TLS, e.g. `sslmode=verify-full`; do not disable certificate checks. Connection-string SSL options can override driver options, so keep TLS configuration in one place. [Driver TLS guidance](https://node-postgres.com/features/ssl).

For an existing SQLite lead database, first back it up and apply local migrations. Freeze submissions during the cutover, configure the destination PostgreSQL URL, and run:

```powershell
$env:SQLITE_IMPORT_PATH='C:\private\khalq.sqlite'
npm run db:import
```

The importer opens the source read-only, requires an empty destination lead table, migrates PostgreSQL, imports leads/outbox/events in one transaction and verifies counts. It preserves IDs/statuses/timestamps and sent/pending jobs. It intentionally excludes expired-capable rate-limit state. Do not restart notification workers until you have checked the imported queue. Keep the original backup until production counts and sample records are verified. Never point test commands at production.

## 6. Email notifications and Google Workspace

The database is the source of truth. The customer sees success once persistence succeeds, even if email delivery fails. The transactional outbox retries with bounded exponential backoff. `npm run start` supervises Next.js and a notification/maintenance worker in the same Railway app service. A worker exit causes the service to restart; a delivery failure keeps the job pending. Disable Railway serverless sleeping for this service so scheduled retries continue without web traffic.

Run a one-off retry with `npm run notifications`; run only the worker with `npm run notifications:worker`. Jobs use a two-minute lease to prevent normal concurrent delivery, but email is **at least once**: a crash after provider acceptance can cause a duplicate. Resend supports a 24-hour idempotency window; Gmail has no equivalent exactly-once guarantee. [Resend API](https://resend.com/docs/api-reference/emails/send-email).

Notifications include the name/company, contact method, requirement, types, source, campaign, UTC timestamp, lead ID and safe reference. They exclude anti-abuse identifiers, environment values and infrastructure diagnostics. Logs use opaque IDs and fixed error codes, not full enquiry content or provider response bodies.

Choose one:

- **Resend:** set `EMAIL_PROVIDER=resend`, a verified-domain `EMAIL_FROM`, `NOTIFICATION_EMAIL`, and a sending `EMAIL_API_KEY`. Add the provider-issued SPF/DKIM DNS records, verify the sender domain and send a real controlled enquiry to confirm inbox receipt. A Google Workspace mailbox can receive these notifications; Workspace does not need to expose its password.
- **Google Workspace Gmail:** set `EMAIL_PROVIDER=gmail`, `EMAIL_FROM`, `NOTIFICATION_EMAIL`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, and `GOOGLE_REFRESH_TOKEN`. In your Google Cloud project enable Gmail API, configure an appropriate Workspace-internal or published OAuth consent application, authorize the actual sender with the `https://www.googleapis.com/auth/gmail.send` scope and offline access, and store the resulting refresh token privately. The sender must be the authorized mailbox or an allowed send-as identity. No personal Gmail password or broad domain-wide delegation is required. The app refreshes an access token and sends a UTF-8 MIME message. [Google sending guide](https://developers.google.com/workspace/gmail/api/guides/sending), [OAuth offline access](https://developers.google.com/identity/protocols/oauth2/web-server#offline).
- **Legacy webhook:** set `EMAIL_PROVIDER=webhook` and the existing HTTPS destination/token. The receiver must actually route internal notifications and deduplicate the `Idempotency-Key`. This adapter does not prove email delivery by itself.

No real notification recipient or credentials have been supplied. Provider tests use test doubles; receipt in the real mailbox remains mandatory before launch.

## 7. Attribution and analytics

The browser captures the initial landing context in session storage. On the first useful input/link interaction, the server validates its fields, removes referring paths/query strings and signs a 24-hour HttpOnly, SameSite=Lax cookie (Secure in production). Navigation preserves first-touch attribution. Later submissions use signed attribution rather than accepting new campaign values in the lead payload. Campaign labels still originate with the visitor: signing prevents subsequent tampering, not fraudulent campaign claims. Cookies must be available for submissions.

Example: `https://khalq.io/?utm_source=google&utm_medium=cpc&utm_campaign=software_dubai` remains attributed to that campaign after visiting Solutions or About.

Events correspond to real actions: `visit`, `start_project`, `requirement_started` (first text input), `requirement_completed` (valid requirement advanced), `lead_submitted` (server transaction), `contact_clicked`, `product_interest`. Payloads allow only known pages/categories/CTA locations and random identifiers. Contact data, requirement text and arbitrary campaign labels never enter event records. Client attempts to fabricate `lead_submitted` are rejected. Do Not Track and Global Privacy Control are respected.

Use distinct `visitor_id` values per event to calculate a funnel. Here a visitor means an observed browser-tab session lasting up to 24 hours, **not a known person**. Storage/analytics blockers and cross-tab use affect the denominator. Do not call these counts unique people. The worker removes analytics after the configured retention period.

```sql
SELECT event, COUNT(DISTINCT visitor_id) AS sessions
FROM analytics_events
WHERE created_at >= '2026-09-01T00:00:00.000Z'
GROUP BY event;
```

Divide requirement-started sessions by visit sessions, requirement-completed by started, lead-submitted by completed, and lead-submitted by visit. For strict cohort reporting, restrict later steps to the same visited-session cohort; avoid dividing unmatched reporting windows. Keep these queries internal.

## 8. Tests

```powershell
npm run lint
npm run typecheck
npm test
```

The original eight test cases remain, adapted to asynchronous storage and normalized values. Added coverage includes legacy migrations, signed attribution, production configuration, health, concurrent limits, rollback, duplicate submissions, both email adapters and analytics deduplication. Shared persistence tests run on SQLite and an embedded PostgreSQL engine (PGlite). An additional `pg` driver test uses `TEST_DATABASE_URL`; it runs against a real PostgreSQL service in CI and skips locally when none is supplied. PGlite does not verify Railway networking, TLS, credentials or backups.

`.github/workflows/ci.yml` installs dependencies, lints, type-checks, runs tests with PostgreSQL 17 and builds. It does **not** deploy. `scripts/check-browser.mjs` and `scripts/check-preview.mjs` are local browser checks; use only isolated QA databases with test notifications. Browser screenshots go to ignored `test-results/`.

After building, run `npm run qa` for the self-contained production-build browser checks (requires an installed Chrome browser). It selects a free local port, creates a temporary SQLite database, and intercepts provider calls into a loopback email capture server. No real email is sent. It checks desktop and mobile hero submissions, the closing flow, keyboard activation, preserved attribution, validation, email failure/retry, analytics, canonical redirect, health and accessibility. It shuts down its test application afterwards and leaves the QA report/screenshots in `test-results/`.

Verified locally: lint, type checking and production build pass; **19 backend tests pass and one real-network PostgreSQL test is skipped because TEST_DATABASE_URL is unavailable**. The embedded PostgreSQL contract passes. Final desktop/mobile browser QA passes, with zero automated WCAG A/AA violations in the scanned views. This is not a full accessibility certification or live production verification.

## 9. Production build and performance

```powershell
npm run build
npm run start
```

For a local production-build preview, set `APP_ENV=local` and a localhost `APP_URL` in `.env.local`. Production requires the actual environment listed above. `APP_ENV=local` cannot bypass production requirements on Railway. No database connection or email credential is required merely to compile static pages.

Pages stay prerendered, fonts stay self-hosted, and no large client UI/animation library was added. PostgreSQL/email/validation code stays server-side. Reduced motion is respected. APIs use no-store responses; the health route is dynamic. The generated 1200×630 social image uses the existing off-white wordmark/blue-light design and can be replaced in `src/app/opengraph-image.tsx`.

## 10. Railway deployment

1. Push reviewed changes to GitHub. `main` is the production branch; use feature branches for future work.
2. Create a Railway project, add PostgreSQL, then add an application from this GitHub repository with branch `main`.
3. Configure all production variables above, including `NODE_ENV=production`, `APP_URL=https://khalq.io` and the PostgreSQL service reference. Omit `APP_ENV` and local file paths. Use distinct production secrets and a real email provider. No credentials belong in GitHub Actions.
4. Let Railway read `railway.json`: **build `npm run build`; pre-deploy `npm run db:migrate`; start `npm run start`; health `/api/health`; Node 24.x**. Ensure build dependencies are installed, including TypeScript. The health route returns only `{ "status": "ok" }` or a generic 503.
5. Enable **Wait for CI**. Only a passing push workflow should permit deployment. Keep Railway serverless sleeping disabled for the app's worker.
6. Review migration logs, confirm health is 200, then complete the domains, real enquiry, email and backup checks below. No production deployment has been performed by this task.

Railway's pre-deploy command provides the migration phase. Its health check gates activation but is not continuous uptime monitoring. [Pre-deploy commands](https://docs.railway.com/deployments/pre-deploy-command), [Wait for CI](https://docs.railway.com/deployments/github-autodeploys), [health checks](https://docs.railway.com/deployments/healthchecks).

Railway documents `X-Real-IP` as its client-address header. Before enabling trust, verify that forged incoming values cannot change the selected address and that the app cannot be reached around that edge. If another proxy is added, review the chain again; do not blindly trust an arbitrary leftmost `X-Forwarded-For`. [Railway request headers](https://docs.railway.com/networking/public-networking/specs-and-limits).

## 11. Domain configuration

Add **both `khalq.io` and `www.khalq.io`** to the same Railway application. The app returns a permanent redirect from `www` to `https://khalq.io`, preserving paths and query parameters. Canonicals, sitemap and social metadata use `APP_URL`; production rejects a localhost or HTTP canonical origin. Set this variable before the production build.

## 12. DNS / SSL

The actual Railway target and verification tokens are generated for your service; they cannot be known from this repository.

| Name                               | Type                                       | Value                                                 |
| ---------------------------------- | ------------------------------------------ | ----------------------------------------------------- |
| `@` / `khalq.io`                   | CNAME with apex flattening, ALIAS or ANAME | **Exact target shown for `khalq.io` in Railway**      |
| Railway-supplied verification name | TXT                                        | **Exact verification value shown for `khalq.io`**     |
| `www`                              | CNAME                                      | **Exact target shown for `www.khalq.io` in Railway**  |
| Railway-supplied verification name | TXT                                        | **Exact verification value shown for `www.khalq.io`** |

Use a DNS provider supporting apex flattening/ALIAS. Keep existing Google Workspace MX and verification records. Add email-provider SPF/DKIM records separately; merge SPF changes rather than publishing multiple SPF policies. Railway provisions HTTPS certificates after domain verification; verify both hosts before launch. If using a CDN proxy, use strict end-to-end TLS and recheck trusted IP handling. Do not invent an A-record IP or verification token. [Railway domain/DNS instructions](https://docs.railway.com/networking/domains/working-with-domains).

## 13. Backups and recovery

Enable and inspect PostgreSQL volume backups in Railway; do not assume a schedule exists. Confirm the available daily/weekly/monthly retention in your plan, and evaluate point-in-time recovery for the acceptable data-loss window. Also keep encrypted logical dumps outside the Railway project. Volume deletion can remove associated backups, so an independent copy matters. [Railway backup options](https://docs.railway.com/volumes/backups), [PostgreSQL backup/restore guide](https://docs.railway.com/guides/postgres-backups-restores).

Use `pg_dump --format=custom --file=khalq-backup.dump` with credentials supplied privately through standard PostgreSQL environment variables or a protected password file. Do not put passwords into command history. Restore into a **separate temporary database**, run migrations/check counts and sample records, and document the successful restore time. Never first test restoration against the active production database. Treat dump files as sensitive; they are gitignored.

Choose and document recovery point/time objectives, the operator responsible, backup retention and a recurring restore-test date. An email inbox is not a lead backup.

## 14. Rollback

Redeploy the previous known-good Railway application deployment or revert the code commit on `main` and let CI pass. Keep the database at the newer compatible schema. This migration is a V1 storage change: a rollback to the original SQLite-only application is **not** a safe PostgreSQL rollback. Keep a known-good build of the new PostgreSQL-capable version for subsequent releases.

For a database incident, pause writes, preserve the current state, restore a backup into a new database, inspect and reconcile any newer leads, then explicitly switch `DATABASE_URL`. Do not overwrite live data or run destructive down migrations automatically.

## 15. Troubleshooting and operations

- **Startup fails:** inspect the listed variable names; do not print the environment. Production requires PostgreSQL, secrets, trusted proxy configuration and email settings.
- **Health 503:** check database reachability and the pre-deploy migration result. Health deliberately hides internal diagnostics. It does not test actual email delivery.
- **Enquiry succeeds but email is absent:** inspect pending `notification_outbox` jobs internally, verify sender authorization and recipient, and run `npm run notifications`. Fixed log codes identify errors without logging the lead. Jobs remain pending on failure.
- **Enquiry asks to allow cookies:** attribution uses an essential HttpOnly cookie. Verify APP_URL, HTTPS, host redirect and browser cookie settings.
- **429 for unrelated visitors:** verify the trusted edge header. Local development intentionally shares a limit unless a test proxy is configured.
- **Unexpected origin error:** use the exact configured APP_URL. The production app is intended to serve its canonical domain, not accept cross-origin submissions from its Railway preview hostname.
- **Migration checksum mismatch:** restore the original migration file and add a new migration for further changes. Do not manually change checksums to bypass the guard.
- **Privacy requests:** handle through the configured public contact or enquiry form. Review inactive leads after 12 months; lead deletion is an operator-controlled decision. The worker only expires anti-abuse metadata and analytics, not customer enquiries.
- **Policy/operator details:** review the Privacy/Terms text against actual operating practices and insert real `LEGAL_ENTITY_NAME`/`CONTACT_EMAIL` where available. No certifications or registration facts are asserted.

See [the pre-change audit](docs/production-audit.md) and [launch checklist](docs/launch-checklist.md) for the remaining external verification work.
