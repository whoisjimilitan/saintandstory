import { NextRequest, NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

const ADMIN_EMAILS = ["whoisjimi.today@gmail.com"];

async function isAdmin(request: NextRequest) {
  const email = request.headers.get("x-admin-email");
  return email && ADMIN_EMAILS.includes(email);
}

/**
 * CRM Prospect Detail - Get full prospect info + all communications
 */
export async function GET(request: NextRequest) {
  if (!(await isAdmin(request))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const prospectId = searchParams.get("id");

    if (!prospectId) {
      return NextResponse.json({ error: "prospect id required" }, { status: 400 });
    }

    const sql = neon(process.env.DATABASE_URL!);

    // Get prospect details
    const prospects = await sql`
      SELECT * FROM b2b_leads WHERE id = ${prospectId} LIMIT 1
    `;

    if (!prospects || prospects.length === 0) {
      return NextResponse.json({ error: "Prospect not found" }, { status: 404 });
    }

    const prospect = prospects[0];

    // Get all emails sent to this prospect with their engagement
    const emails = await sql`
      SELECT
        o.id,
        o.subject,
        o.sent_at,
        o.resend_message_id,
        COALESCE(
          (SELECT event_type FROM b2b_email_events WHERE outreach_id = o.id ORDER BY created_at DESC LIMIT 1),
          CASE WHEN o.resend_message_id IS NOT NULL THEN 'sent' ELSE 'pending' END
        ) as status,
        (SELECT COUNT(*) FROM b2b_email_events WHERE outreach_id = o.id AND event_type = 'opened') as opens,
        (SELECT COUNT(*) FROM b2b_email_events WHERE outreach_id = o.id AND event_type = 'clicked') as clicks,
        (SELECT MAX(created_at) FROM b2b_email_events WHERE outreach_id = o.id AND event_type = 'opened') as last_opened_at
      FROM b2b_outreach o
      WHERE o.lead_id = ${prospectId}
      ORDER BY o.sent_at DESC
    `;

    // Get all conversation events (emails + whatsapp)
    const conversationEvents = await sql`
      SELECT
        type,
        direction,
        subject,
        body,
        metadata,
        created_at
      FROM b2b_conversation_events
      WHERE lead_id = ${prospectId}
      ORDER BY created_at DESC
      LIMIT 100
    `;

    // Get all events/interactions
    const events = await sql`
      SELECT
        event_type,
        metadata,
        created_at
      FROM b2b_email_events
      WHERE lead_id = ${prospectId}
      ORDER BY created_at DESC
      LIMIT 100
    `;

    // Get job/order history
    const jobs = await sql`
      SELECT
        id,
        business_name,
        price,
        service_type,
        active,
        created_at,
        next_scheduled_at
      FROM b2b_standing_orders
      WHERE lead_id = ${prospectId}
      ORDER BY created_at DESC
    `;

    // Calculate customer metrics
    const jobCount = jobs.length;
    const totalSpent = jobs.reduce((sum: number, job: any) => sum + (Number(job.price) || 0), 0);
    const lastJobDate = jobs.length > 0 ? jobs[0].created_at : null;
    const isCustomer = jobCount > 0;

    return NextResponse.json({
      status: "success",
      prospect: {
        id: prospect.id,
        businessName: prospect.business_name,
        category: prospect.business_category,
        email: prospect.email,
        phone: prospect.phone,
        city: prospect.city,
        address: prospect.address,
        website: prospect.website,
        rating: prospect.rating_avg,
        ratingCount: prospect.rating_count,
        status: prospect.status,
        createdAt: prospect.created_at,
        lastContactAt: prospect.email_sent_at,
        repliedAt: prospect.replied_at,
      },
      emails: emails.map((e: any) => ({
        id: e.id,
        subject: e.subject,
        sentAt: e.sent_at,
        resendMessageId: e.resend_message_id,
        status: e.status,
        opens: Number(e.opens || 0),
        clicks: Number(e.clicks || 0),
        lastOpenedAt: e.last_opened_at,
      })),
      emailsSummary: {
        totalSent: emails.length,
        totalOpens: emails.reduce((sum: number, e: any) => sum + (Number(e.opens) || 0), 0),
        totalClicks: emails.reduce((sum: number, e: any) => sum + (Number(e.clicks) || 0), 0),
      },
      conversationEvents: conversationEvents.map((e: any) => ({
        type: e.type,
        direction: e.direction,
        subject: e.subject,
        body: e.body,
        metadata: e.metadata,
        createdAt: e.created_at,
      })),
      whatsappSummary: {
        totalMessages: conversationEvents.filter((e: any) => e.type === 'whatsapp').length,
        inboundReplies: conversationEvents.filter((e: any) => e.type === 'whatsapp' && e.direction === 'inbound').length,
      },
      events: events.map((e: any) => ({
        type: e.event_type,
        createdAt: e.created_at,
        metadata: e.metadata,
      })),
      customer: {
        isCustomer,
        jobCount,
        totalSpent,
        lastJobDate,
        jobs: jobs.map((j: any) => ({
          id: j.id,
          serviceType: j.service_type,
          price: j.price,
          active: j.active,
          createdAt: j.created_at,
          nextScheduledAt: j.next_scheduled_at,
        })),
      },
    });
  } catch (error) {
    console.error("[crm-prospect] Error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
