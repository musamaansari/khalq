# Khalq

A typography-led technology website built with Next.js App Router, TypeScript and Tailwind CSS. Includes Home, Solutions, Products, About, Privacy and Terms; responsive project conversations; and a private SQLite enquiry backend.

## Run locally

Requires Node.js 24 or later. This is a Node application, not a PHP application.

```powershell
npm install
npm run dev
```

Open http://localhost:3000. SQLite is created automatically at `data/khalq.sqlite`. The root `.htaccess` prevents Apache from serving source code or database files directly from this XAMPP directory. Do not remove that protection while the project is inside an Apache document root.

## Checks

```powershell
npm run typecheck
npm test
npm run build
```

`npm run start` serves the production build. Set `RATE_LIMIT_SECRET` before using production mode. Node 24 currently marks its built-in SQLite API experimental; no native database package is required.

Browser verification scripts use an isolated headless Chrome installation. `node scripts/check-browser.mjs` checks both enquiry flows and submits clearly labelled local QA enquiries; run it against a test database with notifications disabled. `node scripts/check-preview.mjs` checks the running preview without submitting enquiries. Screenshots are written to the ignored `test-results` directory. The implementation was verified at 390, 768 and 1440 px widths; the production build and eight backend tests pass. Apache was not running during checks, so its `.htaccess` protection still needs a runtime check if Apache is enabled.

## Content and design

- `src/lib/content.ts`: navigation, solution descriptions, contact details, product types and product catalog. Contact and social links stay hidden until real details are added.
- `src/app/globals.css`: responsive visual system, motion preferences and form styling.
- `src/components/project-form.tsx`: requirement → optional type → contact → saved confirmation. Both conversion sections have independent forms. Server errors preserve entered data.
- `src/app`: individual pages, page metadata, sitemap, robots rules and generated social image.
- Products intentionally launch with an honest empty state. Add actual entries to `products` when available; no commerce system is included.

## Enquiries and privacy

`POST /api/leads` validates and stores enquiries and a notification job in one database transaction. Fields include the contact details, requirement/type, campaign attribution, referring origin, source page, timestamp and CRM status. New enquiries start at `New`; the schema supports `Reviewing`, `Contacted`, `Qualified`, `Proposal`, `Won` and `Lost`. Enquiries are not exposed through any public read API.

Protection includes same-origin requests, a 20 KB streaming body limit, server-side length and type validation, honeypot and minimum form time, SQL parameters and persistent rate limits. Configure an upstream bot challenge if real-world abuse warrants one; these lightweight checks do not claim to stop determined attackers.

Analytics stores daily aggregate counts for approved event/page pairs. No form content, cookie identifier or advertising tracker is used. Campaign attribution remains with the private enquiry. Referrer queries and paths are discarded. Browser Do Not Track is respected.

## Production configuration

Copy `.env.example` to `.env.local` for local settings, or configure server environment variables:

- `SITE_URL`: exact public origin, e.g. `https://khalq.io`; used for origin checks and sitemap/metadata.
- `DATABASE_PATH`: private, persistent database path **outside any publicly served directory**. Back up the database and its WAL consistently (use SQLite's backup API or a database-aware backup tool).
- `RATE_LIMIT_SECRET`: a long random secret for hashing rate-limit identifiers. Generate with `node -e "console.log(require('node:crypto').randomBytes(32).toString('hex'))"`.
- `TRUSTED_IP_HEADER`: configure only behind a trusted reverse proxy that overwrites this header and blocks direct application access. Without this configuration, visitors share a conservative limit of five enquiry attempts per hour. Rate-limit records expire after their window and are removed on subsequent requests.
- `LEAD_NOTIFICATION_WEBHOOK`: HTTPS endpoint for the approved internal email/CRM notification integration.
- `LEAD_NOTIFICATION_TOKEN`: optional bearer token for that endpoint.

An enquiry triggers delivery after the response when a webhook is configured. Failures stay in the outbox for retry. Run `npm run notifications` every minute with the same environment and database to retry pending notifications, including those submitted before configuration. The worker sends `project_enquiry.created`, a private lead payload, and an idempotency key; the receiver should deduplicate by that key. Treat every valid enquiry as ready for internal review; human qualification is represented by the status pipeline.

Deploy V1 to one Node server with a persistent private disk, HTTPS and a correctly configured reverse proxy. Ephemeral/serverless or multiple-replica deployment requires moving storage/rate limiting/outbox to a shared managed database. SQLite is the intentional single-server V1 choice.

Before public launch: configure the notification destination and trusted proxy, add real business contact details, decide a lead-retention schedule, and review the concise Privacy/Terms text against the actual operating entity and practices. No notification destination, legal entity, customer, testimonial or product has been invented. This repository does not publish or send external messages by itself while integrations are unconfigured.
