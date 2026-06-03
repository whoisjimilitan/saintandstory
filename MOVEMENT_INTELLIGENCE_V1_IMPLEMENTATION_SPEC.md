# MOVEMENT INTELLIGENCE V1 - IMPLEMENTATION SPECIFICATION

## CORE PRINCIPLE: READ-ONLY, ISOLATED LAYER

Movement Intelligence V1 is a **pure read-only overlay** that sits on top of the existing B2B system.

```
Discovery System: UNCHANGED
    ↓
Lead Storage: UNCHANGED
    ↓
B2B Dashboard: EXISTING UI + NEW TOGGLE BUTTON
    ↓
    └─→ Toggle OFF: View leads as normal (no change)
    └─→ Toggle ON: Overlay shows possible movements (new)
    
Movement Intelligence calculates movements on-demand.
No database writes.
No side effects.
No changes to discovery.
```

**This specification defines exactly what will be built, changed, added, and tested.**

**Everything NOT listed below remains UNTOUCHED.**

---

## WHAT WILL BE ADDED

### 1. NEW FILE: `lib/movement-intelligence.ts`

**Purpose**: Movement definition library (rule-based, read-only, no AI)

**What it does**:
- Takes: `businessCategory` (string)
- Returns: Array of possible movements
- No database access
- No API calls
- Pure function (deterministic)
- Generates on-demand when dashboard loads

**Structure**:
```typescript
export interface MovementDefinition {
  type: string;
  firstQuestion: string;  // Most important field
  whyWeBelieveThis: string[];
  trigger: string;
  frequency: {
    estimate: string;
    typical_min: number;
    typical_max: number;
    unit: "per_week" | "per_month";
  };
  courierValuePerMove: {
    low: number;
    high: number;
    currency: string;
  };
  estimatedMonthlyValue: {
    low: number;
    high: number;
    currency: string;
  };
  recommendedAction: "CALL_TODAY" | "VISIT" | "EMAIL_SEQUENCE" | "MONITOR";
  confidenceNote: string; // "This is a sales hypothesis, not confirmed activity"
}

export function getMovementsForBusiness(businessCategory: string): MovementDefinition[] {
  // Pure function
  // No database calls
  // No side effects
  // Returns array of possible movements
}
```

**Lines of code**: ~300-400 (movement definitions only)

**Production risk**: ZERO (no database access, no API calls, pure function, no writes)

---

### 2. NO CHANGES TO: `app/api/b2b/discover/route.ts`

**Discovery workflow remains exactly as-is:**

```typescript
// UNCHANGED
await sql`
  INSERT INTO b2b_leads (
    business_name, business_category, email, phone, city,
    website, google_place_id, pain_point, pain_point_review, review_rating,
    source, status, niche, landing_page_url
  ) VALUES (
    ${place.name}, ${niche}, null, ${place.formatted_phone_number ?? null}, ${addressCity},
    ${place.website ?? null}, ${place.place_id}, ${painPoint}, ${reviewText ?? null},
    ${rating ?? null}, 'discovery', 'new', ${niche},
    ${`${BASE_URL}/b2b/${niche}`}
  )
`;
// No movement intelligence writes
// No side effects
// Discovery returns to frontend
```

**Why**: Discovery is working. Don't touch it. Movement intelligence runs later on dashboard load.

**Production risk**: ZERO (no changes to discovery)

---

### 3. NEW COMPONENT: `components/LeadMovementView.tsx`

**Purpose**: Display movements for a discovered lead (read-only overlay)

**What it does**:
- Takes: `lead` object with business_category
- Calls: `getMovementsForBusiness(business_category)` 
- Displays: List of possible movements
- No database access
- No writes
- Pure presentation layer

**What it shows**:
```
WILSON SOLICITORS

POSSIBLE MOVEMENTS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

COURT FILING DOCUMENTS

First Question to Ask:
How do urgent court filings currently get to court?

Why We Think This Might Apply:
✓ Business category: Solicitor
✓ Likely litigation practice
✓ Multi-office operation (estimated)

Trigger: Legal deadline (strict, no flexibility)

Frequency:
Estimated: 10-20 per month
Value per move: £150-250
Estimated monthly: £1,500-5,000

Recommended Action: CALL TODAY

Confidence:
This is a sales hypothesis based on business category.
Not confirmed by actual company data.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

[CALL] [EMAIL] [SKIP] [HIDE MOVEMENTS]
```

**Props**:
```typescript
interface LeadMovementViewProps {
  lead: {
    business_name: string;
    business_category: string;
  };
  onCall?: (movement: MovementDefinition) => void;
  onEmail?: (movement: MovementDefinition) => void;
  onSkip?: (movement: MovementDefinition) => void;
}
```

