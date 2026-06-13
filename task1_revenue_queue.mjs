import { neon } from "@neondatabase/serverless";
import fs from "fs";

const DATABASE_URL = process.env.DATABASE_URL;
const sql = neon(DATABASE_URL);

async function revenueQueue() {
  console.log("TASK 1: REVENUE QUEUE\n");

  const prospects = await sql`
    SELECT 
      l.id,
      l.business_name,
      l.business_category,
      l.email,
      l.engagement_score,
      COUNT(CASE WHEN e.event_type = 'opened' THEN 1 END) as opens,
      COUNT(CASE WHEN e.event_type = 'clicked' THEN 1 END) as clicks,
      COUNT(CASE WHEN e.event_type = 'replied' THEN 1 END) as replies,
      qb.opportunity_score
    FROM b2b_leads l
    LEFT JOIN b2b_outreach o ON l.id = o.lead_id AND o.email_type = 'recognition'
    LEFT JOIN b2b_email_events e ON l.id = e.lead_id
    LEFT JOIN qualified_businesses qb ON l.qualified_business_id = qb.id
    WHERE o.email_type = 'recognition'
    GROUP BY l.id, l.business_name, l.business_category, l.email, l.engagement_score, qb.opportunity_score
    ORDER BY clicks DESC, opens DESC, l.engagement_score DESC
  `;

  // Assign priorities
  const withPriority = prospects.map(p => {
    let priority, tier;
    if (p.clicks > 0) {
      priority = 1;
      tier = "P1 (Clicked)";
    } else if (p.opens >= 2) {
      priority = 2;
      tier = "P2 (Multiple Opens)";
    } else if (p.opens === 1) {
      priority = 3;
      tier = "P3 (Single Open)";
    } else {
      priority = 4;
      tier = "P4 (Silent)";
    }
    
    const heat = (parseFloat(p.opportunity_score || 0) * 0.4) + (p.engagement_score * 0.4);
    
    return {
      ...p,
      priority,
      tier,
      heat: heat.toFixed(0)
    };
  });

  // Group by priority
  const p1 = withPriority.filter(p => p.priority === 1);
  const p2 = withPriority.filter(p => p.priority === 2);
  const p3 = withPriority.filter(p => p.priority === 3);
  const p4 = withPriority.filter(p => p.priority === 4);

  console.log(`P1 (Clicked):        ${p1.length}`);
  console.log(`P2 (2+ Opens):       ${p2.length}`);
  console.log(`P3 (1 Open):         ${p3.length}`);
  console.log(`P4 (Silent):         ${p4.length}\n`);

  // Show P1 prospects
  console.log("P1 PROSPECTS (CONTACT IMMEDIATELY):\n");
  for (const p of p1) {
    console.log(`${p.business_name} (${p.business_category}) - Heat ${p.heat}/100`);
  }

  const report = `# REVENUE QUEUE

**Total Prospects**: ${prospects.length}  
**Last Updated**: ${new Date().toISOString()}

---

## PRIORITY BREAKDOWN

| Priority | Count | Status |
|----------|-------|--------|
| P1 - Clicked | ${p1.length} | Contact TODAY |
| P2 - 2+ Opens | ${p2.length} | Contact this week |
| P3 - 1 Open | ${p3.length} | Follow-up sequence |
| P4 - Silent | ${p4.length} | Subject line test |

---

## CONTACT TODAY (P1 - CLICKED)

${p1.map((p, i) => `${i+1}. **${p.business_name}**
   - Category: ${p.business_category}
   - Email: ${p.email}
   - Heat Score: ${p.heat}/100
   - Opens: ${p.opens} | Clicks: ${p.clicks}
   - Action: Case Study follow-up
   - Goal: Meeting this week`).join('\n\n')}

---

## P2 PROSPECTS (2+ OPENS)

${p2.map((p, i) => `${i+1}. **${p.business_name}** (${p.business_category}) - Heat ${p.heat}/100`).join('\n')}

---

## P3 PROSPECTS (1 OPEN)

${p3.map((p, i) => `${i+1}. **${p.business_name}** (${p.business_category}) - Heat ${p.heat}/100`).join('\n')}

---

## P4 PROSPECTS (SILENT)

${p4.map((p, i) => `${i+1}. **${p.business_name}** (${p.business_category})`).join('\n')}

---

## CONVERSION SEQUENCE

**This Week**:
- Contact all ${p1.length} P1 prospects
- Send follow-ups to all ${p2.length} P2 prospects

**Next Week**:
- Monitor replies from P1/P2
- Send P3 educational follow-ups
- Send P4 subject line tests

**Success Metrics**:
- First reply from P1
- First meeting scheduled
- First opportunity created
`;

  fs.writeFileSync("REVENUE_QUEUE.md", report);
  console.log("\n✓ REVENUE_QUEUE.md created");
}

revenueQueue().catch(err => {
  console.error("ERROR:", err.message);
  process.exit(1);
});
