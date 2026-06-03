# PROSPECT INTELLIGENCE PAGES V1 - FINAL SPECIFICATION

## VISION

On-demand prospect pages. Dynamic assembly. No caching. No storage. 

Every discovered business gets a personalized briefing that feels like "we spent time understanding you" not "we're marketing to your industry."

Every page view is training data.

---

## CORE PRINCIPLES

✓ **On-demand generation**: Pages assembled at request time from business + movements + opportunity engine  
✓ **No database writes**: All logic in request. No caching. No storage.  
✓ **Logic updates instantly**: Change movement intelligence, all pages improve  
✓ **Briefing tone**: Operational, thoughtful, human. Not marketing.  
✓ **Prospect-visible data only**: Name, category, city, website. Hide all internal metrics.  
✓ **Top 3 movements**: Focused, scannable, human.  
✓ **Feedback collection**: Every "yes/partly/no" improves the engine  

---

## DIRECTORY & FILE STRUCTURE

```
/app
├─ /prospect
│  └─ [slug]
│     └─ page.tsx                  # Route handler: on-demand generation
│
├─ /movement
│  └─ [slug]
│     └─ page.tsx                  # (Future: SEO pages)
│
/components
├─ ProspectBriefingPage.tsx        # Render prospect intelligence
├─ MovementLandingPage.tsx         # (Future: movement SEO pages)
├─ Hero.tsx                        # Reusable hero section
├─ StatsStrip.tsx                  # (For future reuse)
├─ Testimonials.tsx                # (For future reuse)
├─ FAQAccordion.tsx                # (For future reuse)
├─ FeedbackButtons.tsx             # Feedback UI (yes/partly/no)
│
/lib
├─ movement-intelligence.ts        # (Existing: returns movements)
├─ opportunity-engine.ts           # (Existing: ranks movements)
├─ movement-pages.ts               # (Future: SEO page data)
├─ prospect-pages.ts               # (New: prospect page helpers)
├─ b2b-schema.ts                   # (Existing: leads query helpers)
│
/api
├─ /prospect-feedback
│   └─ route.ts                    # (New: feedback collection endpoint)
│
/dashboard/admin
├─ b2b/page.tsx                    # (Modify: add prospect brief link)
```

---

## FILES TO CREATE (V1)

### 1. `/app/prospect/[slug]/page.tsx` (80–120 LOC)

**Purpose**: Route handler for on-demand prospect intelligence pages

**Responsibilities**:
- Extract slug from URL params
- Query database for business by slug (public data only)
- Call getMovementsForBusiness(business.category)
- Call rankMovementsByOpportunity(movements, business)
- Take top 3 movements
- Assemble page data object
- Pass to ProspectBriefingPage component
- No caching, no storage

**Dependencies**:
- `lib/b2b-schema.ts` → findBusinessBySlug()
- `lib/movement-intelligence.ts` → getMovementsForBusiness()
- `lib/opportunity-engine.ts` → rankMovementsByOpportunity()
- `components/ProspectBriefingPage.tsx`

**Key constraint**: 
- NO `generateStaticParams()` (dynamic only)
- NO database writes
- NO caching

---

### 2. `/components/ProspectBriefingPage.tsx` (200–250 LOC)

**Purpose**: Render the prospect intelligence briefing

**Layout**:
```
Header (dark)
├─ Navigation (back link, logo)
│
Hero (dark background)
├─ Business name
├─ "We spent time understanding..."
│
Movements Section (light background)
├─ Movement 1
│  ├─ Type (e.g., "Court Filing Deadlines")
│  ├─ Brief description (why it matters)
│  └─ How Saint & Story solves it
├─ Movement 2 (same structure)
├─ Movement 3 (same structure)
│
Feedback Section (light)
├─ "Was this useful?"
├─ Button: Yes, reflects our operation
├─ Button: Partly
├─ Button: Not really
│
Footer (dark)
```

**Tone**: 
- Short sentences
- Operational language
- Zero marketing clichés
- "We understand you" not "We serve your industry"

**Styling**:
- Reuse Saint & Story colors (dark, professional)
- Clean typography
- Scannable layout
- Mobile-first

---

### 3. `/components/FeedbackButtons.tsx` (60–80 LOC)

**Purpose**: Feedback UI component

