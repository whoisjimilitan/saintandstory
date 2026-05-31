import { auth, currentUser } from "@clerk/nextjs/server";
import { neon } from "@neondatabase/serverless";
import { redirect } from "next/navigation";
import Link from "next/link";

const ADMIN_EMAILS = ["whoisjimi.today@gmail.com", "oyedeleoyepeju2014@gmail.com"];
const ADMIN_USER_IDS = ["user_3EVExeiSBmgdhAWGzMEb8GMVc62"];
const MONTHLY_RATE = 9.99;

async function getRevenueData() {
  const sql = neon(process.env.DATABASE_URL!);

  const [activeDrivers, newDrivers, jobs, earnings, recentDrivers] = await Promise.all([
    sql`SELECT COUNT(*) as count FROM drivers WHERE profile_live = true`,
    sql`SELECT COUNT(*) as count FROM drivers WHERE DATE_TRUNC('month', created_at) = DATE_TRUNC('month', NOW())`,
    sql`
      SELECT
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE status = 'completed') as completed,
        COUNT(*) FILTER (WHERE DATE_TRUNC('month', created_at) = DATE_TRUNC('month', NOW())) as this_month,
        COUNT(*) FILTER (WHERE status = 'pending_review') as pending
      FROM jobs
    `,
    sql`
      SELECT
        COALESCE(SUM(amount), 0) as all_time,
        COALESCE(SUM(amount) FILTER (WHERE DATE_TRUNC('month', created_at) = DATE_TRUNC('month', NOW())), 0) as this_month
      FROM earnings
    `,
    sql`
      SELECT full_name, area, vehicle_type, rating_avg, rating_count, created_at, profile_live, subscription_status
      FROM drivers
      ORDER BY created_at DESC
      LIMIT 10
    `,
  ]);

  const active = Number(activeDrivers[0]?.count ?? 0);
  const mrr = active * MONTHLY_RATE;

  return {
    activeDrivers: active,
    newDriversThisMonth: Number(newDrivers[0]?.count ?? 0),
    mrr,
    totalJobs: Number(jobs[0]?.total ?? 0),
    completedJobs: Number(jobs[0]?.completed ?? 0),
    jobsThisMonth: Number(jobs[0]?.this_month ?? 0),
    pendingJobs: Number(jobs[0]?.pending ?? 0),
    allTimeEarnings: Number(earnings[0]?.all_time ?? 0),
    earningsThisMonth: Number(earnings[0]?.this_month ?? 0),
    recentDrivers: recentDrivers as Record<string, unknown>[],
  };
}

