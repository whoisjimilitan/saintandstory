import { auth } from "@clerk/nextjs/server";
import { neon } from "@neondatabase/serverless";
import Link from "next/link";
import JobsFeed from "@/components/JobsFeed";

async function getDriver(clerkUserId: string) {
  const sql = neon(process.env.DATABASE_URL!);
  const rows = await sql`SELECT * FROM drivers WHERE clerk_user_id = ${clerkUserId} LIMIT 1`;
  return rows[0] ?? null;
}

async function getMyJobs(driverId: string) {
  const sql = neon(process.env.DATABASE_URL!);
  const rows = await sql`
    SELECT * FROM jobs
    WHERE driver_id = ${driverId}
      AND status != 'pending_review'
    ORDER BY
      CASE status
        WHEN 'offered' THEN 1
        WHEN 'in_progress' THEN 2
        WHEN 'confirmed' THEN 3
        WHEN 'completed' THEN 4
        ELSE 5
      END,
      created_at DESC
    LIMIT 50
  `;
  return rows;
}

function FomoPreview() {
  return (
    <div className="relative">
      {/* Blurred fake job cards */}
      <div className="space-y-3 pointer-events-none select-none">
        {/* Fake offered card */}
        <div className="rounded-2xl p-5 border bg-[#0D0D0D] border-[#0D0D0D] opacity-50 blur-[2px]">
          <div className="flex items-start justify-between gap-3 mb-4">
            <div>
              <p className="font-sans font-bold text-white text-sm">Home removal</p>
              <p className="text-white/60 text-xs">E2 4RH → SW11 3AA · 5 mi</p>
            </div>
            <span className="text-[10px] font-semibold px-2.5 py-1 rounded-full uppercase bg-white/15 text-white">
              Offered to you
            </span>
          </div>
          <div className="flex flex-wrap gap-4 mb-5">
            <div>
              <p className="text-[10px] text-white/50 uppercase tracking-[0.1em]">Timeframe</p>
              <p className="text-white/90 text-sm font-medium">This week</p>
            </div>
            <div>
              <p className="text-[10px] text-white/50 uppercase tracking-[0.1em]">Duration</p>
              <p className="text-white/90 text-sm font-medium">Half day</p>
            </div>
            <div>
              <p className="text-[10px] text-white/50 uppercase tracking-[0.1em]">Price</p>
              <p className="font-sans font-black text-white text-sm">£185</p>
            </div>
          </div>
          <div className="flex gap-2 border-t border-white/15 pt-4">
            <div className="flex-1 h-9 bg-white/20 rounded-full" />
            <div className="w-20 h-9 bg-white/10 rounded-full border border-white/20" />
          </div>
        </div>

        {/* Fake confirmed card */}
        <div className="rounded-2xl p-5 border bg-white border-[#E8E8E8] opacity-50 blur-[2px]">
          <div className="flex items-start justify-between gap-3 mb-4">
            <div>
              <p className="font-sans font-bold text-[#0D0D0D] text-sm">Office move</p>
              <p className="text-[#888888] text-xs">N1 9GU → EC1A 1BB · 3 mi</p>
            </div>
            <span className="text-[10px] font-semibold px-2.5 py-1 rounded-full uppercase bg-[#F5F5F5] text-[#888888] border border-[#E8E8E8]">
              Confirmed
            </span>
          </div>
          <div className="flex flex-wrap gap-4">
            <div>
              <p className="text-[10px] text-[#888888] uppercase tracking-[0.1em]">Price</p>
              <p className="font-sans font-black text-[#0D0D0D] text-sm">£240</p>
            </div>
            <div>
              <p className="text-[10px] text-[#888888] uppercase tracking-[0.1em]">Duration</p>
              <p className="text-[#0D0D0D] text-sm font-medium">Full day</p>
            </div>
          </div>
        </div>
      </div>

      {/* FOMO overlay */}
      <div className="absolute inset-0 flex items-center justify-center px-4">
        <div className="bg-white/92 backdrop-blur-md rounded-2xl px-6 py-8 text-center border border-[#E8E8E8] w-full max-w-xs">
          <div className="w-10 h-10 rounded-full bg-[#0D0D0D] flex items-center justify-center mx-auto mb-4">
            <svg className="w-4 h-4 text-white" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
            </svg>
          </div>
          <p className="font-sans font-black text-[#0D0D0D] text-lg tracking-tight mb-1">
            Jobs are coming in.
          </p>
          <p className="text-[#888888] text-sm leading-relaxed mb-6">
            Go live for £9.99/month to start accepting bookings in your area.
          </p>
          <Link
            href="/dashboard/driver/earnings"
            className="block w-full bg-[#0D0D0D] hover:bg-[#333333] text-white font-semibold py-3 rounded-full text-sm transition-colors text-center"
          >
            Go live — £9.99/month →
          </Link>
          <p className="text-[#888888] text-xs mt-3">First booking covers the month.</p>
        </div>
      </div>
    </div>
  );
}

export default async function JobsPage() {
  const { userId } = await auth();
  if (!userId || !process.env.DATABASE_URL) return null;

  const driver = await getDriver(userId);
  const isLive = driver?.profile_live === true;
  const myJobs = isLive && driver ? await getMyJobs(driver.id) : [];

  return (
    <div className="max-w-2xl mx-auto px-6 py-10">
      <p className="text-[10px] font-semibold text-[#888888] uppercase tracking-[0.2em] mb-1">Jobs</p>
      <h1 className="font-sans font-black text-[#0D0D0D] text-3xl tracking-tight mb-8">
        Y<span className="font-display italic font-normal">o</span>ur jobs.
      </h1>

      {!isLive ? (
        <FomoPreview />
      ) : (
        <JobsFeed
          driverId={driver?.id ?? null}
          myJobs={myJobs as Record<string, unknown>[]}
        />
      )}
    </div>
  );
}
