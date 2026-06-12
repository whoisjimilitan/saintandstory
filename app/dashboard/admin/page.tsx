import { auth, currentUser } from "@clerk/nextjs/server";
import { neon } from "@neondatabase/serverless";
import { redirect } from "next/navigation";
import Link from "next/link";
import AdminPanel from "@/components/AdminPanel";
import IndexNowButton from "@/components/IndexNowButton";
import AdminAutoRefresh from "@/components/AdminAutoRefresh";
import AdminPushSubscribe from "@/components/AdminPushSubscribe";
import AdminLocationUpdater from "@/components/AdminLocationUpdater";

const ADMIN_EMAILS = [
  "whoisjimi.today@gmail.com",
  "oyedeleoyepeju2014@gmail.com",
  "james@saintandstoryltd.co.uk",
  "oye@saintandstoryltd.co.uk"
];
const ADMIN_USER_IDS = ["user_3EVExeiSBmgdhAWGzMEb8GMVc62"];

async function getPendingJobs() {
  if (!process.env.DATABASE_URL) return [];
  const sql = neon(process.env.DATABASE_URL);
  try {
    return await sql`
      SELECT j.*,
        (SELECT COUNT(*) FROM jobs j2 WHERE j2.customer_email = j.customer_email AND j2.id != j.id) as previous_jobs
      FROM jobs j
      WHERE j.status = 'pending_review'
      ORDER BY j.created_at DESC
      LIMIT 50
    ` as Record<string, unknown>[];
  } catch (error) {
    console.error("[Admin] getPendingJobs error:", error);
    return [];
  }
}

async function getOfferedJobs() {
  if (!process.env.DATABASE_URL) return [];
  const sql = neon(process.env.DATABASE_URL);
  try {
    return await sql`
      SELECT j.*, d.full_name as driver_name, d.phone as driver_phone
      FROM jobs j
      LEFT JOIN drivers d ON d.id = j.driver_id
      WHERE j.status = 'offered'
      ORDER BY j.created_at DESC
      LIMIT 20
    ` as Record<string, unknown>[];
  } catch (error) {
    console.error("[Admin] getOfferedJobs error:", error);
    return [];
  }
}

async function getCompletedJobs() {
  if (!process.env.DATABASE_URL) return [];
  const sql = neon(process.env.DATABASE_URL);
  try {
    return await sql`
      SELECT j.*, d.full_name as driver_name,
        COALESCE(j.price, e.amount) as display_price
      FROM jobs j
      LEFT JOIN drivers d ON d.id = j.driver_id
      LEFT JOIN earnings e ON e.job_id = j.id
      WHERE j.status = 'completed'
      ORDER BY j.updated_at DESC
      LIMIT 30
    ` as Record<string, unknown>[];
  } catch (error) {
    console.error("[Admin] getCompletedJobs error:", error);
    return [];
  }
}

async function getConfirmedJobs() {
  if (!process.env.DATABASE_URL) return [];
  const sql = neon(process.env.DATABASE_URL);
  try {
    return await sql`
      SELECT j.*, d.full_name as driver_name, d.phone as driver_phone
      FROM jobs j
      LEFT JOIN drivers d ON d.id = j.driver_id
      WHERE j.status = 'confirmed'
      ORDER BY j.updated_at DESC
    ` as Record<string, unknown>[];
  } catch (error) {
    console.error("[Admin] getConfirmedJobs error:", error);
    return [];
  }
}

async function getInProgressJobs() {
  if (!process.env.DATABASE_URL) return [];
  const sql = neon(process.env.DATABASE_URL);
  try {
    return await sql`
      SELECT j.*, d.full_name as driver_name, d.phone as driver_phone
      FROM jobs j
      LEFT JOIN drivers d ON d.id = j.driver_id
      WHERE j.status = 'in_progress'
      ORDER BY j.updated_at DESC
    ` as Record<string, unknown>[];
  } catch (error) {
    console.error("[Admin] getInProgressJobs error:", error);
    return [];
  }
}

async function getActiveDrivers() {
  if (!process.env.DATABASE_URL) return [];
  const sql = neon(process.env.DATABASE_URL);
  try {
    return await sql`
      SELECT d.id, d.full_name, d.area, d.vehicle_type, d.phone, d.rating_avg, d.rating_count, d.last_seen_at,
        (
          SELECT AVG(EXTRACT(EPOCH FROM (j.updated_at - j.offered_at)) / 60)::int
          FROM jobs j
          WHERE j.driver_id = d.id
            AND j.status IN ('confirmed', 'in_progress', 'completed')
            AND j.offered_at IS NOT NULL
        ) as avg_response_mins,
        (SELECT reference FROM jobs j2 WHERE j2.driver_id = d.id AND j2.status IN ('confirmed','in_progress') ORDER BY j2.updated_at DESC LIMIT 1) as current_job_ref,
        (SELECT postcode_from FROM jobs j2 WHERE j2.driver_id = d.id AND j2.status IN ('confirmed','in_progress') ORDER BY j2.updated_at DESC LIMIT 1) as current_job_from,
        (SELECT postcode_to FROM jobs j2 WHERE j2.driver_id = d.id AND j2.status IN ('confirmed','in_progress') ORDER BY j2.updated_at DESC LIMIT 1) as current_job_to,
        (SELECT status FROM jobs j2 WHERE j2.driver_id = d.id AND j2.status IN ('confirmed','in_progress') ORDER BY j2.updated_at DESC LIMIT 1) as current_job_status
      FROM drivers d
      WHERE d.profile_live = true
      ORDER BY d.last_seen_at DESC NULLS LAST, d.rating_avg DESC NULLS LAST, d.full_name ASC
    ` as Record<string, unknown>[];
  } catch (error) {
    console.error("[Admin] getActiveDrivers error:", error);
    return [];
  }
}

