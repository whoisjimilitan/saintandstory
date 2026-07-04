# Saint & Story Opportunity Feed Constitution V1.0

## Status
**PERMANENT. CANONICAL. LOCKED.**

This is the authoritative specification for the Opportunity Feed system.

All implementation must comply with this constitution.

No deviation without explicit approval.

---

## PURPOSE

The Opportunity Feed system exists to respond to businesses that have publicly expressed a need for courier, logistics, transport, delivery, or driver services.

The system does **not** generate cold outreach.

The system **responds** to existing buying signals.

**Why this matters:**

Businesses that publicly said they need what we offer are fundamentally different from businesses we interrupt. They have already raised their hand. We are not convincing them they have a problem. We are demonstrating we listened and understand.

The goal is a YES response:

"This is actually what we need. We want to work with you. Can you call us? Can we start now?"

This happens because we struck at the right time when they needed what we offer, and our Courier Readiness Brief proved we understood their specific situation.

---

## THE WORKFLOW (LOCKED)

```
Discover
    ↓
Import
    ↓
Extract
    ↓
Generate Brief
    ↓
Generate Email
    ↓
Approval Queue
    ↓
Send
    ↓
Track
    ↓
Relationship Engine (only after engagement)
```

Nothing may be inserted between these stages.

Nothing may be skipped.

Nothing may be reordered.

---

## STAGE 1: DISCOVER

**Responsible for:**
- Search public internet (LinkedIn, company websites, forums, news)
- Detect public expressions of logistics need
- Extract exact wording
- Identify company
- Identify decision maker (if available)
- Export CSV

**Output Format:**

| Field | Required | Example |
|-------|----------|---------|
| Company | Yes | ABC Law |
| Website | Yes | abclaw.co.uk |
| Contact Name | No | Sarah Chen |
| Contact Email | No | sarah@abclaw.co.uk |
| Source Platform | Yes | LinkedIn |
| Source URL | Yes | linkedin.com/feed/update/... |
| Posted Date | Yes | 2 days ago |
| Original Wording | Yes | "We're looking for a reliable same-day courier..." |
| Confidence | Yes | 96% |

**Tool:** GPT-5 using master prompt (defined separately)

**What NOT to do:**
- No enrichment
- No CRM lookups
- No scoring
- No guessing

**What IS to do:**
- Find the confession
- Extract exactly what they said
- Nothing more

---

## STAGE 2: IMPORT

**Responsible for:**
- Accept CSV from Discover phase
- Validate CSV structure
- Store in database (Opportunity table)
- Display in queue for next stage

**Location:** `/operator/discover` → "Import CSV" button

**Database:** Opportunity table (new)

**What happens:**
1. User uploads CSV
2. System validates structure
3. System stores opportunities
4. Queue auto-populates with new opportunities
5. Ready for extraction stage

**Validation Rules:**
- Company name required
- Original Wording required
- Confidence must be 0-100%
- Date must be valid

---

## STAGE 3: EXTRACT

**Responsible for:**
- Read Original Wording
- Extract ONLY these four things:
  1. **Need** — What they said they need (courier, delivery, logistics, etc.)
  2. **Urgency** — How urgent (High/Medium/Low based on wording)
  3. **Context** — What industry/situation (Legal, Healthcare, Retail, etc.)
  4. **Exact Quote** — Their actual words (verbatim)

**NO hallucination. NO invention. NO assumptions.**

**Example:**

```
Original Wording:
"We're looking for a reliable same-day courier for legal document delivery across Manchester. Our current provider keeps missing deadlines and it's costing us client relationships."

Extracted:
Need: Same-day legal document courier
Urgency: High
Context: Legal practice, Manchester, time-critical deadlines
Quote: "We're looking for a reliable same-day courier..." and "costing us client relationships"
```

**Tool:** Claude (reasoning engine)

**What NOT to do:**
- Don't invent additional needs
- Don't interpret beyond what they said
- Don't add psychology or reasoning
- Don't guess at pressure types

