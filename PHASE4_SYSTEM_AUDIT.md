# Phase 4 System Audit: Existing Intelligence Flows

**Status:** Audit only. No implementation decisions made.

**Purpose:** Map what exists before extending systems. Prevent duplicate architecture.

---

## EXISTING SYSTEM MAP

### TIER 1: DISCOVERY (LAYER 1)

**Objective:** Find all candidate businesses. Persist without filtering.

**Current Implementation:**
- **Primary file:** `lib/four-layer-pipeline.ts` → `persistDiscovery()`
- **Sources:**
  - Google Places API (via `research-missions.ts` → `searchByLocationAndTerms()`)
  - Postcode search (via `lib/lead-discovery.ts`)
  - Research missions (via `research-missions.ts` → `executeResearchMission()`)
- **Database:** `discovered_businesses` table
- **Data enters:** RawBusinessDiscovery (placeId, name, address, postcode, category, source)
- **Data exits:** DiscoveredBusiness (id, google_place_id, business_name, address, postcode, category, source, discovered_at)
- **Key logic:** ON CONFLICT DO NOTHING (prevents duplicates, retains first discovery)
- **Status:** ✅ FUNCTIONAL - handles multiple sources, maintains reservoir

**Questions for extension:**
- How to expand Engine A (autonomous discovery nationally/vertically)?
- How to implement Engine B (operator postcode search)?
- How to support Engine C (intelligence imports - CSV, databases)?

---

### TIER 1: ENRICHMENT (LAYER 2)

**Objective:** Extract intelligence from discovered businesses (reviews, digital maturity, transport signals).

**Current Implementation:**
- **Primary file:** `lib/four-layer-pipeline.ts` → `enrichBusiness()`
- **Intelligence extracted:**
  - Review signals: `extractReviewSignals()` - pain points, themes, sentiment
  - Digital maturity: has_website, has_contact_form, has_booking, website_quality
  - Transport dependency: `analyzeTransportDependency()` - keywords in name/category/reviews
- **Database:** `enriched_businesses` table
- **Data enters:** DiscoveredBusiness + RawBusinessDiscovery (reviews array, website, phone, rating, reviewCount)
- **Data exits:** EnrichedBusiness (review_count, average_rating, review_summary, digital_signals, transport_signals, ai_observations)
- **Key functions:**
  - `extractReviewSignals()` - identifies pain points, sentiment
  - `analyzeTransportDependency()` - keyword matching for transport relevance
- **Status:** ✅ FUNCTIONAL - extracts signals, preserves for qualification

**Questions for extension:**
- How to add opportunity expansion signals (branch potential, multi-site, referral, partnership)?
- How to calculate decision-maker density?
- How to improve transport dependency scoring?

---

### TIER 1: SCORING & QUALIFICATION (LAYER 3)

**Objective:** Score all enriched businesses and rank by opportunity. Determine priority tiers.

**Current Implementation:**
- **Primary file:** `lib/four-layer-pipeline.ts` → `qualifyBusiness()`
- **Scoring engine:** `lib/lead-scoring.ts` → `scoreOpportunity()`
- **Database:** `qualified_businesses` table
- **Scoring inputs:**
  - industryCategory (care_home, healthcare, legal, etc.)
  - painPoint (from review analysis)
  - reviewRating
  - reviewCount
  - hasWebsite
  - businessName
- **Score dimensions:**
  - business_type_score (0-25)
  - maturity_score (0-10, based on review count)
  - service_complexity_score (0-18)
  - transport_dependence_score (0-18)
  - review_signals_score (0-18)
  - digital_maturity_score (0-10)
  - pain_signal_bonus (0-5)
  - **Total:** 0-100
- **Data exits:** QualifiedBusiness (opportunity_score, score_breakdown, confidence, qualification_reason, estimated_monthly_value)
- **Tiers (current):**
  - hot: 60+
  - warm: 40-59
  - cool: <40
- **Promotion threshold:** score ≥ 40 becomes lead
- **Status:** ✅ FUNCTIONAL - scoring works, but tiers are not formalized as Tier A-D, no outreach eligibility separation

**Questions for extension:**
- How to formalize qualification tiers (Tier A: 80-100, B: 60-79, C: 40-59, D: 0-39)?
- How to add outreach eligibility flag (separate from qualification)?
- How to add Engine C dimensions (branch potential, multi-site potential, referral potential, partnership potential, decision-maker density)?
- How to incorporate opportunity expansion signals into scoring?

---

### TIER 1: PROMOTION & OUTREACH ELIGIBILITY (LAYER 4 - PARTIAL)

**Objective:** Decide which qualified businesses become leads and which are outreach eligible.

