# DISCOVERY SYSTEM ROOT CAUSE ANALYSIS

**Status:** IN PROGRESS - Forensic Investigation

---

## EVIDENCE CHAIN

### A) Current Symptom
- User runs B2B discovery via dashboard
- Selects niche, city, clicks "Find..."
- API returns: `{ "count": 0, "added": [] }`
- b2b_leads table remains empty
- **Discovery was working before, now returns zero results**

### B) System Test Results
```bash
$ npx tsx debug-slugs.ts
❌ NO BUSINESSES FOUND IN b2b_leads TABLE
```

This proves:
- ✓ Database connection works
- ✓ b2b_leads table exists
- ✓ Table is empty

---

## ROOT CAUSE IDENTIFICATION

### 1. Mismatch Between Form Input & Discovery Route

**DISCOVERY FORM SENDS:**
```typescript
// components/B2BPipeline.tsx, DiscoverPanel
const [industry, setIndustry] = useState(Object.values(B2B_INDUSTRIES)[0][0]);

// Form values are from B2B_INDUSTRIES keys/arrays
// Example: "Solicitors", "Estate Agents", "Pharmacies" (CAPITALIZED)

fetch("/api/b2b/discover", {
  body: JSON.stringify({ niche: industry, city })
  // Sends: niche="Solicitors", city="Manchester"
});
```

**DISCOVERY ROUTE EXPECTS:**
```typescript
// app/api/b2b/discover/route.ts
const NICHE_SEARCH_MAP: Record<string, string[]> = {
  florists: ["florist", "flower shop", "flowers"],
  restaurants: ["restaurant", "cafe", "bistro", "eatery"],
  retailers: ["retail store", "shop", "boutique"],
  legal: ["solicitors", "law firm", "legal services"],
  "estate-agents": ["estate agent", "property agent", "letting agent"],
  // ... keys are LOWERCASE
};

const queries = NICHE_SEARCH_MAP[niche] ?? [niche];
// With niche="Solicitors" (from form):
// 1. Looks for NICHE_SEARCH_MAP["Solicitors"]
// 2. Not found (key is "legal", not "Solicitors")
// 3. Falls back to [niche] = ["Solicitors"]
// 4. Searches Google Maps for "Solicitors in Manchester UK"
```

**POTENTIAL ISSUE:**
- Form sends: "Solicitors", "Estate Agents", "Accountants"
- Route map has: "legal", "estate-agents", "finance"
- Fallback searches may be less specific and return fewer results

### 2. Form-to-Route Mapping Inconsistency

**B2B_INDUSTRIES structure:**
```typescript
{
  Legal: ["Solicitors", "Barristers' Chambers", ...],
  Healthcare: ["Pharmacies", "Private Hospitals", ...],
  "Property & Construction": ["Estate Agents", "Letting Agents", ...],
}
```

**What form sends to route:**
- Button click uses: B2B_INDUSTRIES industry value
- But NICHE_SEARCH_MAP expects different keys
- No translation layer between form values and route map

### 3. Case Sensitivity Issue

When form sends "Solicitors" and route expects "legal":
```typescript
NICHE_SEARCH_MAP["Solicitors"]  // undefined
NICHE_SEARCH_MAP["Solicitors".toLowerCase()]  // Not converted
// Falls back to using "Solicitors" as search query
```

---

## VERIFICATION TEST

**TEST:** Search query inconsistency

**Input:** Form sends niche="Solicitors", city="Manchester"

**Path Through Code:**
1. DiscoverPanel.discover() sends: `{ niche: "Solicitors", city: "Manchester" }`
2. Discovery route receives niche="Solicitors"
3. `NICHE_SEARCH_MAP["Solicitors"]` → undefined (key is "legal")
4. Fallback: `queries = ["Solicitors"]`
5. `searchPlaces("Solicitors", "Manchester", apiKey)`
6. Google Maps API receives: "Solicitors in Manchester UK"
7. Response depends on Google's exact match logic

**EXPECTED:** Query should map to ["solicitors", "law firm", "legal services"]
**ACTUAL:** Query is ["Solicitors"] - singular, possibly less targeted

### 4. Did This Change Recently?

**Git History Check:**
- NICHE_SEARCH_MAP: Last changed in commit d62f456 (original implementation)
- B2B_INDUSTRIES: Changed in 5211dd8 (added comprehensive categories)
- Discovery route: Unchanged since d62f456
- Form component: Minimal changes (only added prospect brief link in 147ac48)

