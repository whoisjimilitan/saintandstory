import { neon } from "@neondatabase/serverless";
import fs from "fs";

const DATABASE_URL = process.env.DATABASE_URL;
const sql = neon(DATABASE_URL);

async function emailAcquisitionAudit() {
  console.log("╔════════════════════════════════════════════════════════════╗");
  console.log("║              PHASE 1: EMAIL ACQUISITION AUDIT             ║");
  console.log("╚════════════════════════════════════════════════════════════╝\n");

  // Get all 45 production leads
  const leads = await sql`
    SELECT 
      id,
      business_name,
      email,
      phone,
      website,
      business_category,
      city,
      postcode
    FROM b2b_leads
    WHERE source != 'qa_system_test'
    ORDER BY business_category, business_name ASC
  `;

  console.log(`Found ${leads.length} production leads\n`);

  // Classify emails
  const valid = [];
  const missing = [];
  const invalid = [];

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  for (const lead of leads) {
    if (!lead.email) {
      missing.push(lead);
    } else if (emailRegex.test(lead.email)) {
      valid.push(lead);
    } else {
      invalid.push(lead);
    }
  }

  console.log(`EMAIL STATUS:\n`);
  console.log(`  ✅ VALID_EMAIL: ${valid.length}/45`);
  console.log(`  ❌ MISSING_EMAIL: ${missing.length}/45`);
  console.log(`  ⚠️ INVALID_EMAIL: ${invalid.length}/45\n`);

  // Display each lead
  console.log("DETAILED AUDIT:\n");

  for (const lead of leads) {
    const status = !lead.email 
      ? "MISSING_EMAIL" 
      : emailRegex.test(lead.email) 
      ? "VALID_EMAIL" 
      : "INVALID_EMAIL";
    
    const statusSymbol = status === "VALID_EMAIL" ? "✅" : 
                        status === "MISSING_EMAIL" ? "❌" : "⚠️";
    
    console.log(`${statusSymbol} ${lead.business_name}`);
    console.log(`   Category: ${lead.business_category}`);
    console.log(`   Email: ${lead.email || '(none)'}`);
    console.log(`   Phone: ${lead.phone || '(none)'}`);
    console.log(`   Website: ${lead.website || '(none)'}`);
    console.log();
  }

  // Generate report
  const report = `# EMAIL ENRICHMENT REPORT

**Status**: Phase 1 Audit Complete  
**Date**: 2026-06-13  
**Total Leads**: 45

## EXECUTIVE SUMMARY

| Status | Count | % |
|--------|-------|---|
| ✅ VALID_EMAIL | ${valid.length} | ${(valid.length/45*100).toFixed(0)}% |
| ❌ MISSING_EMAIL | ${missing.length} | ${(missing.length/45*100).toFixed(0)}% |
| ⚠️ INVALID_EMAIL | ${invalid.length} | ${(invalid.length/45*100).toFixed(0)}% |

**ACTIVATION BOTTLENECK: ${missing.length + invalid.length} leads cannot be reached**

---

## VALID EMAILS (${valid.length})

Can activate immediately.

${valid.map(l => `- **${l.business_name}** (${l.business_category})\n  Email: ${l.email}\n  Phone: ${l.phone || 'N/A'}`).join('\n\n')}

---

## MISSING EMAILS (${missing.length})

Require enrichment. Sources:

1. Google Places API (website → contact page)
2. Hunter.io or similar email finder
3. Manual lookup on business website
4. Phone call to business

${missing.length > 0 ? `\n${missing.map(l => `- **${l.business_name}** (${l.business_category})\n  Website: ${l.website || 'Not available'}\n  Phone: ${l.phone || 'Not available'}\n  City: ${l.city || 'Not available'}`).join('\n\n')}` : ''}

---

## INVALID EMAILS (${invalid.length})

${invalid.length > 0 ? `Require correction/replacement:\n\n${invalid.map(l => `- **${l.business_name}**\n  Current: ${l.email}\n  Status: Does not match email format`).join('\n\n')}` : 'None'}

---

## ACTION REQUIRED

**Priority 1: Enrich ${missing.length} missing emails**
- Use Google Places or website lookup
- Target: 48 hours
- Success: 43+ valid emails

**Priority 2: Fix ${invalid.length} invalid emails**
- Verify format
- Replace with correct email

**Phase 1 Success Condition:**
45/45 leads with valid email addresses

---

## NEXT PHASE

Once enrichment complete:
1. Verify all 45 have emails
2. Proceed to Phase 2: 2-lead test send
3. Confirm signal chain (send → receive → record → score → dashboard)
4. Roll out to full 45

`;

  fs.writeFileSync("EMAIL_ENRICHMENT_REPORT.md", report);
  console.log("✅ Report written to EMAIL_ENRICHMENT_REPORT.md\n");
}

emailAcquisitionAudit().catch(err => {
  console.error("ERROR:", err.message);
  process.exit(1);
});
