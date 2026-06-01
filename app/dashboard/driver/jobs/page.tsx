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

interface FomoData {
  jobsCount: number;
  totalValue: number;
  avgPrice: number;
  previewJobs: { service_type: string; postcode_from: string; postcode_to: string | null; price: number; timeframe: string | null; duration: string | null }[];
}

async function getFomoData(): Promise<FomoData> {
  if (!process.env.DATABASE_URL) {
    return { jobsCount: 0, totalValue: 0, avgPrice: 150, previewJobs: [] };
  }
  const sql = neon(process.env.DATABASE_URL);

  const [statsRows, previewRows] = await Promise.all([
    // Real platform stats: completed jobs + earnings in last 7 days
    sql`
      SELECT
        COUNT(*)::int as jobs_count,
        COALESCE(ROUND(AVG(price)::numeric, 0), 150)::int as avg_price,
        COALESCE(ROUND(SUM(price)::numeric, 0), 0)::int as total_value
      FROM jobs
      WHERE status = 'completed'
        AND updated_at > NOW() - INTERVAL '7 days'
        AND price IS NOT NULL
    `,
    // 2 most recent completed jobs as the blurred preview cards (safe — already done)
    sql`
      SELECT service_type, postcode_from, postcode_to, price, timeframe, duration
      FROM jobs
      WHERE status = 'completed'
        AND price IS NOT NULL
        AND updated_at > NOW() - INTERVAL '30 days'
      ORDER BY updated_at DESC
      LIMIT 2
    `,
  ]);

  return {
    jobsCount: Number(statsRows[0]?.jobs_count ?? 0),
    avgPrice: Number(statsRows[0]?.avg_price ?? 150),
    totalValue: Number(statsRows[0]?.total_value ?? 0),
    previewJobs: previewRows as FomoData["previewJobs"],
  };
}

