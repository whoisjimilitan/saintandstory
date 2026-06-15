# SCREEN HIERARCHY
**Current state → Operator OS architecture**

---

## CURRENT SCREENS (Wave 3 / Phase 3C)

### Public Routes

**1. /b2b/[niche]**
- Landing page for specific category (florist, accountant, etc.)
- Marketing content
- Links to /b2b/leads
- **Status:** Marketing, not operator facing

**2. /b2b/leads**
- List of all leads/companies
- Tier filtering (Ready Today, A, B, C)
- Search/filter UI
- Card view per lead
- **Status:** Operator facing (primary)

**3. /b2b/ready-today**
- Filtered view of Ready Today leads only
- Subset of /b2b/leads
- **Status:** Operator facing (secondary, redundant)

### Protected Routes

**4. /dashboard/admin/b2b**
- B2BPipeline component
- TODAY section with stats
- PIPELINE section with all leads
- ARCHIVE section with closed leads
- **Status:** Admin dashboard (not operator workspace)

**5. /dashboard/admin/b2b/lead/[id]**
- Individual lead detail page
- Full lead profile
- **Status:** Admin focused, rarely used

**6. /dashboard/driver/b2b**
- Driver-specific B2B view
- **Status:** Separate user type, minimal usage

---

## FUTURE SCREENS (Operator OS)

### Primary Entry Points

**TODAY**
- Single next action
- Company profile
- Challenge + approach
- Primary CTA (Send, Call, Standing Order)
- **Replace:** /b2b/leads (simplify to action-first)

