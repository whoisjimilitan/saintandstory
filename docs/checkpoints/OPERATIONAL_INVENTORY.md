# Operational Inventory: Autonomous B2B System Components
**Date:** 2026-06-14  
**Purpose:** Complete audit of all discovery, lead management, and automation components

---

## A. DISCOVERY COMPONENTS

### 1. Discovery Pipeline
**File:** `lib/discovery/pipeline.ts`  
**Purpose:** Finds new business prospects via Google Places API  
**Inputs:** Niche + location parameters  
**Outputs:** Array of business objects (name, location, website, etc)

**Configuration Source:**
- Primary: `discovery_config` table (operator-controlled)
- Fallback: `DEFAULT_DISCOVERY_PARAMS` in b2b-orchestrator.ts

**Deduplication:**
- Check: Existing b2b_leads by email domain
- Check: Existing b2b_leads by website domain
- Check: Existing b2b_leads by business name (substring)
- Action: Skip if match found

**Known Limitation:** Substring matching can cause false positives with similar names (e.g., "John's Plumbing" blocks "John's Plumbing & Heating")

---

### 2. Discovery Orchestration
**File:** `lib/b2b-orchestrator.ts`  
**Function:** `runDailyB2BOrchestration()`  
**Purpose:** Coordinates entire daily workflow

**Stages:**
1. Load discovery config (with fallback defaults)
2. Run discovery pipeline for each niche/location combo
3. Create leads for new businesses (with dedup check)
4. Enrich leads with business intelligence
5. Score leads by opportunity value
6. Match with available drivers
7. Send initial outreach emails
8. Process standing orders (create future jobs)
9. Log all results to database

**Error Handling:** Each stage wrapped in try-catch; failures don't stop subsequent stages

---

### 3. Discovery Endpoint
**File:** `app/api/orchestrate/b2b-daily/route.ts`  
**Method:** POST  
**Authentication:** CRON_SECRET bearer token  
**Trigger:** Vercel Cron (0 2 * * * = 02:00 UTC daily)  
**Timeout:** 5 minutes max (export const maxDuration = 300)

**Request:**
```
POST https://saintandstoryltd.co.uk/api/orchestrate/b2b-daily
Headers:
  Authorization: Bearer ${CRON_SECRET}
```

**Response:**
```json
{
  "status": "success",
  "executionId": "b2b-2026-06-14-021534",
  "timestamp": "2026-06-14T02:15:34Z",
  "stages": {
    "discovery": { "count": 12, "skipped": 2, "errors": [] },
    "enrichment": { "succeeded": 12, "failed": 0 },
    "driverMatching": { "attempted": 12, "succeeded": 8, "failed": 4 },
    "outreach": { "sent": 8, "failed": 0 },
    "standingOrders": { "created": 2, "processed": 0 }
  }
}
```

---

### 4. Cron Diagnostic Endpoint
**File:** `app/api/cron-diagnostic/route.ts`  
**Method:** GET  
**Purpose:** View recent cron execution history  
**URL:** `https://saintandstoryltd.co.uk/api/cron-diagnostic`

**Returns:** Last 10 orchestration runs with timestamps, status, stage results

---

## B. LEAD MANAGEMENT COMPONENTS

### 1. Lead Storage
**Table:** `b2b_leads`  
**Primary Key:** id (UUID)  
**Row Count:** ~200-500 (depending on discovery breadth)

**Core Columns:**
```
id (UUID)
business_name (TEXT)
business_category (TEXT) -- florist, accountant, etc
contact_name (TEXT)
email (TEXT)
phone (TEXT)
website (TEXT)
city (TEXT)
postcode (TEXT)
google_place_id (TEXT) -- for dedup & reference
```

**Intelligence Columns:**
```
pain_point (TEXT) -- extracted from Google reviews
pain_point_review (TEXT) -- which review source
review_rating (DECIMAL)
business_evidence (JSONB) -- structured business intelligence
human_observations (JSONB) -- operator notes & corrections
business_timeline (JSONB) -- activity history
```

**Workflow Columns:**
```
source (TEXT) -- 'discovery', 'inbound', 'manual'
status (TEXT) -- 'new', 'contacted', 'warm', 'closed', 'dead'
lead_state (TEXT) -- 'new', 'recognized', 'engaged', 'self_confirmed'
notes (TEXT) -- operator scratchpad
niche (TEXT) -- 'florists', 'accountants', etc
landing_page_url (TEXT) -- specific landing page for niche
```

**Timestamps:**
```
created_at (TIMESTAMPTZ)
updated_at (TIMESTAMPTZ)
transitioned_at (TIMESTAMPTZ) -- when state changed
```

**Indexes:**
```
PRIMARY KEY (id)
INDEX email, website, business_name (for dedup)
INDEX status, lead_state (for queries)
INDEX created_at (for ordering)
```

---

### 2. Lead Scoring
**File:** `lib/lead-scoring.ts`  
**Function:** `scoreLeadOpportunity(lead: Lead): number`  
**Range:** 1-100

