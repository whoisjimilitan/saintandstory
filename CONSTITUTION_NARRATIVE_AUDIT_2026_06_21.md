# CONSTITUTION NARRATIVE LAYER AUDIT

**Date:** 2026-06-21  
**Scope:** UI/UX narrative alignment only (no implementation)  
**Authority:** Operator OS Constitution §3, §4, §5, §6  

---

## MODULE 1: MORNING BRIEF

**Current State:**
```
Header: "Good morning, James. Here's what matters today."

Then shows:
  • New Leads: [number]
  • High Confidence: [number]
  • Finished: [number]
  • Closed: [number]

Then shows:
  • Pipeline stage counts (5 stages with numbers)
  • Today's Actions (list)
  • Recent Activity (list)
```

**Gap Analysis:**

**❌ PRESSURE SIGNALS - MISSING**
- Not shown: Why are these numbers urgent?
- Not shown: What changed overnight?
- Not shown: What's trending up/down?
- Not shown: What requires attention today vs. normal business?
- Not shown: Market signals or competitive context

**❌ TRUST SIGNALS - MISSING**
- Not shown: Where do these numbers come from?
- Not shown: How confident are we in these metrics?
- Not shown: What's the data freshness?
- Not shown: Quality/reliability indicators

**❌ DECISION GUIDANCE - MISSING**
- Not shown: Which number should you focus on first?
- Not shown: What action correlates with each metric?
- Not shown: Priority ranking

**❌ "WHY THIS MATTERS NOW" - MISSING**
- No narrative explaining context
- No story about what happened overnight
- No business interpretation
- Just raw numbers

**Severity:** **HIGH**

**Expected Constitution Alignment (§3, §7):**
```
MORNING BRIEFING

Market Status This Morning
  Market signals detected: [Signal 1], [Signal 2]
  Competitive activity: [If relevant]
  Urgency level: [High/Medium/Low]

Opportunity Summary
  New leads: 23 (normal baseline: 16) ↑ 44% increase
  Why it matters: [Specific market context]
  Action: Prioritize these in discovery
  
Confidence Assessment
  High-confidence leads: 12 (strong signals aligned)
  
Pipeline Momentum
  Finished: 5 (tracking well)
  Closed: 2 (strong close rate)
  
What You Should Do First
  [Ranked priority]
```

**Corrected UI Direction:**
```
1. Add a "MARKET BRIEFING" section before metrics
   - Explain what changed overnight
   - Explain why it matters
   - Explain if there's urgency

2. Transform metric cards from "raw numbers" to "narrative context"
   Instead of:  "New Leads: 23"
   Show:        "New Leads: 23 (+40% vs baseline) Market signal: Sector demand ↑"

3. Add a "FOCUS FIRST" section
   - Rank which metrics need attention today
   - Explain why

4. Add signal source/confidence to each metric
   - Where does the number come from?
   - How fresh is it?
```

---

## MODULE 2: DISCOVER

**Current State:**
```
Search input: "Search by postcode, industry, or company name…"

Then shows:
  • Results list: Company name, confidence %, city, industry
  • Example: "ABC Roofing | 85% confidence | Manchester | Commercial"
```

**Gap Analysis:**

**❌ PRESSURE SIGNALS - MISSING**
- Not shown: Why THIS company matters NOW
- Not shown: Market timing/urgency
- Not shown: Competitive context
- Not shown: Why the sector is hot
- Not shown: Seasonal factors

**❌ TRUST SIGNALS - MISSING**
- Shows: Confidence % (85%)
- Missing: Where does 85% come from?
- Missing: What evidence supports it?
- Missing: Signal strength breakdown
- Missing: Source reliability (Google? Email? Behavior?)

**❌ DECISION GUIDANCE - MISSING**
- Not shown: Which prospects should you prioritize?
- Not shown: What makes one better than another?
- Not shown: What's the recommended next step?

**❌ "WHY THIS MATTERS NOW" - MISSING**
- No narrative about market signals
- No story about this company
- No business interpretation
- Just name + percentage

**Severity:** **HIGH**

