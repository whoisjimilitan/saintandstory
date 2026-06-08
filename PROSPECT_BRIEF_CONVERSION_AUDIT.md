# PROSPECT BRIEF CONVERSION AUDIT

**Current implementation analyzed against PROSPECT_BRIEF_CONVERSION_DIRECTIVE**

---

## AUDIT FINDINGS

### CRITICAL VIOLATIONS

#### ❌ MULTIPLE CTAs (Violation: ONE CTA ONLY)

**Current state:**
```
Header → "Call us"
↓
Movements section
↓
Feedback buttons → "Yes", "Partly", "Not really"
↓
Closing section → "Call us — 0203 051 7408"
```

**Impact:** Visitor has 5 competing actions instead of 1 obvious path

**Where it fails:**
- FeedbackButtons.tsx: Three buttons present equal choice
- ProspectBriefingPage.tsx: Header "Call us" competes with footer CTA
- Closing section: Second call to action dilutes primary conversion

**Should be removed:**
- Header "Call us" (secondary distraction)
- All three feedback button choices
- Generic closing section

---

#### ❌ INFORMATION-FIRST FLOW (Violation: PAIN FIRST)

**Current flow:**
```
1. Company name (ProspectHero)
   ↓
2. Generic intro: "We spent time understanding..."
   ↓
3. Movements (informational cards)
   ↓
4. "Was this useful?" (feedback)
   ↓
5. Generic CTA: "If these situations match..."
```

**Should be:**
```
1. Pain recognition (specific to category)
   ↓
2. Cost of inaction
   ↓
3. Opportunity (movements as evidence)
   ↓
4. One clear action
```

**Where it fails:**
- ProspectHero.tsx: Starts with company name, not pain
- Copy "We spent time understanding..." is passive, not recognitional
- No acknowledgment of prospect's specific operational problem
- Movements presented as information, not as opportunities

---

#### ❌ MOVEMENT CARDS ARE GENERIC (Violation: EMOTIONAL WEIGHT)

**Current state:**
```
Movement Type
↓
Brief description (neutral)
↓
"How Saint & Story helps:" (passive)
```

**Should feel like:**
- A missed opportunity
- A hidden revenue leak
- A customer experience problem

**Example of current problem:**
Movement: "Court Filing Documents"
Brief: "When documents must reach court before a specific deadline, timing becomes critical."
Solution: "Saint & Story provides same-day collection, delivery and proof of delivery."

This reads like a feature list, not a problem statement.

**Should be reframed as:**
"Every missed court deadline is a case lost. This isn't about delivery speed. This is about client trust. How many documents are at risk right now?"

---

#### ❌ FEEDBACK BUTTONS AS EQUAL PRIORITY (Violation: ONE CTA ONLY)

**Current state:**
```
Three equal buttons:
- "Yes, reflects our operation" (dark)
- "Partly" (light)
- "Not really" (light)
```

**Impact:**
- Feedback is primary interaction, not secondary validation
- Three options means prospect has to choose/think
- Divides attention from main conversion action

**Should be:**
- Feedback should be hidden or minimal
- Single primary action should dominate
- Feedback collection is validation layer, not conversion layer

---

#### ❌ GENERIC CLOSING COPY (Violation: OUTCOME-DRIVEN CTA)

**Current:**
"If these delivery situations match your operation, we'd like to help.
Call us — 0203 051 7408
No contract. No obligation. Same-day discussion."

**Problems:**
- "If these situations match..." is conditional, not confident
- "We'd like to help" is passive
- No articulation of the outcome

**Should be:**
Frame around specific operational improvement based on category

Examples:
- **Legal:** "Don't let another deadline slip past. Talk to us today."
- **Estate Agents:** "Never lose a transaction to a failed key handover. Schedule your 15-minute consult."
- **Medical:** "Protect time-critical collections. Get live routing in 48 hours."
- **Construction:** "Prevent site delays before they cost you. Call now."

---

### MEDIUM VIOLATIONS

#### ⚠️ HERO SECTION IS INFORMATIONAL

**Current ProspectHero:**
- Label: "Prospect Intelligence" (meta)
- Headline: Business name only
- Copy: "We spent time understanding..." (passive)
- Footer: Category and city (data)

**Should be:**
- Skip the intro label
- Lead with pain: "Missed Deadlines. Lost Clients. Missed Opportunities."
- Then: Business name as evidence "Just like [Company Name]"
- Copy articulates the specific cost

---

#### ⚠️ MOVEMENTS SECTION HAS NO NARRATIVE

**Current:**
Three cards presented as equals. Prospect scans, reads, then... what?

**Should be:**
Each movement builds a case. Prospect reads 1, 2, 3 and realizes "we have all three of these problems."

---

#### ⚠️ MISSING SOCIAL PROOF / CREDIBILITY

**Current:** None

**Should include:**
- Brief credibility signal (how many deliveries, years, etc.)
- Trust marker (licenses, insurance, speed metric)
- Example of similar business we serve

---

### MINOR ISSUES

#### ⚠️ DESIGN IS CONSISTENT BUT DOESN'T CONVERT

Visual design is clean and matches homepage.

But clean design doesn't convert without psychological architecture.

Need to maintain design quality while restructuring for conversion.

---

## SUMMARY OF WEAKNESSES

| Issue | Impact | Fix |
|-------|--------|-----|
| Multiple CTAs | Visitor doesn't know what to do | Remove header CTA, footer CTA, feedback buttons |
| Information-first | No emotional engagement | Reorder: pain → cost → opportunity → action |
| Generic movements | Look like feature list, not problems | Reframe each as "hidden revenue leak" or "risk" |
| No pain recognition | Prospect doesn't feel seen | Start with specific operational pain |
| Generic closing | No urgency or outcome | Outcome-driven CTA per category |
| Feedback buttons compete | Secondary becomes primary | Move feedback out of main flow |
| No social proof | No credibility | Add one trust signal |

---

## WHAT MUST BE REBUILT

1. **Hero Section** → Pain-first frame
2. **Movements** → Opportunity frame (not informational)
3. **CTA Placement** → Single, outcome-driven action
4. **Closing Copy** → Category-specific outcome
5. **Feedback** → Secondary validation layer (not primary)
6. **Social Proof** → One credibility signal

Design system stays the same. Psychological architecture changes completely.

---

## AUDIT CONCLUSION

Current prospect brief is a briefing page.

It needs to be a conversion page.

Current implementation scores: **2/10 conversion readiness**

After rebuild target: **8+/10 conversion readiness**

