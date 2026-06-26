import { NextRequest, NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

/**
 * Mark Job as Complete
 * Driver or operator marks job as complete
 * Triggers commission calculation and earnings recording
 * Updates driver availability
 */

export async function POST(request: NextRequest) {
  try {
    const { job_id, driver_id, completion_notes, actual_price } = await request.json();

    if (!job_id || !driver_id) {
      return NextResponse.json(
        { error: "job_id and driver_id required" },
        { status: 400 }
      );
    }

    if (!process.env.DATABASE_URL) {
      return NextResponse.json(
        { error: "Database not configured" },
        { status: 500 }
      );
    }

    const sql = neon(process.env.DATABASE_URL);

    // Get job details
    const jobs = await sql`
      SELECT * FROM jobs WHERE id = ${job_id}
    `;

    if (!jobs || jobs.length === 0) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    const job = jobs[0];
    const jobPrice = actual_price || job.price || 0;

    // Calculate commission (15-20% based on job type)
    let commissionRate = 0.15; // Default 15%
    if (job.job_type === "high_value" || jobPrice > 500) {
      commissionRate = 0.20; // 20% for high-value jobs
    }

    const commissionAmount = jobPrice * commissionRate;

    // Update job status
    await sql`
      UPDATE jobs
      SET status = 'completed', completed_at = NOW(), completion_notes = ${completion_notes || null}
      WHERE id = ${job_id}
    `;

    // Record earnings
    const earningId = crypto.randomUUID();
    await sql`
      INSERT INTO earnings (
        id,
        driver_id,
        job_id,
        amount,
        commission_rate,
        created_at
      ) VALUES (
        ${earningId},
        ${driver_id},
        ${job_id},
        ${commissionAmount},
        ${commissionRate},
        NOW()
      )
    `;

    // Update driver status to available
    await sql`
      UPDATE drivers
      SET profile_status = 'available'
      WHERE id = ${driver_id}
    `;

    return NextResponse.json({
      status: "job_completed",
      job_id: job_id,
      driver_id: driver_id,
      job_price: jobPrice,
      commission_earned: parseFloat(commissionAmount.toFixed(2)),
      commission_rate: `${Math.round(commissionRate * 100)}%`,
      message: `Job completed. Driver earned £${commissionAmount.toFixed(2)} commission.`,
    });
  } catch (error) {
    console.error("[jobs/complete] Error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
