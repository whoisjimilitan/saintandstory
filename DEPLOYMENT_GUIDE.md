# Phase 1 Deployment Guide

Build is passing. Everything is ready for production deployment.

## Step 1: Deploy Database Schema (5 minutes)

The ProspectFeedback table needs to be created in your production Neon database.

**Run this in your terminal:**

```bash
cd /Users/jimilitan/Documents/GitHub/saintandstory
npx prisma db push
```

You'll be prompted:
```
? We need to execute X migrations on your database. Ready? (Y/n)
```

Type `Y` and confirm.

**What happens:**
- Creates `prospect_feedback` table with columns: id, slug, feedbackType, referrer, userAgent, createdAt
- Adds indexes on slug and createdAt for fast queries
- No other tables are modified

**Verify it worked:**
```bash
npx prisma db execute --stdin < /dev/null
SELECT * FROM prospect_feedback LIMIT 1;
```

---

## Step 2: Push to Git & Deploy to Vercel (5 minutes)

**Commit the changes:**

```bash
cd /Users/jimilitan/Documents/GitHub/saintandstory
git add -A
git commit -m "Phase 1: Prospect Intelligence Pages V1

- Add ProspectFeedback model to collect movement intelligence feedback
- Create prospect-pages library (buildProspectPageData, findBusinessBySlug, etc)
- Create movement-intelligence layer (getMovementsForBusiness for 10+ industries)
- Create opportunity-engine (rankMovementsByOpportunity by urgency)
- Add ProspectHero, ProspectMovementCard, ProspectMovements components
- Add FeedbackButtons component with POST handler
- Add ProspectBriefingPage layout component
- Add /prospect/[slug] route handler for on-demand page generation
- Add /api/prospect-feedback endpoint for feedback collection
- Integrate View Prospect Brief link in B2B dashboard
- Movement detection covers: Legal, Estate Agent, Construction, Medical, Accounting, Insurance
- On-demand generation ensures logic updates instantly propagate to all pages
- No caching or database persistence except feedback table"
```

**Push to GitHub:**

```bash
git push origin main
```

**Vercel Deployment:**

Option A - **Automatic** (recommended):
- Vercel will auto-deploy when it detects the push
- Check https://vercel.com/dashboard → select saintandstory → Deployments
- Wait for build to complete (should take ~2 min)
- Once green, it's live

Option B - **Manual Trigger:**
- Go to Vercel dashboard
- Click "Redeploy" on the latest commit
- Confirm

**Verify it deployed:**

Once Vercel build is green, visit:
```
https://saintandstoryltd.co.uk/prospect/wilson-solicitors
```

You should see the prospect briefing page (or 404 if that business isn't in the database - that's expected).

---

## Step 3: Test End-to-End (10 minutes)

### 3a: Verify Dashboard Link Works

1. Go to: https://saintandstoryltd.co.uk/dashboard/admin/b2b
2. Find any lead (e.g., a Solicitor)
3. Click to expand the lead card
4. You should see new button: **[View Prospect Brief →]**
5. Click it → opens `/prospect/{slug}` in new tab
6. Confirm URL matches the business name

### 3b: Verify Page Renders Correctly

When the prospect page opens, verify:

✓ **Hero Section:**
  - Business name displays
  - Category displays (e.g., "Solicitor")
  - City displays
  - Opening brief: "We spent some time understanding the delivery situations..."

✓ **Movements Section:**
  - "Delivery Situations We Believe Matter" heading
  - Exactly 3 movement cards displayed
  - For Solicitor: should show Court Filing Documents, Signed Contracts, Property Completions
  - Each card has: movement type, description, "How Saint & Story helps" section

✓ **Feedback Section:**
  - 3 buttons: "Yes, reflects our operation" | "Partly" | "Not really"

### 3c: Test Feedback Collection

1. Click "Yes, reflects our operation" button
2. Button shows loading state briefly
3. Success message appears: "Thank you for the feedback. It helps us understand what matters."
4. Message disappears after 3 seconds

### 3d: Verify Feedback in Database

**Connect to Neon and check:**

```sql
SELECT * FROM prospect_feedback 
WHERE slug = 'wilson-solicitors' 
ORDER BY created_at DESC 
LIMIT 5;
```

Expected output:
```
id          slug               feedbackType  referrer  user_agent  created_at
--------    ----------------   -----------   --------  ----------  ----------
abc123...   wilson-solicitors  yes           NULL      Mozilla...  2024-06-03 14:22:15.234Z
```

