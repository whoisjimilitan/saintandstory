# WAVE 1 COMPLETION PLAN
## Foundation-Only Focus: Discovery → Prospect → Send → Respond → Timeline

**STATUS:** Foundation repair in progress
**NEXT:** Verify each API call works end-to-end, then hide non-working intelligence layers from UI

---

## PHASE 1: VERIFY WAVE 1 APIS ARE WORKING

### ✅ COMPLETED (Verified Functional)
- [x] POST /api/b2b/add-prospect
- [x] POST /api/b2b/send
- [x] POST /api/b2b/respond
- [x] GET /api/b2b/prospect/:id
- [x] app/b2b/page.tsx (dashboard)
- [x] app/api/b2b/prospects (list all)

### ⏳ NEXT: TEST EACH END-TO-END
These APIs exist but need production validation:

1. **Test Prospect Creation**
   ```bash
   curl -X POST http://localhost:3000/api/b2b/add-prospect \
     -H "Content-Type: application/json" \
     -d '{"businessName":"Test","businessCategory":"Legal","email":"test@example.com"}'
   ```
   Expected: Returns leadId, prospect visible in /b2b dashboard

2. **Test Email Sending**
   - Get leadId from step 1
   - Call /api/b2b/send with actual email subject + body
   - Verify: b2b_outreach record created with resendMessageId
   - Verify: b2b_conversation_event with type="EMAIL_SENT" created

3. **Test Response Tracking**
   - Call /api/b2b/respond with outreachId + responseType="YES"
   - Verify: b2b_outreach.replied = true
   - Verify: b2b_lead.status updated to "warm"
   - Verify: b2b_conversation_event with type="REPLIED_YES" created

4. **Test Timeline Retrieval**
   - Call /api/b2b/prospect/:id
   - Verify: conversationEvents array includes all 3 events in order
   - Verify: events sorted chronologically (newest first)

5. **Test Operator Dashboard**
   - Navigate to http://localhost:3000/b2b
   - Verify: prospect appears in list
   - Verify: status shows "warm"
   - Verify: can click "View" and see prospect detail page
   - Verify: prospect detail page shows email + timeline

---

## PHASE 2: HIDE/REMOVE NON-FUNCTIONAL INTELLIGENCE LAYERS

**CRITICAL RULE:** Operator dashboard should ONLY show Wave 1 data.

### Remove from B2bMemoryPanel component:
- [x] Hide if no data
- [x] Don't render on prospect page if empty

### Remove from B2bBehaviorInsights:
- [x] Hide if no metrics yet

### Remove from B2bRevenueIntelligence:
- [x] Hide if no revenue data

### Remove from B2bSystemObservability:
- [x] Don't show on operator dashboard (only for monitoring)

### Remove from B2bAutopilotPanel:
- [x] Don't show on operator dashboard

### OPERATOR DASHBOARD should show ONLY:
- ✅ Prospect list (name, category, email, status)
- ✅ Status badge (new, contacted, warm, cold)
- ✅ Link to prospect detail page
- ⏳ Send email button (if not yet sent)
- ✅ Conversation timeline (email sent, opened, replied, etc.)

**What should NOT be visible to operators yet:**
- ❌ Behavior metrics (Wave 2)
- ❌ Memory patterns (Wave 3)
- ❌ Revenue attribution (Wave 4)
- ❌ Causal validation (Safety)
- ❌ Autopilot status (Safety)
- ❌ System health (Internal monitoring)

---

## PHASE 3: BUILD MISSING WAVE 1 UX

### 📋 Send Email UI (From prospect detail page)
**Status:** Prospect page exists but needs email form

```typescript
// app/b2b/prospect/[id]/page.tsx needs:
- Button: "Send Email"
- Modal with:
  * Subject field
  * Body field (HTML editor or plain text)
  * Template dropdown (optional for Wave 1)
  * Send button
  * Confirmation: "Email sent successfully"
  * Timeline updates to show new EMAIL_SENT event
```

### 📊 Response Recording UI
**Status:** API exists but no UI

