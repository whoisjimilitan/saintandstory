import { auth } from "@clerk/nextjs/server";
import { neon } from "@neondatabase/serverless";
import ActiveJobsList from "@/components/ActiveJobsList";

async function getDriver(clerkUserId: string) {
  const sql = neon(process.env.DATABASE_URL!);
  const rows = await sql`SELECT * FROM drivers WHERE clerk_user_id = ${clerkUserId} LIMIT 1`;
  return rows[0] ?? null;
}

async function getActiveJobs(driverId: string) {
  const sql = neon(process.env.DATABASE_URL!);
  const rows = await sql`
    SELECT * FROM jobs
    WHERE driver_id = ${driverId}
      AND status IN ('confirmed', 'in_progress')
    ORDER BY
      CASE status
        WHEN 'in_progress' THEN 1
        WHEN 'confirmed' THEN 2
        ELSE 3
      END,
      confirmed_at DESC
    LIMIT 50
  `;
  return rows;
}

export default async function ActiveJobsPage() {
  const { userId } = await auth();
  if (!userId || !process.env.DATABASE_URL) return null;

  const driver = await getDriver(userId);
  const activeJobs = driver ? await getActiveJobs(driver.id) : [];

  return (
    <div>
      <div className="max-w-2xl mx-auto px-6 py-10">
        <p className="text-[10px] font-semibold text-[#888888] uppercase tracking-[0.2em] mb-1">Active Jobs</p>
        <h1 className="font-sans font-black text-[#0D0D0D] text-3xl tracking-tight mb-8">
          Y<span className="font-display italic font-normal">o</span>ur jobs.
        </h1>
      </div>
      <ActiveJobsList jobs={activeJobs as any[]} driverId={driver?.id ?? null} driverName={driver?.full_name} />
    </div>
  );
}
