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
  reasoning?: {
    moment: string;
    insight: string;
    pressurePoint: string;
    service: string;
  };
}

interface SentEmail {
  id: string;
  leadId: string;
  prospectName: string;
  prospectEmail: string;
  city: string;
  subject: string;
  sentAt: string;
  replied: boolean;
  repliedAt?: string;
  engagementScore?: number;
  status: string;
}

type TabType = "draft" | "sent" | "standing-orders";

export default function EnrichPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const prospectId = searchParams.get("prospectId");
  const prospectIdsParam = searchParams.get("prospectIds");
  const isBatch = !!prospectIdsParam;
  const prospectIds = isBatch ? prospectIdsParam?.split(",") || [] : prospectId ? [prospectId] : [];

  const [activeTab, setActiveTab] = useState<TabType>("draft");
  const [generatedEmails, setGeneratedEmails] = useState<EnrichedEmail[]>([]);
  const [sentEmails, setSentEmails] = useState<SentEmail[]>([]);
  const [loading, setLoading] = useState(true);
  const [approving, setApproving] = useState(false);
  const [currentEmailIndex, setCurrentEmailIndex] = useState(0);

  // Fetch sent emails when component mounts or sent emails tab is opened
  useEffect(() => {
    if (activeTab === "sent") {
      fetchSentEmails();
    }
  }, [activeTab]);

  const fetchSentEmails = async () => {
    try {
      const res = await fetch("/api/b2b/sent-emails?limit=100");
      if (res.ok) {
        const data = await res.json();
        setSentEmails(data.sentEmails);
      }
    } catch (error) {
      console.error("Error fetching sent emails:", error);
    }
  };

  // Generate emails on mount if we have prospectIds
  useEffect(() => {
    if (prospectIds.length === 0) {
      router.push("/operator/discover");
      return;
    }

    const fetchAndGenerateEmails = async () => {
      try {
        console.log("Generating emails for prospectIds:", prospectIds);

        const res = await fetch("/api/b2b/batch-emails/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ prospectIds }),
        });

        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.error || `HTTP ${res.status}`);
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

      const data = await res.json();
      alert(`✓ Sent ${data.sent} emails successfully`);

      // Fetch updated sent emails and switch to sent tab
      await fetchSentEmails();
      setActiveTab("sent");
    } catch (error) {
      console.error("Error sending emails:", error);
      alert("Failed to send emails");
    } finally {
      setApproving(false);
    }
  };

  // Loading state
  if (loading && prospectIds.length > 0) {
    return (
      <div className="min-h-screen bg-white pt-20 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-[#E8E8E8] border-t-[#0D0D0D] rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-sm text-[#666666]">Generating emails...</p>
        </div>
      </div>
    );
  }

  // No data state
  if (activeTab === "draft" && generatedEmails.length === 0 && !loading) {
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
          <h1 className="text-2xl font-black text-[#0D0D0D] mb-2">Email Hub</h1>
          <p className="text-sm text-[#888888]">Draft, send, and track emails</p>
        </div>

        {/* Tabs */}
        <div className="mb-8 border-b border-[#E8E8E8] flex gap-8">
          <button
            onClick={() => setActiveTab("draft")}
            className={`pb-3 text-sm font-semibold transition-colors ${
              activeTab === "draft"
                ? "text-[#0D0D0D] border-b-2 border-[#0D0D0D]"
                : "text-[#888888] hover:text-[#0D0D0D]"
            }`}
          >
            Draft {generatedEmails.length > 0 && `(${generatedEmails.length})`}
          </button>
          <button
            onClick={() => setActiveTab("sent")}
            className={`pb-3 text-sm font-semibold transition-colors ${
              activeTab === "sent"
                ? "text-[#0D0D0D] border-b-2 border-[#0D0D0D]"
                : "text-[#888888] hover:text-[#0D0D0D]"
            }`}
          >
            Sent {sentEmails.length > 0 && `(${sentEmails.length})`}
          </button>
          <button
            onClick={() => setActiveTab("standing-orders")}
            className={`pb-3 text-sm font-semibold transition-colors ${
              activeTab === "standing-orders"
                ? "text-[#0D0D0D] border-b-2 border-[#0D0D0D]"
                : "text-[#888888] hover:text-[#0D0D0D]"
            }`}
          >
            Standing Orders
          </button>
        </div>

        {/* DRAFT TAB */}
        {activeTab === "draft" && (
          <>
            {generatedEmails.length > 0 && (
              <>
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

                    {currentEmail.reasoning && (
                      <div className="mt-6 pt-6 border-t border-[#E8E8E8]">
                        <p className="text-xs text-[#888888] uppercase font-semibold mb-3">Reasoning</p>
                        <div className="space-y-2 text-xs">
                          <div>
                            <p className="font-semibold text-[#0D0D0D]">Moment</p>
                            <p className="text-[#666666]">{currentEmail.reasoning.moment}</p>
                          </div>
                          <div>
                            <p className="font-semibold text-[#0D0D0D]">Insight</p>
                            <p className="text-[#666666]">{currentEmail.reasoning.insight}</p>
                          </div>
                        </div>
                      </div>
                    )}
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
              </>
            )}
          </>
        )}

        {/* SENT TAB */}
        {activeTab === "sent" && (
          <div>
            {sentEmails.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-sm text-[#666666]">No emails sent yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {sentEmails.map((email) => (
                  <div key={email.id} className="border border-[#E8E8E8] rounded-lg p-4 bg-[#F9F9F9] hover:bg-white transition-colors">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-[#0D0D0D]">{email.prospectName}</p>
                        <p className="text-xs text-[#888888]">{email.prospectEmail} • {email.city}</p>
                        <p className="text-xs text-[#666666] mt-1">{email.subject}</p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-xs text-[#888888]">
                          {new Date(email.sentAt).toLocaleDateString()}
                        </p>
                        <div className="mt-2 flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${email.replied ? "bg-[#0D0D0D]" : "bg-[#E8E8E8]"}`}></div>
                          <p className="text-xs font-semibold text-[#666666]">
                            {email.replied ? "Replied" : "Awaiting"}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* STANDING ORDERS TAB */}
        {activeTab === "standing-orders" && (
          <div className="text-center py-12">
            <p className="text-sm text-[#666666]">Standing orders coming soon</p>
            <p className="text-xs text-[#888888] mt-2">Auto-schedule follow-ups for prospects</p>
          </div>
        )}
      </div>
    </div>
  );
}
