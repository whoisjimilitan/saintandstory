# Conversation Intelligence — Implementation Specification

**Priority:** 1 (Highest)  
**Status:** Specification locked. Ready for implementation.  
**Deployment:** Replace/enhance ProspectCard component.  
**Date:** 2026-06-15

---

## CORE PROBLEM

Operator sees:
```
Westpoint Pharmacy
Warm
Opened 3x
Clicked 1x
Follow up today
```

But cannot answer:
- What did we send?
- Why did they open?
- Why didn't they reply?
- What should I send next?

---

## SOLUTION: CONVERSATION AS PRIMARY OBJECT

Operator clicks prospect → sees complete conversation state, not company state.

---

## UI SPECIFICATION

### Section 1: Conversation Header

**Display:**
```
CONVERSATION: [Company Name]

[Status Badge: COLD | WARM | HOT | REPLIED | MEETING | WON | LOST]
```

**Query:** `SELECT business_name, status FROM b2b_leads WHERE id = ?`

---

### Section 2: Message Sent (Most Important)

**Display:**
```
MESSAGE SENT

From: Saint & Story
To: contact@[company].com
Subject: [Actual subject line]
Date Sent: [Date, time ago]

[Full email body exactly as sent]
```

**Why exact email:**
- Operator can see why prospect opened/clicked/didn't reply
- Basis for behavioral analysis
- Accountability for what was actually sent

**Query:**
```sql
SELECT 
  email_sent_at,
  email_subject,
  email_body,
  recipient_email
FROM b2b_leads 
WHERE id = ?
```

**Note:** This data needs to be stored. Currently it may not be.

---

### Section 3: Prospect Behavior

**Display:**
```
PROSPECT BEHAVIOR

Opened: 3 times
Last open: 2 days ago

Clicked: 1 time
Last click: 2 days ago

Replied: 0 times

Last activity: 2 days ago
```

**Behavioral signals:**
- `email_opened_count` (INTEGER, default 0)
- `email_clicked_count` (INTEGER, default 0)
- `email_replied` (BOOLEAN, default false)
- `last_interaction_at` (TIMESTAMP)

---

### Section 4: System Assessment

**Display — Psychology-Informed Analysis:**
```
SYSTEM ASSESSMENT

[1-3 sentence interpretation based on data]

Example 1 — High interest, unclear value:
"Multiple opens indicate strong interest. Click shows specific curiosity. 
No reply suggests our transformation message wasn't clear enough, or 
prospect is still deciding. Likely needs human follow-up with social proof."

Example 2 — Interest cooling:
"Two opens over 5 days, but no recent activity. Interest may be cooling. 
If no action in 24 hours, follow-up required to prevent loss."

Example 3 — Strong engagement:
"Opened twice, clicked twice, read email thoroughly. This prospect 
is actively evaluating. Next step: Call today before they decide elsewhere."
```

**Assessment logic:**
1. **Interest level:** Open count + click count + recency
2. **Psychology interpretation:** What emotion/transformation is missing?
3. **Risk assessment:** Is prospect cooling? Stuck? Engaged?
4. **Next-step implication:** What action prevents loss or creates progress?

---

### Section 5: Recommended Action (Single)

**Display:**
```
RECOMMENDED ACTION

[ONE action only. Never multiple.]

Example 1:
Call today.

Example 2:
Send case study from similar pharmacy.

Example 3:
Schedule demo (they're ready).
```

**Action rules:**
- Only one action recommended per conversation
- Action should be the next highest-leverage step
- Action should be immediately executable

**Action types:**
- Call
- Send [specific thing]
- Schedule [specific thing]
- Follow-up email with [specific message type]
- No action (already completed)

---

## DATA REQUIREMENTS

To build Conversation Intelligence, we need:

### Current tables that likely exist:
- `b2b_leads` (id, business_name, status, engagement_score, email_sent_at)

### New fields needed in `b2b_leads`:
```sql
ALTER TABLE b2b_leads ADD COLUMN (
  email_subject VARCHAR(255),
  email_body TEXT,
  recipient_email VARCHAR(255),
  email_opened_count INT DEFAULT 0,
  email_clicked_count INT DEFAULT 0,
  email_replied BOOLEAN DEFAULT false,
  last_interaction_at TIMESTAMP,
  conversation_state VARCHAR(50) -- cold, warm, hot, replied, meeting, won, lost
);
```

### Tracking required:
- Email open events (from email provider integration)
- Email click events (from email provider integration)
- Email reply detection (from email provider integration)
- Last interaction timestamp (auto-updated on any action)

---

## COMPONENT STRUCTURE

