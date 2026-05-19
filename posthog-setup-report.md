<wizard-report>
# PostHog post-wizard report

The wizard has completed a deep integration of PostHog analytics into the Saint & Story Logistics Next.js app. Here is a summary of every change made:

- **`instrumentation-client.ts`** (new file) — Initialises PostHog on the client side using the Next.js 15.3+ instrumentation approach. Enables automatic error tracking (`capture_exceptions: true`) and routes all events through a reverse proxy at `/ingest`.
- **`next.config.ts`** — Added reverse proxy rewrites so PostHog requests go through `/ingest/*` on your own domain, improving ad-blocker resilience. Also set `skipTrailingSlashRedirect: true` as required by PostHog.
- **`.env.local`** — Created with `NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN` and `NEXT_PUBLIC_POSTHOG_HOST` environment variables.
- **`components/QuoteForm.tsx`** — Tracks `quote_form_submitted` when the form is submitted. Also calls `posthog.identify()` with the user's email as their distinct ID, storing name and phone as person properties.
- **`components/Hero.tsx`** — Tracks `hero_cta_clicked` (Book Your Move button) and `hero_phone_clicked` (Call CTA). Converted to `"use client"` component.
- **`components/Nav.tsx`** — Tracks `nav_quote_clicked` when the nav quote button is clicked. Converted to `"use client"` component.
- **`components/MobileBar.tsx`** — Tracks `mobile_bar_cta_clicked` when the sticky mobile CTA is tapped. Converted to `"use client"` component.
- **`components/FinalCTA.tsx`** — Tracks `final_cta_clicked` and `final_cta_phone_clicked`. Converted to `"use client"` component.
- **`components/FAQ.tsx`** — Tracks `faq_item_opened` (with the question text as a property), `faq_quote_clicked`, and `faq_phone_clicked`.
- **`components/Services.tsx`** — Tracks `service_learn_more_clicked` with the service name as a property. Converted to `"use client"` component.

## Events tracked

| Event | Description | File |
|---|---|---|
| `quote_form_submitted` | User submits the quote request form | `components/QuoteForm.tsx` |
| `hero_cta_clicked` | User clicks "Book Your Move" CTA in the hero | `components/Hero.tsx` |
| `hero_phone_clicked` | User clicks the phone number CTA in the hero | `components/Hero.tsx` |
| `nav_quote_clicked` | User clicks "Get a Free Quote" in the nav bar | `components/Nav.tsx` |
| `mobile_bar_cta_clicked` | User taps the sticky mobile "Get Your Free Quote" button | `components/MobileBar.tsx` |
| `final_cta_clicked` | User clicks "Get your free quote" in the bottom section | `components/FinalCTA.tsx` |
| `final_cta_phone_clicked` | User clicks "Call us now" in the bottom section | `components/FinalCTA.tsx` |
| `faq_item_opened` | User expands a FAQ accordion item (includes question text) | `components/FAQ.tsx` |
| `faq_quote_clicked` | User clicks "Get a free quote" at the bottom of the FAQ | `components/FAQ.tsx` |
| `faq_phone_clicked` | User clicks the phone number at the bottom of the FAQ | `components/FAQ.tsx` |
| `service_learn_more_clicked` | User clicks "Learn More" on a service card (includes service name) | `components/Services.tsx` |

## Next steps

We've built a dashboard and five insights to monitor user behaviour based on the events just instrumented:

- [Analytics basics dashboard](/dashboard/690785)
- [Quote Form Submissions](/insights/LantTbtZ) — daily trend of form submissions (your primary conversion)
- [Quote Conversion Funnel](/insights/d680i30C) — drop-off from Hero CTA click → form submitted
- [CTA Click Sources](/insights/ENOxsxJc) — which CTA placement drives the most clicks (hero vs nav vs mobile vs final)
- [Phone Call Clicks](/insights/9wPGMnqg) — phone intent across all sections
- [FAQ Engagement](/insights/zpNJwEcV) — which FAQ topics generate the most curiosity

### Agent skill

We've left an agent skill folder in your project at `.claude/skills/integration-nextjs-app-router/`. You can use this context for further agent development when using Claude Code. This will help ensure the model provides the most up-to-date approaches for integrating PostHog.

</wizard-report>
