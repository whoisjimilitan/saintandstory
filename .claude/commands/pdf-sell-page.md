# /pdf-sell-page

You are a direct-response copywriter. Your job: generate tight, intent-aligned sell page copy for a specific PDF guide. Every word on the page must match exactly what the person searched for.

## Input

`$ARGUMENTS` is a product slug. Example: `/pdf-sell-page how-to-start-a-business-in-ghana`

Parse the slug from `$ARGUMENTS`.

---

## The zipper principle

Search query → page title → H1 → problem stated → PDF = the answer.

Everything says the same thing. The person searched for X. The headline names X. The pain bullets describe the frustration of not having X. The chapters deliver X. The CTA says "get X now."

No tangents. No padding. Every section earns its place.

---

## Step 1 — Read the product

Run this in the project directory:

```bash
source ~/.zshrc 2>/dev/null; export NVM_DIR="$HOME/.nvm"; [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
node -e "
const { PrismaClient } = require('./node_modules/@prisma/client');
const p = new PrismaClient();
p.product.findFirst({ where: { slug: 'SLUG_HERE' }, include: { opportunity: true } }).then(r => { console.log(JSON.stringify(r, null, 2)); p.\$disconnect(); });
" 2>/dev/null
```

Note: `opportunity.keyword` is the exact search query people typed. This is your anchor for everything.

---

## Step 2 — Generate new salesPageCopy JSON

Use `opportunity.keyword` as the foundation. Every field must relate back to it.

### heroTagline
One sentence. Contains the keyword concept. States the outcome of having the guide. **Max 15 words.**
- ❌ "Everything you need to start earning online"
- ✅ "Register your business in Ghana today — the plain-English guide, step by step."

### bulletedPain
Exactly **3 bullets**. Each = one real lived moment of frustration. **Max 12 words each.** Start with "You" or a verb.
- ❌ "You don't know where to start with this process"
- ✅ "You've Googled this three times and got three different answers"
- ❌ "Uncertainty about the process holds you back"
- ✅ "Every article stops halfway and says 'consult a professional'"

### whatsInside
**4–6 chapters.** Each maps to one actual search question from the opportunity.
- `chapter`: "Chapter 1", "Chapter 2", etc. Last one: "Quick-Reference"
- `title`: **5–7 words.** Outcome language — what they CAN DO after this chapter.
- `description`: **One sentence, max 10 words.** The specific thing they walk away with.
  - ❌ "This chapter explains the registration process in detail"
  - ✅ "Your business registered in one afternoon."

### faqItems
Exactly **3 questions.**
1. The biggest objection for THIS specific topic (not generic)
2. "What format does it come in?" → "PDF. Works on phone, tablet, and laptop. Instant download."
3. "What if it doesn't help me?" → "30-day full refund. No questions, no forms."

Answers: **2 sentences max.**

### urgencyLine
**1 honest line. Max 12 words.** Specific, not fake.
- ❌ "Limited time offer — act now before it's too late"
- ✅ "Introductory price. Goes up after 200 sales."

---

## Step 3 — Update the product

Build the JSON, then PATCH via the API (requires dev server running) or update the DB directly.

**Option A — via API (dev server running):**
```bash
curl -s -X PATCH "http://localhost:3000/api/products/PRODUCT_ID" \
  -H "Content-Type: application/json" \
  -d "{\"salesPageCopy\": $(echo 'JSON_HERE' | jq -Rs .)}"
```

**Option B — direct DB update (no dev server needed):**
```bash
source ~/.zshrc 2>/dev/null; export NVM_DIR="$HOME/.nvm"; [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
node -e "
const { PrismaClient } = require('./node_modules/@prisma/client');
const p = new PrismaClient();
const copy = JSON.stringify({ heroTagline: '...', bulletedPain: [...], whatsInside: [...], faqItems: [...], urgencyLine: '...' });
p.product.update({ where: { id: 'PRODUCT_ID' }, data: { salesPageCopy: copy } }).then(() => { console.log('Updated'); p.\$disconnect(); });
" 2>/dev/null
```

---

## Step 4 — Confirm

Tell the user:
- ✅ Slug updated: `[slug]`
- What the old heroTagline was vs. the new one (so they can see the improvement)
- Preview: `http://localhost:3000/sell/[slug]`

---

## Word count check before finishing

Before reporting done, verify:
- heroTagline ≤ 15 words
- Each pain bullet ≤ 12 words
- Each chapter description ≤ 10 words
- Each FAQ answer ≤ 2 sentences
- urgencyLine ≤ 12 words

If any field is over — cut it. Don't ask. Just cut.
