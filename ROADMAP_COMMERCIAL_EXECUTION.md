# COMMERCIAL EXECUTION ROADMAP

**Effective Immediately**

---

## THE OPERATING SYSTEM

There are only 7 steps that matter:

```
Find → Qualify → Reason → Contact → Book → Learn → Repeat
```

Every component exists ONLY to improve one of these steps.

**The single metric:**
```
100 businesses discovered
↓
42 replied (42%)
↓
18 asked questions (43% of replies)
↓
9 created accounts (50% of questions)
↓
4 booked courier (44% of accounts)
↓
2 signed standing driver (50% of bookings)
```

That is not a goal. That is the measurement of whether the system works.

---

## WHAT CHANGES

### Before
```
Intelligence Metrics:
  • Psychology detection: 78%
  • Calibration accuracy: 85%
  • Stage accuracy: 80%
  
Success: "Engine reasons well"
```

### Now
```
Revenue Metrics:
  • Discovered → Revenue conversion
  • Reply rate
  • Booking rate
  • Recurring rate
  
Success: "More businesses asked for drivers"
```

---

## PHASE A: FREEZE ARCHITECTURE ✅ (DONE)

- No new intelligence layers
- No Phase 8
- No new reasoning objects
- Architecture is complete
- **Next: Execution**

---

## PHASE B: FIX EVERY BROKEN FEATURE (2 Weeks)

**Objective:** Every component of the 7-step workflow works flawlessly

### 1. **Discover Module**
Test every discovery method until all work:

```
□ Postcode search
  └─ Can find businesses by postcode?
  └─ Can filter by industry?
  └─ Returns contacts? (name, email, phone)
  └─ Has operational signals? (size, expansion signals)

□ Keyword search
  └─ "courier needed" finds relevant businesses?
  └─ "logistics" returns logistics companies?
  └─ Results have contact data?

□ Dork search
  └─ Google dorks find buried business pages?
  └─ Can extract emails from results?

□ Autonomous discover
  └─ Watches for hiring signals?
  └─ Watches for expansion signals?
  └─ Watches for funding?
  └─ Watches for new branches?

□ Pipeline imports
  └─ Can import from CSV?
  └─ Can import from API?
  └─ Maps fields correctly?
  └─ Deduplicates?
```

**Definition of Done:** Pick 1 method. Find 100 businesses. Verify contact data is correct.

### 2. **Qualify Module**
```
□ Can score businesses by likelihood to need drivers?
  └─ High-touch industries score higher
  └─ Operational signals matter
  └─ Growth signals matter

□ Can identify decision maker?
  └─ Office manager books couriers?
  └─ Operations director?
  └─ Procurement?
  └─ Founder/CEO?

□ Can flag current supplier?
  └─ Do they currently use DHL?
  └─ Do they currently use FedEx?
  └─ Do they handle in-house?

□ Can estimate revenue potential?
  └─ Company size matters
  └─ Industry matters
  └─ Expansion plans matter
```

**Definition of Done:** 100 qualified businesses with score, decision maker, current supplier, revenue potential.

### 3. **Contact Module**
```
□ Can send emails?
  └─ Via SMTP?
  └─ Personalized subject line?
  └─ Personalized greeting?

□ Can track opens?
  └─ Pixel tracking?
  └─ Counts replies?

□ Can send to multiple contacts at a business?
  └─ Office manager
  └─ Operations director
  └─ Procurement

□ Can retry non-responders?
  └─ Day 3 follow-up
  └─ Day 7 follow-up
  └─ Different angle each time
```

**Definition of Done:** Send 100 emails. Track opens. Measure reply rate.

### 4. **Book Module**
```
□ When prospect replies asking questions:
  □ Can schedule demo/call?
  □ Can send calendar link?
  □ Can send pricing?
  □ Can send example?

□ When prospect wants to book:
  □ Can accept booking?
  □ Can create standing order?
  □ Can send confirmation?

□ Can track booking funnel:
  □ "Asked question" → "Scheduled call"
  □ "Scheduled call" → "Accepted proposal"
  □ "Accepted proposal" → "First booking"
  □ "First booking" → "Recurring"
  □ "Recurring" → "Standing driver"
```

**Definition of Done:** At least 1 business completes full funnel from discovery to standing driver.

---

## PHASE C: REAL CAMPAIGN (3 Weeks)

**Objective:** Prove the workflow works with real businesses and real outcomes

### Campaign Parameters
```
Scale: 500 businesses
Source: Single discovery method (postcode search)
Target: Logistics, construction, healthcare
Measurement: Every step of the pipeline

Timeline: 21 days
Goal: 500 → 200 replied → 80 qualified → 20 booked → 5+ recurring
```

