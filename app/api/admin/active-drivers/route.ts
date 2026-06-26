import { NextRequest, NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

const ADMIN_EMAILS = ["whoisjimi.today@gmail.com"];

async function isAdmin(request: NextRequest) {
  const email = request.headers.get("x-admin-email");
  return email && ADMIN_EMAILS.includes(email);
}

/**
 * Active Drivers & Job Assignment
 * Pulls live driver pool from drivers table (profile_live = true)
 * Tracks B2B job assignments and commissions
 */

export async function GET(request: NextRequest) {
  if (!(await isAdmin(request))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const sql = neon(process.env.DATABASE_URL!);

    // Get ACTIVE drivers (currently online)
    const activeDrivers = await sql`
      SELECT
        d.id,
        d.full_name,
        d.area,
        d.vehicle_type,
        d.phone,
        d.rating_avg,
        d.last_seen_at,
        (SELECT COUNT(*) FROM jobs j WHERE j.driver_id = d.id AND j.status IN ('confirmed', 'in_progress')) as current_jobs,
        (SELECT status FROM jobs j2 WHERE j2.driver_id = d.id AND j2.status IN ('confirmed','in_progress') ORDER BY j2.updated_at DESC LIMIT 1) as current_job_status
      FROM drivers d
      WHERE d.profile_live = true
      ORDER BY d.last_seen_at DESC NULLS LAST, d.rating_avg DESC NULLS LAST
      LIMIT 50
    `;

    // Get today's B2B jobs (assigned to any driver)
    const todayJobs = await sql`
      SELECT
        j.id,
        j.reference as job_ref,
        j.postcode_from,
        j.postcode_to,
        j.status,
        d.full_name as driver_name,
        j.price,
        e.amount as commission
      FROM jobs j
      LEFT JOIN drivers d ON j.driver_id = d.id
      LEFT JOIN earnings e ON e.job_id = j.id
      WHERE DATE(j.created_at) = CURRENT_DATE
      ORDER BY j.created_at DESC
    `;

    // Get today's revenue from jobs
    const todayRevenue = await sql`
      SELECT COALESCE(SUM(e.amount), 0) as total
      FROM earnings e
      WHERE DATE(e.created_at) = CURRENT_DATE
    `;

    const drivers = Array.isArray(activeDrivers) ? activeDrivers : [];
    const jobs = Array.isArray(todayJobs) ? todayJobs : [];
    const revenue = Array.isArray(todayRevenue) ? todayRevenue[0] : { total: 0 };

    const availableCount = drivers.filter((d: any) => !d.current_jobs || d.current_jobs === 0).length;
    const assignedCount = jobs.filter((j: any) => j.status === "confirmed" || j.status === "in_progress").length;
    const completedCount = jobs.filter((j: any) => j.status === "completed").length;

    return NextResponse.json({
      status: "ready",
      live_drivers: {
        total_active: drivers.length,
        available_now: availableCount,
        busy: drivers.length - availableCount,
        drivers: drivers.map((d: any) => ({
          id: d.id,
          name: d.full_name,
          area: d.area,
          vehicle_type: d.vehicle_type,
          phone: d.phone,
          rating: d.rating_avg,
          current_jobs: d.current_jobs || 0,
          status: d.current_jobs && d.current_jobs > 0 ? "busy" : "available",
          last_seen: d.last_seen_at,
        })),
      },
      today_jobs: {
        total_jobs: jobs.length,
        assigned: assignedCount,
        completed: completedCount,
        jobs: jobs.map((j: any) => ({
          id: j.id,
          reference: j.job_ref,
          route: `${j.postcode_from} → ${j.postcode_to}`,
          driver: j.driver_name || "Unassigned",
          status: j.status,
          price: j.price,
          commission: j.commission,
        })),
      },
      revenue_today: {
        total_earned: `£${(revenue.total || 0).toFixed(2)}`,
        from_jobs: jobs.length,
      },
      commission_model: {
        rate: "15-20% per job assignment",
        from: "Driver earnings or job price",
        tracked_in: "earnings table",
      },
    });
  } catch (error) {
    console.error("[active-drivers] Error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  if (!(await isAdmin(request))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json() as {
      action: string;
      driver_id?: string;
      prospect_name?: string;
      postcode_from?: string;
      postcode_to?: string;
      price?: number;
      job_reference?: string;
    };

    const sql = neon(process.env.DATABASE_URL!);

    if (body.action === "assign_job_to_driver") {
      if (!body.driver_id || !body.prospect_name || !body.postcode_from || !body.postcode_to) {
        return NextResponse.json(
          { error: "driver_id, prospect_name, postcode_from, postcode_to required" },
          { status: 400 }
        );
      }

      // Create job in jobs table
      const job = await sql`
        INSERT INTO jobs (
          driver_id,
          customer_name,
          postcode_from,
          postcode_to,
          status,
          price,
          reference,
          created_at,
          updated_at
        ) VALUES (
          ${body.driver_id},
          ${body.prospect_name},
          ${body.postcode_from},
          ${body.postcode_to},
          'offered',
          ${body.price || 0},
          ${body.job_reference || `B2B-${Date.now()}`},
          NOW(),
          NOW()
        )
        RETURNING id, reference, price
      `;

      return NextResponse.json({
        status: "job_assigned",
        job: job[0],
        message: `Job assigned to driver. Status: offered (awaiting acceptance)`,
      });
    }

    return NextResponse.json(
      { error: "Invalid action" },
      { status: 400 }
    );
  } catch (error) {
    console.error("[active-drivers] Error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
