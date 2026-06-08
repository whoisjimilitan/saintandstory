# Conversation System Spec (Tier 2 Step 4)

**Prepopulated Email → Conversation Framework Continuity System**

Architecture: Prospect clicks "See what's next" in email → Conversation booking → Structured 20-minute conversation flow → Follow-up action

---

## Core Principle

The conversation is NOT a sales call. It is the continuation of the operational pattern recognition thread started in the email and landing page. The prospect has already acknowledged the pattern. The conversation deepens understanding of application to their specific situation.

---

## Hard Rules (Locked Schema)

### Tone (Immutable)
- ✓ Consultant (advisory, specific, observational)
- ✓ Operational (grounded in known workflow friction)
- ✓ Calm analytical (no urgency, no hype)
- ✗ No vendor-speak
- ✗ No rhetorical questions
- ✗ No sales pressure

### Narrative (Locked to Email Context)
- ✓ Reference only what's in the email/landing page
- ✓ Expand on existing patterns only
- ✓ Confirm known operational friction
- ✗ No new problem discovery
- ✗ No new benefit introduction
- ✗ No reframing of prospect's situation

### Structure (5 Phases)

#### Phase 1: Opening Continuity Acknowledgement (400 chars max)
**Purpose**: Establish this is a continuation, not an introduction
- Reference email/landing page implicitly
- No re-introductions
- No small talk expansion
- Tone: calm operational acknowledgment

Example frame:
```
"Thanks for connecting. I saw you received our tracking on [industry] operations. 
Before we dive into how this applies to [company], I wanted to confirm we're looking 
at the same operational friction points you mentioned."
```

#### Phase 2: Operational Context Confirmation (500 chars max)
**Purpose**: Validate the prospect's existing operational reality
- Confirm known situation only
- Ask NO probing questions (statement-based confirmation)
- Focus on validating workflow friction already stated in email
- Mirror back what they've told you (implicit in email)

Example frame:
```
"From what we've seen across similar operations, the coordination friction typically 
surfaces in three places: same-day delivery scheduling, manual tracking across systems, 
and deadline coordination overhead. That pattern consistent with what you're managing?"
```

#### Phase 3: Continuity Deepening (600 chars max)
**Purpose**: Expand on patterns already established
- Expand ONLY previously stated patterns
- No new features or benefits
- No speculation
- Language mirrors landing page phrasing

Example frame:
```
"When operations are owned rather than brokered, the coordination becomes a competitive 
asset instead of a cost center. For [company], that would mean structured visibility across 
[specific operational domain]. Right now, that visibility lives in emails, phone calls, 
and manual tracking — distributed instead of consolidated."
```

#### Phase 4: Decision Framing (400 chars max)
**Purpose**: Present decision as logical continuation
- No pressure language
- No urgency manipulation
- No alternative offers
- Present as observation, not persuasion

Example frame:
```
"This is the point where we'd typically outline what ownership looks like in practice. 
It's a straightforward operational restructure — no technology replacement, just 
consolidation and visibility. Sound like something worth mapping out?"
```

#### Phase 5: Next Step Alignment (300 chars max)
**Purpose**: Single, clear path forward
- ONE next step only
- No multiple CTAs or optional branches
- Align with email system output

Example frame:
```
"Let's schedule a brief walkthrough of your current workflow so we can map where 
the ownership consolidation would have the highest impact. I'll send over a simple 
template you can review beforehand."
```

---

## CTA Constraints (Hard Locked)

- Single action only: "Schedule the walkthrough"
- No secondary options ("or we could...")
- No alternative CTAs on conversation outcome page
- Deferred decision: "Let's explore what this looks like for your operation"
- No pricing reveal in conversation (pricing is separate system)
- No upsell language

---

## Continuity Mapping

```
Prepopulated Email Content
  ↓
Conversation Opening (references email implicitly)
  ↓
Confirmation Phase (validates email observations)
  ↓
Deepening Phase (expands email patterns)
  ↓
Decision Frame (logical consequence of email narrative)
  ↓
Next Step Alignment (toward concrete workflow mapping)
```

All five phases must maintain reference to email content. No new narratives introduced.

---

## Visual Compliance (Tier 1 Locked)

Conversation interface (if any):
- Colors: #0D0D0D (text), #888888 (secondary), #F5F5F5 (bg), #E8E8E8 (borders), white (cards)
- Typography: font-black, font-semibold, text-sm, text-xs, text-[10px]
- Icons: Lucide only (MapPin, Phone, Play, Check, X)
- Spacing: p-5, gap-2, pt-4, mb-2, mt-4
- Borders: 1px solid #E8E8E8
- Shadows: Standard Tier 1 (no custom shadows)

---

## Validation Checklist (Before Shipping)

Conversation system must pass ALL checks:

- [ ] All 5 phases present and in order
- [ ] Phase 1 does NOT re-introduce context
- [ ] Phase 2 uses confirmation language only (no probing)
- [ ] Phase 3 expands ONLY existing patterns from email
- [ ] Phase 4 presents decision as logical consequence
- [ ] Phase 5 has single CTA only
- [ ] No rhetorical questions in any phase
- [ ] No vendor-speak in any phase
- [ ] No new problems introduced
- [ ] No new benefits introduced
- [ ] Email industry/company names preserved throughout
- [ ] Tone is consultant (advisory, observational, calm)
- [ ] Deferred decision framing maintained
- [ ] Tier 1 colors used consistently
- [ ] Tier 1 typography locked
- [ ] Tier 1 icons only
- [ ] Conversation → Next Step alignment unbroken
- [ ] Conversation preserves continuity from Prepopulated Email
- [ ] All character limits enforced (400/500/600/400/300)
- [ ] Validation passes with 0 violations

---

## Implementation Notes

**API Route**: `/api/dev/conversation-builder`

Query parameters:
- `industry` (required): industry slug
- `company` (required): company name
- `city` (required): city name
- `emailId` (optional): reference to prepopulated email system

Response:
- Structured conversation object with 5 phases
- Character counts per phase
- Validation result (PASS/FAIL)
- CTA metadata

**Client Component**: `ConversationEngine`

Props:
- `industry`: string
- `company`: string
- `city`: string
- `emailContent`: string (for continuity validation)
- `onCTAClick`: () => void

Behavior:
- Renders 5 phases in sequence
- Each phase is clickable/expandable
- CTA button at end (single only)
- No secondary interactions

---

## Error Handling

If validation fails:
- Return error with specific violations
- Do not render conversation
- Log violations to `/tmp/tier2_step4_validation_log.json`
- Example: `"phase2_introduces_new_problem", "rhetorical_question_detected"`

---

## Schema Reference

See `/tmp/tier2_step4_validation.json` for hard-locked validation schema.
All conversation generation MUST comply with schema constraints.