---

## Step 4: Test Different Industry Categories

Test at least one business from each major industry to verify movement detection:

### Solicitor / Law Firm
- **Expected movements:** Court Filing Documents, Signed Legal Contracts, Property Completion Documents
- **Why:** Deadline urgency, legal deadlines, property completions

### Estate Agent
- **Expected movements:** Property Completion Keys, Urgent Valuation Documents, Mortgage & Contract Documents
- **Why:** Same-day key exchange, appraisal speed, finance deadlines

### Construction / Builder / Contractor
- **Expected movements:** Emergency Site Materials, Revised Specifications, Safety Certificates
- **Why:** Site delays, spec changes, compliance deadlines

### Medical / Pharmacy / Clinic / Hospital
- **Expected movements:** Prescription & Medication Transfers, Medical Specimens, Medical Records
- **Why:** Urgent care, specimen speed, privacy/compliance

### Accountant / Accounting
- **Expected movements:** Tax Filing Documents, Financial Records & Statements, Audit Documentation
- **Why:** Deadline seasons, audit speed, tax year-end

### Insurance / Insurance Broker
- **Expected movements:** Policy Documents, Claims Documentation, Underwriting Files
- **Why:** Claim urgency, underwriting deadlines, policy changes

**For each industry tested, screenshot:**
1. Dashboard with [View Prospect Brief →] link visible
2. Full prospect page showing 3 movements + feedback buttons
3. Database showing feedback entry

---

## Step 5: Monitor Feedback Data

Once prospects start viewing pages and submitting feedback, collect data:

**Run weekly query:**

```sql
SELECT feedbackType, COUNT(*) as count 
FROM prospect_feedback 
WHERE created_at >= NOW() - INTERVAL '7 days'
GROUP BY feedbackType 
ORDER BY count DESC;
```

**Analyze results:**

- **High "yes" rate (70%+):** Movement detection is accurate for that industry
- **High "partly" rate:** Briefs are on the right track but need refinement
- **High "no" rate (20%+):** Movement detection is missing the mark; revisit movement-intelligence.ts

**If refinement is needed:**

Edit `lib/movement-intelligence.ts` to adjust which movements appear for each industry:

```typescript
// Example: Add a new movement for Solicitors
solicitor: [
  "Court Filing Documents",
  "Signed Legal Contracts",
  "Property Completion Documents",
  "Immigration Documentation",
  "Evidence Documentation",  // ← NEW
],
```

**No deployment needed.** Changes go live immediately to all prospect pages.

---

## Success Criteria

✅ Database schema deployed  
✅ Code deployed to Vercel  
✅ Dashboard [View Prospect Brief →] link works  
✅ /prospect/[slug] pages render with correct movements  
✅ Feedback buttons POST to API  
✅ Feedback appears in database  
✅ Movements are industry-specific (not generic)  
✅ Briefing tone is operational, not marketing  

---

## If Something Goes Wrong

**404 on /prospect/{slug}:**
- Business doesn't exist in b2b_leads table, or
- Slug doesn't match any business in database
- **Fix:** Use existing business that was discovered/added to dashboard

**Feedback button not working:**
- Check browser console for errors
- Verify /api/prospect-feedback endpoint is deployed
- Check Vercel logs: https://vercel.com/dashboard → saintandstory → Logs

**Prospect page shows generic movements:**
- Business category doesn't match any key in movement-intelligence.ts
- **Fix:** Add the category to movement-intelligence.ts or use a closer match

**Database migration failed:**
- Verify DATABASE_URL is set in your environment
- Check Neon dashboard for connection issues
- Run: `npx prisma db push --force-reset` (WARNING: resets all data) only if absolutely necessary

---

## Next: Phase 2

Once Phase 1 is live and collecting feedback (target: 50+ responses), you're ready for Phase 2:

1. **Movement SEO Pages** (`/movement/[slug]`) — Static, cached pages for each movement type
2. **Prospect-Specific Outreach** — Email campaigns linking to prospect pages
3. **Feedback Analytics Dashboard** — Real-time view of which movements resonate
4. **Auto-Generated Scripts** — Call scripts and meeting prep per opportunity

But for now: **Validate Phase 1 with real prospects. Collect feedback. Listen to the data.**

The intelligence loop is now open.

