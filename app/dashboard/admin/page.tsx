import { auth, currentUser } from "@clerk/nextjs/server";
import { neon } from "@neondatabase/serverless";
import { redirect } from "next/navigation";
import AdminPanel from "@/components/AdminPanel";
import IndexNowButton from "@/components/IndexNowButton";
import AdminAutoRefresh from "@/components/AdminAutoRefresh";

const ADMIN_EMAILS = ["whoisjimi.today@gmail.com", "oye.van@outlook.com"];
const ADMIN_USER_IDS = ["user_3EVExeiSBmgdhAWGzMEb8GMVc62"];

async function getPendingJobs() {
  const sql = neon(process.env.DATABASE_URL!);
  return await sql`
    SELECT * FROM jobs
    WHERE status = 'pending_review'
    ORDER BY created_at DESC
    LIMIT 50
  ` as Record<string, unknown>[];
}

async function getOfferedJobs() {
  const sql = neon(process.env.DATABASE_URL!);
  return await sql`
    SELECT j.*, d.full_name as driver_name, d.phone as driver_phone
    FROM jobs j
    LEFT JOIN drivers d ON d.id = j.driver_id
    WHERE j.status = 'offered'
    ORDER BY j.created_at DESC
    LIMIT 20
  ` as Record<string, unknown>[];
}

async function getCompletedJobs() {
  const sql = neon(process.env.DATABASE_URL!);
  return await sql`
    SELECT j.*, d.full_name as driver_name
    FROM jobs j
    LEFT JOIN drivers d ON d.id = j.driver_id
    WHERE j.status = 'completed'
    ORDER BY j.updated_at DESC
    LIMIT 30
  ` as Record<string, unknown>[];
}

async function getConfirmedJobs() {
  const sql = neon(process.env.DATABASE_URL!);
  return await sql`
    SELECT j.*, d.full_name as driver_name, d.phone as driver_phone
    FROM jobs j
    LEFT JOIN drivers d ON d.id = j.driver_id
    WHERE j.status = 'confirmed'
    ORDER BY j.updated_at DESC
  ` as Record<string, unknown>[];
}

async function getInProgressJobs() {
  const sql = neon(process.env.DATABASE_URL!);
  return await sql`
    SELECT j.*, d.full_name as driver_name, d.phone as driver_phone
    FROM jobs j
    LEFT JOIN drivers d ON d.id = j.driver_id
    WHERE j.status = 'in_progress'
    ORDER BY j.updated_at DESC
  ` as Record<string, unknown>[];
}

async function getActiveDrivers() {
  const sql = neon(process.env.DATABASE_URL!);
  return await sql`
    SELECT id, full_name, area, vehicle_type, phone, rating_avg, rating_count, last_seen_at
    FROM drivers
    WHERE profile_live = true
    ORDER BY last_seen_at DESC NULLS LAST, rating_avg DESC NULLS LAST, full_name ASC
  ` as Record<string, unknown>[];
}

export default async function AdminPage() {
  const { userId } = await auth();
  const user = await currentUser();

  if (!userId) redirect("/sign-in");

  const email = user?.emailAddresses[0]?.emailAddress ?? "";
  if (!ADMIN_EMAILS.includes(email) && !ADMIN_USER_IDS.includes(userId ?? "")) redirect("/dashboard/driver");

  const [pendingJobs, offeredJobs, confirmedJobs, inProgressJobs, drivers, completedJobs] = await Promise.all([
    getPendingJobs(),
    getOfferedJobs(),
    getConfirmedJobs(),
    getInProgressJobs(),
    getActiveDrivers(),
    getCompletedJobs(),
  ]);

  const onlineCount = drivers.filter((d) => {
    const t = d.last_seen_at as string | null;
    return t && Date.now() - new Date(t).getTime() < 5 * 60 * 1000;
  }).length;

  const stats = [
    inProgressJobs.length > 0 && `${inProgressJobs.length} en route`,
    pendingJobs.length > 0 && `${pendingJobs.length} order${pendingJobs.length !== 1 ? "s" : ""}`,
    offeredJobs.length > 0 && `${offeredJobs.length} awaiting`,
    confirmedJobs.length > 0 && `${confirmedJobs.length} confirmed`,
    `${onlineCount} online`,
  ].filter(Boolean).join(" · ");

  return (
    <div className="max-w-3xl mx-auto px-6 py-10">
      <AdminAutoRefresh />
      <p className="text-[10px] font-semibold text-[#888888] uppercase tracking-[0.2em] mb-1">Admin</p>
      <h1 className="font-sans font-black text-[#0D0D0D] text-3xl tracking-tight mb-2">
        Dashboard.
      </h1>
      <div className="flex items-center justify-between mb-8">
        <p className="text-[#888888] text-sm">{stats}</p>
        <IndexNowButton />
      </div>

      <AdminPanel
        pendingJobs={pendingJobs}
        offeredJobs={offeredJobs}
        confirmedJobs={confirmedJobs}
        inProgressJobs={inProgressJobs}
        drivers={drivers}
        completedJobs={completedJobs}
      />
    </div>
  );
}
