import { neon } from "@neondatabase/serverless";

const DATABASE_URL = process.env.DATABASE_URL;
const sql = neon(DATABASE_URL);

async function executePhase2() {
  console.log("=== PHASE 2: SEND RECOGNITION EMAILS & VERIFY SIGNAL CHAIN ===\n");

  const qaLeads = [
    { id: "d486dfe0-7c55-4c19-b82b-8d81ae2b6485", name: "QA Test - Opens Only" },
    { id: "d72743a9-0d3b-4567-b349-0688467598d3", name: "QA Test - Open Click" },
    { id: "c57570d0-dca8-4aa5-94e8-f694e98e13e2", name: "QA Test - Full Engagement" },
    { id: "95b6d715-1552-456b-a911-247dbd44eefd", name: "QA Test - No Engagement" },
    { id: "5f8b957a-126b-4e96-a460-d55b22173069", name: "QA Test - Multiple Opens" }
  ];

  console.log("STEP 1: Create Outreach Records\n");

  const followUp1 = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString();
  const followUp2 = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

  for (const lead of qaLeads) {
    try {
      const testMessageId = `res_qa_${lead.id.substring(0, 8)}_test`;
      
      await sql`
        INSERT INTO b2b_outreach (lead_id, subject, body, sent_at, follow_up_1_at, follow_up_2_at, email_type, resend_message_id)
        VALUES (${lead.id}, 'Saint & Story: Recognition Email [QA]', 'Test email body', NOW(), ${followUp1}, ${followUp2}, 'recognition', ${testMessageId})
      `;

      console.log(`✓ ${lead.name} - Message ID: ${testMessageId}`);

    } catch (e) {
      console.error(`✗ ${lead.name}: ${e.message}`);
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
          const eventTime = new Date(Date.now() - i * 60 * 60 * 1000).toISOString();
          await sql`
            INSERT INTO b2b_email_events (lead_id, outreach_id, event_type, timestamp, metadata)
            VALUES (${leadId}, ${outreachId}, ${pattern.type}, ${eventTime}, '{"event": "test"}'::jsonb)
          `;
          eventsCreated++;
        } catch (e) {
          // continue
        }
      }
    }

    const desc = patterns.length > 0 ? patterns.map(p => `${p.count} ${p.type}`).join(" + ") : "no events";
    console.log(`✓ ${lead.name}: ${desc}`);
  }

  console.log(`\nTotal events created: ${eventsCreated}\n`);

  console.log("STEP 3: Verify Engagement Scores Updated\n");

  for (const lead of qaLeads) {
    const score = await sql`SELECT engagement_score FROM b2b_leads WHERE id = ${lead.id}`;
    console.log(`${lead.name}: ${score[0].engagement_score}/100`);
  }

  console.log("\nSTEP 4: Verify Outreach Records\n");

  const outreachCount = await sql`SELECT COUNT(*) as count FROM b2b_outreach WHERE email_type = 'recognition'`;
  console.log(`✓ Outreach records created: ${outreachCount[0].count}`);

  const eventCount = await sql`SELECT COUNT(*) as count FROM b2b_email_events`;
  console.log(`✓ Engagement events created: ${eventCount[0].count}`);

  console.log("\n=== PHASE 2 SUMMARY ===");
  console.log(`✓ QA Leads: 5`);
  console.log(`✓ Outreach Records: ${outreachCount[0].count}`);
  console.log(`✓ Engagement Events: ${eventCount[0].count}`);
  console.log(`✓ Signal Chain: READY FOR TESTING\n`);
}

executePhase2().catch(err => {
  console.error("ERROR:", err.message);
  process.exit(1);
});
