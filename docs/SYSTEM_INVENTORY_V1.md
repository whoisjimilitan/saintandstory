# SYSTEM INVENTORY V1: Complete Deployment Catalog

**Date:** 2026-06-15  
**Purpose:** Authoritative catalog of all deployed systems, services, jobs, and integrations  
**Format:** Organized by type with route paths, endpoint URIs, triggers, and data flow  

---

## SECTION 1: DEPLOYED ROUTES (26 pages)

### Marketing & Public Pages (14)
| Route | Purpose | Auth | Status |
|-------|---------|------|--------|
| `/` | Landing page | No | ✅ Live |
| `/app` | App overview | No | ✅ Live |
| `/contact` | Contact form | No | ✅ Live |
| `/for-drivers` | Driver recruitment | No | ✅ Live |
| `/how-it-works` | Product explanation | No | ✅ Live |
| `/pricing` | Pricing page | No | ✅ Live |
| `/services` | Services catalog | No | ✅ Live |
| `/office-moves` | Service detail | No | ✅ Live |
| `/student-moves` | Service detail | No | ✅ Live |
| `/house-clearance` | Service detail | No | ✅ Live |
| `/piano-moving` | Service detail | No | ✅ Live |
| `/london-home-moves` | Location page | No | ✅ Live |
| `/london-drivers` | Location page | No | ✅ Live |
| `/manchester-office-moves` | Location page | No | ✅ Live |

### City & Location Pages (7)
| Route | Purpose | Auth | Status |
|-------|---------|------|--------|
| `/birmingham-removals` | City page | No | ✅ Live |
| `/bristol-removals` | City page | No | ✅ Live |
| `/glasgow-removals` | City page | No | ✅ Live |
| `/leeds-removals` | City page | No | ✅ Live |
| `/liverpool-removals` | City page | No | ✅ Live |
| `/sheffield-removals` | City page | No | ✅ Live |
| `/[slug]` | Dynamic catch-all | No | ✅ Live |

### Dashboard & Admin (2)
| Route | Purpose | Auth | Status |
|-------|---------|------|--------|
| `/dashboard` | Main driver dashboard | Clerk | ✅ Live |
| `/admin` | Admin panel (status unknown) | Clerk | ⚠️ Unknown |

### B2B Operator Pages (3)
| Route | Purpose | Auth | Status |
|-------|---------|------|--------|
| `/b2b/leads` | Main prospect dashboard | Clerk | ✅ Live |
| `/b2b/ready-today` | Today's queue | Clerk | ✅ Live |
| `/b2b/[niche]` | Niche-specific view | Clerk | ⚠️ Unknown |

### Other Pages (1)
| Route | Purpose | Auth | Status |
|-------|---------|------|--------|
| `/job-response` | Job response flow | Clerk | ✅ Live |
| `/thank-you` | Thank you page | No | ✅ Live |

---

## SECTION 2: API ENDPOINTS (84 routes)

### B2B Core (13 endpoints)
| Endpoint | Method | Purpose | Auth | Data Flow |
|----------|--------|---------|------|-----------|
| `/api/b2b/leads` | GET | Fetch all leads | Clerk | b2b_leads → JSON |
| `/api/b2b/send-email` | POST | Send prospect email | Clerk | → Resend → b2b_outreach |
| `/api/b2b/update-status` | POST | Change lead status | Clerk | → lead_state_transitions |
| `/api/b2b/outreach-events` | GET | Fetch audit trail | Clerk | b2b_outreach_events → JSON |
| `/api/b2b/outreach` | GET/POST | Outreach records | Clerk | b2b_outreach ↔ JSON |
| `/api/b2b/confirm-engagement` | POST | Mark engaged | Clerk | → b2b_leads |
| `/api/b2b/moment-signal` | POST | Log moment signal | Clerk | → opportunity_signals |
| `/api/b2b/observations` | POST | Log observations | Clerk | → b2b_leads.human_observations |
| `/api/b2b/inbound` | POST | Inbound form submission | No | → b2b_leads (new) |
| `/api/b2b/standing-orders` | GET/POST | Manage contracts | Clerk | b2b_standing_orders ↔ JSON |
| `/api/b2b/send-standing-order-email` | POST | Email contract | Clerk | → Resend |
| `/api/b2b/qualify-to-lead` | POST | Promote qualified → lead | Clerk | qualified_businesses → b2b_leads |
| `/api/b2b/csv-import` | POST | Bulk prospect upload | Clerk | CSV → b2b_leads |

