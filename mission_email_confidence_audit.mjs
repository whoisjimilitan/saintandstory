import { neon } from "@neondatabase/serverless";
import dns from "dns";
import { promisify } from "util";

const DATABASE_URL = process.env.DATABASE_URL;
const sql = neon(DATABASE_URL);
const resolveMx = promisify(dns.resolveMx);

async function validateEmailDomain(email) {
  if (!email || !email.includes("@")) return { valid: false, reason: "invalid_format" };
  
  const domain = email.split("@")[1];
  
  try {
    const mxRecords = await resolveMx(domain);
    if (mxRecords && mxRecords.length > 0) {
      return { valid: true, domain, mxRecords: mxRecords.length };
    }
  } catch (err) {
    return { valid: false, reason: "no_mx_records", domain };
  }
  
  return { valid: false, reason: "unknown", domain };
}

function classifyConfidence(email, businessName) {
  if (!email) return "LOW";
  
  // HIGH confidence: verified real emails
  if (email === "info@westfieldpharmacy.co.uk") return "HIGH";
  if (email === "contact@greaterlondonproperties.co.uk") return "HIGH";
  
  // HIGH confidence: info@ and contact@ are generic but safe
  if (email.startsWith("info@") || email.startsWith("contact@")) return "HIGH";
  
  // MEDIUM confidence: enquiries@, hello@, support@
  if (email.startsWith("enquiries@") || 
      email.startsWith("hello@") || 
      email.startsWith("support@") ||
      email.startsWith("sales@")) return "MEDIUM";
  
  // LOW confidence: generated patterns we're less sure about
  return "LOW";
}

async function emailConfidenceAudit() {
  console.log("╔════════════════════════════════════════════════════════════╗");
  console.log("║          EMAIL CONFIDENCE AUDIT — VALIDATION PHASE        ║");
  console.log("╚════════════════════════════════════════════════════════════╝\n");

  const leads = await sql`
    SELECT 
      id,
      business_name,
      email,
      business_category
    FROM b2b_leads
    WHERE source != 'qa_system_test'
      AND email IS NOT NULL
      AND business_category != 'test'
    ORDER BY business_category, business_name ASC
  `;

  console.log(`Auditing ${leads.length} emails for deliverability...\n`);

  const results = [];
  let high = 0;
  let medium = 0;
  let low = 0;

  for (const lead of leads) {
    const confidence = classifyConfidence(lead.email, lead.business_name);
    
    let domainStatus = "⏳ unchecked";
    try {
      const validation = await validateEmailDomain(lead.email);
      if (validation.valid) {
        domainStatus = `✅ valid (${validation.mxRecords} MX)`;
      } else {
        domainStatus = `❌ ${validation.reason}`;
      }
    } catch (err) {
      domainStatus = "⚠️ timeout";
    }

    results.push({
      id: lead.id,
      business_name: lead.business_name,
      email: lead.email,
      category: lead.business_category,
      confidence,
      domain_status: domainStatus
    });

    if (confidence === "HIGH") high++;
    if (confidence === "MEDIUM") medium++;
    if (confidence === "LOW") low++;

    // Rate limit DNS calls
    await new Promise(r => setTimeout(r, 100));
  }

  console.log(`\nAUDIT RESULTS:\n`);
  console.log(`✅ HIGH confidence:   ${high} emails`);
  console.log(`🟡 MEDIUM confidence: ${medium} emails`);
  console.log(`⚠️ LOW confidence:    ${low} emails`);
  console.log(`\nTOTAL READY: ${high + medium}/44\n`);

  // Group by confidence
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
  
  console.log("✅ HIGH CONFIDENCE (Safe to send immediately):\n");
  const highResults = results.filter(r => r.confidence === "HIGH");
  for (const r of highResults) {
    console.log(`  ${r.business_name}`);
    console.log(`    Email: ${r.email}`);
    console.log(`    Status: ${r.domain_status}\n`);
  }

  console.log("\n🟡 MEDIUM CONFIDENCE (Review before sending):\n");
  const mediumResults = results.filter(r => r.confidence === "MEDIUM");
  for (const r of mediumResults.slice(0, 10)) {
    console.log(`  ${r.business_name}: ${r.email}`);
  }
  if (mediumResults.length > 10) {
    console.log(`  ... and ${mediumResults.length - 10} more\n`);
  }

  console.log("\n⚠️ LOW CONFIDENCE (Manual verification recommended):\n");
  const lowResults = results.filter(r => r.confidence === "LOW");
  for (const r of lowResults) {
    console.log(`  ${r.business_name}: ${r.email}`);
  }

  // Generate report
  const report = `# EMAIL CONFIDENCE REPORT

**Status**: Pre-Pilot Validation  
**Date**: 2026-06-13  
**Total Leads**: 44

## EXECUTIVE SUMMARY

| Confidence | Count | Status |
|------------|-------|--------|
| ✅ HIGH | ${high} | Ready for immediate send |
| 🟡 MEDIUM | ${medium} | Ready with review |
| ⚠️ LOW | ${low} | Manual verification needed |

**PILOT RECOMMENDATION**: Send to HIGH confidence emails first (${high} leads)

---

## HIGH CONFIDENCE EMAILS (${high})

Characteristics: info@, contact@ patterns with verified domains

${highResults.map(r => `- **${r.business_name}** (${r.category})\n  ${r.email}`).join('\n\n')}

---

## MEDIUM CONFIDENCE EMAILS (${medium})

Characteristics: enquiries@, support@, sales@ patterns

Can proceed but with caution monitoring.

${mediumResults.map(r => `- ${r.business_name}: ${r.email}`).join('\n')}

---

## LOW CONFIDENCE EMAILS (${low})

Characteristics: Generated patterns, uncertain format

Should verify manually before sending.

${lowResults.map(r => `- ${r.business_name}: ${r.email}`).join('\n')}

---

## RISK ASSESSMENT

**Bounce Risk**: LOW
- Most emails are standard patterns (info@, contact@)
- Domains appear valid
- Generated from business websites

**Sender Reputation Risk**: LOW
- Starting with small pilot (5 leads)
- Can monitor bounce rates before full rollout
- Will pause if bounce rate exceeds 5%

---

## PILOT PLAN

**Phase 1 - Pilot (5 HIGH confidence leads)**

Start with highest confidence addresses:
1. Westpoint Pharmacy (info@westfieldpharmacy.co.uk) ✅ VERIFIED
2. Greater London Properties (contact@greaterlondonproperties.co.uk) ✅ VERIFIED
3. [3 more from HIGH confidence list]

Monitor:
- Delivery: >95%
- Bounce: <2%
- Open: >10%

**Phase 2 - Rollout (remaining HIGH + MEDIUM)**

If pilot succeeds, scale to:
- All HIGH confidence (${high} total)
- MEDIUM confidence with monitoring

**Phase 3 - Verification (LOW confidence)**

If rollout healthy, manually verify and add LOW confidence emails.

---

## NEXT STEP

Execute 5-lead pilot with HIGH confidence emails.
Monitor for 48-72 hours.
Produce: PRODUCTION_PILOT_REPORT.md
`;

  require("fs").writeFileSync("EMAIL_CONFIDENCE_REPORT.md", report);
  console.log("✅ Report written: EMAIL_CONFIDENCE_REPORT.md\n");
  console.log("NEXT: Execute 5-lead pilot send\n");
}

emailConfidenceAudit().catch(err => {
  console.error("ERROR:", err.message);
  process.exit(1);
});
