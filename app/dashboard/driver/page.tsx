import { auth, currentUser } from "@clerk/nextjs/server";
import { neon } from "@neondatabase/serverless";
import Link from "next/link";
import { isTestDriver } from "@/lib/test-driver";

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

async function getActiveJobCount(driverId: string) {
  const sql = neon(process.env.DATABASE_URL!);
  const rows = await sql`
    SELECT COUNT(*) as count FROM jobs
    WHERE driver_id = ${driverId} AND status IN ('confirmed', 'in_progress')
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

  const completedJobs = driver ? await getCompletedJobCount(driver.id) : 0;
  const offeredJobs = driver ? await getOfferedJobCount(driver.id) : 0;
  const activeJobs = driver ? await getActiveJobCount(driver.id) : 0;

  const displayName = driver?.full_name ?? clerkName ?? "Driver";
  const isLive = driver?.profile_live === true;

  return (
    <div className="w-full max-w-2xl mx-auto px-4 sm:px-6 py-6 sm:py-10">

      <style>{`
        @keyframes pulse-dot {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.6; }
        }
        .pulse-indicator {
          animation: pulse-dot 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
      `}</style>

      {/* Overview card — identity & status */}
      {driver && (
        <div className="bg-white border border-[#E8E8E8] rounded-lg sm:rounded-2xl px-4 sm:px-5 py-4 space-y-3 mb-6 sm:mb-8">
          <div className="flex items-start justify-between gap-4 pb-3 border-b border-[#E8E8E8]">
            <div>
              <p className="text-[9px] sm:text-[10px] font-semibold text-[#888888] uppercase tracking-[0.2em] mb-1">Driver</p>
              <h1 className="font-sans font-black text-[#0D0D0D] text-2xl sm:text-3xl tracking-tight">
                {displayName.split(" ")[0]}.
              </h1>
            </div>
            {isTestDriver(email) && process.env.NODE_ENV === "development" && (
              <div className="bg-[#FFF3CD] border border-[#FFE082] text-[#856404] px-2.5 py-1 rounded text-[9px] sm:text-[10px] font-semibold flex-shrink-0">
                TEST
              </div>
            )}
          </div>

          <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-semibold ${
            isLive
              ? "bg-[#0D0D0D] border-[#0D0D0D] text-white"
              : "bg-[#F5F5F5] border-[#E8E8E8] text-[#888888]"
          }`}>
            <div className={`w-1.5 h-1.5 rounded-full ${isLive ? "bg-green-400 pulse-indicator" : "bg-[#888888]"}`} />
            {isLive ? "Live — accepting bookings" : "Profile inactive"}
          </div>

          <div className="grid grid-cols-2 gap-4 pt-3">
            <div>
              <p className="text-[#888888] text-xs uppercase tracking-[0.12em] mb-2">Rating</p>
              <p className="font-sans font-black text-[#0D0D0D] text-2xl tracking-tight">
                {driver?.rating_avg ? Number(driver.rating_avg).toFixed(1) : "—"}
              </p>
            </div>
            <div>
              <p className="text-[#888888] text-xs uppercase tracking-[0.12em] mb-2">Jobs done</p>
              <p className="font-sans font-black text-[#0D0D0D] text-2xl tracking-tight">{completedJobs}</p>
            </div>
          </div>

          {driver.area && (
            <div className="border-t border-[#E8E8E8] pt-3">
              <p className="text-[#888888] text-xs uppercase tracking-[0.12em] mb-1">Coverage</p>
              <p className="font-sans font-semibold text-[#0D0D0D] text-sm">{driver.area}</p>
            </div>
          )}

          {driver.vehicle_type && (
            <div className="border-t border-[#E8E8E8] pt-3">
              <p className="text-[#888888] text-xs uppercase tracking-[0.12em] mb-1">Vehicle</p>
              <p className="font-sans font-semibold text-[#0D0D0D] text-sm">{driver.vehicle_type}</p>
            </div>
          )}
        </div>
      )}

      {/* Jobs section — single source of truth */}
      <div className="bg-white border border-[#E8E8E8] rounded-lg sm:rounded-2xl p-4 sm:p-5 mb-6 sm:mb-8">
        <p className="text-[#888888] text-xs uppercase tracking-[0.12em] mb-4">Jobs</p>
        <div className="grid grid-cols-3 gap-3 mb-4">
          <Link href="/dashboard/driver/jobs" className="text-center hover:opacity-70 transition-opacity">
            <p className="font-sans font-black text-[#0D0D0D] text-lg sm:text-xl tracking-tight">{offeredJobs}</p>
            <p className="text-[#888888] text-[8px] sm:text-[10px] uppercase tracking-[0.12em] mt-1">Offered</p>
          </Link>
          <Link href="/dashboard/driver/jobs" className="text-center hover:opacity-70 transition-opacity">
            <p className="font-sans font-black text-[#0D0D0D] text-lg sm:text-xl tracking-tight">{activeJobs}</p>
            <p className="text-[#888888] text-[8px] sm:text-[10px] uppercase tracking-[0.12em] mt-1">Active</p>
          </Link>
          <Link href="/dashboard/driver/jobs" className="text-center hover:opacity-70 transition-opacity">
            <p className="font-sans font-black text-[#0D0D0D] text-lg sm:text-xl tracking-tight">{completedJobs}</p>
            <p className="text-[#888888] text-[8px] sm:text-[10px] uppercase tracking-[0.12em] mt-1">Done</p>
          </Link>
        </div>
        <Link href="/dashboard/driver/jobs" className="text-[#0D0D0D] text-xs inline-flex items-center gap-1 hover:underline">
          Show job details →
        </Link>
      </div>

      {/* Availability section */}
      {driver?.days_preference && (
        <div className="bg-white border border-[#E8E8E8] rounded-lg sm:rounded-2xl px-4 sm:px-5 py-4 mb-6 sm:mb-8">
          <p className="text-[#888888] text-xs uppercase tracking-[0.12em] mb-3">Availability</p>
          <p className="font-sans font-semibold text-[#0D0D0D] text-sm">{driver.days_preference}</p>
          <Link href="/dashboard/driver/availability" className="text-[#0D0D0D] text-xs mt-3 inline-flex items-center gap-1 hover:underline">
            Edit schedule →
          </Link>
        </div>
      )}

      {/* B2B Discovery section — optional revenue stream */}
      {driver && (
        <div className="bg-white border border-[#E8E8E8] rounded-lg sm:rounded-2xl px-4 sm:px-5 py-4 mb-6 sm:mb-8">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <p className="text-[#888888] text-xs uppercase tracking-[0.12em] mb-2">Recurring Business Contracts</p>
              <p className="font-sans font-semibold text-[#0D0D0D] text-sm mb-3">Earn from steady work with nearby businesses</p>
              {driver.b2b_opt_in && driver.postcode ? (
                <>
                  <p className="text-[#888888] text-xs mb-3">
                    Status: <span className="font-semibold text-[#0D0D0D]">Active</span> — Discovering in {driver.postcode} ({driver.radius_miles || 10} miles)
                  </p>
                  <Link href="/dashboard/driver/b2b" className="text-[#0D0D0D] text-xs inline-flex items-center gap-1 hover:underline font-medium">
                    View your opportunities →
                  </Link>
                </>
              ) : (
                <p className="text-[#888888] text-xs">
                  {driver.b2b_opt_in ? "Set up your postcode to get started" : "Enable to unlock recurring contracts from local businesses"}
                </p>
              )}
            </div>
            <div className={`w-12 h-6 rounded-full border-2 flex items-center px-1 flex-shrink-0 transition-colors cursor-not-allowed ${
              driver.b2b_opt_in
                ? "bg-[#0D0D0D] border-[#0D0D0D]"
                : "bg-[#F5F5F5] border-[#E8E8E8]"
            }`}>
              <div className={`w-4 h-4 rounded-full bg-white transition-transform ${driver.b2b_opt_in ? "translate-x-6" : ""}`} />
            </div>
          </div>
          <p className="text-[#888888] text-[10px] mt-3">Opt-in during signup. Change anytime from here.</p>
        </div>
      )}

      {/* Earnings section link */}
      <Link href="/dashboard/driver/earnings" className="bg-white border border-[#E8E8E8] rounded-lg sm:rounded-2xl px-4 sm:px-5 py-4 text-center hover:border-[#0D0D0D] transition-colors">
        <p className="text-[#888888] text-xs uppercase tracking-[0.12em] mb-2">Earnings</p>
        <p className="font-sans font-semibold text-[#0D0D0D] text-sm">View earnings & payouts →</p>
      </Link>

      {!driver && (
        <div className="bg-[#F5F5F5] border border-[#E8E8E8] rounded-lg sm:rounded-2xl px-4 sm:px-5 py-4 sm:py-5 text-center">
          <p className="text-[#888888] text-sm mb-3">No driver profile found for this account.</p>
          <p className="text-[#888888] text-xs">Make sure you registered with this email address.</p>
        </div>
      )}

    </div>
  );
}
