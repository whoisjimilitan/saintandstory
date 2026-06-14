import { neon } from "@neondatabase/serverless";
import { Resend } from "resend";

const sql = neon(process.env.DATABASE_URL);
const resend = new Resend(process.env.RESEND_API_KEY);

console.log("=== PHASE 3 OUTREACH EXECUTION ===\n");

// Get all leads with valid emails
const leads = await sql`
  SELECT 
    id, business_name, email, business_category,
    city, niche, pain_point, landing_page_url,
    engagement_score
  FROM b2b_leads
  WHERE email IS NOT NULL
  AND email != ''
  ORDER BY engagement_score DESC NULLS LAST
`;

console.log(`Starting Phase 3 campaign...`);
console.log(`Target leads: ${leads.length}\n`);

// Create outreach tracking table if needed
await sql`
  CREATE TABLE IF NOT EXISTS phase3_campaign (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    lead_id UUID NOT NULL,
    business_name TEXT,
    email TEXT,
    template_type TEXT,
    subject TEXT,
    body TEXT,
    resend_email_id TEXT,
    sent_at TIMESTAMPTZ,
    status TEXT,
    error TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
  )
`;

let sent = 0;
let failed = 0;
const sentLeads = [];
const failedLeads = [];

// Send emails (limit to first 10 for testing, then do full campaign)
const testLeads = leads.slice(0, 5);

console.log(`Sending Phase 3 outreach emails...\n`);

for (const lead of testLeads) {
  try {
    // Build email context
    const subject = `Transport Brief — ${lead.business_name}`;
    const body = `Managing movement in ${lead.niche || lead.business_category} changes as you scale.

We work with organisations like yours in ${lead.city}.

This brief explains how.

${lead.landing_page_url || 'View brief →'}`;

    // Send via Resend
    const result = await resend.emails.send({
      from: "SaintAndStory <hello@saintandstory.com>",
      to: lead.email,
      subject: subject,
      text: body,
      html: `<p>${body.replace(/\n/g, "</p><p>")}</p>`,
      tags: ["phase3-campaign"],
    });

    // Log send
    await sql`
      INSERT INTO phase3_campaign (
        lead_id, business_name, email, template_type, subject, body,
        resend_email_id, sent_at, status
      ) VALUES (
        ${lead.id}, ${lead.business_name}, ${lead.email}, 'relief',
        ${subject}, ${body}, ${result.id}, NOW(), 'sent'
      )
    `;

    sent++;
    sentLeads.push({
      business: lead.business_name,
      email: lead.email,
      id: result.id
    });

    console.log(`✓ ${lead.business_name}`);
  } catch (error) {
    failed++;
    const errorMsg = error instanceof Error ? error.message : String(error);
    failedLeads.push({
      business: lead.business_name,
      email: lead.email,
      error: errorMsg
    });
    
    console.log(`✗ ${lead.business_name}: ${errorMsg}`);
  }
}

console.log(`\n=== TEST BATCH SUMMARY ===`);
console.log(`Sent: ${sent}/${testLeads.length}`);
console.log(`Failed: ${failed}/${testLeads.length}`);

if (sent > 0) {
  console.log(`\n✅ Test successful. Proceeding with full campaign...`);
  console.log(`\nFull campaign will target: ${leads.length} leads`);
}
