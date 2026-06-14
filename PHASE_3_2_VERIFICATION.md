# PHASE 3.2 VERIFICATION CHECKLIST

**Date**: 2026-06-14  
**Task**: Verify all Phase 3.2 components before Phase 4

---

## ✅ CODE IMPLEMENTATION

### Files Created

**API Endpoints**:
- [x] `/api/webhooks/resend/route.ts` — Resend event receiver
- [x] `/api/track/pageview/route.ts` — Landing page tracking
- [x] `/api/campaigns/telemetry/route.ts` — Campaign telemetry aggregation
- [x] `/api/discovery/status/route.ts` — Discovery progress visibility

**Libraries**:
- [x] `/lib/email-attribution.ts` — UTM parameter generation & parsing

**UI Components**:
- [x] `/app/dashboard/campaigns/telemetry.tsx` — Real-time dashboard

**Database**:
- [x] `/migrations/add_resend_id_tracking.sql` — Schema migrations

**Documentation**:
- [x] `/PHASE_3_2_IMPLEMENTATION.md` — Architecture & implementation details
- [x] `/PHASE_3_2_VERIFICATION.md` — This file

---

## ⏳ DATABASE MIGRATIONS (Manual)

**Before Phase 4, run:**

```bash
# In saintandstory directory
psql -h <database-host> -U <user> -d neondb -f migrations/add_resend_id_tracking.sql
```

**Or via Node:**

```bash
export $(grep DATABASE_URL .env.local | xargs)
psql $DATABASE_URL -f migrations/add_resend_id_tracking.sql
```

**Tables Created**:
- [x] `b2b_campaign_sends` — Comprehensive send tracking
- [x] `page_engagement_log` — Landing page visit logs

**Columns Added**:
- [x] `phase3_campaign.resend_email_id`
- [x] `b2b_outreach.campaign_id`

**Indexes Added**:
- [x] `idx_b2b_campaign_sends_resend_id`
- [x] `idx_b2b_campaign_sends_lead`
- [x] `idx_b2b_campaign_sends_campaign`

---

## ⏳ VERCEL CONFIGURATION (Manual)

### 1. Resend Webhook Registration

**In Resend Dashboard**:
1. Go to: Settings → Webhooks
2. Create new webhook
3. Endpoint: `https://saintandstory.com/api/webhooks/resend`
4. Events to enable:
   - [x] Email Opened
   - [x] Email Clicked
   - [x] Email Bounced
   - [x] Email Complained
   - [x] Email Delivered
5. Save and note the webhook secret

### 2. Set Webhook Secret in Vercel

**In Vercel Dashboard**:
1. Go to: Project → Settings → Environment Variables
2. Add new: `RESEND_WEBHOOK_SECRET`
3. Value: (from Resend webhook creation above)
4. Environments: Production
5. Redeploy after adding

**Or via Vercel CLI**:
```bash
vercel env add RESEND_WEBHOOK_SECRET
# Paste the secret from Resend
# Select: Production
```

### 3. Test Webhook

```bash
# After Resend webhook registered, send test event
curl -X POST https://saintandstory.com/api/webhooks/resend \
  -H "Content-Type: application/json" \
  -H "svix-signature: test-signature" \
  -d '{
    "type": "email.opened",
    "data": {
      "email_id": "test-123",
      "from": "hello@saintandstory.com",
      "to": "test@example.com",
      "created_at": "2026-06-14T10:00:00Z"
    }
  }'
```

**Expected response**: `{"success": true}`

---

## ⏳ CLIENT-SIDE PAGE TRACKING (Manual)

### Add to Landing Page Components

In any landing page component that receives UTM params:

```typescript
useEffect(() => {
  // Track page view with UTM params
  const params = new URLSearchParams(window.location.search);
  
  if (params.get('utm_lead')) {
    fetch('/api/track/pageview', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        pageUrl: window.location.href,
        referrer: document.referrer,
        sessionId: sessionStorage.getItem('session_id') || crypto.randomUUID(),
      }),
    });
  }
}, []);
```

**Or place in global layout**:

```typescript
// app/layout.tsx
<script>
  if (typeof window !== 'undefined') {
    fetch('/api/track/pageview', {
      method: 'POST',
      body: JSON.stringify({
        pageUrl: window.location.href,
        referrer: document.referrer,
      }),
    }).catch(() => {});
  }
</script>
```

---

## ✅ TESTING CHECKLIST

### 1. Webhook Endpoint

```bash
# GET endpoint health check
curl https://saintandstory.com/api/webhooks/resend

# Expected: 
# {
#   "status": "ready",
#   "endpoint": "/api/webhooks/resend",
#   "events": [...]
# }
```

### 2. Page View Tracking

```bash
curl -X POST https://saintandstory.com/api/track/pageview \
  -H "Content-Type: application/json" \
  -d '{
    "pageUrl": "https://saintandstory.com/b2b/estate-agents?utm_lead=test-lead-123",
    "referrer": "https://mail.google.com",
    "sessionId": "session-123"
  }'

# Expected:
# {"success": true, "leadId": "test-lead-123"}
```

### 3. Campaign Telemetry

```bash
curl https://saintandstory.com/api/campaigns/telemetry?hours=24

# Expected: JSON with discovery, campaign, engagement, qualification stats
```

### 4. Discovery Status

