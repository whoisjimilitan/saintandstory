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
      <div className="mb-8">
        <p className="text-[10px] font-semibold text-[#888888] uppercase tracking-[0.2em] mb-1">
          B2B Lead Intelligence
        </p>
        <h1 className="font-sans font-black text-[#0D0D0D] text-3xl tracking-tight">
          {lead.business_name as string}
        </h1>
        <p className="text-[#888888] text-sm mt-2">
          {lead.niche as string} · {lead.city as string}
        </p>
      </div>

      {/* What we know */}
      <div className="bg-white border border-[#E8E8E8] rounded-2xl p-6 mb-6">
        <p className="text-[10px] font-semibold text-[#888888] uppercase tracking-[0.2em] mb-4">
          What we know
        </p>

        {evidence.review_count > 0 && (
          <div className="mb-4">
            <p className="text-[#0D0D0D] text-sm font-semibold">
              ✓ {evidence.review_count} customer reviews
            </p>
            {evidence.rating_average && (
              <p className="text-[#888888] text-xs mt-1">
                Average rating: {evidence.rating_average.toFixed(1)} stars
              </p>
            )}
          </div>
        )}

        {evidence.facts.length > 0 &&
          evidence.facts.map(fact => (
            <div key={fact.id} className="mb-3">
              <p className="text-[#0D0D0D] text-sm">✓ {fact.fact}</p>
            </div>
          ))}
      </div>

      {/* Observation Activity Card */}
      {humanObservations.length > 0 && (
        <div className="bg-[#F5F5F5] border border-[#E8E8E8] rounded-2xl p-6 mb-6">
          <p className="text-[10px] font-semibold text-[#888888] uppercase tracking-[0.2em] mb-4">
            Observation Activity
          </p>
          <div className="space-y-3">
            {humanObservations.slice(0, 5).map((obs, idx) => {
              const obsData = obs as Record<string, unknown>;
              const recordedAt = obsData.recorded_at ? new Date(obsData.recorded_at as string).toLocaleDateString() : "Unknown date";
              return (
                <div key={idx} className="bg-white rounded-lg p-3 border border-[#E8E8E8]">
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <p className="text-[10px] font-semibold text-[#888888] uppercase tracking-[0.5px]">
                      {obsData.context || "Note"}
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
            <p className="text-[10px] text-[#888888] mt-3">
              +{humanObservations.length - 5} more observations
            </p>
          )}
        </div>
      )}

      {/* What we don't know (questions) */}
      {questions.length > 0 && (
        <div className="bg-[#F5F5F5] border border-[#E8E8E8] rounded-2xl p-6 mb-6">
          <p className="text-[10px] font-semibold text-[#888888] uppercase tracking-[0.2em] mb-4">
            What we don&apos;t know
          </p>

          <div className="space-y-3">
            {questions.slice(0, 5).map(q => (
              <div key={q.id} className="bg-white rounded-lg p-3 border border-[#E8E8E8]">
                <p className="text-[#0D0D0D] text-sm font-semibold">? {q.text}</p>
                <p className="text-[#888888] text-xs mt-1">{q.relevance}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Suggested next step */}
      {questions.length > 0 && (
        <div className="bg-white border border-[#0D0D0D] rounded-2xl p-6 mb-6">
          <p className="text-[10px] font-semibold text-[#888888] uppercase tracking-[0.2em] mb-3">
            Suggested next step
          </p>
          <p className="text-[#0D0D0D] text-sm font-semibold">
            {questions[0].text}
          </p>
          <p className="text-[#888888] text-xs mt-2">
            Why: {questions[0].relevance}
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