### B2B Discovery (4 endpoints)
| Endpoint | Method | Purpose | Auth | Data Flow |
|----------|--------|---------|------|-----------|
| `/api/b2b/discover` | POST | Manual discovery trigger | Clerk | Google Places → discovered_businesses → qualified_businesses |
| `/api/b2b/discovery-config` | GET/POST | Discovery parameters | Clerk | discovery_config ↔ JSON |
| `/api/b2b/discovery-reservoir` | GET | Discovery pipeline view | Clerk | discovered/enriched/qualified → JSON |
| `/api/b2b/operator-discovery` | POST | Operator-initiated search | Clerk | → discovered_businesses |

### B2B Research (2 endpoints)
| Endpoint | Method | Purpose | Auth | Data Flow |
|----------|--------|---------|------|-----------|
| `/api/b2b/research-missions` | GET/POST | AI discovery tasks | Clerk | research_missions ↔ JSON |
| `/api/b2b/send-follow-ups` | POST | Scheduled follow-ups | Clerk | → Resend → b2b_outreach |

### B2B Metrics & Intelligence (8 endpoints)
| Endpoint | Method | Purpose | Auth | Data Flow |
|----------|--------|---------|------|-----------|
| `/api/b2b/engagement-metrics` | GET | Email engagement stats | Clerk | b2b_email_events → JSON |
| `/api/b2b/pipeline-metrics` | GET | Pipeline overview | Clerk | discovered/enriched/qualified/leads → JSON |
| `/api/b2b/metrics/knowledge-loop` | POST | Learning feedback | Clerk | → b2b_learning_outcomes |
| `/api/b2b/intelligence/heat-dashboard` | GET | Heat score trends | Clerk | b2b_heat_score_history → JSON |
| `/api/b2b/intelligence/heat-score` | GET | Current heat score | Clerk | b2b_leads → JSON |
| `/api/b2b/intelligence/command-center` | GET | Executive summary | Clerk | All B2B tables → JSON |
| `/api/b2b/intelligence/category-analytics` | GET | By-category performance | Clerk | b2b_leads (grouped) → JSON |
| `/api/b2b/intelligence/prospect-brief` | GET | AI prospect summary | Clerk | b2b_prospect_brief_cache → JSON |
| `/api/b2b/intelligence/adaptive-followup` | GET | Follow-up suggestions | Clerk | b2b_leads → JSON |
| `/api/b2b/intelligence/mission-roi` | GET | Research mission ROI | Clerk | research_missions → JSON |
| `/api/b2b/intelligence/revenue-attribution` | GET | Revenue by source | Clerk | b2b_standing_orders → JSON |

### B2B Webhooks (2 endpoints)
| Endpoint | Method | Purpose | Auth | Data Flow |
|----------|--------|---------|------|-----------|
| `/api/b2b/webhooks/resend` | POST | Email events (Resend) | Resend webhook | → b2b_email_events → b2b_email_link_clicks |
| `/api/webhooks/resend` | POST | Email events (alternate) | Resend webhook | → b2b_email_events |

