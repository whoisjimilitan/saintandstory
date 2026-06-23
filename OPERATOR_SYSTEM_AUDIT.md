# OPERATOR SYSTEM AUDIT

**Date:** June 23, 2026  
**Status:** Discovery phase complete  
**Objective:** Understand existing system before wiring in new reasoning engine  

---

## PART 1: WHAT I UNDERSTAND

### The 7-Step Workflow (Live & Operational)

```
1. DISCOVER
   └─ Find businesses
   └─ Methods: Google Places (keyword, postcode), Dork search, Pipeline import
   └─ Operator sees: Business name, city, contact, industry, pain point from reviews
   └─ Output: Lead records in database

2. UNDERSTAND
   └─ Qualify if they fit
   └─ Operator: Sets confidence score (1-100) + notes
   └─ Current reasoning: None (operator judgment only)
   └─ Status change: new → contacted

3. OUTREACH
   └─ Send first email
   └─ System generates email draft with subject + body
   └─ Pressure types: "recognition" | "transformation" | "logical"
   └─ Variants: "A" | "B"
   └─ Operator: Reviews, edits, sends

4. RESPONSES
   └─ Track replies
   └─ Operator reads replies, marks engagement
   └─ Status change: contacted → warm → inbound

5. ORDERS
   └─ Track first booking and standing orders
   └─ Operator creates standing order record
   └─ Status change: inbound → closed (or dead)

6. INTELLIGENCE
   └─ See all prospects with engagement scores
   └─ Filter by: Hot (80+), Warm (60-80), Cool (40-60), Cold (<40)
   └─ Current reasoning: Engagement score only (no deeper intelligence)

7. ANALYTICS
   └─ See pipeline health, team performance
```

### The Operator Interface

**Homepage (Morning Brief):**
- Shows today's stats: new prospects, high-confidence, finished, closed
- Temperature breakdown (Ultra Hot, Hot, Warm)
- Industry breakdown
- Pipeline confidence chart (Discover → Enrich → Qualify → Propose → Orders)

**Navigation:**
- `/operator/discover` - Find businesses, review before qualify
- `/operator/understand` - Show prospect details, set confidence, add notes
- `/operator/outreach` - Review email draft, edit, send
- `/operator/responses` - Monitor replies
- `/operator/pipeline` - See stage progression
- `/operator/orders` - Manage standing orders & bookings
- `/operator/intelligence` - See all prospects by engagement score
- `/operator/analytics` - Team and campaign performance
- `/operator/settings` - Configuration

---

## PART 2: WHAT EXISTS

### Database Schema (Lead)

```typescript
interface Lead {
  // Core
  id: string
  business_name: string
  business_category: string
  email: string
  created_at: string
  status: "new" | "contacted" | "warm" | "inbound" | "closed" | "dead" | "recognized"
  lead_state: LeadState
  transitioned_at: string | null

  // Extended
  contact_name?: string
  phone?: string
  city?: string
  delivery_type?: string
  delivery_frequency?: string
  average_deliveries?: string
  courier_provider?: string
  delivery_challenge?: string
  pain_point?: string
  pain_point_review?: string
  review_rating?: number
  website?: string
  google_place_id?: string
  niche?: string
  notes?: string
  source?: "inbound" | "manual" | "discovery"
  trigger_event_matched?: string
  email_sent_at?: string
  engagement_score?: number
  last_engagement_at?: string | null
  opportunity_score?: number
  human_observations?: Record<string, unknown>[]
  business_evidence?: BusinessEvidence
}

interface StandingOrder {
  id: string
  lead_id: string
  business_name: string
  frequency: string
  day_of_week?: number
  preferred_time?: string
  price?: number
  notes?: string
}
```

### API Routes (Live)

**Discovery:**
- `GET /api/b2b/discover` - List all discovered prospects (with filters)
- `POST /api/b2b/discover/search` - Google Places search
- `POST /api/b2b/discover/import` - CSV/API import

**Enrichment:**
- `GET /api/b2b/prospect/{id}` - Get prospect details
- `POST /api/b2b/enrich` - Add enriched data (manual or system)

**Qualification:**
- `POST /api/b2b/qualify` - Mark prospect as qualified (set confidence score + notes)
- `POST /api/b2b/batch-qualify` - Batch qualify multiple

**Outreach:**
- `GET /api/b2b/outreach/{id}` - Get generated email draft
- `POST /api/b2b/outreach` - Send email
- `GET /api/b2b/outreach-events` - Track opens, replies, bounces

