# PROJECT STATE: B2B Pressure Intelligence System

**Status**: Phase 1 Complete - Pressure Detection Validated
**Last Updated**: 2026-06-02
**Owner**: James (Saint & Story Admin)

---

## PROJECT VISION

Saint & Story is a concierge moving company. James (the admin) controls all job matching and customer acquisition. The core business model:
- Drivers pay £9.99/month subscription, keep 100% of job earnings
- James earns from subscriptions + matching efficiency

**The B2B Opportunity**: Recurring business customers (standing orders) = predictable revenue + lower acquisition costs.

### What Problem Are We Solving?

James needs to identify which businesses are:
1. Under operational pressure
2. Capable of recurring orders
3. Ready to have a conversation about solutions

Not all businesses with problems are buyers. **Pressure is the leading indicator.** A business under pressure is more likely to invest in solutions before pain becomes catastrophic.

### Why Standing Orders Matter

- **For Saint & Story**: Recurring revenue, lower customer acquisition cost, predictable logistics
- **For Businesses**: Removes unpredictable delivery chaos, outsources logistics complexity
- **For Drivers**: More consistent workload, higher earnings predictability

---

## CORE PHILOSOPHY

### The Learning Framework

Evidence → Questions → Conversations → Proposals → Conversions

Not: Evidence → Conclusions → Proposals

**Why this matters**:
- **Evidence stays permanent**: "3 reviews mention 'wedding bouquets,' 'bridesmaids,' 'buttonholes'"
- **Questions are temporary**: "Does this business do wedding work?" (answer: yes, move to next question)
- **Conversations are discoveries**: "Which parts of wedding coordination stress you most?" (answer reveals true pain)
- **Proposals are solutions**: Only after we understand the problem

### Core Principles

1. **Evidence First, Opinions Never**
   - A review snippet is evidence
   - "Owner seems stressed" is opinion
   - Store only facts, hypotheses are temporary

2. **Questions > Scores**
   - A question creates a conversation
   - A score creates a label
   - Never tell James "This business scores 87 on pain" — instead tell him "Ask this question to find out"

3. **Conversations > Proposals**
   - A proposal before discovery is guessing
   - A conversation reveals the real opportunity
   - Ask before solving

4. **Learning > Automation**
   - The system should help James learn about businesses
   - Not replace James' judgment with automation
   - Human observations > algorithmic conclusions

---

## CURRENT ARCHITECTURE

### Data Flow

```
Google Places API
    ↓
[searchPlaces] → Find 20 businesses matching query
    ↓
[getPlaceDetails] → Extract reviews, rating, info for each
    ↓
[ReviewSnippets] → Store as ReviewSnippet objects
    ↓
[generateRevelatoryAnalysis] → Build hypotheses from evidence
    ↓
[Output] → Conversation Potential ranking
    ↓
James → Call businesses in order
```

### Key Components

#### 1. Google Places Integration
**File**: `lib/google-places.ts`
**Purpose**: Fetch real business data from Google Maps
**Inputs**: 
- Query (e.g., "florist")
- Location (e.g., "Manchester, UK")
**Outputs**: 
- PlacesSearchResult[] (20 matching businesses)
- PlacesDetails (full business info + reviews)
**Current State**: Working, no mock fallback
**Limitations**: Limited to ~5 reviews per business (Google API limitation)

#### 2. Evidence Extractor
**File**: `lib/evidence-extractor.ts`
**Purpose**: Convert Google Places data to internal ReviewSnippet format
**Inputs**: PlacesDetails object
**Outputs**: ReviewSnippet[], BusinessFacts[]
**Current State**: Functional
**Limitations**: Basic extraction, no semantic understanding

#### 3. Research Endpoint
**File**: `app/api/research/florist-evidence/route.ts`
**Purpose**: Collect evidence from 20 businesses with manual annotation
**Inputs**: Query, location
**Outputs**: Array of evidence with human annotation
**Current State**: Working well for exploratory analysis
**Limitations**: Manual annotation, doesn't scale

#### 4. Pressure Intelligence Engine
**File**: `lib/revelatory-engine.ts`
**Purpose**: Transform evidence into hypotheses about business pressure
**Inputs**: BusinessEvidence (reviews + facts)
**Outputs**: Hypotheses ranked by confidence
**Current State**: Experimental but validated
**Key Output**: RevelatoryAnalysis with:
  - pressureHypotheses (Tier 1: seasonal peaks, weddings, last-minute demand)
  - constraintHypotheses (Tier 2: owner dependency, manual work)
  - opportunityHypotheses (Tier 3: delivery challenges)
**Limitations**: Only 5 reviews per business, may miss patterns

#### 5. Hypothesis Framework
**Interfaces**: 
```typescript
interface Hypothesis {
  statement: string              // "Wedding orders require high coordination"
  evidence: ReviewSnippet[]      // Actual reviews that support it
  confidence: 'low'|'medium'|'high'  // Based on evidence count
  howToValidate: string          // Question to ask the owner
}
```
**Current State**: Core framework for all analysis
**Key Principle**: Evidence stays separate from conclusions

