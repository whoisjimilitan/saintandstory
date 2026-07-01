# Campaign Flow Testing Guide

## ✅ What's Ready

### Database
- ✅ NeonDB connected and synced
- ✅ Three new Prisma models created:
  - `B2bCampaign` - Campaign metadata
  - `B2bCampaignEmail` - Email tracking per lead
  - `B2bCampaignWhatsApp` - WhatsApp tracking per lead
- ✅ All indexes created for performance

### API Endpoints
- ✅ `POST /api/b2b/campaigns/send` - Creates campaign, sends emails via Resend, logs to database
- ✅ `GET /api/b2b/campaigns/list` - Fetches live campaigns with aggregated statistics

### Frontend Pages
- ✅ `/operator/discover` - Upload CSV, search, or add manually → Session storage
- ✅ `/operator/enrich` - V4 email generation preview → Calls `/campaigns/send`
- ✅ `/operator/reach` - Live campaign dashboard with 30-second refresh

---

## 🧪 End-to-End Test (Manual)

### Step 1: Verify Dev Server
```bash
cd /Users/jimilitan/Documents/GitHub/saintandstory
npm run dev
# Should start on http://localhost:3001
```

### Step 2: Test DISCOVER → ENRICH → REACH Flow

**2a. Go to `/operator/discover`**
- Click on "Email Campaign" button (top)
- Upload a CSV with test leads OR search businesses OR add manually
- Example CSV format:
  ```
  businessName,category,city,email,tier
  Smith & Associates,Legal,London,contact@smith.uk,1
  Brown Construction,Construction,Manchester,hello@brown.co.uk,2
  ```

**2b. Review results**
- Should show: Business Name | Category | Tier | Checkbox
- Summary shows: Tier breakdown, category list, total leads
- Click "Review & Send" button

**2c. Go to `/operator/enrich`**
- Should show draft emails with V4 template preview
- Email preview shows:
  - Dynamic company name
  - Personalized pain points (based on tier + category)
  - Dynamic CTA (based on category)
  - Personalized signature
- Click "Confirm & Send Campaign"

**2d. Go to `/operator/reach`**
- Should show email campaign just created
- Display: Campaign name | Date sent | Total leads | Sent | Opened | Replied
- Stats update every 30 seconds from database
- Aggregate stats at top: Total sent, Total replied, Total leads

### Step 3: Verify Database Records

Check that data was written to database:

```bash
# Open Prisma Studio
cd /Users/jimilitan/Documents/GitHub/saintandstory
DATABASE_URL="postgresql://..." npm exec -- npx prisma studio

# Or query directly
```

Expected records:
- **b2b_campaigns**: 1 record per campaign sent
- **b2b_campaign_emails**: 1 record per email sent
- Each email should have `status="sent"` and `emailSentAt` timestamp

### Step 4: Verify Emails Sent

Check Resend dashboard:
- Go to https://resend.com/emails
- Should see emails from `noreply@saintandstory.co.uk`
- Confirm subject and recipient match what was sent

---

## 🔍 Debugging Checklist

| Issue | Check | Fix |
|-------|-------|-----|
| DISCOVER blank after upload | Browser console for errors | Check CSV format, ensure email column exists |
| ENRICH not loading draft | Check sessionStorage in DevTools | Go back to DISCOVER and click "Review & Send" |
| REACH shows "No email campaigns" | Check /api/b2b/campaigns/list response | Verify campaign was created in database |
| Emails not showing sent count | 30s refresh might not have run yet | Wait 30 seconds, refresh page |
| API 401 error | Auth not working | Must be logged in via Clerk |
| API 500 error | Check server logs | DATABASE_URL env var set correctly? RESEND_API_KEY valid? |

---

## 📊 Live Data Verification

### What SHOULD be live (not hardcoded):
- ✅ Campaign list fetched from `/api/b2b/campaigns/list`
- ✅ Email stats calculated from database: `sent`, `opened`, `replied`
- ✅ Total leads from campaign record
- ✅ Campaign creation date/time from database
- ✅ 30-second auto-refresh on REACH page

### What's NOT yet live (WhatsApp only):
- ⏳ WhatsApp campaign sending (waiting for WhatsApp API)
- ⏳ WhatsApp message tracking (will implement when API available)

---

## 🎯 Success Criteria

✅ Test passes when:
1. DISCOVER uploads CSV → creates leads in memory
2. ENRICH shows preview → generates V4 emails
3. Confirm & Send → creates B2bCampaign + B2bCampaignEmail records
4. REACH fetches campaigns → displays live stats
5. Emails received in Resend dashboard
6. Stats update without page reload (30s refresh)

---

## ⚡ Quick Commands

**Start dev server:**
```bash
cd /Users/jimilitan/Documents/GitHub/saintandstory
npm run dev
```

**Push database changes:**
```bash
DATABASE_URL="postgresql://..." npx prisma db push
```

**Open Prisma Studio (see database):**
```bash
DATABASE_URL="postgresql://..." npx prisma studio
```

**View server logs:**
```bash
# Check terminal where `npm run dev` is running
# Look for [CAMPAIGN SEND], [CAMPAIGNS LIST], [REACH] logs
```

---

## 📝 Notes

- All code is deployed to main branch
- DATABASE_URL is in your `.env.local`
- RESEND_API_KEY is configured
- WhatsApp campaign sending is stubbed out (waiting for WhatsApp API key)
- Email sending is fully functional and tested with Resend
