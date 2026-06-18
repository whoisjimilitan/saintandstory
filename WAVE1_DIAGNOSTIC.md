# WAVE 1 DIAGNOSTIC TEST

## Required Checks (Run in order)

### 1. DATABASE HEALTH
- [ ] Can connect to Postgres
- [ ] B2bLead table exists
- [ ] B2bOutreach table exists  
- [ ] B2bConversationEvent table exists
- All required fields present

**Test Command:**
```bash
npx prisma db execute --stdin < schema-check.sql
```

### 2. PROSPECT CREATION (POST /api/b2b/add-prospect)
**Test Request:**
```bash
curl -X POST http://localhost:3000/api/b2b/add-prospect \
  -H "Content-Type: application/json" \
  -d '{
    "businessName": "Test Business Wave 1",
    "businessCategory": "Legal",
    "email": "wave1test@example.com",
    "city": "London",
    "contactName": "Test Contact"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "leadId": "uuid-here",
  "message": "Prospect added successfully"
}
```

**Failure Modes:**
- ❌ API returns 500: database write failure
- ❌ Returns 400: validation failure
- ❌ Success but DB empty: transaction not committed
- ✅ Should create record in b2b_leads table

### 3. EMAIL SEND (POST /api/b2b/send)
**After getting leadId from step 2, test:**
```bash
curl -X POST http://localhost:3000/api/b2b/send \
  -H "Content-Type: application/json" \
  -d '{
    "leadId": "paste-leadId-from-step-2",
    "subject": "Wave 1 Test Email",
    "body": "<h1>This is a test</h1>",
    "emailType": "test"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "outreachId": "uuid-here",
  "messageId": "resend-message-id"
}
```

**Failure Modes:**
- ❌ RESEND_API_KEY not set
- ❌ Email service returns error
- ❌ API succeeds but no b2b_outreach record created
- ❌ API succeeds but no b2b_conversation_events record created
- ✅ Should create:
  - b2b_outreach record with sentAt timestamp
  - b2b_conversation_event record with type="EMAIL_SENT"

### 4. RESPONSE TRACKING (POST /api/b2b/respond)
**After getting outreachId from step 3:**
```bash
curl -X POST http://localhost:3000/api/b2b/respond \
  -H "Content-Type: application/json" \
  -d '{
    "outreachId": "paste-outreachId-from-step-3",
    "responseType": "YES"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "outreachId": "uuid-here",
  "responseType": "YES"
}
```

**Failure Modes:**
- ❌ API returns 404: outreach record doesn't exist
- ❌ Success but lead.status not updated
- ❌ Success but b2b_conversation_events not updated
- ✅ Should:
  - Update b2b_outreach.replied = true
  - Update b2b_outreach.repliedAt = now
  - Update b2b_lead.status = "warm"
  - Update b2b_lead.leadState = "engaged"
  - Create b2b_conversation_event type="REPLIED_YES"

### 5. PROSPECT DETAIL API (GET /api/b2b/prospect/:id)
**Using the leadId from step 2:**
```bash
curl http://localhost:3000/api/b2b/prospect/paste-leadId-from-step-2
```

**Expected Response:**
```json
{
  "id": "uuid",
  "businessName": "Test Business Wave 1",
  "businessCategory": "Legal",
  "email": "wave1test@example.com",
  "phone": null,
  "status": "warm",
  "leadState": "engaged",
  "conversationEvents": [
    {
      "id": "uuid",
      "type": "REPLIED_YES",
      "direction": "INBOUND",
      "subject": null,
      "body": null,
      "createdAt": "2026-06-18T..."
    },
    {
      "id": "uuid",
      "type": "EMAIL_SENT",
      "direction": "OUTBOUND",
      "subject": "Wave 1 Test Email",
      "body": "<h1>This is a test</h1>",
      "createdAt": "2026-06-18T..."
    }
  ]
}
```

**Failure Modes:**
- ❌ API returns 404: prospect doesn't exist
- ❌ API returns 500: database query failure
- ❌ conversationEvents empty: events not stored
- ❌ status/leadState not updated from step 4
- ✅ Should show full timeline in reverse chronological order

### 6. PROSPECT PAGE UI (GET /b2b/prospect/:id)
**Navigate to:**
```
http://localhost:3000/b2b/prospect/paste-leadId-from-step-2
```

**Should Display:**
- Business name
- Category
- Email
- Status badge
- Timeline of events (newest first)
- Event icons + labels
- Event details (subject/body for emails)

**Failure Modes:**
- ❌ Page 404: route doesn't exist
- ❌ Page loads but shows "Loading..." forever: API not responding
- ❌ Prospect info loads but timeline empty: events not fetched
- ❌ Events show but wrong order: not sorting by createdAt desc
- ✅ Full timeline visible with all 2 events

## SUMMARY

If all 6 checks pass:
✅ **WAVE 1 IS FUNCTIONAL**
- Discovery → Prospect Creation → Email Send → Response Tracking → Timeline View

If any fail:
❌ **STOP HERE AND FIX IT**
Do not proceed to Waves 2-5 until Wave 1 is 100% working.
