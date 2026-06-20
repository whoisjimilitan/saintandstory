# Wave 3: Operator Control Center - Operating System (Correct)

**Status:** REDESIGNED TO MATCH ORIGINAL VISION  
**Date:** 2026-06-20  
**Architecture:** Operating System (Control-First, Action-Oriented)  
**Coherence:** Flows directly from Wave 1 + Wave 2

---

## WAVE 1 → 2 → 3 FLOW

### Wave 1: Psychology Engine
Creates RRAT emails (Recognition → Relief → Trust → Action)
- Input: Lead data (pressure type, observations)
- Output: Psychology email ready to send
- Status: Email drafted, waiting for operator approval

### Wave 2: Scale to 9 Types
Applies psychology engine to all 9 pressure types
- Input: 9 pressure types, pressure detection
- Output: Psychology emails (one per prospect per pressure type)
- Status: Emails queued, waiting for operator workflow

### Wave 3: Operator Control Center (THIS STAGE)
Operator approves/customizes/sends those emails
- Input: Psychology email from Wave 2
- Operator sees: Full company data + email + pressure context
- Operator action: Approve → Send (or Customize → Send or Skip)
- Output: Email sent, gate_1_delivered_at recorded
- Next: Monitor gates 2-6 (opened, visited, replied, advancing, hot)

---

## CORE PRINCIPLE

**Not "What are my prospects?" (CRM)**  
**Not "How are my metrics?" (Dashboard)**  
**Not "What should I analyze?" (Analytics)**

**Question: "What should I do RIGHT NOW?"**  
**Answer: ONE action, full context, one button**

---

## FOUR SECTIONS

### 1. TODAY (Primary Entry Point)

**Purpose:** Answer "What's my one next action?" in 5 seconds

**Shows ONE prospect at a time:**
- Company name (large, prominent)
- Category + City (small, context)
- Pressure type identified (e.g., "Service Quality Inconsistency")
- Full company enrichment (on tap/expand):
  - Location, employees, revenue, website
  - Industry, company age
  - Social links, phone number
  - All observation notes from past
- Psychology email pre-drafted (visible, can customize)
  - Recognition (why contacted)
  - Relief (burden named)
  - Trust (proof/methodology)
  - Action (validation question)
- Subject line (visible, can change)

**Operator actions (one per screen):**
- ✅ APPROVE & SEND (primary button, large)
- ✏️ CUSTOMIZE EMAIL (edit body/subject)
- ⏭️ SKIP TO NEXT (defer this prospect)
- 📝 ADD OBSERVATION (note context)

**After action:**
- Email sent + gate_1_delivered_at recorded
- Show NEXT prospect automatically
- Loop continues

**Not shown:**
- Metrics, scores, tiers
- Engagement history (unless relevant to this action)
- Recommendations, analytics, trends
- Other prospects (one at a time only)

---

### 2. CONVERSATIONS (Context on Demand)

**Purpose:** "What's my full history with this company?"

**Access:** Click company name from TODAY (or search)

**Shows timeline of all interactions:**
- All emails sent (date, subject, open status if available)
- All calls made (date, duration, outcome)
- All observations recorded (operator notes)
- All replies received (what they said, when)
- All standing orders (current status)
- Gate progression (when delivered, opened, visited, replied)

**Operator actions:**
- View timeline (read-only, context)
- Send follow-up email (from this view)
- Record observation (quick note)
- Create standing order (if ready)
- Return to TODAY

**Purpose:**
- Build context before responding
- Prepare for call (know history)
- Understand relationship depth
- Make informed decisions

---

### 3. OPPORTUNITIES (Standing Order Queue)

**Purpose:** "Which companies are ready for standing orders?"

**Shows prospects ready for long-term nurture:**
- Companies with 3+ touchpoints but no reply
- Companies marked as "good fit, just slow"
- Operator suggests standing order

**Operator actions:**
- Create standing order (frequency: weekly/bi-weekly/monthly)
- View full context (link to CONVERSATIONS)
- Defer (try again later)
- Skip (not interested)

**Result:**
- Standing order created
- First email from sequence sent
- Prospect moves to "standing order active" status
- Daily/weekly sends based on frequency

---

### 4. ARCHIVE (Finished/Stalled)

**Purpose:** "What have we finished or put on hold?"

**Shows:**
- Completed prospects (standing order ran course, closed deal)
- Stalled prospects (no engagement after N attempts)
- Operator-marked not-ready (intentional pause)

**Operator actions:**
- Reactivate (try again)
- View history (why archived?)
- Delete notes (optional)

---

## FULL COMPANY ENRICHMENT (On Expand)

When operator clicks a prospect, show ALL available data:

**Company Profile:**
- Company name, legal name
- Address (HQ + locations)
- Phone, website, email
- Industry, company age
- Employee count, revenue range
- Social links (LinkedIn, Twitter, etc.)

**Observation Trail:**
- All notes operator recorded
- All emails sent (subjects, dates)
- All replies (content)
- All calls (date, notes)
- Standing orders (status)

**Pressure Context:**
- Pressure type detected
- Why (which signals triggered it)
- Relevant observations ("4 locations, 3.2★ variance")