**Behavior**:
- Three buttons: Yes | Partly | Not really
- On click: POST to /api/prospect-feedback
- Show success message: "Thanks for feedback"
- Track referrer (email vs dashboard vs direct)

**Data sent**:
```json
{
  "slug": "wilson-solicitors",
  "movement_accuracy": "yes|partly|no",
  "timestamp": "ISO",
  "referrer": "email|dashboard|direct"
}
```

---

### 4. `/lib/prospect-pages.ts` (100–150 LOC)

**Purpose**: Helper functions for prospect page generation

**Functions**:

```typescript
// Query business by slug (public data only)
export async function findBusinessBySlug(slug: string) {
  // Query: business_name, business_category, city, website
  // Return: { name, category, city, website }
  // Never: revenue, scores, internal notes
}

// Build brief descriptions for movements in context of business
export function buildMovementBrief(movement, business) {
  // Personalize movement description to business type
  // E.g., for solicitor + court filing:
  //   "When documents must reach court before a specific 
  //    deadline, timing becomes critical."
  // Returns: { type, briefDescription, howWeSolveIt }
}

// Assemble page data (no database writes)
export function buildProspectPageData(business, topMovements) {
  return {
    business,
    movements: topMovements,
    // No additional processing, no storage
  };
}
```

---

### 5. `/api/prospect-feedback/route.ts` (60–80 LOC)

**Purpose**: Collect feedback from prospect pages

**Endpoint**: `POST /api/prospect-feedback`

**Request body**:
```json
{
  "slug": "wilson-solicitors",
  "movement_accuracy": "yes",
  "referrer": "email"
}
```

**Response**:
```json
{
  "success": true,
  "message": "Thank you for feedback"
}
```

**Actions**:
- Insert into feedback table: (slug, movement_accuracy, timestamp, referrer)
- No updates to business record
- No business_evidence modifications
- Just raw feedback data

**Feedback table schema** (minimal):
```sql
CREATE TABLE prospect_feedback (
  id uuid PRIMARY KEY,
  business_slug text,
  movement_accuracy text,  -- 'yes' | 'partly' | 'no'
  timestamp timestamp,
  referrer text,           -- 'email' | 'dashboard' | 'direct'
  created_at timestamp DEFAULT now()
);
```

---

### 6. `/dashboard/admin/b2b/page.tsx` (MODIFICATION)

**Current state**: Shows list of discovered leads

**Add**:
```typescript
// For each lead, add button:
<a href={`/prospect/${getSlug(lead.business_name)}`}>
  [View Prospect Brief]
</a>
```

**Helper function**:
```typescript
function getSlug(businessName: string): string {
  return businessName
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')    // Remove special chars
    .replace(/\s+/g, '-')          // Spaces to dashes
    .replace(/-+/g, '-');          // Deduplicate dashes
}
```

Example: "Wilson & Co Solicitors" → "wilson-co-solicitors"

---

## DATA FLOW

```
DISCOVERY (existing)
↓
Business discovered: Wilson Solicitors
Stored in b2b_leads table
↓
PROSPECT PAGE REQUEST
↓
User visits: /prospect/wilson-solicitors
↓
[Route Handler: app/prospect/[slug]/page.tsx]
1. Extract slug: "wilson-solicitors"
2. findBusinessBySlug("wilson-solicitors")
   → { name: "Wilson Solicitors", category: "legal", city: "London", website: "..." }
3. getMovementsForBusiness("legal")
   → [Court Filing, Signed Contracts, Property Completion, Immigration]
4. rankMovementsByOpportunity(movements, business)
   → [Court Filing (92%), Property Completion (79%), Signed Contracts (84%), ...]
5. Take top 3: [Court Filing, Signed Contracts, Property Completion]
6. buildMovementBrief(each movement, business)
   → Personalized descriptions
7. buildProspectPageData(business, topMovements)
   → { business, movements: [...] }
8. Pass to ProspectBriefingPage component
↓
[Component Render]
9. Render hero: "Wilson Solicitors"
10. Render 3 movements with personalized briefs
11. Render feedback buttons
↓
PROSPECT VIEWS PAGE
↓
Prospect clicks: "Yes, reflects our operation"
↓
[FeedbackButtons Component]
12. POST /api/prospect-feedback
    { slug: "wilson-solicitors", movement_accuracy: "yes", referrer: "email" }
↓
[Feedback API]
13. INSERT into prospect_feedback table
14. Return success
↓
[Dashboard Analytics]
15. Dashboard shows: Court Filing accuracy: 85% (12 yes, 2 partly, 1 no)
16. Intelligence engine operator sees: "Move logic is solid, keep refining"
↓
LOGIC UPDATES
↓
Movement intelligence improves
↓
All 500 prospect pages improve automatically
↓
No regeneration, no cache invalidation
```