**File:** `components/ConversationCard.tsx` (or extend existing ProspectCard)

**Props:**
```typescript
interface Conversation {
  id: string;
  business_name: string;
  status: 'cold' | 'warm' | 'hot' | 'replied' | 'meeting' | 'won' | 'lost';
  
  // Message
  email_sent_at: Date;
  email_subject: string;
  email_body: string;
  recipient_email: string;
  
  // Behavior
  email_opened_count: number;
  email_clicked_count: number;
  email_replied: boolean;
  last_interaction_at: Date;
  
  // Assessment (computed)
  assessment: string;
  recommended_action: string;
}
```

**Rendering:**
1. Header (company + status badge)
2. Message sent (expandable/collapsible for long emails)
3. Behavior metrics (inline)
4. Assessment (narrative text)
5. Action (bold, high contrast)

---

## EXAMPLE: FULL CONVERSATION VIEW

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

CONVERSATION: Westpoint Pharmacy

[WARM]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

MESSAGE SENT

From: Saint & Story
To: info@westpoint.co.uk
Subject: Pharmacy Transport Solutions — Save Time & Reduce Costs
Sent: 4 days ago

Dear Pharmacy Manager,

We help independent pharmacies reduce delivery costs while improving customer service.

Westpoint Pharmacy specifically: You manage deliveries across 5+ postcodes. 
That's 15-20 trips per week you're coordinating manually.

Most pharmacies like you spend £200-400/week on courier services.

We help you cut that in half while improving reliability.

Would 20 minutes for a quick chat be worth exploring?

Best,
Saint & Story

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

PROSPECT BEHAVIOR

Opened: 3 times
Clicked: 1 time  
Replied: 0 times
Last activity: 2 days ago

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

SYSTEM ASSESSMENT

Multiple opens indicate genuine interest — your specific message 
about delivery costs resonated. The click suggests they explored 
the solution. No reply yet means either: (a) they're still deciding, 
or (b) they need a human confirmation that this applies to their situation.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

RECOMMENDED ACTION

Call today.

Lead with: "I see you've opened this a few times — clearly interested. 
Quick question: are you currently managing courier costs manually?"

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

## PSYCHOLOGY INTEGRATION

### Assessment logic applies sales psychology:

**Emotion-first interpretation:**
- Multiple opens = emotional resonance (feeling, not logic)
- Click = interest became specific (they want details)
- No reply = uncertainty remains (needs human confirmation)

**Transformation focus:**
- Assessment mentions: "reduce costs" + "improve reliability" (transformation)
- Not: "email marketing tool" (feature)

**Pain over desire:**
- Opens reference problem they have ("15-20 trips per week")
- Doesn't push benefit ("let's grow your business")

**Specificity = credibility:**
- Mentions their exact situation ("5+ postcodes", "£200-400/week")
- Not generic ("many pharmacies")

---

## DEPLOYMENT ROADMAP

### Phase 1: Data Infrastructure
- Add fields to `b2b_leads` table
- Set up email event tracking (open/click/reply detection)
- Backfill existing data where available

### Phase 2: UI Component
- Build ConversationCard component
- Implement assessment logic
- Implement action recommendation logic

### Phase 3: Integration
- Replace ProspectCard with ConversationCard in Today Queue
- Add Conversation view to Pipeline
- Test with production data

### Phase 4: Monitoring
- Track operator usage
- Monitor which recommendations are followed
- Collect feedback on accuracy

---

## SUCCESS CRITERIA

Conversation Intelligence is successful when:

1. **Operator can instantly answer:** What did we send? (Email visible)
2. **Operator can instantly answer:** How did they respond? (Behavior visible)
3. **Operator can instantly answer:** What do I do now? (Action clear)
4. **Operator no longer interprets signals** (Assessment provided)
5. **Conversation becomes primary mental model** (Not "leads" or "opportunities")

---

## WHAT THIS ENABLES NEXT

Once Conversation Intelligence is deployed:

**Behavior Intelligence becomes buildable:**
- "Which messages get the most opens?"
- "Which subject lines drive clicks?"
- "Which industries show highest engagement?"

Without Conversation Intelligence, those questions are unanswerable.

---

## CRITICAL NOTES

1. **This is Priority 1** — Not later. Deploy this first. Everything else waits.

2. **Conversation is the primary object** — Not company, not opportunity, not lead.

3. **Actual email, not template** — Operator needs to see exactly what was sent.

4. **One action, never multiple** — No options. Operator executes or consciously deviates.

5. **Psychology shapes assessment** — How we interpret behavior should reflect sales psychology.

6. **No new dashboards yet** — Everything feeds back to conversation understanding.

