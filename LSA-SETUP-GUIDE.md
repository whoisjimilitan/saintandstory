# Google Local Services Ads (LSA) & Search Setup Guide

## Overview

This guide walks you through setting up Google Local Services Ads and Google Search Ads for Saint & Story removals. Total setup time: 2-3 hours. No additional code needed—schema markup is live on all 16 city pages.

**Why this matters:** LSA shows your ads to people actively searching "[city] removals" on Google. You only pay when someone clicks to message or call (£2-5 per qualified lead). This is 4-5x cheaper than Facebook ads.

---

## Phase 1: Google Search Console Setup (30 mins)

### Step 1.1 — Verify Site Ownership

1. Go to [Google Search Console](https://search.google.com/search-console)
2. Click **Add Property**
3. Select **URL prefix** (not domain property)
4. Paste: `https://saintandstoryltd.co.uk`
5. Click **Continue**

### Step 1.2 — Verify via DNS

1. You'll see verification methods. Select **DNS record**
2. Copy the TXT record value (looks like: `google-site-verification=abc123...`)
3. Go to your domain registrar (GoDaddy, Namecheap, etc.)
4. Find **DNS Settings** → **Add DNS Record**
5. Create a new TXT record:
   - **Host/Name:** @ (root)
   - **Value:** Paste the verification code
   - **TTL:** 3600 (or default)
6. Click Save
7. Return to Google Search Console and click **Verify**

**Wait 5-10 minutes for DNS to propagate.**

### Step 1.3 — Submit Sitemap

1. In Google Search Console, go to **Sitemaps** (left menu)
2. Paste this URL: `https://saintandstoryltd.co.uk/sitemap.xml`
3. Click **Submit**

Google will crawl all 16 city pages and index the schema markup.

---

## Phase 2: Google Business Profiles (GBP) Setup (1.5 hours)

### Why This Matters

Google Business Profiles are required for LSA eligibility. You don't need 16 separate GBPs—one primary profile linked to your website works. However, creating profiles for key cities (London, Manchester, Birmingham) improves local search visibility.

### Step 2.1 — Create Primary Google Business Profile

1. Go to [Google Business Profile](https://www.google.com/business/)
2. Click **Manage now**
3. Click **Create a new business**
4. Fill in:
   - **Business name:** Saint & Story
   - **Category:** Moving & Storage / Courier Service
   - **Address:** Your office address (or HQ location)
   - **Phone:** 0203 051 9243
   - **Website:** https://saintandstoryltd.co.uk
5. Click **Create**

### Step 2.2 — Verify Business

1. Google will offer verification methods (postcard, phone, email)
2. Select **Email** (fastest, 5 mins)
3. Check james@saintandstoryltd.co.uk for verification email
4. Click the verification link

### Step 2.3 — Add Service Areas (for LSA eligibility)

1. In Google Business Profile, go to **Info**
2. Scroll to **Service area**
3. Click **Edit**
4. Select **Delivery to customers**
5. Click **Add service area**
6. Enter each of these 16 cities:
   - London
   - Manchester
   - Birmingham
   - Leeds
   - Glasgow
   - Liverpool
   - Bristol
   - Edinburgh
   - Sheffield
   - Newcastle
   - Nottingham
   - Leicester
   - Cambridge
   - Oxford
   - Coventry
   - York

7. Click **Save**

### Step 2.4 — Add Business Hours

1. Go to **Info** → **Hours**
2. Set:
   - **Monday–Sunday:** 7:00 AM – 10:00 PM
3. Click **Save**

### Step 2.5 — Add Photos & Description

1. Go to **Profile**
2. Add 3-5 photos (van, team, moving boxes, etc.)
3. Add short description:
   > "Professional removals in 30+ UK cities. Fixed price confirmed on the call. Same-day available."
4. Click **Save**

### Step 2.6 — Link to Website

1. Go to **Profile**
2. Verify **Website** is set to: https://saintandstoryltd.co.uk
3. Click **Save**

**Status after this phase:** Your business is verified on Google. The schema markup on your city pages + GBP profile = LSA eligibility confirmed.

---

## Phase 3: Google Local Services Ads (LSA) Setup (45 mins)

### Step 3.1 — Create Google Ads Account (if you don't have one)

1. Go to [Google Ads](https://ads.google.com)
2. Click **Start now**
3. Sign in with your Google account
4. Enter business info:
   - **Business name:** Saint & Story
   - **Business website:** https://saintandstoryltd.co.uk
   - **Primary business location:** Your city
5. Click **Create**

### Step 3.2 — Access Local Services Ads Campaign

1. In Google Ads, go to **Campaigns** (left menu)
2. Click **+ New Campaign**
3. Select **Local Services** as campaign type
4. Click **Continue**

### Step 3.3 — Select Service Category

1. Under **Service categories**, select **Moving services**
2. Choose sub-categories:
   - House moving
   - Office moving
   - Same-day courier
3. Click **Next**

### Step 3.4 — Add Service Areas

1. For each service category, add the 16 cities:
   - London
   - Manchester
   - Birmingham
   - Leeds
   - Glasgow
   - Liverpool
   - Bristol
   - Edinburgh
   - Sheffield
   - Newcastle
   - Nottingham
   - Leicester
   - Cambridge
   - Oxford
   - Coventry
   - York

2. For each city, Google will ask for **coverage postcodes**
3. Enter coverage postcodes for each service area (e.g., for London: M1-M90, WC1-WC2)
4. Click **Next**

### Step 3.5 — Set Budget & Bidding

1. **Daily budget:** Start with £15 (test phase)
2. **Lead billing model:** Pay only when someone clicks to message/call
3. Lead price: £2-5 per qualified lead (Google estimates this)
4. Click **Next**

### Step 3.6 — Add Customer Lead Notifications

1. **Customer lead notification email:** james@saintandstoryltd.co.uk
2. **Customer lead notification phone:** 0203 051 9243
3. Google will send you alerts when someone contacts you via LSA
4. Click **Next**

### Step 3.7 — Review & Launch

1. Review all settings
2. Click **Create campaign**
3. Your LSA campaign is now live

**Expected results (first week):**
- 5-10 qualified leads
- Average lead cost: £2-3
- Message/call notification in your email within 5 mins of customer contact

---

## Phase 4: Google Search Ads Setup (45 mins)

### Step 4.1 — Create Search Campaign

1. In Google Ads, click **+ New Campaign**
2. Select **Search** as campaign type
3. Click **Continue**

### Step 4.2 — Campaign Settings

1. **Campaign name:** Saint & Story - Removals Search
2. **Locations:** United Kingdom
3. **Languages:** English
4. **Bidding strategy:** Maximize conversions (let Google optimize)
5. **Daily budget:** £10
6. Click **Next**

### Step 4.3 — Create Ad Groups

Create one ad group for high-intent keywords:

**Ad group name:** High-Intent Removals

**Keywords to add:**
- "[city] removals" (for each of 16 cities)
- "house removals near me"
- "same-day removals"
- "moving company [city]"
- "furniture removal [city]"
- "office removals [city]"

Use keyword match type: **Phrase match** (e.g., "[London removals]")

### Step 4.4 — Create Ad Copy

**Headline 1:** Same-Day Removals in London

**Headline 2:** Fixed Price. Verified Drivers.

**Headline 3:** Available 7AM-10PM

**Description 1:** Book a removal in minutes. Fixed price confirmed on the call. No hidden fees.

**Description 2:** Same-day available. Trusted by 1000+ customers. Message or call now.

**Display URL:** https://saintandstoryltd.co.uk

**Final URL:** https://saintandstoryltd.co.uk/london (adjust city slug per ad group)

### Step 4.5 — Set Conversion Tracking

1. In Google Ads, go to **Conversions** (left menu)
2. Click **New conversion action**
3. Select **Website**
4. Enter conversion URL: `https://saintandstoryltd.co.uk/api/leads` (your form submission endpoint)
5. **Conversion name:** "Removal Inquiry"
6. **Conversion value:** £30 (your average margin per job)
7. Click **Create and continue**

Google will provide a conversion tracking tag—add it to your website.

### Step 4.6 — Launch Campaign

1. Review ad copy and keywords
2. Click **Create campaign**
3. Campaign is now live

**Expected results (first week):**
- 20-30 clicks
- 5-10 form submissions
- Average cost per lead: £1-2

---

## Phase 5: Monitoring & Optimization (Ongoing)

### Week 1-2: Track Performance

**In Google Ads:**
1. Go to **Campaigns** → **Local Services**
2. Check:
   - **Leads:** Number of qualified leads
   - **Lead cost:** Average cost per lead
   - **Messages/calls:** How many customers contacted you

**In your email:**
- You'll receive lead notifications from Google
- Each notification includes customer name, phone, message

### Week 3+: Optimize

**If LSA leads are cheap (£2-3):**
- Increase daily budget from £15 to £25-30
- Add more cities if profitable

**If search ads aren't converting:**
- Refine keywords (remove low-performing terms)
- Test different ad copy
- Increase bid for top-performing keywords

**Monitor these metrics:**
- Cost per lead (target: £2-5 for LSA, £1-2 for Search)
- Lead quality (how many convert to jobs)
- Response time (fast response = more jobs)

---

## Cost Summary

| Channel | Daily Budget | Expected Leads/Week | Cost per Lead | Monthly Cost |
|---------|--------------|-------------------|---------------|--------------|
| LSA | £15 | 50-100 | £2-3 | £450 |
| Google Search | £10 | 20-30 | £1-2 | £300 |
| **Total** | **£25** | **70-130** | **£1.50-2.50** | **£750** |

**Plus organic traffic (schema markup benefit):**
- Free traffic from "[city] removals" searches: 50-100 visitors/week
- Free conversion: 5-10 jobs/month (no ad spend)

---

## Troubleshooting

| Issue | Cause | Fix |
|-------|-------|-----|
| LSA campaign rejected | Business not verified | Go to GBP, check verification email, complete verification |
| No leads after 1 week | Budget too low | Increase daily budget to £20+ |
| High cost per lead (>£5) | Wrong keywords or targeting | Refine keywords, check location targeting |
| Google Search ads not showing | Low bid or poor ad quality | Increase bid, improve ad copy |
| Leads not coming through email | Notification settings wrong | In Google Ads, check Customer Lead Notifications settings |

---

## Next Steps

1. **Today:** Set up Google Search Console (30 mins)
2. **Tomorrow:** Create Google Business Profile (30 mins)
3. **Day 3:** Launch LSA campaign (30 mins)
4. **Day 4:** Launch Search Ads campaign (30 mins)
5. **Day 5+:** Monitor leads, respond fast, optimize

Once all 16 city pages are ranking on Google (2-4 weeks), you'll see organic traffic spike 10-20% weekly without any ad spend.

---

## Questions?

Email james@saintandstoryltd.co.uk or check Google Ads Support:
https://support.google.com/google-ads/

Good luck! 🚀