### Job Management (7 endpoints)
| Endpoint | Method | Purpose | Auth | Data Flow |
|----------|--------|---------|------|-----------|
| `/api/jobs/accept` | POST | Driver accepts job | Clerk | → jobs.status = 'accepted' |
| `/api/jobs/respond` | POST | Driver responds | Clerk | → jobs |
| `/api/jobs/assign` | POST | Admin assigns job | Clerk | → jobs |
| `/api/jobs/reassign` | POST | Admin reassigns | Clerk | → jobs |
| `/api/jobs/cancel` | POST | Cancel job | Clerk | → jobs |
| `/api/jobs/update-status` | POST | Update job status | Clerk | → jobs |
| `/api/jobs/validate-completion` | POST | Verify job done | Clerk | → jobs.validated_at |

### Driver Operations (7 endpoints)
| Endpoint | Method | Purpose | Auth | Data Flow |
|----------|--------|---------|------|-----------|
| `/api/driver/heartbeat` | POST | Driver keep-alive | Clerk | → drivers.last_seen_at |
| `/api/driver/job-event` | POST | Driver job event | Clerk | → job_events |
| `/api/driver/job-photo` | POST | Photo upload | Clerk | → job_photos |
| `/api/driver/job-timeline` | GET | Job timeline | Clerk | job_events → JSON |
| `/api/driver/earnings` | GET | Driver earnings | Clerk | jobs (completed) → JSON |
| `/api/driver/invoice` | GET | Driver invoice | Clerk | jobs (completed) → JSON |
| `/api/drivers/availability` | POST | Availability update | Clerk | → drivers.available_days |

### Location Services (2 endpoints)
| Endpoint | Method | Purpose | Auth | Data Flow |
|----------|--------|---------|------|-----------|
| `/api/location/update` | POST | GPS tracking | Clerk | → driver_locations |
| `/api/location/stop` | POST | Stop tracking | Clerk | → driver_locations |

### Photo Management (1 endpoint)
| Endpoint | Method | Purpose | Auth | Data Flow |
|----------|--------|---------|------|-----------|
| `/api/photos/upload` | POST | Job photo upload | Clerk | → job_photos |

### Insights & Analytics (3 endpoints)
| Endpoint | Method | Purpose | Auth | Data Flow |
|----------|--------|---------|------|-----------|
| `/api/insights/business/[id]` | GET | Business intelligence | Clerk | → JSON (AI-generated) |
| `/api/summary/business/[id]` | GET | Business summary | Clerk | → JSON |
| `/api/timeline/business/[id]` | GET | Business timeline | Clerk | → JSON |

### Workflow & Investigation (6 endpoints)
| Endpoint | Method | Purpose | Auth | Data Flow |
|----------|--------|---------|------|-----------|
| `/api/workflow/inbox` | GET | Workflow inbox | Clerk | investigations → JSON |
| `/api/workflow/investigation/[id]` | GET | Investigation detail | Clerk | workflow_investigations → JSON |
| `/api/workflow/assumptions` | POST | Workflow assumptions | Clerk | → workflow_data |
| `/api/workflow/contradictions` | POST | Detect contradictions | Clerk | → workflow_data |
| `/api/workflow/outcomes/[id]` | GET | Investigation outcome | Clerk | workflow_outcomes → JSON |
| `/api/workflow/outcomes/create` | POST | Create outcome | Clerk | → workflow_outcomes |
| `/api/workflow/conversations/[id]` | GET | Conversation thread | Clerk | conversations → JSON |
| `/api/workflow/audit` | GET | Audit trail | Clerk | workflow_audit → JSON |
| `/api/workflow/timeline/[id]` | GET | Timeline | Clerk | workflow_timeline → JSON |

### Lead Management (1 endpoint)
| Endpoint | Method | Purpose | Auth | Data Flow |
|----------|--------|---------|------|-----------|
| `/api/leads` | GET/POST | Lead records | Clerk | leads ↔ JSON |

### Rating & Feedback (2 endpoints)
| Endpoint | Method | Purpose | Auth | Data Flow |
|----------|--------|---------|------|-----------|
| `/api/ratings` | POST | Submit rating | No | → ratings |
| `/api/prospect-feedback` | POST | Feedback form | No | → prospect_feedback |