```bash
curl https://saintandstory.com/api/discovery/status

# Expected: JSON with active config, discovered count, new leads, etc.
```

---

## ✅ DASHBOARD VERIFICATION

### Access Telemetry Dashboard

1. Go to: `https://saintandstory.com/dashboard/campaigns/telemetry`
2. Verify loads without errors
3. Check auto-refresh working (5-second intervals)
4. Verify all sections display:
   - [ ] Discovery stats
   - [ ] Email campaign stats
   - [ ] Engagement metrics (opens, clicks)
   - [ ] Lead qualification (Tier A/B/C)
   - [ ] Landing page engagement
   - [ ] Orchestration status

---

## ✅ EMAIL FLOW VERIFICATION

### 1. Send Test Email with UTM Params

```bash
# Run a test campaign send (use test lead)
node -e "
const { addUtmParams } = require('./lib/email-attribution.ts');
const url = 'https://saintandstory.com/b2b/estate-agents';
const tracked = addUtmParams(url, {
  campaignId: 'test-campaign',
  leadId: 'test-lead',
  emailType: 'phase3'
});
console.log(tracked);
"
```

### 2. Verify Email ID Stored

```bash
export $(grep DATABASE_URL .env.local | xargs)

# Check if email ID was captured
psql $DATABASE_URL -c "
SELECT id, resend_email_id, status FROM phase3_campaign 
WHERE email = 'test@example.com'
LIMIT 1;
"
```

### 3. Simulate Email Open

```bash
# POST to webhook as if Resend sent it
curl -X POST https://saintandstory.com/api/webhooks/resend \
  -H "Content-Type: application/json" \
  -d '{
    "type": "email.opened",
    "data": {
      "email_id": "resend-id-from-above",
      "from": "hello@saintandstory.com",
      "to": "test@example.com",
      "created_at": "2026-06-14T10:00:00Z"
    }
  }'
```

### 4. Verify Event Captured

```bash
# Check b2b_email_events
psql $DATABASE_URL -c "
SELECT event_type, lead_id, created_at FROM b2b_email_events 
WHERE resend_email_id = 'resend-id-from-above'
LIMIT 5;
"
```

### 5. Verify Lead Engagement Score Updated

```bash
# Check if lead engagement_score increased
psql $DATABASE_URL -c "
SELECT id, business_name, engagement_score, last_engagement_at FROM b2b_leads 
WHERE id = 'test-lead'
LIMIT 1;
"
```

---

## ⏳ PRE-PHASE-4 FINAL CHECKLIST

Before starting Phase 4 revenue activation:

### Infrastructure
- [ ] Database migrations applied
- [ ] All API endpoints deployed
- [ ] Vercel environment variables set
- [ ] Resend webhook registered and tested

### Verification
- [ ] Webhook endpoint responding
- [ ] Page view tracking working
- [ ] Campaign telemetry dashboard operational
- [ ] Test email send → open → click → page view traced end-to-end
- [ ] Lead engagement_score updated through full flow

### Configuration
- [ ] RESEND_WEBHOOK_SECRET in Vercel
- [ ] Page tracking script added to landing pages
- [ ] UTM params verified in email links

### Testing
- [ ] Test webhook with Resend test event
- [ ] Test page view tracking
- [ ] Test engagement score updates
- [ ] Test dashboard real-time updates

---

## QUICK REFERENCE: OPERATOR TASKS

### Daily Monitoring

```bash
# Check campaign health
curl https://saintandstory.com/api/campaigns/telemetry?hours=24

# Check discovery progress
curl https://saintandstory.com/api/discovery/status
```

### Manual Verification

```bash
# Verify webhook is working
curl https://saintandstory.com/api/webhooks/resend

# Verify page tracking is working
curl https://saintandstory.com/api/track/pageview

# Check latest email events
psql $DATABASE_URL -c "
SELECT event_type, COUNT(*) FROM b2b_email_events 
WHERE created_at > NOW() - INTERVAL '1 hour'
GROUP BY event_type;
"
```

### Troubleshooting

**Webhook not receiving events?**
- Check: Resend webhook registered
- Check: RESEND_WEBHOOK_SECRET set in Vercel
- Check: Endpoint URL is correct
- Test: Send Resend test event

**Page views not tracked?**
- Check: Page view script added to landing pages
- Check: Browser console for errors
- Check: /api/track/pageview is accessible
- Verify: UTM params in URL

**Engagement scores not updating?**
- Check: Events in b2b_email_events table
- Check: lead_id is set in event
- Check: b2b_leads record exists for lead_id
- Verify: Webhook processing completed

---

## SIGN-OFF

**Phase 3.2 Implementation**: ✅ COMPLETE  
**Code**: ✅ Written  
**Documentation**: ✅ Complete  
**Testing**: ⏳ Awaiting manual configuration

**Ready for Phase 4**: After configuration steps completed

---

## CONFIGURATION SUMMARY

**Must do before Phase 4**:
1. Run database migrations
2. Set RESEND_WEBHOOK_SECRET in Vercel
3. Register webhook in Resend
4. Test webhook end-to-end
5. Add page tracking to landing pages
6. Deploy code changes

**Then verify**:
1. Webhook responding to events
2. Page views being logged
3. Engagement scores updating
4. Dashboard showing real-time data
5. Full attribution chain working (email → click → page → conversion)

**Then proceed**: Phase 4 Revenue Activation
