# MOVEMENT INTELLIGENCE LAYER - VERSION 1 (MVP)

## PRINCIPLE: SIMPLE RULES, NO COMPLEXITY

**What we're building**:
Not an AI prediction engine.
Not a confidence scoring system.
Not a machine learning model.

**What we're building**:
A simple rule-based layer that answers one question: **"What is this business likely moving?"**

---

## THE CONSTRAINTS

✓ No new database tables  
✓ No schema migrations  
✓ No Prisma changes  
✓ No production risk  
✓ Store everything in existing `business_evidence` JSON field  
✓ Works with leads already discovered  
✓ Rule-based, not AI-based  

---

## MOVEMENT DETECTION RULES

Simple if/then logic. No complexity.

### RULE 1: SOLICITORS / LAW FIRMS

**When**: `business_category` contains "Solicitor" OR "Law Firm" OR "Attorney" OR "Legal Services"

**Then**: Likely movements are:

```
1. Court Filing Documents
   Trigger: Legal deadline
   Estimated Frequency: 10-20/month
   Estimated Monthly Value: £1,500–£5,000
   Pitch: "How are you currently handling urgent court filing deadlines?"
   Action: CALL TODAY

2. Signed Legal Contracts
   Trigger: After signature (next-day deadline)
   Estimated Frequency: 5-10/month
   Estimated Monthly Value: £500–£2,000
   Pitch: "When contracts get signed, there's always a deadline for the other side."
   Action: EMAIL SEQUENCE

3. Property Completion Documents
   Trigger: Friday closing deadlines
   Estimated Frequency: 2-5/week (if they do property law)
   Estimated Monthly Value: £800–£3,000
   Pitch: "What happens when completion keys and documents need moving Friday?"
   Action: CALL TODAY
```

---

### RULE 2: ESTATE AGENTS / PROPERTY

**When**: `business_category` contains "Estate Agent" OR "Property" OR "Conveyancing" OR "Real Estate"

**Then**: Likely movements are:

```
1. Property Completion Keys & Documents
   Trigger: Friday closing deadlines (fixed)
   Estimated Frequency: 2-5/week
   Estimated Monthly Value: £800–£3,500
   Pitch: "What happens when keys or completion documents need moving on closing day?"
   Action: CALL TODAY

2. Urgent Valuation Documents
   Trigger: Client request (variable)
   Estimated Frequency: 1-2/week
   Estimated Monthly Value: £300–£800
   Pitch: "When a client needs a valuation today, how does it get to them?"
   Action: EMAIL SEQUENCE

3. Mortgage & Contract Documents
   Trigger: Deal progress (variable)
   Estimated Frequency: 3-5/week
   Estimated Monthly Value: £400–£1,200
   Pitch: "During deals, documents are constantly moving between offices and clients."
   Action: EMAIL SEQUENCE
```

---

### RULE 3: CONSTRUCTION / BUILDING

**When**: `business_category` contains "Construction" OR "Builder" OR "Contractor" OR "Building Services" OR "Engineering"

**Then**: Likely movements are:

```
1. Emergency Site Materials
   Trigger: Site breakdown / missing component (reactive)
   Estimated Frequency: 1-3/month
   Estimated Monthly Value: £300–£1,500
   Pitch: "What happens when a critical component doesn't arrive and a crew is standing idle?"
   Action: CALL TODAY

2. Revised Drawings / Specifications
   Trigger: Site change order (variable)
   Estimated Frequency: 1-2/month
   Estimated Monthly Value: £200–£600
   Pitch: "When specs change on site, how quickly does the crew get the updates?"
   Action: EMAIL SEQUENCE

3. Safety Certificates / Compliance Documents
   Trigger: Inspection / certification deadline
   Estimated Frequency: 1-2/month
   Estimated Monthly Value: £300–£800
   Pitch: "How do safety certificates get to inspection sites on deadline?"
   Action: EMAIL SEQUENCE
```

---

### RULE 4: MEDICAL / PHARMACY

**When**: `business_category` contains "Medical" OR "Pharmacy" OR "Clinic" OR "Hospital" OR "Laboratory" OR "Dental" OR "Healthcare"

**Then**: Likely movements are:

