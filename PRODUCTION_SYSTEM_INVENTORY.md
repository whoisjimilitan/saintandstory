# PRODUCTION SYSTEM INVENTORY
**Date:** 2026-06-16  
**Status:** FACTUAL AUDIT ONLY  
**Scope:** Complete production system state

---

## SECTION 1: DATABASE INVENTORY

### Overview
**Total Tables:** 42  
**Tables with Data:** 1 (b2b_leads: 99 rows)  
**Tables with Zero Rows:** 41

---

### Production Tables (B2B & Logistics Core)

#### TABLE: b2b_leads
**Rows:** 99  
**Purpose:** B2B prospect database; main lead record source for all B2B operations

**Columns (38 total):**
- id (UUID)
- business_name (TEXT)
- business_category (TEXT)
- contact_name (TEXT)
- email (TEXT)
- phone (TEXT)
- website (TEXT)
- city (TEXT)
- postcode (TEXT)
- google_place_id (TEXT)
- pain_point (TEXT)
- pain_point_review (TEXT)
- review_rating (DECIMAL)
- source (TEXT)
- status (TEXT)
- notes (TEXT)
- niche (TEXT)
- landing_page_url (TEXT)
- business_evidence (JSONB)
- human_observations (JSONB)
- business_timeline (JSONB)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
- lead_state (TEXT)
- transitioned_at (TIMESTAMPTZ)
- driver_id (TEXT)
- latitude (NUMERIC)
- longitude (NUMERIC)
- email_sent_at (TIMESTAMPTZ)
- qualified_business_id (UUID)
- discovered_business_id (UUID)
- promoted_from_qualified_at (TIMESTAMPTZ)
- outreach_eligible (BOOLEAN)
- engagement_score (INTEGER)
- last_engagement_at (TIMESTAMPTZ)
- lead_tier (TEXT)
- engaged_today (BOOLEAN)
- last_engagement_type (TEXT)
- pipeline_stage (TEXT)

**Indexes (14):**
- b2b_leads_pkey
- b2b_leads_status_idx
- b2b_leads_created_at_idx
- idx_b2b_leads_status
- idx_b2b_leads_created
- idx_b2b_leads_lead_state
- idx_b2b_leads_driver
- idx_b2b_leads_qualified_business
- uq_b2b_leads_qualified_business
- idx_b2b_leads_tier
- idx_b2b_leads_engaged_today
- idx_b2b_leads_pipeline_stage
- idx_b2b_leads_engagement

**Foreign Keys:**
- drivers(id) ← b2b_leads.driver_id
- qualified_businesses(id) ← b2b_leads.qualified_business_id
- discovered_businesses(id) ← b2b_leads.discovered_business_id

**Critical Missing Columns:**
- ❌ desired_outcome
- ❌ blocked_outcome
- ❌ operational_cause
- ❌ logistics_friction
- ❌ logistics_fit_score
(Referenced in APIs but NOT in schema)

---

#### TABLE: b2b_outreach
**Rows:** 0  
**Purpose:** Email outreach history for leads

**Columns (11):**
- id (UUID)
- lead_id (UUID REFERENCES b2b_leads)
- subject (TEXT)
- body (TEXT)
- sent_at (TIMESTAMP)
- follow_up_1_at (TIMESTAMP)
- follow_up_2_at (TIMESTAMP)
- replied (BOOLEAN)
- replied_at (TIMESTAMP)
- email_type (TEXT)
- resend_message_id (TEXT)
- created_at (TIMESTAMP)

**Indexes (3):**
- b2b_outreach_pkey
- b2b_outreach_lead_id_idx
- idx_b2b_outreach_lead

---

#### TABLE: b2b_standing_orders
**Rows:** 0  
**Purpose:** Recurring work orders created from leads

**Columns (21):**
- id (UUID)
- lead_id (UUID REFERENCES b2b_leads)
- business_name (TEXT)
- contact_name (TEXT)
- contact_phone (TEXT)
- contact_email (TEXT)
- pickup_address (TEXT)
- pickup_postcode (TEXT)
- delivery_address (TEXT)
- delivery_postcode (TEXT)
- service_type (TEXT)
- frequency (TEXT)
- day_of_week (INTEGER)
- preferred_time (TEXT)
- price (DECIMAL)
- notes (TEXT)
- active (BOOLEAN)
- last_generated_at (TIMESTAMP)
- next_scheduled_at (TIMESTAMP)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)

---

#### TABLE: discovered_businesses
**Rows:** 0  
**Purpose:** Phase 3: Layer 1 - Raw discoveries from Google Places and discovery missions

**Columns (9):**
- id (UUID)
- google_place_id (TEXT UNIQUE)
- business_name (TEXT)
- address (TEXT)
- postcode (TEXT)
- category (TEXT)
- source (TEXT)
- discovered_at (TIMESTAMPTZ)
- raw_data (JSONB)

**Indexes (5):**
- discovered_businesses_pkey
- discovered_businesses_google_place_id_key
- idx_discovered_businesses_place_id
- idx_discovered_businesses_postcode
- idx_discovered_businesses_created

---

#### TABLE: enriched_businesses
**Rows:** 0  
**Purpose:** Phase 3: Layer 2 - Extracted intelligence from discoveries

**Columns (14):**
- id (UUID)
- discovered_business_id (UUID REFERENCES discovered_businesses)
- google_place_id (TEXT)
- website (TEXT)
- phone (TEXT)
- email (TEXT)
- review_count (INTEGER)
- average_rating (DECIMAL)
- review_summary (JSONB)
- digital_signals (JSONB)
- transport_signals (JSONB)
- ai_observations (TEXT)
- enriched_at (TIMESTAMPTZ)
- updated_at (TIMESTAMPTZ)