**Current Implementation:**
- **Primary file:** `lib/four-layer-pipeline.ts` → `promoteToLead()`
- **Database:** `b2b_leads` table
- **Current logic:**
  - If score ≥ 40: auto-promote to b2b_leads
  - Record promotion in `lead_promotions` table
  - Status set to 'new'
  - Source set to 'discovery_promoted'
- **Data exits:** b2b_leads with status, source, opportunity_score, score_breakdown
- **Status:** ⚠️ PARTIAL - promotion works, but no outreach eligibility separation

**What's missing:**
- Outreach eligibility is not separated from promotion
- No way to store qualified businesses without making them leads
- No way to control selective outreach (currently all score ≥ 40 become leads)
- No Business Card eligibility flag
- No way to say "qualified but not ready for outreach"

**Questions for extension:**
- How to add `outreach_eligible` flag to b2b_leads?
- How to separate promotion (qualified → lead) from outreach eligibility (lead → business card)?
- How to control outreach selectivity (discover 1000, qualify 300, select 50 for outreach)?

---

### TIER 2: PERSONALIZATION

**Objective:** Generate personalized content (email, landing page, conversation context) based on business intelligence.

**Current Implementation:**
- **Landing page:** `lib/prospect-pages.ts` - generates personalized brief based on category + location
- **Email:** `lib/recognition-email.ts` - generates subject + body based on pain point + driver location
- **Email variants:** `lib/b2b-email.ts` - PAIN_TEMPLATES, RELIEF_TEMPLATES for nuanced outreach
- **Business intelligence:** `lib/prospect-pages.ts` - research observations based on category
- **Engagement tracking:** `b2b_leads` table has `lead_state`, `business_evidence`, `human_observations`
- **Conversation intelligence:** `lead-state-machine.ts` - tracks workflow state transitions
- **Status:** ✅ FUNCTIONAL - personalizes based on category and pain signals

**What's preserved:**
- Prospect brief generation (stays)
- Landing page personalization (stays)
- Email personalization (stays)
- Engagement tracking (stays)
- Conversation intelligence (stays)

**Questions for extension:**
- How to ensure Business Card doesn't genericise personalization?
- How to protect brief generation from becoming template-driven?
- How to add postcode intelligence without breaking existing personalization?

---

### TIER 2: OUTREACH

**Objective:** Send emails to outreach-eligible businesses, track engagement, move to conversation.

**Current Implementation:**
- **Outreach emails:** `lib/recognition-email.ts` (recognition email sent after driver assignment)
- **Email variants:** `lib/b2b-email.ts` (pain-based, cold, relief-layer templates)
- **Send mechanism:** `sendRecognitionEmail()` - via Resend API
- **Tracking:** `b2b_outreach` table (subject, body, sent_at, replied, replied_at, email_type)
- **Status:** ✅ FUNCTIONAL - sends personalized emails, tracks replies

**Current gaps:**
- No Business Card system (would go before recognition email)
- No engagement signal tracking from brief views
- No clear decision logic for "is this business outreach ready?"

**Questions for extension:**
- How to insert Business Card before recognition email?
- How to track prospect brief engagement (opens, clicks, dwell time)?
- How to feed engagement signals back into scoring?

---

### TIER 2: ACTIVATION

**Objective:** Convert engaged prospects into standing orders (recurring revenue).

**Current Implementation:**
- **Standing order creation:** `app/api/b2b/standing-orders` endpoint
- **Database:** `b2b_standing_orders` table
- **Data stored:** business_name, contact details, pickup/delivery postcodes, frequency, day, time, price
- **Job generation:** orchestration pipeline creates jobs from standing orders
- **Status:** ✅ FUNCTIONAL - creates orders, generates jobs

**What's preserved:**
- Standing order creation (stays)
- Job generation (stays)
- Revenue tracking (stays)

---

### MISSING SYSTEMS

**What does NOT exist yet:**

1. **Business Card Email System**
   - Separate email type from recognition email
   - Narrative bridge purpose (create unresolved thought)
   - Only sent to outreach-eligible businesses
   - Engagement tracking (opens, clicks, returns)

2. **Outreach Eligibility Flag**
   - Current: score ≥ 40 = automatic outreach
   - Needed: explicit `outreach_eligible` flag on b2b_leads
   - Allows selective outreach (discover 1000, qualify 300, select 50)

3. **Qualification Tiers (Formalized)**
   - Current: hot (60+), warm (40-59), cool (<40)
   - Needed: Tier A (80-100), B (60-79), C (40-59), D (0-39) with explicit behavior rules

4. **Engine C: Opportunity Expansion Signals**
   - Branch potential score
   - Multi-site potential score
   - Referral potential score
   - Partnership potential score
   - Decision-maker density
   - Currently: no expansion scoring

