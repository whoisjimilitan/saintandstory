# GOOGLE SHEETS SETUP GUIDE
## Dork Research CSV Entry System

Use this guide to set up a Google Sheet for collecting dork search results.

---

## QUICK START

### Option 1: Use Existing Template (Fastest)
1. Go to: `https://docs.google.com/spreadsheets/create`
2. Create new blank sheet
3. Name it: `Saint & Story - Dork Research [Your Name]`
4. Copy the CSV template from `DORK_CSV_TEMPLATE.csv`
5. Paste into Sheet tab 1

### Option 2: Manual Setup (5 minutes)

#### Step 1: Create Google Sheet
1. Go to `Google Sheets` (sheets.google.com)
2. Click `+ Create New` → `Blank Spreadsheet`
3. Name: `Saint & Story - Dork Research - [Category]`
   - Example: `Saint & Story - Dork Research - Legal`

#### Step 2: Add Column Headers
In Row 1, add these exact headers:

| Column | Header |
|--------|--------|
| A | Company Name |
| B | Contact Name |
| C | Website/Domain |
| D | Opportunity Details |
| E | Source Platform |
| F | Original Post |
| G | Posted Date |
| H | Business Context |

**Copy-paste line:**
```
Company Name	Contact Name	Website/Domain	Opportunity Details	Source Platform	Original Post	Posted Date	Business Context
```

#### Step 3: Format Headers
1. Select Row 1 (click row number "1")
2. Make bold: `Ctrl+B` (or `Cmd+B`)
3. Add background color: Light gray or light blue
4. Set font size to 12

#### Step 4: Set Column Widths
- Column A (Company Name): 150px
- Column B (Contact Name): 120px
- Column C (Website/Domain): 150px
- Column D (Opportunity Details): 200px
- Column E (Source Platform): 120px
- Column F (Original Post): 300px
- Column G (Posted Date): 100px
- Column H (Business Context): 250px

#### Step 5: Freeze Header Row
1. Click cell A2
2. Go to `View` → `Freeze` → `1 row`

---

## HOW TO FILL IN EACH COLUMN

### Column A: Company Name
**What:** Legal business name  
**Example:** `ABC Law` or `Quality Pharmacy`  
**Do:** Use exact name from LinkedIn profile or company website  
**Don't:** Use nicknames or abbreviations

### Column B: Contact Name
**What:** Full name + Job Title  
**Example:** `Sarah James, Practice Manager`  
**Format:** `FirstName LastName, JobTitle`  
**Job Titles to Look For:**
- Operations Manager
- Practice Manager
- Logistics Manager
- Office Manager
- General Manager
- Procurement Manager
- Warehouse Manager
- Business Owner

### Column C: Website/Domain
**What:** Company website or LinkedIn profile URL  
**Example:** `abclaw.co.uk` or `linkedin.com/company/abc-law`  
**Format:** Just the domain, no `https://`  
**Must Have:** Either company website OR LinkedIn company profile  
**Skip if:** No website or LinkedIn profile found

### Column D: Opportunity Details
**What:** 1-sentence summary of their courier/delivery need  
**Example:** `Looking for reliable same-day legal document courier`  
**Do:** Summarize their confession  
**Don't:** Add your own words, just summarize what they said

### Column E: Source Platform
**What:** Where you found them  
**Always:** `LinkedIn Jobs` (this is our main source)  
**Other options:** `LinkedIn About` `LinkedIn Post` `Twitter` `Reddit` (if applicable)

### Column F: Original Post
**What:** Direct quote from their job posting or about section  
**Example:** `"We're looking for a better same-day courier for our court documents. Missing deadlines costs us clients."`  
**Do:** Use quotation marks and direct quotes only  
**Length:** 1-2 sentences, the key confession phrase

### Column G: Posted Date
**What:** When the job was posted  
**Format:** `DD Mon YYYY` (e.g., `21 Jun 2026`)  
**If unsure:** Put approximate date (e.g., `~15 Jun 2026`)  
**How to find:** LinkedIn shows "Posted 3 weeks ago" → calculate the date

### Column H: Business Context
**What:** Why this business needs courier service (2-3 details)  
**Example:** `Operations Manager at 5-person firm handling 20+ court cases monthly`  
**Include:**
- Their role/title
- Number of deliveries/transactions per week
- Geographic scope (if mentioned)
- Business size (if mentioned)
- Pain point details (if mentioned)

---

