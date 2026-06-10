import { auth, currentUser } from "@clerk/nextjs/server";
import { neon } from "@neondatabase/serverless";
import { redirect } from "next/navigation";
import { BusinessEvidence } from "@/lib/evidence-types";
import { generateQuestions, prioritizeQuestions } from "@/lib/question-engine";

const ADMIN_EMAILS = [
  "whoisjimi.today@gmail.com",
  "oyedeleoyepeju2014@gmail.com",
  "james@saintandstoryltd.co.uk",
  "oye@saintandstoryltd.co.uk"
];

async function getLead(lead_id: string) {
  const sql = neon(process.env.DATABASE_URL!);
  const result = await sql`
    SELECT * FROM b2b_leads WHERE id = ${lead_id}
  `;
  return result[0] as Record<string, unknown> | undefined;
}

export default async function LeadIntelligencePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { userId } = await auth();
  const user = await currentUser();

  if (!userId) redirect("/sign-in");

  const email = user?.emailAddresses[0]?.emailAddress ?? "";
  if (!ADMIN_EMAILS.includes(email)) redirect("/dashboard/driver");

  const lead = await getLead(id);
  if (!lead) {
    return (
      <div className="max-w-3xl mx-auto px-6 py-10">
        <p className="text-[#888888]">Lead not found</p>
      </div>
    );
  }

  // Get evidence
  const evidence = (lead.business_evidence as BusinessEvidence) || {
    reviews: [],
    facts: [],
    extracted_at: new Date(),
    review_count: 0,
  };

  // Generate questions
  let questions = generateQuestions(evidence, lead.niche as string | undefined);
  questions = prioritizeQuestions(questions);

  // Get human observations
  const humanObservations = (lead.human_observations as Record<string, unknown>[] | null) || [];

  // Get timeline
  const timeline = (lead.business_timeline as Record<string, unknown>[] | null) || [];

  return (
    <div className="max-w-3xl mx-auto px-6 py-10">
      {/* Header */}
      <div className="mb-10">
        <p className="text-[10px] font-semibold text-[#888888] uppercase tracking-[0.2em] mb-2">
          Lead Intelligence Briefing
        </p>
        <h1 className="font-sans font-black text-[#0D0D0D] text-4xl tracking-tight mb-3">
          {lead.business_name as string}
        </h1>
        <div className="flex items-center gap-4 text-sm">
          <span className="bg-[#F5F5F5] px-3 py-1.5 rounded-full font-medium text-[#0D0D0D]">
            {lead.niche as string}
          </span>
          <span className="bg-[#F5F5F5] px-3 py-1.5 rounded-full font-medium text-[#0D0D0D]">
            {lead.city as string}
          </span>
        </div>
      </div>

      {/* Business Profile */}
      <div className="bg-[#E8F5E9] border-l-4 border-l-[#2ECC71] rounded-lg p-6 mb-8">
        <p className="text-[10px] font-semibold text-[#2ECC71] uppercase tracking-[0.2em] mb-3">
          ✓ Business Profile
        </p>

        {evidence.review_count > 0 && (
          <div className="mb-4">
            <p className="text-[#0D0D0D] text-sm font-semibold">
              {evidence.review_count} customers {evidence.rating_average ? `(${evidence.rating_average.toFixed(1)}★)` : ""}
            </p>
            <p className="text-[#666666] text-xs mt-1">
              Active customer feedback indicates engagement
            </p>
          </div>
        )}

        {evidence.facts.length > 0 &&
          evidence.facts.map(fact => (
            <div key={fact.id} className="mb-2">
              <p className="text-[#0D0D0D] text-sm"><span className="text-[#2ECC71] font-bold">•</span> {fact.fact}</p>
            </div>
          ))}
      </div>

      {/* What We Observed */}
      {humanObservations.length > 0 && (
        <div className="bg-[#FFF3E0] border-l-4 border-l-[#F39C12] rounded-lg p-6 mb-8">
          <p className="text-[10px] font-semibold text-[#F39C12] uppercase tracking-[0.2em] mb-4">
            ⚠ What We Observed
          </p>
          <div className="space-y-3">
            {humanObservations.slice(0, 5).map((obs, idx) => {
              const obsData = obs as Record<string, unknown>;
              const recordedAt = obsData.recorded_at ? new Date(obsData.recorded_at as string).toLocaleDateString() : "Unknown date";
              return (
                <div key={idx} className="bg-white rounded-md p-3 border-l-2 border-l-[#F39C12]">
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <p className="text-[10px] font-semibold text-[#F39C12] uppercase tracking-[0.5px]">
                      {(obsData.context as string) || "Note"}
                    </p>
                    <p className="text-[9px] text-[#888888]">{recordedAt}</p>
                  </div>
                  <p className="text-[#0D0D0D] text-sm whitespace-pre-wrap">
                    {obsData.observation as string}
                  </p>
                </div>
              );
            })}
          </div>
          {humanObservations.length > 5 && (
            <p className="text-[10px] text-[#888888] mt-4 font-medium">
              +{humanObservations.length - 5} more observations recorded
            </p>
          )}
        </div>
      )}

      {/* What We Still Need */}
      {questions.length > 0 && (
        <div className="bg-[#F0F0F0] border-l-4 border-l-[#BDBDBD] rounded-lg p-6 mb-8">
          <p className="text-[10px] font-semibold text-[#666666] uppercase tracking-[0.2em] mb-4">
            ? What We Still Need
          </p>

          <div className="space-y-2">
            {questions.slice(0, 3).map(q => (
              <div key={q.id} className="bg-white rounded-md p-3 border-l-2 border-l-[#BDBDBD]">
                <p className="text-[#0D0D0D] text-sm font-medium">{q.text}</p>
              </div>
            ))}
          </div>
          {questions.length > 3 && (
            <p className="text-[10px] text-[#888888] mt-4">
              +{questions.length - 3} more questions to explore
            </p>
          )}
        </div>
      )}

      {/* Priority Question */}
      {questions.length > 0 && (
        <div className="bg-white border-2 border-[#0D0D0D] rounded-lg p-6 mb-8">
          <p className="text-[10px] font-semibold text-[#0D0D0D] uppercase tracking-[0.2em] mb-3">
            → Ask First
          </p>
          <p className="text-[#0D0D0D] text-base font-semibold mb-2">
            "{questions[0].text}"
          </p>
          <p className="text-[#666666] text-sm">
            {questions[0].relevance}
          </p>
        </div>
      )}

      {/* Timeline */}
      {timeline.length > 0 && (
        <div className="bg-white border border-[#E8E8E8] rounded-2xl p-6">
          <p className="text-[10px] font-semibold text-[#888888] uppercase tracking-[0.2em] mb-4">
            Timeline
          </p>
          <div className="space-y-2">
            {timeline.map((event: Record<string, unknown>, idx) => (
              <div key={idx} className="flex gap-3">
                <p className="text-[#888888] text-xs min-w-[100px]">
                  {new Date(event.date as string).toLocaleDateString()}
                </p>
                <p className="text-[#0D0D0D] text-sm">{event.event as string}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
