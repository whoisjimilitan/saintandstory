import { auth, currentUser } from "@clerk/nextjs/server";
import { neon } from "@neondatabase/serverless";
import Link from "next/link";

async function getOrCreateDriver(clerkUserId: string, email: string) {
  const sql = neon(process.env.DATABASE_URL!);

  // Try match by clerk_user_id first, then by email (first-login link)
  let rows = await sql`SELECT * FROM drivers WHERE clerk_user_id = ${clerkUserId} LIMIT 1`;

  if (!rows.length && email) {
    rows = await sql`SELECT * FROM drivers WHERE email = ${email} LIMIT 1`;
    if (rows.length) {
      await sql`UPDATE drivers SET clerk_user_id = ${clerkUserId}, updated_at = NOW() WHERE email = ${email}`;
    }
  }

  return rows[0] ?? null;
}

async function getMonthEarnings(driverId: string) {
  const sql = neon(process.env.DATABASE_URL!);
  const rows = await sql`
    SELECT COALESCE(SUM(amount), 0) as total
    FROM earnings
    WHERE driver_id = ${driverId}
      AND DATE_TRUNC('month', created_at) = DATE_TRUNC('month', NOW())
  `;
  return Number(rows[0]?.total ?? 0);
}

async function getCompletedJobCount(driverId: string) {
  const sql = neon(process.env.DATABASE_URL!);
  const rows = await sql`
    SELECT COUNT(*) as count FROM jobs
    WHERE driver_id = ${driverId} AND status = 'completed'
  `;
  return Number(rows[0]?.count ?? 0);
}

async function getOfferedJobCount(driverId: string) {
  const sql = neon(process.env.DATABASE_URL!);
  const rows = await sql`
    SELECT COUNT(*) as count FROM jobs
    WHERE driver_id = ${driverId} AND status = 'offered'
  `;
  return Number(rows[0]?.count ?? 0);
}