**Email Ready to Send:**
- Full psychology email visible
- Subject line (customizable)
- Body (customizable)
- SEND button (prominent)

**No extras:**
- No metrics about this prospect
- No analytics about email performance
- No comparison to other prospects
- No recommendations

---

## OPERATOR WORKFLOW

### User opens `/operator-control`:

1. **TODAY shows:** First prospect
   - Company: "haart (Leeds)"
   - Category: Estate Agents
   - Pressure: Service Quality Inconsistency (4.8★ vs 3.2★)
   - Email visible (can customize)
   - Button: "APPROVE & SEND"

2. **Operator decision (5 seconds):**
   - Read email → Looks good → Click SEND
   - OR: Customize subject/body → Click SEND
   - OR: Need more context → Click company name → See CONVERSATIONS
   - OR: Not ready → Click SKIP

3. **If SEND:**
   - Email sent immediately
   - Gate 1 recorded (gate_1_delivered_at = now)
   - TODAY shows NEXT prospect (Cornerstone Logistics)
   - Loop repeats

4. **If SKIP:**
   - Prospect deferred
   - TODAY shows NEXT prospect
   - Skipped prospect queued for tomorrow

5. **If click company → CONVERSATIONS:**
   - Shows full timeline (emails, calls, notes)
   - Operator can see context
   - Can send follow-up from here
   - Returns to TODAY when done

6. **If STANDING ORDER:**
   - After 3+ touches, OPPORTUNITIES shows this company
   - Operator creates standing order
   - First email sends
   - Prospect queued for weekly/bi-weekly sends

---

## HOW THIS FLOWS FROM WAVE 1 + 2

### Wave 1 Created:
- Psychology engine (RRAT framework)
- Email generation from lead data
- Validator (checks quality)

### Wave 2 Scaled:
- Applied psychology to 9 pressure types
- Auto-detected pressure type per lead
- Generated psychology email per pressure

### Wave 3 Executes:
- **Operator sees:** Psychology email (from Wave 2)
- **Operator sees:** Full company data (enrichment already done)
- **Operator sees:** Pressure type + why (Wave 2 detection)
- **Operator action:** Approve or customize
- **System records:** Gate 1 (email sent)
- **System monitors:** Gates 2-6 (open, visited, replied, advancing, hot)

**Flow is COMPLETE:** Psychology → Scale → Control → Monitor

---

## DESIGN LOCKED

**Visual Hierarchy:**
- Company name: Large, serif, prominent (42px)
- Email body: Medium, sans, full-width (16px)
- Button: Large, dark background, full-width
- Context: Small, grey, minimal

**No extras:**
- No metrics
- No scores
- No analytics
- No recommendations
- No suggestions
- No dashboard widgets

**Space:**
- TODAY: Full screen, one prospect only
- CONVERSATIONS: Timeline, chronological
- OPPORTUNITIES: List (scrollable)
- ARCHIVE: List (searchable)

---

## SUCCESS CRITERIA

✅ Operator opens → 5 seconds to decision (TODAY)  
✅ Operator sees ONE action at a time (focus)  
✅ Operator sees FULL company data (context)  
✅ Operator sees PSYCHOLOGY EMAIL (approval workflow)  
✅ Operator can APPROVE/CUSTOMIZE/SKIP (control)  
✅ After action → Shows NEXT prospect (continuous)  
✅ CONVERSATIONS shows FULL history (relationship knowledge)  
✅ OPPORTUNITIES for standing orders (nurture)  
✅ ARCHIVE shows finished/stalled (optional revisit)  
✅ NO metrics, NO analytics, NO recommendations (focused)  
✅ Flows from Wave 1 → 2 → 3 (coherent)  
✅ No drift (operating system, not dashboard)  

---

## ARCHITECTURE SUMMARY

| Section | Purpose | Shows | Action | Next |
|---|---|---|---|---|
| TODAY | "What now?" | One prospect + email | Approve/Send | Next prospect |
| CONVERSATIONS | "What's history?" | Timeline + notes | Review/Follow-up | Back to TODAY |
| OPPORTUNITIES | "Ready for standing?" | Prospects for nurture | Create order | Moves to active |
| ARCHIVE | "What's finished?" | Stalled/complete | Reactivate | Back to TODAY |

---

## THIS IS CONTROL, NOT OBSERVATION

**NOT:**
- Analytics dashboard
- Metrics viewer
- Performance tracker
- Recommendation engine
- Template library
- Workflow settings

**IS:**
- Operating system
- Action queue (TODAY)
- Context viewer (CONVERSATIONS)
- Nurture manager (OPPORTUNITIES)
- History (ARCHIVE)

**Operator leaves after:**
- Sending 10-15 emails (TODAY queue)
- Reviewing 1-2 conversations
- Creating 1 standing order
- 20 minutes total

**Not:**
- Reviewing metrics (no metrics shown)
- Reading recommendations (no recommendations)
- Analyzing trends (no analytics)
- Managing workflows (no settings)

---

**WAVE 3: OPERATING SYSTEM. CONTROL-FIRST. FOCUSED. COHERENT WITH WAVE 1 + 2.**
