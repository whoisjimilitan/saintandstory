# Batch 1 Pre-Launch Checklist

**Launch Date:** 2026-06-25  
**Time to Launch:** After verification complete  
**Success Criteria:** All ✅ before send  

---

## 🔒 Phase 1: Foundation Lock (COMPLETE)

- [x] Email template v1.0 locked
- [x] 6-layer psychology stack documented
- [x] Subject line: "We're expanding to (City) - set up your account"
- [x] Body: 6-layer psychology (Permission, Specificity, Anchor, Reciprocity, Social Proof, Participation)
- [x] CTA: Yes/Maybe/No format
- [x] Signature: James (not Jimi)
- [x] Git tag: v5.0-communication-engine-locked-2026-06-25
- [x] Rollback: < 90 seconds guaranteed

---

## 🔧 Phase 2: System Unification (COMPLETE)

- [x] Email systems unified (single source of truth)
- [x] Auto-discovery now uses locked template
- [x] Manual batch uses locked template
- [x] CRON job updated to use communication engine
- [x] Recognition-email.ts deprecated (no longer called)
- [x] Build passes (no errors, no warnings)
- [x] Type safety maintained
- [x] Git commit: "fix(orchestrator): Unify email systems"

---

## ✅ Phase 3: Pre-Launch Verification (IN PROGRESS)

### Verification Step 1: CRON Endpoint Test
**Status:** ⏳ NEXT

Test command:
```bash
curl -X POST https://saintandstoryltd.co.uk/api/orchestrate/b2b-daily \
  -H "Authorization: Bearer $CRON_SECRET" \
  -H "Content-Type: application/json" -d '{}'
```

Expected:
- [ ] HTTP 200 response
- [ ] `"success": true`
- [ ] `executionId` returned
- [ ] `driverMatching.succeeded` > 0
- [ ] No errors in response

**Action:** Run manually and report results

---

### Verification Step 2: Database Logging Check
**Status:** ⏳ PENDING

Query to run:
```sql
SELECT id, run_id, started_at, completed_at, status, 
       discovery_count, duration_ms
FROM b2b_orchestration_runs
WHERE DATE(started_at) = CURRENT_DATE
ORDER BY started_at DESC LIMIT 1;
```

Expected:
- [ ] One record found (or more if CRON ran multiple times)
- [ ] Status: "success" or "partial_failure"
- [ ] Duration_ms: < 300,000 (5 minutes)
- [ ] No NULL values in critical fields

**Action:** Run query and report results

---

### Verification Step 3: Email Delivery Check
**Status:** ⏳ PENDING

Query to run:
```sql
SELECT COUNT(*) as emails_sent, 
       MIN(email_sent_at) as first_email,
       MAX(email_sent_at) as last_email
FROM b2b_leads
WHERE email_sent_at >= NOW() - INTERVAL '2 hours'
  AND email_sent_at IS NOT NULL;
```

Expected:
- [ ] COUNT > 0 (emails were sent)
- [ ] Timestamps within last 2 hours
- [ ] No NULL dates

**Action:** Run query and report count

---

### Verification Step 4: Email Content Verification
**Status:** ⏳ PENDING (Manual Check)

Check your inbox for auto-discovery emails:

Content Checklist:
- [ ] From: recognition@saintandstoryltd.co.uk
- [ ] Subject contains: "We're expanding to"
- [ ] Subject contains: "set up your account"
- [ ] Body starts: "Hi [Business Name],"
- [ ] Body contains: "Your main courier probably handles things well"
- [ ] Body contains: "One of these usually happens or has happened"
- [ ] Body contains: "Yes, Maybe, or No"
- [ ] Signature: "James" (not "Jimi", not "{{senderName}}")
- [ ] No broken placeholders (e.g., no {{city}} showing)
- [ ] City name properly inserted: "We're expanding to [actual city]"
- [ ] Business name properly inserted: "Hi [actual business name],"

**Action:** Check one email and verify all above

---

### Verification Step 5: TODAY Page Data Flow
**Status:** ⏳ PENDING (Manual Check)

Go to: https://saintandstoryltd.co.uk/operator

Dashboard checks:
- [ ] Page loads without errors
- [ ] "X new prospects discovered today" shows number > 0
- [ ] Number matches or is close to database query from Step 3
- [ ] No broken data display
- [ ] Metrics update if CRON ran