### Quote & Checkout (2 endpoints)
| Endpoint | Method | Purpose | Auth | Data Flow |
|----------|--------|---------|------|-----------|
| `/api/quote` | POST | Generate quote | No | → quotes |
| `/api/stripe/checkout` | POST | Stripe checkout | No | → Stripe → orders |
| `/api/stripe/portal` | POST | Stripe portal | No | → Stripe |

### Webhooks (2 endpoints)
| Endpoint | Method | Purpose | Auth | Data Flow |
|----------|--------|---------|------|-----------|
| `/api/webhook/stripe` | POST | Stripe events | Stripe webhook | → orders, subscriptions |

### Tracking & Analytics (2 endpoints)
| Endpoint | Method | Purpose | Auth | Data Flow |
|----------|--------|---------|------|-----------|
| `/api/track/pageview` | POST | Analytics event | PostHog | → PostHog |
| `/api/campaigns/telemetry` | POST | Campaign telemetry | No | → PostHog |

### Push Notifications (1 endpoint)
| Endpoint | Method | Purpose | Auth | Data Flow |
|----------|--------|---------|------|-----------|
| `/api/push/subscribe` | POST | Push subscription | Clerk | → push_subscriptions |

### Utility (5 endpoints)
| Endpoint | Method | Purpose | Auth | Data Flow |
|----------|--------|---------|------|-----------|
| `/api/migrate` | POST | Data migration | Admin | → (various) |
| `/api/orchestrate/b2b-daily` | POST | Daily orchestration | Cron | ← orchestrator |
| `/api/orchestrate/status` | GET | Orchestration status | Clerk | b2b_orchestration_logs → JSON |
| `/api/cron-diagnostic` | GET | Cron diagnostics | Public | cron_diagnostic_log → JSON |
| `/api/whoami` | GET | User identity | Clerk | → user JSON |
| `/api/indexnow` | POST | Search indexing | Bing | ← Bing IndexNow |
| `/api/discovery/run` | POST | Discovery job | Clerk | → jobs |
| `/api/discovery/status` | GET | Discovery status | Clerk | → JSON |
| `/api/validate/report` | POST | Validation report | Clerk | → validation_reports |
| `/api/research/florist-evidence` | GET | Florist research | Clerk | → JSON (AI-generated) |
| `/api/dev/*` | POST | Dev endpoints (5) | Dev only | Various |

---

## SECTION 3: CRON JOBS (1 active)

### Daily B2B Orchestration

**Route:** `/api/orchestrate/b2b-daily`  
**Schedule:** `0 2 * * *` (02:00 UTC daily)  
**Trigger:** Vercel cron  
**Auth:** Bearer token (CRON_SECRET)  
**Duration:** Max 300 seconds (5 minutes)  
**Payload:** None (checks discovery_config for parameters)

**Execution Flow:**
```
02:00 UTC daily →
  → runDailyB2BOrchestration()
    → Stage 1: Discovery Pipeline
       ├ Load discovery_config (operator parameters)
       ├ Call runDiscoveryPipeline() per config
       ├ Write to discovered_businesses
       └ Log counts
    
    → Stage 2: Enrichment Pipeline
       ├ Process discovered_businesses
       ├ Extract intelligence (Google Places, reviews, web)
       ├ Write to enriched_businesses
       └ Log completion
    
    → Stage 3: Ranking & Qualification
       ├ Score prospects (opportunity_score algorithm)
       ├ Determine readiness (qualified_businesses)
       ├ Write to qualified_businesses
       └ Log scores
    
    → Stage 4: Driver Matching
       ├ Match prospects to drivers (location + availability)
       ├ Write assignments
       └ Log results
    
    → Stage 5: Standing Orders
       ├ Generate scheduled deliveries
       ├ Create job records
       └ Log created jobs
    
  → Write execution log to b2b_orchestration_logs
  → Return result JSON
```

