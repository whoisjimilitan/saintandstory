# AUTONOMY BOUNDARY
**What the system does automatically vs. what operators decide**

---

## PRINCIPLE

Operator makes judgment calls.

System handles everything else.

Goal: Operator time < 30 minutes per day.

---

## AUTONOMY MAP

### LEAD DISCOVERY

| Task | SYSTEM DOES | OPERATOR DOES | Type |
|------|---|---|---|
| Identify prospect companies | ✅ Web crawling, APIs, data imports | — | AUTOMATIC |
| Categorize by industry | ✅ Automated tagging from website/data | — | AUTOMATIC |
| Validate company existence | ✅ Data quality checks, deduplication | — | AUTOMATIC |
| Source confirmation | ✅ Mark source (crawled, uploaded, etc.) | — | AUTOMATIC |
| Add to ACCOUNTS | ✅ Automatic on validation pass | — | AUTOMATIC |
| **Decision: Contact this company?** | — | ✅ Approve/defer (via TODAY queue) | MANUAL |

---

### LEAD ENRICHMENT

| Task | SYSTEM DOES | OPERATOR DOES | Type |
|------|---|---|---|
| Fetch company data | ✅ Google Places, Apollo, ZoomInfo APIs | — | AUTOMATIC |
| Extract location | ✅ Parse address, geocoding | — | AUTOMATIC |
| Extract phone/email | ✅ API pulls, parsing, validation | — | AUTOMATIC |
| Fetch reviews/ratings | ✅ Google, Trustpilot, industry APIs | — | AUTOMATIC |
| Extract website content | ✅ Web scrape, NLP extraction | — | AUTOMATIC |
| Identify decision-makers | ✅ LinkedIn API, intent signals | — | AUTOMATIC |
| **Decision: Is enrichment accurate?** | — | ✅ (implicit in "approve contact") | MANUAL |

---

### SCORING & PRIORITIZATION

| Task | SYSTEM DOES | OPERATOR DOES | Type |
|------|---|---|---|
| Category fit scoring | ✅ Keyword match, pattern recognition | — | AUTOMATIC |
| Geographic fit scoring | ✅ Service area match, location data | — | AUTOMATIC |
| Business signal scoring | ✅ Website keywords, intent signals | — | AUTOMATIC |
| Priority queue calculation | ✅ Apply ranking formula (day 7, replies, fit) | — | AUTOMATIC |
| Sort TODAY by priority | ✅ Deterministic algorithm | — | AUTOMATIC |
| **Decision: Is this company priority?** | — | ✅ (implicit in TODAY order) | MANUAL |

---

### EMAIL DRAFTING

| Task | SYSTEM DOES | OPERATOR DOES | Type |
|------|---|---|---|
| Generate subject line | ✅ Template + category + personalization | — | AUTOMATIC |
| Generate email body | ✅ Template + pain point + approach | — | AUTOMATIC |
| Personalize with company name | ✅ Auto-insert from database | — | AUTOMATIC |
| **Decision: Send email as-is?** | — | ✅ Send or customize (TODAY) | MANUAL |
| **Decision: Edit email?** | — | ✅ Optional (advanced feature) | MANUAL |
| Send email | ✅ Auto-send on approval | — | AUTOMATIC |
| Log in audit trail | ✅ Record timestamp, version, recipient | — | AUTOMATIC |

---

### REPLY DETECTION & HANDLING

| Task | SYSTEM DOES | OPERATOR DOES | Type |
|------|---|---|---|
| Monitor for replies | ✅ IMAP/webhook monitoring 24/7 | — | AUTOMATIC |
| Detect reply received | ✅ Email parsing, classification | — | AUTOMATIC |
| Extract reply text | ✅ Parse email body, clean formatting | — | AUTOMATIC |
| Suggest next action | ✅ AI suggests (call, quote, standing order) | — | AUTOMATIC |
| Move to top of TODAY | ✅ Highest priority (score 1000) | — | AUTOMATIC |
| **Decision: How to respond?** | — | ✅ Send suggested reply or write custom | MANUAL |
| Send reply | ✅ Auto-send on approval | — | AUTOMATIC |
| Log in conversation | ✅ Record in timeline | — | AUTOMATIC |