**CONVERSATIONS**
- Company interaction timeline
- Email history
- Call log
- Observations
- **New screen:** (doesn't exist in current system)

**OPPORTUNITIES**
- Active standing orders list
- Frequency management
- Outcome tracking
- **Extract from:** /dashboard/admin/b2b (standing orders panel)

**ACCOUNTS**
- Company search/filter
- Company master list
- Company profile
- **Rename:** /b2b/leads becomes ACCOUNTS

---

## SCREEN MAPPING TABLE

| Current | Future | Action | Rationale |
|---------|--------|--------|-----------|
| /b2b/[niche] | Marketing (unchanged) | KEEP | Not operator tool |
| /b2b/leads | TODAY + ACCOUNTS merge | MERGE | Split into two functions |
| /b2b/ready-today | TODAY (action mode) | REPLACE | Same data, action-focused |
| /dashboard/admin/b2b | TODAY (operator version) | REPLACE | Simplify, make primary |
| CONVERSATIONS | (new) | CREATE | Core OS feature, missing |
| OPPORTUNITIES | Extract from admin | EXTRACT | Standing orders need own space |
| /dashboard/admin/b2b/lead/[id] | Expanded CONVERSATIONS | REPLACE | Detail view consolidation |
| /dashboard/driver/b2b | (unchanged) | KEEP | Separate user type |

---

## CURRENT PROBLEMS THIS SOLVES

### Problem 1: Too Many Entry Points

**Current:**
- /b2b/leads (primary)
- /b2b/ready-today (filtered view of same data)
- /dashboard/admin/b2b (different UI, admin-focused)

**Solution:**
- TODAY (action focus)
- ACCOUNTS (exploration focus)
- CONVERSATIONS (context focus)
- OPPORTUNITIES (sustained focus)

Each has clear purpose. No redundancy.

---

### Problem 2: Tier Categorization Not Operating System

**Current:**
- Users see tier labels (A, B, C, READY)
- Users make tier selection decisions
- Feels like manual CRM categorization

**Solution:**
- System handles ordering (system tiers exist internally)
- Users see one action
- Users don't think about tiers
- More like Raycast (system decides what's next)

---

### Problem 3: Information Overload on /b2b/leads

**Current:**
- 6-7 data points per card
- All tiers visible at once
- Cognitive load high

**Solution:**
- TODAY: One action, full context for that action only
- ACCOUNTS: Search-focused, minimal context
- CONVERSATIONS: History-focused, full timeline
- No "show everything" view

---

### Problem 4: Missing Conversation Context

**Current:**
- Can't see interaction history with a company
- Must infer from email/call count
- No timeline of what happened

**Solution:**
- CONVERSATIONS: Full timeline
- Every interaction visible (email, call, observation)
- Clear chronological narrative
- Operator never guesses "did we contact this company?"

---

### Problem 5: Standing Orders Buried in Admin Dashboard

**Current:**
- Standing orders managed in /dashboard/admin/b2b
- Hidden in a panel
- Not easy to modify
- No outcome tracking visible

**Solution:**
- OPPORTUNITIES: Dedicated space
- Simple list view
- Easy frequency modification
- Response rate visible
- Operator focuses on "which to sustain?"

---

## NAVIGATION STRUCTURE

```
TODAY (Primary Entry)
  │
  ├─ → Send email
  │   └─ View Conversations (post-send)
  │       └─ Create Opportunity
  │
  ├─ → View Conversations (from card)
  │
  └─ → ACCOUNTS (if no TODAY action)

CONVERSATIONS (Context)
  │
  ├─ View full history
  ├─ Send follow-up
  └─ Create/modify Opportunity

OPPORTUNITIES (Recurring)
  │
  ├─ View standing order list
  ├─ Modify frequency
  └─ View outcomes

ACCOUNTS (Inventory)
  │
  ├─ Search company
  ├─ View profile
  └─ Enter TODAY/CONVERSATIONS/OPPORTUNITIES
```

---

## SCREEN CHARACTERISTICS

### TODAY Screen

**Entry:** Login, post-action refresh, on-demand (TODAY button)  
**Information:** Company, challenge, approach, CTA  
**Actions:** Send email, call, create standing order, defer, observe  
**Exit:** Action completed or deferred  

---

### CONVERSATIONS Screen

**Entry:** From company card, from TODAY post-action, by search  
**Information:** Interaction timeline, email subjects, call dates, observations  
**Actions:** Send follow-up, record observation, create/modify opportunity  
**Exit:** Action taken or return to TODAY  

---

### OPPORTUNITIES Screen

**Entry:** Second navigation option, from company card (if opportunity exists)  
**Information:** Standing order list, frequency, next action date, response rate  
**Actions:** Modify frequency, pause, end standing order  
**Exit:** Return to TODAY or ACCOUNTS  

---

### ACCOUNTS Screen

**Entry:** Navigation option, post-TODAY if no action available  
**Information:** Company list, search results, basic profile  
**Actions:** Search, filter, view profile, enter TODAY action  
**Exit:** Enter action flow or continue searching  

---

## URL STRUCTURE (Proposed)

```
Operating System Routes:
  /operator/today          → TODAY (primary)
  /operator/today/[id]     → TODAY with specific company
  /operator/conversation/[id]  → CONVERSATIONS for company
  /operator/opportunities  → OPPORTUNITIES list
  /operator/accounts       → ACCOUNTS list
  /operator/accounts/[id]  → Company profile
  
Admin Routes (separate):
  /admin/b2b               → Analytics/reporting
  /admin/standing-orders   → Management
  /admin/queue             → System queue management
```

---

## SCREEN REMOVAL

### /b2b/ready-today
**Reason:** TODAY action replaces this  
**Operator still gets:** TODAY screen shows READY TODAY action  
**Users affected:** Any bookmarks will 404, redirect to TODAY  

### /dashboard/admin/b2b/lead/[id]
**Reason:** Consolidated into CONVERSATIONS  
**Operator still gets:** Full history visible on CONVERSATIONS  
**Data preserved:** Nothing lost, different navigation  

---

## MOBILE ADAPTATION

### TODAY (Mobile)
- Company name large
- Challenge/approach stacked
- CTA button full-width
- "View Conversations" as secondary link

### CONVERSATIONS (Mobile)
- Timeline stacked vertically
- Each interaction card full-width
- Interactions in reverse chrono order
- Easy scrolling

### OPPORTUNITIES (Mobile)
- List stacked
- Frequency edit: modal or slide-up

### ACCOUNTS (Mobile)
- Search bar at top
- Results stacked
- Tap to view profile

---

## IMPLEMENTATION ORDER

**Phase 1:** TODAY screen (replaces action-first part of /b2b/leads)  
**Phase 2:** CONVERSATIONS screen (new, critical feature)  
**Phase 3:** OPPORTUNITIES extraction (from admin dashboard)  
**Phase 4:** ACCOUNTS refinement (reorganize current /b2b/leads)  
**Phase 5:** Navigation integration (unified sidebar/header)  
**Phase 6:** Mobile optimization  
**Phase 7:** URL migration (/b2b/* → /operator/*)  