```
1. Prescription / Medication Transfers
   Trigger: Patient emergency OR scheduled (both)
   Estimated Frequency: 3-10/week
   Estimated Monthly Value: £800–£3,000
   Pitch: "How do you handle emergency prescription needs between locations?"
   Action: CALL TODAY

2. Medical Specimens / Lab Transfers
   Trigger: Test processing (daily)
   Estimated Frequency: 10-50/day (if hospital lab)
   Estimated Monthly Value: £2,000–£8,000
   Pitch: "How are urgent specimens currently moved between your locations?"
   Action: CALL TODAY (if hospital-affiliated)

3. Medical Records / Documentation
   Trigger: Patient transfer OR compliance
   Estimated Frequency: 1-5/week
   Estimated Monthly Value: £200–£800
   Pitch: "When medical records need to move between clinics, what's your current process?"
   Action: EMAIL SEQUENCE
```

---

### RULE 5: ACCOUNTING / TAX / FINANCIAL

**When**: `business_category` contains "Accountant" OR "Tax" OR "Bookkeeper" OR "Audit" OR "Financial" OR "Finance"

**Then**: Likely movements are:

```
1. Tax Filing Documents
   Trigger: Tax deadline (fixed, seasonal)
   Estimated Frequency: 2-10/month (seasonal)
   Estimated Monthly Value: £400–£1,500
   Pitch: "How are urgent tax documents currently getting to filing deadlines?"
   Action: EMAIL SEQUENCE

2. Financial Records / Statements
   Trigger: Deadline or client request
   Estimated Frequency: 2-5/month
   Estimated Monthly Value: £300–£800
   Pitch: "When clients need urgent financial documents, how do they get them?"
   Action: EMAIL SEQUENCE

3. Audit Documentation
   Trigger: Audit period
   Estimated Frequency: 5-10/month (seasonal)
   Estimated Monthly Value: £500–£1,500
   Pitch: "During audit season, how are documents moving between your office and client sites?"
   Action: EMAIL SEQUENCE
```

---

### RULE 6: MARKETING / EVENTS / PROMOTIONAL

**When**: `business_category` contains "Marketing" OR "Events" OR "PR" OR "Promotion" OR "Advertising" OR "Design Studio"

**Then**: Likely movements are:

```
1. Event Equipment / Materials
   Trigger: Event day (fixed deadline)
   Estimated Frequency: 2-10/month
   Estimated Monthly Value: £400–£1,500
   Pitch: "What happens when promotional materials need to arrive for an event?"
   Action: EMAIL SEQUENCE

2. Print / Marketing Collateral
   Trigger: Campaign launch or deadline
   Estimated Frequency: 1-5/month
   Estimated Monthly Value: £200–£800
   Pitch: "When marketing materials have a deadline, how are they delivered?"
   Action: EMAIL SEQUENCE

3. Client Deliverables
   Trigger: Project deadline
   Estimated Frequency: 2-5/month
   Estimated Monthly Value: £300–£1,000
   Pitch: "When client deliverables are needed urgently, how do they get there?"
   Action: EMAIL SEQUENCE
```

---

## DASHBOARD: SIMPLE VERSION

### For Each Discovered Lead

```
WILSON SOLICITORS

Business Category: Law Firm / Solicitor

Likely Movements:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. Court Filing Documents
   Trigger: Legal deadline
   Frequency: 10-20 per month
   Monthly Value: £1,500–£5,000
   Action: CALL TODAY
   
   Suggested Opening:
   "Hi Jonathan, how are you currently handling urgent court filing
    deadlines? Most firms we work with find that same-day service is
    critical when court windows are closing."

2. Signed Legal Contracts
   Trigger: After signature (next-day deadline)
   Frequency: 5-10 per month
   Monthly Value: £500–£2,000
   Action: EMAIL SEQUENCE
   
   Suggested Opening:
   "When contracts get signed, there's always a deadline for the other
    side. We handle contract transfers so deals don't stall."

3. Property Completion Documents
   Trigger: Friday closing deadlines
   Frequency: 2-5 per week
   Monthly Value: £800–£3,000
   Action: CALL TODAY
   
   Suggested Opening:
   "What happens when completion keys and documents need moving on
    Friday? We handle Friday closings so buyers and sellers never
    worry about timing."

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Total Estimated Monthly Value: £2,800–£10,000
Recommended Action: CALL TODAY about court filings and completion documents
```

