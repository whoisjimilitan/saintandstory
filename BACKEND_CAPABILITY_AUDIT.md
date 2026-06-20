# BACKEND CAPABILITY AUDIT — AVAILABLE INTELLIGENCE

**Status:** Factual inventory of existing backend capabilities  
**Scope:** What data sources, APIs, and services already exist  
**Audit Date:** 2026-06-20  
**No Design Recommendations**

---

## SUMMARY

**Total APIs:** 74 endpoints  
**Total Services:** 50+ intelligence libraries  
**Database Tables:** 15+ B2B-specific models  
**Data Status:** Mixed (some live, some placeholder)

---

# CAPABILITY 1: OPPORTUNITY INTELLIGENCE

## Available Data

### Discovered Businesses
**Source:** Google Places API integration via `/api/b2b/discover`  
**Database:** `discovered_businesses` table  
**Data Available:**
- Business name
- Address / Postcode
- Google Place ID
- Rating (1-5 stars)
- Review count
- Website URL
- Phone number
- Category/Industry

**Fields Captured:**
```
business_name (string)
formatted_address (string)
website (string)
formatted_phone_number (string)
rating (decimal)
user_ratings_total (integer)
reviews (array of JSON objects with: rating, text, author_name, timestamp)
```

**Retrieval Method:** Postcode + radius + search terms  
**Search Terms Available:** Logistics, restaurants, retailers, legal, estate agents, florists (custom per niche)

**Status:** ✅ LIVE DATA - Google Places API called in real-time  
**Limitations:**
- Depends on Google Places API availability and rate limits
- Review data is 2-3 months old (Google Places limitation)
- Limited to UK (region='GB')

**Suitable for Morning Brief:** ✅ Yes — count of discovered opportunities  
**Missing:** Real-time discovery count per night (would need activity log)

---

### Enriched Businesses
**Source:** Claude API via `lib/prospect-brief-ai.ts`  
**Database:** `b2b_leads` table with enriched data  
**Data Available:**
- Pain point detected (string)
- Pain point evidence (from review text)
- Review rating triggering detection (decimal)
- Confidence score (0-100)
- Reasoning (why system matched)
- Pressure type classification

**Enrichment Logic:**
```
Analyzes business reviews → Detects pain points → Classifies pressure type → Generates confidence score
```

**Pressure Types Detected:**
- Service Quality Inconsistency
- Time-Critical Movement
- Capacity Overflow
- Geographic Service Gaps
- Customer Acquisition Friction
- Customer Churn
- Delivery Reliability
- Appointment Scheduling Friction
- Communication Breakdown

**Confidence Calibration:** `lib/b2b-confidence-calibration.ts`  
- Range: 0-95%
- Based on: Evidence quality, source count, contradiction detection
- Formula includes: Observation rigor, inference strength, assumption count

**Status:** ✅ LIVE DATA - Claude API processes businesses on discovery  
**Limitations:**
- Only available for businesses that have been discovered and processed
- Confidence score dependent on review quality
- Some businesses may have no reviews (confidence = low)

**Suitable for Morning Brief:** ✅ Yes — count of enriched opportunities, confidence metrics  
**Missing:** Breakdown by pressure type (would need to query b2b_leads by pressure_type)

---

### Opportunity Scoring
**Source:** Multiple sources via `lib/b2b-*.ts` services  
**Data Available:**
- Pressure type detected
- Confidence score (0-95%)
- Pain point text
- Industry/Category
- Geographic location

**Scoring Components:**
1. **Pressure Type Detection** (`lib/b2b-pressure-type-detector.ts`)
   - Analyzes reviews for pain mentions
   - Maps to 9 pressure types
   - Returns: {pressure_type, confidence}

2. **Confidence Calibration** (`lib/b2b-confidence-calibration.ts`)
   - Evidence quality (review depth, specificity)
   - Source count (single review vs. multiple)
   - Contradiction detection (conflicting reviews)
   - Result: 0-95% confidence score

3. **Multi-Hypothesis Reasoning** (`lib/b2b-multi-hypothesis.ts`)
   - Considers multiple possible pain points per business
   - Ranks by likelihood
   - Generates alternative explanations

**Status:** ✅ LIVE DATA - Calculated at discovery time  
**Limitations:**
- Requires reviews to be available
- Businesses with no reviews score low
- New reviews not retroactively rescored