**Intelligence:**
- `GET /api/b2b/intelligence/prospect-brief?lead_id=X` - AI brief (DORMANT - not auto-called)
- `GET /api/b2b/intelligence/heat-score` - Engagement scoring

**Standing Orders:**
- `GET /api/b2b/standing-orders` - List all
- `POST /api/b2b/standing-orders` - Create new
- `PATCH /api/b2b/standing-orders/{id}` - Update

---

## PART 3: WHAT'S CURRENTLY BEING REASONED (Minimal)

### Intelligence Layer (Mostly Dormant)

**Currently Active:**
1. **Engagement Score** - Simple calculation
   - Based on: email open, reply, booking
   - Range: 0-100
   - Labels: Hot (80+), Warm (60-80), Cool (40-60), Cold (<40)

2. **Email Draft Generation** (prospect-brief-ai.ts - NOT auto-called)
   - Input: Lead data
   - Output: Email subject + body
   - Pressure types: recognition, transformation, logical
   - Status: Code exists but route is marked "DORMANT - manual research only"

3. **Opportunity Score** (Field exists but not calculated)

**Currently Dormant:**
- `prospect-brief-ai.ts` - Has reasoning code but not called
- `industry-intelligence.ts` - Has logic but not integrated
- `business-intelligence.ts` - Schema exists but unused
- `movement-intelligence.ts` - Not found in active routes
- `validation-intelligence.ts` - Not found in active routes

### What's Missing

- ✗ Relationship stage assessment (0-6 progression)
- ✗ Trust scoring system
- ✗ Psychology pattern detection
- ✗ Stakeholder/decision maker mapping
- ✗ Prediction scoring (reply, meeting, deal, churn)
- ✗ Reasoning about why they might switch
- ✗ Strategy recommendation (what to say, when to say it)
- ✗ Revenue traceability (which strategy led to booking)
- ✗ Business graph (persistent understanding per company)
- ✗ Autonomous opportunity detection

---

## PART 4: WHAT NEEDS TO CHANGE

### Change 1: Wire Reasoning into Understand Page

**Current state:**
```
Operator sees:
  - Business name, contact, city
  - Industry, size
  - Pain point (from reviews)
  - Enriched data (decision makers, signals)

Operator does:
  - Manual confidence score (1-100)
  - Manual notes
```

**New state (with reasoning engine):**
```
System shows:
  - All of above +
  - [8-LAYER INTELLIGENCE]
    1. Facts (observed data)
    2. Evidence (sources, confidence)
    3. Reasoning (inferred needs)
    4. Relationship Model (current stage, trust)
    5. Strategy (advancement plan)
    6. Communications (recommended email angle)
    7. Timeline (readiness prediction)
    8. Operator Guidance (why this matters)

Operator review:
  - Reviews the reasoning
  - Adjusts if needed
  - Approves to proceed
  - Confirms confidence in reasoning
```

**Implementation:**
- Create API: `GET /api/b2b/intelligence/relationship-analysis?lead_id=X`
- Returns: Full RelationshipIntelligenceObject
- UI component: Shows all 8 layers in clear format
- Operator can: Accept, adjust, or override reasoning

### Change 2: Wire Reasoning into Email Generation

**Current state:**
```
Email draft has:
  - Subject
  - Body
  - Pressure type (recognition/transformation/logical)
  - Variant (A/B)
  
But: No clear connection to prospect understanding
No traceability to strategy
```

**New state (with reasoning engine):**
```
Email generation uses:
  - Identified psychology pattern
  - Relationship stage assessment
  - Trust level
  - Recommended strategy from reasoning
  - Inverse incentives (why they might switch)
  - Best next action

Email includes:
  - Psychology-aware framing
  - Specific pain point reference
  - Credibility signal (based on trust level)
  - Clear call-to-action (based on stage)

Email metadata stored:
  - Psychology pattern used
  - Email version
  - Relationship stage at send
  - Trust score at send
  - Strategy applied
```

**Implementation:**
- Modify: `/api/b2b/outreach/{id}` route
- Call reasoning engine first
- Generate email using intelligence layers
- Store metadata for revenue learning

### Change 3: Add Revenue Traceability

**Current state:**
```
Booking recorded:
  - Lead ID
  - Booking amount
  - Date

But: No connection to:
  - Which discovery method found them
  - Which reasoning strategy was used
  - Which email version was sent
  - Which psychology pattern was detected
  - How long it took (discovery → booking)
```