**Scoring Factors:**
- Contact completeness (email + phone + website = +30 points)
- Pain point significance (review mentions key pain words = +25 points)
- Review rating (lower rating = higher pain = +20 points)
- Location match (target geography = +15 points)
- Category match (target niche = +10 points)

**Output:** Used for:
- Prioritizing follow-up outreach (higher scores first)
- Filtering READY_TODAY prospects (score >= threshold)
- Analytics & reporting

---

### 3. Lead State Machine
**File:** `lib/lead-state-machine.ts`

**States:**
1. **new** - Just discovered, no contact yet
2. **recognized** - Contact attempted or received
3. **engaged** - Responded or showed interest
4. **self_confirmed** - Explicitly confirmed need + authority

**Transitions:**
- new → recognized (when email sent)
- recognized → engaged (when prospect replies)
- engaged → self_confirmed (when prospect confirms decision-maker status)
- Any state → dead (operator manual)

**State Change Logging:**
- Table: `lead_state_transitions`
- Tracks: from_state, to_state, timestamp, reason
- Enables: Audit trail + analytics

---

### 4. Lead Enrichment
**File:** `lib/lead-discovery.ts`  
**Function:** `enrichLead(lead: Lead): Promise<EnrichedLead>`

**Enrichment Data:**
- **Business Evidence:** Structured intelligence (size, revenue indicators, growth signals)
- **Pain Points:** Extracted from Google reviews, interview notes
- **Opportunities:** Specific value proposition angles
- **Timeline:** Activity signals (website changes, new reviews, hiring signals)

**Storage:** JSON columns in b2b_leads table (no separate tables)

---

## C. OUTREACH COMPONENTS

### 1. Outreach Table
**Table:** `b2b_outreach`  
**Relationship:** Foreign key to b2b_leads(id)  
**Purpose:** Track all email communication with leads

**Columns:**
```
id (UUID)
lead_id (UUID) -- FK to b2b_leads
subject (TEXT) -- email subject line
body (TEXT) -- full email body (HTML or plain text)
sent_at (TIMESTAMPTZ) -- when Resend delivered
follow_up_1_at (TIMESTAMPTZ) -- scheduled follow-up time
follow_up_2_at (TIMESTAMPTZ) -- second follow-up
replied (BOOLEAN) -- prospect responded
replied_at (TIMESTAMPTZ) -- when reply received
email_type (TEXT) -- 'initial', 'follow_up_1', 'follow_up_2'
resend_message_id (TEXT) -- Resend API reference ID
created_at (TIMESTAMPTZ)
```

**Indexes:**
```
INDEX lead_id (for queries by lead)
INDEX sent_at, replied (for follow-up logic)
```

---

### 2. Email Generation
**Files:**
- `lib/b2b-email.ts` - Hand-written templates per niche
- Integration: Gemini Flash (AI fallback for custom cases)

**Email Types:**
1. **Initial Outreach** - Cold email with pain-point hook
2. **Follow-up 1** - If no reply after 3 days (different angle)
3. **Follow-up 2** - If no reply after 7 days (final attempt + value statement)

**Variables Per Niche:**
- Florists: inventory, customer acquisition, seasonal demand
- Accountants: tax deadlines, client retention, automation opportunities
- [others configured in discovery_config]

**Template System:**
```
Subject: [Business Name] - [Pain Point Hook]
Body:
  Greeting: "Hi [Contact Name]"
  Hook: [Niche-specific pain point insight]
  Mechanism: [How Saint & Story solves it]
  CTA: [Clear next step]
  Signature: [Operator name/team]
```

---

### 3. Email Sending
**Service:** Resend (API)  
**Endpoint:** Used inside orchestrator and send-follow-ups endpoint

**Process:**
1. Generate email subject + body
2. Call Resend API
3. Store message_id + sent_at timestamp
4. Log result

**Failure Handling:**
- Email generation failure: Log error, skip this lead
- Resend API failure: Store email in queue, retry next cycle

---

### 4. Follow-Up System
**File:** `app/api/b2b/send-follow-ups/route.ts`  
**Method:** POST  
**Purpose:** Send scheduled follow-up emails

**Logic:**
1. Query `b2b_outreach` where follow_up_1_at < NOW and not sent
2. Generate follow-up email (different angle)
3. Send via Resend
4. Update follow_up_1_at = NOW, increment follow-up counter
5. Schedule follow_up_2_at = now + 4 days

**Triggers:**
- Manual: Operator calls endpoint
- Automated: Could be scheduled cron (not currently automated)

---

## D. STANDING ORDERS & JOB GENERATION

### 1. Standing Orders Table
**Table:** `b2b_standing_orders`  
**Relationship:** References b2b_leads(id)  
**Purpose:** Recurring work contracts that generate scheduled jobs

