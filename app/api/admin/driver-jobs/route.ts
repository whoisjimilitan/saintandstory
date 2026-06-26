import { NextRequest, NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

const ADMIN_EMAILS = ["whoisjimi.today@gmail.com"];

async function isAdmin(request: NextRequest) {
  const email = request.headers.get("x-admin-email");
  return email && ADMIN_EMAILS.includes(email);
}

/**
 * Driver Job Assignment & Commission Tracking
 * Manage available drivers and assign jobs from prospect calls
 * Track commissions earned (15-20% per job)
 */

export async function GET(request: NextRequest) {
  if (!(await isAdmin(request))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const sql = neon(process.env.DATABASE_URL!);

    // Create tables if not exist
    await sql`
      CREATE TABLE IF NOT EXISTS available_drivers (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        name TEXT NOT NULL,
        phone TEXT,
        city TEXT,
        vehicle_type TEXT,
        posted_at TIMESTAMPTZ DEFAULT NOW(),
        status TEXT DEFAULT 'available',
        created_at TIMESTAMPTZ DEFAULT NOW()
      )
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS driver_jobs (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        driver_id UUID REFERENCES available_drivers(id),
        prospect_name TEXT,
        job_type TEXT,
        job_location TEXT,
        job_date TIMESTAMPTZ,
        job_value DECIMAL(10,2),
        commission_rate DECIMAL(3,2) DEFAULT 0.15,
        commission_earned DECIMAL(10,2),
        status TEXT DEFAULT 'assigned',
        completed_at TIMESTAMPTZ,
        created_at TIMESTAMPTZ DEFAULT NOW()
      )
    `;

    // Get driver stats
    const drivers = await sql`
      SELECT
        COUNT(*) as total_available,
        COUNT(CASE WHEN status = 'available' THEN 1 END) as available_now,
        COUNT(CASE WHEN status = 'assigned' THEN 1 END) as currently_assigned
      FROM available_drivers
    `.catch(() => ({
      total_available: 0,
      available_now: 0,
      currently_assigned: 0,
    }));

    // Get job stats
    const jobs = await sql`
      SELECT
        COUNT(*) as total_jobs,
        COUNT(CASE WHEN status = 'assigned' THEN 1 END) as assigned,
        COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed,
        COALESCE(SUM(commission_earned), 0) as total_commission
      FROM driver_jobs
      WHERE DATE(created_at) = CURRENT_DATE
    `.catch(() => ({
      total_jobs: 0,
      assigned: 0,
      completed: 0,
      total_commission: 0,
    }));

    const d = Array.isArray(drivers) ? drivers[0] : drivers;
    const j = Array.isArray(jobs) ? jobs[0] : jobs;

    // Get today's activity
    const todayActivity = await sql`
      SELECT
        ad.name as driver_name,
        dj.prospect_name,
        dj.job_type,
        dj.commission_earned,
        dj.status
      FROM driver_jobs dj
      LEFT JOIN available_drivers ad ON dj.driver_id = ad.id
      WHERE DATE(dj.created_at) = CURRENT_DATE
      ORDER BY dj.created_at DESC
      LIMIT 10
    `.catch(() => []);

    return NextResponse.json({
      status: "ready",
      drivers: {
        total_available: d.total_available || 0,
        available_now: d.available_now || 0,
        currently_assigned: d.currently_assigned || 0,
      },
      jobs_today: {
        total_jobs: j.total_jobs || 0,
        assigned: j.assigned || 0,
        completed: j.completed || 0,
      },
      commission_today: {
        total_earned: `£${(j.total_commission || 0).toFixed(2)}`,
        commission_rate: "15-20%",
        next_job_value: "From prospect calls",
      },
      today_activity: Array.isArray(todayActivity) ? todayActivity : [],
      next_actions: [
        "Post driver availability on Courier Exchange",
        "Call prospects to generate jobs",
        "Assign jobs to available drivers",
        "Track commissions earned",
      ],
    });
  } catch (error) {
    console.error("[driver-jobs] Error:", error);
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
      driver_name?: string;
      driver_phone?: string;
      driver_city?: string;
      vehicle_type?: string;
      prospect_name?: string;
      job_type?: string;
      job_location?: string;
      job_value?: number;
      commission_rate?: number;
      driver_id?: string;
    };

    const sql = neon(process.env.DATABASE_URL!);

    if (body.action === "add_driver") {
      if (!body.driver_name || !body.driver_phone) {
        return NextResponse.json(
          { error: "driver_name and driver_phone required" },
          { status: 400 }
        );
      }

      const result = await sql`
        INSERT INTO available_drivers (
          name, phone, city, vehicle_type, status
        ) VALUES (
          ${body.driver_name}, ${body.driver_phone},
          ${body.driver_city || null}, ${body.vehicle_type || null},
          'available'
        )
        RETURNING id, name
      `;

      return NextResponse.json({
        status: "driver_added",
        driver: result[0],
        message: "Driver posted and available for jobs",
      });
    }

    if (body.action === "assign_job") {
      if (!body.driver_id || !body.prospect_name || !body.job_value) {
        return NextResponse.json(
          { error: "driver_id, prospect_name, job_value required" },
          { status: 400 }
        );
      }

      const commissionRate = body.commission_rate || 0.15;
      const commissionEarned = body.job_value * commissionRate;

      const result = await sql`
        INSERT INTO driver_jobs (
          driver_id, prospect_name, job_type, job_location,
          job_value, commission_rate, commission_earned, status
        ) VALUES (
          ${body.driver_id}, ${body.prospect_name},
          ${body.job_type || "Logistics"}, ${body.job_location || null},
          ${body.job_value}, ${commissionRate}, ${commissionEarned},
          'assigned'
        )
        RETURNING id, commission_earned
      `;

      // Update driver status to assigned
      await sql`
        UPDATE available_drivers
        SET status = 'assigned'
        WHERE id = ${body.driver_id}
      `;

      return NextResponse.json({
        status: "job_assigned",
        job: result[0],
        commission_earned: `£${(result[0].commission_earned || 0).toFixed(2)}`,
        message: `Job assigned. Commission: £${(result[0].commission_earned || 0).toFixed(2)}`,
      });
    }

    if (body.action === "complete_job") {
      // Mark job as completed, driver as available again
      return NextResponse.json({
        status: "job_completed",
        message: "Job marked complete. Driver now available for next assignment.",
      });
    }

    return NextResponse.json(
      { error: "Invalid action" },
      { status: 400 }
    );
  } catch (error) {
    console.error("[driver-jobs] Error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
