# DORK RESEARCH PLAYBOOK
## Saint & Story Lead Discovery System

**Purpose:** Find businesses actively confessing their courier/logistics/delivery pain on LinkedIn Jobs, then extract into CSV for email personalization.

**Pattern:** `site:linkedin.com [INDUSTRY] [PAIN PHRASE] location:UK`

**Quality Rule:** Real company website + Identified person (full name + job title) only. No anonymous posts.

---

## CSV OUTPUT STRUCTURE

```
| Company Name | Contact Name | Website/Domain | Opportunity Details | Source Platform | Original Post | Posted Date | Business Context |
```

**Each row must have:**
- ✅ Real company name (verifiable)
- ✅ Full contact name + job title (Operations Manager, Practice Manager, etc.)
- ✅ Company website or LinkedIn profile URL
- ✅ Their confession (what they said about courier/delivery need)
- ✅ LinkedIn Jobs (source)
- ✅ Direct quote from their post
- ✅ When posted (approximate date)
- ✅ Why they need courier (their context)

**Exclude:**
- ❌ Anonymous posts ("Hiring for a client")
- ❌ No company info
- ❌ Freelance platforms
- ❌ Generic HR discussions
- ❌ No identifiable person

---

## CATEGORY 1: LEGAL SERVICES

### Pain Phrases (Copy one at a time into search)
```
"we handle time-sensitive"
"court deadlines"
"document delivery"
"urgent legal"
"same-day courier"
```

### Dork Search Strings

**Search 1 - Time Sensitivity:**
```
site:linkedin.com legal services "we handle time-sensitive" location:UK
```

**Search 2 - Court Deadlines:**
```
site:linkedin.com solicitor OR solicitors "court deadline" location:UK
```

**Search 3 - Document Urgency:**
```
site:linkedin.com law firm "urgent document" OR "same-day delivery" location:UK
```

**Search 4 - Practice Manager Role:**
```
site:linkedin.com "practice manager" legal solicitor location:UK
```

**Search 5 - Expansion/Growth:**
```
site:linkedin.com law firm hiring "operations" OR "office manager" location:UK
```

### Example CSV Row
```
Company: Thornton & Associates
Contact: Sarah Mitchell, Practice Manager
Website: thornton-associates.co.uk
Opportunity: "We're looking for a reliable same-day courier for urgent court documents"
Source: LinkedIn Jobs
Original Post: "We handle time-sensitive legal cases across London and need a courier who can guarantee next-morning delivery of court bundles."
Date: 18 Jun 2026
Context: Managing 8 lawyers, handles ~20 court deadlines per month, currently uses 3 different couriers
```

---

## CATEGORY 2: HEALTHCARE / PHARMACY

### Pain Phrases
```
"urgent supplies"
"same-day delivery"
"time-critical"
"prescription delivery"
"medical courier"
```

### Dork Search Strings

**Search 1 - Urgent Supplies:**
```
site:linkedin.com pharmacy "urgent supplies" OR "same-day delivery" location:UK
```

**Search 2 - Healthcare Distribution:**
```
site:linkedin.com hospital OR clinic "medical courier" OR "time-critical" location:UK
```

**Search 3 - Pharmaceutical Operations:**
```
site:linkedin.com pharmaceutical "logistics manager" OR "operations manager" location:UK
```

**Search 4 - Surgical Supply:**
```
site:linkedin.com "surgical supplies" OR "medical supplies" "delivery" location:UK
```

**Search 5 - Prescription Fulfillment:**
```
site:linkedin.com pharmacy "prescription delivery" OR "patient delivery" location:UK
```

### Example CSV Row
```
Company: City Pharmacy Group
Contact: James Chen, Operations Manager
Website: citypharmacy.co.uk
Opportunity: "Looking for reliable prescription delivery to patients same-day"
Source: LinkedIn Jobs
Original Post: "We deliver 50+ prescriptions daily across London. Need a courier who understands pharmaceutical compliance and can guarantee morning delivery."
Date: 15 Jun 2026
Context: 12 locations, 200+ prescriptions per week, currently 2 couriers + van, wants dedicated backup
```

---

## CATEGORY 3: ESTATE AGENTS

### Pain Phrases
```
"completion delays"
"document delivery"
"same-day courier"
"time-sensitive"
"closing deadline"
```

### Dork Search Strings

**Search 1 - Completion Documents:**
```
site:linkedin.com estate agent "completion" OR "closing" "document" location:UK
```

**Search 2 - Same-Day Need:**
```
site:linkedin.com "estate agent" OR "estate agents" "same-day" OR "urgent" location:UK
```

**Search 3 - Office Manager:**
```
site:linkedin.com estate agent "office manager" OR "operations manager" location:UK
```

**Search 4 - Multi-Branch:**
```
site:linkedin.com estate agency hiring "operations" multiple locations location:UK
```