export default async function DriverDashboardHome() {
  const { userId } = await auth();
  const user = await currentUser();

  if (!userId || !process.env.DATABASE_URL) {
    return <div className="p-8 text-[#888888] text-sm">Loading…</div>;
  }

  const email = user?.emailAddresses[0]?.emailAddress ?? "";
  const clerkName = [user?.firstName, user?.lastName].filter(Boolean).join(" ");
  const driver = await getOrCreateDriver(userId, email);

  const monthEarned = driver ? await getMonthEarnings(driver.id) : 0;
  const completedJobs = driver ? await getCompletedJobCount(driver.id) : 0;
  const offeredJobs = driver ? await getOfferedJobCount(driver.id) : 0;
  const roi = monthEarned > 0 ? Math.round(monthEarned / 9.99) : 0;

  const displayName = driver?.full_name ?? clerkName ?? "Driver";
  const isLive = driver?.profile_live === true;

  return (
    <div className="max-w-2xl mx-auto px-6 py-10">

      {/* Header */}
      <div className="mb-8">
        <p className="text-[10px] font-semibold text-[#888888] uppercase tracking-[0.2em] mb-1">Driver dashboard</p>
        <h1 className="font-sans font-black text-[#0D0D0D] text-3xl tracking-tight">
          {displayName.split(" ")[0]}.
        </h1>
      </div>

      {/* Status pill */}
      <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-semibold mb-8 ${
        isLive
          ? "bg-[#0D0D0D] border-[#0D0D0D] text-white"
          : "bg-[#F5F5F5] border-[#E8E8E8] text-[#888888]"
      }`}>
        <div className={`w-1.5 h-1.5 rounded-full ${isLive ? "bg-green-400" : "bg-[#888888]"}`} />
        {isLive ? "Live — accepting bookings" : "Profile inactive"}
      </div>

      {/* ROI counter — main event */}
      <div className="bg-[#0D0D0D] rounded-2xl px-6 py-7 mb-4">
        <p className="text-[10px] text-white/65 uppercase tracking-[0.2em] mb-4">This month</p>
        <div className="flex items-end justify-between mb-5">
          <div>
            <p className="font-sans font-black text-white text-5xl tracking-tight">£{monthEarned.toFixed(0)}</p>
            <p className="text-white/70 text-xs uppercase tracking-[0.12em] mt-1">earned</p>
          </div>
          <div className="text-right">
            <p className="font-sans font-black text-white text-2xl tracking-tight">£9.99</p>
            <p className="text-white/70 text-xs uppercase tracking-[0.12em] mt-0.5">per month</p>
            <p className="text-white/45 text-[10px] tracking-[0.08em]">founding rate</p>
          </div>
        </div>
        {roi > 0 && (
          <div className="border-t border-white/15 pt-4">
            <p className="font-sans font-black text-white text-lg tracking-tight">
              {roi}× your monthly fee.
            </p>
            <p className="text-white/70 text-xs mt-1">Every job from here is pure profit.</p>
          </div>
        )}
        {roi === 0 && (
          <div className="border-t border-white/15 pt-4">
            <p className="text-white/70 text-xs">Complete your first job to see your ROI here.</p>
          </div>
        )}
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-3 gap-3 mb-8">
        <div className="bg-white border border-[#E8E8E8] rounded-2xl px-4 py-4 text-center">
          <p className="font-sans font-black text-[#0D0D0D] text-2xl tracking-tight">{completedJobs}</p>
          <p className="text-[#888888] text-[10px] uppercase tracking-[0.12em] mt-1">Jobs done</p>
        </div>
        <div className="bg-white border border-[#E8E8E8] rounded-2xl px-4 py-4 text-center">
          <p className="font-sans font-black text-[#0D0D0D] text-2xl tracking-tight">
            {driver?.rating_avg ? Number(driver.rating_avg).toFixed(1) : "—"}
          </p>
          <p className="text-[#888888] text-[10px] uppercase tracking-[0.12em] mt-1">Rating</p>
        </div>
        <Link href="/dashboard/driver/jobs" className="bg-white border border-[#E8E8E8] rounded-2xl px-4 py-4 text-center hover:border-[#0D0D0D] transition-colors">
          <p className="font-sans font-black text-[#0D0D0D] text-2xl tracking-tight">{offeredJobs}</p>
          <p className="text-[#888888] text-[10px] uppercase tracking-[0.12em] mt-1">Offered</p>
        </Link>
      </div>

      {/* Driver details */}
      {driver && (
        <div className="bg-white border border-[#E8E8E8] rounded-2xl px-5 py-4 space-y-3">
          {driver.area && (
            <div className="flex items-center justify-between">
              <p className="text-[#888888] text-xs uppercase tracking-[0.12em]">Covering</p>
              <p className="font-sans font-semibold text-[#0D0D0D] text-sm">{driver.area}</p>
            </div>
          )}
          {driver.vehicle_type && (
            <div className="flex items-center justify-between border-t border-[#E8E8E8] pt-3">
              <p className="text-[#888888] text-xs uppercase tracking-[0.12em]">Vehicle</p>
              <p className="font-sans font-semibold text-[#0D0D0D] text-sm">{driver.vehicle_type}</p>
            </div>
          )}
          {driver.days_preference && (
            <div className="flex items-center justify-between border-t border-[#E8E8E8] pt-3">
              <p className="text-[#888888] text-xs uppercase tracking-[0.12em]">Availability</p>
              <p className="font-sans font-semibold text-[#0D0D0D] text-sm">{driver.days_preference}</p>
            </div>
          )}
        </div>
      )}

      {!driver && (
        <div className="bg-[#F5F5F5] border border-[#E8E8E8] rounded-2xl px-5 py-5 text-center">
          <p className="text-[#888888] text-sm mb-3">No driver profile found for this account.</p>
          <p className="text-[#888888] text-xs">Make sure you registered with this email address.</p>
        </div>
      )}

    </div>
  );
}