5. **Postcode Intelligence Hub**
   - One postcode = multiple outputs
   - Business Opportunity Score (from qualified_businesses)
   - Driver Capacity Score (from drivers + journeys)
   - Journey Demand Score (from b2b_standing_orders + b2b_outreach)
   - Revenue Potential Score (from standing orders)
   - Currently: postcode is just a field, not a strategic nucleus

6. **Reservoir Visibility**
   - Current: qualified_businesses stores all scored businesses
   - Needed: operator dashboard showing unqualified reserve (Tier D)
   - Needed: ability to re-score historical discoveries

---

## DATABASE CHANGES REQUIRED

### New columns (LOW RISK)

```sql
-- b2b_leads table
ALTER TABLE b2b_leads ADD COLUMN IF NOT EXISTS outreach_eligible BOOLEAN DEFAULT FALSE;
ALTER TABLE b2b_leads ADD COLUMN IF NOT EXISTS qualification_tier TEXT DEFAULT 'D' CHECK (qualification_tier IN ('A', 'B', 'C', 'D'));
ALTER TABLE b2b_leads ADD COLUMN IF NOT EXISTS business_card_sent_at TIMESTAMPTZ;
ALTER TABLE b2b_leads ADD COLUMN IF NOT EXISTS business_card_opened_at TIMESTAMPTZ;
ALTER TABLE b2b_leads ADD COLUMN IF NOT EXISTS business_card_clicked_at TIMESTAMPTZ;

-- qualified_businesses table
ALTER TABLE qualified_businesses ADD COLUMN IF NOT EXISTS qualification_tier TEXT DEFAULT 'D' CHECK (qualification_tier IN ('A', 'B', 'C', 'D'));
ALTER TABLE qualified_businesses ADD COLUMN IF NOT EXISTS branch_potential_score DECIMAL(5,2) DEFAULT 0;
ALTER TABLE qualified_businesses ADD COLUMN IF NOT EXISTS multisite_potential_score DECIMAL(5,2) DEFAULT 0;
ALTER TABLE qualified_businesses ADD COLUMN IF NOT EXISTS referral_potential_score DECIMAL(5,2) DEFAULT 0;
ALTER TABLE qualified_businesses ADD COLUMN IF NOT EXISTS partnership_potential_score DECIMAL(5,2) DEFAULT 0;
ALTER TABLE qualified_businesses ADD COLUMN IF NOT EXISTS decision_maker_density_score DECIMAL(5,2) DEFAULT 0;
```

### New tables (Optional, for explicit tracking)

```sql
-- Business Card Email tracking
CREATE TABLE IF NOT EXISTS business_card_emails (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID REFERENCES b2b_leads(id) ON DELETE CASCADE,
  sent_at TIMESTAMPTZ DEFAULT NOW(),
  opened_at TIMESTAMPTZ,
  clicked_at TIMESTAMPTZ,
  dwell_time_seconds INT,
  return_visits INT DEFAULT 0,
  engagement_score DECIMAL(3,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Postcode Intelligence cache
CREATE TABLE IF NOT EXISTS postcode_intelligence (
  postcode VARCHAR(20) PRIMARY KEY,
  business_opportunity_score DECIMAL(5,2),
  driver_capacity_score DECIMAL(5,2),
  journey_demand_score DECIMAL(5,2),
  revenue_potential_score DECIMAL(5,2),
  last_calculated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### New indexes (Performance)

```sql
CREATE INDEX idx_b2b_leads_outreach_eligible ON b2b_leads(outreach_eligible);
CREATE INDEX idx_b2b_leads_qualification_tier ON b2b_leads(qualification_tier);
CREATE INDEX idx_qualified_businesses_tier ON qualified_businesses(qualification_tier);
CREATE INDEX idx_business_card_emails_lead ON business_card_emails(lead_id);
CREATE INDEX idx_postcode_intelligence ON postcode_intelligence(postcode);
```

---

## UI CHANGES REQUIRED

### New/Modified Dashboards

**1. Discovery Reserve Pool** (new dashboard section)
- Show businesses by tier (Tier A, B, C, D counts)
- Show unqualified reserve size
- Button to re-score historical discoveries
- Filter/search by postcode, category, score range

**2. Postcode Intelligence** (new dashboard)
- Input postcode
- Show four scores: Business Opportunity, Driver Capacity, Journey Demand, Revenue Potential
- Show recruitment signal (if shortage detected)
- Show recent businesses discovered in that postcode

**3. Outreach Dashboard** (modify existing)
- Show outreach-eligible count (separate from qualified count)
- Show Business Card send status
- Show engagement metrics (opened, clicked, returned)

**4. B2B Metrics** (modify existing)
- Add Tier A/B/C/D breakdown
- Add outreach-eligible metric
- Add Business Card engagement metric

---

## AUTOMATION CHANGES REQUIRED

### Daily Orchestration (Preserve, extend)

```
Current (preserved):
├─ Discovery pipeline (autonomous)
├─ Enrichment pipeline
├─ Qualification pipeline
├─ Promotion to leads (if score ≥ 40)
├─ Driver matching
├─ Standing order generation
└─ Metrics calculation