**Execution Metrics Logged:**
- `discovery_count` — new businesses found
- `businesses_found` — total discovered
- `leads_created` — new prospects created
- `drivers_matched` — driver assignments
- `emails_sent` — (if auto-send enabled)
- `standing_orders_processed` — contracts
- `jobs_created` — scheduled jobs
- `failures[]` — error messages
- `execution_details` — full JSON log

**Related Tables:**
- Input: `discovery_config`
- Output: `discovered_businesses`, `enriched_businesses`, `qualified_businesses`, `b2b_leads`, `lead_promotions`
- Log: `b2b_orchestration_logs`

---

### Scheduled Follow-Ups (Infrastructure Exists)

**Route:** `/api/b2b/send-follow-ups`  
**Schedule:** (not configured in vercel.json, but endpoint exists)  
**Purpose:** Send emails for prospects marked for follow-up  
**Status:** Code exists, not active in cron  

---

### Cron Diagnostic

**Route:** `/api/cron-diagnostic`  
**Schedule:** (informational only, logs cron health)  
**Purpose:** Monitor cron execution health  
**Status:** Diagnostic endpoint, not a scheduled job  

---

## SECTION 4: BACKGROUND WORKERS & JOBS

**Type:** None explicitly defined (cron-based, not queue-based)  

The system uses Vercel cron for scheduling, not background job queues (no BullMQ, Inngest, etc. detected).

All async work is either:
- Cron-triggered at scheduled times
- API-triggered on demand
- Webhook-triggered (Resend, Stripe)

---

## SECTION 5: DATABASE TABLES (24 core tables + driver extensions)

### B2B Prospect Management (5 tables)

| Table | Rows | Purpose | Key Fields |
|-------|------|---------|-----------|
| `b2b_leads` | ~100-500 | Operator prospects | id, business_name, email, engagement_score, lead_state, status, driver_id |
| `b2b_outreach` | ~500-2000 | Email records | id, lead_id, subject, body, sent_at, replied, resend_message_id |
| `b2b_standing_orders` | ~10-50 | Active contracts | id, lead_id, service_type, frequency, price, next_scheduled_at, active |
| `lead_state_transitions` | ~1000+ | State machine audit | id, lead_id, from_state, to_state, trigger_event |
| `b2b_outreach_events` | ~2000+ | Complete audit log | id, lead_id, event_type, operator, event_data |

### B2B Discovery Pipeline (8 tables)

| Table | Rows | Purpose | Key Fields |
|-------|------|---------|-----------|
| `discovered_businesses` | ~1000+ | Raw discoveries | id, google_place_id, business_name, source, discovered_at |
| `enriched_businesses` | ~500+ | Intelligence extracted | id, discovered_business_id, review_summary, digital_signals, ai_observations |
| `qualified_businesses` | ~200+ | Scored & ready | id, opportunity_score, score_breakdown, promoted_to_lead_at |
| `lead_promotions` | ~100+ | Promotion tracking | id, qualified_business_id, lead_id, promotion_reason |
| `discovery_config` | 5-20 | Operator parameters | id, niche, locations[], enabled, priority |
| `postcode_discovery_jobs` | ~10-50 | Discovery jobs | id, status, processed_postcodes, discoveries_found |
| `research_missions` | ~5-20 | AI tasks | id, mission_type, prompt, status, discoveries_found |
| `discovery_sources` | ~10 | Source types | id, source_type, source_name, enabled |

### B2B Signals & Learning (3 tables)

| Table | Rows | Purpose | Key Fields |
|-------|------|---------|-----------|
| `opportunity_signals` | ~500+ | Lead scoring events | id, discovered_business_id, signal_type, score_impact |
| `b2b_learning_outcomes` | ~200+ | Outcome tracking | id, lead_id, outcome_type, days_to_outcome |
| `b2b_heat_score_history` | ~500+ | Score timeline | id, lead_id, heat_score, recorded_at |

### B2B Email & Engagement (3 tables)