---

### FOLLOW-UP SCHEDULING

| Task | SYSTEM DOES | OPERATOR DOES | Type |
|------|---|---|---|
| Track days since contact | ✅ Calculate date diff daily | — | AUTOMATIC |
| Trigger day-7 follow-up | ✅ Move to TODAY on day 7 | — | AUTOMATIC |
| Suggest follow-up email | ✅ Pre-draft follow-up template | — | AUTOMATIC |
| **Decision: Send follow-up?** | — | ✅ Approve or defer | MANUAL |
| Trigger day-14 discussion | ✅ Move to TODAY with "standing order" action | — | AUTOMATIC |
| **Decision: Create standing order?** | — | ✅ Approve with frequency choice | MANUAL |
| Trigger day-30 archive | ✅ Auto-archive if no engagement | — | AUTOMATIC |

---

### STANDING ORDER WORKFLOW

| Task | SYSTEM DOES | OPERATOR DOES | Type |
|------|---|---|---|
| Suggest standing order | ✅ At day 14 with default frequency | — | AUTOMATIC |
| Set default frequency | ✅ Weekly (most common) | — | AUTOMATIC |
| Schedule first email | ✅ Tomorrow at 08:00 UTC | — | AUTOMATIC |
| **Decision: Create standing order?** | — | ✅ Yes (weekly/bi-weekly/monthly) or skip | MANUAL |
| Generate standing order emails | ✅ Template + personalization per send | — | AUTOMATIC |
| Send scheduled emails | ✅ Auto-send per frequency | — | AUTOMATIC |
| Track open/click rates | ✅ Email provider webhooks | — | AUTOMATIC |
| Calculate response rate | ✅ Count replies / emails sent | — | AUTOMATIC |
| Flag low response (< 20%) | ✅ Move to TODAY for review | — | AUTOMATIC |
| **Decision: Keep, adjust, or end?** | — | ✅ Modify frequency or end | MANUAL |

---

### DRIVER MATCHING

| Task | SYSTEM DOES | OPERATOR DOES | Type |
|------|---|---|---|
| Identify driver candidates | ✅ Query by location, availability | — | AUTOMATIC |
| Calculate compatibility | ✅ Algorithm based on service area, capacity | — | AUTOMATIC |
| Rank drivers by fit | ✅ Best match first | — | AUTOMATIC |
| Prepare driver proposal | ✅ Pre-draft with driver details | — | AUTOMATIC |
| **Decision: Contact this driver?** | — | ✅ Approve or defer | MANUAL |
| Schedule driver call | ✅ Auto-calendar invite | — | AUTOMATIC |

---

### PRICING & QUOTES

| Task | SYSTEM DOES | OPERATOR DOES | Type |
|------|---|---|---|
| Fetch quote request | ✅ Form submission or email parsing | — | AUTOMATIC |
| Extract job details | ✅ NLP parsing (date, location, items) | — | AUTOMATIC |
| Calculate base price | ✅ Algorithm (distance, items, complexity) | — | AUTOMATIC |
| Apply adjustments | ✅ Time-of-year, demand, seasonality | — | AUTOMATIC |
| Generate quote | ✅ Pre-draft with price breakdown | — | AUTOMATIC |
| **Decision: Approve quote?** | — | ✅ Send or adjust | MANUAL |
| Send quote | ✅ Auto-send on approval | — | AUTOMATIC |
| Track quote response | ✅ Monitor if customer accepts/declines | — | AUTOMATIC |

---

### ENGAGEMENT TRACKING

