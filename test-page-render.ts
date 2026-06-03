// Simulate what the page.tsx would do
import { neon } from "@neondatabase/serverless";
import { ensureB2BSchema } from "@/lib/b2b-schema";

const DATABASE_URL = 'postgresql://neondb_owner:npg_Rs5wyI3gTxWd@ep-lively-dream-abwubbyb-pooler.eu-west-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require';

async function getB2BData() {
  if (!DATABASE_URL) return { leads: [], orders: [], stats: { total: 0, new: 0, warm: 0, closed: 0, inbound: 0 } };

  await ensureB2BSchema();
  const sql = neon(DATABASE_URL);

  const [leads, orders] = await Promise.all([
    sql`
      SELECT l.*,
        o.last_sent, o.email_count, o.replied
      FROM b2b_leads l
      LEFT JOIN LATERAL (
        SELECT MAX(sent_at) as last_sent, COUNT(*) as email_count, bool_or(replied) as replied
        FROM b2b_outreach WHERE lead_id = l.id
      ) o ON true
      ORDER BY
        CASE l.status
          WHEN 'warm' THEN 1
          WHEN 'new' THEN 2
          WHEN 'contacted' THEN 3
          WHEN 'closed' THEN 4
          ELSE 5
        END,
        l.created_at DESC
      LIMIT 200
    `,
    sql`
      SELECT * FROM b2b_standing_orders WHERE active = true ORDER BY created_at DESC
    `,
  ]);

  const stats = {
    total: leads.length,
    new: leads.filter(l => l.status === "new").length,
    warm: leads.filter(l => (l.status === "warm" || l.status === "inbound")).length,
    closed: leads.filter(l => l.status === "closed").length,
    inbound: leads.filter(l => l.source === "inbound").length,
  };

  return { leads: leads as Record<string, unknown>[], orders: orders as Record<string, unknown>[], stats };
}

async function test() {
  try {
    console.log("Testing getB2BData() as it would be called from page.tsx...");
    const { leads, orders, stats } = await getB2BData();
    
    console.log("\nData returned:");
    console.log("- leads:", leads.length, "records");
    console.log("- orders:", orders.length, "records");
    console.log("- stats:", stats);
    
    if (leads.length > 0) {
      console.log("\nSample lead structure:");
      const lead = leads[0];
      console.log("- Keys:", Object.keys(lead));
      console.log("- Has delivery_frequency:", "delivery_frequency" in lead);
      console.log("- Has average_deliveries:", "average_deliveries" in lead);
      console.log("- Has courier_provider:", "courier_provider" in lead);
      console.log("- Has delivery_challenge:", "delivery_challenge" in lead);
      console.log("- Has delivery_type:", "delivery_type" in lead);
    }
    
    console.log("\n✅ getB2BData() executed successfully");
    console.log("This is the data that would be passed to B2BPipeline component");
  } catch (e: any) {
    console.error("❌ Error in getB2BData():", e.message);
    console.error("Stack:", e.stack);
  }
}

test().catch(console.error).finally(() => process.exit(0));
