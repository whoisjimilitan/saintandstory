import { auth } from "@clerk/nextjs/server";
import { neon } from "@neondatabase/serverless";
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
  previewJobs: {
    service_type: string;
    postcode_from: string;
    postcode_to: string | null;
    price: number;
    timeframe: string | null;
    duration: string | null;
  }[];
}

async function getFomoData(): Promise<FomoData> {
  if (!process.env.DATABASE_URL) {
    return { jobsCount: 0, totalValue: 0, avgPrice: 150, previewJobs: [] };
  }
  const sql = neon(process.env.DATABASE_URL);

  const [statsRows, previewRows] = await Promise.all([
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

function FomoPreview({ data }: { data: FomoData }) {
  const hasStats = data.jobsCount > 0;
  const hasRealJobs = data.previewJobs.length > 0;

  const fallbackJobs = [
    { service_type: "Home removal", postcode_from: "Local area", postcode_to: null, price: 185, timeframe: "This week", duration: "Half day" },
    { service_type: "Office move", postcode_from: "Local area", postcode_to: null, price: 240, timeframe: "This week", duration: "Full day" },
  ];

  const displayJobs = hasRealJobs ? data.previewJobs : fallbackJobs;

  return (
    <div className="space-y-4">

      {/* Stats bar */}
      {hasStats && (
        <div className="bg-[#0D0D0D] rounded-2xl px-5 py-4 flex items-center justify-between">
          <div>
            <p className="font-sans font-black text-white text-2xl tracking-tight">
              £{data.totalValue.toLocaleString()}
            </p>
            <p className="text-white/55 text-xs mt-0.5">
              paid to drivers this week · {data.jobsCount} job{data.jobsCount !== 1 ? "s" : ""}
            </p>
          </div>
          <p className="text-white/40 text-xs text-right max-w-[120px] leading-relaxed">
            None of it was yours.
          </p>
        </div>
      )}

      {/* Real completed job records */}
      <div>
        <p className="text-[10px] font-semibold text-[#888888] uppercase tracking-[0.2em] mb-3">
          {hasRealJobs ? "Recently completed on the platform" : "Jobs like these happen every week"}
        </p>
        <div className="space-y-2">
          {displayJobs.map((job, i) => (
            <div key={i} className="bg-white border border-[#E8E8E8] rounded-2xl px-5 py-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-sans font-bold text-[#0D0D0D] text-sm">{job.service_type || "Removal"}</p>
                  <p className="text-[#888888] text-xs mt-0.5">
                    {job.postcode_from}{job.postcode_to ? ` → ${job.postcode_to}` : ""}
                    {job.duration ? ` · ${job.duration}` : ""}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <p className="font-sans font-black text-[#0D0D0D] text-base">£{Number(job.price).toFixed(2)}</p>
                  <span className="text-[10px] font-semibold text-[#888888] uppercase tracking-[0.1em]">
                    Completed
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Subscription CTA */}
      <div className="bg-[#0D0D0D] rounded-2xl px-5 py-6">
        <p className="font-sans font-black text-white text-lg tracking-tight mb-1">
          Go live. Take the next one.
        </p>
        <p className="text-white/60 text-sm mb-5">
          {hasStats
            ? `Avg. job on our platform: £${data.avgPrice}. Your fee: £9.99/month. First booking covers it.`
            : "£9.99/month. Keep 100% of every job. First booking covers the month."}
        </p>

        <div className="space-y-2.5 mb-5">
          {[
            "Keep 100% of every job",
            "Your profile live 24/7 in your area",
            "Paid within the hour",
            "Founding rate — locked forever",
          ].map((f) => (
            <div key={f} className="flex items-center gap-2.5">
              <div className="w-1 h-1 rounded-full bg-white/40 shrink-0" />
              <p className="text-white/70 text-sm">{f}</p>
            </div>
          ))}
        </div>

        {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
        <a
          href="/api/stripe/checkout"
          className="block w-full bg-white hover:bg-[#F5F5F5] text-[#0D0D0D] font-semibold py-3.5 rounded-full text-sm transition-colors text-center"
        >
          Go live — £9.99/month →
        </a>
        <p className="text-white/35 text-xs text-center mt-3">
          Cancel anytime. Founding rate locked forever.
        </p>
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
        H<span className="font-display italic font-normal">i</span>story.
      </h1>

      {!isLive && fomoData ? (
        <FomoPreview data={fomoData} />
      ) : (
        <JobsFeed
          driverId={driver?.id ?? null}
          myJobs={myJobs as Record<string, unknown>[]}
          driverName={driver?.full_name}
        />
      )}
    </div>
  );
}
