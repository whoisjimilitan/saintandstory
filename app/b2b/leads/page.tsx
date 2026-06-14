import { LeadActionCard } from "@/components/leads/LeadActionCard";
import { ReadyTodayCard } from "@/components/leads/ReadyTodayCard";
import { neon } from "@neondatabase/serverless";
import { AlertCircle, Sparkles } from "lucide-react";

interface Lead {
  id: string;
  business_name: string;
  business_category?: string;
  email?: string;
  phone?: string;
  website?: string;
  engagement_score?: number;
  pain_point?: string;
  review_rating?: number;
  status?: string;
}

interface OutreachRecord {
  subject?: string;
  body?: string;
}

interface EnrichedLead extends Lead {
  emailSubject?: string;
  emailBody?: string;
  challenges?: string[];
  opportunities?: string[];
  primaryAngle?: string;
  primaryHook?: string;
  secondaryAngle?: string;
}

async function getAllLeads(): Promise<EnrichedLead[]> {
  if (!process.env.DATABASE_URL) {
    console.log("[LEADS] No DATABASE_URL");
    return [];
  }

  try {
    const sql = neon(process.env.DATABASE_URL);

    // Get all leads
    const leads = (await sql`
      SELECT
        id,
        business_name,
        business_category,
        email,
        phone,
        website,
        engagement_score,
        pain_point,
        review_rating,
        status
      FROM b2b_leads
      ORDER BY engagement_score DESC, created_at ASC
    `) as Lead[];

    console.log(`[LEADS] Found ${leads.length} total leads`);

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

          // Mock challenges/opportunities based on category
          const categoryData: Record<
            string,
            {
              challenges: string[];
              opportunities: string[];
              angle: string;
              hook: string;
            }
          > = {
            florist: {
              challenges: [
                "Seasonal demand management",
                "Customer acquisition costs",
                "Supplier reliability",
              ],
              opportunities: [
                "Event-based marketing",
                "Subscription services",
                "Corporate partnerships",
              ],
              angle: "lead-generation",
              hook: "More event bookings = consistent revenue",
            },
            accountant: {
              challenges: [
                "Client retention",
                "High-value client acquisition",
                "Administrative overhead",
              ],
              opportunities: [
                "Recurring revenue models",
                "Client portal automation",
                "Matter management systems",
              ],
              angle: "revenue-growth",
              hook: "Recurring relationships = stable income",
            },
            dental: {
              challenges: [
                "New patient acquisition",
                "Appointment no-shows",
                "Patient retention",
              ],
              opportunities: [
                "Patient automation",
                "Referral programs",
                "Treatment acceptance rates",
              ],
              angle: "lead-generation",
              hook: "More patients = full schedule",
            },
            removal: {
              challenges: [
                "Finding job bookings",
                "Team utilization",
                "Customer acquisition",
              ],
              opportunities: [
                "Quote automation",
                "Standing order contracts",
                "Review generation",
              ],
              angle: "lead-generation",
              hook: "More booked jobs = more revenue",
            },
          };

          const data = categoryData[lead.business_category || ""] || {
            challenges: ["Lead generation", "Service quality", "Growth"],
            opportunities: ["Automation", "Process improvement", "Expansion"],
            angle: "lead-generation",
            hook: "More prospects = more business",
          };

          return {
            ...lead,
            emailSubject: outreach[0]?.subject || "Ready for outreach",
            emailBody:
              outreach[0]?.body ||
              `Hi,

We've identified ${lead.business_name} as a potential fit for partnership.

Would you be open to a brief conversation?`,
            challenges: data.challenges,
            opportunities: data.opportunities,
            primaryAngle: data.angle,
            primaryHook: data.hook,
          };
        } catch (e) {
          console.error(`[LEADS] Error enriching lead ${lead.id}:`, e);
          return lead;
        }
      })
    );

    return enrichedLeads;
  } catch (error) {
    console.error("[LEADS] Database error:", error);
    return [];
  }
}

