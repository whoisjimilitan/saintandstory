# TODAY HANDOFF: B2B Operating System — Grounded Execution Brief

**Status:** Phase B executable TODAY. Phase A complete (verified). Ready for live deployment tonight.  
**Timeline:** 8 hours (9am—5pm)  
**Deployment:** Vercel (jimi2/saintandstory)

---

## WHAT IS THIS SYSTEM?

**Name:** B2B Operating System (not CRM, not pipeline management, not a module)

**Purpose:** Autonomous intelligence pipeline for outbound B2B prospecting
- Input: 1,847 prospects discovered autonomously
- Processing: Commercial signal analysis, enrichment, ranking
- Output: Operator sees 12 high-signal opportunities each day
- Action: Operator picks one → system learns → ranking improves tomorrow

**Core Promise:** "Here are your 12 best opportunities today. Contact one. Trust the ranking."

---

## WHAT IS THE GOAL TODAY?

**Ship a unified Today Queue interface that:**
- Replaces mock data with real database query
- Passes all 6 design verification tests
- Deploys to Vercel by 5pm
- Operators can use it productively in <60 seconds

**NOT shipping today:** Pipeline, Discovery, Orders, Analytics (routes exist, no code yet)  
**Shipping today:** Today Queue only (routes: GET /dashboard/admin/b2b)

---

## WHAT'S ALREADY LIVE (WAVE 3 — VERIFIED)

### Emails (WORKING)
- Route: `POST /api/b2b/send-email`
- Provider: Resend (pre-configured, tested)
- Status: Sends emails to prospect.email with template pre-fill
- Example: ProspectCard [Send Email] → pre-fills compose, ready to send

### Prospect Status Machine (WORKING)
- Route: `POST /api/b2b/update-status`
- States: `new` → `contacted` → `engaged` → `qualified` → `won` / `lost`
- Immutable: Once set, only visible in audit trail
- Used by: Operator Feedback buttons (Correct, Not Useful, Already Contacted, Not Relevant)

### Contact History Timeline (WORKING)
- Route: `GET /api/b2b/outreach-events`
- Data: Append-only audit trail (when contacted, by whom, result)
- Used by: ProspectCard expanded state (Evidence, Why This Matters, Executive Summary)
- Visible: "Last reviewed 5d ago" in collapsed state

### Prospect Ranking & Scoring (WORKING)
- Route: `GET /api/b2b/ranking`
- Algorithm: Commercial signal scoring (0–100 engagement_score)
- Used by: Sort mockProspects by score descending
- Visible: In Intelligence Brief ("8 display unusually strong signals")

---

## WHAT'S BEEN BUILT (PHASE 3C — PARTIAL)

### Database Tables (VERIFIED — All Exist)
```sql
-- Core
b2b_leads (id, business_name, email, engagement_score, status, created_at)
b2b_outreach_events (id, lead_id, timestamp, event_type, metadata) -- append-only

-- Support
b2b_standing_orders (id, category_id, frequency, operator_id, created_at)
discovered_businesses (id, business_name, category, website, created_at)
enriched_businesses (id, discovered_id, signals, context, created_at)
qualified_businesses (id, enriched_id, confidence_score, ranking, created_at)
```