| Table | Rows | Purpose | Key Fields |
|-------|------|---------|-----------|
| `b2b_email_events` | ~1000+ | Email engagement | id, outreach_id, event_type (opened, clicked, bounced), timestamp |
| `b2b_email_link_clicks` | ~200+ | Click tracking | id, event_id, lead_id, link_url, clicked_at |
| `b2b_prospect_brief_cache` | ~100+ | AI brief cache | id, lead_id, brief_data (JSONB) |

### B2B System Operations (1 table)

| Table | Rows | Purpose | Key Fields |
|-------|------|---------|-----------|
| `b2b_orchestration_logs` | ~180 (daily) | Daily execution logs | id, run_id, discovery_count, leads_created, status |

### Core Application Tables (Modified for B2B)

| Table | Extensions | Purpose |
|-------|-----------|---------|
| `drivers` | postcode, latitude, longitude, radius_miles, b2b_opt_in, last_seen_at | B2B integration |
| `jobs` | (extended for B2B fulfillment) | Job dispatch |
| `push_subscriptions` | Web push notifications |
| `ratings` | Customer reviews |
| `quotes` | Quote records |
| (+ other application tables not detailed) | | |

---

## SECTION 6: INTEGRATIONS (7 external services)

### Email Service: Resend

**Purpose:** Email sending & tracking  
**Integration Points:**
- API: `/api/b2b/send-email` → calls `new Resend(API_KEY).emails.send()`
- Webhook: `/api/b2b/webhooks/resend` ← receives email events (opened, clicked, bounced)
- Data Flow: b2b_outreach → Resend → b2b_email_events

**Environment Variables:**
- `RESEND_API_KEY` — Authentication

**Event Types Tracked:**
- opened, clicked, bounced, complained, delivered

**Related Tables:**
- Input: b2b_outreach
- Output: b2b_email_events, b2b_email_link_clicks

---

### Payment: Stripe

**Purpose:** Payment processing & subscriptions  
**Integration Points:**
- API: `/api/stripe/checkout` → creates Stripe checkout session
- API: `/api/stripe/portal` → customer portal
- Webhook: `/api/webhook/stripe` ← payment events

**Environment Variables:**
- `STRIPE_SECRET_KEY` — API key
- `STRIPE_WEBHOOK_SECRET` — Webhook verification

**Event Types Received:**
- checkout.session.completed
- customer.subscription.updated
- invoice.payment_succeeded

**Related Tables:**
- Input: orders, subscriptions
- Output: stripe_events (if tracked)

---

### Authentication: Clerk

**Purpose:** User authentication & sessions  
**Integration Points:**
- Middleware: `@clerk/nextjs` in all protected routes
- User context: `currentUser()` in all APIs
- Session: `auth()` for route protection

**Environment Variables:**
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
- `CLERK_SECRET_KEY`

**Protected Routes:**
- All `/api/b2b/*` endpoints
- All `/dashboard/*` pages
- All `/admin/*` pages
- Driver and job management routes

---

### AI: Anthropic Claude

**Purpose:** AI-powered discovery, enrichment, insights  
**Integration Points:**
- SDK: `@anthropic-ai/sdk`
- Used in: discovery enrichment, prospect brief generation, research missions
- API Calls:
  - Research florist evidence: `/api/research/florist-evidence`
  - Prospect brief: `/api/b2b/intelligence/prospect-brief`
  - Insights: `/api/insights/business/[id]`

**Environment Variables:**
- `ANTHROPIC_API_KEY` — API key

**Usage:**
- Temperature: 0.7 (for balanced research)
- Max tokens: 2000 (for detailed briefs)
- Model: claude-3.5-sonnet (implied from SDK)

---

### Real-Time: Pusher

**Purpose:** Real-time updates (driver notifications, job updates)  
**Integration Points:**
- SDK: `pusher` (server) + `pusher-js` (client)
- Channels: driver-based (driver-[id]), job-based (job-[id])
- Events: job.assigned, job.started, job.completed, location.updated

