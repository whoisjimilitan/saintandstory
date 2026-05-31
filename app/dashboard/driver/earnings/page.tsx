import { auth } from "@clerk/nextjs/server";
import { neon } from "@neondatabase/serverless";

async function getDriverId(clerkUserId: string) {
  const sql = neon(process.env.DATABASE_URL!);
  const rows = await sql`SELECT id FROM drivers WHERE clerk_user_id = ${clerkUserId} LIMIT 1`;
  return (rows[0]?.id as string) ?? null;
}

async function getEarnings(driverId: string) {
  const sql = neon(process.env.DATABASE_URL!);

  const monthly = await sql`
    SELECT
      TO_CHAR(DATE_TRUNC('month', created_at), 'Mon YYYY') as month,
      SUM(amount) as total,
      COUNT(*) as jobs,
      SUM(CASE WHEN status = 'paid' THEN amount ELSE 0 END) as paid
    FROM earnings
    WHERE driver_id = ${driverId}
    GROUP BY DATE_TRUNC('month', created_at)
    ORDER BY DATE_TRUNC('month', created_at) DESC
    LIMIT 6
  `;

  const recent = await sql`
    SELECT e.*, j.service_type, j.postcode_from, j.postcode_to, j.reference
    FROM earnings e
    LEFT JOIN jobs j ON j.id = e.job_id
    WHERE e.driver_id = ${driverId}
    ORDER BY e.created_at DESC
    LIMIT 20
  `;

  const totals = await sql`
    SELECT
      COALESCE(SUM(amount), 0) as all_time,
      COALESCE(SUM(CASE WHEN DATE_TRUNC('month', created_at) = DATE_TRUNC('month', NOW()) THEN amount ELSE 0 END), 0) as this_month
    FROM earnings WHERE driver_id = ${driverId}
  `;

  return {
    monthly: monthly as Record<string, unknown>[],
    recent: recent as Record<string, unknown>[],
    allTime: Number(totals[0]?.all_time ?? 0),
    thisMonth: Number(totals[0]?.this_month ?? 0),
  };
}

export default async function EarningsPage() {
  const { userId } = await auth();
  if (!userId || !process.env.DATABASE_URL) return null;

  const driverId = await getDriverId(userId);
  const { monthly, recent, allTime, thisMonth } = driverId
    ? await getEarnings(driverId)
    : { monthly: [], recent: [], allTime: 0, thisMonth: 0 };

  const roi = thisMonth > 0 ? Math.round(thisMonth / 9.99) : 0;

  return (
    <div className="max-w-2xl mx-auto px-6 py-10">
      <p className="text-[10px] font-semibold text-[#888888] uppercase tracking-[0.2em] mb-1">Earnings</p>
      <h1 className="font-sans font-black text-[#0D0D0D] text-3xl tracking-tight mb-8">
        Y<span className="font-display italic font-normal">o</span>ur money.
      </h1>

      {/* This month hero */}
      <div className="bg-[#0D0D0D] rounded-2xl px-6 py-7 mb-4">
        <p className="text-[10px] text-white/65 uppercase tracking-[0.2em] mb-4">This month</p>
        <div className="flex items-end justify-between mb-4">
          <div>
            <p className="font-sans font-black text-white text-5xl tracking-tight">£{thisMonth.toFixed(0)}</p>
            <p className="text-white/70 text-xs uppercase tracking-[0.12em] mt-1">earned</p>
          </div>
          <div className="text-right">
            <p className="font-sans font-black text-white/40 text-base line-through tracking-tight">£9.99</p>
            <p className="text-white/70 text-xs uppercase tracking-[0.12em]">fee</p>
          </div>
        </div>
        <div className="border-t border-white/15 pt-4">
          {roi > 0 ? (
            <p className="font-sans font-black text-white tracking-tight">{roi}× your monthly fee.</p>
          ) : (
            <p className="text-white/50 text-sm">Complete 1 job to cover your £9.99 this month.</p>
          )}
        </div>
      </div>

      {/* All time */}
      <div className="bg-white border border-[#E8E8E8] rounded-2xl px-5 py-4 flex items-center justify-between mb-4">
        <p className="text-[#888888] text-sm">All time</p>
        <p className="font-sans font-black text-[#0D0D0D] text-xl tracking-tight">£{allTime.toFixed(0)}</p>
      </div>

      {/* Subscription management */}
      <div className="bg-white border border-[#E8E8E8] rounded-2xl px-5 py-4 flex items-center justify-between mb-8">
        <div>
          <p className="font-sans font-semibold text-[#0D0D0D] text-sm">Founding rate</p>
          <p className="text-[#888888] text-xs mt-0.5">£9.99/month · locked forever</p>
        </div>
        {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
        <a
          href="/api/stripe/portal"
          className="text-[10px] font-semibold text-[#888888] hover:text-[#0D0D0D] uppercase tracking-[0.12em] transition-colors"
        >
          Manage →
        </a>
      </div>

      {/* Monthly breakdown */}
      {monthly.length > 0 && (
        <div className="mb-8">
          <p className="text-[10px] font-semibold text-[#888888] uppercase tracking-[0.2em] mb-3">Monthly</p>
          <div className="bg-white border border-[#E8E8E8] rounded-2xl overflow-hidden divide-y divide-[#E8E8E8]">
            {monthly.map((m) => (
              <div key={m.month as string} className="flex items-center justify-between px-5 py-4">
                <div>
                  <p className="font-sans font-semibold text-[#0D0D0D] text-sm">{m.month as string}</p>
                  <p className="text-[#888888] text-xs">{m.jobs as number} job{Number(m.jobs) !== 1 ? "s" : ""}</p>
                </div>
                <div className="text-right">
                  <p className="font-sans font-black text-[#0D0D0D] text-base">£{Number(m.total).toFixed(0)}</p>
                  {Number(m.paid) < Number(m.total) && (
                    <p className="text-[#888888] text-xs">£{(Number(m.total) - Number(m.paid)).toFixed(0)} pending</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent jobs */}
      {recent.length > 0 && (
        <div>
          <p className="text-[10px] font-semibold text-[#888888] uppercase tracking-[0.2em] mb-3">Recent</p>
          <div className="bg-white border border-[#E8E8E8] rounded-2xl overflow-hidden divide-y divide-[#E8E8E8]">
            {recent.map((e) => (
              <div key={e.id as string} className="flex items-center justify-between px-5 py-4">
                <div>
                  <p className="font-sans font-semibold text-[#0D0D0D] text-sm">
                    {(e.service_type as string) || "Job"}{e.reference ? ` · ${e.reference as string}` : ""}
                  </p>
                  <p className="text-[#888888] text-xs">
                    {e.postcode_from as string}{e.postcode_to ? ` → ${e.postcode_to as string}` : ""}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-sans font-black text-[#0D0D0D] text-sm">£{Number(e.amount).toFixed(0)}</p>
                  <span className={`text-[10px] font-semibold uppercase tracking-[0.1em] ${
                    e.status === "paid" ? "text-[#888888]" : "text-[#0D0D0D]"
                  }`}>
                    {e.status as string}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {recent.length === 0 && (
        <div className="bg-[#F5F5F5] border border-[#E8E8E8] rounded-2xl p-8 text-center">
          <p className="text-[#888888] text-sm">No earnings yet.</p>
          <p className="text-[#888888] text-xs mt-1">Complete your first job to see your earnings here.</p>
        </div>
      )}
    </div>
  );
}
