# Operator Problem-Centric System — End-to-End Example

This document shows how the complete system works with a real example.

## Example: A Solicitor's Court Deadline Problem

### Step 1: Confession Arrives (Discovery)

**Source**: Reddit post in r/legal_business
**Text**:
```
"We're a mid-size law firm and I'm pulling my hair out over court document deadlines. 
We use 3 different couriers because none of them are reliable. Yesterday we missed a filing 
because the courier didn't show up. The client is furious and we might lose the case. 
Does anyone know a same-day courier in London who actually shows up?"
```

**Contact Info Extracted**:
- Author: "Williams & Associates Solicitors" (inferred from profile)
- Email: Not available (will need to research)
- Phone: Not available
- Location: London
- LinkedIn: Not available (yet)

**Confidence Score**: 0.65 (problem clear, contact info incomplete)

---

### Step 2: System Processes (POST /api/operator/opportunity-feed/process)

**Step 2a: Legitimacy Filter**
```
Indicators found: "need", "problem", "furious", "does anyone know"
Result: LEGITIMATE (genuine need, not advertising)
```

**Step 2b: Problem Type Extraction**
```
Keywords matched: "court", "deadline", "courier", "filing", "document"
Problem Type: court_deadline_delivery
Match strength: 5/7 keywords = 71% match
```

**Step 2c: Psychology Analysis**
```
inverse_incentive: "Missed court filings lose cases. Clients leave. Reputation damage."
loss_aversion_frame: "2+ hours daily managing courier coordination. Daily stress of failure risk."
authority_proof: "We understand how one missed deadline creates cascade failures across your caseload."
social_proof: "The confession shows others in their world have this problem too."
urgency_level: CRITICAL (they just had a near-miss, posted in frustration)
confidence: 0.78 (high urgency, clear problem, but incomplete contact)
```

**Step 2d: Brief Generation**
```
opening: "Hi [Name],

A little birdie told me about your court deadlines.

You said you're managing 3 couriers and still missing filings. 
That's not a courier problem — that's a system problem."

gap_section: "Right now, here's what's happening: 2+ hours daily coordinating couriers. 
Constant stress about failures. Yesterday you experienced exactly why: one no-show = case at risk.

If this continues: Filings get missed. Cases get dismissed. Clients leave."

possibility_section: "When your court deadlines are reliable, your team stops managing logistics 
and starts managing cases. Filing doesn't feel fragile anymore."

proof_section: "We know how court deadlines create cascade failures. One missed deadline compounds 
across your caseload. Filing systems need to work without thinking."

cta: "Curious what you think."

pre_populated_reply: "Let's talk about this."
```

**Step 2e: Routing Decision**
```
Problem Tier: 1 (court deadlines = time-critical, career/client affecting)
Confidence: 0.78
Route: APPROVAL_QUEUE (Tier 1 + confidence 0.60-0.79)

Reason: High urgency and clear problem, but missing key contact info.
Jimi should review and help identify the decision-maker before sending.
```

**Database Record Created**:
```
id: opp_12345
problemType: "court_deadline_delivery"
companyName: "Williams & Associates Solicitors"
location: "London"
originalWording: [full Reddit post]
extractedNeed: "Same-day court document courier with reliability"
psychologyAnalysis: {
  problem_type: "court_deadline_delivery",
  inverse_incentive: "Missed court filings lose cases...",
  loss_aversion_frame: "2+ hours daily managing couriers...",
  authority_proof: "We understand how court deadlines...",
  urgency_level: "CRITICAL",
  confidence: 0.78
}
briefHtml: [generated HTML brief]
emailSubject: "Williams & Associates Solicitors – Court Deadline Reliability"
emailBody: [assembled brief + CTA]
prePopulatedReply: "Let's talk about this."
routingTier: 1
confidenceScore: 0.78
approvalStatus: "pending"
jamesStatus: null
status: "discovered"
createdAt: 2026-07-06T12:34:00Z
```

---

### Step 3: Jimi's Approval Queue

**Jimi logs into /operator/settings**

**Sees Approval Queue Organized by Problem Type**:
```
TIER 1 (Critical) - 3 Pending
├── court_deadline_delivery: 1
│   └── Williams & Associates Solicitors (0.78 confidence)
│       Preview: "Hi [Name], A little birdie told me about your court deadlines..."
│       [Approve] [Reject] [Edit]
├── hospital_supply_delivery: 1
│   └── St. Mary's Hospital (0.85 confidence)
│       [Approve] [Reject] [Edit]
└── pharmacy_prescription_delivery: 1
    └── Central Pharmacy (0.82 confidence)
        [Approve] [Reject] [Edit]
```

