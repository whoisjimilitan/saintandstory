# PROSPECT BRIEF REDESIGN - V1 → V2

## Side-by-Side Comparison

### OLD (V1) - INFORMATIONAL APPROACH
```
Header: "Call us" ← DISTRACTION

↓

Hero Section:
  Label: "Prospect Intelligence"
  H1: "Wilson Solicitors"
  Copy: "We spent some time understanding the delivery situations that often occur within businesses like Wilson Solicitors"
  
  ← Problem: Generic, passive, doesn't say "I understand YOU"

↓

Movement Cards (3 cards):
  Card 1: "Court Filing Documents"
  Brief: "When documents must reach court before a specific deadline, timing becomes critical"
  Solution: "Saint & Story provides same-day collection, delivery and proof of delivery"
  
  ← Problem: Feature list, not emotional, prospect thinks "so what?"

↓

Feedback Buttons:
  "Yes, reflects our operation" | "Partly" | "Not really"
  
  ← Problem: 3 competing actions, visitor confused

↓

Closing: "If these delivery situations match your operation, we'd like to help. Call us."

↓

Footer: "SiteFooter"

✗ RESULT: Feels like a report. Prospect scans. Prospect leaves.
```

---

### NEW (V2) - CONVERSION APPROACH
```
Header: Logo + Phone (minimal, no CTA distraction)

↓

STAGE 1: RECOGNITION - Personalised Hero
  H1: "Wilson Solicitors"
  Copy: "Your legal practice operates on deadlines. Every missed one has a cost. We've spent time understanding what costs you most."
  
  ✓ Impact: "This is about US, not businesses like us"
  ✓ In 5 seconds, prospect feels understood

↓

STAGE 2: UNDERSTANDING - What We Noticed
  Label: "What we noticed"
  H2: "Three things most law firms face"
  
  - Brief description of Movement 1
  - Brief description of Movement 2
  - Brief description of Movement 3
  
  ✓ Impact: Prospect nods. "Yes, all three."
  ✓ Specific to category (not generic)
  ✓ Each triggers recognition

↓

STAGE 3: TENSION - The Hidden Cost
  Label: "The real cost"
  H2: "These aren't just operational problems"
  
  Specific Statement: "Every missed court deadline is a case lost. And more than that—it's your reputation on the line."
  
  Additional: "Lost time. Lost trust. Lost deals. Lost clients. The operational problem and the business impact are the same thing."
  
  ✓ Impact: Prospect realizes "we are leaking."
  ✓ Emotional, clear, specific
  ✓ NOT manipulative, just honest

↓

STAGE 4: CERTAINTY - The Opportunity
  Label: "The better way"
  H2: "What changes"
  
  Clear statement: "When delivery becomes reliable, everything changes. Your deadlines land. Your reputation grows. Your team stops firefighting."
  
  Solution: "We handle the complexity so you don't have to. Same-day collection. Real-time tracking. Proof of delivery. No excuses."
  
  ✓ Impact: Prospect sees practical path
  ✓ Simple, concrete, not fantasy
  ✓ Prospect feels relief

↓

STAGE 5: ACTION - Single CTA (Category-Specific)
  H2: "Don't let another deadline slip past"
  Subtext: "Schedule a 15-minute conversation"
  Button: "Call us — 0203 051 7408"
  
  ✓ Impact: One obvious action
  ✓ Outcome-driven (not "contact us")
  ✓ Specific to category pain
  ✓ Everything points here

↓

Footer: "SiteFooter"

✓ RESULT: Feels like understanding. Prospect feels seen. Prospect calls.
```

---

## Key Changes

### 1. Hero Section

**OLD:**
```
"Prospect Intelligence" (meta label)
"Wilson Solicitors" (name only)
"We spent some time understanding..." (passive)
```

**NEW:**
```
"Wilson Solicitors" (direct)
"Your legal practice operates on deadlines. Every missed one has a cost. We've spent time understanding what costs you most."
(active, specific, demonstrates understanding)
```

**Why:** Recognition happens immediately. Prospect feels seen, not scanned.

---

### 2. Movements Section

**OLD:**
```
"Court Filing Documents"
(generic card, neutral tone)
```

**NEW:**
```
"What we noticed" section
"Three things most law firms face"
(List of 3 movement briefs)
```

**Why:** Positions movements as observations, not features. Triggers nods, not reading.

---

### 3. New Section: Hidden Cost

**OLD:**
(Missing entirely)

**NEW:**
```
Label: "The real cost"
H2: "These aren't just operational problems"
Specific tension: "Every missed court deadline is a case lost. It's your reputation on the line."
```

**Why:** Exposes the cost without manipulation. Prospect arrives at conclusion themselves.

---

### 4. CTA

**OLD:**
```
"Call us — 0203 051 7408"
(Plus header "Call us" + feedback buttons)
= 5 competing actions
```

**NEW:**
```
"Don't let another deadline slip past"
(category-specific outcome)
"Schedule a 15-minute conversation"
(single action, clear next step)
```

**Why:** One action. Everything points to it. No confusion.

---

### 5. Feedback Buttons

**OLD:**
```
Visible, prominent, three options
(competes with main CTA)
```

**NEW:**
```
Removed entirely (except from API for data collection)
(feedback is validation layer, not primary interaction)
```

**Why:** Conversion first. Feedback collection is secondary.

---

## The Five Stages in Action

### Stage 1: Recognition (5 seconds)
Prospect lands on page.
Reads hero.
Feels: "They're talking about us."

### Stage 2: Understanding (10 seconds)
Scans "What we noticed."
Sees three observations.
Feels: "They understand our world."

### Stage 3: Tension (15 seconds)
Reads "The real cost."
Sees specific consequences.
Feels: "We are leaking opportunities."

### Stage 4: Certainty (25 seconds)
Reads "The opportunity."
Sees clear, practical path.
Feels: "There is a solution."

### Stage 5: Action (30 seconds)
Sees single CTA.
Feels: "I know exactly what to do."
Takes action.

---

## Conversion Metrics to Track

**V1 (Old):**
- Page view → abandon rate: likely high
- Time on page: likely brief (report-skimming pattern)
- Feedback submissions: likely low (not prominent)
- CTA clicks: likely low (too many options)

**V2 (New):**
- Page view → abandon rate: should decrease (recognition holds prospect)
- Time on page: should increase (prospect reads each stage)
- CTA clicks: should increase significantly (one clear action)
- Feedback submissions: should remain (data collection on separate path)

---

## Testing V2

### How to View V2

1. **Test URL structure:**
   - Old: `/prospect/[slug]`
   - New: `/prospect-v2/[slug]` (parallel route for testing)

2. **Test categories:**
   - Legal/Solicitors (Wilson Solicitors)
   - Estate Agent (check if data available)
   - Medical/Pharmacy (check if data available)

3. **Verify:**
   - [ ] Hero text is specific to category
   - [ ] "What We Noticed" shows 3 movements
   - [ ] "Hidden Cost" has category-specific tension
   - [ ] CTA text matches category outcome
   - [ ] Only one button visible
   - [ ] Design matches homepage

---

## Implementation Status

✅ **Component created:** `ProspectBriefingPageV2.tsx`

⏳ **Route needed:** Create `/prospect-v2/[slug]/page.tsx`

⏳ **Testing needed:** Compare V1 vs V2 visually

⏳ **Decision needed:** Roll out V2 to replace V1?

---

## Next Step

Test V2 in parallel with V1 to verify:
1. Conversion feels right
2. Copy resonates
3. Design matches standards
4. All 5 stages work

Once validated, replace V1 with V2 entirely.