```typescript
// On prospect detail page, offer:
- Button: "Record Response"
- Radio: YES / NO
- Submit button
- Confirmation: "Response recorded"
- Timeline updates to show new REPLIED_YES/REPLIED_NO event
```

### 🔍 Discovery Trigger UI
**Status:** Discovery endpoint exists but no UI

```typescript
// app/b2b/discover/page.tsx needs:
- Form:
  * Dropdown: Select niche
  * Text input: Enter city
  * Submit button: "Run Discovery"
- Status display:
  * Spinning loader
  * "Searching Google Maps..."
  * Progress message: "Found 12 businesses, processing..."
- Results:
  * "Successfully added 8 new prospects"
  * List of added business names
  * Link: "View in dashboard"
```

---

## PHASE 4: VERIFY DATABASE WRITES ARE REAL

**Critical check:** Make sure changes persist when we refresh.

### Test checklist:
- [ ] Create prospect via API
- [ ] Navigate away from page
- [ ] Navigate back to prospect
- [ ] Data still there ✓
- [ ] Send email via UI
- [ ] Refresh page
- [ ] Email event still in timeline ✓
- [ ] Record response via UI
- [ ] Refresh page
- [ ] Response event in timeline ✓
- [ ] Status updated to "warm" ✓

**If any fail:** UI is doing optimistic updates without backend confirmation.

---

## PHASE 5: REMOVE UI ELEMENTS THAT LIE

**CRITICAL RULE:** UI must only show what's actually in the database.

### Before deploying, check:
- [ ] No components show "success" without confirming server wrote data
- [ ] No components show data that doesn't persist on refresh
- [ ] No "loading" states that last forever
- [ ] Error messages are clear when operations fail

### Example problems to fix:
- ❌ Button says "Email Sent" but response not awaited
- ❌ Timeline shows event that's not in database
- ❌ Status badge shows "warm" but database still shows "new"
- ❌ Metrics show high numbers but queries are broken

---

## DONE CRITERIA (ALL MUST PASS)

### ✅ Wave 1 Fully Functional When:

1. **Discovery**
   - Operator can trigger discovery from UI
   - Prospects are actually added to database
   - They appear in dashboard immediately after

2. **Prospect Management**
   - Operator can see all prospects in dashboard
   - Can filter by status
   - Can navigate to prospect detail
   - Prospect info matches database

3. **Email Sending**
   - Operator can send email from prospect page
   - Email is actually sent via Resend
   - b2b_outreach record created
   - b2b_conversation_event EMAIL_SENT created
   - Data persists on page refresh

4. **Response Tracking**
   - Operator can record YES/NO response
   - Lead status updates to "warm"/"contacted"
   - b2b_conversation_event REPLIED_YES/NO created
   - Timeline shows all events in order

5. **Timeline Accuracy**
   - Prospect detail page shows all events
   - Events in chronological order (newest first)
   - Event details visible (subject, body for emails)
   - Only Wave 1 data visible (no metrics, patterns, revenue)

6. **Database Truth**
   - All changes persist on refresh
   - No optimistic updates without server confirmation
   - Data matches what's actually in database
   - No ghost data or fake state

7. **No Intelligence Interference**
   - Dashboard shows ONLY Wave 1 data
   - Behavior metrics hidden
   - Memory patterns hidden
   - Revenue data hidden
   - Safety internals hidden

---

## ROLLBACK POINT

If anything breaks during Wave 1 stabilization:
```bash
git checkout GO_LIVE_STABLE_2026_06_16
npm install && npm run build
```

This is a known-good state with working discovery pipeline.

---

## NEXT WAVE (DO NOT START UNTIL WAVE 1 COMPLETE)

Once Wave 1 is 100% working and deployed:
- Wave 2: Behavior metrics (only if Wave 1 data is real)
- Wave 3: Memory patterns (only if Wave 2 data is real)
- Wave 4: Revenue attribution (only if Wave 3 data is real)
- Safety Layer: Only if all previous layers working

**Rule:** Never build intelligence on fake data.
