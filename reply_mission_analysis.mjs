import { neon } from "@neondatabase/serverless";
import fs from "fs";

const DATABASE_URL = process.env.DATABASE_URL;
const sql = neon(DATABASE_URL);

async function clickedProspectsAnalysis() {
  console.log("CLICKED PROSPECTS MASTER ANALYSIS\n");

  // Get all clicked prospects
  const clicked = await sql`
    SELECT 
      l.id,
      l.business_name,
      l.business_category,
      l.email,
      l.engagement_score,
      COUNT(CASE WHEN e.event_type = 'opened' THEN 1 END) as opens,
      COUNT(CASE WHEN e.event_type = 'clicked' THEN 1 END) as clicks,
      MAX(e.timestamp) as last_activity,
      qb.opportunity_score
    FROM b2b_leads l
    LEFT JOIN b2b_outreach o ON l.id = o.lead_id AND o.email_type = 'recognition'
    LEFT JOIN b2b_email_events e ON l.id = e.lead_id
    LEFT JOIN qualified_businesses qb ON l.qualified_business_id = qb.id
    WHERE e.event_type = 'clicked'
    GROUP BY l.id, l.business_name, l.business_category, l.email, l.engagement_score, qb.opportunity_score
    ORDER BY opens DESC, l.engagement_score DESC
  `;

  console.log(`Total clicked prospects: ${clicked.length}\n`);

  // Rank by likelihood to reply
  const ranked = clicked.map((p, idx) => {
    const heat = (parseFloat(p.opportunity_score || 0) * 0.4) + (p.engagement_score * 0.4);
    
    // Ranking logic
    let likelihood = "High";
    let reason = "";
    
    if (p.opens >= 3 && p.clicks >= 2) {
      likelihood = "Very High";
      reason = "Multiple opens + clicks = strong engagement pattern";
    } else if (p.opens >= 2) {
      likelihood = "High";
      reason = "Multiple opens + click = deliberate exploration";
    } else if (p.opens === 1) {
      likelihood = "Medium";
      reason = "Single open + click = curious but not convinced";
    }
    
    return {
      rank: idx + 1,
      business: p.business_name,
      category: p.business_category,
      email: p.email,
      heat: heat.toFixed(0),
      opens: p.opens,
      clicks: p.clicks,
      lastActivity: p.last_activity,
      likelihood,
      reason
    };
  });

  // Generate master file
  const master = `# CLICKED PROSPECTS MASTER

**Critical Focus**: 8 prospects clicked. 0 replied.
**Mission**: Generate the first reply.

---

## THE 8 CLICKERS (Ranked by Reply Likelihood)

${ranked.map(p => `
### ${p.rank}. ${p.business} - **${p.likelihood} likelihood to reply**

**Business**: ${p.business}  
**Category**: ${p.category}  
**Email**: ${p.email}  
**Heat Score**: ${p.heat}/100  
**Opens**: ${p.opens} | **Clicks**: ${p.clicks}  
**Last Activity**: ${new Date(p.lastActivity).toLocaleString()}  

**Why this ranking**: ${p.reason}

**Why they clicked**: They wanted more information. Their click is a signal: "Tell me more."

**Why they haven't replied yet**: Something in the original email is preventing response.
Possible causes:
- No clear next step
- Offer doesn't match their need
- Wrong tone or positioning
- Too formal/corporate
- Need more specific value prop
- Timing (sent at wrong hour)
- Wrong person (clicked but wrong decision-maker)

`).join('\n')}

---

## FOLLOW-UP PRIORITY

**Send to immediately** (Rank 1-3):
${ranked.slice(0, 3).map(p => `- ${p.business}`).join('\n')}

**Send next** (Rank 4-6):
${ranked.slice(3, 6).map(p => `- ${p.business}`).join('\n')}

**Send if time** (Rank 7-8):
${ranked.slice(6, 8).map(p => `- ${p.business}`).join('\n')}

---

## WHAT WE KNOW

✅ They have the email
✅ They opened it
✅ They clicked a link
✅ They're interested enough to explore
❌ They haven't replied
❌ No objection stated (silence, not rejection)

**Interpretation**: They're interested but need a different hook, angle, or ask to respond.

---

## NEXT STEP

Use REPLY_STRATEGY_BOOK.md to craft follow-up for each clicker.
Goal: **Get one reply this week.**
`;

  fs.writeFileSync("CLICKED_PROSPECTS_MASTER.md", master);
  console.log("✓ CLICKED_PROSPECTS_MASTER.md created\n");

  // Show the ranked list
  console.log("RANKED BY REPLY LIKELIHOOD:\n");
  for (const p of ranked) {
    console.log(`${p.rank}. ${p.business} (${p.opens}O, ${p.clicks}C) - ${p.likelihood}`);
  }
}

clickedProspectsAnalysis().catch(err => {
  console.error("ERROR:", err.message);
  process.exit(1);
});
