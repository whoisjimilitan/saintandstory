import { auth, currentUser } from "@clerk/nextjs/server";
import { neon } from "@neondatabase/serverless";
import { redirect } from "next/navigation";
import { ensureB2BSchema } from "@/lib/b2b-schema";
import B2BPipeline from "@/components/B2BPipeline";
import { type Lead, type StandingOrder } from "@/lib/b2b-types";

const ADMIN_EMAILS = [
  "whoisjimi.today@gmail.com",
  "oyedeleoyepeju2014@gmail.com",
  "james@saintandstoryltd.co.uk",
  "oye@saintandstoryltd.co.uk"
];

async function getB2BData() {
  if (!process.env.DATABASE_URL) {
    console.warn("[B2B Admin] DATABASE_URL not configured");
    return { leads: [], orders: [], stats: { total: 0, new: 0, warm: 0, closed: 0, inbound: 0 } };
  }

  try {
    await ensureB2BSchema();
  } catch (schemaError) {
    console.error("[B2B Admin] Schema initialization failed:", schemaError);
    return { leads: [], orders: [], stats: { total: 0, new: 0, warm: 0, closed: 0, inbound: 0 } };
  }

  const sql = neon(process.env.DATABASE_URL);

  try {
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

    return { leads: leads as Lead[], orders: orders as StandingOrder[], stats };
  } catch (queryError) {
    console.error("[B2B Admin] Query failed:", queryError);
    return { leads: [], orders: [], stats: { total: 0, new: 0, warm: 0, closed: 0, inbound: 0 } };
  }
}

export default async function B2BAdminPage() {
  const { userId } = await auth();
  const user = await currentUser();
  if (!userId) redirect("/sign-in");
  const email = user?.emailAddresses[0]?.emailAddress ?? "";
  if (!ADMIN_EMAILS.includes(email)) redirect("/dashboard/driver");

  const { leads, orders, stats } = await getB2BData();

  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
      <div className="mb-12">
        <h1 className="text-3xl font-bold text-[#0D0D0D] mb-8">B2B Pipeline</h1>

        {/* TODAY SECTION */}
        <div className="mb-12">
          <p className="text-sm font-semibold text-[#0D0D0D] uppercase tracking-wide mb-6">Today</p>
          <div className="grid grid-cols-3 gap-6 mb-8">
            <div className="p-6 bg-white border border-[#CCCCCC] rounded-lg">
              <p className="text-xs text-[#666666] uppercase tracking-wide mb-1">Requires Response</p>
              <p className="text-4xl font-bold text-[#0D0D0D]">{stats.warm}</p>
            </div>
            <div className="p-6 bg-white border border-[#CCCCCC] rounded-lg">
              <p className="text-xs text-[#666666] uppercase tracking-wide mb-1">Uncontacted</p>
              <p className="text-4xl font-bold text-[#0D0D0D]">{stats.new}</p>
            </div>
            <div className="p-6 bg-white border border-[#CCCCCC] rounded-lg">
              <p className="text-xs text-[#666666] uppercase tracking-wide mb-1">Standing Orders</p>
              <p className="text-4xl font-bold text-[#0D0D0D]">{orders.length}</p>
            </div>
          </div>
        </div>

        {/* PIPELINE SECTION */}
        <div className="mb-12">
          <p className="text-sm font-semibold text-[#0D0D0D] uppercase tracking-wide mb-6">Pipeline</p>
          <B2BPipeline leads={leads} orders={orders} />
        </div>

        {/* ARCHIVE SECTION */}
        {stats.closed > 0 && (
          <div className="mb-12">
            <p className="text-sm font-semibold text-[#0D0D0D] uppercase tracking-wide mb-4">Archive</p>
            <p className="text-xs text-[#666666]">{stats.closed} converted leads</p>
          </div>
        )}
      </div>
    </div>
  );
}