### What to Measure
```
Week 1: Discovery
  □ Found 500 businesses
  □ All have valid contact data
  □ All scored for likelihood
  □ All have decision maker identified

Week 2: Contact
  □ Sent 500 emails
  □ Tracked 400+ opens (80%)
  □ Got 200+ replies (40% of sent)
  □ Got 80 qualified (40% of replies)
  
Week 3: Book
  □ 20 created accounts (25% of qualified)
  □ 5+ booked first courier (25% of accounts)
  □ 2+ showed recurring intent
```

### Real-World Validation
```
For each booking:
  ✓ What brought them in? (discovery method)
  ✓ Which relationship strategy worked?
  ✓ Which email renderer got reply?
  ✓ How long did they take? (2 days? 10 days?)
  ✓ What was first booking value?
  ✓ Are they still using us?
```

---

## PHASE D: REVENUE LEARNING (2 Weeks)

**Objective:** Every successful outcome teaches the system

### Revenue Memory
For every £ earned, record:
```
£150 booking
  ← Came from BuildRight Contractors
  ← Discovered via postcode search (SN10)
  ← Stage 1 relationship
  ← Loss-aversion psychology (current solution works)
  ← Email Renderer V5
  ← Operator: James
  ← Timing: Tuesday 10am
  ← Trust signal: "New warehouse opened"
  ← Inverse incentive: "Need urgent delivery capability"

Average for this pattern:
  • Reply time: 2.3 days
  • Booking time: 4.1 days
  • First order: £145
  • Recurring rate: 67%
  • Lifetime value: £2,100
```

### Learning Loop
```
Every month, ask:
  "Why did we make £X this month?"
  
Answer:
  "£X came from:
   • 62% postcode search
   • 38% keyword search
   
   Of postcode, best result was SN10 (logistics):
   • Discovered 47
   • Replied: 29 (62%)
   • Booked: 8 (28%)
   • Recurring: 6 (75%)
   • Revenue: £18,400
   
   Psychology: Loss-aversion worked 67% better
   Email: Renderer V5 (58% reply vs V4 at 34%)
   Operator: James (42% booking rate vs team avg 22%)
   Timing: Tuesday 10am (reply rate 48% vs Friday 22%)
   
   Best next action: Scale SN10. Scale loss-aversion strategy. Train team on James approach. Use V5 everywhere."
```

---

## PHASE E: BUSINESS GRAPH (3 Weeks)

**Objective:** Persistent understanding of every business

### What We Know About BuildRight Contractors
```
Name: BuildRight Contractors
Industry: Construction
Location: Manchester
Size: Medium (50 employees)

Operational Needs:
  ✓ Court deliveries (documents to courts daily)
  ✓ Document runs (site to site)
  ✓ Peak: Mondays (project handoff days)
  ✓ Volume: 8-15 jobs/week

Current Situation:
  • Uses DHL today
  • Trust level: 31% (new to us)
  • Relationship stage: 2 (evaluation)

Recent Signals:
  • Hired logistics manager (6 weeks ago)
  • Opened new site in Birmingham (3 weeks ago)
  • Lost 2 delivery slots with DHL (complaint on Twitter)

Expansion Plans:
  • Planning Bristol office (8 weeks)
  • Will need 20+ deliveries/week when open
  • Timing: October

Key Players:
  • Operations director: "Current provider slow" (trusts us 45%)
  • Logistics manager: "We need flexibility" (new hire, fresh perspective)
  • Finance: "Need cost certainty" (concerned about pricing)

Readiness Prediction:
  • Current trust: 31%
  • Predicted: 72 days to dedicated driver
  • Next best action: "Send case study about Bristol expansion. Show how we handled new office logistics. Offer pilot on 3 jobs."

Revenue Potential:
  • First order estimate: £180
  • Monthly estimate: £220
  • Lifetime value: £7,920

Trust Signals (Why They Might Switch):
  ✓ DHL complaint (reliability issue)
  ✓ New warehouse stress (expansion pain)
  ✓ New logistics manager (fresh perspective)
  ✓ Growth phase (need flexible partner)

Risk (Why They Might Not):
  ✗ Contracts with DHL (switching friction)
  ✗ Finance risk-averse (need cost certainty)
  ✗ Just hired logistics manager (wait-and-see mode)
```

### Building the Graph
For every 100 businesses contacted:
```
□ 42 replied (graph: "replied" status)
□ 18 asked questions (graph: "qualified" status, add scoring)
□ 9 created accounts (graph: "evaluating" + decision maker + current provider)
□ 4 booked (graph: "customer" + first order value + timing)
□ 2+ recurring (graph: "recurring" + patterns emerging)
□ 1 standing driver (graph: "dedicated" + revenue pattern locked)

For each, the system knows:
  • Every signal observed
  • Every reason why they might switch
  • Every reason why they might not
  • Their exact readiness timeline
  • Their revenue potential
```