**What IS to do:**
- Read what they said
- Extract cleanly
- Store verbatim quote

---

## STAGE 4: GENERATE BRIEF

**Responsible for:**
- Create a one-page Courier Readiness Brief
- Address their stated need directly
- Show operational understanding
- Build confidence before asking for anything

**Brief Structure:**

```
╔════════════════════════════════════════════════════╗
║         COURIER READINESS BRIEF                     ║
║                                                     ║
║         Prepared for:  ABC Law                     ║
║         Prepared:      [Today's Date]              ║
╚════════════════════════════════════════════════════╝

WE NOTICED YOU'RE LOOKING FOR:
"Your exact quote here"

WHAT THAT MEANS:
[One sentence showing we understood]

THE OPERATIONAL APPROACH WE'D RECOMMEND:

✓ Collection protocol
✓ Delivery windows
✓ Vehicle type
✓ Tracking & proof
✓ Contingency handling

WHY THIS MATTERS:

[2-3 sentences explaining the business impact of reliable delivery for their situation]

ANY QUESTIONS?
[Contact details]
```

**Key Principle:**

The Brief is not marketing. It is evidence that someone actually listened.

It is not about Saint & Story. It is about their need and our understanding of it.

**Tool:** Claude (communication engine)

**What makes it work:**
- References their exact quote
- Shows specific operational details (not generic)
- Demonstrates competence (we've thought about their situation)
- Builds trust before asking for anything

**What ruins it:**
- Generic company information
- Features and benefits
- Sales language
- Anything that says "we"

---

## STAGE 5: GENERATE EMAIL

**Responsible for:**
- Write five sentences
- Structure is locked (no deviation)
- Psychology is embedded (not added later)
- Goal: permission to help, not a sale

**Email Structure (LOCKED):**

```
Hi [Name],

1. A little birdie told me you're looking for [their exact need].

2. I went ahead and prepared a one-page Courier Readiness Brief based on what you described.

3. It outlines how we'd handle that type of work before you spend time explaining everything.

4. Here's the link. [Brief URL]

5. If it's useful, great. If not, keep it anyway.

James
```

**Why each sentence exists:**

1. **Soft introduction** — "A little birdie" is disarming, not cold. References their confession.

2. **Shows action** — "went ahead and prepared" shows respect for their time. Not asking them to do work.

3. **Value-first** — Explains what the Brief does (removes friction, saves their time).

4. **Clear next step** — Link to Brief. That's it. No other asks.

5. **Inverse incentive** — "keep it anyway" removes pressure. They own the decision. This is powerful psychology.

**What NOT in the email:**
- No sales pitch
- No "book a call"
- No company narrative
- No "I'd love to..."
- No closing lines like "looking forward to hearing from you"
- No pressure
- No features

**What IS in the email:**
- Acknowledgment they need something
- Proof we listened (Brief)
- Respect for their time
- Permission to say no
- Their agency restored

**Tool:** Claude (communication engine)

---

## STAGE 6: APPROVAL QUEUE

**Responsible for:**
- Display to operator in one view:
  - Original Post
  - Extracted Need / Urgency / Context
  - Courier Readiness Brief (preview or link)
  - Email (full preview)
  - [SEND] button per row
  - [SEND ALL] button

**Location:** `/operator/settings` metamorphoses into Approval Queue view

**Why human approval:**

This is where companies destroy domains. The automated matching might miss something. The brief might be off. The timing might be wrong.

Five seconds of human eyes prevents hours of damage.

**What operator sees:**

```
Original Post:
"We're looking for a reliable same-day courier..."

↓

Extracted Need:
Need: Same-day courier
Urgency: High
Context: Legal practice, Manchester

↓

Brief Preview:
[Courier Readiness Brief for ABC Law]

↓

Email Draft:
"Hi Sarah, A little birdie told me you're looking for..."

↓

[SEND] or [SEND ALL]
```

**Operator's job:**
- Scan the extraction (is it right?)
- Scan the brief (does it fit?)
- Scan the email (does it feel right?)
- Click SEND or skip

**Time budget:** 5 seconds per opportunity

---

## STAGE 7: SEND

**Responsible for:**
- Send email via Resend
- Store in database (email sent record)
- Begin tracking

**Location:** Existing Resend integration (use `/operator/enrich` infrastructure)

**What happens:**
1. Operator clicks [SEND]
2. System sends email to prospect
3. System logs send in database
4. System begins tracking (opens, clicks, replies)

**Tool:** Resend API (already integrated)

---

## STAGE 8: TRACK

**Responsible for:**
- Monitor opens (opens_at)
- Monitor clicks (clicked_at)
- Monitor replies (replied_at, reply_content)
- Correlate back to original opportunity

**Tracking events:**
- Email delivered
- Email opened
- Link clicked
- Email replied
- Reply received

**Location:** Existing webhook infrastructure (Resend webhook → `/api/b2b/email-response/webhook`)

**What to track:**
- When they engaged
- How they engaged
- What they said (if replied)

**Goal:** Relationship Engine needs this data to know when to activate

---

## STAGE 9: RELATIONSHIP ENGINE

**Activation:** Only after engagement (open, click, or reply)

**Responsible for:**
- Analyze their reply (if any)
- Determine next action
- Recommend to operator

**Example flow:**

They replied: "This looks good. Can you call us?"

Relationship Engine says: "Ready for phone call. Schedule within 48 hours."

They clicked the link but didn't reply:

Relationship Engine says: "Interested but not ready to commit. Follow up in 3 days."

They didn't open:

Relationship Engine says: "No engagement yet. Follow up in 5 days."

**Tool:** Claude (reasoning engine) + stored context

---

## SUCCESS METRIC

**NOT:**
- Emails sent ❌
- Open rate ❌
- Click rate ❌
- Reply rate ❌

**IS:**

**Conversion Rate = (YES responses) / (Opportunities sent)**

Where YES response means:

"This is what we need. We want to work with you. Can we start now?"

This is the only metric that matters.

Everything else is just mechanics.

---

## IMMUTABLE RULES

1. **Never invent.** The confession is complete. Extract only. Don't add psychology.

2. **Never skip extraction.** Every opportunity must be extracted. The four fields (Need, Urgency, Context, Quote) are non-negotiable.

3. **Never skip the Brief.** Every opportunity gets a one-page Brief. Not an email preview, not a generic doc. A true Brief responding to their stated need.

4. **Never skip human approval.** Autonomous sending is for later. For now, the operator reviews before send.

5. **Never skip Relationship Engine.** It only wakes on engagement. If they don't open/click/reply, it doesn't touch them.

6. **Never change the email structure.** Five sentences. Locked. The psychology is embedded in the structure itself.

7. **Never add marketing.** The Brief is evidence. The email is permission. Neither is sales.

---

## IMPLEMENTATION TIMELINE

**This is NOT phased. This is built once, all at once.**

1. Database: Opportunity table ✓
2. CSV import UI (improve /operator/discover)
3. Extraction engine (new)
4. Brief generator (new)
5. Email generator (repurpose /operator/enrich)
6. Approval Queue (repurpose /operator/settings)
7. Send & Track (use existing infrastructure)
8. Relationship Engine (activate on engagement)

Then test. Then ship.

---

## WHY THIS WORKS

Businesses that publicly said "we need a courier" are in a buying moment.

We are not convincing them they have a problem. They already know.

We are not selling features. We are demonstrating understanding.

We arrive at the exact moment they are vulnerable and ready.

And our Brief proves we listened.

That combination creates YES responses.

---

## THIS IS THE CONSTITUTION

Follow it exactly.

Everything that matters is in this document.

Everything that doesn't matter is out.

No overthinking. No second-guessing. No "what if we also..."

Build this. Ship this. Learn from the YES responses.

That is the system.