async function getTodayRevenue() {
  if (!process.env.DATABASE_URL) return 0;
  const sql = neon(process.env.DATABASE_URL);
  try {
    const rows = await sql`
      SELECT COALESCE(SUM(amount), 0) as total
      FROM earnings
      WHERE created_at >= DATE_TRUNC('day', NOW() AT TIME ZONE 'Europe/London') AT TIME ZONE 'Europe/London'
    `;
    return Number(rows[0]?.total ?? 0);
  } catch (error) {
    console.error("[Admin] getTodayRevenue error:", error);
    return 0;
  }
}

export default async function AdminPage() {
  const { userId } = await auth();
  const user = await currentUser();

  if (!userId) redirect("/sign-in");

  const email = user?.emailAddresses[0]?.emailAddress ?? "";
  if (!ADMIN_EMAILS.includes(email) && !ADMIN_USER_IDS.includes(userId ?? "")) redirect("/dashboard/driver");

  const [pendingJobs, offeredJobs, confirmedJobs, inProgressJobs, drivers, completedJobs, todayRevenue] = await Promise.all([
    getPendingJobs(),
    getOfferedJobs(),
    getConfirmedJobs(),
    getInProgressJobs(),
    getActiveDrivers(),
    getCompletedJobs(),
    getTodayRevenue(),
  ]);

  const onlineCount = drivers.filter((d) => {
    const t = d.last_seen_at as string | null;
    return t && Date.now() - new Date(t).getTime() < 5 * 60 * 1000;
  }).length;

  const statLinks = [
    inProgressJobs.length > 0 && { label: `${inProgressJobs.length} driving`, href: "#section-enroute", bold: true },
    pendingJobs.length > 0 && { label: `${pendingJobs.length} lead${pendingJobs.length !== 1 ? "s" : ""}`, href: "#section-orders", bold: false },
    offeredJobs.length > 0 && { label: `${offeredJobs.length} searching`, href: "#section-awaiting", bold: false },
    confirmedJobs.length > 0 && { label: `${confirmedJobs.length} driving`, href: "#section-confirmed", bold: false },
    { label: `${onlineCount} online`, href: "#section-fleet", bold: false },
    todayRevenue > 0 && { label: `£${todayRevenue.toFixed(0)} today`, href: "#section-completed", bold: false },
  ].filter(Boolean) as { label: string; href: string; bold: boolean }[];

  return (
    <div className="max-w-3xl mx-auto px-6 py-10">
      <AdminAutoRefresh pendingCount={pendingJobs.length} />
      <AdminPushSubscribe />
      <AdminLocationUpdater />
      <div className="flex items-center justify-between mb-1">
        <Link href="/dashboard/admin" className="text-[10px] font-semibold text-[#888888] hover:text-[#0D0D0D] uppercase tracking-[0.2em] transition-colors border border-[#E8E8E8] px-3 py-1 rounded-full">
          Admin ↻
        </Link>
        <Link href="/dashboard/admin/b2b" className="text-[10px] font-semibold text-[#888888] hover:text-[#0D0D0D] uppercase tracking-[0.15em] transition-colors border border-[#E8E8E8] px-3 py-1 rounded-full">
          B2B Pipeline →
        </Link>
      </div>
      <h1 className="font-sans font-black text-[#0D0D0D] text-3xl tracking-tight mb-2">
        Dashboard.
      </h1>
      <div className="flex items-center justify-between mb-8">
        <div className="flex flex-wrap gap-2">
          {statLinks.map((s) => (
            <a
              key={s.href}
              href={s.href}
              className={`inline-flex items-center px-3 py-1.5 rounded-full border transition-all ${
                s.bold
                  ? "bg-[#0D0D0D] text-white border-[#0D0D0D] hover:bg-[#333333] hover:border-[#333333]"
                  : "bg-[#F5F5F5] text-[#666666] border-[#E8E8E8] hover:bg-white hover:border-[#D0D0D0] hover:text-[#0D0D0D]"
              } text-[10px] font-semibold uppercase tracking-[0.2em]`}
            >
              {s.label}
            </a>
          ))}
        </div>
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