---

## PHASE F: AUTONOMOUS GROWTH ENGINE (4 Weeks)

**Objective:** Executive assistant, not email sender

### The Question
```
"I woke up this morning. What should I do?"

Answer:
"Found 127 businesses likely to need drivers this week.
Recommend contacting these 19 first.

Here's why each one matters:

1. ConstructionCorp (Bradford)
   • Why now: New warehouse just opened (signal detected 2 days ago)
   • Expected revenue: £8,400 annual
   • Best next action: Contact new ops manager with "here's how we helped similar expansion"
   
2. LogisticsPro (Leeds)  
   • Why now: Lost delivery slot with current provider (Twitter complaint 4 days ago)
   • Expected revenue: £12,600 annual
   • Best next action: Contact operations director with "reliability case study"
   
3. HealthcareClinics (Manchester)
   • Why now: Hiring 8 new staff (LinkedIn detected 1 day ago)
   • Expected revenue: £3,600 annual (lower LTV but 92% conversion rate for healthcare+hiring)
   • Best next action: Contact practice manager about "growth phase logistics"

...

Expected outcome:
  • Contact all 19 this week
  • Reply rate: 48% (based on similar signals)
  • Booking rate: 32% of replies
  • Expected revenue this week: £2,400
  • Expected lifetime revenue: £18,900
"
```

### How It Works
1. **Observe Market**
   - Monitor for hiring signals
   - Monitor for expansion signals  
   - Monitor for funding
   - Monitor for seasonal demand
   - Monitor for moving premises
   - Monitor for new warehouse
   - Monitor for new branches

2. **Notice Opportunity**
   - Signal detected: "New logistics manager hired"
   - Search business graph: "Who just hired logistics managers?"
   - Find: 47 companies
   - Rank by revenue potential + likelihood to switch

3. **Create Opportunity**
   - Highest priority: "ConstructionCorp" + "New warehouse"
   - Strategy: "Expansion pain → need flexible partner → best time to switch"
   - Timing: "This week (fresh warehouse stress)"
   - Approach: "Share how we handled similar expansions"

4. **Present to Operator**
   - "Here's the opportunity"
   - "Here's why now"
   - "Here's the expected revenue"
   - "Here's the recommended approach"
   - "Your move"

5. **Launch Outreach**
   - Operator approves
   - System sends first contact
   - Tracks reply
   - Escalates on engagement
   - Closes booking

6. **Learn Forever**
   - Did we win the deal?
   - How long did it take?
   - What was order value?
   - What kept them coming back?
   - What made us unique?

---

## TIMELINE

```
Now (Week 1-2):     Phase A DONE + Phase B started
Week 2-4:           Phase B (fix all discover, qualify, contact, book)
Week 4-7:           Phase C (500-business campaign, measure pipeline)
Week 7-9:           Phase D (revenue learning, extract patterns)
Week 9-12:          Phase E (business graph, persistent understanding)
Week 12-16:         Phase F (autonomous engine, market observation)
```

---

## SUCCESS METRICS

### By Week 2
```
✅ All discovery methods working
✅ Can find 100 businesses with valid contact data
✅ Can score them for likelihood
✅ Can send 100 emails and track opens
✅ Can measure replies
```

### By Week 7  
```
✅ Sent 500 emails
✅ 200+ replied (40% reply rate)
✅ 20-50 booked (4-10% of sent)
✅ Pattern analysis shows what works
✅ Can project week 8+ performance
```

### By Week 16
```
✅ Every business is in graph with signals/trust/readiness
✅ System wakes up, finds opportunities
✅ System recommends best 19 contacts
✅ Operator launches outreach
✅ System learns from every outcome
✅ Revenue memory answers "why £X this month"
✅ Monthly improvement visible
```

---

## THE NORTH STAR

**Not:** "Our engine reasons better"

**But:** "On Monday morning, the system says: 'Contact these 19 businesses. Expected revenue £18,900. Here's why each is ready. Here's why now matters.'"

**That's** when you know the system works.

---

## WHY THIS MATTERS

Most AI companies build:
```
Email generator → Get email spam reputation
Prediction model → Predicts on historical data only
Reasoning engine → Sounds smart, doesn't move deals
```

You're building:
```
Market observer → Notices when businesses need you
Opportunity creator → Creates specific reasons to engage
Revenue optimizer → Every decision traced to £
Learning loop → Gets smarter monthly
Business graph → Understands each company deeply
Autonomous assistant → Wakes up and says "go here"
```

**That's** a business, not a tool.

---

**Built:** June 23, 2026  
**Focus:** Execution over intelligence  
**Metric:** Revenue and reply rate  
**Timeline:** 16 weeks to autonomous growth engine  