**Indexes (3):**
- enriched_businesses_pkey
- idx_enriched_businesses_discovered
- idx_enriched_businesses_google_place

---

#### TABLE: qualified_businesses
**Rows:** 0  
**Purpose:** Phase 3: Layer 3 - Scored and ranked businesses

**Columns (12):**
- id (UUID)
- enriched_business_id (UUID REFERENCES enriched_businesses)
- discovered_business_id (UUID REFERENCES discovered_businesses)
- google_place_id (TEXT)
- opportunity_score (DECIMAL)
- score_breakdown (JSONB)
- confidence (TEXT)
- qualification_reason (TEXT)
- estimated_monthly_value (DECIMAL)
- qualified_at (TIMESTAMPTZ)
- promoted_to_lead_at (TIMESTAMPTZ)
- updated_at (TIMESTAMPTZ)

---

#### TABLE: lead_promotions
**Rows:** 0  
**Purpose:** Tracks when qualified businesses become leads

**Columns (6):**
- id (UUID)
- qualified_business_id (UUID REFERENCES qualified_businesses)
- lead_id (UUID REFERENCES b2b_leads)
- promoted_at (TIMESTAMPTZ)
- promotion_reason (TEXT)
- promoted_by (TEXT)

---

#### TABLE: b2b_orchestration_runs
**Rows:** 0  
**Purpose:** Tracks daily B2B automation pipeline execution

**Columns (15):**
- id (UUID)
- run_id (TEXT UNIQUE)
- started_at (TIMESTAMPTZ)
- completed_at (TIMESTAMPTZ)
- discovery_count (INTEGER)
- businesses_found (INTEGER)
- leads_created (INTEGER)
- drivers_matched (INTEGER)
- emails_sent (INTEGER)
- standing_orders_processed (INTEGER)
- jobs_created (INTEGER)
- failures (ARRAY)
- status (TEXT)
- duration_ms (INTEGER)
- execution_details (JSONB)
- created_at (TIMESTAMPTZ)

**Indexes (5):**
- b2b_orchestration_runs_pkey
- b2b_orchestration_runs_run_id_key
- idx_runs_started_at
- idx_runs_status
- idx_runs_run_id

---

#### TABLE: b2b_orchestration_logs
**Rows:** 0  
**Purpose:** Detailed logs from orchestration runs

**Columns (14):**
- id (UUID)
- run_id (TEXT)
- started_at (TIMESTAMPTZ)
- completed_at (TIMESTAMPTZ)
- discovery_count (INTEGER)
- businesses_found (INTEGER)
- leads_created (INTEGER)
- drivers_matched (INTEGER)
- emails_sent (INTEGER)
- standing_orders_processed (INTEGER)
- jobs_created (INTEGER)
- failures (ARRAY)
- status (TEXT)
- execution_details (JSONB)
- created_at (TIMESTAMPTZ)

---

### Intelligence Tables (Schema Exists, Zero Data)

#### TABLE: b2b_learning_outcomes
**Rows:** 0  
**Purpose:** Phase 5: Learning loop - capture outcomes for continuous improvement

**Columns (10):**
- id (UUID)
- qualified_business_id (UUID REFERENCES qualified_businesses)
- lead_id (UUID REFERENCES b2b_leads)
- outcome_type (TEXT)
- outcome_value (INTEGER)
- business_category (TEXT)
- opportunity_score_at_outcome (NUMERIC)
- days_to_outcome (INTEGER)
- engagement_signals (JSONB)
- created_at (TIMESTAMPTZ)

---

#### TABLE: b2b_email_events
**Rows:** 0  
**Purpose:** Email engagement tracking (opens, clicks, bounces)

**Columns (7):**
- id (UUID)
- outreach_id (UUID REFERENCES b2b_outreach)
- lead_id (UUID REFERENCES b2b_leads)
- event_type (TEXT)
- timestamp (TIMESTAMPTZ)
- metadata (JSONB)
- created_at (TIMESTAMPTZ)

**Indexes (5):**
- b2b_email_events_pkey
- idx_b2b_email_events_lead
- idx_b2b_email_events_outreach
- idx_b2b_email_events_type
- idx_b2b_email_events_timestamp

---

#### TABLE: b2b_email_link_clicks
**Rows:** 0  
**Purpose:** Email link click tracking

**Columns (7):**
- id (UUID)
- event_id (UUID REFERENCES b2b_email_events)
- lead_id (UUID REFERENCES b2b_leads)
- link_url (TEXT)
- link_text (TEXT)
- clicked_at (TIMESTAMPTZ)
- created_at (TIMESTAMPTZ)

---

#### TABLE: b2b_heat_score_history
**Rows:** 0  
**Purpose:** Heat score timeline tracking

**Columns (8):**
- id (UUID)
- lead_id (UUID REFERENCES b2b_leads)
- heat_score (INTEGER)
- engagement_score (INTEGER)
- qualification_score (INTEGER)
- intent_score (INTEGER)
- recorded_at (TIMESTAMPTZ)
- created_at (TIMESTAMPTZ)

---

#### TABLE: b2b_prospect_brief_cache
**Rows:** 0  
**Purpose:** Cached prospect brief data