**Note:** If TODAY page shows 0 but database shows emails sent, this indicates a data flow issue that needs investigation before launch.

**Action:** Navigate to page and verify data shows

---

### Verification Step 6: Manual Batch Still Works
**Status:** ⏳ PENDING (Manual Check)

Go to: https://saintandstoryltd.co.uk/operator/enrich

Test workflow:
1. [ ] Select test prospect(s)
2. [ ] Click "Generate" or batch generation button
3. [ ] Email preview loads without errors
4. [ ] Subject shows: "We're expanding to (City)..."
5. [ ] Body shows: "Your main courier probably..."
6. [ ] 3 variations displayed (if applicable)
7. [ ] James signature appears (not Jimi)
8. [ ] "Send All" button enabled

**Action:** Run through workflow and verify

---

## 📊 Phase 4: Final Validation (NEXT)

### System Health
- [ ] No JavaScript console errors
- [ ] No API errors in browser network tab
- [ ] Build logs show success
- [ ] Database connection stable
- [ ] Resend API responding
- [ ] Clerk authentication working

### Data Consistency
- [ ] Auto-discovery emails use locked template
- [ ] Manual batch emails use locked template
- [ ] Both flows generate identical email structure
- [ ] All emails signed "James"
- [ ] All emails use expansion subject
- [ ] All emails use 6-layer psychology

### Logging & Monitoring
- [ ] CRON execution logged in b2b_orchestration_runs
- [ ] Email sending logged with timestamps
- [ ] Errors captured and visible
- [ ] Response webhook ready to capture data

---

## 🎯 Phase 5: Batch 1 Ready Decision

**LAUNCH APPROVED WHEN:**

All verification steps complete AND:

- ✅ CRON test successful (HTTP 200, success: true)
- ✅ Database shows emails sent
- ✅ Email content uses locked template
- ✅ TODAY page displays data (if connected)
- ✅ Manual batch still works
- ✅ No errors in logs
- ✅ System health confirmed
- ✅ Data consistency verified

**LAUNCH BLOCKED IF:**

- ❌ CRON test fails (401, 500, timeout)
- ❌ No emails sent to database
- ❌ Email content doesn't use locked template
- ❌ TODAY page shows 0 despite emails sent (data flow issue)
- ❌ Manual batch broken
- ❌ Any critical errors in logs
- ❌ Broken placeholders in email
- ❌ Wrong signature (not James)

---

## 🚀 Batch 1 Launch Parameters

**When Ready:**

1. **Scope:** [Number of prospects to target]
2. **Template:** Locked v1.0 (6-layer psychology)
3. **Subject:** "We're expanding to (City) - set up your account"
4. **CTA:** Yes/Maybe/No response tracking
5. **Response Webhook:** [URL to capture responses]
6. **Success Metric:** 90%+ response rate
7. **Monitoring:** Real-time webhook data
8. **Duration:** Continuous until target achieved
9. **Adjustment:** Monitor and optimize based on response data

---

## 📝 Sign-Off

**Verification Completed:** _____________ (date/time)

**Verified By:** ___________________________

**Email Content Confirmed:** ✅ / ❌

**Database Verified:** ✅ / ❌

**TODAY Page Working:** ✅ / ❌

**Manual Batch Works:** ✅ / ❌

**System Ready for Launch:** ✅ / ❌

**Launch Approved By:** ___________________________

**Launch Time:** ___________________________

---

## Emergency Contacts

**If CRON Fails:**
- Check Vercel logs for errors
- Verify CRON_SECRET environment variable
- Check Neon database connection
- Verify Resend API key
- Restart orchestrator if needed

**If Email Content Wrong:**
- Check /lib/layer2-reasoning-engine.ts for template
- Verify mail merge fields ({{{city}}}, {{{businessName}}})
- Verify James name mapping working
- Check formatEmailAsLetter() function

**If TODAY Page Shows 0:**
- Query database directly for email_sent_at records
- Check /api/v1/dashboard/morning-brief endpoint
- Verify morning-brief reads from b2b_leads table
- May indicate API/data flow issue separate from CRON

**Quick Rollback (< 90 seconds):**
```bash
git reset --hard v5.0-communication-engine-locked-2026-06-25
git push origin main --force
vercel deploy --prod
```

---

**Status:** 🟡 READY FOR VERIFICATION

**Next Action:** Run 6-step verification process