**Search 5 - Delays Prevention:**
```
site:linkedin.com estate agent "prevent delays" OR "reliable delivery" location:UK
```

### Example CSV Row
```
Company: Prime Property Solutions
Contact: Emma Richardson, Operations Manager
Website: primeproperty.co.uk
Opportunity: "Need reliable same-day courier for completion documents and keys"
Source: LinkedIn Jobs
Original Post: "We close 15-20 properties weekly. Completion documents need to reach solicitors same-day. Currently using 3 different couriers, missing deadlines costs us deals."
Date: 19 Jun 2026
Context: 6 branches, ~80 transactions monthly, delays cost ~£500 per incident
```

---

## CATEGORY 4: ACCOUNTING / TAX

### Pain Phrases
```
"tax deadline"
"compliance deadline"
"time-sensitive filing"
"document delivery"
"same-day courier"
```

### Dork Search Strings

**Search 1 - Tax Compliance:**
```
site:linkedin.com accounting "tax deadline" OR "compliance deadline" location:UK
```

**Search 2 - Document Filing:**
```
site:linkedin.com accountant OR accountancy "document filing" OR "same-day delivery" location:UK
```

**Search 3 - Operations Support:**
```
site:linkedin.com accounting "operations manager" OR "office manager" location:UK
```

**Search 4 - Year-End:**
```
site:linkedin.com accounting "year-end" OR "filing deadline" hiring location:UK
```

**Search 5 - Multi-Office:**
```
site:linkedin.com accounting firm multiple offices "document courier" location:UK
```

### Example CSV Row
```
Company: Russell & Partners Accountancy
Contact: Michael Thompson, Practice Manager
Website: russellandpartners.co.uk
Opportunity: "Need reliable same-day courier for tax deadline documents"
Source: LinkedIn Jobs
Original Post: "During tax season we file 200+ documents per week with HMRC. Missing a deadline by even an hour costs our clients penalties. Need a courier who guarantees same-day filing."
Date: 17 Jun 2026
Context: 4 partners, 50+ clients, peak season Jan-Feb and Mar-Apr, uses 2 in-house vans
```

---

## CATEGORY 5: CONSTRUCTION / TRADES

### Pain Phrases
```
"site delivery"
"material delivery"
"same-day collection"
"urgent supplies"
"site delays"
```

### Dork Search Strings

**Search 1 - Site Materials:**
```
site:linkedin.com construction "material delivery" OR "site delivery" location:UK
```

**Search 2 - Urgent Supplies:**
```
site:linkedin.com construction OR builder "urgent supplies" OR "same-day" location:UK
```

**Search 3 - Project Manager:**
```
site:linkedin.com construction "project manager" OR "operations manager" location:UK
```

**Search 4 - Multi-Site:**
```
site:linkedin.com construction company "managing multiple sites" hiring location:UK
```

**Search 5 - Supply Chain:**
```
site:linkedin.com construction "supply chain" OR "logistics" "courier" location:UK
```

### Example CSV Row
```
Company: BuildRight Contractors
Contact: David Patterson, Operations Manager
Website: buildright.co.uk
Opportunity: "Need same-day material delivery for multiple construction sites"
Source: LinkedIn Jobs
Original Post: "We run 6-8 active sites across London. Site delays cost £2k/day. We need a courier who can deliver materials to multiple sites same-day and collect from suppliers on demand."
Date: 16 Jun 2026
Context: £5M turnover, 40+ staff, 12+ active projects, currently uses courier for 10-15 deliveries/week
```

---

## CATEGORY 6: RESTAURANT / HOSPITALITY

### Pain Phrases
```
"supplier delivery"
"same-day collection"
"urgent supplies"
"food delivery"
"last-minute orders"
```

### Dork Search Strings

**Search 1 - Supplier Coordination:**
```
site:linkedin.com restaurant "supplier delivery" OR "food courier" location:UK
```

**Search 2 - Last-Minute Needs:**
```
site:linkedin.com hospitality "same-day delivery" OR "urgent supplies" location:UK
```

**Search 3 - Manager Role:**
```
site:linkedin.com restaurant "general manager" OR "operations manager" location:UK
```

**Search 4 - Group/Chain:**
```
site:linkedin.com restaurant group "multiple locations" hiring location:UK
```

**Search 5 - Supplier Issues:**
```
site:linkedin.com restaurant "unreliable delivery" OR "failed orders" location:UK
```

### Example CSV Row
```
Company: The Olive Kitchen
Contact: Marcus Williams, General Manager
Website: theolive.co.uk
Opportunity: "Need reliable same-day delivery from multiple suppliers"
Source: LinkedIn Jobs
Original Post: "We run 3 restaurants. Every night we need last-minute food deliveries from 5+ suppliers. Failed deliveries mean canceled dishes and angry customers. Currently juggling 3 couriers."
Date: 14 Jun 2026
Context: 3 locations, 200+ covers/night, 15-20 collections/deliveries per day, peak season weekends
```