---

## NO CACHING. NO STORAGE. JUST LEARNING.

Every request:
1. Query business data (fresh)
2. Call movement intelligence (latest logic)
3. Call opportunity engine (latest logic)
4. Assemble page (no intermediate storage)
5. Render (no cache hits)

If movement logic changes:
- Next request automatically uses new logic
- All 500 prospect pages improve instantly
- No regeneration jobs
- No migration scripts
- No cache invalidation

---

## BUILD CHECKLIST (Before Implementation)

**Schema**:
- [ ] Prospect feedback table exists (minimal schema above)
- [ ] Indexes on slug + timestamp for dashboard queries

**Functions**:
- [ ] `findBusinessBySlug()` in b2b-schema.ts (or new prospect-pages.ts)
- [ ] `getMovementsForBusiness()` in movement-intelligence.ts (exists)
- [ ] `rankMovementsByOpportunity()` in opportunity-engine.ts (may exist, or create)
- [ ] `buildMovementBrief()` personalizes descriptions per business type
- [ ] `getSlug()` sanitizes business name to URL slug

**Components**:
- [ ] ProspectBriefingPage.tsx renders briefing tone (not marketing)
- [ ] FeedbackButtons.tsx collects yes/partly/no feedback
- [ ] Styles match Saint & Story branding (dark, professional, clean)

**API**:
- [ ] POST /api/prospect-feedback accepts feedback, inserts to table

**Routes**:
- [ ] /app/prospect/[slug]/page.tsx handles on-demand generation
- [ ] No static params generation
- [ ] No caching headers
- [ ] Dynamic rendering

**Dashboard**:
- [ ] B2B dashboard shows [View Prospect Brief] link for each lead
- [ ] Link uses getSlug() to build URL

---

## IMPLEMENTATION NOTES

**Performance**:
- Page generation is fast (one DB query + pure functions)
- If load grows, introduce caching later (not now)
- V1 goal: validation, not optimization

**Extensibility**:
- ProspectBriefingPage can reuse components (Hero, FAQAccordion, etc.) for movement SEO pages
- Feedback table grows with every page view = training data for movement intelligence

**Risk**:
- **Zero risk to existing systems** (discovery, dispatch, drivers, jobs, earnings)
- **Read-only on business records**
- **New table only** (prospect_feedback)
- **New routes only** (/prospect/[slug])
- **Can disable with feature flag** if needed

**Testing**:
- Visit `/prospect/wilson-solicitors` manually
- Verify movements are relevant
- Click feedback buttons
- Check prospect_feedback table for entries
- Modify movement logic, revisit page, verify changes apply instantly

---

## SUCCESS METRIC

**Not**: "We built prospect pages"

**Success**: 
- Sales team opens dashboard
- Finds new discovered business
- Clicks [View Prospect Brief]
- Page loads with personalized movements
- Sales person sends link to prospect
- Prospect sees "they understand us"
- Feedback comes back: "yes"
- Dashboard shows: movement accuracy improving
- Next iteration: logic gets smarter

---

## BUILD PRIORITY (AFTER PROSPECT PAGES V1)

1. ✓ Movement Intelligence Overlay (done)
2. → **Prospect Intelligence Pages V1** (THIS)
3. Dashboard link to prospect pages (add to B2B dashboard)
4. Outreach emails linking to prospect pages (humanized copy)
5. Feedback collection + dashboard analytics
6. (Later) Movement-specific SEO pages (/movement/...)
7. (Later) Caching if load grows
8. (Later) Static generation for performance

---

## GO/NO-GO CHECKLIST

Before starting implementation:

- [ ] Prospect feedback table schema approved
- [ ] No-caching approach approved
- [ ] On-demand generation approved
- [ ] Briefing tone approved
- [ ] Top 3 movements approved
- [ ] Feedback collection approved
- [ ] Dashboard link location approved
- [ ] Ready to build