function FomoCard({ job, dark }: { job: FomoData["previewJobs"][number]; dark: boolean }) {
  if (dark) {
    return (
      <div className="rounded-2xl p-5 border bg-[#0D0D0D] border-[#0D0D0D] opacity-50 blur-[2px]">
        <div className="flex items-start justify-between gap-3 mb-4">
          <div>
            <p className="font-sans font-bold text-white text-sm">{job.service_type || "Removal"}</p>
            <p className="text-white/60 text-xs">
              {job.postcode_from}{job.postcode_to ? ` → ${job.postcode_to}` : ""}
            </p>
          </div>
          <span className="text-[10px] font-semibold px-2.5 py-1 rounded-full uppercase bg-white/15 text-white shrink-0">
            Offered to you
          </span>
        </div>
        <div className="flex flex-wrap gap-4 mb-5">
          {job.timeframe && (
            <div>
              <p className="text-[10px] text-white/50 uppercase tracking-[0.1em]">Timeframe</p>
              <p className="text-white/90 text-sm font-medium">{job.timeframe}</p>
            </div>
          )}
          {job.duration && (
            <div>
              <p className="text-[10px] text-white/50 uppercase tracking-[0.1em]">Duration</p>
              <p className="text-white/90 text-sm font-medium">{job.duration}</p>
            </div>
          )}
          <div>
            <p className="text-[10px] text-white/50 uppercase tracking-[0.1em]">Price</p>
            <p className="font-sans font-black text-white text-sm">£{job.price}</p>
          </div>
        </div>
        <div className="flex gap-2 border-t border-white/15 pt-4">
          <div className="flex-1 h-9 bg-white/20 rounded-full" />
          <div className="w-20 h-9 bg-white/10 rounded-full border border-white/20" />
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl p-5 border bg-white border-[#E8E8E8] opacity-50 blur-[2px]">
      <div className="flex items-start justify-between gap-3 mb-4">
        <div>
          <p className="font-sans font-bold text-[#0D0D0D] text-sm">{job.service_type || "Removal"}</p>
          <p className="text-[#888888] text-xs">
            {job.postcode_from}{job.postcode_to ? ` → ${job.postcode_to}` : ""}
          </p>
        </div>
        <span className="text-[10px] font-semibold px-2.5 py-1 rounded-full uppercase bg-[#F5F5F5] text-[#888888] border border-[#E8E8E8] shrink-0">
          Confirmed
        </span>
      </div>
      <div className="flex flex-wrap gap-4">
        <div>
          <p className="text-[10px] text-[#888888] uppercase tracking-[0.1em]">Price</p>
          <p className="font-sans font-black text-[#0D0D0D] text-sm">£{job.price}</p>
        </div>
        {job.duration && (
          <div>
            <p className="text-[10px] text-[#888888] uppercase tracking-[0.1em]">Duration</p>
            <p className="text-[#0D0D0D] text-sm font-medium">{job.duration}</p>
          </div>
        )}
      </div>
    </div>
  );
}

// Fallback static cards when no DB jobs exist yet
function StaticFomoCards() {
  return (
    <>
      <div className="rounded-2xl p-5 border bg-[#0D0D0D] border-[#0D0D0D] opacity-50 blur-[2px]">
        <div className="flex items-start justify-between gap-3 mb-4">
          <div>
            <p className="font-sans font-bold text-white text-sm">Home removal</p>
            <p className="text-white/60 text-xs">Local area · 4 mi</p>
          </div>
          <span className="text-[10px] font-semibold px-2.5 py-1 rounded-full uppercase bg-white/15 text-white">Offered</span>
        </div>
        <div className="flex gap-4 mb-5">
          <div><p className="text-[10px] text-white/50 uppercase tracking-[0.1em]">Price</p><p className="font-sans font-black text-white text-sm">£185</p></div>
          <div><p className="text-[10px] text-white/50 uppercase tracking-[0.1em]">Duration</p><p className="text-white/90 text-sm font-medium">Half day</p></div>
        </div>
        <div className="flex gap-2 border-t border-white/15 pt-4">
          <div className="flex-1 h-9 bg-white/20 rounded-full" />
          <div className="w-20 h-9 bg-white/10 rounded-full border border-white/20" />
        </div>
      </div>
      <div className="rounded-2xl p-5 border bg-white border-[#E8E8E8] opacity-50 blur-[2px]">
        <div className="flex items-start justify-between gap-3 mb-4">
          <div>
            <p className="font-sans font-bold text-[#0D0D0D] text-sm">Office move</p>
            <p className="text-[#888888] text-xs">Local area · 3 mi</p>
          </div>
          <span className="text-[10px] font-semibold px-2.5 py-1 rounded-full uppercase bg-[#F5F5F5] text-[#888888] border border-[#E8E8E8]">Confirmed</span>
        </div>
        <div className="flex gap-4">
          <div><p className="text-[10px] text-[#888888] uppercase tracking-[0.1em]">Price</p><p className="font-sans font-black text-[#0D0D0D] text-sm">£240</p></div>
          <div><p className="text-[10px] text-[#888888] uppercase tracking-[0.1em]">Duration</p><p className="text-[#0D0D0D] text-sm font-medium">Full day</p></div>
        </div>
      </div>
    </>
  );
}

function FomoPreview({ data }: { data: FomoData }) {
  const hasRealJobs = data.previewJobs.length >= 2;
  const hasStats = data.jobsCount > 0;

  return (
    <div className="relative">
      {/* Blurred job cards */}
      <div className="space-y-3 pointer-events-none select-none">
        {hasRealJobs ? (
          <>
            <FomoCard job={data.previewJobs[0]} dark={true} />
            <FomoCard job={data.previewJobs[1]} dark={false} />
          </>
        ) : (
          <StaticFomoCards />
        )}
      </div>

      {/* FOMO overlay */}
      <div className="absolute inset-0 flex items-center justify-center px-4">
        <div className="bg-white/93 backdrop-blur-md rounded-2xl px-6 py-8 text-center border border-[#E8E8E8] w-full max-w-xs">
          {hasStats ? (
            <>
              <p className="font-sans font-black text-[#0D0D0D] text-3xl tracking-tight">
                £{data.totalValue.toLocaleString()}
              </p>
              <p className="text-[#888888] text-xs uppercase tracking-[0.15em] mt-1 mb-4">
                paid to drivers this week
              </p>
              <p className="text-[#0D0D0D] text-sm font-semibold mb-1">
                {data.jobsCount} job{data.jobsCount !== 1 ? "s" : ""} completed.
              </p>
              <p className="text-[#888888] text-sm mb-6">
                You weren&apos;t available for any of them.
              </p>
            </>
          ) : (
            <>
              <p className="font-sans font-black text-[#0D0D0D] text-xl tracking-tight mb-2">
                Jobs are coming in.
              </p>
              <p className="text-[#888888] text-sm mb-6">
                Drivers on our platform earn an average of £{data.avgPrice} per job. Go live to start taking bookings in your area.
              </p>
            </>
          )}
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

  const [myJobs, fomoData] = await Promise.all([
    isLive && driver ? getMyJobs(driver.id) : Promise.resolve([]),
    !isLive ? getFomoData() : Promise.resolve(null),
  ]);

  return (
    <div className="max-w-2xl mx-auto px-6 py-10">
      <p className="text-[10px] font-semibold text-[#888888] uppercase tracking-[0.2em] mb-1">Jobs</p>
      <h1 className="font-sans font-black text-[#0D0D0D] text-3xl tracking-tight mb-8">
        Y<span className="font-display italic font-normal">o</span>ur jobs.
      </h1>

      {!isLive && fomoData ? (
        <FomoPreview data={fomoData} />
      ) : (
        <JobsFeed
          driverId={driver?.id ?? null}
          myJobs={myJobs as Record<string, unknown>[]}
        />
      )}
    </div>
  );
}
