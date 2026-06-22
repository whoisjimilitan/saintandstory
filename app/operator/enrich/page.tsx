"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";

interface Prospect {
  id: string;
  businessName: string;
  contactName?: string;
  city?: string;
  email?: string;
}

interface EnrichedEmail {
  prospectId: string;
  prospectName: string;
  businessName: string;
  city: string;
  subject: string;
  body: string;
  wordCount: number;
}

export default function EnrichPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  // Support both single prospectId and batch prospectIds
  const prospectId = searchParams.get("prospectId");
  const prospectIdsParam = searchParams.get("prospectIds");
  const isBatch = !!prospectIdsParam;
  const prospectIds = isBatch ? prospectIdsParam?.split(",") || [] : prospectId ? [prospectId] : [];

  const [prospects, setProspects] = useState<Prospect[]>([]);
  const [generatedEmails, setGeneratedEmails] = useState<EnrichedEmail[]>([]);
  const [loading, setLoading] = useState(true);
  const [approving, setApproving] = useState(false);
  const [currentEmailIndex, setCurrentEmailIndex] = useState(0);

  useEffect(() => {
    if (prospectIds.length === 0) {
      router.push("/operator/discover");
      return;
    }

    const fetchAndGenerateEmails = async () => {
      try {
        // Generate emails for all prospects
        console.log("Generating emails for prospectIds:", prospectIds);

        const res = await fetch("/api/b2b/batch-emails/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ prospectIds }),
        });

        if (!res.ok) {
          const errorData = await res.json();
          const errorMsg = errorData.error || `HTTP ${res.status}`;
          throw new Error(errorMsg);
        }

        const data = await res.json();
        console.log("Generated emails:", data.emails?.length);
        setGeneratedEmails(data.emails);
      } catch (error) {
        const message = error instanceof Error ? error.message : "Failed to generate emails";
        console.error("Error generating emails:", message);
        alert(message);
        router.back();
      } finally {
        setLoading(false);
      }
    };

    fetchAndGenerateEmails();
  }, [prospectIds, router]);

  const handleApproveAll = async () => {
    setApproving(true);
    try {
      const res = await fetch("/api/b2b/batch-emails/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          emails: generatedEmails.map((email) => ({
            prospectId: email.prospectId,
            subject: email.subject,
            body: email.body,
          })),
        }),
      });

      if (!res.ok) throw new Error("Failed to send emails");

      alert(`✓ Sent ${generatedEmails.length} emails successfully`);
      router.push("/operator/discover");
    } catch (error) {
      console.error("Error sending emails:", error);
      alert("Failed to send emails");
    } finally {
      setApproving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white pt-20 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-[#E8E8E8] border-t-[#0D0D0D] rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-sm text-[#666666]">Generating emails...</p>
        </div>
      </div>
    );
  }

  if (generatedEmails.length === 0) {
    return (
      <div className="min-h-screen bg-white pt-20 flex items-center justify-center">
        <p className="text-sm text-[#666666]">No emails generated</p>
      </div>
    );
  }

  const currentEmail = generatedEmails[currentEmailIndex];

  return (
    <div className="min-h-screen bg-white pt-20">
      <div className="max-w-4xl mx-auto px-4 md:px-0 py-12">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-black text-[#0D0D0D] mb-2">
            {isBatch ? `Review & Send (${generatedEmails.length} emails)` : "Enrich & Approve"}
          </h1>
          <p className="text-sm text-[#888888]">
            {isBatch 
              ? `Preview emails before sending to all ${generatedEmails.length} prospects`
              : "Review the generated email"}
          </p>
        </div>

        {/* Batch Navigation */}
        {isBatch && generatedEmails.length > 1 && (
          <div className="mb-8 flex items-center justify-between p-4 bg-[#F5F5F5] rounded-lg">
            <button
              onClick={() => setCurrentEmailIndex(Math.max(0, currentEmailIndex - 1))}
              disabled={currentEmailIndex === 0}
              className="px-4 py-2 text-sm font-semibold text-[#0D0D0D] disabled:text-[#CCCCCC] hover:bg-white rounded transition-colors"
            >
              ← Previous
            </button>
            <p className="text-sm font-semibold text-[#0D0D0D]">
              {currentEmailIndex + 1} / {generatedEmails.length}
            </p>
            <button
              onClick={() => setCurrentEmailIndex(Math.min(generatedEmails.length - 1, currentEmailIndex + 1))}
              disabled={currentEmailIndex === generatedEmails.length - 1}
              className="px-4 py-2 text-sm font-semibold text-[#0D0D0D] disabled:text-[#CCCCCC] hover:bg-white rounded transition-colors"
            >
              Next →
            </button>
          </div>
        )}

        {/* Email Preview */}
        <div className="border border-[#E8E8E8] rounded-lg p-8 bg-[#F9F9F9] mb-8">
          <div className="bg-white rounded p-6">
            <div className="mb-4 pb-4 border-b border-[#E8E8E8]">
              <p className="text-xs text-[#888888] uppercase font-semibold mb-1">To</p>
              <p className="text-sm font-semibold text-[#0D0D0D]">
                {currentEmail.prospectName} ({currentEmail.businessName}) • {currentEmail.city}
              </p>
            </div>

            <div className="mb-4 pb-4 border-b border-[#E8E8E8]">
              <p className="text-xs text-[#888888] uppercase font-semibold mb-1">Subject</p>
              <p className="text-sm font-semibold text-[#0D0D0D]">{currentEmail.subject}</p>
            </div>

            <div>
              <p className="text-xs text-[#888888] uppercase font-semibold mb-2">Body</p>
              <div className="bg-white border border-[#E8E8E8] rounded p-4 font-mono text-xs text-[#0D0D0D] whitespace-pre-wrap leading-relaxed">
                {currentEmail.body}
              </div>
              <p className="text-xs text-[#888888] mt-2">
                {currentEmail.wordCount} words (target: 60-80)
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            onClick={handleApproveAll}
            disabled={approving}
            className="flex-1 px-4 py-3 bg-[#0D0D0D] text-white text-xs font-semibold rounded hover:bg-[#333333] disabled:opacity-50 transition-colors"
          >
            {approving ? "Sending..." : `✓ Send All (${generatedEmails.length})`}
          </button>
          <button
            onClick={() => router.back()}
            className="flex-1 px-4 py-3 border border-[#E8E8E8] text-[#0D0D0D] text-xs font-semibold rounded hover:bg-[#F5F5F5] transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