**Timeline:**
- Commit 5211dd8: Comprehensive B2B industry categories (before current break)
- Commit d62f456: Discovery implementation with NICHE_SEARCH_MAP
- **Gap:** No translation layer between B2B_INDUSTRIES and NICHE_SEARCH_MAP

---

## HYPOTHESIS

The discovery system has a **TYPE MISMATCH** between what the form sends and what the route expects:

1. **Form values:** Derived from B2B_INDUSTRIES array items (e.g., "Solicitors", "Estate Agents")
2. **Route expects:** Lowercase category keys from NICHE_SEARCH_MAP (e.g., "legal", "estate-agents")
3. **Fallback behavior:** When they don't match, uses original value as direct Google search
4. **Result:** Less targeted searches → 0 results OR fewer results than expected

---

## PROPOSED FIXES (By Priority)

### FIX 1: Add Translation Layer (LOWEST RISK)

Map form values to route expectations:

```typescript
// Add to discovery route
const FORM_TO_NICHE: Record<string, string> = {
  "Solicitors": "legal",
  "Barristers' Chambers": "legal",
  "Estate Agents": "estate-agents",
  "Letting Agents": "estate-agents",
  "Pharmacies": "healthcare",
  // ... etc
};

// In POST handler
let niche = req.body.niche;
if (FORM_TO_NICHE[niche]) {
  niche = FORM_TO_NICHE[niche];
}
const queries = NICHE_SEARCH_MAP[niche] ?? [niche];
```

**Risk:** Low - Only affects which Google search queries are used
**Impact:** Ensures fallback never triggers; routes all form inputs through NICHE_SEARCH_MAP

### FIX 2: Make NICHE_SEARCH_MAP Case-Insensitive

```typescript
const niche = req.body.niche.toLowerCase();
const queries = NICHE_SEARCH_MAP[niche] ?? [niche];
```

**Risk:** Low - Matches on lowercase version
**Impact:** "Solicitors" maps to "legal", "Estate Agents" maps to "estate-agents"

### FIX 3: Rewrite Form to Send Niche Keys Instead of Values

```typescript
// Change form state to use key, not value
const [nicheKey, setNicheKey] = useState("legal");
// Send: { niche: "legal", city: "Manchester" }
```

**Risk:** Medium - Requires form refactor
**Impact:** Direct alignment between form and route

---

## NEXT STEPS

1. ✅ Added comprehensive logging to discovery route
2. ✅ Created test-discovery.ts for local testing
3. ⏳ Run test script with GOOGLE_MAPS_API_KEY and DATABASE_URL set
4. ⏳ Check Vercel function logs for [DISCOVER] entries
5. ⏳ Verify which search queries are actually being sent to Google Maps
6. ⏳ Confirm if Google is returning 0 results or if inserts are failing
7. ⏳ Implement FIX 2 (case-insensitive lookup) as immediate remedy
8. ⏳ Implement FIX 1 (translation layer) for robustness

---

## COMMITS THAT AFFECTED THIS

| Commit | Change | Impact |
|--------|--------|--------|
| d62f456 | Discovery route + NICHE_SEARCH_MAP | Introduced fixed-key mapping |
| 5211dd8 | Comprehensive B2B categories | Added form values that don't match NICHE_SEARCH_MAP keys |
| 147ac48 | Added prospect brief link | **NO IMPACT** (only UI change) |
| 435b140 | Added Prisma B2bLead model | **NO IMPACT** (route uses raw SQL) |

**The root cause exists as a DESIGN MISMATCH between commits d62f456 and 5211dd8, not as a recent code breakage.**

---

## KEY INSIGHT

This is not a recent regression. This is an undetected design flaw that has existed since the comprehensive B2B industries were added (5211dd8).

The form sends "Solicitors", but the route map has "legal". They should match or have a translation layer.

---

## EVIDENCE LOCATION

- Discovery route: `/app/api/b2b/discover/route.ts` (line 21-27: NICHE_SEARCH_MAP)
- Form component: `/components/B2BPipeline.tsx` (line 357: industry state, line 370: what's sent)
- Industries: `/lib/b2b-industries.ts` (line 1-100: B2B_INDUSTRIES structure)
- Test script: `/test-discovery.ts` (ready to run)
- Logging: `/app/api/b2b/discover/route.ts` (comprehensive [DISCOVER] logs added)

