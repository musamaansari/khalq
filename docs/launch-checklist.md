# Khalq launch verification

Status: **NOT READY FOR PRODUCTION**. Local preparation is implemented; production services have not been configured or verified in this workspace.

## Implemented locally

- Existing design and conversational form retained; contrast and interaction accessibility refined.
- Shared asynchronous SQLite/PostgreSQL persistence, versioned migrations, legacy SQLite upgrade, explicit import tool.
- Lead references, deduplicated retries, normalized international contacts, status pipeline and attribution fields.
- Signed first-touch attribution across navigation; server-side validation and abuse controls.
- Transactional email outbox, Resend/Gmail OAuth/legacy-webhook adapters, supervised retry/maintenance worker.
- Minimal pseudonymous funnel events, server-recorded submissions, health endpoint and safe logs.
- Canonical metadata, www redirect, security headers, branded error pages, updated Privacy/Terms.
- Node 24 Railway configuration, CI with PostgreSQL, environment template, deployment/backup/rollback documentation.

## Production blockers — all remain open

Local verification completed: production build, lint and type checking pass; 19 backend tests pass, with the real-network PostgreSQL integration test skipped locally. The SQLite and embedded PostgreSQL contracts pass. Desktop/mobile form and keyboard QA, campaign persistence, intercepted email delivery/failure/retry, analytics, health, policy links, 404, canonical metadata and www redirect pass. Both scanned views have zero automated WCAG A/AA violations. No live inbox or deployed database was tested.

1. **Railway and production PostgreSQL:** create/connect the app and PostgreSQL services; set the real private DATABASE_URL; verify authenticated connectivity, pre-deploy migration success and health 200. Local embedded PostgreSQL tests do not verify this environment. If meaningful SQLite leads exist, back up, freeze writes, import and reconcile them before switching traffic.
2. **Production secrets and proxy configuration:** configure APP_URL, distinct secrets, a real email provider and verified trusted client-IP handling. Test forged header values through the actual public edge. No production secrets have been supplied or inspected.
3. **Real notification delivery:** configure the authorized sender and internal recipient, provider credentials and sender DNS/OAuth permissions. Submit controlled desktop/mobile enquiries on the deployed app, verify database records and actual mailbox receipt, and test a provider failure followed by a retry. Local intercepted email delivery is not live inbox verification.
4. **Domains, DNS and HTTPS:** add both khalq.io and www.khalq.io to the Railway app; copy the generated CNAME/ALIAS targets and verification TXT records to the DNS provider; confirm certificate issuance, canonical URLs, preserved-query www redirects and no mixed content. Exact service-specific targets/tokens are unavailable until the service is configured.
5. **Backups and recovery:** enable an appropriate schedule/PITR as supported by the plan, create an independent encrypted dump, and successfully restore into a separate test database. Record retention, recovery objectives and an accountable operator. No production backup exists that this task has verified.
6. **Deployment gate and production QA:** push the reviewed branch, run the real-PostgreSQL CI job, enable Railway Wait for CI, keep worker sleeping disabled, and verify the release on the canonical host. No deployment or GitHub workflow run has been triggered from this workspace.

## Owner review before public launch

- Supply actual public contact/legal operator information where available and review the Privacy/Terms against the chosen processors, region and retention practices.
- Decide who reviews new enquiries and pending notification jobs, handles privacy requests and reviews inactive enquiries after 12 months.
- Confirm that any legacy QA/test enquiries are excluded from a real-data import.

## Evidence to retain for launch sign-off

Record the deployment/commit ID, completed migration names, health result, test lead references, database and notification status checks, inbox receipt times, TLS/redirect results, successful restore evidence and CI URL. Keep credentials and personal lead content out of this document. Change the launch status only after every production blocker above has been resolved and verified.
