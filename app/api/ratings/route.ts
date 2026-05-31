import { NextRequest, NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

export async function GET(request: NextRequest) {
  const token = new URL(request.url).searchParams.get("token");
  if (!token) return NextResponse.json({ job: null });

  const sql = neon(process.env.DATABASE_URL!);
  const rows = await sql`
    SELECT j.id, j.postcode_from, j.postcode_to, j.status, j.tracking_token,
           d.full_name as driver_name, d.id as driver_id,
           EXISTS(SELECT 1 FROM ratings r WHERE r.job_id = j.id) as already_rated
    FROM jobs j
    LEFT JOIN drivers d ON d.id = j.driver_id
    WHERE j.tracking_token = ${token}
    LIMIT 1
  `;

  const job = rows[0] ?? null;
  if (!job || job.status !== "completed") return NextResponse.json({ job: null });
  return NextResponse.json({ job });
}

export async function POST(request: NextRequest) {
  const { token, score, comment } = await request.json();
  if (!token || !score || score < 1 || score > 5) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const sql = neon(process.env.DATABASE_URL!);

  const jobRows = await sql`
    SELECT j.id, j.driver_id FROM jobs j
    WHERE j.tracking_token = ${token} AND j.status = 'completed'
    LIMIT 1
  `;
  const job = jobRows[0];
  if (!job) return NextResponse.json({ error: "Job not found" }, { status: 404 });

  const existing = await sql`SELECT id FROM ratings WHERE job_id = ${job.id as string} LIMIT 1`;
  if (existing.length > 0) return NextResponse.json({ error: "Already rated" }, { status: 409 });

  await sql`
    INSERT INTO ratings (job_id, driver_id, score, comment)
    VALUES (${job.id as string}, ${job.driver_id as string}, ${score}, ${comment ?? null})
  `;

  // Recalculate driver's rating average
  await sql`
    UPDATE drivers SET
      rating_avg = (SELECT AVG(score) FROM ratings WHERE driver_id = ${job.driver_id as string}),
      rating_count = (SELECT COUNT(*) FROM ratings WHERE driver_id = ${job.driver_id as string}),
      updated_at = NOW()
    WHERE id = ${job.driver_id as string}
  `;

  return NextResponse.json({ success: true });
}
