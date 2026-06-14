import { ReadyTodayCard } from "@/components/leads/ReadyTodayCard";
import { neon } from "@neondatabase/serverless";
import { ArrowRight, AlertCircle } from "lucide-react";

interface Lead {
  id: string;
  business_name: string;
  business_category?: string;
  email?: string;
  phone?: string;
  engagement_score?: number;
}

interface OutreachRecord {
  subject?: string;
  body?: string;
}

async function getReadyTodayLeads() {
  if (!process.env.DATABASE_URL) {
    console.log("[READY TODAY] No DATABASE_URL - returning empty");
    return [];
  }

  try {
    const sql = neon(process.env.DATABASE_URL);

    // Get Tier A leads with score >= 30
    const leads = (await sql`
      SELECT
        id,
        business_name,
        business_category,
        email,
        phone,
        engagement_score
      FROM b2b_leads
      WHERE
        status = 'new'
        AND engagement_score >= 30
      ORDER BY engagement_score DESC, created_at ASC
      LIMIT 10
    `) as Lead[];

    console.log(`[READY TODAY] Found ${leads.length} ready leads`);

    // Enrich with outreach data
    const enrichedLeads = await Promise.all(
      leads.map(async (lead) => {
        try {
          const outreach = (await sql`
            SELECT subject, body
            FROM b2b_outreach
            WHERE lead_id = ${lead.id}
            ORDER BY created_at DESC
            LIMIT 1
          `) as OutreachRecord[];

          return {
            ...lead,
            emailSubject: outreach[0]?.subject,
            emailBody: outreach[0]?.body,
          };
        } catch (e) {
          console.error(`[READY TODAY] Error enriching lead ${lead.id}:`, e);
          return lead;
        }
      })
    );

    return enrichedLeads;
  } catch (error) {
    console.error("[READY TODAY] Database error:", error);
    return [];
  }
}

export default async function ReadyTodayPage() {
  const leads = await getReadyTodayLeads();

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50">
      {/* HEADER */}
      <div className="bg-gradient-to-r from-green-600 to-emerald-600 text-white">
        <div className="max-w-6xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-2">
                <span className="inline-block w-3 h-3 bg-green-300 rounded-full animate-pulse" />
                READY TODAY
              </h1>
              <p className="text-green-100 mt-2">
                Top prospects. Act now. First-touch emails ready.
              </p>
            </div>
            <div className="text-right">
              <div className="text-4xl font-bold">{leads.length}</div>
              <div className="text-green-100">prospects ready</div>
            </div>
          </div>

          {/* RECOMMENDED ACTIONS */}
          <div className="bg-white bg-opacity-20 rounded-lg p-4 backdrop-blur-sm">
            <div className="text-sm font-semibold mb-2 flex items-center gap-2">
              <ArrowRight size={16} />
              TODAY'S WORKFLOW
            </div>
            <ol className="text-sm space-y-1 text-green-50">
              <li>1. Identify best lead (score at top)</li>
              <li>2. Review outreach angle & hook</li>
              <li>3. Copy or send first-touch email</li>
              <li>4. Mark as contacted</li>
              <li>5. Repeat for next 5 leads</li>
            </ol>
          </div>
        </div>
      </div>

      {/* LEADS GRID */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        {leads.length === 0 ? (
          <div className="bg-white rounded-lg border-2 border-amber-200 p-8 text-center">
            <AlertCircle className="mx-auto text-amber-600 mb-3" size={32} />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No READY TODAY leads yet
            </h3>
            <p className="text-gray-600">
              Check back tomorrow at 07:00 UTC when the daily discovery runs.
            </p>
          </div>
        ) : (
          <>
            <p className="text-sm text-gray-600 mb-4">
              Showing {leads.length} prospect{leads.length !== 1 ? "s" : ""} ready
              for outreach
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {leads.map((lead) => (
                <ReadyTodayCard
                  key={lead.id}
                  id={lead.id}
                  businessName={lead.business_name}
                  category={lead.business_category}
                  score={lead.engagement_score || 0}
                  email={lead.email}
                  phone={lead.phone}
                  emailSubject={
                    (lead as any).emailSubject || "Ready for outreach"
                  }
                  emailBody={(lead as any).emailBody || "Email body pending"}
                  onMarkContacted={() => {
                    console.log("Mark contacted:", lead.id);
                    // Will be implemented in Wave 3
                  }}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {/* FOOTER INFO */}
      <div className="max-w-6xl mx-auto px-6 py-6 text-center text-sm text-gray-600">
        <p>
          Last updated:{" "}
          {new Date().toLocaleTimeString("en-GB", {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
          })}{" "}
          UTC
        </p>
        <p className="mt-1">
          Next discovery run: Tomorrow 02:00 UTC
        </p>
      </div>
    </div>
  );
}