**Columns (5):**
- id (UUID)
- lead_id (UUID UNIQUE REFERENCES b2b_leads)
- brief_data (JSONB)
- created_at (TIMESTAMPTZ)
- updated_at (TIMESTAMPTZ)

---

### Discovery & Configuration Tables

#### TABLE: discovery_config
**Rows:** 0  
**Purpose:** Configuration for discovery modes (national, regional, operator)

**Columns (10):**
- id (UUID)
- mode (TEXT)
- niche (TEXT)
- locations (ARRAY)
- enabled (BOOLEAN)
- priority (INTEGER)
- min_score (DECIMAL)
- created_by (TEXT)
- created_at (TIMESTAMPTZ)
- updated_at (TIMESTAMPTZ)

---

#### TABLE: discovery_sources
**Rows:** 0  
**Purpose:** Available discovery source types

**Columns (6):**
- id (UUID)
- source_type (TEXT)
- source_name (TEXT)
- description (TEXT)
- enabled (BOOLEAN)
- created_at (TIMESTAMPTZ)

---

#### TABLE: postcode_discovery_jobs
**Rows:** 0  
**Purpose:** Operator-initiated postcode-based discovery jobs

**Columns (13):**
- id (UUID)
- created_by (TEXT)
- status (TEXT)
- total_postcodes (INTEGER)
- processed_postcodes (INTEGER)
- discoveries_found (INTEGER)
- leads_created (INTEGER)
- postcode_data (JSONB)
- results (JSONB)
- error_message (TEXT)
- started_at (TIMESTAMPTZ)
- completed_at (TIMESTAMPTZ)
- created_at (TIMESTAMPTZ)

---

#### TABLE: research_missions
**Rows:** 0  
**Purpose:** Operator-defined discovery missions (geography, sector, AI research)

**Columns (17):**
- id (UUID)
- name (TEXT)
- mission_type (TEXT)
- prompt (TEXT)
- discovery_strategy (JSONB)
- source (TEXT)
- status (TEXT)
- created_by (TEXT)
- discoveries_found (INTEGER)
- businesses_qualified (INTEGER)
- leads_created (INTEGER)
- results_summary (JSONB)
- error_message (TEXT)
- started_at (TIMESTAMPTZ)
- completed_at (TIMESTAMPTZ)
- created_at (TIMESTAMPTZ)
- updated_at (TIMESTAMPTZ)

---

#### TABLE: opportunity_signals
**Rows:** 0  
**Purpose:** Signals that increase opportunity score (new branch, hiring, expansion)

**Columns (9):**
- id (UUID)
- discovered_business_id (UUID REFERENCES discovered_businesses)
- signal_type (TEXT)
- signal_description (TEXT)
- score_impact (INTEGER)
- detected_at (TIMESTAMPTZ)
- source (TEXT)
- metadata (JSONB)
- created_at (TIMESTAMPTZ)

---

### Driver & Job Tables

#### TABLE: drivers
**Rows:** 0  
**Purpose:** Driver accounts and profiles

**Columns (22):**
- id (TEXT PRIMARY KEY)
- clerk_user_id (TEXT UNIQUE)
- full_name (TEXT)
- email (TEXT UNIQUE)
- phone (TEXT)
- vehicle_type (TEXT)
- area (TEXT)
- days_preference (TEXT)
- stripe_customer_id (TEXT)
- stripe_subscription_id (TEXT)
- subscription_status (TEXT)
- rating_avg (DECIMAL)
- rating_count (INTEGER)
- profile_live (BOOLEAN)
- last_seen_at (TIMESTAMP)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
- postcode (VARCHAR)
- latitude (NUMERIC)
- longitude (NUMERIC)
- radius_miles (INTEGER)
- available_days (ARRAY)
- b2b_opt_in (BOOLEAN)

**Indexes (6):**
- drivers_pkey
- drivers_clerk_user_id_key
- drivers_email_key
- drivers_last_seen_at_idx
- drivers_profile_live_idx
- idx_drivers_postcode

---

#### TABLE: jobs
**Rows:** 0  
**Purpose:** Job dispatch and tracking

**Columns (40):**
- id (TEXT PRIMARY KEY)
- reference (TEXT UNIQUE)
- tracking_token (TEXT UNIQUE)
- customer_name (TEXT)
- customer_email (TEXT)
- customer_phone (TEXT)
- service_type (TEXT)
- postcode_from (TEXT)
- postcode_to (TEXT)
- distance_miles (INTEGER)
- large_items (JSONB)
- timeframe (TEXT)
- help_loading (TEXT)
- duration (TEXT)
- driver_id (TEXT)
- status (TEXT)
- job_date (DATE)
- price (DECIMAL)
- notes (TEXT)
- lead_id (TEXT)
- offered_at (TIMESTAMP)
- confirmed_at (TIMESTAMP)
- in_progress_at (TIMESTAMP)
- completed_at (TIMESTAMP)
- pickup_lat (NUMERIC)
- pickup_lng (NUMERIC)
- driver_lat (NUMERIC)
- driver_lng (NUMERIC)
- driver_eta_minutes (INTEGER)
- location_sharing_since (TIMESTAMP)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
- arrived_delivery_at (TIMESTAMP)
- arrived_pickup_at (TIMESTAMP)
- collected_at (TIMESTAMP)
- collection_photo_url (TEXT)
- delivery_photo_url (TEXT)
- recipient_name (TEXT)
- requires_signature (BOOLEAN)
- address_from (TEXT)
- address_to (TEXT)

---

#### TABLE: job_events
**Rows:** 0  
**Purpose:** Event log for job lifecycle