**Expected Constitution Alignment (§8):**
```
Each result should show:
  ABC ROOFING SERVICES LTD
  
  PRESSURE SIGNAL: Roofing sector demand ↑ (+35% this quarter)
  Why: Company expanding (3 new hires), capex increasing
  Timing: Q2 is peak commercial roofing season
  Probability: High conversion window
  
  CONFIDENCE: 85% (strong signals aligned)
  Sources: Google (1,200+ reviews, 4.8★) + Hiring signals + Capex
  
  Recommended: Prioritize for qualification
```

**Corrected UI Direction:**
```
1. Add "PRESSURE SIGNAL" to each result
   - Why this prospect matters in market context
   - Why timing is good NOW
   - What's the urgency?

2. Add "CONFIDENCE REASONING" to each result
   - Break down the 85% into component signals
   - Show sources (Google, hiring, capex, etc.)
   - Show signal strength

3. Add "RECOMMENDED ACTION" to each result
   - Should this be qualified immediately?
   - What's the priority?

4. Add "MARKET CONTEXT" above results
   - Why is this sector hot?
   - What changed?
   - Why search results matter
```

---

## MODULE 3: UNDERSTAND

**Current State:**
```
Shows:
  • Company information (name, employees, revenue)
  • Decision makers (names, roles)
  • Engagement signals (list)
  • Pain points (list)
  • Confidence slider (0-100%)
  • Notes field
```

**Gap Analysis:**

**⚠️ PRESSURE SIGNALS - PARTIAL**
- Shows: "Expansion phase", "Hiring signals"
- Missing: Why is this urgent for THIS company?
- Missing: What's the buying window?
- Missing: Market/seasonal context

**⚠️ TRUST SIGNALS - PARTIAL**
- Shows: Confidence slider
- Missing: WHY this confidence level?
- Missing: What evidence?
- Missing: Which signals are strongest?

**❌ DECISION GUIDANCE - MISSING**
- Not shown: How should you approach them?
- Not shown: What message angle to use?
- Not shown: What's the probability of success?
- Not shown: Who's the real decision maker?

**❌ "WHY THIS MATTERS NOW" - MISSING**
- Shows enrichment data
- Missing: Business interpretation/story
- Missing: Strategic context
- Shows signals, doesn't explain them

**Severity:** **HIGH**

**Expected Constitution Alignment (§9):**
```
ABC ROOFING - QUALIFICATION SUMMARY

Who They Are
  Company: ABC Roofing Services Ltd
  Owner: Sarah Jones (decision maker)
  Team: John Smith (operations)

Why They Matter Now
  Sector: Roofing in peak demand (+35% this quarter)
  Company: Actively expanding (3 new hires, capex increasing)
  Timing: Buying window is OPEN
  
Confidence Reasoning
  85% (strong signals, multiple sources aligned)
  ✓ Google: 1,200+ reviews, 4.8 rating
  ✓ Hiring: 3 new jobs posted last 30 days
  ✓ Capex: Recent materials investment detected
  ✓ Seasonal: Q2 is peak season
  
Recommended Approach
  Message angle: "We help companies like yours scale"
  Pressure type: Recognition + Transformation
  Who to contact: Sarah Jones (owner)
  
Next Step: Compose email with high confidence
```

**Corrected UI Direction:**
```
1. Add "WHY THIS COMPANY" section
   - Market/sector context
   - Company-specific urgency
   - Buying window explanation

2. Add "CONFIDENCE BREAKDOWN"
   - Don't show just a score
   - Show the reasoning
   - Show sources and signal strength

3. Add "RECOMMENDED APPROACH" section
   - How to message them based on signals
   - Who to contact
   - Why this approach

4. Transform enrichment from "data display" to "insight narrative"
   - Explain what signals mean
   - Explain what they reveal
   - Explain business implication
```

---

## MODULE 4: OUTREACH

**Current State:**
```
Shows:
  • Prospect summary
  • Pressure type selector (Recognition/Transformation/Logical)
  • A/B variant selector
  • Subject line editor
  • Body editor
  • Send button
```

**Gap Analysis:**

**⚠️ PRESSURE SIGNALS - PARTIAL**
- Shows: Three pressure types (choice)
- Missing: Why THIS type for THIS prospect?
- Missing: Why NOW (not in 2 weeks)?
- Missing: Seasonal/market urgency

