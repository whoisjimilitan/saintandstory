import { NextRequest, NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

const ADMIN_EMAILS = ["whoisjimi.today@gmail.com"];

async function isAdmin(request: NextRequest) {
  const email = request.headers.get("x-admin-email");
  return email && ADMIN_EMAILS.includes(email);
}

export async function GET(request: NextRequest) {
  if (!(await isAdmin(request))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const sql = neon(process.env.DATABASE_URL!);

    // Check facility_managers leads breakdown
    const byStatus = await sql`
      SELECT status, COUNT(*) as count
      FROM b2b_leads
      WHERE niche = 'facility_managers'
      GROUP BY status
    `;

    const byEmail = await sql`
      SELECT
        CASE WHEN email IS NOT NULL THEN 'has_email' ELSE 'no_email' END as email_status,
        COUNT(*) as count
      FROM b2b_leads
      WHERE niche = 'facility_managers'
      GROUP BY email_status
    `;

    const samples = await sql`
      SELECT
        id, business_name, email, status, created_at,
        email_sent_at, contact_name, phone
      FROM b2b_leads
      WHERE niche = 'facility_managers'
      LIMIT 10
    `;

    return NextResponse.json({
      facility_managers_total: "342",
      by_status: byStatus,
      by_email: byEmail,
      sample_10_leads: samples,
      analysis: {
        has_emails: byEmail.find((r: any) => r.email_status === "has_email")?.count || 0,
        no_emails: byEmail.find((r: any) => r.email_status === "no_email")?.count || 0,
        status_new: byStatus.find((r: any) => r.status === "new")?.count || 0,
        status_other: byStatus.filter((r: any) => r.status !== "new").reduce((sum: number, r: any) => sum + parseInt(r.count), 0),
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