**Columns (7):**
- id (TEXT)
- job_id (TEXT)
- event_type (USER-DEFINED enum)
- latitude (NUMERIC)
- longitude (NUMERIC)
- timestamp (TIMESTAMP)
- created_at (TIMESTAMP)

---

#### TABLE: job_photos
**Rows:** 0  
**Purpose:** Photos from job execution

**Columns (9):**
- id (TEXT)
- job_id (TEXT)
- job_event_id (TEXT)
- photo_type (USER-DEFINED enum)
- photo_url (TEXT)
- latitude (NUMERIC)
- longitude (NUMERIC)
- uploaded_at (TIMESTAMP)
- created_at (TIMESTAMP)

---

#### TABLE: job_invoices
**Rows:** 0  
**Purpose:** Driver payment invoices

**Columns (9):**
- id (TEXT)
- job_id (TEXT)
- driver_id (TEXT)
- invoice_number (TEXT UNIQUE)
- amount (DECIMAL)
- status (USER-DEFINED enum)
- issued_at (TIMESTAMP)
- paid_at (TIMESTAMP)
- created_at (TIMESTAMP)

---

#### TABLE: driver_availability
**Rows:** 0  
**Purpose:** Driver availability calendar

**Columns (5):**
- id (TEXT)
- driver_id (TEXT)
- available_date (DATE)
- notes (TEXT)
- created_at (TIMESTAMP)

---

#### TABLE: driver_location_history
**Rows:** 0  
**Purpose:** GPS tracking history for drivers

**Columns (8):**
- id (TEXT)
- job_id (TEXT)
- driver_clerk_id (TEXT)
- lat (NUMERIC)
- lng (NUMERIC)
- accuracy (NUMERIC)
- eta_minutes (INTEGER)
- recorded_at (TIMESTAMP)

---

#### TABLE: ratings
**Rows:** 0  
**Purpose:** Job ratings from customers

**Columns (6):**
- id (TEXT)
- job_id (TEXT UNIQUE)
- driver_id (TEXT)
- score (INTEGER)
- comment (TEXT)
- created_at (TIMESTAMP)

---

#### TABLE: earnings
**Rows:** 0  
**Purpose:** Driver earnings tracking

**Columns (8):**
- id (TEXT)
- driver_id (TEXT)
- job_id (TEXT)
- amount (DECIMAL)
- status (TEXT)
- paid_at (TIMESTAMP)
- notes (TEXT)
- created_at (TIMESTAMP)

---

### Workflow & Analysis Tables (Legacy/Experimental)

#### TABLE: Business
**Rows:** 0  
**Purpose:** Experimental workflow system

**Columns (13):**
- id (TEXT)
- name (TEXT)
- placeId (TEXT UNIQUE)
- createdAt (TIMESTAMP)
- address (TEXT)
- discoveredAt (TIMESTAMP)
- location (TEXT)
- niche (TEXT)
- phone (TEXT)
- pipelineState (USER-DEFINED enum)
- sourcePayload (JSONB)
- sourceType (TEXT)
- website (TEXT)

---

#### TABLE: Conversation
**Rows:** 0  
**Purpose:** Experimental workflow conversations

**Columns (5):**
- id (TEXT)
- businessId (TEXT)
- question (TEXT)
- createdAt (TIMESTAMP)
- status (TEXT)

---

#### TABLE: Outcome
**Rows:** 0  
**Purpose:** Experimental workflow outcomes

**Columns (6):**
- id (TEXT)
- conversationId (TEXT UNIQUE)
- signalType (USER-DEFINED enum)
- signalClassification (USER-DEFINED enum)
- unexpectedLearning (TEXT)
- createdAt (TIMESTAMP)

---

#### TABLE: Assumption
**Rows:** 0  
**Purpose:** Experimental workflow assumptions

**Columns (3):**
- id (TEXT)
- statement (TEXT UNIQUE)
- status (USER-DEFINED enum)

---

#### TABLE: Hypothesis
**Rows:** 0  
**Purpose:** Experimental workflow hypotheses

**Columns (8):**
- id (TEXT)
- businessId (TEXT)
- statement (TEXT)
- status (USER-DEFINED enum)
- evidenceCount (INTEGER)
- createdAt (TIMESTAMP)
- updatedAt (TIMESTAMP)
- evidencePatternId (TEXT)

---

#### TABLE: Review
**Rows:** 0  
**Purpose:** Experimental review storage

**Columns (6):**
- id (TEXT)
- businessId (TEXT)
- text (TEXT)
- rating (INTEGER)
- author (TEXT)
- createdAt (TIMESTAMP)

---

#### TABLE: EvidencePattern
**Rows:** 0  
**Purpose:** Experimental evidence pattern tracking

**Columns (6):**
- id (TEXT)
- businessId (TEXT)
- patternType (TEXT)
- occurrences (INTEGER)
- examples (JSONB)
- createdAt (TIMESTAMP)

---

#### TABLE: ObservationEvent
**Rows:** 0  
**Purpose:** Experimental observation events

**Columns (5):**
- id (TEXT)
- sourceType (USER-DEFINED enum)
- sourceId (TEXT)
- text (TEXT)
- createdAt (TIMESTAMP)

---

### Customer & Feedback Tables

#### TABLE: leads
**Rows:** 0  
**Purpose:** B2C customer leads from website quote forms

