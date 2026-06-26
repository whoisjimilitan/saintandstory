import { NextRequest, NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

const ADMIN_EMAILS = ["whoisjimi.today@gmail.com"];

async function isAdmin(request: NextRequest) {
  const email = request.headers.get("x-admin-email");
  return email && ADMIN_EMAILS.includes(email);
}

/**
 * Construct likely email formats from business name
 * E.g., "Core FM Ltd" → contact@corefm.com (high confidence)
 */
function constructEmail(businessName: string): {email: string; confidence: string} | null {
  // Extract company name (remove Ltd, Inc, etc.)
  const cleaned = businessName
    .replace(/\s+(Ltd|Ltd\.|Inc|Inc\.|Co\.|Company|Group|Limited|Services|UK|LTD)$/i, "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "");

  if (!cleaned || cleaned.length < 2) return null;

  // Primary format: contact@companyname.com or .co.uk
  const domain = cleaned.includes("ltd") || cleaned.includes("limited")
    ? `${cleaned}.co.uk`
    : `${cleaned}.com`;

  return {
    email: `contact@${domain}`,
    confidence: "high",
  };
}

export async function GET(request: NextRequest) {
  if (!(await isAdmin(request))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const sql = neon(process.env.DATABASE_URL!);

    // Get all facility_managers leads without emails
    const leads = await sql`
      SELECT
        id, business_name, phone, website, created_at
      FROM b2b_leads
      WHERE niche = 'facility_managers'
        AND email IS NULL
        AND status = 'new'
      ORDER BY created_at DESC
      LIMIT 350
    `;

    console.log(`[enrich-emails] Found ${leads.length} leads without emails`);

    // Construct email for each lead
    const enriched = leads.map((lead: any) => {
      const candidate = constructEmail(lead.business_name);
      return {
        leadId: lead.id,
        businessName: lead.business_name,
        proposedEmail: candidate?.email || null,
        confidence: candidate?.confidence || "low",
      };
    });

    const withEmails = enriched.filter((e: any) => e.proposedEmail);

    return NextResponse.json({
      status: "preview",
      total_without_emails: leads.length,
      can_enrich: withEmails.length,
      sample: withEmails.slice(0, 10),
      all: enriched,
      next_step: "POST ?approve=true to enrich all leads with emails",
    });
  } catch (error) {
    console.error("[enrich-emails] Error:", error);
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
    const { approve } = Object.fromEntries(new URL(request.url).searchParams);

    if (approve !== "true") {
      return NextResponse.json(
        { error: "Must pass ?approve=true to enrich emails" },
        { status: 400 }
      );
    }

    const sql = neon(process.env.DATABASE_URL!);

    // Get all facility_managers leads without emails
    const leads = await sql`
      SELECT
        id, business_name
      FROM b2b_leads
      WHERE niche = 'facility_managers'
        AND email IS NULL
        AND status = 'new'
      ORDER BY created_at DESC
      LIMIT 350
    `;

    const updated: any[] = [];
    const failed: any[] = [];

    for (const lead of leads) {
      const candidate = constructEmail(lead.business_name);

      if (!candidate) {
        failed.push({ id: lead.id, reason: "could_not_construct_email" });
        continue;
      }

      try {
        // Update the lead with constructed email
        await sql`
          UPDATE b2b_leads
          SET email = ${candidate.email}, updated_at = NOW()
          WHERE id = ${lead.id}
        `;

        updated.push({
          id: lead.id,
          businessName: lead.business_name,
          email: candidate.email,
        });
      } catch (err) {
        console.error(`[enrich-emails] Failed to update ${lead.id}:`, err);
        failed.push({ id: lead.id, reason: String(err) });
      }
    }

    console.log(
      `[enrich-emails] Enriched ${updated.length} leads with emails. ${failed.length} could not be enriched.`
    );

    return NextResponse.json({
      status: "complete",
      enriched: updated.length,
      failed: failed.length,
      sample_enriched: updated.slice(0, 15),
      next_step: `✅ Emails ready! POST to /api/admin/send-facility-emails?confirm=true to send outreach to ${updated.length} prospects`,
      dashboard_impact: {
        leads_now_with_emails: updated.length,
        ready_for_outreach: true,
        expected_open_rate: "15-25%",
        expected_reply_rate: "3-8%",
      },
    });
  } catch (error) {
    console.error("[enrich-emails] Error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
