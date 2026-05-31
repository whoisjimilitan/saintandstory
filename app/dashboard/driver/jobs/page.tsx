import { auth } from "@clerk/nextjs/server";
import { neon } from "@neondatabase/serverless";
import JobsFeed from "@/components/JobsFeed";

async function getDriver(clerkUserId: string) {
  const sql = neon(process.env.DATABASE_URL!);
  const rows = await sql`SELECT * FROM drivers WHERE clerk_user_id = ${clerkUserId} LIMIT 1`;
  return rows[0] ?? null;
}

async function getAvailableJobs(area: string) {
  const sql = neon(process.env.DATABASE_URL!);
  const keyword = "%" + area.toLowerCase().split(" ")[0] + "%";
  const rows = await sql`
    SELECT * FROM jobs
    WHERE status = 'new' AND driver_id IS NULL
      AND (LOWER(postcode_from) LIKE ${keyword} OR LOWER(postcode_to) LIKE ${keyword} OR LOWER(customer_name) LIKE ${keyword})
    ORDER BY created_at DESC
    LIMIT 30
  `;
  return rows;
}

async function getMyJobs(driverId: string) {
  const sql = neon(process.env.DATABASE_URL!);
  const rows = await sql`
    SELECT * FROM jobs
    WHERE driver_id = ${driverId}
    ORDER BY created_at DESC
    LIMIT 30
  `;
  return rows;
}

export default async function JobsPage() {
  const { userId } = await auth();
  if (!userId || !process.env.DATABASE_URL) return null;

  const driver = await getDriver(userId);
  const availableJobs = driver ? await getAvailableJobs(driver.area ?? "") : [];
  const myJobs = driver ? await getMyJobs(driver.id) : [];

  return (
    <div className="max-w-2xl mx-auto px-6 py-10">
      <p className="text-[10px] font-semibold text-[#888888] uppercase tracking-[0.2em] mb-1">Jobs</p>
      <h1 className="font-sans font-black text-[#0D0D0D] text-3xl tracking-tight mb-8">
        Y<span className="font-display italic font-normal">o</span>ur area.
      </h1>

      <JobsFeed
        driverId={driver?.id ?? null}
        availableJobs={availableJobs as Record<string, unknown>[]}
        myJobs={myJobs as Record<string, unknown>[]}
      />
    </div>
  );
}
