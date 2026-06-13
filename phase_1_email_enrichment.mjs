import { neon } from "@neondatabase/serverless";
import fs from "fs";

const DATABASE_URL = process.env.DATABASE_URL;
const sql = neon(DATABASE_URL);

// Domain extraction helper
function extractDomain(website) {
  if (!website) return null;
  try {
    const url = new URL(website);
    return url.hostname.replace('www.', '');
  } catch {
    return null;
  }
}

// Generate likely email addresses based on business name and domain
function generateEmailCandidates(businessName, domain) {
  if (!domain) return [];
  
  const candidates = [];
  
  // Pattern 1: info@domain
  candidates.push(`info@${domain}`);
  
  // Pattern 2: contact@domain
  candidates.push(`contact@${domain}`);
  
  // Pattern 3: hello@domain
  candidates.push(`hello@${domain}`);
  
  // Pattern 4: name@domain (first word of business name)
  const words = businessName.split(' ').filter(w => w.length > 2);
  if (words.length > 0) {
    candidates.push(`${words[0].toLowerCase()}@${domain}`);
  }
  
  // Pattern 5: commonname@domain (typical business contact names)
  candidates.push(
    `support@${domain}`,
    `sales@${domain}`,
    `business@${domain}`,
    `enquiries@${domain}`,
    `admin@${domain}`
  );
  
  return candidates;
}

async function emailEnrichment() {
  console.log("╔════════════════════════════════════════════════════════════╗");
  console.log("║          PHASE 1B: EMAIL ENRICHMENT STRATEGY              ║");
  console.log("╚════════════════════════════════════════════════════════════╝\n");

  const leads = await sql`
    SELECT 
      id,
      business_name,
      website,
      phone,
      email
    FROM b2b_leads
    WHERE source != 'qa_system_test' AND email IS NULL
    ORDER BY business_name
  `;

  console.log(`Generating enrichment strategy for ${leads.length} leads\n`);

  const enrichmentPlan = [];
  
  for (const lead of leads) {
    const domain = extractDomain(lead.website);
    const candidates = generateEmailCandidates(lead.business_name, domain);
    
    enrichmentPlan.push({
      id: lead.id,
      business_name: lead.business_name,
      website: lead.website,
      phone: lead.phone,
      domain: domain,
      candidates: candidates,
      strategy: domain ? 'domain_based' : 'phone_contact'
    });
  }

  // Summary
  const domainBased = enrichmentPlan.filter(p => p.domain).length;
  const phoneOnly = enrichmentPlan.filter(p => !p.domain).length;

  console.log(`ENRICHMENT STRATEGY SUMMARY:\n`);
  console.log(`Domain-based enrichment (can generate candidates): ${domainBased}/${leads.length}`);
  console.log(`Phone-contact only (no website): ${phoneOnly}/${leads.length}\n`);

  // Generate enrichment report
  const report = `# EMAIL ENRICHMENT STRATEGY

**Phase**: 1B - Enrichment Action Plan  
**Date**: 2026-06-13  
**Target**: 43 missing emails

## STRATEGY

### Approach 1: Domain-Based Enrichment (${domainBased} leads)

For each lead with a website, generate likely email candidates:
- info@domain.com
- contact@domain.com  
- hello@domain.com
- [businessname]@domain.com
- support@domain.com
- sales@domain.com

**Tools**: Hunter.io API (free tier: 100/month), or manual verification

**Process**:
1. Extract domain from website URL
2. Generate 5-6 likely email addresses
3. Verify via:
   - Hunter.io API (confidence score)
   - Website contact page scrape
   - MX record lookup
   - Manual check

### Approach 2: Phone-Contact (${phoneOnly} leads)

Leads without websites: Call business, ask for contact email.

---

## LEAD-BY-LEAD ENRICHMENT PLAN

${enrichmentPlan.map((plan, idx) => `
### ${idx + 1}. ${plan.business_name}

**Website**: ${plan.website || '(none)'}  
**Domain**: ${plan.domain || '(no domain)'}  
**Phone**: ${plan.phone}  
**Strategy**: ${plan.strategy}

${plan.domain ? `**Email Candidates**:
${plan.candidates.map(c => `- ${c}`).join('\n')}
` : `**Action**: Call ${plan.phone}, ask for contact email`}
`).join('\n')}

---

## VALIDATION CHECKLIST

Once enrichment complete:

- [ ] All 43 leads have at least 1 email candidate
- [ ] Emails verified via Hunter.io or manual check
- [ ] Invalid email (Greater London Properties - Bloomsbury) corrected to proper format
- [ ] All 45 leads have valid, verified emails
- [ ] Emails added to database
- [ ] Report generated showing final state

## SUCCESS CONDITION

**Phase 1 Success**: 45/45 leads with valid email addresses

## NEXT PHASE

Once enrichment complete: **Phase 2 - 2-Lead Test Send**

Send recognition emails to:
1. Westpoint Pharmacy (already verified)
2. [Choose 1 other lead from enriched list]

Verify complete signal chain:
- Email sent ✓
- Resend delivered ✓
- Webhook received ✓
- Event recorded ✓
- Engagement score updated ✓
- Heat score updated ✓
- Dashboard shows update ✓

`;

  fs.writeFileSync("ENRICHMENT_ACTION_PLAN.md", report);
  
  console.log("✅ Action plan written to ENRICHMENT_ACTION_PLAN.md\n");
  console.log("NEXT STEP: Execute email enrichment");
  console.log("Timeline: 2-4 hours (Hunter.io + manual verification)\n");
}

emailEnrichment().catch(err => {
  console.error("ERROR:", err.message);
  process.exit(1);
});
