# OPERATOR WORKFLOW AUDIT - WHAT'S ACTUALLY OPERATIONAL

**Date:** June 23, 2026  
**Scope:** Only /operator routes that are live and working  
**Purpose:** Identify exact integration points for reasoning engine  

---

## THE 6 OPERATIONAL STEPS

### **1. DISCOVER** ✅ Live

**Route:** `/operator/discover`

**What it does:**
- Searches businesses via Google Places, postcode, keyword, dork search
- Displays results: name, city, contact, industry, pain point (from reviews)
- Operator: Reviews results, clicks to understand

**Output:** Prospect record created in database

**Current reasoning:** None - just displays found data

---

### **2. UNDERSTAND** ✅ Live

**Route:** `/operator/understand?prospectId=X`

**What it does:**
- Shows prospect details: name, contact, category, enriched data
- Operator: Sets confidence score (1-100) + notes
- Operator: Clicks "Qualify"

**Database update:** 
```
status: new → contacted
lead_state: updated
confidence_score: set
notes: captured
```

**Current reasoning:** None - operator manual judgment only

**← FIRST INTEGRATION POINT**
- Wire in 8-layer intelligence here
- Show why system thinks this prospect is viable
- Let operator review/adjust/override

---

### **3. OUTREACH** ✅ Live

**Route:** `/operator/outreach?prospectId=X`

**What it does:**
- Shows prospect details
- Fetches email draft from system: subject + body
- Draft includes: pressureType ("recognition" | "transformation" | "logical"), variant ("A" | "B")
- Operator: Reviews draft, edits if needed, sends

**Database update:**
```
email_sent_at: timestamp
status: contacted
```

**Current reasoning:** Draft generation exists but mechanism unclear - not traced to strategy/psychology

**← SECOND INTEGRATION POINT**
- Email should be generated using reasoning
- Psychology + strategy should be visible
- Metadata should be stored: which psychology? which strategy? which variant?

---

### **4. RESPONSES** ✅ Live

**Route:** `/operator/responses`

**What it does:**
- Lists all sent emails
- Shows: replied/awaiting response
- Filter: "all" | "replied" | "awaiting"
- Operator: Can send reply to prospect

**Database tracks:**
```
replied: boolean
repliedAt: timestamp
```

**Current reasoning:** None - just tracking opens/replies

---

### **5. ORDERS** ✅ Live

**Route:** `/operator/orders`

**What it does:**
- Lists all standing orders
- Shows: prospect name, value, status (pending | active | completed | renewed)
- Status filter available
- Operator: Can update status, add notes

**Database stores:**
```
id, prospect_id, prospect_name
value, currency
status, created_at, renewal_date
assigned_operator, notes
```

**Current reasoning:** None - just recording booking

**← THIRD INTEGRATION POINT**
- Should store traceability metadata
- Which discovery method found them?
- Which psychology was used?
- Which email version was sent?
- What was the stage/trust at booking?
- This is WHERE revenue learning happens

---

### **6. INTELLIGENCE** ✅ Live

**Route:** `/operator/intelligence`

**What it does:**
- Lists all prospects with engagement_score
- Filter/sort by: Hot (80+), Warm (60-80), Cool (40-60), Cold (<40)
- Shows: business name, email, city, status, score, label

**Current reasoning:** Engagement score only
```
engagement_score = 0-100
Label = Hot/Warm/Cool/Cold
```

**NOT OPERATIONAL:**
```
✗ Psychology analysis
✗ Strategy recommendations
✗ Stage assessment
✗ Trust scoring
✗ Readiness prediction
```

---

## **NOT OPERATIONAL**

### **7. ANALYTICS** ❌ Not Live
- Route: `/operator/analytics`
- Status: "Analytics workflow (coming soon)"
- Do not build on this yet

---

## **THE ACTUAL WORKFLOW (6 Steps)**

```
DISCOVER
  ↓ (businesses found)
  
UNDERSTAND
  ↓ (operator sets confidence, clicks qualify)
  
OUTREACH
  ↓ (operator sends email)
  
RESPONSES
  ↓ (track if they reply)
  
ORDERS
  ↓ (record booking)
  
INTELLIGENCE
  ↓ (see all prospects by engagement)
```

---

## **WHAT NEEDS TO CHANGE FOR REASONING ENGINE**

### **Change 1: UNDERSTAND Page**

