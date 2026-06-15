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

## IMPLEMENTATION CHECKLIST

### PHASE 1: DATA INFRASTRUCTURE (Days 1-2)

- [ ] **Database schema:** Add fields to `b2b_leads` table
  ```sql
  ALTER TABLE b2b_leads ADD COLUMN (
    email_subject VARCHAR(255),
    email_body TEXT,
    recipient_email VARCHAR(255),
    email_opened_count INT DEFAULT 0,
    email_clicked_count INT DEFAULT 0,
    email_replied BOOLEAN DEFAULT false,
    last_interaction_at TIMESTAMP
  );
  ```

- [ ] **Email event tracking:** Set up integration to track
  - Email opens (when prospect opens message)
  - Email clicks (when prospect clicks link)
  - Email replies (when prospect replies)
  - Updates `email_opened_count`, `email_clicked_count`, `email_replied`
  - Automatically updates `last_interaction_at`

- [ ] **Data backfill:** For existing leads, populate:
  - `email_subject` (from email logs if available)
  - `email_body` (from email logs if available)
  - `recipient_email` (from existing contact data)
  - Engagement metrics (from any existing tracking)

### PHASE 2: UI COMPONENT (Days 3-5)

- [ ] **Create ConversationCard component** (`components/ConversationCard.tsx`)
  - Display: Company name + status badge
  - Display: Actual email sent (subject + body)
  - Display: Prospect behavior (opened count, clicked count, replied, last activity)
  - Display: System assessment (2-3 sentence psychology-informed interpretation)
  - Display: Recommended action (ONE action, never multiple)

- [ ] **Assessment logic**
  - Analyze: open count + click count + recency
  - Interpret: What emotion/transformation is missing?
  - Assess: Is prospect cooling? Stuck? Engaged?
  - Recommend: What next action prevents loss or creates progress?

- [ ] **Action recommendation logic**
  - Based on: engagement level, industry, sequence stage, recency
  - Output: Single action (call, send X, schedule Y, etc.)
  - Never: Multiple options for operator to choose from

### PHASE 3: INTEGRATION (Days 5-7)

- [ ] **Replace in Today Queue**
  - Replace existing ProspectCard with ConversationCard
  - Test with production data
  - Verify: Operator can see conversations, not just leads

- [ ] **Add to other surfaces** (as needed)
  - Pipeline view (click to see conversation)
  - Orders view (context when needed)

- [ ] **Performance testing**
  - Email rendering doesn't slow page load
  - Assessment calculation is fast
  - Action recommendation is instant

### PHASE 4: VALIDATION & MONITORING (Week 2)

- [ ] **Operator feedback**
  - Is assessment accurate?
  - Is recommended action useful?
  - Are they following the actions?

- [ ] **Data quality check**
  - Email tracking events firing correctly
  - Behavior counts accurate
  - Assessment logic working as expected

- [ ] **Refinement**
  - Adjust assessment language if needed
  - Refine action recommendations based on usage
  - Improve email rendering if needed

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

## TIMELINE

**Goal:** Complete by end of week (2026-06-21)

- Days 1-2: Data infrastructure
- Days 3-5: UI component + assessment logic
- Days 5-7: Integration + testing
- Week 2: Validation + refinement

---

## KEY PRINCIPLES

1. **Conversation is primary object** — Not company, not opportunity, not lead
2. **Show actual email** — Operator sees exactly what was sent
3. **Assessment is psychology-informed** — Reflects sales psychology, not just metrics
4. **Action is singular** — Never multiple options
5. **No new dashboards** — Everything feeds conversation understanding

---

## REFERENCES

- Full specification: `docs/CONVERSATION_INTELLIGENCE_SPEC.md`
- Architecture: `docs/EVOLUTION_ROADMAP.md`
- System design: Memory document `saint_story_operating_system_architecture.md`

