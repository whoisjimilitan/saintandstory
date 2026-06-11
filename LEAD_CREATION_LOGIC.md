# Lead Creation Logic - Exact Code Path

**File:** `app/api/b2b/discover/route.ts`  
**Question:** When does a discovered business become a B2B lead?  
**Answer:** For every business Google Places returns that isn't already in the system.

---

## The Exact Condition

```typescript
// Line 222-266
for (const place of places) {
  // Condition 1: Must have a place_id
  if (!place.place_id) {
    continue;  // Skip if no ID
  }

  // Condition 2: Must not already be a lead
  const existing = await sql`
    SELECT id FROM b2b_leads 
    WHERE google_place_id = ${place.place_id} 
    LIMIT 1
  `;
  
  if (existing.length > 0) {
    continue;  // Skip if already a lead
  }

  // If we get here:
  // Condition met ✅ → Create a lead

  const { painPoint, reviewText, rating } = detectPainPoint(place.reviews);

  await sql`
    INSERT INTO b2b_leads (
      business_name, business_category, email, phone, city,
      website, google_place_id, pain_point, pain_point_review, review_rating,
      source, status, niche, landing_page_url, created_at, updated_at
    ) VALUES (
      ${place.name},
      ${niche},
      null,
      ${place.formatted_phone_number ?? null},
      ${addressCity},
      ${place.website ?? null},
      ${place.place_id},        // ← This is the dedup key
      ${painPoint},              // ← May be null (see below)
      ${reviewText ?? null},
      ${rating ?? null},
      'discovery',
      'new',
      ${niche},
      ${`${BASE_URL}/b2b/${niche}`},
      NOW(),
      NOW()
    )
  `;
}
```

---

## The Logic in Plain English

```
For each business Google Places returns:

1. Does it have a place_id? 
   NO  → Skip it
   YES → Continue

2. Is it already a lead (duplicate)?
   YES → Skip it (don't create duplicate)
   NO  → Continue

3. (At this point, create a lead)
   Extract pain point metadata (optional)
   INSERT into b2b_leads
```

---

## What "Pain Point" Actually Is

The `detectPainPoint()` function analyzes reviews:

```typescript
function detectPainPoint(reviews) {
  if (!reviews?.length) return { painPoint: null, ... };

  for (const review of reviews) {
    // Only look at negative reviews (≤ 3 stars)
    if (review.rating > 3) continue;
    
    const text = review.text.toLowerCase();

    // Filter out false positives (reviews that mention pain keywords positively)
    const hasSatisfaction = SATISFACTION_PHRASES.some(p => text.includes(p));
    if (hasSatisfaction) continue;

    // Look for logistics pain keywords
    const matchedKeyword = PAIN_KEYWORDS.find(k => text.includes(k));
    if (matchedKeyword) {
      return {
        painPoint: matchedKeyword,
        reviewText: review.text.slice(0, 300),
        rating: review.rating,
      };
    }
  }
  
  // No pain point found, but that's okay
  return { painPoint: null, reviewText: null, rating: null };
}
```

---

## Pain Keywords (What Triggers Detection)

```javascript
const PAIN_KEYWORDS = [
  "delivery", "courier", "shipping", "supplier", "didn't show", "never arrived",
  "late delivery", "no show", "delivery failed", "never got", "still waiting",
  "logistics", "dispatch", "collection", "pickup", "pick up", "drop off",
];

const SATISFACTION_PHRASES = [
  "great delivery", "quick delivery", "fast delivery", "on time", "arrived safely",
  "delivered perfectly", "excellent courier",
];
```

---

## The Critical Point

**Pain point is METADATA, not a GATE.**

```
❌ WRONG:
if (painPoint !== null) {
  createLead();
}

✅ CORRECT:
createLead();  // Always
painPoint = detectPainPoint();  // Get metadata
store(painPoint);  // Store with lead
```

---

## What This Means for Tomorrow

If the cron creates a discovery record showing:

```
discovery_count: 12
leads_created:   X
```

What should X be?

| X Value | Interpretation |
|---------|-----------------|
| 12 | ✅ Perfect. All 12 discovered businesses became leads. |
| 11 | ✅ Healthy. One was a duplicate, skipped correctly. |
| 10 | ✅ Healthy. Two were duplicates. |
| 8 | ✅ Possible. 4 were duplicates or INSERT errors. |
| 0 | ❌ FAIL. Discovery found 12 but 0 became leads. Database write issue. |
| 6 | ⚠️ Suspicious. Half converted, half didn't. Partial failure in INSERT loop. |

---

## Tomorrow's Verification

When you check the ledger:

```sql
SELECT discovery_count, leads_created FROM b2b_orchestration_logs 
WHERE DATE(started_at) = CURRENT_DATE LIMIT 1;
```

**Success Case:**
```
discovery_count | 12
leads_created   | 10  ← Within 2-3 of discovery count is healthy
```

**Failure Case:**
```
discovery_count | 12
leads_created   | 0   ← Complete write failure
```

**Suspicious Case:**
```
discovery_count | 12
leads_created   | 12
businesses in DB| 8   ← INSERT succeeded in ledger but not in actual table
```

The leads_created field tells you how many INSERTs succeeded from the discovery loop.

---

## Edge Cases

### Case 1: All discoveries are duplicates

```
Google returns 15 businesses
But 15 are already leads from previous runs
discovery_count: 15
leads_created:   0
Status:          success (this is correct behavior!)
```

✅ This is healthy - it means deduplication is working.

### Case 2: Google returns 0 results

```
Text search for "florists in london" returns nothing
discovery_count: 0
leads_created:   0
Status:          success
```

✅ This is normal - API quota or no results.

### Case 3: Partial INSERT failures

```
Google returns 12
INSERT attempt 12 times
9 succeed, 3 fail (constraint violations)
discovery_count: 12
leads_created:   9
Status:          partial_failure
```

⚠️ Some inserts failed. Check the failures array in ledger for details.

---

## Summary

**The condition is simple:**

```
For every business Google Places returns
  that has a place_id
  and doesn't already exist in b2b_leads:
    → Create a lead
```

**No filters. No pain-point gates. No confidence thresholds.**

Just: `createLeadForEveryBusiness()`

The pain point is metadata that gets attached, but it doesn't prevent lead creation.

This is why tomorrow's `leads_created` number should be roughly equal to `discovery_count` (minus duplicates).