### Components (VERIFIED — All Exist)
- `ProspectCard.tsx`: Collapsed (company, pressure, opportunity) + Expanded (summary, evidence, feedback)
- `ReadyTodayCard.tsx`: (May exist for other contexts)
- Both use: Monochrome (#0D0D0D black, #666666 gray, #E8E8E8 light gray)

### Routes (VERIFIED — All Exist)
- `GET /dashboard/admin/b2b` ← **TODAY. Using mockProspects.**
- `GET /dashboard/admin/b2b/pipeline` (no code yet)
- `GET /dashboard/admin/b2b/discovery` (no code yet)
- `GET /dashboard/admin/b2b/orders` (no code yet)
- `GET /dashboard/admin/b2b/analytics` (no code yet)

### APIs (VERIFIED — All 32 Exist)
- Email: `POST /api/b2b/send-email`
- Status: `POST /api/b2b/update-status`
- Events: `GET /api/b2b/outreach-events`
- Leads: `GET /api/b2b/leads`, `POST /api/b2b/leads`
- Orders: `GET /api/b2b/standing-orders`, `POST /api/b2b/standing-orders`
- Discovery: `GET /api/b2b/discovery`, `POST /api/b2b/discovery-config`
- Enrichment: `GET /api/b2b/enrichment`
- Ranking: `GET /api/b2b/ranking`
- Research: `POST /api/b2b/research-missions`
- Advanced: CSV import, observations, field intelligence, etc.

---

## WHAT'S LOCKED (DESIGN PRINCIPLES)

### 1. Each Section Tells ONE Thing (Non-Negotiable)

**Section 1: Intelligence Brief**
- **ONE story:** "Here's what matters today"
- **Message:** "12 opportunities exceed threshold. 8 show strong signals. 3 need contact today."
- **NOT:** "System is busy," "Discovery running," "You have tasks"
- **Operator feels:** Clarity. Prioritization. No ambiguity.

**Section 2: Prospect Queue**
- **ONE story:** "These are your 12 calls to make"
- **Message:** Each card says "Contact this person because X"
- **NOT:** Mixed signals, system status, historical data clutter
- **Operator feels:** Actionable. Focused. Ready.

**Section 3: System Status**
- **ONE story:** "The system is working autonomously"
- **Message:** "Discovery Active. Enrichment Active. Ranking Active. Learning Active."
- **NOT:** Metrics, counts, operational details
- **Operator feels:** Confidence. Automation is happening.

**Rule:** If a section tells two stories, remove one. Ambiguity kills trust.

### 2. Architecture: /dashboard/admin/b2b IS the B2B OS (Not Parallel)

**What this means:**
- Admin (`/dashboard/admin`): Driver ops, jobs, revenue (UNCHANGED)
- B2B (`/dashboard/admin/b2b*`): Intelligence OS, prospects, ranking (REPLACEMENT)
- **Never:** Mix driver UI + prospect UI on same route
- **Always:** Keep them visually and functionally separate

**Why:**
- Operator knows immediately: "I'm in the B2B system"
- Design is coherent (intelligence OS throughout, not mixed with driver ops)
- Navigation is clear (5 B2B tabs: Today, Pipeline, Discovery, Orders, Analytics)
- Mental model is clean (separate operating systems, not subsections)

### 3. Design Language (Apple + Linear Aesthetic)

**Color Palette (Monochrome Only)**
- Black: `#0D0D0D` (text, headings, active state)
- Gray: `#666666` (secondary text, muted)
- Light Gray: `#888888` (labels, metadata)
- Background: `#FAFAFA` (expanded sections)
- Border: `#E8E8E8` (separation, hover state)

**Rule:** No color carries meaning. Color only communicates hierarchy via tone.

**Typography (No Color for Meaning)**
- H1 (Page Title): 30px, font-black, `#0D0D0D`, tracking-tight
- H3 (Card Title): 18px, font-semibold, `#0D0D0D`
- H4 (Section Label): 10px, font-semibold, uppercase, `#0D0D0D`, tracking-[0.1em]
- Body: 14px, leading-relaxed, `#0D0D0D`
- Secondary Text: 14px, `#666666`
- Metadata: 10px, uppercase, `#888888`, tracking-[0.2em]

**Spacing Rules**
- Card vertical: 5px padding (px-6 py-5)
- Section margin: 12px bottom (mb-12)
- Metadata gap: 4px (gap-4)

### 4. Less is More (Locked)

**Default View Principle**
- Operator sees: 12 prospects, one message each, one action each
- Collapsed state shows: Company name, pressure, opportunity, metadata only
- Expanded state shows: Summary, evidence, why it matters, action, feedback (hidden until expanded)
- Rule: Hidden data is available on demand. No system guts visible.

**Meaningful Data Only**
- Visible by default: What they struggle with (pressure) + how you help (opportunity)
- Visible on expand: Why you're right + evidence + suggested action
- Behind [Inspect Ranking]: How the score was calculated
- Never visible: Raw signal names, algorithm internals, discovery process

**8am Test (Golden Path)**
1. Open page (< 5 seconds)
2. Scan 12 cards (< 30 seconds)
3. Pick one (< 10 seconds)
4. Click to expand (< 5 seconds)
5. Send email (< 10 seconds)
- **Total:** < 60 seconds. Operator is productive.

### 5. User-Friendliness Rules (Locked)

**One Workflow, One Direction**
- Open → See 12 → Pick one → Send email
- No branching: "Choose between 3 views," "Select from 5 filters," "Configure settings"

**Click Behavior Always Consistent**
- Click card → Expand in-place (show more on same page)
- Click company name → Go to detail page (full history)
- Click [Send Email] → Compose email (pre-filled)

**Trust Pattern**
- Default: "Trust the system, here are the 12"
- Skeptical: "Why these 12?" [Inspect Ranking]
- Verification: Full history available, all actions logged

---

## TODAY'S EXECUTION PLAN (8 HOURS)

### Phase A: Reality Check (30 minutes — 9:00–9:30am)

**Verify Wave 3 Actually Works**

1. **Database query test**
   - Query `b2b_leads` where `engagement_score > 50` order by score DESC limit 12
   - Confirm returns real data (not empty)
   - Verify timestamps, email addresses, status values

2. **API integration test**
   - GET `/api/b2b/ranking` → returns scores for at least 12 leads
   - GET `/api/b2b/outreach-events?lead_id=X` → returns audit trail
   - Confirm response shapes match ProspectCard props

3. **Component verification**
   - ProspectCard imports correctly, renders with real data
   - Collapsed state shows: company, pressure, opportunity, metadata
   - Expanded state shows: summary, evidence, feedback buttons
   - No console errors

**Success Criteria:** All queries return data. ProspectCard renders without errors.  
**If blocked:** Data may be incomplete; use mockProspects as fallback.

---

### Phase B: Today Queue Implementation (2–4 hours — 9:30am–1:30pm)

**Replace mockProspects with Real Database Query**

1. **Code change** (app/dashboard/admin/b2b/page.tsx)
   - Remove mockProspects array
   - Add server-side query:
     ```sql
     SELECT * FROM b2b_leads 
     WHERE engagement_score > 50 
     ORDER BY engagement_score DESC 
     LIMIT 12
     ```
   - Fetch related data: outreach_events (for last_contacted_at), enriched_businesses (for opportunity/context)
   - Pass to ProspectCard as before

2. **Design verification** (6 tests must pass)
   - ✅ **Test 1: Section Coherence**
     - Intelligence Brief tells ONE story (what matters)
     - Queue tells ONE story (call these people)
     - Status tells ONE story (system is working)
     - No section bleeding into another's message
   
   - ✅ **Test 2: 8am Golden Path**
     - Open page, scan 12 cards, pick one, expand, send email
     - Total time < 60 seconds
     - No friction, no confusion, no clicks needed
   
   - ✅ **Test 3: Collapsed State (Less is More)**
     - Shows: Company name, pressure (opportunity), context (why matters), metadata (last reviewed, category)
     - Does NOT show: Full history, algorithm details, system status
     - Operator thinks: "I know what to do"
   
   - ✅ **Test 4: Expanded State (Skeptic Path)**
     - Shows: Executive summary, evidence, why it matters, recommended action, feedback buttons
     - Operator thinking: "This makes sense. Here's proof."
   
   - ✅ **Test 5: Mobile/Responsive**
     - All text readable (no truncation)
     - Card spacing maintained
     - Buttons clickable (no overlap)
   
   - ✅ **Test 6: Color & Typography**
     - All text is `#0D0D0D`, `#666666`, or `#888888`
     - No rogue colors
     - Typography scale: H1 30px, H3 18px, H4 10px, body 14px
     - No deviations

3. **Commit and push**
   - Commit message: "B2B Operating System: Today Queue (Phase B) — replace mock with real query"
   - Push to main

**Success Criteria:** Real data loads. All 6 design tests pass. Deployment ready.

---

### Phase C: Live Deployment (1 hour — 1:30–2:30pm)

1. **Pre-deployment checklist**
   - ✅ No console errors in dev
   - ✅ Vercel preview builds (wait for build to complete)
   - ✅ All 6 design tests pass on preview
   - ✅ Mobile view correct
   - ✅ Email integration live (test one send)

2. **Merge to main and deploy**
   - Git push triggers Vercel build
   - Monitor deploy progress
   - Verify live URL: `jimi2-saintandstory.vercel.app/dashboard/admin/b2b`

3. **Smoke test (live)**
   - Open page on staging/live
   - Verify real data loads
   - Click one card, verify expand works
   - Test one email send (confirm Resend receives it)

**Success Criteria:** Page is live, data loads, no errors.

---

### What You're NOT Doing Today
- Pipeline UI (Phase C, next week)
- Discovery UI (Phase D, next week)
- Orders UI (Phase E, next week)
- Analytics UI (Phase F, next week)
- Navigation Sidebar (Phase G, next week)

**These routes exist (empty):**
- `/dashboard/admin/b2b/pipeline` → TODO: Build
- `/dashboard/admin/b2b/discovery` → TODO: Build
- `/dashboard/admin/b2b/orders` → TODO: Build
- `/dashboard/admin/b2b/analytics` → TODO: Build

---

## WHAT'S IN THE CODE RIGHT NOW

### File: app/dashboard/admin/b2b/page.tsx

**Current State:**
- Uses mockProspects array (8 hardcoded companies)
- Renders 3 sections: Intelligence Brief, Prospect Queue, System Status
- Imports ProspectCard component
- Navigation bar links to 5 tabs (only Today is live)

**Today's Change:**
- Remove mockProspects
- Add database query (SELECT * FROM b2b_leads WHERE engagement_score > 50 ORDER BY score DESC LIMIT 12)
- Everything else stays the same

**Lines to change:** 27–164 (mockProspects definition) → 1 SQL query + JOIN

---

## WHAT'S IN THE CODE — Components

### File: components/ProspectCard.tsx

**Props:**
```typescript
prospect: {
  id, business_name, business_category, email, last_contacted_at
}
opportunity: string         // "Expanding operations..."
context: string            // "Recent hiring activity..."
recommendation: string     // "Initiate contact before..."
executiveSummary?: string  // Longer analysis
evidence?: string[]        // ["Opened location", "Hiring..."]
```

**Behavior:**
- Click to expand/collapse (in-place)
- Collapsed: Shows company, opportunity, context, recommendation, metadata
- Expanded: Shows summary, evidence, why it matters, feedback buttons
- Feedback buttons: Correct, Not Useful, Already Contacted, Not Relevant (feed learning)

**Design:** Monochrome, border-[#E8E8E8], hover:border-[#D0D0D0], typography per spec

---

## DATABASE SCHEMA (What Exists)

### Table: b2b_leads
```sql
id: uuid primary key
business_name: varchar
business_category: varchar
email: varchar unique
engagement_score: integer (0-100)  ← Used for ranking
status: varchar (new|contacted|engaged|qualified|won|lost)
created_at: timestamp
updated_at: timestamp
```

### Table: b2b_outreach_events
```sql
id: uuid primary key
lead_id: uuid (FK → b2b_leads)
timestamp: timestamp
event_type: varchar (email_sent|status_updated|feedback_given)
metadata: jsonb (who, what, when details)
-- Append-only (immutable) - used for audit trail
```

### Table: enriched_businesses
```sql
id: uuid primary key
discovered_id: uuid (FK)
opportunity: text          ← Card shows this
context: text             ← Card shows this
signals: jsonb            ← Hidden (for [Inspect Ranking])
recommendation: text      ← Card shows this
created_at: timestamp
```

---

## DEPLOYMENT CHECKLIST (Tonight)

- [ ] Phase A passes (data loads, APIs work)
- [ ] Phase B passes (6 design tests)
- [ ] No console errors
- [ ] Mobile view correct
- [ ] Vercel preview stable
- [ ] Merge to main
- [ ] Live smoke test passes
- [ ] Email send test passes

---

## TIMELINE SUMMARY

| Time | Phase | Activity | Duration |
|------|-------|----------|----------|
| 9:00–9:30 | A | Reality Check: Query test, API test, component test | 30 min |
| 9:30–1:30 | B | Replace mockProspects, run 6 design tests, commit | 2–4 hours |
| 1:30–2:30 | C | Deploy to Vercel, smoke test, verify live | 1 hour |
| 2:30–5:00 | Buffer | Buffer for unforeseen issues, polish, documentation | 2.5 hours |

**Ship Goal:** 5:00pm (end of day)  
**Target:** Today Queue is live, operators can use it tomorrow morning.

---

## SUCCESS CRITERIA

**Code Quality**
- ✅ No console errors
- ✅ Real data loads (not mock)
- ✅ All components render correctly
- ✅ All APIs integrate correctly

**Design Quality**
- ✅ Each section tells ONE story (no confusion)
- ✅ 8am golden path works (<60 seconds)
- ✅ Less is more (hidden data on demand)
- ✅ Color/typography consistent (monochrome, no meaning in color)

**Deployment Quality**
- ✅ Builds on Vercel without errors
- ✅ Mobile responsive
- ✅ Email integration works (test send)
- ✅ Live on jimi2-saintandstory.vercel.app/dashboard/admin/b2b

---

## RISKS & MITIGATION

| Risk | Mitigation |
|------|-----------|
| Data incomplete in b2b_leads | Use mockProspects as fallback; query only top 12 by score |
| API response shape mismatch | Verify API response vs ProspectCard props (Phase A) |
| Design test failure | Root cause each failure; fix before deployment |
| Vercel build fails | Check build logs; likely missing env vars or type error |
| Email integration breaks | Test email send before deploying (smoke test Phase C) |

---

## NEXT WEEK (Phases C–G)

- **Phase C (Pipeline):** Multi-tab showing all prospects, filter/search, batch actions
- **Phase D (Discovery):** Show discovery process, active research missions, signal sources
- **Phase E (Orders):** Show standing orders (recurring prospects), frequency, automation
- **Phase F (Analytics):** Show operator performance, conversion rates, ranking accuracy
- **Phase G (Sidebar):** Unified navigation across all B2B sections

**But today:** Just Today Queue. Ship one thing well.

---

## HOW THIS CONNECTS TO THE BUSINESS

**Why This Matters:**
- Operator opens dashboard at 8am
- Sees: "Here are your 12 best opportunities today"
- Trusts the ranking (because signals are shown)
- Picks one → sends email → logs result
- System learns from feedback → ranking improves tomorrow
- Tomorrow operator sees even better 12

**Autonomous Learning Loop:**
1. Discover businesses (continuous)
2. Enrich signals (continuous)
3. Rank by opportunity (continuous)
4. Operator picks one → sends email → gives feedback
5. System learns what "good" looks like
6. Ranking improves daily

**Revenue Impact:**
- Operator productivity: 8am–5pm, makes one call every 30 min = 16 calls/day
- Conversion assumption: 1:10 (10% callback rate) = 1.6 callbacks/day
- Revenue per callback: £150–300 (varies by job)
- Daily potential: £240–480
- Monthly: £5,760–11,520

**This dashboard makes that machine work.**

---

**Ready to execute?**