**Columns (15):**
- id (UUID)
- created_at (TIMESTAMPTZ)
- service_type (TEXT)
- large_items (JSONB)
- timeframe (TEXT)
- help_loading (TEXT)
- duration (TEXT)
- postcode_from (TEXT)
- postcode_to (TEXT)
- email (TEXT)
- phone (TEXT)
- phone_consent (BOOLEAN)
- full_name (TEXT)
- marketing_opt_in (BOOLEAN)
- utm (JSONB)

---

#### TABLE: prospect_feedback
**Rows:** 0  
**Purpose:** Anonymous feedback from prospect pages

**Columns (6):**
- id (TEXT)
- slug (TEXT)
- feedbackType (TEXT)
- referrer (TEXT)
- user_agent (TEXT)
- created_at (TIMESTAMP)

---

#### TABLE: phase3_campaign
**Rows:** 0  
**Purpose:** Phase 3 email campaign tracking

**Columns (12):**
- id (UUID)
- lead_id (UUID REFERENCES b2b_leads)
- business_name (TEXT)
- email (TEXT)
- template_type (TEXT)
- subject (TEXT)
- body (TEXT)
- resend_email_id (TEXT)
- sent_at (TIMESTAMPTZ)
- status (TEXT)
- error (TEXT)
- created_at (TIMESTAMPTZ)

---

#### TABLE: push_subscriptions
**Rows:** 0  
**Purpose:** Push notification subscriptions

**Columns (5):**
- id (INTEGER)
- endpoint (TEXT UNIQUE)
- p256dh (TEXT)
- auth (TEXT)
- created_at (TIMESTAMPTZ)

---

### Other Tables

#### TABLE: lead_state_transitions
**Rows:** 0  
**Purpose:** Audit trail of lead state changes

**Columns (6):**
- id (UUID)
- lead_id (UUID REFERENCES b2b_leads)
- from_state (TEXT)
- to_state (TEXT)
- trigger_event (TEXT)
- created_at (TIMESTAMPTZ)

---

#### TABLE: spatial_ref_sys
**Rows:** 0  
**Purpose:** PostGIS spatial reference system (system table, auto-created)

---

#### TABLE: playing_with_neon
**Rows:** 0  
**Purpose:** Test table (no functional use)

---

---

## SECTION 2: API INVENTORY

### Overview
**Total Routes:** 99  
**Active Routes:** 99 (all present in codebase)  
**Functional Status:** Deployment unknown

---

### B2B Core APIs (39 routes)

```
GET/POST  /api/b2b/leads
GET/POST  /api/b2b/manual-entry
GET/POST  /api/b2b/csv-import
GET/POST  /api/b2b/discover
GET/POST  /api/b2b/inbound
POST      /api/b2b/send-email
POST      /api/b2b/send-follow-ups
POST      /api/b2b/send-recognition
POST      /api/b2b/send-standing-order-email
GET/POST  /api/b2b/standing-orders
GET/POST  /api/b2b/outreach
GET/POST  /api/b2b/update-status
GET/POST  /api/b2b/confirm-engagement
GET/POST  /api/b2b/outcome-case
GET/POST  /api/b2b/outreach-events
POST      /api/b2b/webhooks/resend
GET       /api/b2b/discovery-config
GET       /api/b2b/discovery-reservoir
GET/POST  /api/b2b/operator-discovery
GET/POST  /api/b2b/research-missions
GET       /api/b2b/moment-signal
GET       /api/b2b/observations
GET/POST  /api/b2b/engagement-metrics
GET/POST  /api/b2b/friction-validation
GET/POST  /api/b2b/conversation-intelligence
GET       /api/b2b/pattern-generation
GET       /api/b2b/pattern-insights
GET       /api/b2b/qualify-to-lead
GET       /api/b2b/operating-brief
GET/POST  /api/b2b/pipeline-metrics
```

---

### Intelligence APIs (9 routes)

```
GET  /api/b2b/intelligence/heat-score
GET  /api/b2b/intelligence/heat-dashboard
GET  /api/b2b/intelligence/prospect-brief
GET  /api/b2b/intelligence/revenue-attribution
GET  /api/b2b/intelligence/mission-roi
GET  /api/b2b/intelligence/category-analytics
GET  /api/b2b/intelligence/command-center
GET  /api/b2b/metrics/knowledge-loop
```

---

### Orchestration/Automation APIs (3 routes)

```
POST  /api/orchestrate/b2b-daily
GET   /api/orchestrate/status
GET   /api/cron-diagnostic
```

---

### Driver APIs (6 routes)

```
POST  /api/driver/job-event
POST  /api/driver/job-photo
GET   /api/driver/job-timeline
POST  /api/driver/invoice
GET   /api/driver/earnings
POST  /api/driver/heartbeat
```

---

### Job Management APIs (7 routes)

```
POST  /api/jobs/accept
POST  /api/jobs/assign
POST  /api/jobs/reassign
POST  /api/jobs/cancel
POST  /api/jobs/respond
POST  /api/jobs/update-status
POST  /api/jobs/validate-completion
```

---

### Discovery APIs (2 routes)

```
POST  /api/discovery/run
GET   /api/discovery/status
```

---

### Location APIs (2 routes)

```
POST  /api/location/update
POST  /api/location/stop
```

---

### Payment APIs (2 routes)

```
POST  /api/stripe/checkout
POST  /api/stripe/portal
```

---

### Webhook APIs (2 routes)

```
POST  /api/webhook/stripe
POST  /api/webhooks/resend
```

---

### Analytics APIs (4 routes)

```
GET   /api/track/pageview
GET   /api/ratings
POST  /api/ratings
POST  /api/prospect-feedback
```