**Lines of code**: ~200-250

**Production risk**: ZERO (UI component, read-only, no database access, no writes)

---

### 4. MINIMAL CHANGE: `app/dashboard/admin/b2b/page.tsx`

**Current**: Renders existing B2BPipeline (unchanged)

**New**: Add toggle button "Show Movements" that displays LeadMovementView overlay

**What changes**: 
- Add toggle state: `showMovements: boolean`
- Add conditional render:
```typescript
{showMovements ? (
  <LeadMovementView lead={lead} />
) : (
  <ExistingLeadDisplay lead={lead} />
)}
```

**What DOESN'T change**:
- Database schema
- Prisma models
- Discovery workflow
- Lead creation
- Lead display logic
- Status field logic
- All existing functionality

**Production risk**: ZERO (overlay only, existing UI completely untouched)

---

## WHAT WILL NOT CHANGE

### ✅ UNTOUCHED: `lib/b2b-schema.ts`

- No table changes
- No column additions
- No Prisma schema modifications
- `business_evidence` column structure: **UNCHANGED**

### ✅ UNTOUCHED: `app/api/b2b/leads/route.ts`

- No changes to lead retrieval
- No changes to lead updates
- No changes to filtering logic

### ✅ UNTOUCHED: `app/api/dispatch/route.ts`

- No changes to dispatch logic
- No changes to driver assignments
- No changes to customer booking flow
- No changes to job creation
- No changes to earnings calculation

### ✅ UNTOUCHED: Dispatch system

- No changes to driver workflows
- No changes to job status tracking
- No changes to delivery logic
- No changes to earnings

### ✅ UNTOUCHED: Customer-facing features

- No changes to booking flow
- No changes to customer dashboard
- No changes to payments
- No changes to notifications

### ✅ UNTOUCHED: Existing B2B features

- Google Places discovery: **UNCHANGED**
- Lead creation: **UNCHANGED**
- Lead status tracking: **UNCHANGED**
- Outreach system: **UNCHANGED**
- Lead observations: **UNCHANGED**

---

## DATA FLOW

### DISCOVERY FLOW (COMPLETELY UNCHANGED)

```
User clicks "Discover" button
  ↓
POST /api/b2b/discover with { niche, city }
  ↓
✓ Clerk authentication
  ↓
✓ Google Maps API call
  ↓
✓ Database: Insert into b2b_leads
  ↓
✓ Return { count, added }
  ↓
✓ Frontend refresh dashboard

NO CHANGES. NO SIDE EFFECTS. NO MOVEMENT INTELLIGENCE WRITES.
```

### DASHBOARD DISPLAY (READ-ONLY)

```
Load page: GET /app/dashboard/admin/b2b
  ↓
Query: SELECT * FROM b2b_leads WHERE status = 'new'
  ↓
Render: Existing lead list (unchanged)
  ↓
User clicks: "Show Movements" toggle button (NEW)
  ↓
For each lead in view:
  - Read: business_category from lead
  - Call: getMovementsForBusiness(business_category) [PURE FUNCTION]
  - Display: LeadMovementView overlay [READ-ONLY UI]
  ↓
Salesperson sees:
  - Business name
  - Possible movements (read from definitions, not database)
  - First Question to Ask (most important field)
  - Why We Believe This (evidence)
  - Trigger event
  - Estimated frequency and value
  - Confidence disclaimer
  - Call/Email/Skip buttons

NO DATABASE WRITES. NO SIDE EFFECTS. NO DISCOVERY MODIFICATIONS.
```

---

## DATABASE: NO CHANGES

**business_evidence field**: UNCHANGED

All leads continue to be stored exactly as they are today.

Movement intelligence is calculated **on-demand** when the dashboard loads, not stored in the database.

```json
{
  "discovery_data": {
    "google_place_id": "ChIJ...",
    "reviews": [...],
    "rating": 4.7
  }
}
// No changes. No additions.
```

**Why this approach**:
- ✓ Zero schema changes
- ✓ Zero database writes
- ✓ Movement definitions easy to update (just edit lib/movement-intelligence.ts)
- ✓ Movement definitions easy to delete (no database cleanup needed)
- ✓ Read-only layer (no risk of data corruption)
- ✓ Discovery remains completely isolated

---

## PRODUCTION RISK ASSESSMENT