export default async function RevenuePage() {
  const { userId } = await auth();
  const user = await currentUser();
  if (!userId) redirect("/sign-in");
  const email = user?.emailAddresses[0]?.emailAddress ?? "";
  if (!ADMIN_EMAILS.includes(email) && !ADMIN_USER_IDS.includes(userId ?? "")) redirect("/dashboard/driver");

  const data = await getRevenueData();

  return (
    <div className="max-w-3xl mx-auto px-6 py-10">
      <div className="flex items-center justify-between mb-1">
        <p className="text-[10px] font-semibold text-[#888888] uppercase tracking-[0.2em]">Admin · Revenue</p>
        <Link href="/dashboard/admin" className="text-[10px] text-[#888888] hover:text-[#0D0D0D] uppercase tracking-[0.12em] transition-colors">
          ← Jobs
        </Link>
      </div>
      <h1 className="font-sans font-black text-[#0D0D0D] text-3xl tracking-tight mb-8">
        Platform overview.
      </h1>

      {/* MRR hero */}
      <div className="bg-[#0D0D0D] rounded-2xl px-6 py-7 mb-4">
        <p className="text-[10px] text-white/55 uppercase tracking-[0.2em] mb-4">Monthly recurring revenue</p>
        <div className="flex items-end justify-between mb-5">
          <div>
            <p className="font-sans font-black text-white text-5xl tracking-tight">£{data.mrr.toFixed(2)}</p>
            <p className="text-white/55 text-xs uppercase tracking-[0.12em] mt-1">per month</p>
          </div>
          <div className="text-right">
            <p className="font-sans font-black text-white text-2xl tracking-tight">{data.activeDrivers}</p>
            <p className="text-white/55 text-xs uppercase tracking-[0.12em] mt-0.5">active drivers</p>
          </div>
        </div>
        <div className="border-t border-white/15 pt-4 grid grid-cols-2 gap-4">
          <div>
            <p className="font-sans font-black text-white text-lg tracking-tight">£{(data.mrr * 12).toFixed(0)}</p>
            <p className="text-white/55 text-xs mt-0.5">ARR at current rate</p>
          </div>
          <div className="text-right">
            <p className="font-sans font-black text-white text-lg tracking-tight">+{data.newDriversThisMonth}</p>
            <p className="text-white/55 text-xs mt-0.5">new drivers this month</p>
          </div>
        </div>
      </div>

      {/* Job stats */}
      <div className="grid grid-cols-4 gap-3 mb-4">
        {[
          { label: "Total jobs", value: data.totalJobs },
          { label: "Completed", value: data.completedJobs },
          { label: "This month", value: data.jobsThisMonth },
          { label: "Pending", value: data.pendingJobs },
        ].map(({ label, value }) => (
          <div key={label} className="bg-white border border-[#E8E8E8] rounded-2xl px-4 py-4 text-center">
            <p className="font-sans font-black text-[#0D0D0D] text-2xl tracking-tight">{value}</p>
            <p className="text-[#888888] text-[10px] uppercase tracking-[0.1em] mt-1">{label}</p>
          </div>
        ))}
      </div>

      {/* Driver earnings distributed */}
      <div className="grid grid-cols-2 gap-3 mb-8">
        <div className="bg-white border border-[#E8E8E8] rounded-2xl px-5 py-4">
          <p className="text-[#888888] text-[10px] uppercase tracking-[0.1em] mb-1">Earned by drivers — all time</p>
          <p className="font-sans font-black text-[#0D0D0D] text-2xl tracking-tight">£{data.allTimeEarnings.toFixed(0)}</p>
        </div>
        <div className="bg-white border border-[#E8E8E8] rounded-2xl px-5 py-4">
          <p className="text-[#888888] text-[10px] uppercase tracking-[0.1em] mb-1">Earned this month</p>
          <p className="font-sans font-black text-[#0D0D0D] text-2xl tracking-tight">£{data.earningsThisMonth.toFixed(0)}</p>
        </div>
      </div>

      {/* Recent drivers */}
      <div>
        <p className="text-[10px] font-semibold text-[#888888] uppercase tracking-[0.2em] mb-3">Recent drivers</p>
        <div className="bg-white border border-[#E8E8E8] rounded-2xl overflow-hidden divide-y divide-[#E8E8E8]">
          {data.recentDrivers.map((d, i) => (
            <div key={i} className="flex items-center justify-between px-5 py-4">
              <div>
                <p className="font-sans font-semibold text-[#0D0D0D] text-sm">{d.full_name as string || "—"}</p>
                <p className="text-[#888888] text-xs">{d.area as string} · {d.vehicle_type as string}</p>
              </div>
              <div className="flex items-center gap-3">
                {d.rating_avg != null && Number(d.rating_avg) > 0 && (
                  <p className="text-[#888888] text-xs">★ {Number(d.rating_avg).toFixed(1)}{d.rating_count ? ` · ${d.rating_count}` : ""}</p>
                )}
                <span className={`text-[10px] font-semibold px-2.5 py-1 rounded-full uppercase tracking-[0.1em] ${
                  d.profile_live ? "bg-[#0D0D0D] text-white" : "bg-[#F5F5F5] text-[#888888] border border-[#E8E8E8]"
                }`}>
                  {d.profile_live ? "Live" : "Inactive"}
                </span>
              </div>
            </div>
          ))}
          {data.recentDrivers.length === 0 && (
            <div className="px-5 py-8 text-center">
              <p className="text-[#888888] text-sm">No drivers yet.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