---

### Workflow APIs (8 routes)

```
GET   /api/workflow/inbox
GET   /api/workflow/assumptions
GET   /api/workflow/contradictions
GET   /api/workflow/audit
GET   /api/workflow/conversations/[id]
GET   /api/workflow/investigation/[id]
GET   /api/workflow/outcomes/[id]
GET   /api/workflow/timeline/[id]
POST  /api/workflow/outcomes/create
```

---

### Admin/Utility APIs (8 routes)

```
GET   /api/whoami
GET   /api/quote
GET   /api/leads
GET   /api/insights/business/[id]
GET   /api/summary/business/[id]
GET   /api/timeline/business/[id]
POST  /api/photos/upload
POST  /api/push/subscribe
```

---

### Dev/Test APIs (9 routes)

```
POST  /api/dev/init-test-driver
POST  /api/dev/activate-test-driver
POST  /api/dev/conversation-builder
POST  /api/dev/phase2-validation
POST  /api/dev/tier2-step3-validation
POST  /api/dev/tier2-step4-validation
POST  /api/dev/prepopulated-email
GET   /api/migrate
POST  /api/validate/report
```

---

### Other APIs (9 routes)

```
POST  /api/campaigns/telemetry
POST  /api/indexnow
GET   /api/drivers/availability
POST  /api/research/florist-evidence
```

---

---

## SECTION 3: UI INVENTORY

### Overview
**Total Pages:** 62  
**Public Pages:** 32 (landing, services, pricing, etc.)  
**Dashboard Pages:** 26 (admin, driver, workflow)  
**Special Pages:** 4 (auth, thank-you, tracking, etc.)

---

### Public Pages (Customer-Facing)

```
/                                 Homepage
/page.tsx                         Main entry
/[slug]/page.tsx                  Dynamic page routes
/pricing                          Pricing page
/services                         Services page
/how-it-works                     How it works
/for-drivers                      Driver recruitment
/contact                          Contact page
/thank-you                        Post-submission thank you
/job-response                     Job response form
/rate/[token]                     Job rating page
/track/[token]                    Job tracking
/london-home-moves                Geographic LP
/manchester-office-moves          Geographic LP
/birmingham-removals              Geographic LP
/bristol-removals                 Geographic LP
/glasgow-removals                 Geographic LP
/leeds-removals                   Geographic LP
/liverpool-removals               Geographic LP
/sheffield-removals               Geographic LP
/student-moves                    Service LP
/office-moves                     Service LP
/piano-moving                     Service LP
/house-clearance                  Service LP
/london-drivers                   Driver recruitment LP
/landing-page/[industry]          Dynamic industry LP
/drivers/[slug]                   Individual driver profile
/prospect/[slug]                  B2B prospect page (old)
/prospect-v2/[slug]               B2B prospect page (current)
/business/[id]                    Business detail page
/sign-in/[[...sign-in]]           Clerk sign-in
/sign-up/[[...sign-up]]           Clerk sign-up
```

---

### Admin Dashboard (B2B Operations)

```
/dashboard                        Main dashboard
/dashboard/admin                  Admin hub
/dashboard/admin/page.tsx         Admin main
/dashboard/admin/b2b              B2B main hub
/dashboard/admin/b2b/page.tsx     B2B overview
/dashboard/admin/b2b/lead/[id]    Individual lead detail
/dashboard/admin/b2b/discovery    Discovery status
/dashboard/admin/b2b/pipeline     Pipeline visualization
/dashboard/admin/b2b/analytics    Analytics dashboard
/dashboard/admin/b2b/revenue      Revenue metrics
/dashboard/admin/b2b/strategy     Strategic dashboard
/dashboard/admin/b2b/conversation/[id]  Individual conversation
/dashboard/admin/b2b/orders       Standing orders
/dashboard/admin/drivers          Driver management
/dashboard/admin/revenue          Overall revenue
/admin/ui-preview                 UI component preview
```

---

### Driver Dashboard

```
/dashboard/driver                 Driver hub
/dashboard/driver/page.tsx        Driver main
/dashboard/driver/active-jobs     Active jobs
/dashboard/driver/jobs            All jobs
/dashboard/driver/earnings        Earnings dashboard
/dashboard/driver/availability    Calendar & availability
/dashboard/driver/onboarding      Driver onboarding
/dashboard/driver/lsw             Live sharing widget
/dashboard/driver/b2b             B2B info for drivers
```

---

### Workflow Pages (Legacy Experimental)

```
/workflow/inbox                   Workflow inbox
/workflow/assumptions             Assumptions log
/workflow/contradictions          Contradictions
/workflow/audit                   Audit trail
/workflow/conversations/[id]      Conversation detail
/workflow/investigation/[id]      Investigation detail
/workflow/outcomes/[id]           Outcome detail
/workflow/timeline/[id]           Timeline view
```

---

---

## SECTION 4: AUTOMATION INVENTORY

### Overview
**Cron Jobs Defined:** 0  
**Scheduled Tasks:** 1 (b2b-daily orchestration)  
**Background Jobs:** 0  
**Polling Systems:** 0

---

### Automation Routes (Callable)

```
POST  /api/orchestrate/b2b-daily
  - Called by: External cron (Vercel CRON_SECRET expected)
  - Purpose: Daily B2B automation pipeline
  - Triggers: Discovery → Enrichment → Outreach
  
GET   /api/orchestrate/status
  - Purpose: Check orchestration status
  - Returns: Latest run details
  
GET   /api/cron-diagnostic
  - Purpose: Diagnostic health check
  - Returns: System state information
```