| Task | SYSTEM DOES | OPERATOR DOES | Type |
|------|---|---|---|
| Log email send | ✅ Record timestamp, recipient, version | — | AUTOMATIC |
| Track email open | ✅ Pixel tracking | — | AUTOMATIC |
| Track email click | ✅ Link tracking | — | AUTOMATIC |
| Detect reply | ✅ Email monitoring | — | AUTOMATIC |
| Track call (manual) | — | ✅ Operator logs call notes | MANUAL |
| Track meeting | — | ✅ Operator logs meeting outcome | MANUAL |
| Record observation | — | ✅ Optional note after action | MANUAL |
| Update conversation timeline | ✅ Auto-add all tracked events | — | AUTOMATIC |

---

### DECISION & ESCALATION

| Task | SYSTEM DOES | OPERATOR DOES | Type |
|------|---|---|---|
| Identify need for call | ✅ Suggest "call" as next action (AI) | — | AUTOMATIC |
| Flag hot leads | ✅ High engagement → top of TODAY | — | AUTOMATIC |
| **Decision: Call or email?** | — | ✅ Choose action from TODAY | MANUAL |
| **Decision: Escalate (call)?** | — | ✅ Click [CALL] or defer | MANUAL |
| Schedule call | ✅ Calendar invite auto-generated | — | AUTOMATIC |
| **Decision: Quote needed?** | — | ✅ Operator notes during call | MANUAL |
| Generate quote (if needed) | ✅ Based on details from call | — | AUTOMATIC |

---

### ARCHIVE & LIFECYCLE

| Task | SYSTEM DOES | OPERATOR DOES | Type |
|------|---|---|---|
| Track inactivity (days) | ✅ Count days since last contact | — | AUTOMATIC |
| Auto-archive at day 30 | ✅ Move to ARCHIVE automatically | — | AUTOMATIC |
| **Decision: Reactivate?** | — | ✅ Move back to ACCOUNTS if re-prospecting | MANUAL |
| Track standing order age | ✅ Count days since active | — | AUTOMATIC |
| Auto-archive paused S.O. (180 days) | ✅ Move to ARCHIVE | — | AUTOMATIC |

---

## SUMMARY STATISTICS

| Category | AUTOMATIC | MANUAL | HYBRID |
|----------|-----------|--------|--------|
| Lead Discovery | 5 | 1 | — |
| Lead Enrichment | 6 | 1 | — |
| Scoring | 5 | 1 | — |
| Email Drafting | 4 | 2 | — |
| Reply Handling | 6 | 2 | — |
| Follow-up | 4 | 2 | — |
| Standing Orders | 6 | 2 | — |
| Driver Matching | 5 | 1 | — |
| Pricing | 5 | 1 | — |
| Engagement | 6 | 3 | — |
| Lifecycle | 4 | 1 | — |
| **TOTAL** | **57** | **17** | **—** |

**Ratio: 77% automatic, 23% manual**

---

## OPERATOR MANUAL DECISIONS ONLY

Operator makes exactly 17 decisions per workflow cycle:

1. **Contact this company?** (approve/defer)
2. **Send first contact email?** (approve/customize/skip)
3. **Create standing order?** (yes with frequency / no)
4. **Send follow-up email?** (approve/defer)
5. **Engage driver?** (approve/defer)
6. **Approve quote?** (send/adjust/defer)
7. **Call or email?** (choose action)
8. **How to respond to reply?** (send suggested/write custom)
9. **Modify standing order frequency?** (increase/decrease/end)
10. **Record observation?** (optional note)
11. **Record call outcome?** (optional notes)
12. **Decide on escalation** (call when prompted)
13. **Reactivate archived company?** (move back to ACCOUNTS)
14. **End standing order?** (manual end)
15. **Adjust quote?** (if needed)
16. **Flag for review?** (low response rate)
17. **Next step after call?** (quote, standing order, etc.)

All other actions are system-driven.

