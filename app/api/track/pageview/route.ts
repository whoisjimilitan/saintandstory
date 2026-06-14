/**
 * Page View Tracking Endpoint
 *
 * Logs landing page visits with UTM attribution
 * Connects email campaigns → page views → lead engagement
 */

import { NextRequest, NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";
import { parseUtmParams } from "@/lib/email-attribution";

export const maxDuration = 10;

export async function POST(req: NextRequest) {
  try {
    const sql = neon(process.env.DATABASE_URL!);

    const { pageUrl, referrer, sessionId } = await req.json();

    if (!pageUrl) {
      return NextResponse.json(
        { error: "pageUrl required" },
        { status: 400 }
      );
    }

    // Create table if needed
    await sql`
      CREATE TABLE IF NOT EXISTS page_engagement_log (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        lead_id UUID,
        campaign_id UUID,
        session_id TEXT,
        page_url TEXT NOT NULL,
        referrer TEXT,
        utm_source TEXT,
        utm_medium TEXT,
        utm_campaign TEXT,
        utm_lead TEXT,
        utm_content TEXT,
        visited_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `;

    // Parse UTM parameters from page URL
    const utmParams = parseUtmParams(pageUrl);
    const leadId = utmParams.utm_lead || null;
    const campaignId = utmParams.utm_campaign || null;

    // Log page visit
    await sql`
      INSERT INTO page_engagement_log (
        lead_id,
        campaign_id,
        session_id,
        page_url,
        referrer,
        utm_source,
        utm_medium,
        utm_campaign,
        utm_lead,
        utm_content
      ) VALUES (
        ${leadId},
        ${campaignId},
        ${sessionId},
        ${pageUrl},
        ${referrer},
        ${utmParams.utm_source || null},
        ${utmParams.utm_medium || null},
        ${utmParams.utm_campaign || null},
        ${utmParams.utm_lead || null},
        ${utmParams.utm_content || null}
      )
    `;

    // If lead identified, update engagement
    if (leadId) {
      await sql`
        UPDATE b2b_leads
        SET
          engagement_score = COALESCE(engagement_score, 0) + 10,
          last_engagement_at = NOW()
        WHERE id = ${leadId}
      `;
    }

    return NextResponse.json(
      { success: true, leadId, campaignId },
      { status: 200 }
    );
  } catch (error) {
    console.error("[PageView Tracking] Error:", error instanceof Error ? error.message : String(error));
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    status: "ready",
    endpoint: "/api/track/pageview",
    method: "POST",
    description: "Logs landing page visits with UTM attribution",
  });
}