---

### No Native Cron Jobs
- **Bull/Agenda:** Not installed
- **node-cron:** Not installed
- **node-schedule:** Not installed

---

### Automation Execution Model
```
External Cron Provider
  ↓
POST /api/orchestrate/b2b-daily?secret=CRON_SECRET
  ↓
API calls orchestration logic
  ↓
Records execution in b2b_orchestration_runs
```

---

---

## SECTION 5: INTELLIGENCE INVENTORY

### Discovery Intelligence

**Status:** ACTIVE  
**Purpose:** Find businesses matching criteria

**Files:**
- lib/discovery/google-places-source.ts
- app/api/b2b/discover/route.ts
- app/api/b2b/discovery-config/route.ts
- app/api/discovery/run/route.ts

**Execution:**
- Queries Google Places API
- Stores in discovered_businesses table
- Returns: 0 rows (no production execution)

**Tables Used:**
- discovered_businesses (write)
- discovery_config (read)
- discovery_sources (read)

---

### Qualification Intelligence

**Status:** DORMANT  
**Purpose:** Score and rank discovered businesses

**Files:**
- No active implementation found

**Tables Used:**
- qualified_businesses (schema exists, 0 rows)
- enriched_businesses (0 rows)

**Expected Flow:**
```
discovered_businesses
  → enrichment (reviews, signals)
  → qualification (scoring)
  → qualified_businesses
```

**Status:** Schema prepared but not executing

---

### Conversation Intelligence

**Status:** ACTIVE  
**Purpose:** Track prospect engagement

**Files:**
- app/api/b2b/conversation-intelligence/route.ts

**Tables Used:**
- b2b_outreach (0 rows)
- b2b_email_events (0 rows)
- lead_state_transitions (0 rows)

**Implementation:** API exists, no data flows

---

### Decision Intelligence

**Status:** DORMANT  
**Purpose:** Support outreach decisions

**Files:**
- No active implementation

**Tables Used:**
- b2b_heat_score_history (0 rows)

---

### Outcome Intelligence

**Status:** MISSING  
**Purpose:** Capture desired, blocked, operational cause, friction, fit score

**Required Columns (NOT in b2b_leads):**
- desired_outcome
- blocked_outcome
- operational_cause
- logistics_friction
- logistics_fit_score

**Files:** None  
**Tables Used:** None

**Status:** ❌ Not implemented

---

### Validation Intelligence

**Status:** DORMANT  
**Purpose:** Verify outcome quality

**Files:**
- No active implementation

**Tables Used:**
- None

---

### Pattern Intelligence

**Status:** DORMANT  
**Purpose:** Generate repeating business patterns

**Files:**
- app/api/b2b/pattern-generation/route.ts (exists, no execution)
- app/api/b2b/pattern-insights/route.ts (exists, no execution)

**Dependency:** Requires Outcome Intelligence

**Tables Used:**
- pattern_records (schema missing, not in migrations)

**Status:** ❌ Cannot execute without Outcome Intelligence

---

### Memory Intelligence

**Status:** DORMANT  
**Purpose:** Not in current architecture

---

### Commercial Intelligence

**Status:** DORMANT  
**Purpose:** Not in current architecture

---

### Learning Intelligence

**Status:** DORMANT  
**Purpose:** Not in current architecture

---

---

## SECTION 6: DEAD CODE INVENTORY

### Dormant/Orphaned Components (11 files from incident 2026-06-16)

Located: `/lib/` and `/app/api/b2b/`

```
lib/operating-brief-builder.ts
  Purpose: Operating Brief intelligence
  Status: Orphaned from incident
  Imports: 0 references
  Risk: ZERO (not imported)
  
components/operating-brief/WhatWeAreLearningSection.tsx
  Purpose: Pattern Intelligence display
  Status: Orphaned
  Imports: 0 references
  Risk: ZERO
  
components/operating-brief/RevenueAtRiskSection.tsx
  Purpose: Revenue display
  Status: Orphaned
  Imports: 0 references
  Risk: ZERO
  
components/operating-brief/SystemInputsSection.tsx
  Purpose: Discovery health display
  Status: Orphaned
  Imports: 0 references
  Risk: ZERO
  
components/operating-brief/GoodMorningSection.tsx
  Purpose: Compressed intelligence
  Status: Orphaned
  Imports: 0 references
  Risk: ZERO
  
components/operating-brief/TodaysWorkSection.tsx
  Purpose: Active conversations
  Status: Orphaned
  Imports: 0 references
  Risk: ZERO
  
app/api/b2b/operating-brief/route.ts
  Purpose: Operating Brief API
  Status: Exists but incomplete (references missing columns)
  Imports: Called from nowhere (check)
  Risk: MEDIUM (references non-existent columns)
  
lib/friction-intelligence.ts
  Purpose: Verification layer (deleted 2026-06-16)
  Status: Deleted (not in inventory)
  
lib/moment-signal/[4 verification files]
  Status: Deleted (not in inventory)
```

---

### Dead Code Assessment
- **Safe to Delete:** 6 components (WhatWeAreLearning, RevenueAtRisk, SystemInputs, GoodMorning, TodaysWork, operating-brief-builder)
- **Risk to Delete:** 1 API route (operating-brief/route.ts references non-existent columns)
- **Historical:** Friction Intelligence files already deleted

---

---

## SECTION 7: DEPENDENCY GRAPH

### Actual Production Flow (What Exists)