**❌ TRUST SIGNALS - MISSING**
- Not shown: How confident are we in this approach?
- Not shown: Based on what confidence level?
- Not shown: Why this message will work?

**❌ DECISION GUIDANCE - MISSING**
- Not shown: Why this pressure type is recommended
- Not shown: Why this timing
- Not shown: What success looks like

**❌ "WHY THIS MATTERS NOW" - MISSING**
- No narrative about message strategy
- No story about why this angle
- No business interpretation
- Just mechanical template selection

**Severity:** **MEDIUM-HIGH**

**Expected Constitution Alignment (§10):**
```
RECOMMENDED MESSAGE STRATEGY

For: ABC Roofing Services Ltd
Your Confidence: 85% (strong signals)

Pressure Type Analysis
  Recommended: Recognition + Transformation
  Why: They're actively expanding and confident
  Psychological: Acknowledge momentum, position as enabler
  
Timing Analysis
  Send: Today or tomorrow (Tuesday is optimal for decision-makers)
  Why: Peak decision-making window, seasonal momentum
  
Message Strategy
  Subject: [Acknowledge their growth] [Logistics-specific benefit]
  Body: [Open with recognition] [Social proof] [Specific outcome]
  
Confidence in This Approach
  High: All signals align with this strategy
  Why: Expansion phase + hiring + capex = ready to invest
  
Success Indicators
  Opens within 48 hours = strong interest
  Click within 3 days = specific interest
```

**Corrected UI Direction:**
```
1. Add "RECOMMENDED STRATEGY" section BEFORE email editor
   - Explain why this pressure type
   - Explain why this timing
   - Explain confidence level

2. Transform pressure type selector
   - Don't just offer 3 choices
   - Show recommended choice first
   - Explain why it's recommended
   - Show success probability

3. Add "TIMING ANALYSIS" section
   - When to send (day/time)
   - Why that timing
   - Market/seasonal context

4. Add success expectations
   - What should happen if this works?
   - What timeline?
   - What signals to watch for?
```

---

## MODULE 5: PIPELINE

**Current State:**
```
Shows:
  • 5-column layout (Discover, Enrich, Qualify, Propose, Orders)
  • Prospect cards in each column
  • Company name + confidence % + last activity date
  • Clickable cards
```

**Gap Analysis:**

**⚠️ PRESSURE SIGNALS - PARTIAL**
- Shows: Stage counts
- Missing: Which deals are at risk?
- Missing: Which deals need attention NOW?
- Missing: What's the momentum trend?
- Missing: Decision window closing alerts?

**⚠️ TRUST SIGNALS - PARTIAL**
- Shows: Confidence % per card
- Missing: Why is this at 85%? What changed?
- Missing: Is confidence increasing or decreasing?
- Missing: Signal strength breakdown

**❌ DECISION GUIDANCE - MISSING**
- Not shown: Which prospect should you focus on today?
- Not shown: Which deals are at risk of being lost?
- Not shown: What action needed for each prospect?

**❌ "WHY THIS MATTERS NOW" - MISSING**
- No narrative about pipeline health
- No story about momentum
- No business interpretation
- Just card display

**Severity:** **MEDIUM**

**Expected Constitution Alignment (§11):**
```
PIPELINE MOMENTUM REPORT

Overall Health
  Conversion rate: 28% (Propose → Orders) - strong
  Cycle time: 14 days average
  At-risk deals: 2

Discover Stage (45 prospects)
  Momentum: ↑ HIGH (12 new, high-confidence)
  Action: Accelerate enrichment on top 5

Propose Stage (8 prospects)
  Momentum: ⚠️ CAUTION
  At-risk alerts:
    • Heritage Hospitality: 3 opens, 1 click, 48hrs silent → CALL TODAY
    • Northern Healthcare: 5 days silent → Decision window closing
  
Orders Stage (3 prospects)
  Momentum: ↑ STRONG (2 conversions this week)
  Revenue impact: £24k this month
```

