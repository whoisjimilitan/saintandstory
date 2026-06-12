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
    <div className="max-w-5xl mx-auto px-6 py-12">
      <div className="flex items-center justify-between mb-10">
        <div>
          <p className="text-[11px] font-medium text-[#666666] uppercase tracking-[0.15em] mb-2">Admin</p>
          <h1 className="font-black text-[#1A1A1A] text-4xl tracking-tight">
            B2B Pipeline
          </h1>
        </div>
        <Link href="/dashboard/admin" className="text-xs font-semibold text-[#1A1A1A] hover:text-[#666666] uppercase tracking-[0.1em] transition-colors border border-[#E8E8E8] px-4 py-2 rounded-lg hover:border-[#999999]">
          ↻ Admin
        </Link>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-12">
        {stats.warm > 0 && (
          <div className="bg-white border border-[#E8E8E8] rounded-lg p-4">
            <p className="text-[11px] text-[#666666] uppercase tracking-[0.1em] mb-1">Active Conversations</p>
            <p className="text-2xl font-bold text-[#1A1A1A]">{stats.warm}</p>
          </div>
        )}
        <div className="bg-white border border-[#E8E8E8] rounded-lg p-4">
          <p className="text-[11px] text-[#666666] uppercase tracking-[0.1em] mb-1">Uncontacted</p>
          <p className="text-2xl font-bold text-[#1A1A1A]">{stats.new}</p>
        </div>
        <div className="bg-white border border-[#E8E8E8] rounded-lg p-4">
          <p className="text-[11px] text-[#666666] uppercase tracking-[0.1em] mb-1">Converted</p>
          <p className="text-2xl font-bold text-[#1A1A1A]">{stats.closed}</p>
        </div>
        {stats.inbound > 0 && (
          <div className="bg-white border border-[#E8E8E8] rounded-lg p-4">
            <p className="text-[11px] text-[#666666] uppercase tracking-[0.1em] mb-1">Inbound Leads</p>
            <p className="text-2xl font-bold text-[#1A1A1A]">{stats.inbound}</p>
          </div>
        )}
        <div className="bg-white border border-[#E8E8E8] rounded-lg p-4">
          <p className="text-[11px] text-[#666666] uppercase tracking-[0.1em] mb-1">In-Journey Orders</p>
          <p className="text-2xl font-bold text-[#1A1A1A]">{orders.length}</p>
        </div>
      </div>

      <div className="mb-16">
        <div className="mb-6">
          <h2 className="text-sm font-semibold text-[#1A1A1A] uppercase tracking-[0.1em]">Acquisition Pipeline</h2>
          <p className="text-xs text-[#999999] mt-1">Discovery → enrichment → qualification → activation</p>
        </div>
        <B2BMetricsCards />
      </div>

      <div className="mb-16">
        <div className="mb-6">
          <h2 className="text-sm font-semibold text-[#1A1A1A] uppercase tracking-[0.1em]">Discovery Management</h2>
          <p className="text-xs text-[#999999] mt-1">Configure discovery sources and research missions</p>
        </div>
        <DiscoveryConfig />
      </div>

      <div className="mb-16">
        <div className="mb-6">
          <h2 className="text-sm font-semibold text-[#1A1A1A] uppercase tracking-[0.1em]">Opportunities Pipeline</h2>
          <p className="text-xs text-[#999999] mt-1">Manage conversations, standing orders, and activations</p>
        </div>
        <B2BPipeline leads={leads} orders={orders} />
      </div>
    </div>
  );
}