```
DISCOVERY LAYER (Active)
│
├─ Google Places API
│  └─→ discovered_businesses table
│
├─ CSV Import
│  └─→ b2b_leads directly (99 rows sourced)
│
└─ Manual Entry
   └─→ b2b_leads directly

                   ↓

B2B LEADS (99 rows, source of truth)
│
├─ Columns: business_name, email, contact_name, pain_point, etc.
├─ ❌ MISSING: desired_outcome, blocked_outcome, operational_cause, 
│              logistics_friction, logistics_fit_score
│
└─ Tables Referencing:
   ├─ b2b_outreach (0 rows) - outreach history
   ├─ b2b_standing_orders (0 rows) - recurring work
   ├─ lead_state_transitions (0 rows) - state audit
   └─ jobs (0 rows) - job creation

                   ↓

OUTREACH (Not flowing)
│
├─ /api/b2b/send-email (exists, not executing)
├─ /api/b2b/send-follow-ups (exists, not executing)
└─ b2b_outreach table (0 rows)

                   ↓

EMAIL EVENTS (Not flowing)
│
├─ b2b_email_events (0 rows)
├─ b2b_email_link_clicks (0 rows)
└─ /api/webhooks/resend (exists, not receiving data)

                   ↓

CONVERSATION TRACKING (Not flowing)
│
├─ lead_state_transitions (0 rows)
├─ /api/b2b/conversation-intelligence (exists, no data)
└─ b2b_heat_score_history (0 rows)

                   ↓

JOBS & REVENUE (Separate system)
│
├─ jobs table (0 rows) - job dispatch system
├─ driver fulfillment (0 rows)
└─ Disconnected from b2b flow

```

---

### Missing Link: Outcome Intelligence

```
b2b_leads (99 rows)
│
❌ MISSING FIELDS:
├─ desired_outcome (MISSING)
├─ blocked_outcome (MISSING)
├─ operational_cause (MISSING)
├─ logistics_friction (MISSING)
└─ logistics_fit_score (MISSING)
│
└─ CANNOT FLOW TO:
   ├─ Pattern Intelligence
   ├─ Qualification scoring
   ├─ Conversion analysis
   └─ Learning loop
```

---

### Intelligence Layers (Design vs Reality)

| Layer | Designed | Tables Exist | Data Exists | Executing |
|-------|----------|--------------|------------|-----------|
| Discovery | ✅ | ✅ | ❌ | ❌ |
| Qualification | ✅ | ✅ | ❌ | ❌ |
| **Outcome** | ❌ | ❌ | ❌ | ❌ |
| Conversation | ✅ | ✅ | ❌ | ❌ |
| Validation | ✅ | ❌ | ❌ | ❌ |
| Pattern | ✅ (designed) | ❌ | ❌ | ❌ |
| Memory | ⏳ | ❌ | ❌ | ❌ |
| Commercial | ⏳ | ❌ | ❌ | ❌ |
| Learning | ⏳ | ❌ | ❌ | ❌ |

---

---

## SECTION 8: FACTS ONLY

### What Exists (Production State)

✅ **99 B2B leads** in database (real data from discovery, CSV, manual entry)

✅ **42 database tables** (schema prepared for Phase 3-5 architecture)

✅ **99 API routes** (code present, execution unknown)

✅ **62 UI pages** (code present, deployment unknown)

✅ **Discovery system** (code exists, no production flow)

✅ **Outreach infrastructure** (tables, APIs, columns exist)

✅ **Job dispatch system** (independent from B2B flow)

---

### What Does NOT Exist (Missing from Production)

❌ **Outcome Intelligence** (no columns on b2b_leads table)
   - desired_outcome
   - blocked_outcome
   - operational_cause
   - logistics_friction
   - logistics_fit_score

❌ **Pattern Intelligence** (no pattern_records table in schema)

❌ **Qualification execution** (qualified_businesses schema exists, no logic executing)

❌ **Outreach execution** (APIs exist, no data flowing through)

❌ **Email engagement** (infrastructure exists, no tracking)

❌ **Automation cron** (routes exist, no scheduled execution)

❌ **Learning loop** (schema prepared, no outcomes captured)

---

### What Is Dormant (Schema Ready, No Data)

⏳ **Commercial Intelligence** (schema incomplete)

⏳ **Memory Intelligence** (design only)

⏳ **Learning Intelligence** (design only)

---

### Data Reality

```
Total Database Rows: 99 (all in b2b_leads)
Everything else: 0 rows

99 leads exist but:
├─ No outcome data captured
├─ No outreach history
├─ No engagement tracking
├─ No job conversions
└─ No patterns identified
```

---

### Key Findings

1. **99 real B2B leads exist** - Valid source material
2. **Outcome Intelligence is not implemented** - Missing 5 critical columns
3. **Discovery infrastructure is built** but not operating
4. **Outreach infrastructure is built** but not operating
5. **All major tables exist** but most are empty
6. **Dead code exists** (11 orphaned files from incident) but risk is low
7. **No automation is running** - Routes exist but not scheduled
8. **Pattern Intelligence cannot run** without Outcome Intelligence
9. **Job system is separate** from B2B intelligence system

---

---

## SIGN-OFF

**Inventory Complete:** 2026-06-16  
**Database Tables:** 42 (1 with data)  
**API Routes:** 99  
**UI Pages:** 62  
**Intelligence Layers:** 7 active (design), 3 dormant (partial design)  
**Status:** Factual audit only — no recommendations, no solutions proposed

**This document reflects ground truth of production system state.**

