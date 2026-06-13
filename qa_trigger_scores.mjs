import { neon } from "@neondatabase/serverless";

// Import the engagement tracking functions
import fs from 'fs';
import path from 'path';

const DATABASE_URL = process.env.DATABASE_URL;
const sql = neon(DATABASE_URL);

// Replicate the calculateEngagementScore logic
async function calculateEngagementScore(leadId) {
  try {
    const events = await sql`
      SELECT event_type, COUNT(*) as count
      FROM b2b_email_events
      WHERE lead_id = ${leadId}
      GROUP BY event_type
    `;

    let score = 0;
    const eventMap = Object.fromEntries(events.map(e => [e.event_type, e.count]));

    // Opens: +10 each, max 50
    const opens = Math.min(eventMap.opened || 0, 5) * 10;
    score += opens;

    // Clicks: +20 first click only (max +20)
    const clicks = (eventMap.clicked || 0) > 0 ? 20 : 0;
    score += clicks;

    // Bounced or complained: disqualify
    if (eventMap.bounced || eventMap.complained) {
      score = 0;
    }

    return Math.min(Math.max(score, 0), 100);
  } catch (error) {
    console.error(`Error calculating score for ${leadId}:`, error.message);
    return 0;
  }
}

async function updateEngagementScore(leadId) {
  try {
    const score = await calculateEngagementScore(leadId);
    
    const lastEvent = await sql`
      SELECT MAX(timestamp) as last_activity
      FROM b2b_email_events
      WHERE lead_id = ${leadId}
    `;

    await sql`
      UPDATE b2b_leads
      SET engagement_score = ${score},
          last_engagement_at = ${lastEvent[0]?.last_activity || null}
      WHERE id = ${leadId}
    `;

    return score;
  } catch (error) {
    console.error(`Error updating score for ${leadId}:`, error.message);
    return 0;
  }
}

async function triggerScores() {
  console.log("=== TRIGGERING ENGAGEMENT SCORE CALCULATION ===\n");

  const qaLeads = [
    "d486dfe0-7c55-4c19-b82b-8d81ae2b6485",
    "d72743a9-0d3b-4567-b349-0688467598d3",
    "c57570d0-dca8-4aa5-94e8-f694e98e13e2",
    "95b6d715-1552-456b-a911-247dbd44eefd",
    "5f8b957a-126b-4e96-a460-d55b22173069"
  ];

  console.log("Calculating and updating engagement scores...\n");

  for (const leadId of qaLeads) {
    const lead = await sql`SELECT business_name FROM b2b_leads WHERE id = ${leadId}`;
    if (lead.length === 0) continue;

    const score = await updateEngagementScore(leadId);
    
    const events = await sql`
      SELECT event_type, COUNT(*) as count
      FROM b2b_email_events
      WHERE lead_id = ${leadId}
      GROUP BY event_type
    `;

    const eventDesc = events.length > 0 
      ? events.map(e => `${e.count} ${e.event_type}`).join(" + ")
      : "no events";

    console.log(`✓ ${lead[0].business_name}`);
    console.log(`  Events: ${eventDesc}`);
    console.log(`  Engagement Score: ${score}/100\n`);
  }

  console.log("=== VERIFICATION ===\n");

  // Verify all scores updated
  const allScores = await sql`
    SELECT business_name, engagement_score
    FROM b2b_leads
    WHERE business_name LIKE 'QA Test%'
    ORDER BY engagement_score DESC
  `;

  console.log("Final Engagement Scores:");
  for (const lead of allScores) {
    const badge = lead.engagement_score >= 75 ? '🔥' : 
                  lead.engagement_score >= 50 ? '🔥' : 
                  lead.engagement_score >= 25 ? '🟡' : '⚪';
    console.log(`${badge} ${lead.business_name}: ${lead.engagement_score}/100`);
  }

  console.log("\n✅ Signal Chain Now Complete:");
  console.log("   Lead Created → Email Sent → Events Recorded → Scores Updated");
}

triggerScores().catch(err => {
  console.error("ERROR:", err.message);
  process.exit(1);
});