---

## DASHBOARD: BULK VIEW

### "Who Should I Call First?"

```
MOVEMENT INTELLIGENCE - TODAY'S PRIORITY CALLS

Sort by: Highest estimated value first

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. Law Firm Manchester
   Primary Movement: Court Filing Documents
   Trigger: Legal deadline
   Estimated Value: £2,000–£6,000/month
   Action: CALL TODAY
   
   "How are you currently handling urgent court filing deadlines?"
   
   [CALL NOW] [EMAIL] [SKIP]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

2. Estate Agent Central London
   Primary Movement: Property Completion Keys
   Trigger: Friday closing deadlines
   Estimated Value: £1,200–£3,500/month
   Action: CALL TODAY
   
   "What happens when keys need moving on completion day?
    We handle Friday closings."
   
   [CALL NOW] [EMAIL] [SKIP]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

3. Construction Firm Birmingham
   Primary Movement: Emergency Site Materials
   Trigger: Site breakdown (crew idle = £1000s/hour)
   Estimated Value: £800–£2,500/month
   Action: CALL TODAY
   
   "What happens when a critical component doesn't arrive
    and a crew is standing idle?"
   
   [CALL NOW] [EMAIL] [SKIP]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

4. Medical Lab Southwark
   Primary Movement: Medical Specimens
   Trigger: Same-day hospital transfer
   Estimated Value: £2,500–£8,000/month
   Action: CALL TODAY
   
   "How are urgent specimens currently moved between
    your locations?"
   
   [CALL NOW] [EMAIL] [SKIP]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

[Show 20 results] [Filter by movement type] [Filter by action]
```

---

## STORAGE: EXISTING JSON FIELD

No new columns. Store in `business_evidence` JSONB:

```json
{
  "discovery_data": {
    "google_place_id": "...",
    "business_name": "Wilson Solicitors",
    "reviews": [...],
    "rating": 4.7
  },
  "movement_intelligence_v1": {
    "detected_movements": [
      {
        "movement_type": "Court Filing Documents",
        "trigger": "Legal deadline",
        "frequency_estimate": "10-20/month",
        "monthly_value_low": 1500,
        "monthly_value_high": 5000,
        "currency": "GBP",
        "recommended_action": "CALL_TODAY",
        "suggested_pitch": "Hi Jonathan, how are you currently handling urgent court filing deadlines?",
        "rule_matched": "RULE_SOLICITOR_1"
      },
      {
        "movement_type": "Signed Legal Contracts",
        "trigger": "After signature (next-day deadline)",
        "frequency_estimate": "5-10/month",
        "monthly_value_low": 500,
        "monthly_value_high": 2000,
        "currency": "GBP",
        "recommended_action": "EMAIL_SEQUENCE",
        "suggested_pitch": "When contracts get signed, there's always a deadline for the other side.",
        "rule_matched": "RULE_SOLICITOR_2"
      }
    ],
    "total_monthly_value_low": 2800,
    "total_monthly_value_high": 10000,
    "primary_action": "CALL_TODAY",
    "generated_at": "2026-06-03T10:30:00Z"
  }
}
```

---

## IMPLEMENTATION: ONE FUNCTION

```typescript
// lib/movement-intelligence.ts

export function detectLikelyMovements(businessCategory: string): Movement[] {
  const movements: Movement[] = [];

  // RULE 1: Solicitors
  if (["solicitor", "law firm", "attorney", "legal services"].some(cat => 
    businessCategory.toLowerCase().includes(cat))) {
    movements.push({
      type: "Court Filing Documents",
      trigger: "Legal deadline",
      frequency: "10-20/month",
      value: { low: 1500, high: 5000 },
      action: "CALL_TODAY",
      pitch: "How are you currently handling urgent court filing deadlines?"
    });
    movements.push({
      type: "Signed Legal Contracts",
      trigger: "After signature (next-day deadline)",
      frequency: "5-10/month",
      value: { low: 500, high: 2000 },
      action: "EMAIL_SEQUENCE",
      pitch: "When contracts get signed, there's always a deadline for the other side."
    });
    movements.push({
      type: "Property Completion Documents",
      trigger: "Friday closing deadlines",
      frequency: "2-5/week",
      value: { low: 800, high: 3000 },
      action: "CALL_TODAY",
      pitch: "What happens when completion keys and documents need moving Friday?"
    });
  }

  // RULE 2: Estate Agents
  if (["estate agent", "property", "conveyancing", "real estate"].some(cat =>
    businessCategory.toLowerCase().includes(cat))) {
    movements.push({
      type: "Property Completion Keys & Documents",
      trigger: "Friday closing deadlines (fixed)",
      frequency: "2-5/week",
      value: { low: 800, high: 3500 },
      action: "CALL_TODAY",
      pitch: "What happens when keys or completion documents need moving on closing day?"
    });
    // ... more movements
  }

  // RULE 3-6: Other categories
  // ... similar pattern

  return movements;
}
```

