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

export default async function JobsPage() {
  const { userId } = await auth();
  if (!userId || !process.env.DATABASE_URL) return null;

  const driver = await getDriver(userId);
  const myJobs = driver ? await getMyJobs(driver.id) : [];

  return (
    <div className="max-w-2xl mx-auto px-6 py-10">
      <p className="text-[10px] font-semibold text-[#888888] uppercase tracking-[0.2em] mb-1">Jobs</p>
      <h1 className="font-sans font-black text-[#0D0D0D] text-3xl tracking-tight mb-8">
        Y<span className="font-display italic font-normal">o</span>ur jobs.
      </h1>

      <JobsFeed
        driverId={driver?.id ?? null}
        myJobs={myJobs as Record<string, unknown>[]}
      />
    </div>
  );
}
