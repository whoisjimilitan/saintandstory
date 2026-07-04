# Opportunity Feed Implementation Plan

## Status
**GROUNDED IN REALITY**

This plan maps to infrastructure you already have.

Everything below is buildable NOW.

---

## BUILD PIECES (What You Need To Build)

### 1. Opportunity Database Table
**File:** `prisma/schema.prisma`

**What to add:**
```
model Opportunity {
  id                    String   @id @default(cuid())
  
  // CSV Input
  companyName           String
  website               String?
  contactName           String?
  contactEmail          String?
  sourcePlatform        String   // "LinkedIn", "Website", etc.
  sourceUrl             String?
  postedDate            DateTime
  originalWording       String   @db.Text
  confidence            Int      // 0-100

  // Extracted
  extractedNeed         String?  @db.Text
  extractedUrgency      String?  // "High", "Medium", "Low"
  extractedContext      String?  @db.Text
  extractedQuote        String?  @db.Text

  // Generated
  briefHtml             String?  @db.Text
  emailSubject          String?
  emailBody             String?  @db.Text

  // Status
  status                String   @default("imported")  // "imported" | "queued" | "sent" | "opened" | "replied" | "customer"
  
  // Tracking
  sentAt                DateTime?
  openedAt              DateTime?
  clickedAt             DateTime?
  repliedAt             DateTime?
  replyContent          String?  @db.Text

  // Timestamps
  createdAt             DateTime @default(now())
  updatedAt             DateTime @updatedAt

  @@index([status])
  @@index([createdAt(sort: Desc)])
}
```

**Migration:**
```bash
npx prisma migrate dev --name add_opportunity_table
```

---

### 2. Extraction Engine
**File:** `lib/opportunity-extraction.ts` (new)

**What it does:**
- Takes originalWording
- Extracts Need (what they said they need)
- Extracts Urgency (High/Medium/Low based on language)
- Extracts Context (industry/situation)
- Extracts Quote (their exact words)

**Inputs:**
```typescript
{
  companyName: "ABC Law",
  originalWording: "We're looking for a reliable same-day courier for legal documents. Current provider keeps missing deadlines."
}
```

**Outputs:**
```typescript
{
  need: "Same-day legal document courier",
  urgency: "High",
  context: "Legal practice, time-critical deadlines",
  quote: "We're looking for a reliable same-day courier..." + "keeps missing deadlines"
}
```

**Tool:** Claude API (reasoning engine)

---

### 3. Brief Generator
**File:** `lib/opportunity-brief-generator.ts` (new)

**What it does:**
- Takes extracted data (need, urgency, context, quote)
- Generates one-page Courier Readiness Brief (HTML)
- Formats professionally
- Ready to send as PDF or link

**Inputs:**
```typescript
{
  companyName: "ABC Law",
  extractedNeed: "Same-day legal document courier",
  extractedContext: "Legal practice, Manchester",
  extractedQuote: "We're looking for a reliable same-day courier..."
}
```

**Outputs:**
```html
<html>
  <h1>Courier Readiness Brief</h1>
  <p>Prepared for: ABC Law</p>
  ...
</html>
```

**Tool:** Claude API (communication engine)

---

### 4. CSV Import UI
**Location:** `/operator/discover`

**What to add:**
- Add "Import CSV" button/tab
- File upload input
- Validation display
- Auto-populate queue with imported opportunities

**Integration:**
- Uses existing `/operator/discover` page
- Stores in Opportunity table
- Flows into extraction stage

---

### 5. Approval Queue View
**Location:** `/operator/settings` → transform into Approval Queue

**What to show:**
- List of imported opportunities awaiting approval
- Each row shows:
  - Original Post (snippet)
  - Extracted Need / Urgency / Context
  - Brief Preview
  - Email Draft Preview
  - [SEND] button

**What happens:**
- Operator reviews each in ~5 seconds
- Clicks [SEND]
- Email goes out
- Opportunity marked as sent
- Tracking begins

---

## ADAPT EXISTING (What You Already Have)

### Email Generation
**Location:** `/operator/enrich`

**Already handles:**
- Email generation from prospect data
- Email preview/editing
- Campaign sending
- Batch mode

**How to adapt:**
- Reuse email generator for Opportunity emails
- Email structure is locked (5 sentences)
- Use same send infrastructure

---

### Send & Track
**Location:** Existing Resend integration

**Already handles:**
- Email sending via Resend
- Webhook handling (Resend webhooks)
- Open/click/reply tracking

**How to adapt:**
- Log sends to Opportunity table
- Log opens/clicks/replies to Opportunity table
- Use existing webhook infrastructure

---

### Relationship Engine
**Location:** Existing webhook handler `/api/b2b/email-response/webhook`

**Already handles:**
- Receiving Resend events (open, click, reply)
- Processing engagement

**How to adapt:**
- Add logic: If Opportunity replied, analyze and recommend next action
- Only activate after engagement (do not touch before they engage)

---

## API ROUTES TO CREATE

### 1. Import CSV
```
POST /api/operator/opportunity-feed/import
Body: { csv file }
Returns: { imported count, validation errors }
```

### 2. Extract Opportunities
```
POST /api/operator/opportunity-feed/extract
Body: { opportunity ids }
Returns: { extraction results }
```

### 3. Generate Briefs
```
POST /api/operator/opportunity-feed/generate-briefs
Body: { opportunity ids }
Returns: { brief html for each }
```

### 4. Generate Emails
```
POST /api/operator/opportunity-feed/generate-emails
Body: { opportunity ids }
Returns: { email subject/body for each }
```

### 5. Send Opportunity
```
POST /api/operator/opportunity-feed/send
Body: { opportunity id }
Returns: { send result, sent timestamp }
```

### 6. List Approval Queue
```
GET /api/operator/opportunity-feed/queue
Returns: { opportunities pending approval }
```

---

## FLOW INTEGRATION

### Current Flow (What you have):
```
Search/Manual → Prospects → Enrich (generate emails) → Send
```

### New Flow (Opportunity Feed):
```
GPT CSV → Import → Approval Queue (extract, brief, email) → Send → Track
```

Both flows coexist. No collision.

---

## BUILD ORDER (Do Once, All At Once)

1. ✅ Constitution written (this document)
2. ⏳ Opportunity database table (Prisma migration)
3. ⏳ Extraction engine (lib)
4. ⏳ Brief generator (lib)
5. ⏳ CSV import UI (/operator/discover)
6. ⏳ Approval Queue view (/operator/settings)
7. ⏳ API routes (all 6)
8. ⏳ Wire together (extract → brief → email → send)
9. ⏳ Test end-to-end
10. ⏳ Ship

---

## TEST PLAN

### Unit Tests
- Extraction engine extracts correctly
- Brief generator creates valid HTML
- Email generator creates 5-sentence email

### Integration Tests
- CSV import → Opportunity table
- Extraction → populated fields
- Brief generation → stored
- Email generation → stored
- Send → Resend API called

### E2E Test
- Upload CSV
- See approval queue
- Click [SEND]
- Check email received (test inbox)
- Check webhook processing
- Verify tracking

---

## SUCCESS CRITERIA

✅ CSV imports correctly
✅ Opportunities extracted with 4 fields
✅ Briefs generated (one-page, specific to need)
✅ Emails generated (5 sentences, locked structure)
✅ Approval queue shows all 5 elements
✅ Send works end-to-end
✅ Tracking captures opens/clicks/replies
✅ First real CSV produces YES responses

---

## THIS IS REAL

Everything above is:
- Based on infrastructure you already have
- Buildable right now
- No guessing
- No hypothetical

Build it. Ship it. Learn from YES responses.