| Component | Change | Risk | Reason |
|-----------|--------|------|--------|
| `movement-intelligence.ts` | NEW (pure function) | **ZERO** | No database access, no API calls, no side effects |
| `discover/route.ts` | **NONE** | **ZERO** | Discovery workflow completely unchanged |
| `LeadMovementView.tsx` | NEW (UI component) | **ZERO** | Read-only, no database access, no writes |
| `b2b/page.tsx` | Add toggle button | **ZERO** | Additive only, overlay doesn't affect existing view |
| `b2b-schema.ts` | **NONE** | **ZERO** | No changes |
| Database schema | **NONE** | **ZERO** | No changes |
| Database writes | **NONE** | **ZERO** | Read-only layer only |
| Prisma | **NONE** | **ZERO** | No changes |
| Dispatch system | **NONE** | **ZERO** | No changes |
| Jobs/Drivers/Earnings | **NONE** | **ZERO** | No changes |

**Overall Risk**: **MINIMAL**

**Why**: 
- Discovery system completely untouched (the most critical path)
- No database writes (pure calculation layer)
- No schema changes
- Overlay feature can be hidden with a single toggle
- Can be rolled back instantly by removing UI toggle

---

## TESTING PLAN: NEON CHILD BRANCH

### Step 1: Create Child Branch

```bash
# Create Neon child branch from production
vercel env list  # confirm current environment

neon branches create --parent main --name movement-intelligence-v1

# Update .env.local with child branch DATABASE_URL
```

### Step 2: Deploy to Staging

```bash
git checkout -b feat/movement-intelligence-v1

# Commit changes:
# - lib/movement-intelligence.ts (NEW)
# - app/api/b2b/discover/route.ts (MODIFIED - add movements)
# - components/B2BMovementPanel.tsx (NEW)
# - app/dashboard/admin/b2b/page.tsx (MODIFIED - add display)

git add .
git commit -m "feat: add movement intelligence v1 (staging only)"

# Deploy to preview environment (not production)
vercel --debug
```

### Step 3: Test Discovery Workflow (UNCHANGED)

```
1. Open dashboard
2. Click "Discover" → Solicitors in London
3. Wait for discovery to complete
4. Verify leads appear in database:

   SELECT COUNT(*) FROM b2b_leads WHERE niche = 'legal';

5. Verify discovery returns as it always has
6. Verify no performance impact
7. Verify dispatch system untouched
```

### Step 4: Test Movement Intelligence Overlay (NEW)

```
1. Navigate to B2B dashboard
2. View newly discovered leads
3. Click "Show Movements" toggle button (NEW)
4. For each solicitor, verify LeadMovementView shows:
   - Business name
   - "Court Filing Documents" movement appears
   - "First Question to Ask" (most important field)
   - "Why We Believe This" evidence is clear
   - Trigger event shown
   - Frequency breakdown shown
   - Monthly value range shown
   - Confidence disclaimer shown
   - Call/Email/Skip buttons work
5. Click "Hide Movements" - returns to standard view
6. Verify existing lead display is unchanged
```

### Step 5: Verify No Production Changes

```bash
# Compare schema before/after
psql $DATABASE_URL -c "\dt b2b_leads"  # Same structure
psql $DATABASE_URL -c "\d b2b_leads"   # No new columns

# Verify discovery system still works
# Verify dispatch system untouched
# Verify existing leads unchanged
# Verify outreach system unchanged
```

### Step 6: Create Impact Report

Document:
- Lines of code added
- Files modified
- Database schema changes: ZERO
- Production risk: VERY LOW
- Movement detection accuracy (manual spot check)
- Dashboard display quality

---

## IMPACT REPORT TEMPLATE

```
MOVEMENT INTELLIGENCE V1 - IMPACT REPORT

Date: [Testing date]
Branch: movement-intelligence-v1
Database: Neon child branch

IMPLEMENTATION SUMMARY
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Files Added:
  ✓ lib/movement-intelligence.ts (350 LOC)
  ✓ components/B2BMovementPanel.tsx (220 LOC)

Files Modified:
  ✓ app/api/b2b/discover/route.ts (+15 LOC)
  ✓ app/dashboard/admin/b2b/page.tsx (+10 LOC)

Total Lines Added: 595
Total Lines Modified: 25

SCHEMA & DATABASE IMPACT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

New Tables: ZERO
New Columns: ZERO
Schema Migrations: ZERO
Prisma Changes: ZERO
Database Risk: ZERO

Changes to business_evidence JSON: 
  Added: movement_intelligence_v1 key
  Type: ADDITIVE (no existing data modified)
  Risk: ZERO

DISPATCH SYSTEM IMPACT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Changes to dispatch/route.ts: ZERO
Changes to driver workflows: ZERO
Changes to job creation: ZERO
Changes to earnings: ZERO
Impact: ZERO

DISCOVERY SYSTEM IMPACT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Google Places API calls: UNCHANGED
Discovery workflow: UNCHANGED
Lead creation: UNCHANGED
Discovery performance: UNCHANGED

TEST RESULTS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Discovered 50 solicitors: ✓
Movement detection: ✓ (100% solicitors detected court filings)
Dashboard rendering: ✓ (movements display correctly)
"Why We Believe This": ✓ (evidence shown)
Opening questions: ✓ (relevant and specific)
No schema changes: ✓ (confirmed)
No dispatch changes: ✓ (confirmed)
Discovery still works: ✓ (confirmed)

PRODUCTION READINESS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Risk Level: VERY LOW
  - No schema changes
  - No dispatch changes
  - Pure additive (JSON field only)
  - Can be rolled back instantly

Recommendation: APPROVED FOR PRODUCTION

Rollback Plan:
  If issues arise, remove:
  - lib/movement-intelligence.ts
  - B2BMovementPanel.tsx references
  - JSON update in discover/route.ts
  Data remains unchanged, no migrations needed
```