**New state (with reasoning engine):**
```
Every booking records:
  - Lead ID, amount, date
  + Discovery method (postcode search, keyword, dork, import)
  + Relationship stage when contacted (stage number)
  + Psychology pattern used (loss-aversion, etc.)
  + Email renderer version
  + Strategy applied
  + Operator name
  + Timing of contact
  + Trust signals leveraged
  + Days from discovery to booking
  + Lifetime value projection
```

**Implementation:**
- Modify: StandingOrder schema to add `traceability` fields
- Modify: `/api/b2b/standing-orders` route to capture metadata
- Create: `/api/commercial/revenue-memory` API
- Dashboard: Show "why did we make £X this month?"

### Change 4: Add Business Graph

**Current state:**
```
Each lead is isolated:
  - No historical context
  - No signal tracking
  - No expansion planning
  - No player tracking
  - No "likely to switch" reasoning
```

**New state (with reasoning engine):**
```
Each business becomes a node in a graph:
  - Company name, industry, size, location
  - Operational needs (delivery types, frequency, peak days)
  - Current provider and satisfaction
  - Trust level (0-100)
  - Relationship stage (0-6)
  - Recent signals (hiring, expansion, funding)
  - Expansion plans (when? what type?)
  - Key players and their roles
  - Readiness to switch (days until opportunity)
  - Revenue potential (first order, monthly, lifetime)
  - Why they might switch
  - Why they might not
```

**Implementation:**
- Create: `lib/business-graph.ts` class
- Update: `/api/b2b/prospect/{id}` to return graph view
- Add UI: Business Graph viewer in Understand page
- Automatic: Update signals as new data arrives

### Change 5: Add Autonomous Opportunity Detection

**Current state:**
```
Operator manually:
  - Searches for businesses
  - Reviews each one
  - Decides which to contact
```

**New state (with reasoning engine):**
```
System automatically:
  - Monitors for new signals (hiring, expansion, funding, complaints)
  - Identifies businesses in opportunity window
  - Ranks by revenue potential + conversion likelihood
  - Presents top N opportunities to operator

Operator sees each morning:
  "Found 127 businesses likely to need drivers this week.
   Recommend contacting these 19 first.
   Expected revenue: £18,900.
   Here's why each one is ready."
```

**Implementation:**
- Create: `/api/autonomous/opportunities` route
- Implement: Market signal monitoring
- Implement: Opportunity ranking
- UI: New "Opportunities" tab in operator dashboard

---

## PART 5: INTEGRATION POINTS

### Where the Reasoning Engine Gets Called

```
1. UNDERSTAND PAGE
   └─ When operator views prospect
   └─ Call: /api/b2b/intelligence/relationship-analysis?lead_id=X
   └─ Show: All 8 layers in UI
   └─ Operator: Reviews, accepts, proceeds to outreach

2. OUTREACH GENERATION
   └─ When operator goes to send email
   └─ Call: Reasoning to get strategy + psychology
   └─ Generate: Email using intelligence
   └─ Show: Why this email, why now, what's the strategy
   └─ Operator: Reviews, edits, sends (with metadata stored)

3. REVENUE LEARNING
   └─ When booking created
   └─ Store: All traceability metadata
   └─ Query: /api/commercial/revenue-memory
   └─ Dashboard: Show which strategies/psychology/emails/timing work

4. AUTONOMOUS OPPORTUNITIES
   └─ Each morning (or on demand)
   └─ Call: /api/autonomous/opportunities
   └─ Show: Top 19 businesses, why now, expected revenue
   └─ Operator: Launch outreach on approved opportunities
```

### Data Flow

```
DISCOVER
  ↓ (businesses found)
UNDERSTAND (← REASONING ENGINE #1 shows 8-layer analysis)
  ↓ (operator approves)
OUTREACH (← REASONING ENGINE #2 generates email using psychology/strategy)
  └─ Store: Which psychology, which strategy, which email version
RESPONSES
  ↓ (tracking replies)
ORDERS (← STORE: Revenue traceability metadata)
  ↓
REVENUE MEMORY (← Show: Why this revenue, which strategy worked)
  ↓
CONTINUOUS IMPROVEMENT (← Learn: Improve reasoning for next prospect)
```

---

## PART 6: FILES THAT NEED MODIFICATION

### Files to Modify (Not Change Content)