export default async function LeadsPage() {
  const leads = await getAllLeads();

  // Categorize leads
  const readyToday = leads.filter(
    (l) => l.engagement_score! >= 30 && l.status === "new"
  );
  const tierA = leads.filter((l) => l.engagement_score! >= 75);
  const tierB = leads.filter(
    (l) => l.engagement_score! >= 40 && l.engagement_score! < 75
  );
  const tierC = leads.filter((l) => l.engagement_score! < 40);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* HEADER */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">All Leads</h1>
              <p className="text-gray-600 mt-1">
                Complete prospect pipeline: {leads.length} total leads
              </p>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-600">
                Last updated:{" "}
                {new Date().toLocaleTimeString("en-GB", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="max-w-7xl mx-auto px-6 py-8 space-y-12">
        {/* READY TODAY SECTION */}
        {readyToday.length > 0 && (
          <section>
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="text-green-600" size={20} />
                <h2 className="text-2xl font-bold text-gray-900">
                  🟢 READY TODAY
                </h2>
              </div>
              <p className="text-sm text-gray-600">
                {readyToday.length} prospects ready for immediate outreach
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {readyToday.slice(0, 6).map((lead) => (
                <ReadyTodayCard
                  key={lead.id}
                  id={lead.id}
                  businessName={lead.business_name}
                  category={lead.business_category}
                  score={lead.engagement_score || 0}
                  email={lead.email}
                  phone={lead.phone}
                  primaryHook={lead.primaryHook}
                  emailSubject={lead.emailSubject}
                  emailBody={lead.emailBody}
                  onMarkContacted={() => {
                    console.log("Mark contacted:", lead.id);
                    // Will be implemented in Wave 3
                  }}
                />
              ))}
            </div>
            {readyToday.length > 6 && (
              <p className="text-sm text-gray-500 mt-4">
                ... and {readyToday.length - 6} more ready today
              </p>
            )}
          </section>
        )}

        {/* TIER A SECTION */}
        {tierA.length > 0 && (
          <section>
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                🔴 Tier A
                <span className="text-lg font-normal text-gray-600">
                  ({tierA.length})
                </span>
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                High-value prospects with strong fit signals
              </p>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {tierA.map((lead) => (
                <LeadActionCard
                  key={lead.id}
                  id={lead.id}
                  businessName={lead.business_name}
                  category={lead.business_category}
                  tier="A"
                  score={lead.engagement_score || 0}
                  email={lead.email}
                  phone={lead.phone}
                  website={lead.website}
                  challenges={lead.challenges}
                  opportunities={lead.opportunities}
                  painPoint={lead.pain_point}
                  reviewRating={lead.review_rating}
                  primaryAngle={lead.primaryAngle}
                  primaryHook={lead.primaryHook}
                  emailSubject={lead.emailSubject}
                  emailBody={lead.emailBody}
                  onMarkContacted={() => {
                    console.log("Mark contacted:", lead.id);
                  }}
                  onViewBrief={() => {
                    console.log("View brief:", lead.id);
                  }}
                />
              ))}
            </div>
          </section>
        )}

        {/* TIER B SECTION */}
        {tierB.length > 0 && (
          <section>
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                🟡 Tier B
                <span className="text-lg font-normal text-gray-600">
                  ({tierB.length})
                </span>
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                Secondary prospects with moderate fit
              </p>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {tierB.map((lead) => (
                <LeadActionCard
                  key={lead.id}
                  id={lead.id}
                  businessName={lead.business_name}
                  category={lead.business_category}
                  tier="B"
                  score={lead.engagement_score || 0}
                  email={lead.email}
                  phone={lead.phone}
                  website={lead.website}
                  challenges={lead.challenges}
                  opportunities={lead.opportunities}
                  painPoint={lead.pain_point}
                  primaryAngle={lead.primaryAngle}
                  primaryHook={lead.primaryHook}
                  emailSubject={lead.emailSubject}
                  emailBody={lead.emailBody}
                  onMarkContacted={() => {
                    console.log("Mark contacted:", lead.id);
                  }}
                  onViewBrief={() => {
                    console.log("View brief:", lead.id);
                  }}
                />
              ))}
            </div>
          </section>
        )}

        {/* TIER C SECTION */}
        {tierC.length > 0 && (
          <section>
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                ⚪ Tier C
                <span className="text-lg font-normal text-gray-600">
                  ({tierC.length})
                </span>
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                Long-tail prospects for future follow-up
              </p>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {tierC.slice(0, 10).map((lead) => (
                <LeadActionCard
                  key={lead.id}
                  id={lead.id}
                  businessName={lead.business_name}
                  category={lead.business_category}
                  tier="C"
                  score={lead.engagement_score || 0}
                  email={lead.email}
                  phone={lead.phone}
                  challenges={lead.challenges}
                  primaryAngle={lead.primaryAngle}
                  primaryHook={lead.primaryHook}
                  emailSubject={lead.emailSubject}
                  emailBody={lead.emailBody}
                  onMarkContacted={() => {
                    console.log("Mark contacted:", lead.id);
                  }}
                />
              ))}
            </div>
            {tierC.length > 10 && (
              <p className="text-sm text-gray-500 mt-4">
                ... and {tierC.length - 10} more Tier C prospects (not displayed)
              </p>
            )}
          </section>
        )}

        {/* NO LEADS STATE */}
        {leads.length === 0 && (
          <div className="bg-white rounded-lg border-2 border-amber-200 p-12 text-center">
            <AlertCircle className="mx-auto text-amber-600 mb-4" size={40} />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No leads yet
            </h3>
            <p className="text-gray-600">
              New leads will appear here after discovery runs. Check back
              tomorrow at 07:00 UTC.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