---

## CATEGORY 7: RETAIL / ECOMMERCE

### Pain Phrases
```
"stock delivery"
"same-day dispatch"
"urgent restocking"
"customer delivery"
"supply chain"
```

### Dork Search Strings

**Search 1 - Stock Delivery:**
```
site:linkedin.com retail "stock delivery" OR "same-day" location:UK
```

**Search 2 - Ecommerce Fulfillment:**
```
site:linkedin.com ecommerce OR "online retail" "logistics" OR "courier" location:UK
```

**Search 3 - Store Operations:**
```
site:linkedin.com retail "operations manager" OR "logistics manager" location:UK
```

**Search 4 - Multi-Store Chain:**
```
site:linkedin.com retail chain "multiple stores" delivery location:UK
```

**Search 5 - Supply Urgency:**
```
site:linkedin.com retail "urgent restocking" OR "customer delivery" location:UK
```

### Example CSV Row
```
Company: Urban Clothing Co
Contact: Lisa Foster, Operations Manager
Website: urbanclothing.co.uk
Opportunity: "Need same-day delivery for stock and customer orders across London"
Source: LinkedIn Jobs
Original Post: "We run 5 stores + online. We need stock delivered to stores same-day, and customer orders shipped same-day. Currently using 2 couriers, always missing delivery windows."
Date: 20 Jun 2026
Context: £2M revenue, 15 staff, 50+ orders/day, 10+ store deliveries/week
```

---

## CATEGORY 8: LEGAL DOCUMENT COURIERS (SPECIALIZED)

### Pain Phrases
```
"court documents"
"barrister delivery"
"case deadline"
"same-day service"
"time-critical brief"
```

### Dork Search Strings

**Search 1 - Barrister Chambers:**
```
site:linkedin.com barrister OR "barrister chambers" "document delivery" location:UK
```

**Search 2 - Legal Process:**
```
site:linkedin.com "process server" OR "bailiff" "delivery" location:UK
```

**Search 3 - Court Services:**
```
site:linkedin.com court OR "court services" "same-day delivery" location:UK
```

**Search 4 - Legal Admin:**
```
site:linkedin.com barrister "office manager" OR "practice manager" location:UK
```

---

## CATEGORY 9: ARCHITECT / ENGINEERING

### Pain Phrases
```
"plans delivery"
"blueprint courier"
"site delivery"
"urgent drawings"
"project documents"
```

### Dork Search Strings

**Search 1 - Plans Delivery:**
```
site:linkedin.com architect OR architecture "plans delivery" OR "blueprint" location:UK
```

**Search 2 - Engineering Documents:**
```
site:linkedin.com engineering "document delivery" OR "site delivery" location:UK
```

**Search 3 - Project Coordination:**
```
site:linkedin.com architect "operations manager" OR "project coordinator" location:UK
```

**Search 4 - Multi-Project:**
```
site:linkedin.com architecture firm "multiple projects" courier location:UK
```

---

## CATEGORY 10: BEAUTY / SALON

### Pain Phrases
```
"product delivery"
"supplier delivery"
"same-day restocking"
"urgent supplies"
```

### Dork Search Strings

**Search 1 - Product Supply:**
```
site:linkedin.com salon OR beauty "product delivery" OR "same-day" location:UK
```

**Search 2 - Multi-Location:**
```
site:linkedin.com salon chain "multiple locations" delivery location:UK
```

**Search 3 - Manager Role:**
```
site:linkedin.com salon "manager" OR "operations" hiring location:UK
```

---

## CATEGORY 11: VETERINARY

### Pain Phrases
```
"medical supply"
"urgent medication"
"same-day delivery"
"pharmaceutical"
```

### Dork Search Strings

**Search 1 - Vet Supplies:**
```
site:linkedin.com veterinary OR "vet clinic" "medical supply" OR "urgent" location:UK
```

**Search 2 - Urgent Medication:**
```
site:linkedin.com vet "same-day delivery" OR "urgent medication" location:UK
```

---

## CATEGORY 12: DENTAL

### Pain Phrases
```
"lab delivery"
"dental supplies"
"same-day courier"
"urgent delivery"
```

### Dork Search Strings

**Search 1 - Lab Coordination:**
```
site:linkedin.com dental "lab delivery" OR "courier" location:UK
```

**Search 2 - Supplies:**
```
site:linkedin.com dental practice "same-day delivery" OR "urgent supplies" location:UK
```

---

## CATEGORY 13: MANUFACTURING

### Pain Phrases
```
"parts delivery"
"supply chain"
"production delay"
"same-day courier"
"urgent materials"
```

### Dork Search Strings

