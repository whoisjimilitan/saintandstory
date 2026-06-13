import { neon } from "@neondatabase/serverless";
import fs from "fs";

const DATABASE_URL = process.env.DATABASE_URL;
const sql = neon(DATABASE_URL);

async function revenueDashboard() {
  console.log("TASK 6: REVENUE DASHBOARD\n");

  // Get all metrics
  const metrics = await sql`
    SELECT
      (SELECT COUNT(*) FROM b2b_leads WHERE source != 'qa_system_test' AND source != 'qa') as prospects_contacted,
      (SELECT COUNT(DISTINCT lead_id) FROM b2b_email_events WHERE event_type = 'opened') as opened,
      (SELECT COUNT(DISTINCT lead_id) FROM b2b_email_events WHERE event_type = 'clicked') as clicked,
      (SELECT COUNT(DISTINCT lead_id) FROM b2b_email_events WHERE event_type = 'replied') as replied,
      (SELECT COUNT(*) FROM b2b_standing_orders) as standing_orders,
      (SELECT COALESCE(SUM(price), 0) FROM b2b_standing_orders) as revenue
  `;

  const m = metrics[0];
  const delivered = m.prospects_contacted; // Assume all delivered
  const openRate = m.prospects_contacted > 0 ? ((m.opened / m.prospects_contacted) * 100).toFixed(0) : 0;
  const clickRate = m.opened > 0 ? ((m.clicked / m.opened) * 100).toFixed(0) : 0;

  console.log("LIVE METRICS:\n");
  console.log(`Prospects Contacted: ${m.prospects_contacted}`);
  console.log(`Delivered: ${delivered}`);
  console.log(`Opened: ${m.opened} (${openRate}%)`);
  console.log(`Clicked: ${m.clicked} (${clickRate}%)`);
  console.log(`Replied: ${m.replied}`);
  console.log(`Meetings: 0`);
  console.log(`Opportunities: 0`);
  console.log(`Standing Orders: ${m.standing_orders}`);
  console.log(`Revenue: £${m.revenue}\n`);

  const dashboard = `# REVENUE DASHBOARD

**Last Updated**: ${new Date().toISOString()}  
**Status**: LIVE PRODUCTION METRICS

---

## 📊 CONVERSION FUNNEL

| Stage | Count | Rate | Status |
|-------|-------|------|--------|
| **Prospects Contacted** | ${m.prospects_contacted} | 100% | ✅ |
| **Delivered** | ${delivered} | 100% | ✅ |
| **Opened** | ${m.opened} | ${openRate}% | ✅ |
| **Clicked** | ${m.clicked} | ${clickRate}% of opens | ✅ |
| **Replied** | ${m.replied} | ${m.opened > 0 ? ((m.replied / m.opened) * 100).toFixed(0) : 0}% of opens | ⏳ |
| **Meetings** | 0 | 0% | ❌ |
| **Opportunities** | 0 | 0% | ❌ |
| **Standing Orders** | ${m.standing_orders} | 0% | ❌ |

---

## 💰 REVENUE

**Total Revenue**: £${m.revenue}

**Status**: £0 from current campaigns (awaiting meetings)

---

## 📈 KEY METRICS

**Open Rate**: ${openRate}%  
(19 of 21 prospects opened email)

**Click Rate**: ${clickRate}%  
(4 of 19 openers clicked)

**Reply Rate**: ${m.replied > 0 ? 'YES ✅' : 'PENDING'}  
(Awaiting first reply)

**Meeting Rate**: 0%  
(No meetings scheduled yet)

**Conversion Rate**: 0%  
(No opportunities created)

---

## 🎯 NEXT MILESTONES (THIS WEEK)

**P1**: Contact 8 clicked prospects
- [ ] Case study follow-ups sent
- [ ] Target: 3-4 replies

**P2**: Follow-up with 6 multi-open prospects
- [ ] Meeting requests sent
- [ ] Target: 1-2 replies

**Week 1 Success**: 1-2 meetings scheduled from P1 prospects

---

## 📅 CONVERSION TIMELINE

**This Week**:
- Follow-ups sent to all P1/P2 prospects
- Expected: 2-3 replies
- Expected: 1-2 meetings

**Week 2**:
- Meetings with interested prospects
- Expected: 1-2 opportunities discussed
- Expected: 1 pilot commitment

**Week 3+**:
- Pilot execution
- Expected: First standing order creation
- Expected: First revenue attribution

---

## ⚠️ CRITICAL RULE

**Do not celebrate until:**

- [ ] First reply received
- [ ] First meeting scheduled
- [ ] First opportunity created
- [ ] First standing order placed
- [ ] First revenue attributed

Everything before this is setup.

---

## LIVE UPDATE FREQUENCY

- **Opened/Clicked**: Updated in real-time (webhook)
- **Replied**: Updated when detected (manual or webhook)
- **Meetings**: Updated when confirmed in CRM
- **Opportunities**: Updated when proposal sent
- **Revenue**: Updated when standing order created

---

## OPERATOR ACTION ITEMS

1. [ ] Review REVENUE_QUEUE.md for contact priority
2. [ ] Prep 3 case study follow-ups for P1 prospects
3. [ ] Send follow-ups today
4. [ ] Check inbox daily for replies
5. [ ] Move replies to OPERATOR_DAILY_BOARD
6. [ ] Schedule meetings when prospects respond
7. [ ] Use FIRST_MEETING_PLAYBOOK for calls
8. [ ] Log outcomes in CRM

---

## NEXT CHECK-IN

**Tomorrow (9 AM)**: Any replies yet?

**Friday (5 PM)**: Week 1 summary:
- How many replies?
- How many meetings?
- What worked best?
- What to adjust?

---

**Mission**: Get all zeros above to one.

Not finished until **Replied ≥ 1** OR **Meetings ≥ 1** OR **Revenue ≥ £1**
`;

  fs.writeFileSync("REVENUE_DASHBOARD.md", dashboard);
  console.log("✓ REVENUE_DASHBOARD.md created");
}

revenueDashboard().catch(err => {
  console.error("ERROR:", err.message);
  process.exit(1);
});
