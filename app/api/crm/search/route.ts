import { NextRequest, NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

const ADMIN_EMAILS = ["whoisjimi.today@gmail.com"];

async function isAdmin(request: NextRequest) {
  const email = request.headers.get("x-admin-email");
  return email && ADMIN_EMAILS.includes(email);
}

/**
 * CRM Search - Find prospects/clients by name, email, phone, or city
 */
export async function GET(request: NextRequest) {
  if (!(await isAdmin(request))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q")?.trim() || "";

    if (!query || query.length < 2) {
      return NextResponse.json({
        status: "success",
        results: [],
        message: "Enter at least 2 characters to search",
      });
    }

    const sql = neon(process.env.DATABASE_URL!);

    // Search prospects by name, email, phone, or city
    const results = await sql`
      SELECT
        l.id,
        l.business_name,
        l.email,
        l.phone,
        l.city,
        l.business_category,
        l.website,
        l.status,
        l.created_at,
        (SELECT COUNT(*) FROM b2b_outreach WHERE lead_id = l.id) as email_count,
        (SELECT MAX(sent_at) FROM b2b_outreach WHERE lead_id = l.id) as last_email_at,
        (SELECT COUNT(*) FROM b2b_email_events WHERE lead_id = l.id AND event_type = 'opened') as total_opens,
        (SELECT COUNT(*) FROM b2b_email_events WHERE lead_id = l.id AND event_type = 'clicked') as total_clicks,
        (SELECT COUNT(*) FROM b2b_email_events WHERE lead_id = l.id AND event_type = 'replied') as total_replies
      FROM b2b_leads l
      WHERE
        LOWER(l.business_name) LIKE LOWER(${'%' + query + '%'})
        OR LOWER(l.email) LIKE LOWER(${'%' + query + '%'})
        OR LOWER(l.phone) LIKE LOWER(${'%' + query + '%'})
        OR LOWER(l.city) LIKE LOWER(${'%' + query + '%'})
      ORDER BY l.business_name ASC
      LIMIT 50
    `;

    return NextResponse.json({
      status: "success",
      results: results.map((r: any) => ({
        id: r.id,
        businessName: r.business_name,
        email: r.email,
        phone: r.phone,
        city: r.city,
        category: r.business_category,
        website: r.website,
        status: r.status,
        createdAt: r.created_at,
        emailCount: Number(r.email_count || 0),
        lastEmailAt: r.last_email_at,
        totalOpens: Number(r.total_opens || 0),
        totalClicks: Number(r.total_clicks || 0),
        totalReplies: Number(r.total_replies || 0),
      })),
      count: results.length,
    });
  } catch (error) {
    console.error("[crm-search] Error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