**Jimi Reviews Williams & Associates**:
- Reads original Reddit post ✓ (genuine problem)
- Reads generated brief ✓ (shows understanding, mentions cascade failures)
- Notes: "Missing email. Need to research contact."

**Jimi's Action**: 
```
[Edit] to add contactEmail from LinkedIn research: michael.williams@williams-assocs.co.uk
[Approve]
```

**Database Update**:
```
approvalStatus: "approved"
contactEmail: "michael.williams@williams-assocs.co.uk"
contactName: "Michael Williams"
updatedAt: 2026-07-06T13:15:00Z
```

---

### Step 4: Send (POST /api/operator/opportunity-feed/send)

**Jimi clicks "Send Approved"** or it triggers automatically (Tier 1)

**Email Sent via Resend**:
```
To: michael.williams@williams-assocs.co.uk
From: james@saintandstory.co.uk
Subject: Williams & Associates Solicitors – Court Deadline Reliability

Body:
Hi Michael,

A little birdie told me about your court deadlines.

You said you're managing 3 couriers and still missing filings. 
That's not a courier problem — that's a system problem.

Right now, here's what's happening: 2+ hours daily coordinating couriers. 
Constant stress about failures. Yesterday you experienced exactly why: 
one no-show = case at risk.

If this continues: Filings get missed. Cases get dismissed. Clients leave.

When your court deadlines are reliable, your team stops managing logistics 
and starts managing cases. Filing doesn't feel fragile anymore.

We know how court deadlines create cascade failures. One missed deadline 
compounds across your caseload. Filing systems need to work without thinking.

Curious what you think.

James

---

Ready to reply? Use this:

Let's talk about this.

(Edit if you want, but one sentence is perfect)
```

**Database Update**:
```
status: "sent"
sentAt: 2026-07-06T13:20:00Z
resendId: "email_abcdef123456" (for webhook tracking)
jamesStatus: "pending"
updatedAt: 2026-07-06T13:20:00Z
```

---

### Step 5: Prospect Opens Email (Webhook)

**Resend sends webhook**: email opened by michael.williams@williams-assocs.co.uk

**Database Update**:
```
openedAt: 2026-07-06T13:45:00Z
jamesStatus: "warm"
updatedAt: 2026-07-06T13:45:00Z
```

**James's Dashboard**: Now shows Williams & Associates as "Warm" lead

---

### Step 6: Prospect Replies

**Michael clicks reply and sends**:
```
To: james@saintandstory.co.uk
Subject: Re: Williams & Associates Solicitors – Court Deadline Reliability

Body:
Let's talk about this.
```

**Resend webhook**: reply received

**Database Update**:
```
repliedAt: 2026-07-06T14:00:00Z
replyContent: "Let's talk about this."
jamesStatus: "hot"
status: "replied"
updatedAt: 2026-07-06T14:00:00Z
```

**James's Dashboard**: Now shows Williams & Associates as "Hot" lead (ready for conversation)

---

### Step 7: James Takes Over

**James responds**:
```
Hi Michael,

Great — let's dive into this.

Looking at what you've described:
- 3 couriers, inconsistent performance
- 2+ hours daily on logistics
- Yesterday's near-miss with the filing

Here's what I'm thinking: This isn't about finding a fourth courier. 
It's about having one courier who becomes invisible (you don't think about it).

We handle urgent court filings same-day, with backup driver on standby. 
But more importantly: you get predictability. Your team can focus on cases, 
not logistics.

Are we looking at same-day filings mainly, or regular weekly collections too?

Let me know and we can talk through pricing and availability.

James
```

**Michael's Response** (Day 2):
```
Hi James,

Both actually. We have urgent filings (~3-4 per week) and also regular 
weekly collection of bundles from court. Right now it's chaos.

What would that look like month-to-month?

Michael
```

**This is now a conversation. Status = CONVERSION.**

Michael has said YES (implicitly) by asking about pricing and structure. 
James moves to Standing Order conversation: pricing, frequency, service level.

---

## Key Insights from This Example

### What Made This Work

1. **Gap Revelation**: Brief didn't say "hire us." It said "here's what's actually happening" (2+ hours, missed filings, cascade risk). Michael felt SEEN.

2. **Psychology Invisible**: Michael didn't notice we were using inverse incentives (cases dismissed) or loss aversion (hours lost, stress). He just felt: "Yeah, that's true. That IS the problem."