**Currently shows:**
- Prospect name, contact, category, enriched data
- Operator confidence slider

**Add:**
- Call: `/api/b2b/intelligence/relationship-analysis?prospect_id=X`
- Display: All 8 layers of RelationshipIntelligenceObject
  1. Facts (observed data)
  2. Evidence (sources, confidence)
  3. Reasoning (inferred needs)
  4. Relationship Model (stage, trust, readiness)
  5. Strategy (how to advance)
  6. Communications (suggested approach)
  7. Timeline (when they'll be ready)
  8. Operator Guidance (why this matters)
- Operator review: Accept reasoning, adjust, override

---

### **Change 2: OUTREACH Page**

**Currently shows:**
- Email draft (subject + body)
- Pressure type, variant

**Add:**
- Call: reasoning to get recommended psychology + strategy
- Display: Why this email? Why now? What psychology is this using?
- Store metadata when sent:
  ```
  psychology_pattern_used: string
  strategy_applied: string
  email_version: string
  stage_at_send: number
  trust_at_send: number
  ```

---

### **Change 3: ORDERS Page**

**Currently shows:**
- Order list with status, value, date

**Add to each order:**
- Store when created:
  ```
  discovered_via: "postcode" | "keyword" | "dork" | "pipeline"
  psychology_used: string
  email_version: string
  operator_name: string
  days_to_booking: number
  lifecycle_value_projected: number
  ```

---

### **Change 4: INTELLIGENCE Page**

**Currently shows:**
- Prospects by engagement score only

**Could add (future):**
- Psychology patterns detected
- Most effective strategies
- Optimal timing for contact
- But this is secondary to the above 3 changes

---

## **FILES TO MODIFY**

### Only 3 files need changes:

```
app/operator/understand/page.tsx
  - Add: API call to /api/b2b/intelligence/relationship-analysis
  - Add: UI component to display 8 layers
  - No layout changes needed

app/operator/outreach/page.tsx
  - Add: Call reasoning before email generation
  - Add: Display reasoning in UI
  - Add: Store psychology + strategy in metadata

app/operator/orders/page.tsx
  - Add: Traceability fields to form
  - Capture: discovery_method, psychology_used, email_version, timing
  - Store on POST
```

---

## **NEW API ROUTES NEEDED**

```
GET /api/b2b/intelligence/relationship-analysis?prospect_id=X
  ← Returns: Full RelationshipIntelligenceObject (8 layers)
  
POST /api/b2b/outreach/{id}
  ← Modified: Use reasoning to generate email
  ← Return: Email + reasoning explanation
  
POST /api/commercial/revenue-memory
  ← New: Record revenue event with traceability
  ← Called when order created

GET /api/commercial/revenue-memory
  ← New: Query revenue insights
  ← Returns: "Why did we earn £X this month?"
```

---

## **SUCCESS CRITERIA**

### Phase 1: Reasoning visible in UNDERSTAND
- ✓ Operator sees 8-layer analysis
- ✓ Can review reasoning before proceeding
- ✓ Can override if needed

### Phase 2: Email generation uses reasoning
- ✓ Email generated with psychology
- ✓ Metadata stored (psychology, strategy, version)
- ✓ Operator can see WHY this email

### Phase 3: Revenue traceability in ORDERS
- ✓ Order records traceability metadata
- ✓ Can query: "Why did we make £X?"
- ✓ Shows: discovery method → psychology → email → booking

---

## **NOTHING TO CHANGE**

✅ DISCOVER workflow - stays as is  
✅ RESPONSES workflow - stays as is  
✅ INTELLIGENCE scoring - stays as is  
✅ Database schema - only add fields, don't remove  
✅ UI navigation - stays as is  
✅ Authentication - stays as is  

**We're only adding reasoning underneath. The workflow structure stays the same.**

---

## **SCOPE SUMMARY**

**What's operational:** 6 steps (Discover → Understand → Outreach → Responses → Orders → Intelligence)

**What needs integration:** 3 steps (Understand + Outreach + Orders)

**Files to modify:** 3 files

**New API routes:** 3 routes

**Time to integrate:** 
- Phase 1 (Understand): 1-2 days
- Phase 2 (Outreach): 1-2 days  
- Phase 3 (Orders): 1 day

**Total: 3-5 days to wire in reasoning engine fully**

