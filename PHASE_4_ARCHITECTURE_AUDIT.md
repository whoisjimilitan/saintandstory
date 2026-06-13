# PHASE 4: PROMOTION ARCHITECTURE AUDIT

## Current State

**Pipeline Status:**
- ✅ Bridge: Prisma → discovered_businesses → qualified_businesses (WORKING)
- ❌ Promotion: qualified_businesses → b2b_leads (BLOCKED by threshold=40)

**Result:**
```
151 discovered
    ↓
151 qualified
    ↓
0 promoted (score < 40)
    ↓
0 outreach
    ↓
0 learning
```

---

## The Architectural Problem

**Current Assumption:**
```
Score >= 40 → Business is "good enough" → Create lead → Send outreach
Score < 40  → Business is "too risky"   → STOP (no lead, no outreach, no learning)
```

**Issue:** This treats promotion as a **filter** when it should be a **gate** to learning.

**The Learning Loop Cannot Close:**
```
Discovery → Qualification → FILTERED OUT → No outreach → No feedback → No learning
```

If we never reach out to low-confidence businesses, we never discover whether they convert.

---

## Current Model: Binary Gate

```
qualified_businesses (score 20-25)
    ↓
    ├─ Score >= 40 → b2b_leads (outreach) → recognition email → responses → LEARN
    │                0 businesses
    │
    └─ Score < 40 → STOP (no lead, no outreach, no learning)
                     151 businesses
```

**Problem:** 151 businesses enter the learning system as "qualified" but never generate data about whether they convert.

---

## Proposed Model: Tiered Lead Creation

```
qualified_businesses (ALL 151)
    ↓
b2b_leads (ALL 151, tiered by confidence)
    ├─ Tier A (80+):   Auto-send recognition email (high confidence)
    ├─ Tier B (60-79): Send recognition email (medium confidence)
    ├─ Tier C (40-59): Queued for batch outreach (low confidence)
    └─ Tier D (<40):   Dashboard only / manual approval (very low confidence)
    
    ↓
All tiers receive measurement & feedback
    ↓
LEARNING operates across all tiers
```

**Key Change:** Promotion and outreach **priority** are decoupled.

- **Promotion:** All qualified → become leads (enables learning)
- **Outreach:** Prioritized by tier (manages volume/cost)

---

## Current Score Distribution

```
Tier A (80+):  0 businesses
Tier B (60-79): 0 businesses
Tier C (40-59): 0 businesses
Tier D (<40):  151 businesses (range: 20-25)
```

**Under Current Model:**
- 0 leads created
- 0 outreach sent
- 0 feedback collected

**Under Proposed Model:**
- 151 leads created (all tiered D)
- 151 qualified for dashboard/manual review
- Operator can choose: "Let's test 10 of these Tier D businesses"
- Results feed back to learning system

---

## Risks & Benefits

### Risk: Spam

**Concern:** "If we outreach to low-confidence businesses, we spam prospects"

**Mitigation:** 
- Tier D businesses don't auto-send email
- Dashboard shows them as "pending review"
- Operator manually approves outreach (or bulk-approves by tier)
- Learning is opt-in, not forced

---

### Benefit: Real Learning Data

**Current:** "These businesses probably won't convert" (assumption, never tested)

**Proposed:** "We tried 5 Tier D businesses, 2 responded, 1 booked" (actual data)

After 10 test outreaches to Tier D:
- If 0 respond → threshold of 40 was correct
- If 3 respond → threshold was too high
- If feedback contradicts scoring → scoring model needs adjustment

---

## Migration Path

### Phase 4.1: Change Promotion Logic
- All qualified businesses → become leads
- Add `lead_tier` column based on score
- Preserve score for learning

### Phase 4.2: Change Outreach Logic
- Tier A/B: Auto-send (confidence sufficient)
- Tier C/D: Operator dashboard (review before outreach)
- Track: "which tier responded" → feeds learning

### Phase 4.3: Measure & Iterate
- After 30 days: "Tier D conversion rate = X%"
- Adjust threshold and tiers based on data
- Refine scoring model

---

## Comparison: Current vs. Proposed

| Aspect | Current | Proposed |
|--------|---------|----------|
| **Threshold** | 40 (hard gate) | 40 (priority only) |
| **Leads Created** | 0 of 151 | 151 of 151 |
| **Outreach** | 0 sent | Tiered (manual approval for D) |
| **Learning Data** | None | Full funnel across tiers |
| **Operator Control** | None (automatic reject) | Dashboard review + approval |
| **Feedback Loop** | Closed | Open |

---

## Recommendation

**Do NOT lower the threshold to 40.**

**DO separate lead creation from outreach priority:**

1. **Promotion Rule:** Score >= 20 becomes lead (currently: >= 40)
   - All qualified businesses become leads
   - Enables learning across full score range

2. **Outreach Priority:** Score determines tier
   - Tier A (80+): Auto-send
   - Tier B (60-79): Auto-send
   - Tier C (40-59): Operator review
   - Tier D (<40): Dashboard pending (manual approval)

3. **Learning Loop:** Operates across all tiers
   - Measure responses by tier
   - Adjust threshold based on conversion data
   - Refine scoring model based on what actually converts

---

## Why This Matters

**Original Question:** "Should we create 0 leads or adjust threshold?"

**Actual Question:** "Should we learn from data, or trust a pre-trained scoring model?"

For an **autonomous revenue engine**, the answer is: **learn from data.**

Start with a safe threshold (40), but measure what happens at every tier. After 30 days of actual feedback:
- You'll know if the threshold is right
- You'll know which score signals actually predict conversion
- You'll be able to optimize the model

Right now, by filtering at 40, you're saying: "We're confident these 151 flower shops won't convert, so we'll never test them."

The proposal is: "We're less confident about them, so we'll test them carefully and learn."

---

## Next Steps (No Code Changes Yet)

1. ✅ Bridge proven
2. ✅ Qualification proven
3. ✅ Scoring diagnosed (working correctly)
4. ⏳ **Architecture decision:** Filtering vs. Learning
5. ⏳ Wire orchestration (after decision)

**Current recommendation:** Adopt tiered promotion model. Create leads from all qualified businesses. Let outreach priority and operator approval be the gates, not promotion itself.