---

## SUCCESS METRICS

### Week 1: Discovery & Validation

```
Metric: Movement Detection Accuracy

Target: 100% of solicitors show "Court Filing Documents" movement
Result: [TBD - after testing]

Target: 90% of estate agents show "Property Completion" movement
Result: [TBD - after testing]

Target: Dashboard renders without errors
Result: [TBD - after testing]
```

### Week 2: Sales Usage

```
Metric: Salesperson Adoption

Discover: 50 solicitors
Movements detected: 48 (96%)
Sales team calls: 15 (30% of discovered)

Question used: "How are you handling court filing deadlines?"
Conversational openness: [Qualitative feedback]
```

### Week 3: Revenue Impact

```
Metric: Trial Conversion

Calls made: 15
Trials offered: 3 (20%)
Trials accepted: 2 (13%)

Outcome: 2 trials → 1 becomes standing order
Monthly value: £2,000–£5,000
```

---

## APPROVAL CHECKLIST

Before production deployment, confirm:

**Code Quality**
- [ ] All code reviewed
- [ ] lib/movement-intelligence.ts complete
- [ ] LeadMovementView component complete
- [ ] Dashboard toggle button complete

**Testing**
- [ ] Testing completed in Neon child branch
- [ ] Discovery workflow works exactly as before (no changes)
- [ ] Movement overlay renders correctly
- [ ] "First Question to Ask" field is clear
- [ ] "Why We Believe This" evidence is compelling
- [ ] Confidence disclaimer is visible
- [ ] All movement types tested
- [ ] Call/Email/Skip buttons work

**Database & Infrastructure**
- [ ] Schema verified: ZERO CHANGES
- [ ] Database verified: ZERO WRITES (read-only layer)
- [ ] Prisma verified: UNCHANGED
- [ ] Dispatch system verified: UNTOUCHED
- [ ] Jobs system verified: UNTOUCHED
- [ ] Drivers system verified: UNTOUCHED
- [ ] Earnings system verified: UNTOUCHED

**Discovery System**
- [ ] Discovery workflow verified: UNCHANGED
- [ ] Discovery performance verified: NO IMPACT
- [ ] Existing discovery functionality: OPERATIONAL
- [ ] No side effects in discovery path

**Deployment**
- [ ] Impact report generated
- [ ] Screenshots provided (dashboard with/without movements)
- [ ] Rollback plan documented
- [ ] Ready for production: YES / NO

---

## POST-DEPLOYMENT MONITORING

### Day 1-2

- Monitor: No schema errors
- Monitor: Discovery workflow functioning
- Monitor: Movement detection running
- Check: Neon database for correct JSON structure

### Week 1

- Track: Movement detection accuracy
- Track: Salesperson usage (dashboard views)
- Track: Call volume using suggested openings
- Gather: Feedback on "Why We Believe This" clarity

### Week 2+

- Track: Trial conversion rate
- Track: Standing order conversion rate
- Measure: Revenue impact
- Decide: Ready to expand or iterate?

---

## NEXT STEPS

### If Successful (1+ standing orders closed)

Expand V1 with:
- Trigger detection from review text
- Seasonal adjustments
- More detailed frequency modeling
- Additional movement types
- Standing order probability scoring

### If Unsuccessful (0 standing orders closed)

Iterate V1 with:
- Different opening questions
- Revised movement types
- Additional "Why We Believe This" signals
- Or: Return to discovery-only mode, reassess

---

## FINAL PRINCIPLE

This specification ensures that:

✓ Movement Intelligence V1 is **isolated and additive**  
✓ **Zero production schema changes**  
✓ **Zero dispatch system impact**  
✓ **Complete rollback capability**  
✓ **Immediate revenue validation**  
✓ **Safe to test and iterate**  

The feature lives entirely in the JSON layer.

Everything else remains untouched.