```
app/operator/understand/page.tsx
  └─ Current: Shows prospect, operator sets confidence
  └─ New: Calls reasoning, shows 8 layers, operator reviews
  └─ Change type: Add rendering, add API call

app/api/b2b/outreach/{id}
  └─ Current: Generates email draft
  └─ New: Uses reasoning to generate email
  └─ Change type: Add intelligence input, add metadata output

app/api/b2b/standing-orders (POST)
  └─ Current: Records booking
  └─ New: Stores traceability metadata
  └─ Change type: Add fields to schema, add fields to insert

app/operator/page.tsx (morning brief)
  └─ Current: Shows pipeline stage counts
  └─ New: Can optionally show top opportunities (future enhancement)
  └─ Change type: No change needed immediately
```

### Files to Create (New)

```
lib/reasoning-engine-integration.ts
  └─ Wires intelligence system into operator workflow
  └─ Provides: getProspectIntelligence(), generateOutreachEmail()

lib/business-graph-manager.ts
  └─ Manages persistent business understanding
  └─ Provides: getBusinessNode(), updateSignals()

lib/revenue-memory-engine.ts
  └─ Tracks revenue back to decisions
  └─ Provides: recordRevenueEvent(), getMemory(), generateInsights()

lib/autonomous-opportunity-engine.ts
  └─ Detects and ranks opportunities
  └─ Provides: findOpportunities(), rankByRevenue()

app/api/b2b/intelligence/relationship-analysis/route.ts
  └─ GET endpoint that returns 8-layer analysis

app/api/autonomous/opportunities/route.ts
  └─ GET endpoint that returns ranked opportunity list

app/api/commercial/revenue-memory/route.ts
  └─ GET endpoint for revenue insights

app/operator/opportunities/page.tsx
  └─ New UI page showing daily opportunities (future)
```

### Files That Stay Untouched

```
✗ Do NOT modify: Discover workflow
✗ Do NOT modify: Responses workflow  
✗ Do NOT modify: Orders workflow
✗ Do NOT modify: Existing API auth/validation
✗ Do NOT modify: Database schema (add fields via migration, don't change existing)
✗ Do NOT modify: UI theme or layout structure
```

---

## PART 7: SUCCESS CRITERIA

### Phase 1: Reasoning in Understand (Week 1)
- Operator goes to Understand page
- Sees 8-layer intelligence analysis
- Can review, adjust, accept
- Confidence in reasoning visible

### Phase 2: Reasoning in Outreach (Week 2)
- Email generation uses psychology + strategy
- Email shows why it was chosen
- Metadata stored (psychology, strategy, version)
- Operator can see reasoning behind email

### Phase 3: Revenue Learning (Week 3)
- Booking records traceability metadata
- Query shows: "Why did we make £X this month?"
- Answer traces back to discovery method, strategy, psychology
- Dashboard shows what works

### Phase 4: Autonomous Opportunities (Week 4)
- System finds 100+ opportunities weekly
- Ranks top 19 by revenue potential
- Operator reviews top opportunities
- Launches outreach with confidence

---

## PART 8: NOT CHANGING

**These are working. Keep them:**

✅ Discovery workflow (Google Places, postcode search, import)  
✅ Response tracking (email opens, replies)  
✅ Orders workflow (standing orders)  
✅ Operator navigation and layout  
✅ Database connection (Neon)  
✅ Authentication (Clerk)  

**We're only adding reasoning underneath. Not replacing the workflow.**

---

## SUMMARY

**What exists:**
- Functional 7-step workflow (Discover → Understand → Outreach → Responses → Orders → Intelligence → Analytics)
- Database stores: Lead status, engagement score, basic enrichment
- Operator dashboard: Morning brief, pipeline view, engagement scores
- Email generation: Basic (subject + body with pressure types)

**What's missing:**
- Reasoning about WHY they need the service
- Prediction of WHEN they're ready
- Strategy for HOW to position solution
- Psychology behind email copy
- Traceability of WHAT strategy led to booking
- Persistence of BUSINESS understanding over time

**What we're adding:**
- 8-layer intelligence analysis (Facts → Evidence → Reasoning → Strategy → Communications → Timeline → Operator Guidance)
- Revenue traceability (every £ traced back to decision)
- Business graph (persistent understanding per company)
- Autonomous opportunity detection (market observation)

**Integration strategy:**
- Modify Understand page to show reasoning
- Modify Outreach to use reasoning for email generation
- Modify Orders to capture traceability
- Add new APIs for intelligence + revenue memory
- No changes to existing workflow structure

---

**Next Step:** Build Phase 1 - Wire reasoning into Understand page

