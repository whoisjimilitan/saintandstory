"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";

interface V3Reasoning {
  moment: string;
  insight: string;
  inverse: string;
  service: string;
  ask: string;
}

interface EnrichedProspect {
  id: string;
  businessName: string;
  contactName?: string;
  businessCategory?: string;
  city?: string;
  email?: string;
  reasoning: V3Reasoning;
  generatedEmail: {
    subject: string;
    body: string;
    wordCount: number;
  };
  qualityScore: number;
}

export default function EnrichPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const prospectId = searchParams.get("prospectId");

  const [prospect, setProspect] = useState<EnrichedProspect | null>(null);
  const [loading, setLoading] = useState(true);
  const [approving, setApproving] = useState(false);
  const [editedEmail, setEditedEmail] = useState("");

  useEffect(() => {
    if (!prospectId) {
      router.push("/operator/discover");
      return;
    }

    const fetchEnrichedProspect = async () => {
      try {
        // In full system: fetch from autonomous engine
        // For now: placeholder
        const res = await fetch(`/api/b2b/prospect/${prospectId}`);
        if (!res.ok) throw new Error("Failed to load prospect");
        const data = await res.json();
        
        // Mock enrichment data (autonomous engine would provide this)
        const enriched: EnrichedProspect = {
          id: data.id,
          businessName: data.businessName,
          contactName: data.contactName,
          businessCategory: data.businessCategory,
          city: data.city,
          email: data.email,
          reasoning: {
            moment: `It's ${getRandomTime()}. ${getMomentForCategory(data.businessCategory, data.city)}.`,
            insight: getInsightForCategory(data.businessCategory),
            inverse: getInverseForCategory(data.businessCategory),
            service: `help ${data.city} ${data.businessCategory?.replace("-", " ")} ${getServiceForCategory(data.businessCategory)}`,
            ask: "one word back—yes, maybe, or no—and we'll both know if there's something here worth exploring",
          },
          generatedEmail: {
            subject: getSubjectForCategory(data.businessCategory),
            body: generateEmailBody(data, getInsightForCategory(data.businessCategory)),
            wordCount: 0,
          },
          qualityScore: Math.floor(Math.random() * 20) + 80, // 80-100
        };

        enriched.generatedEmail.wordCount = enriched.generatedEmail.body.split(/\s+/).length;
        setProspect(enriched);
        setEditedEmail(enriched.generatedEmail.body);
      } catch (error) {
        console.error("Error loading prospect:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchEnrichedProspect();
  }, [prospectId, router]);

  const handleApprove = async () => {
    if (!prospect) return;

    setApproving(true);
    try {
      // Save approval and send email
      const res = await fetch(`/api/b2b/batch-emails/send`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          emails: [
            {
              prospectId: prospect.id,
              subject: prospect.generatedEmail.subject,
              body: editedEmail,
            },
          ],
        }),
      });

      if (!res.ok) throw new Error("Failed to send email");

      // Navigate to outreach to see responses
      router.push(`/operator/outreach?prospectId=${prospect.id}&sent=true`);
    } catch (error) {
      console.error("Error approving:", error);
      alert("Failed to approve email");
    } finally {
      setApproving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white pt-20 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-[#E8E8E8] border-t-[#0D0D0D] rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-sm text-[#666666]">Enriching prospect...</p>
        </div>
      </div>
    );
  }

  if (!prospect) {
    return (
      <div className="min-h-screen bg-white pt-20 flex items-center justify-center">
        <p className="text-sm text-[#666666]">Prospect not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white pt-20">
      <div className="max-w-6xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-black text-[#0D0D0D]">
                {prospect.businessName}
              </h1>
              <p className="text-xs text-[#888888] mt-1">
                {prospect.city} • {prospect.businessCategory}
              </p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-black text-[#0D0D0D]">
                {prospect.qualityScore}
              </div>
              <p className="text-[10px] text-[#888888] uppercase">Quality Score</p>
            </div>
          </div>
        </div>

        {/* V3 Reasoning Breakdown */}
        <div className="grid grid-cols-5 gap-3 mb-8">
          {[
            { label: "MOMENT", value: prospect.reasoning.moment, color: "bg-blue-50 border-blue-200" },
            { label: "INSIGHT", value: prospect.reasoning.insight, color: "bg-purple-50 border-purple-200" },
            { label: "INVERSE", value: prospect.reasoning.inverse, color: "bg-amber-50 border-amber-200" },
            { label: "SERVICE", value: prospect.reasoning.service, color: "bg-green-50 border-green-200" },
            { label: "ASK", value: prospect.reasoning.ask, color: "bg-rose-50 border-rose-200" },
          ].map((item) => (
            <div key={item.label} className={`${item.color} border rounded-lg p-3`}>
              <p className="text-[10px] font-semibold text-[#0D0D0D] uppercase mb-2">
                {item.label}
              </p>
              <p className="text-xs text-[#666666] leading-snug">{item.value}</p>
            </div>
          ))}
        </div>

        {/* Generated Email */}
        <div className="border border-[#E8E8E8] rounded-lg p-6 mb-8 bg-[#F9F9F9]">
          <h2 className="text-xs font-semibold text-[#0D0D0D] uppercase tracking-[0.15em] mb-4">
            Generated Email (Editable)
          </h2>

          <div className="bg-white rounded p-4 space-y-4">
            <div>
              <p className="text-[10px] text-[#888888] uppercase font-semibold mb-2">
                Subject
              </p>
              <p className="text-sm font-semibold text-[#0D0D0D]">
                {prospect.generatedEmail.subject}
              </p>
            </div>

            <div className="border-t border-[#E8E8E8] pt-4">
              <p className="text-[10px] text-[#888888] uppercase font-semibold mb-2">
                Body
              </p>
              <textarea
                value={editedEmail}
                onChange={(e) => setEditedEmail(e.target.value)}
                className="w-full h-48 p-3 border border-[#E8E8E8] rounded text-sm text-[#0D0D0D] font-mono focus:outline-none focus:border-[#0D0D0D]"
              />
              <p className="text-[10px] text-[#888888] mt-2">
                {editedEmail.split(/\s+/).length} words (target: 60-80)
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            onClick={handleApprove}
            disabled={approving}
            className="flex-1 px-4 py-3 bg-[#0D0D0D] text-white text-xs font-semibold rounded hover:bg-[#333333] disabled:opacity-50 transition-colors"
          >
            {approving ? "Approving..." : "✓ Approve & Send"}
          </button>
          <button
            onClick={() => router.back()}
            className="flex-1 px-4 py-3 border border-[#E8E8E8] text-[#0D0D0D] text-xs font-semibold rounded hover:bg-[#F5F5F5] transition-colors"
          >
            Reject
          </button>
        </div>
      </div>
    </div>
  );
}

// Helper functions
function getRandomTime() {
  const hours = Math.floor(Math.random() * 12) + 1;
  const mins = Math.random() > 0.5 ? "15" : "45";
  const period = Math.random() > 0.5 ? "pm" : "am";
  return `${hours}:${mins}${period}`;
}

function getMomentForCategory(category: string, city: string): string {
  const moments: Record<string, string> = {
    "law-firm": `You're in the office wondering how files get to court by morning when your supplier closed at 4pm.`,
    "removals": `Your first job is running 30 mins over. Second family arriving in 15 minutes.`,
    "pharmacy": `Customer walks in needing urgent medication. Your supplier stops calls at 4pm.`,
    "restaurant": `Delivery just arrived. Service starts in 3 minutes. Sous chef asking where the main ingredient is.`,
    "ecommerce": `Orders surge. Warehouse is tight. Fulfillment deadline is tonight.`,
  };
  return moments[category] || `You're in ${city} managing a critical business moment.`;
}

function getInsightForCategory(category: string): string {
  const insights: Record<string, string> = {
    "law-firm": `What's being tested isn't your speed. It's whether you had a plan for this gap.`,
    "removals": `What matters isn't having another van. It's having a buffer for Saturday cascades.`,
    "pharmacy": `What matters isn't knowing 10 pharmacies. It's having ONE that answers when you need them.`,
    "restaurant": `What matters isn't improvising fast. It's planning for supply to arrive before service.`,
    "ecommerce": `What matters isn't warehouse space. It's having capacity when your peak actually hits.`,
  };
  return insights[category] || `What matters is having a system, not luck.`;
}

function getInverseForCategory(category: string): string {
  return `If you've figured this out months ago, ignore this.`;
}

function getServiceForCategory(category: string): string {
  const services: Record<string, string> = {
    "law-firm": `get documents to court same day, or build retainer solutions`,
    "removals": `coordinate scheduling same-day, or manage weekend overflow`,
    "pharmacy": `get urgent prescriptions fulfilled, or manage supply pressure`,
    "restaurant": `get supplies before service, or manage prep-time pressure`,
    "ecommerce": `manage order surge, or build predictable capacity`,
  };
  return services[category] || `help you solve this`;
}

function getSubjectForCategory(category: string): string {
  const subjects: Record<string, string> = {
    "law-firm": `Only if this is your Thursday`,
    "removals": `Not for everyone`,
    "pharmacy": `Might not apply`,
    "restaurant": `Only if this is your reality`,
    "ecommerce": `If this is familiar`,
  };
  return subjects[category] || `Quick question`;
}

function generateEmailBody(prospect: any, insight: string): string {
  const moment = getMomentForCategory(prospect.businessCategory, prospect.city);
  const inverse = getInverseForCategory(prospect.businessCategory);
  const service = getServiceForCategory(prospect.businessCategory);
  const ask = `one word back—yes, maybe, or no—and we'll both know if there's something here worth exploring`;

  return `Hi ${prospect.contactName || "there"},

${moment}

In that moment, ${insight}

${inverse}

If you didn't—we ${service}.

If this is your reality, ${ask}.

Best`;
}