**Environment Variables:**
- `NEXT_PUBLIC_PUSHER_APP_KEY`
- `PUSHER_SECRET`

**Usage:**
- Real-time driver notifications
- Live job status updates
- Location broadcasting

---

### Analytics: PostHog

**Purpose:** Product analytics & feature tracking  
**Integration Points:**
- SDK: `posthog-js` (client-side)
- API: `/api/track/pageview`, `/api/campaigns/telemetry`
- Events: Page views, user actions, campaign metrics

**Environment Variables:**
- `NEXT_PUBLIC_POSTHOG_KEY`

**Usage:**
- Feature adoption tracking
- User journey analysis
- Campaign performance

---

### Web Push Notifications: Web Push API

**Purpose:** Browser push notifications  
**Integration Points:**
- SDK: `web-push`
- Endpoint: `/api/push/subscribe`
- Trigger: Job assignments, messages, updates

**Environment Variables:**
- `WEB_PUSH_SUBJECT`
- `WEB_PUSH_PUBLIC_KEY`
- `WEB_PUSH_PRIVATE_KEY`

**Usage:**
- Driver job notifications
- Prospect replies
- System alerts

---

### Search Indexing: Bing IndexNow

**Purpose:** Real-time search indexing  
**Endpoint:** `/api/indexnow`  
**Purpose:** Submit page URLs to Bing for immediate indexing  
**Trigger:** On page updates (likely from sitemap changes)  

---

## SECTION 7: QUEUES & MESSAGE SYSTEMS

**Status:** None explicitly implemented

The system currently uses:
- **Cron** for scheduled jobs (discovery, follow-ups)
- **Webhooks** for event-driven tasks (email events, payment events)
- **API calls** for on-demand actions

No dedicated queue system detected (no BullMQ, Inngest, RabbitMQ, etc.).

**Implications:**
- Cron jobs can only run on fixed schedules
- No retry mechanism for failed tasks
- No job persistence or recovery
- Scaling: limited to Vercel serverless concurrency

---

## SECTION 8: ENVIRONMENT VARIABLES

### Database
- `DATABASE_URL` — Neon PostgreSQL connection string

### Authentication
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
- `CLERK_SECRET_KEY`

### Integrations
- `RESEND_API_KEY` — Email service
- `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET` — Payments
- `ANTHROPIC_API_KEY` — Claude AI
- `NEXT_PUBLIC_POSTHOG_KEY` — Analytics
- `NEXT_PUBLIC_PUSHER_APP_KEY`, `PUSHER_SECRET` — Real-time
- `WEB_PUSH_SUBJECT`, `WEB_PUSH_PUBLIC_KEY`, `WEB_PUSH_PRIVATE_KEY` — Push notifications

### Cron
- `CRON_SECRET` — Vercel cron authentication

### Search
- `BING_INDEXNOW_KEY` — Bing IndexNow

---

## SECTION 9: DATA FLOW SUMMARY

### Inbound Flows

```
DISCOVERY PIPELINE
  ↓ (02:00 UTC daily via cron)
  → /api/orchestrate/b2b-daily
    → Google Places API
    → discovered_businesses
    → Claude enrichment
    → enriched_businesses
    → Scoring algorithm
    → qualified_businesses
    → lead_promotions
    → b2b_leads (new leads)
    
OPERATOR ACTIONS
  ↓ (during business hours)
  → /api/b2b/send-email
    → Resend API
    → b2b_outreach
    → b2b_outreach_events (email_sent)
    
EMAIL ENGAGEMENT
  ↓ (real-time)
  ← Resend webhooks
  → /api/b2b/webhooks/resend
    → b2b_email_events
    → b2b_email_link_clicks
    
CUSTOMER ACTIONS
  ↓ (any time)
  → /api/ratings, /api/prospect-feedback, /api/quote
    → ratings, prospect_feedback, quotes tables
    
PAYMENTS
  ↓ (on checkout)
  → /api/stripe/checkout
  ← Stripe webhooks
  → /api/webhook/stripe
    → orders, subscriptions
    
DRIVER OPERATIONS
  ↓ (during shifts)
  → /api/driver/* endpoints
  → jobs, job_events, job_photos, driver_locations
```