**Columns:**
```
id (UUID)
lead_id (UUID)
business_name (TEXT)
contact_name, contact_phone, contact_email (TEXT)
pickup_address, pickup_postcode (TEXT)
delivery_address, delivery_postcode (TEXT)
service_type (TEXT) -- 'removal', 'storage', 'packing', etc
frequency (TEXT) -- 'daily', 'weekly', 'fortnightly', 'monthly'
day_of_week (INTEGER) -- 0-6 (Mon-Sun), for weekly
preferred_time (TEXT) -- 'morning', 'afternoon', '09:00-11:00'
price (DECIMAL) -- estimated cost
notes (TEXT)
active (BOOLEAN) -- disable without deleting
last_generated_at (TIMESTAMPTZ)
next_scheduled_at (TIMESTAMPTZ) -- when next job should create
created_at, updated_at (TIMESTAMPTZ)
```

---

### 2. Job Generation
**Function:** In b2b-orchestrator.ts  
**Trigger:** Daily orchestration OR manual operator trigger

**Process:**
1. Query `b2b_standing_orders` where active=true and next_scheduled_at <= NOW
2. Create b2b_job record with generated details
3. Update next_scheduled_at based on frequency
4. Notify available drivers via Pusher

**Job Fields:**
```
standing_order_id
pickup_address, delivery_address
service_type
scheduled_date, scheduled_time
driver_needed
status ('pending', 'assigned', 'completed')
```

---

### 3. Driver Matching
**Function:** `matchDriverToJob()` in orchestrator

**Matching Criteria:**
1. Driver has active subscription
2. Driver is online/available (real-time check)
3. Driver's service area covers job location
4. Driver's preferred service types include job type
5. Driver doesn't have conflicting scheduled jobs

**Result:** Assign driver → create notification → driver accepts/declines

---

## E. LOGGING & MONITORING

### 1. Orchestration Logs
**Table:** `b2b_orchestration_logs`  
**Purpose:** Complete audit trail of daily execution

**Columns:**
```
id (UUID)
run_id (TEXT) -- 'b2b-2026-06-14-021534'
started_at, completed_at (TIMESTAMPTZ)
discovery_count, businesses_found, leads_created (INTEGER)
drivers_matched, emails_sent (INTEGER)
standing_orders_processed, jobs_created (INTEGER)
failures (TEXT[]) -- error messages
status ('success', 'partial_failure', 'failure')
execution_details (JSONB) -- full stage results
created_at (TIMESTAMPTZ)
```

**Query Examples:**
```sql
-- Today's run
SELECT * FROM b2b_orchestration_logs 
  WHERE DATE(created_at) = CURRENT_DATE
  ORDER BY created_at DESC LIMIT 1;

-- Last 7 days success rate
SELECT status, COUNT(*) FROM b2b_orchestration_logs
  WHERE created_at > NOW() - INTERVAL '7 days'
  GROUP BY status;

-- Total leads created this week
SELECT SUM(leads_created) FROM b2b_orchestration_logs
  WHERE created_at > NOW() - INTERVAL '7 days';
```

---

### 2. State Transition Logs
**Table:** `lead_state_transitions`  
**Purpose:** Audit trail of lead state changes

**Columns:**
```
id (UUID)
lead_id (UUID) -- FK
from_state, to_state (TEXT)
reason (TEXT) -- 'email_sent', 'reply_received', 'operator_manual'
triggered_by (TEXT) -- 'system', 'operator_name', 'automated_trigger'
created_at (TIMESTAMPTZ)
```

---

## F. SYSTEM DEPENDENCIES

### External Services
1. **Google Places API** - Discovery of businesses
2. **Resend API** - Email delivery
3. **Gemini Flash** - AI email generation (fallback)
4. **Pusher** - Real-time updates
5. **Neon Database** - PostgreSQL hosting

### Environment Variables Required
```
DATABASE_URL -- Neon PostgreSQL connection
CRON_SECRET -- Authorization for cron endpoint
RESEND_API_KEY -- Resend email service
GOOGLE_PLACES_API_KEY -- Business discovery
GEMINI_API_KEY -- AI fallback email generation
PUSHER_* -- Real-time notifications
```

---

## G. HEALTH CHECK QUERIES

### Quick System Health
```sql
-- Latest orchestration run
SELECT * FROM b2b_orchestration_logs ORDER BY created_at DESC LIMIT 1;

-- Leads created today
SELECT COUNT(*) FROM b2b_leads WHERE DATE(created_at) = CURRENT_DATE;

-- Emails sent today
SELECT COUNT(*) FROM b2b_outreach WHERE DATE(sent_at) = CURRENT_DATE;

-- Active standing orders
SELECT COUNT(*) FROM b2b_standing_orders WHERE active = true;

-- Driver availability (requires checking drivers table)
SELECT COUNT(*) FROM drivers WHERE active = true AND subscription_active = true;
```

---

**Inventory Created:** 2026-06-14  
**Total Components:** 20+ (discovery, enrichment, outreach, jobs, logging)  
**Status:** ✅ All operational and interdependent
