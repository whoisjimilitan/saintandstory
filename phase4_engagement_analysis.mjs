import { neon } from "@neondatabase/serverless";
import fs from "fs";

const DATABASE_URL = process.env.DATABASE_URL;
const sql = neon(DATABASE_URL);

async function phase4Analysis() {
  console.log("╔════════════════════════════════════════════════════════════╗");
  console.log("║    PHASE 4: ENGAGEMENT-TO-MEETING ANALYSIS               ║");
  console.log("╚════════════════════════════════════════════════════════════╝\n");

  // Get all contacted leads with engagement data
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
      AND o.created_at > NOW() - INTERVAL '30 minutes'
    GROUP BY l.id, l.business_name, l.business_category, l.email, l.engagement_score, qb.opportunity_score
    ORDER BY l.engagement_score DESC, opens DESC
  `;

  console.log(`Analyzing ${prospects.length} prospects\n`);

  // Classify into tiers
  const tierA = prospects.filter(p => p.clicks > 0);
  const tierB = prospects.filter(p => p.clicks === 0 && p.opens >= 2);
  const tierC = prospects.filter(p => p.opens === 1);
  const tierD = prospects.filter(p => p.opens === 0);

  console.log(`TIER CLASSIFICATION:\n`);
  console.log(`Tier A (Clicked):       ${tierA.length} prospects`);
  console.log(`Tier B (2+ Opens):      ${tierB.length} prospects`);
  console.log(`Tier C (1 Open):        ${tierC.length} prospects`);
  console.log(`Tier D (No Engagement): ${tierD.length} prospects\n`);

  // Determine recommendations
  const withRecommendations = prospects.map(p => {
    let recommendation, reason;
    
    if (p.clicks > 0) {
      recommendation = "Case Study Follow-Up";
      reason = "Clicked email shows specific interest";
    } else if (p.opens >= 2) {
      recommendation = "Meeting Request";
      reason = "Multiple opens indicate strong interest";
    } else if (p.opens === 1) {
      recommendation = "Educational Follow-Up";
      reason = "Single open shows initial interest";
    } else {
      recommendation = "Subject Line Test";
      reason = "No engagement yet - test different angle";
    }

    const heatScore = (parseFloat(p.opportunity_score || 0) * 0.4) + (p.engagement_score * 0.4);

    return {
      ...p,
      recommendation,
      reason,
      heatScore: heatScore.toFixed(0),
      tier: p.clicks > 0 ? 'A' : p.opens >= 2 ? 'B' : p.opens === 1 ? 'C' : 'D'
    };
  });

  // Generate analysis report
  const report = `# ENGAGEMENT-TO-MEETING ANALYSIS

**Status**: Complete  
**Total Prospects**: ${prospects.length}  
**Total Engagement Events**: ${prospects.reduce((sum, p) => sum + p.opens + p.clicks, 0)}  

## TIER BREAKDOWN

### TIER A: Clicked (${tierA.length} prospects)
**Status**: Hottest prospects - ready for conversion  
**Recommended Action**: Case Study Follow-Up

High purchase intent signal. Move to meeting.

${tierA.map(p => `- **${p.business_name}** (${p.business_category}) — Heat ${(parseFloat(p.opportunity_score || 0) * 0.4 + p.engagement_score * 0.4).toFixed(0)}/100`).join('\n')}

---

### TIER B: Multiple Opens (${tierB.length} prospects)
**Status**: Warm prospects - strong interest shown  
**Recommended Action**: Meeting Request

Multiple opens indicate deliberate engagement. Ready for direct ask.

${tierB.map(p => `- **${p.business_name}** (${p.business_category}) — ${p.opens} opens`).join('\n')}

---

### TIER C: Single Open (${tierC.length} prospects)
**Status**: Cool prospects - initial interest  
**Recommended Action**: Educational Follow-Up

Need to build trust and demonstrate value.

${tierC.map(p => `- **${p.business_name}** (${p.business_category})`).join('\n')}

---

### TIER D: No Engagement (${tierD.length} prospects)
**Status**: Cold prospects - no signal yet  
**Recommended Action**: Subject Line Test

Different angle needed. Test alternative message.

${tierD.map(p => `- **${p.business_name}** (${p.business_category})`).join('\n')}

---

## PROSPECTS BY CONVERSION PROBABILITY

${withRecommendations.slice(0, 15).map((p, i) => `
${i+1}. **${p.business_name}** (Heat: ${p.heatScore}/100)
   - Opens: ${p.opens}, Clicks: ${p.clicks}
   - Next Action: ${p.recommendation}
   - Reason: ${p.reason}
`).join('\n')}

---

## CONVERSION STRATEGY

| Tier | Count | Strategy | Probability |
|------|-------|----------|-------------|
| A | ${tierA.length} | Case Study | High |
| B | ${tierB.length} | Meeting Ask | Medium-High |
| C | ${tierC.length} | Educational | Medium |
| D | ${tierD.length} | Subject Test | Low |

**Immediate Action**: Contact Tier A and B prospects this week.
**Expected**: 1-2 meetings from top prospects.

---

## BOTTLENECK ANALYSIS

**What was blocking**: Engagement signals (now solved)
**What blocks next**: Conversation initiation (need follow-up)
**Critical path**: Engagement → Reply → Meeting → Opportunity → Revenue

Current state: Engagement proven.
Next state: Replies and meetings.
`;

  fs.writeFileSync("ENGAGEMENT_TO_MEETING_ANALYSIS.md", report);
  console.log("✅ ENGAGEMENT_TO_MEETING_ANALYSIS.md created\n");

  // Generate follow-up execution plan
  const followupPlan = `# FOLLOWUP EXECUTION PLAN

**Objective**: Convert engaged prospects into meetings and revenue.

---

## EXECUTION ORDER (By Priority)

### IMMEDIATE (This Week)

${tierA.map((p, i) => `
${i+1}. **${p.business_name}** — TIER A (Clicked)
   - Business: ${p.business_name}
   - Email: ${p.email}
   - Current Heat: ${(parseFloat(p.opportunity_score || 0) * 0.4 + p.engagement_score * 0.4).toFixed(0)}/100
   - Action: Send Case Study
   - Goal: Schedule meeting
`).join('\n')}

### WEEK 2

${tierB.map((p, i) => `
${i+1}. **${p.business_name}** — TIER B (Multiple Opens)
   - Action: Send Meeting Request
   - Goal: Booking call
`).slice(0, 5).join('\n')}

---

## OPERATOR WORKFLOW

For each prospect:

1. View in Command Center
2. Check Heat Score
3. Read AI Brief (will generate)
4. Select recommended follow-up template
5. Personalize (2-3 lines)
6. Send
7. Log in CRM
8. Monitor for reply

Estimated time per prospect: 3 minutes

---

## SUCCESS METRICS

Track daily:
- Replies received
- Meetings scheduled  
- Opportunities created
- Revenue attributed

Target week 1: 1-2 replies, 1 meeting.
`;

  fs.writeFileSync("FOLLOWUP_EXECUTION_PLAN.md", followupPlan);
  console.log("✅ FOLLOWUP_EXECUTION_PLAN.md created\n");

  console.log("NEXT PHASE: Generate follow-up library by category\n");
}

phase4Analysis().catch(err => {
  console.error("ERROR:", err.message);
  process.exit(1);
});