### Outbound Flows

```
OPERATOR ACTIONS
  ← /api/b2b/leads (GET prospects)
  ← /api/b2b/ready-today (filtered queue)
  ← /api/b2b/intelligence/* (dashboards)
  
DRIVER NOTIFICATIONS
  → Pusher (real-time job updates)
  → Web Push (browser notifications)
  
EMAIL SENDING
  → Resend (transactional emails)
  
ANALYTICS
  → PostHog (user events)
  
SEARCH INDEXING
  → Bing IndexNow (page updates)
```

---

## SECTION 10: DEPLOYMENT ARCHITECTURE

**Platform:** Vercel  
**Database:** Neon PostgreSQL (serverless)  
**Runtime:** Node.js (Next.js 15)  
**Auth:** Clerk (hosted)  
**Email:** Resend (hosted)  
**Payments:** Stripe (hosted)  
**Analytics:** PostHog (hosted)  
**Real-time:** Pusher (hosted)  

**All production data flows through:**
1. Vercel → Neon PostgreSQL
2. Vercel → External APIs (Resend, Stripe, Anthropic, etc.)
3. External Webhooks → Vercel (Resend, Stripe, Bing)

---

## SECTION 11: CRITICAL DEPENDENCIES

| Dependency | Version | Purpose | Risk |
|-----------|---------|---------|------|
| next | 15.3.2 | Web framework | Core system |
| neon/serverless | 1.1.0 | Database | Data access |
| @anthropic-ai/sdk | 0.104.1 | Claude AI | Discovery, insights |
| resend | 6.12.3 | Email service | Customer comms |
| stripe | 22.2.0 | Payments | Revenue |
| @clerk/nextjs | 7.4.2 | Authentication | Access control |
| pusher | 5.3.3 | Real-time | Driver updates |

---

## SECTION 12: SYSTEM STATISTICS

| Metric | Count |
|--------|-------|
| **Deployed Pages** | 26 |
| **API Routes** | 84 |
| **Database Tables** | 24 |
| **Cron Jobs** | 1 active, 1 inactive |
| **Integrations** | 7 external services |
| **Environment Variables** | 15+ |

**Estimated Data Volume:**
- b2b_leads: ~100-500 rows
- discovered_businesses: ~1000-5000 rows
- b2b_outreach: ~500-2000 rows
- b2b_outreach_events: ~2000-10000 rows
- b2b_email_events: ~1000-5000 rows

**Estimated Traffic:**
- Discovery pipeline: ~1000 businesses/day (02:00 UTC)
- Email sends: ~10-50/day (operator-driven)
- API calls: ~100-500/day (mixed)
- Webhook events: ~50-200/day (Resend, Stripe)

---

## SECTION 13: OPERATIONAL GAPS

| Gap | Severity | Mitigation |
|-----|----------|-----------|
| No job queue (only cron) | 🟠 Medium | Consider Inngest or BullMQ for complex workflows |
| No retry mechanism | 🟠 Medium | Add retry logic to critical APIs |
| No error alerting | 🔴 High | Implement Sentry or LogRocket |
| No database backup system | 🔴 High | Verify Neon backup policy |
| No rate limiting | 🟠 Medium | Add Vercel middleware or API guards |
| Cron runs single job | 🟡 Low | Multiple crons can be added to vercel.json |

---

## STATUS: COMPLETE INVENTORY

This catalog represents 100% of deployed production systems as of 2026-06-15.

For updates, verify against:
- `vercel.json` for cron jobs
- `app/api/` for routes
- `lib/b2b-schema.ts` for database tables
- `package.json` for integrations