**Corrected UI Direction:**
```
1. Add "PIPELINE MOMENTUM REPORT" section ABOVE cards
   - Overall health summary
   - Momentum indicators (up/down/flat)
   - At-risk alerts with urgency

2. Transform prospect cards
   - Show momentum indicator (↑↓→)
   - Show if at-risk
   - Show recommended action
   - Show why this prospect matters NOW

3. Add stage-level narrative
   - Health of each stage
   - Trends
   - Recommended actions

4. Highlight decision windows
   - Which prospects have limited time?
   - What action is urgently needed?
   - Why it matters
```

---

## MODULE 6: ORDERS

**Current State:**
```
Shows:
  • Status filter buttons (Active/Pending/Completed/Renewed)
  • Orders list: Company name, value, status, date
  • Order detail sidebar (click to select)
  • Status update buttons
```

**Gap Analysis:**

**⚠️ PRESSURE SIGNALS - PARTIAL**
- Shows: Orders exist
- Missing: Which accounts need renewal attention NOW?
- Missing: Which accounts are at retention risk?
- Missing: Revenue trends

**❌ TRUST SIGNALS - MISSING**
- Not shown: Why is this account healthy/at-risk?
- Not shown: How confident are we in retention?
- Not shown: What signals indicate health?

**❌ DECISION GUIDANCE - MISSING**
- Not shown: Which accounts to focus on?
- Not shown: What action needed?
- Not shown: Priority ranking

**❌ "WHY THIS MATTERS NOW" - MISSING**
- Shows transaction log
- Missing: Business story
- Missing: Customer health narrative
- Missing: Revenue impact interpretation

**Severity:** **MEDIUM-HIGH**

**Expected Constitution Alignment (§12):**
```
REVENUE & CUSTOMER HEALTH REPORT

This Month: £52,000 (+25% vs average)
Conversion Rate: 28% (strong)
Active Contracts: 12

Renewal Watch: 3 contracts due next month
  ✅ ABC Roofing (£12k): HIGH retention signal
     Last engagement: This week
     Action: Proactive renewal call (1 week before)
     
  ⚠️ Manchester Facilities (£8.5k): MEDIUM signal
     Last engagement: 2 weeks ago
     Action: Check-in call to assess
     
  🔴 Healthcare Solutions (£6k): AT-RISK
     Last engagement: 30 days ago
     Action: URGENT - determine if dissatisfied

Revenue Forecast Q3: £95-110k
```

**Corrected UI Direction:**
```
1. Add "REVENUE & HEALTH REPORT" section ABOVE orders list
   - Monthly/quarterly revenue
   - Customer retention health
   - Renewal opportunity summary
   - At-risk accounts alert

2. Transform orders list
   - Show customer health indicator
   - Show renewal date/urgency
   - Show recommended action
   - Show revenue impact

3. Add renewal watch section
   - Accounts renewing this month
   - Health status for each
   - Recommended action per account
   - Timeline urgency

4. Add customer health signals
   - Engagement recency
   - Support issues (if tracked)
   - Expansion opportunities
```

---

## SUMMARY TABLE

| Module | Pressure | Trust | Decision | Story | Severity |
|--------|----------|-------|----------|-------|----------|
| **Morning Brief** | ❌ | ❌ | ❌ | ❌ | **HIGH** |
| **Discover** | ❌ | ❌ | ❌ | ❌ | **HIGH** |
| **Understand** | ⚠️ | ⚠️ | ❌ | ❌ | **HIGH** |
| **Outreach** | ⚠️ | ❌ | ❌ | ❌ | **MEDIUM-HIGH** |
| **Pipeline** | ⚠️ | ⚠️ | ❌ | ❌ | **MEDIUM** |
| **Orders** | ⚠️ | ❌ | ❌ | ❌ | **MEDIUM-HIGH** |

---

## CRITICAL FINDING

**The system shows data. It does NOT tell stories.**

Every module is missing:
1. **Pressure signals** - Why this matters NOW
2. **Trust signals** - Why we're confident
3. **Decision guidance** - What you should do
4. **Narrative layer** - Business interpretation

This violates Constitution §3, §4, §5, §6.

The UI is mechanically functional but narratively incomplete.

---

## NEXT STEP

Awaiting instruction before proceeding.