**Search 1 - Parts Delivery:**
```
site:linkedin.com manufacturing "parts delivery" OR "supply chain" location:UK
```

**Search 2 - Production Schedules:**
```
site:linkedin.com manufacturing "production delay" OR "urgent materials" location:UK
```

**Search 3 - Operations:**
```
site:linkedin.com manufacturing "operations manager" OR "supply chain manager" location:UK
```

---

## CATEGORY 14: FILM / PRODUCTION

### Pain Phrases
```
"equipment delivery"
"location courier"
"same-day delivery"
"urgent materials"
```

### Dork Search Strings

**Search 1 - Equipment Logistics:**
```
site:linkedin.com film OR production "equipment delivery" OR "same-day" location:UK
```

**Search 2 - Location Support:**
```
site:linkedin.com "film production" OR "tv production" "logistics" OR "courier" location:UK
```

---

## CATEGORY 15: OFFICE SUPPLIES

### Pain Phrases
```
"supply delivery"
"same-day restocking"
"urgent supplies"
"stock management"
```

### Dork Search Strings

**Search 1 - Supplies:**
```
site:linkedin.com "office supplies" "same-day delivery" OR "urgent" location:UK
```

**Search 2 - Operations:**
```
site:linkedin.com office supplies "operations manager" OR "logistics" location:UK
```

---

## CATEGORY 16: ART GALLERY / AUCTION

### Pain Phrases
```
"artwork delivery"
"courier insurance"
"safe delivery"
"exhibition materials"
```

### Dork Search Strings

**Search 1 - Artwork Transport:**
```
site:linkedin.com "art gallery" OR auction "artwork delivery" OR "courier" location:UK
```

---

## CATEGORY 17: CATERING / EVENTS

### Pain Phrases
```
"last-minute delivery"
"same-day supplies"
"event materials"
"urgent collection"
```

### Dork Search Strings

**Search 1 - Event Logistics:**
```
site:linkedin.com catering OR "event planning" "same-day delivery" OR "urgent" location:UK
```

**Search 2 - Operations:**
```
site:linkedin.com catering "operations manager" OR "logistics" location:UK
```

---

## CATEGORY 18: PROPERTY / LETTINGS

### Pain Phrases
```
"key delivery"
"document delivery"
"same-day courier"
"completion deadline"
```

### Dork Search Strings

**Search 1 - Lettings Management:**
```
site:linkedin.com lettings OR "lettings agent" "key delivery" OR "same-day" location:UK
```

**Search 2 - Property Management:**
```
site:linkedin.com "property management" "document delivery" OR "courier" location:UK
```

---

## HOW TO USE THIS PLAYBOOK

### Step 1: Choose a Category
Pick one category above (or rotate through them).

### Step 2: Run the Search
Copy a dork search string → paste into Google.com → press Enter.

### Step 3: Review Results
Look for job postings with:
- ✅ Clear company name (verifiable)
- ✅ Identifiable person + job title
- ✅ Company website in profile
- ✅ They're confessing a courier/delivery/logistics need
- ✅ Posted in last 30-60 days

### Step 4: Extract to CSV
For each qualified result, add a row with:
- Company Name
- Contact Name + Title
- Website/Domain
- Their confession (summarized)
- Source: "LinkedIn Jobs"
- Original Post (direct quote)
- Posted Date
- Business Context (why this matters to them)

### Step 5: Upload CSV
Once you have 20-50 rows, upload to the system for personalization.

---

## QUALITY CHECKLIST

**Before adding a row to CSV, verify:**

- [ ] Real company (can verify website)
- [ ] Person has full name + job title
- [ ] They're hiring/have active role (not archived profile)
- [ ] Their post mentions courier/delivery/logistics/supply chain need
- [ ] Website is business domain (not LinkedIn-only)
- [ ] Post is from last 60 days
- [ ] Confession is direct quote (not implied)
- [ ] Business context explains WHY they need courier

**Red Flags (Skip These):**
- ❌ "Hiring for a client" (anonymous)
- ❌ No company info in profile
- ❌ Freelance platforms
- ❌ Generic HR recruiting
- ❌ No delivery/logistics mention
- ❌ Profile is deleted/archived

---

## VOLUME EXPECTATIONS

**Per Search String:** 5-15 qualified results
**Per Category:** 15-40 qualified results
**All 18 Categories:** 270-720 total leads
**Time per Category:** 20-30 minutes
**Quality Rate:** ~60-70% of results will be usable

---

## CSV UPLOAD FORMAT

When ready to upload, ensure:
- Column headers match exactly (copy from template)
- No blank rows
- No duplicate companies
- All rows have website domain
- All rows have identified person with title
- Date format: DD Mon YYYY (e.g., "21 Jun 2026")

---

**Created:** 7 July 2026  
**System:** Saint & Story Lead Discovery  
**Process:** Manual dork search → CSV upload → Email personalization
