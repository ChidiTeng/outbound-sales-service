# Admin social listening

Route: `/sales-engine/social-listening`. The shared navigation links to it.

This is a cross-business oversight workspace. Client account identities and prospect companies come from the existing Smart Leads fixtures. Social excerpts, intent scores, review decisions, scan history, and settings are illustrative fixtures in `lib/social-listening.ts`; they are not fetched from either sales-engine project.

## Views

- **Overview:** scoped monitoring counts, review backlog, failed scans, source distribution, and client portfolio.
- **Businesses:** searchable business selector, ICP summary, monitoring configuration, recent evidence, pause/resume, and manual scan queueing.
- **Signal review:** cross-business search, source/status filters, pagination, CSV export, bulk review, and an evidence drawer. Approve, suppress, and return-to-review actions require a reason.
- **Scan operations:** per-source run summaries, run history, failure diagnostics, and retry queueing. Paused clients and clients with queued runs cannot queue another scan.
- **Activity log:** fixture history and admin actions performed during the current session, scoped to the selected business.

Configuration edits control enabled sources, keywords, cadence, minimum score, freshness, and client CRM destination. They describe future scan behavior and do not retroactively remove captured evidence. Source summaries reflect fixture run history, not a live provider check.

All mutations use React state and reset on refresh. Queued scans remain queued because no worker is connected. Review approval records an admin quality decision; it does not create a CRM record or send outreach. Native dialogs provide focus containment, Escape dismissal, and focus restoration.

No API, authentication, provider, or CRM integrations are included. Before integration, business scoping and admin authorization must also be enforced by the backend; the UI scope selector is a display filter.