#### 6. Question Generation Engine
**File**: `lib/revelatory-engine.ts` (embedded)
**Purpose**: Generate the first valuable question based on confirmed hypotheses
**Logic**: 
- If owner-dependent + high pressure → Ask about owner involvement
- If seasonal peaks confirmed → Ask about Mother's Day stress
- If last-minute demand → Ask about 24-hour requests
**Current State**: Working, validated
**Limitations**: Only generates one question per business (intentional — start conversations, don't overwhelm)

#### 7. Validation Endpoint
**File**: `app/api/validate/report/route.ts`
**Purpose**: Run full analysis on 10 businesses, rank by conversation potential
**Inputs**: Query, location
**Outputs**: JSON array with:
  - Business name, rating, review count
  - Conversation Potential (high/medium/low)
  - Why this ranking
  - Pressure hypotheses with evidence counts
  - Constraint hypotheses with evidence counts
  - First question to ask
**Current State**: Core validation tool
**Usage**: `curl http://localhost:3000/api/validate/report?query=florist&location=Manchester`

#### 8. Lead Intelligence View (Future)
**File**: `/app/dashboard/admin/b2b/lead/[id]/page.tsx`
**Purpose**: Show James the full analysis for a specific business
**Current State**: Skeleton exists, not integrated with new system
**Limitation**: Needs update to use new hypothesis framework

#### 9. Human Observations Capture (Future)
**File**: `/app/api/b2b/observations/route.ts`
**Purpose**: James records observations about conversations
**Current State**: Skeleton exists
**Limitation**: Not yet integrated with analysis system

#### 10. Proposal Generation System (Deprecated)
**File**: `lib/proposal-engine.ts`
**Status**: Still exists but deprioritized
**Reason**: We discovered proposals should come AFTER conversations, not before
**Future**: Only use after James talks to the business

---

## WHAT EXISTS NOW

✅ Evidence collection from Google Places (real API)
✅ Hypothesis generation framework (low/medium/high confidence)
✅ Pressure detection (Tier 1: seasonal, wedding, last-minute)
✅ Constraint detection (Tier 2: owner-dependent, manual work)
✅ Conversation potential ranking (high/medium/low)
✅ First question generation
✅ Validation endpoint for testing
✅ Research endpoint for exploratory analysis

---

## WHAT DOES NOT EXIST YET

❌ Multi-question conversations (currently only one opening question)
❌ Conversation tracking (recording what James discusses)
❌ Proposal generation from conversation data
❌ Conversion tracking
❌ Automated follow-up sequences
❌ Dashboard integration
❌ Database persistence (currently API-only)
❌ Lead management system
❌ Analytics on conversion rates

---

## WHAT IS WORKING

✅ Identifying high-pressure businesses (Northern Flower, The Flower Lounge)
✅ Separating evidence from hypotheses
✅ Generating questions from confirmed pressure signals
✅ Ranking businesses by conversation potential
✅ Honest confidence levels (not fake precision)

---

## WHAT IS EXPERIMENTAL

🧪 Hypothesis confidence levels (low/medium/high) — needs more validation data
🧪 Conversation potential scoring algorithm — currently simple, may need refinement
🧪 Evidence annotation rules — currently pattern-matching, may miss subtle signals
🧪 Tier-based framework (Tier 1, 2, 3) — not yet validated across multiple niches

---

## TECH STACK

- **Frontend**: Next.js 15 (App Router), React, TypeScript
- **Backend**: Next.js API routes, TypeScript
- **External**: Google Places API (real data), Neon PostgreSQL (not yet integrated)
- **Authentication**: Clerk
- **Deployment**: Vercel

---

## KEY FILES

```
lib/
  ├── revelatory-engine.ts        # Core hypothesis engine
  ├── evidence-types.ts            # TypeScript interfaces
  ├── google-places.ts             # Google API integration
  ├── evidence-extractor.ts        # Evidence conversion
  └── proposal-engine.ts           # (deprecated, but kept)

app/api/
  ├── validate/report/route.ts     # Validation endpoint
  ├── research/florist-evidence/   # Research endpoint
  └── b2b/observations/route.ts    # (future integration)

docs/
  ├── PROJECT_STATE.md             # This file
  ├── DECISIONS.md                 # Major decisions
  ├── LEARNINGS.md                 # Validation findings
  ├── PRESSURE_FRAMEWORK.md        # Framework documentation
  └── NEXT_STEPS.md                # What to build next
```

---

## CURRENT METRICS

From the first validation run (10 Manchester florists):

- **High Conversation Potential**: 2 businesses
- **Medium Conversation Potential**: 4 businesses
- **Low Conversation Potential**: 4 businesses

High-potential businesses show:
- 100+ reviews (strong evidence base)
- Wedding work confirmed (multiple mentions)
- Owner personally involved (3+ review mentions)
- Manual coordination evident (email/custom requests)

---

## SUCCESS METRICS (Future)

Not yet implemented, but define success as:

1. **Conversation Rate**: % of businesses James calls that pick up
2. **Conversion Rate**: % of conversations that lead to standing orders
3. **Lead Quality**: % of recommendations that turn into customers
4. **Question Effectiveness**: % of opening questions that lead to discovery conversations (vs. dead ends)

---

## HOW TO RESTORE THIS PROJECT

If someone new arrives tomorrow:

1. Read `PHASE_1_SUMMARY.md` (5 min)
2. Read `RESTORE_POINT.md` (2 min)
3. Read `DECISIONS.md` to understand why things were done this way (15 min)
4. Read `PRESSURE_FRAMEWORK.md` to understand the core model (10 min)
5. Look at `VALIDATION_BASELINE.md` to see what was tested (10 min)
6. Run validation yourself: `curl http://localhost:3000/api/validate/report?query=florist&location=Manchester`
7. Read the code in order: `revelatory-engine.ts` → `google-places.ts` → `validate/report/route.ts`

Total: ~45 minutes to full context.