3. **Authority Through Specificity**: "One missed deadline compounds across your caseload" — only someone who knows law firms talks like this. Credible.

4. **Human Language**: No "enterprise-grade logistics solutions" or "trusted by 500+ firms." Just James saying what he actually knows.

5. **Pre-Populated Reply**: Michael didn't have to write "Can you tell me about your service?" He just clicked "Let's talk" and edited it. Zero friction.

6. **Problem-Specific, Not Category-Specific**: We didn't talk about "solicitors" or "law firms." We talked about court deadlines, cascade failures, filing systems. Universal to anyone managing time-critical deliveries.

### Why Tier 1 + Confidence 0.78 = Approval Queue (Not Auto-Send)

- **High confidence** (0.78 ≥ 0.60) → definitely worth sending
- **Tier 1 problem** (court deadlines) → high urgency
- **But incomplete contact** (no email initially, had to research)
- **Decision**: Jimi checks that we have the right person before sending
- **Result**: Confidence in sending increases (Jimi researched + verified)

### Why This Prospect Converted

1. **Confessed a specific problem** (not "we need delivery services" but "our couriers fail")
2. **Had experienced recent pain** (missed filing yesterday)
3. **Brief proved understanding** (mentioned cascade failures, legal timeline pressure)
4. **Low friction reply** (one sentence, pre-written)
5. **Timing was acute** (they posted frustrated, same day James replied)
6. **James engaged as peer** (not salesperson, actual understanding of their world)

---

## Metrics This Generates

```
Date: 2026-07-06
Problem Type: court_deadline_delivery
Confession Source: reddit
Approval Status: approved
Sent: yes
Opened: yes (13:45)
Replied: yes (14:00)
Reply Time: 40 minutes
Conversation Status: ACTIVE (YES implied, waiting on pricing discussion)

This data feeds:
- Conversion rate by problem type (court_deadline_delivery: 100% so far)
- Speed-to-reply (40 minutes = very fast interest)
- Approval quality (Jimi's research improved confidence)
- Psychology effectiveness (brief achieved understanding)
```

---

## How to Replicate This

### For Any Confession

1. **Paste confession text** into `/api/operator/opportunity-feed/process`
2. **System extracts problem type**, analyzes psychology, generates brief
3. **Jimi reviews** in approval queue (organized by problem type + tier)
4. **Jimi approves** (and optionally researches contact info)
5. **Send** via Resend
6. **Track** opens, clicks, replies via webhooks
7. **James responds** when they reply

### Test It

```bash
# 1. Send a confession through the process API
curl -X POST http://localhost:3000/api/operator/opportunity-feed/process \
  -H "Content-Type: application/json" \
  -d '{
    "confession_text": "We are a solicitor and constantly missing court deadlines because our courier is unreliable. Does anyone know a same-day courier in London?",
    "company_name": "Example Solicitors",
    "contact_email": "test@example.com",
    "source_platform": "reddit",
    "source_url": "https://reddit.com/r/legal_business/..."
  }'

# Expected Response
{
  "success": true,
  "opportunity_id": "opp_xyz123",
  "problem_type": "court_deadline_delivery",
  "confidence": 0.78,
  "route": "APPROVAL_QUEUE",
  "status": "discovered",
  "approval_status": "pending",
  "brief_subject": "Example Solicitors – Court Deadline Reliability"
}

# 2. View approval queue
curl http://localhost:3000/api/operator/opportunity-feed/queue?approvalStatus=pending

# 3. Approve it
curl -X PATCH http://localhost:3000/api/operator/opportunity-feed/opp_xyz123 \
  -H "Content-Type: application/json" \
  -d '{"approvalAction": "approve"}'

# 4. Send it
curl -X POST http://localhost:3000/api/operator/opportunity-feed/send \
  -H "Content-Type: application/json" \
  -d '{"opportunityIds": ["opp_xyz123"]}'

# 5. Monitor dashboard
# Open /operator/today for James view
# Open /operator/settings for Jimi queue
```

---

## This is the System

Everything described above is live and working.

- Confessions → Problem extraction ✓
- Psychology analysis → Brief generation ✓
- Routing by tier + confidence ✓
- Approval queue for Jimi ✓
- Send with pre-populated reply ✓
- Webhook tracking (opens, clicks, replies) ✓
- James conversation dashboard ✓

**Next: Test with real confessions and watch YES conversations happen.**