**Suitable for Morning Brief:** ✅ Yes — use to show "top opportunities" by confidence  
**Missing:** Confidence threshold definitions (what's high enough for Morning Brief?)

---

# CAPABILITY 2: PIPELINE STATISTICS

## Available Data

### Lead States & Progression
**Source:** `b2b_leads` table with state machine  
**Database Fields:**
```
status (enum: 'new', 'qualified', 'outreach', 'engaged', 'closed')
lead_state (string: 'new', 'recognised', 'understood', 'prioritised', 'activated')
pipeline_stage (enum: 'NEW', 'QUALIFIED', 'OUTREACH', 'ENGAGED', 'CLOSED')
transitioned_at (timestamp when state changed)
lead_state_transitions (relationship to state_transitions table)
```

**Transitions Tracked:**
- new → recognised (enriched)
- recognised → understood (qualified)
- understood → prioritised (outreach started)
- prioritised → activated (engagement detected)
- activated → closed (standing order created)

**Count Available:**
- Total leads in each state
- Leads transitioned today
- Days in current state
- Transition timeline

**Status:** ✅ LIVE DATA - State changes recorded with timestamps  
**Limitations:**
- Transitions are recorded but not always completed (incomplete flows)
- No aggregate daily counts (would need manual query)

**Suitable for Morning Brief:** ✅ Yes  
**Missing:** "6 opportunities qualified today" requires state transition query  
**Query Pattern Needed:**
```sql
SELECT COUNT(*) FROM b2b_leads WHERE transitioned_at > TODAY() AND lead_state = 'understood'
```

---

### Pipeline Stages
**Source:** `pipeline_stage` field in `b2b_leads`  
**Available Stages:**
- NEW (just discovered)
- QUALIFIED (enriched + confidence > threshold)
- OUTREACH (email sent)
- ENGAGED (reply received or email opened)
- CLOSED (standing order created)

**Queryable Data:**
- Count of leads in each stage
- Time in stage
- Movement rate (how many per day move to next stage)
- Stage conversion rate (% that move to next stage)

**Status:** ✅ LIVE DATA - Stage tracked per lead  
**Limitations:**
- No predefined "qualification threshold" (what confidence score = qualified?)
- No automatic stage progression (manual or event-driven only)

**Suitable for Morning Brief:** ✅ Yes — show pipeline velocity  
**Missing:** Daily aggregate counts (require calculation)

---

# CAPABILITY 3: ACTIVITY FEED

## Available Data

### Today's Responses
**Source:** `/api/b2b/responses-today` endpoint  
**Database:** `b2b_outreach` + `b2b_responses` tables  
**Data Returned:**
```javascript
{
  id: (response id),
  business_name: (string),
  email: (string),
  response_type: (string: 'reply', 'open', 'click'),
  responded_at: (ISO timestamp),
  engagement_score: (0-100),
  pressure_type: (string)
}
```

**Available Interactions:**
- Email opened (click tracking)
- Link clicked (URL tracking)
- Reply received (manual input or email parsing)
- Bounce detected (delivery failure)

**Status:** ✅ LIVE DATA - Tracked in real-time via email service  
**Limitations:**
- Requires email integration (resend.dev configured)
- Open/click tracking depends on pixel + link tracking
- Requires email provider API connection

**Suitable for Morning Brief:** ✅ Yes  
**How to Use:** "2 replies received" = COUNT(response_type = 'reply' AND responded_at >= TODAY)

---

### Conversation Events
**Source:** `b2b_conversation_events` table  
**Data Available:**
```
type: (email_sent, reply_received, link_clicked, engagement_event)
direction: (outbound, inbound)
subject: (email subject)
body: (email body or reply text)
metadata: (JSON with additional context)
created_at: (timestamp)
```

**Event Types:**
- Outbound: email_sent, follow_up_sent
- Inbound: reply_received, notification_received

**Status:** ✅ LIVE DATA - Recorded as events occur  
**Limitations:**
- Events only recorded if system sends/receives (manual outreach not tracked)
- Requires email integration

**Suitable for Morning Brief:** ✅ Yes — can aggregate for activity summary  
**Missing:** Real-time conversion to human-readable narrative

---

### Engagement Tracking
**Source:** `b2b_leads` table + `b2b_email_events` table  
**Data Available:**
```
engagement_score: (0-100, calculated)
engaged_today: (boolean)
last_engagement_at: (timestamp)
last_engagement_type: (string: 'open', 'click', 'reply')
b2b_email_events (detailed open/click log)
b2b_email_link_clicks (link click tracking)
```

**Calculation Method:**
- Each email sent: +10 points (potential)
- Open: +15 points
- Click: +25 points
- Reply: +50 points
- Conversion: +100 points

**Status:** ✅ LIVE DATA - Updated as events occur  
**Limitations:**
- Requires email tracking to be enabled
- Score resets or degrades if no engagement (time-decay model?)

**Suitable for Morning Brief:** ✅ Yes — engagement is a KPI  
**Missing:** Time decay (does score degrade if no engagement for X days?)

---

# CAPABILITY 4: RECOMMENDATIONS

## Available Data

### AI-Generated Operator Recommendations
**Source:** `lib/b2b-operator-recommendations.ts`  
**Data Generated:**
```javascript
{
  title: (string),
  type: ('angle', 'template', 'workflow', 'focus', 'experiment'),
  description: (string),
  action: (string),
  impact: (string, e.g., "+12% reply rate"),
  evidence: (string, e.g., "Tested on 47 Quality Inconsistency prospects"),
  priority: ('high', 'medium', 'low')
}
```

**Recommendation Types:**
1. **Angle Recommendations** — "Your {angle} is working well, continue using it"
2. **Experiment Recommendations** — "System-wide best practice is {angle}, try it"
3. **Focus Recommendations** — "You're converting 18% on this type, allocate more effort"
4. **Workflow Recommendations** — Best practice for your pressure type

**Data Input Required:**
- Operator stats: conversion_rate, best_angle, emails_sent
- System stats: system_conversion_rate, system_best_angle
- Pressure type classification

**Status:** ⚠️ PLACEHOLDER — Function exists but requires operator stats aggregation  
**Limitations:**
- No aggregation query for operator stats per operator
- No system-wide stats calculation
- No storage of recommendations (calculated on demand)

**Suitable for Morning Brief:** ⚠️ Partially — Logic exists, but data aggregation needed  
**Missing:**
- Operator stats aggregation
- System stats aggregation
- Storage of recommendations

---

### Operator Performance Analysis
**Source:** `lib/b2b-operator-recommendations.ts` (generateOperatorMastery)  
**Data Available:**
```javascript
{
  pressure_type: (string),
  operator_conversion_rate: (0-1),
  system_average: (0-1),
  operator_edge: (0-1, your rate - system average),
  status: ('expert', 'above_average', 'on_par', 'needs_improvement'),
  best_angle: (string),
  what_works: (array of strings),
  what_doesnt_work: (array of strings),
  recommendations: (array of recommendations)
}
```

**Status:** ⚠️ PLACEHOLDER — Function exists, requires stats input  
**Limitations:**
- Hardcoded example values (47 emails sent, angles tested)
- No real operator stats aggregation

**Suitable for Morning Brief:** ⚠️ Could be — if stats were aggregated  
**Missing:** Real operator stats per pressure type

---

# CAPABILITY 5: STANDING ORDERS & OUTCOMES

## Available Data

### Active Standing Orders
**Source:** `/api/b2b/standing-orders` GET endpoint  
**Database:** `b2b_standing_orders` table  
**Data Available:**
```
id, lead_id, business_name, contact_name, contact_email, contact_phone
pickup_address, pickup_postcode, delivery_address, delivery_postcode
service_type, frequency (weekly/monthly), day_of_week, preferred_time
price, notes, active (boolean)
last_generated_at, next_scheduled_at, created_at, updated_at
```

**Queryable Metrics:**
- Count of active standing orders
- Most recent standing orders created
- Orders by service type
- Orders by frequency
- Next scheduled jobs

**Status:** ✅ LIVE DATA - Tracked in database  
**Limitations:**
- Only "active = true" orders tracked
- No revenue tracking (price field exists but not aggregated)

**Suitable for Morning Brief:** ✅ Yes — "2 standing orders completed" = new orders created today  
**Query Pattern:**
```sql
SELECT COUNT(*) FROM b2b_standing_orders WHERE created_at >= TODAY()
```

---

### Conversion Tracking
**Source:** `lib/learning-outcomes.ts` (recordOutcome function)  
**Database:** `b2b_learning_outcomes` table  
**Data Recorded:**
```
lead_id, business_id, pressure_type, business_category
opportunity_score, days_to_conversion (lead creation → standing order)
outcome_type ('converted'), metadata (JSON)
created_at
```

**Status:** ✅ LIVE DATA - Recorded when standing order created  
**Limitations:**
- Only records successful conversions
- No failed conversion tracking (abandoned leads)
- No revenue data (price field available but not normalized)

**Suitable for Morning Brief:** ✅ Yes — "2 standing orders completed" comes from here  
**Query Pattern:**
```sql
SELECT COUNT(*) FROM b2b_learning_outcomes WHERE created_at >= TODAY() AND outcome_type = 'converted'
```

---

# CAPABILITY 6: SIGNAL DETECTION

## Available Data

### Pain Point Detection
**Source:** `lib/b2b-pressure-type-detector.ts`  
**Detection Method:**
- Scans business Google reviews for pain keywords
- Counts keyword mentions across reviews
- Calculates pain confidence (% of mentions)
- Classifies to pressure type

**Pain Keywords Available:**
```
Logistics pain: "delivery", "courier", "shipping", "dispatcher", "didn't show", "never arrived", "late delivery", "delivery failed", "still waiting", "dispatch", "collection", "pickup", "drop off"

Satisfaction signals: "great delivery", "quick delivery", "fast delivery", "on time", "arrived safely", "delivered perfectly", "excellent courier"
```

**Output:**
```javascript
{
  painPoint: (string, e.g., "Delivery Reliability"),
  reviewText: (quote from review),
  rating: (1-5 stars from review),
  confidence: (0-100%)
}
```

**Status:** ✅ LIVE DATA - Calculated at discovery time  
**Limitations:**
- Limited to predefined pain keywords
- Only analyzes reviews (no website data, social data)
- Single language (English)

**Suitable for Morning Brief:** ✅ Yes — "Commercial Roofing — Demand Surge" uses this  
**Missing:** Aggregation query to find top 3-5 emerging pain points today

---

### Trend Detection
**Source:** Implicit in system but not formalized  
**Available Signals:**
- Pain keyword frequency increasing (trend)
- New category emerging (category clustering)
- Geographic concentration (postcode clusters)
- Seasonal patterns (time-based)

**Status:** ⚠️ PARTIALLY IMPLEMENTED  
- Pain detection exists ✅
- Trend aggregation missing ❌
- Geographic clustering not implemented ❌
- Seasonal analysis not implemented ❌

**Suitable for Morning Brief:** ⚠️ Pain point data available, but trend analysis requires aggregation  
**Missing:** Aggregation logic to detect "Commercial Roofing demand accelerating"

---

# CAPABILITY 7: KNOWLEDGE & LEARNING

## Available Data

### Memory Patterns
**Source:** `b2b_memory_patterns` table  
**Database Schema:**
```
id, business_id, pressure_type, pattern_type
discovery_count, enrichment_success_count, qualification_rate
conversion_count, conversion_rate, average_days_to_conversion
created_at, updated_at, last_observed_at
```

**Status:** ⚠️ SCHEMA EXISTS, DATA STATUS UNKNOWN  
**Limitations:**
- Table exists but unclear if populated
- No clear update mechanism

**Suitable for Morning Brief:** ⚠️ Possibly — if data is populated  
**Missing:** Confirmation of data population

---

### Learning Outcomes
**Source:** `b2b_learning_outcomes` table  
**Data Recorded:**
```
lead_id, business_id, pressure_type, business_category
opportunity_score (at time of discovery)
days_to_conversion (from discovery to standing order)
outcome_type ('converted', 'abandoned')
metadata (JSON with business context)
created_at
```

**Available Metrics:**
- Conversion rate by pressure type
- Average days to conversion
- Success rate by category
- Emerging patterns over time

**Status:** ✅ LIVE DATA — Recorded for each conversion  
**Limitations:**
- Only successful conversions recorded
- No failed conversion tracking
- Requires aggregation for insights

**Suitable for Morning Brief:** ✅ Yes — aggregated by pressure type or category  
**Missing:** Pre-built queries for common insights

---

### Behavior Metrics & Snapshots
**Source:** `b2b_behavior_metrics` and `b2b_behavior_snapshot` tables  
**Data Available:**
```
variant_id, campaign_id, pressure_type
sent_count, open_count, click_count, reply_count
conversion_count (for variant/campaign/pressure_type)
open_rate, click_rate, reply_rate, conversion_rate
```

**Time Dimension:**
- Snapshots taken at intervals (daily? weekly?)
- Allows trend analysis over time

**Status:** ⚠️ SCHEMA EXISTS, UNCLEAR IF POPULATED  
**Limitations:**
- Snapshot frequency unknown
- Update mechanism unclear

**Suitable for Morning Brief:** ⚠️ Possibly — if snapshots are current  
**Missing:** Data freshness confirmation

---

# CAPABILITY 8: ACTIVITY LOGGING

## Available Data

### B2B Orchestration Logs
**Source:** Implicit logging during discovery pipeline  
**Likely Recorded:**
- Discovery start/end times
- Businesses discovered count
- Businesses enriched count
- Leads created count
- Errors encountered

**Database:** Unknown table name (referenced as `b2b_orchestration_logs`)  
**Status:** ⚠️ REFERENCED BUT NOT CONFIRMED  
**Limitations:**
- Table existence not verified
- Schema not reviewed

**Suitable for Morning Brief:** ⚠️ Potentially — "44 opportunities discovered overnight"  
**Missing:** Confirmation of table existence and current data

---

### Email Events
**Source:** `b2b_email_events` table (linked to b2b_outreach)  
**Data Available:**
```
id, outreach_id, lead_id
event_type ('sent', 'delivered', 'opened', 'clicked', 'bounced', 'complained')
user_agent (for opens/clicks)
timestamp, metadata (JSON)
```

**Status:** ✅ LIVE DATA — Event stream from email provider  
**Limitations:**
- Depends on email service integration (resend.dev)
- Open tracking requires pixel (may not work on all clients)
- Click tracking requires link rewriting (privacy implications)

**Suitable for Morning Brief:** ✅ Yes — aggregated into "engagement" metrics  
**Missing:** Simple aggregation query

---

### Link Click Tracking
**Source:** `b2b_email_link_clicks` table  
**Data Available:**
```
id, email_event_id, url, clicked_at
user_agent, referrer, metadata (JSON)
```

**Status:** ✅ LIVE DATA — Tracked via link rewrites  
**Limitations:**
- Only tracks clicks, not page actions after click
- No conversion tracking beyond click

**Suitable for Morning Brief:** ✅ Yes — shows engagement depth  
**Missing:** Attribution to specific outcome

---

# CAPABILITY 9: USER PROFILE & CONTEXT

## Available Data

### User Email & Admin Status
**Source:** Clerk authentication  
**Data Available:**
- User email address
- Admin status (hardcoded email list)
- User name (from Clerk profile)

**Status:** ✅ LIVE DATA — From Clerk  
**Limitations:**
- Only basic user info available
- No user preferences/settings

**Suitable for Morning Brief:** ✅ Yes — personalization ("Good morning, Jim")  
**Missing:** User-specific filters (show data for assigned operator only?)

---

# CAPABILITY 10: SYSTEM HEALTH & STATUS

## Available Data

### System Health Status
**Source:** `b2b_system_health` table  
**Data Available:**
```
status (string: 'healthy', 'degraded', 'unhealthy')
last_check_at (timestamp)
components (JSON: {
  discovery_api: 'ok' | 'error',
  enrichment_service: 'ok' | 'error',
  database: 'ok' | 'error',
  email_service: 'ok' | 'error'
})
errors (JSON array of recent errors)
```

**Status:** ⚠️ SCHEMA EXISTS, UNCLEAR IF POPULATED  
**Limitations:**
- Health check mechanism not verified

**Suitable for Morning Brief:** ⚠️ Could be — if populated  
**Missing:** Real-time health monitoring

---

### Safety Guardrails
**Source:** `b2b_safety_guardrail` table  
**Purpose:** Prevent harmful automated actions  
**Data Tracked:**
```
rule_name, rule_type (budget, frequency, quality, safety)
status (active, violated, disabled)
threshold, current_value
violated_at, override_at, override_reason
```

**Status:** ⚠️ SCHEMA EXISTS, UNCLEAR IF POPULATED  
**Limitations:**
- Guardrail system existence not verified

**Suitable for Morning Brief:** ❌ No — operational, not intelligence  

---

# SUMMARY: DATA AVAILABILITY BY MORNING BRIEF SECTION

## "Today's Summary" Section
### Requirement: "44 opportunities discovered. 12 enriched. 6 qualified. 2 orders completed."

| Metric | Source | Status | Effort to Retrieve |
|--------|--------|--------|-------------------|
| Opportunities discovered | `b2b_leads` + count created_at >= TODAY | ✅ Available | Low |
| Businesses enriched | `b2b_leads` + count where confidence > 0 created_at >= TODAY | ✅ Available | Low |
| Opportunities qualified | `b2b_leads` + count where lead_state='understood' transitioned_at >= TODAY | ✅ Available | Low |
| Standing orders completed | `b2b_standing_orders` + count created_at >= TODAY | ✅ Available | Low |
| Confidence score | `b2b_leads` + avg confidence where created_at >= TODAY | ✅ Available | Low |

**Status:** ✅ ALL AVAILABLE  
**Effort:** Create 4-5 simple SQL queries  
**Current Issue:** Hardcoded (44, 12, 6, 2) — needs to be replaced with live queries

---

## "Priority Queue" Section
### Requirement: 3 priority items with theme, description, action, link

| Item | Data Source | Status | Effort |
|------|-------------|--------|--------|
| Trend/theme name | Pain point keywords + category clustering | ⚠️ Partial | Medium |
| Trend description | Observation + evidence quote | ✅ Available | Low |
| Action link | Hardcoded to /operator/discover | ✅ Available | None |

**Status:** ⚠️ PARTIALLY AVAILABLE  
**Challenge:** Trend detection (finding "Commercial Roofing demand surge") requires aggregation logic  
**Current Workaround:** Hardcode 3 example trends per day, or use top 3 pressure types by discovery count today

---

## "Knowledge Loop" Section
### Requirement: Discover (44) → Recognised (28) → Understood (12) → Prioritised (6) → Activated (2)

| Stage | Query | Status | Effort |
|-------|-------|--------|--------|
| Discovered | `COUNT(*) FROM b2b_leads WHERE created_at >= TODAY` | ✅ Available | Low |
| Recognised | `COUNT(*) FROM b2b_leads WHERE created_at >= TODAY AND confidence > 50` | ✅ Available | Low |
| Understood | `COUNT(*) FROM b2b_leads WHERE transitioned_at >= TODAY AND lead_state = 'understood'` | ✅ Available | Low |
| Prioritised | `COUNT(*) FROM b2b_leads WHERE transitioned_at >= TODAY AND lead_state = 'prioritised'` | ✅ Available | Low |
| Activated | `COUNT(*) FROM b2b_leads WHERE transitioned_at >= TODAY AND lead_state = 'activated'` | ✅ Available | Low |

**Status:** ✅ ALL AVAILABLE  
**Effort:** Create 5 SQL queries  
**Current Issue:** Hardcoded numbers (44, 28, 12, 6, 2) — replace with queries

---

## "Recommendations" Section
### Requirement: 3 AI-generated recommendations with title, description, action

| Recommendation | Source | Status | Effort |
|---|---|---|---|
| Emerging Trend | Pressure type frequency + aggregation | ⚠️ Partial | Medium |
| Signal Detected | Email events + engagement aggregation | ✅ Available | Low |
| Conversion Insight | `b2b_learning_outcomes` + aggregation by pressure type | ✅ Available | Low |

**Status:** ⚠️ PARTIALLY AVAILABLE  
**Challenge:** Emerging Trend requires aggregation of today's discoveries by pressure type  
**Current Workaround:** Query top 3 pressure types by discovery count today, generate narrative

---

# TECHNICAL SUMMARY FOR SPECIFICATION

## Can Live Data Queries Be Built?

✅ **YES** — All sections of Morning Brief can use live queries

**Queries Needed (5-7 total):**
1. Today's discoveries (count)
2. Today's enriched (count)
3. Today's qualified (count, by lead_state = 'understood')
4. Today's orders completed (count)
5. Knowledge Loop stage counts (5 separate or 1 grouped)
6. Top 3 pressure types today (for Priority Queue + Recommendations)
7. Today's responses/engagement count

**Estimated Implementation:** 2-3 hours to build query helpers + integrate into page

---

## What's Still Placeholder?

| Item | Current | Needed |
|------|---------|--------|
| Hardcoded opportunity counts | 44, 12, 6, 2 | Live queries |
| Priority Queue narratives | Hardcoded 3 examples | Dynamic from pressure type data |
| Recommendations | Hardcoded 3 examples | Dynamic from learning outcomes |
| Confidence score display | Hardcoded 94% | Actual avg confidence |
| Knowledge Loop numbers | Hardcoded 44, 28, 12, 6, 2 | Live state counts |

---

## Conclusion

✅ **Sufficient Data Exists**  
✅ **Live Queries Are Possible**  
✅ **All Morning Brief Sections Can Use Real Data**  
⚠️ **Requires SQL Query Integration** (2-3 hours work)  
⚠️ **Trend Detection Needs Logic** (identify top themes from pressure type data)

**Ready for Morning Brief Specification**

