# IMPLEMENTATION ROADMAP — CONVERSATION INTELLIGENCE PRIORITY 1

**Date:** 2026-06-15  
**Priority:** HIGHEST  
**Goal:** Build Conversation Intelligence Layer (makes conversations transparent)

---

## WHAT WE HAVE ✅

- Discovery Intelligence (finds prospects)
- Qualification Intelligence (determines value)
- Decision Intelligence (Morning Brief, Pipeline, Orders, Today Queue)

**All visibility layers exist.**

---

## WHAT'S MISSING ❌ (THIS IS NEXT)

**Conversation Intelligence**

Operator must be able to open any prospect and instantly see:

1. **Message Sent** — What exactly did we send?
2. **Prospect Behavior** — How did they respond? (Opened? Clicked? Replied?)
3. **System Assessment** — What does this mean?
4. **Recommended Action** — What should I do now?

**Currently operator sees:**
```
Westpoint Pharmacy | Warm | Opened 3x | Clicked 1x | Follow up
```

**Cannot answer:** What was sent? Why did they open? Why no reply? What next?

---

## IMPLEMENTATION PHASES

### PHASE A: Conversation Data Visibility

**What:** Operator can see the exact email that was sent.

**Why:** Operator cannot interpret signals without knowing what message created them.

**How implemented:**
- Add fields to `b2b_leads`: email_subject, email_body, recipient_email
- Set up email tracking: opens, clicks, replies
- Display actual email body in UI (not template, not description)

**Success condition:** Operator opens any prospect and sees the exact email message that was sent.

---

### PHASE B: Conversation Understanding

**What:** Operator understands what the prospect's behavior means.

**Why:** Raw signals (opened 3x, clicked 1x) don't tell the story. Assessment does.

**How implemented:**
- Build assessment logic that interprets: open count + click count + recency
- Assessment applies sales psychology: emotion → transformation → pain/specificity
- Assessment answers: Is this person interested? What's missing? Are they cooling?

**Success condition:** Operator reads assessment and immediately understands prospect state without needing to interpret metrics.

---

### PHASE C: Conversation Recommendations

**What:** Operator knows exactly what action to take next.

**Why:** Without clear next step, operator must decide. With recommendation, operator executes or consciously deviates.

**How implemented:**
- Build action recommendation logic
- Output: Single action (never multiple)
- Action is: most high-leverage next step
- Action is: immediately executable

**Success condition:** Operator sees recommended action and either follows it or explicitly chooses a different path (tracking deviation).

---

### PHASE D: Conversation Learning

**What:** System learns which conversation patterns work and remembers for future decisions.

**Why:** Without memory, operator makes same decisions repeatedly. With memory, system improves.

**How implemented:**
- Build Memory Intelligence layer (see architecture)
- System remembers: What worked. What failed. Preferences. Patterns.
- System applies learning to future assessments and recommendations.

**Success condition:** System recommends better actions based on accumulated learning. Operator sees different (better) recommendations for similar conversations over time.

---

## DATA EXAMPLE

```json
{
  "id": "prospect_123",
  "business_name": "Westpoint Pharmacy",
  "status": "warm",
  
  "email_sent_at": "2026-06-11T09:00:00Z",
  "email_subject": "Pharmacy Transport Solutions — Save Time & Reduce Costs",
  "email_body": "Dear Pharmacy Manager,\n\nWe help independent pharmacies...",
  "recipient_email": "info@westpoint.co.uk",
  
  "email_opened_count": 3,
  "email_clicked_count": 1,
  "email_replied": false,
  "last_interaction_at": "2026-06-13T14:30:00Z",
  
  "assessment": "Multiple opens indicate genuine interest. Click shows specific curiosity about our solution. No reply suggests they're still evaluating or need human confirmation. Likely ready for a call.",
  
  "recommended_action": "Call today. Lead with: 'I see you've opened this a few times — clearly interested. Quick question: are you currently managing courier costs manually?'"
}
```

---

## WHAT NOT TO BUILD

**Do NOT build:**
- Analytics dashboards
- Strategy pages
- Coverage visibility
- Additional discovery views
- New metric displays

**Everything centers on conversations.**

---

## SUCCESS CRITERIA

Conversation Intelligence is successful when:

1. ✅ Operator opens prospect, instantly sees: What was sent
2. ✅ Operator instantly sees: How prospect responded
3. ✅ Operator instantly sees: What should happen next
4. ✅ Assessment is accurate enough to guide action
5. ✅ Operator no longer needs to interpret signals
6. ✅ Conversation replaces "lead" in operator's mental model

---

## WHAT THIS UNLOCKS

Once Conversation Intelligence is deployed, **Behavior Intelligence becomes buildable:**

- Which messages generate opens?
- Which messages generate clicks?
- Which messages generate replies?
- Which industries engage?
- Which signals predict engagement?

Without Conversation Intelligence, these questions are unanswerable.

**Current bottleneck:** 196 → 99 → 35 → 14 → 5 → 0 replied

**That's a conversation problem, not a discovery problem.**

---

## KEY PRINCIPLES

1. **The primary object is the relationship state between Saint & Story and a prospect**
   - Not the company
   - Not the lead
   - Not the opportunity
   - Everything else is context
   - This prevents drift

2. **Show actual email** — Operator sees exactly what was sent (not template description)

3. **Assessment is psychology-informed** — Reflects sales psychology principles, not just metrics

4. **Action is singular** — Never multiple options

5. **No new dashboards** — Everything feeds conversation understanding

---

## REFERENCES

- Full specification: `docs/CONVERSATION_INTELLIGENCE_SPEC.md`
- Architecture: `docs/EVOLUTION_ROADMAP.md`
- System design: Memory document `saint_story_operating_system_architecture.md`

