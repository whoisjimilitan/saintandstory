import { auth, currentUser } from "@clerk/nextjs/server";
import { neon } from "@neondatabase/serverless";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ensureB2BSchema } from "@/lib/b2b-schema";
import B2BPipeline from "@/components/B2BPipeline";
import B2BMetricsCards from "@/components/B2BMetricsCards";
import { DiscoveryConfig } from "@/components/DiscoveryConfig";
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
    <div className="max-w-3xl mx-auto px-6 py-10">
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-3">
          <p className="text-[10px] font-semibold text-[#888888] uppercase tracking-[0.2em]">Admin</p>
          <span className="text-[#E8E8E8] text-xs">·</span>
          <p className="text-[10px] font-semibold text-[#888888] uppercase tracking-[0.2em]">B2B Pipeline</p>
        </div>
        <Link href="/dashboard/admin" className="text-[10px] font-semibold text-[#888888] hover:text-[#0D0D0D] uppercase tracking-[0.2em] transition-colors border border-[#E8E8E8] px-3 py-1 rounded-full">
          Admin ↻
        </Link>
      </div>
      <h1 className="font-sans font-black text-[#0D0D0D] text-3xl tracking-tight mb-2">
        Morning brief.
      </h1>
      <div className="flex flex-wrap gap-x-4 gap-y-1 mb-8">
        {stats.warm > 0 && (
          <span className="text-sm font-semibold text-[#0D0D0D]">{stats.warm} warm</span>
        )}
        <span className="text-sm text-[#888888]">{stats.new} new</span>
        <span className="text-sm text-[#888888]">{stats.closed} closed</span>
        {stats.inbound > 0 && (
          <span className="text-sm text-[#0D0D0D] font-semibold">{stats.inbound} inbound</span>
        )}
        <span className="text-sm text-[#888888]">{orders.length} standing order{orders.length !== 1 ? "s" : ""}</span>
      </div>

      <div className="mb-12">
        <div className="mb-4">
          <p className="text-[10px] font-semibold text-[#888888] uppercase tracking-[0.2em]">Discovery Configuration</p>
        </div>
        <DiscoveryConfig />
      </div>

      <div className="mb-12">
        <div className="mb-4">
          <p className="text-[10px] font-semibold text-[#888888] uppercase tracking-[0.2em]">Knowledge Loop Metrics</p>
        </div>
        <B2BMetricsCards />
      </div>

      <B2BPipeline leads={leads} orders={orders} />
    </div>
  );
}