## DATA ENTRY WORKFLOW

### Before You Search
1. Pick one category from DORK_RESEARCH_PLAYBOOK.md
2. Open your Google Sheet
3. Have a text editor open to draft entries

### While Searching
1. Run one dork search string
2. Review results (5-15 per search)
3. For each qualified result:
   - Copy company name, person name, website
   - Copy their confession quote
   - Fill in the remaining fields

### Quality Check Per Row
Before clicking next:

- [ ] Company name is real (can verify on Google)
- [ ] Contact has first name + last name + job title
- [ ] Website is business domain (not just LinkedIn)
- [ ] Opportunity details summarize their pain
- [ ] Original Post is a direct quote (in quotes)
- [ ] Date is in correct format (DD Mon YYYY)
- [ ] Business Context explains why they need courier

---

## TIPS FOR EFFICIENT RESEARCH

### Tip 1: Open Two Windows
- Window 1: Google Sheet
- Window 2: LinkedIn search results
- Toggle between them with Alt+Tab

### Tip 2: Copy-Paste Efficiently
- Copy name from LinkedIn → Paste to Sheet
- Copy quote → Paste to Column F
- Fill in derived fields (Business Context, Website) after

### Tip 3: Batch by Company Size
- Start with larger companies (more pain, higher LTV)
- Multi-location businesses are better (more courier need)
- Single-location can be skipped if no clear pain

### Tip 4: Look for Repeat Signals
If you see multiple posts from same category confessing same pain:
- "Same-day delivery"
- "Urgent supplies"
- "Courier failures"
→ This pain is validated, prioritize these companies

### Tip 5: Leverage LinkedIn Filters
On LinkedIn Jobs search:
- Sort by: Most recent
- Location: London, UK (or other regions)
- Posted: Last 30 days
- Experience level: All (we want decision-makers)

---

## CSV UPLOAD TO SYSTEM

### When Ready to Upload

Once you have 20-50 rows filled in:

1. **Download as CSV:**
   - Google Sheet → File → Download → CSV (.csv)
   - File will be named: `Sheet1.csv`

2. **Rename File (optional):**
   - Better names: `Dork_Legal_Jimi_July2026.csv`
   - Helps track which category and researcher

3. **Upload to System:**
   - Go to `/operator/discover/dork-inject-modal`
   - Click "Upload CSV"
   - Select your downloaded CSV
   - System validates structure
   - System personalizes emails using confessions
   - Ready to send

---

## EXPECTED QUALITY METRICS

| Metric | Target | Notes |
|--------|--------|-------|
| Rows per hour | 5-8 | Depends on post quality and detail level |
| Total rows per session | 20-50 | Good batch for first upload |
| Usable rate | 70-80% | Some rows may need manual review/cleanup |
| Time per row | 5-10 min | Read post, verify company, extract data |

---

## COMMON MISTAKES TO AVOID

### ❌ Wrong: Skipping website requirement
```
❌ Company: ABC Law (no website provided, just LinkedIn profile)
```

### ✅ Right: Always include domain
```
✅ Company: ABC Law, Website: abclaw.co.uk
```

### ❌ Wrong: Paraphrasing instead of quoting
```
❌ Original Post: They need a same-day courier for legal documents
```

### ✅ Right: Direct quote
```
✅ Original Post: "We need a same-day courier for court documents"
```

### ❌ Wrong: No job title
```
❌ Contact: Sarah James (missing title)
```

### ✅ Right: Include title
```
✅ Contact: Sarah James, Practice Manager
```

### ❌ Wrong: Summarizing opportunity in Context field
```
❌ Context: They need couriers
```

### ✅ Right: Adding business detail in Context
```
✅ Context: Operations Manager at 5-person firm handling 20+ court cases monthly
```

---

## SHARING YOUR SHEET

### To Share with Jimi for Review

1. Click Share button (top right)
2. Enter: `whoisjimi.today@gmail.com`
3. Permission: `Editor` (so I can review/edit)
4. Click Share

---

## NEXT STEPS

1. Choose first category (suggest: Legal, Healthcare, Estate Agents)
2. Set up your Google Sheet using Option 1 or 2 above
3. Run 2-3 dork searches from that category
4. Fill in 20-30 rows
5. Download as CSV and share for system testing

---

**Template Created:** 7 July 2026  
**System:** Saint & Story Dork Research  
**Contact:** whoisjimi.today@gmail.com for upload questions