New (additive):
├─ Qualification tier assignment (based on score)
├─ Outreach eligibility decision (selective, not automatic)
├─ Business Card send (to outreach-eligible only)
├─ Postcode intelligence cache refresh
└─ Opportunity expansion scoring
```

### New Automation Tasks

**1. Qualification Tier Assignment**
- After qualification, assign tier: A (80+), B (60-79), C (40-59), D (0-39)
- Store in `qualified_businesses.qualification_tier`
- Store in `b2b_leads.qualification_tier`

**2. Outreach Eligibility Decision**
- Not automatic (was: score ≥ 40 = lead)
- New: operator selects from Tier A/B for outreach
- OR: engagement signal triggers promotion (brief visit + dwell time)
- Flag: `b2b_leads.outreach_eligible = true`

**3. Business Card Send** (new task)
- For each lead with `outreach_eligible = true` and `business_card_sent_at = NULL`
- Send Business Card email (separate template from recognition email)
- Record `sent_at` timestamp
- Track engagement (opens, clicks)

**4. Postcode Intelligence Refresh** (new task)
- For each unique postcode in discovered_businesses:
  - Count qualified opportunities
  - Count active drivers within 10 miles
  - Count journey demand (standing orders)
  - Calculate revenue potential
  - INSERT/UPDATE postcode_intelligence table

**5. Engine C: Opportunity Expansion Scoring** (new task)
- For each qualified business:
  - Analyze multi-site potential (address patterns, reviews mentioning branches)
  - Analyze referral potential (review language indicating recommendations)
  - Analyze partnership potential (category fit with other services)
  - Analyze decision-maker density (large org = more contacts)
  - Store scores in qualified_businesses columns

---

## SYSTEMS TO EXTEND (NOT CREATE NEW)

✅ **Use existing four-layer pipeline**
- Discovery (persist everything)
- Enrichment (extract signals)
- Qualification (score)
- Promotion (but make selective, not automatic)

✅ **Use existing scoring engine**
- Add new dimensions for Engine C
- Add tier logic
- Do not create parallel scoring system

✅ **Use existing lead intelligence**
- Preserve business_evidence, human_observations, business_timeline
- Add qualification_tier, outreach_eligible flags
- Do not create duplicate intelligence layers

✅ **Use existing personalization**
- Preserve prospect brief generation
- Preserve email personalization
- Preserve engagement tracking
- Add Business Card email (new template, same personalization engine)

✅ **Use existing orchestration**
- Extend daily task list
- Preserve all existing automation
- Add new tasks (tier assignment, Business Card send, postcode intelligence)

---

## DECISION REQUIRED BEFORE IMPLEMENTATION

**Question 1: Outreach Eligibility Logic**

Should outreach eligibility be:

A. Operator-controlled (operator explicitly selects which qualified businesses to reach out to)
B. Automated (certain tier thresholds or engagement signals automatically qualify for outreach)
C. Hybrid (Tier A auto-qualified, Tier B/C requires operator approval, Tier D never outreach)

**Question 2: Business Card Email Template**

Should Business Card be:

A. Completely separate email type (new template, separate send process)
B. Variant of recognition email (same infrastructure, different template)
C. Pre-recognition touch (sent before driver assignment, different rules)

**Question 3: Postcode Intelligence Storage**

Should postcode intelligence be:

A. Materialized view (computed on-demand from existing tables)
B. Cached nightly (separate table, updated by orchestration)
C. Real-time queries (computed as needed, cached in application layer)

**Question 4: Engine C Scope**

Should opportunity expansion signals be:

A. Numeric scores added to qualification (branch_potential: 0-100, etc.)
B. Tags/labels on business (multi_site_tag, referral_tag, etc.)
C. Both (scores for ranking, tags for operator visibility)

---

## SUMMARY

**Existing systems:** ✅ 4-layer pipeline, scoring, enrichment, personalization, outreach, activation

**Systems to extend:** Scoring (add dims), qualification (add tiers), promotion (make selective), lead intelligence (add flags)

**Systems to create:** Business Card system, outreach eligibility logic, postcode intelligence hub

**Risk level:** LOW (all extensions are additive, no breaking changes to existing flows)

**Revenue impact:** TIER 1 (improves discovery, qualification, outreach, activation quality)

---

**Ready for decision questions above before implementation begins.**