Call this once per discovered lead:

```typescript
// app/api/b2b/discover/route.ts - at insertion time

const movements = detectLikelyMovements(niche);

await sql`
  UPDATE b2b_leads 
  SET business_evidence = jsonb_set(
    business_evidence,
    '{movement_intelligence_v1}',
    ${JSON.stringify({ detected_movements: movements })}::jsonb
  )
  WHERE id = ${leadId}
`;
```

---

## WHAT THIS DOES NOT DO (YET)

✗ No confidence scoring  
✗ No AI analysis  
✗ No review text parsing  
✗ No predictive models  
✗ No complex algorithms  

---

## WHAT THIS DOES (IMMEDIATELY)

✓ Shows salespeople what this business is likely moving  
✓ Shows the trigger that makes them need the movement  
✓ Shows estimated monthly value  
✓ Tells them what to say in the first call  
✓ Organizes by action (Call Today vs Email Sequence)  
✓ Answers: "Who should I call first?"  
✓ Zero production risk (stored in existing JSON)  
✓ Zero schema changes  
✓ Can be built in hours, not weeks  

---

## THE SALES WORKFLOW

### Day 1: Discover 50 businesses

System runs movement detection rules.

Result:
```
47 businesses have detected movements
3 have no detected movements (not our market)

Total movement value: £156,000–£485,000/month
```

### Day 2: Open dashboard

Sales team sees:

```
"Who should I call first?"

1. Law Firm Manchester - Court Filings
   Value: £2,000–£6,000/month
   Trigger: Legal deadline
   Call: "How are you handling court filing deadlines?"

2. Estate Agent London - Property Completions
   Value: £1,200–£3,500/month
   Trigger: Friday closings
   Call: "What happens when keys need moving Friday?"

3. Medical Lab - Specimens
   Value: £2,500–£8,000/month
   Trigger: Same-day transfer
   Call: "How are specimens moving between locations?"
```

### Day 2–3: Sales team calls top 15

Each call uses the suggested pitch (movement-focused, not generic).

Example call to Law Firm:

```
"Hi Jonathan, I'm calling because I noticed you do litigation work.
How are you currently handling urgent court filing deadlines?

We work with firms to ensure court bundles and evidence get to the
court on time. Most firms find that same-day service is critical
when filing windows are closing.

Can we discuss what happens when you have a deadline coming up?"
```

### Day 5: Results

```
3 firms interested in trial
2 immediate standing order conversations
1 meeting scheduled

Week 1 result: 1-2 new standing orders
Month 1 result: 4-8 new standing orders
```

---

## SUCCESS METRICS

### For Version 1

**Does this work?**
- Do salespeople prefer "movement view" over "company list"?
- Do calls close when using movement-based pitch?
- Do discovered businesses convert when called about their likely movement?

**If YES**: Expand to more movements, add triggers, optimize pitches.  
**If NO**: Iterate quickly (all stored in JSON, easy to change).

---

## THE PHILOSOPHY

Don't build the perfect system.

Build the simplest system that proves the concept.

Rules-based, not AI-based.
Fast to build, fast to iterate, fast to tear out if it doesn't work.

The goal: **Prove that movement-focused selling works before building sophisticated intelligence.**

Once salespeople close deals using this simple version, then add:
- Trigger detection from reviews
- Confidence scoring
- Seasonal adjustment
- Standing order modeling
- etc.

But first: **Validate that the movement concept actually drives revenue.**

