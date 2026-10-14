# Admin Smart Leads

The workspace uses the existing onboarded business and prospect fixtures in `lib/smart-leads.ts`. It has no API integration.

- Select a client, search or sort businesses, then review the client’s sample prospect pool.
- Summary metrics, intent distribution, and buying-signal coverage use the displayed sample records. Outreach bars use the separate illustrative 14-day cadence fixture.
- Donut segments and buying-signal cards filter the prospect directory. Search, intent, buying-signal filters, pagination, and bulk selection work locally.
- Inspect opens a native dialog with evidence, contacts, activity, and per-prospect admin notes. Notes survive closing the dialog within the page session.
- Demo enrollment supports individual and selected prospects, records the local prepared state, and sends no messages. Refresh resets notes and enrollment.
- Charts animate on viewport entry and expose values on hover or keyboard focus. Reduced motion disables animation.
- Desktop client selectors stay below the measured navigation header and scroll internally when needed. Mobile provides a compact client selector and expandable business filters.

The page imports the shared Social Listening workspace styles, CRM chart styles, and its own scoped stylesheet. Shared header measurement and selector pinning also apply to CRM and Social Listening.
