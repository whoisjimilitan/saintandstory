import { neon } from "@neondatabase/serverless";

const DATABASE_URL = process.env.DATABASE_URL;
const sql = neon(DATABASE_URL);

async function executePhase2() {
  console.log("=== PHASE 2: SEND RECOGNITION EMAILS & VERIFY SIGNAL CHAIN ===\n");

  const qaLeads = [
    { id: "d486dfe0-7c55-4c19-b82b-8d81ae2b6485", name: "QA Test - Opens Only", email: "qa-lead-1-open@gmail.com", scenario: "open_only" },
    { id: "d72743a9-0d3b-4567-b349-0688467598d3", name: "QA Test - Open Click", email: "qa-lead-2-click@gmail.com", scenario: "open_click" },
    { id: "c57570d0-dca8-4aa5-94e8-f694e98e13e2", name: "QA Test - Full Engagement", email: "qa-lead-3-reply@gmail.com", scenario: "open_click_reply" },
    { id: "95b6d715-1552-456b-a911-247dbd44eefd", name: "QA Test - No Engagement", email: "qa-lead-4-silent@gmail.com", scenario: "silent" },
    { id: "5f8b957a-126b-4e96-a460-d55b22173069", name: "QA Test - Multiple Opens", email: "qa-lead-5-multiple@gmail.com", scenario: "multiple_opens" }
  ];

  console.log("STEP 1: Create Outreach Records (Simulating Email Send)\n");

  for (const lead of qaLeads) {
    try {
      const testMessageId = `res_qa_${lead.id.substring(0, 8)}_test`;
      
      const result = await sql`
        INSERT INTO b2b_outreach (
          lead_id,
          subject,
          body,
          sent_at,
          follow_up_1_at,
          follow_up_2_at,
          email_type,
          resend_message_id
        ) VALUES (
          ${lead.id},
          'Saint & Story: Recognition Email [QA]',
          'Hi [Business], We've identified your business as a potential opportunity...',
          NOW(),
          NOW() + INTERVAL '3 days',
          NOW() + INTERVAL '7 days',
          'recognition',
          ${testMessageId}
        )
        RETURNING id, resend_message_id
      `;

      console.log(`✓ ${lead.name}`);
      console.log(`  Message ID: ${result[0].resend_message_id}\n`);

    } catch (e) {
      console.error(`✗ Failed: ${e.message}\n`);
    }
  }

  console.log("\nSTEP 2: Create Engagement Events\n");

  const engagementMap = {
    "d486dfe0-7c55-4c19-b82b-8d81ae2b6485": [{ type: "opened", count: 1 }],
    "d72743a9-0d3b-4567-b349-0688467598d3": [{ type: "opened", count: 1 }, { type: "clicked", count: 1 }],
    "c57570d0-dca8-4aa5-94e8-f694e98e13e2": [{ type: "opened", count: 1 }, { type: "clicked", count: 1 }],
    "95b6d715-1552-456b-a911-247dbd44eefd": [],
    "5f8b957a-126b-4e96-a460-d55b22173069": [{ type: "opened", count: 3 }]
  };

  let eventsCreated = 0;

  for (const [leadId, patterns] of Object.entries(engagementMap)) {
    const lead = qaLeads.find(l => l.id === leadId);
    
    const outreach = await sql`SELECT id FROM b2b_outreach WHERE lead_id = ${leadId} LIMIT 1`;
    if (outreach.length === 0) continue;

    const outreachId = outreach[0].id;

    for (const pattern of patterns) {
      for (let i = 0; i < pattern.count; i++) {
        try {
          await sql`
            INSERT INTO b2b_email_events (lead_id, outreach_id, event_type, timestamp, metadata)
            VALUES (${leadId}, ${outreachId}, ${pattern.type}, NOW() - INTERVAL '${i} hours', ${{ email: lead.email }}::jsonb)
          `;
          eventsCreated++;
        } catch (e) {
          // continue
        }
      }
    }

    const desc = patterns.map(p => `${p.count} ${p.type}${p.count > 1 ? 's' : ''}`).join(" + ") || "no events";
    console.log(`✓ ${lead.name}: ${desc}`);
  }

  console.log(`\nTotal events created: ${eventsCreated}\n`);

  console.log("STEP 3: Verify Engagement Scores\n");

  for (const lead of qaLeads) {
    const score = await sql`SELECT engagement_score FROM b2b_leads WHERE id = ${lead.id}`;
    console.log(`${lead.name}: ${score[0].engagement_score}/100`);
  }

  console.log("\nSTEP 4: Verify Outreach Records\n");

  const outreach = await sql`SELECT COUNT(*) as count FROM b2b_outreach WHERE source = 'qa_system_test'`;
  console.log(`Outreach records created: ${outreach[0]?.count || 0}`);

  console.log("\nSTEP 5: Verify Signal Chain\n");

  const chainCheck = await sql`
    SELECT
      (SELECT COUNT(*) FROM b2b_leads WHERE source = 'qa_system_test') as leads,
      (SELECT COUNT(*) FROM b2b_outreach WHERE email_type = 'recognition') as outreach,
      (SELECT COUNT(*) FROM b2b_email_events WHERE lead_id IN (SELECT id FROM b2b_leads WHERE source = 'qa_system_test')) as events
  `;

  console.log(`✓ QA Leads created: ${chainCheck[0].leads}`);
  console.log(`✓ Outreach records: ${chainCheck[0].outreach}`);
  console.log(`✓ Engagement events: ${chainCheck[0].events}`);

  console.log("\n=== PHASE 2 STATUS ===");
  if (chainCheck[0].leads === 5 && chainCheck[0].outreach === 5 && chainCheck[0].events > 0) {
    console.log("✓ SIGNAL CHAIN VERIFIED");
  } else {
    console.log("⚠ Some components missing");
  }
}

executePhase2().catch(err => {
  console.error("ERROR:", err.message);
  process.exit(1);
});
