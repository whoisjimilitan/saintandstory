import { neon } from "@neondatabase/serverless";
import { Resend } from "resend";

const sql = neon(process.env.DATABASE_URL);
const resend = new Resend(process.env.RESEND_API_KEY);

console.log("=== PHASE 3 FULL CAMPAIGN EXECUTION ===\n");

// Get all leads with valid emails
const leads = await sql`
  SELECT 
    id, business_name, email, business_category,
    city, niche, landing_page_url
  FROM b2b_leads
  WHERE email IS NOT NULL
  AND email != ''
  ORDER BY created_at DESC
`;

console.log(`Starting Phase 3 campaign...`);
console.log(`Target leads: ${leads.length}`);
console.log(`Template: Transport Brief (Relief Layer)`);
console.log(`\nSending campaign...\n`);

let sent = 0;
let failed = 0;
const errors = [];

// Send all emails
for (let i = 0; i < leads.length; i++) {
  const lead = leads[i];
  
  try {
    const subject = `Transport Brief — ${lead.business_name}`;
    const body = `Managing movement in ${lead.niche || lead.business_category} changes as you scale.

We work with organisations like yours in ${lead.city}.

This brief explains how.

${lead.landing_page_url || 'Learn more'}`;

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
      ON CONFLICT DO NOTHING
    `;

    sent++;
    if ((i + 1) % 10 === 0) {
      console.log(`  ${i + 1}/${leads.length} sent...`);
    }
  } catch (error) {
    failed++;
    const errorMsg = error instanceof Error ? error.message : String(error);
    errors.push(`${lead.business_name}: ${errorMsg}`);
  }
}

// Get final stats
const stats = await sql`
  SELECT 
    COUNT(*) as total,
    SUM(CASE WHEN status = 'sent' THEN 1 ELSE 0 END) as sent,
    SUM(CASE WHEN status = 'failed' THEN 1 ELSE 0 END) as failed
  FROM phase3_campaign
`;

console.log(`\n=== PHASE 3 CAMPAIGN COMPLETE ===\n`);
console.log(`Leads targeted: ${leads.length}`);
console.log(`This batch sent: ${sent}`);
console.log(`This batch failed: ${failed}`);
console.log(`\nCumulative campaign stats:`);
console.log(`Total sent: ${stats[0].sent}`);
console.log(`Total failed: ${stats[0].failed}`);
console.log(`Success rate: ${Math.round((stats[0].sent / (stats[0].sent + stats[0].failed)) * 100)}%`);

if (errors.length > 0) {
  console.log(`\nErrors:`);
  errors.slice(0, 5).forEach(e => console.log(`  - ${e}`));
  if (errors.length > 5) {
    console.log(`  ... and ${errors.length - 5} more`);
  }
}
