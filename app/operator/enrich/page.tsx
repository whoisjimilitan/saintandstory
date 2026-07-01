"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";

interface Prospect {
  id: string;
  businessName: string;
  city: string;
  email: string;
  businessCategory: string;
  contactName?: string;
}

interface EnrichedEmail {
  prospectId: string;
  prospectName: string;
  businessName: string;
  city: string;
  email: string;
  subject: string;
  body: string;
  wordCount: number;
  senderName?: string;
  relationshipStage?: number;
  reasoning?: any;
}

interface SentEmail {
  id: string;
  prospectName: string;
  prospectEmail: string;
  subject: string;
  sentAt: string;
  replied: boolean;
}

type TabType = "draft" | "sent";

export default function EnrichPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user } = useUser();

  const mode = searchParams.get("mode") || "draft";
  const count = parseInt(searchParams.get("count") || "0");
  const batchId = searchParams.get("batch_id");

  const [activeTab, setActiveTab] = useState<TabType>("draft");
  const [prospects, setProspects] = useState<Prospect[]>([]);
  const [generatedEmails, setGeneratedEmails] = useState<EnrichedEmail[]>([]);
  const [sentEmails, setSentEmails] = useState<SentEmail[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [expandedEmailId, setExpandedEmailId] = useState<string | null>(null);

  // Email editing state
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editSubject, setEditSubject] = useState("");
  const [editBody, setEditBody] = useState("");
  const [templateMode, setTemplateMode] = useState<"master" | "batch" | null>(null);

  // Campaign metadata state
  const [campaignName, setCampaignName] = useState(`Campaign ${new Date().toLocaleDateString()}`);
  const [showSendConfirmation, setShowSendConfirmation] = useState(false);
  const [campaignSent, setCampaignSent] = useState(false);
  const [sentCampaignId, setSentCampaignId] = useState<string | null>(null);

  // FIXED: Warn before navigating with unsent emails
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (generatedEmails.length > 0 && activeTab === "draft") {
        e.preventDefault();
        e.returnValue = `You have ${generatedEmails.length} unsent emails. Are you sure you want to leave?`;
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [generatedEmails.length, activeTab]);

  useEffect(() => {
    // Batch mode: load from autonomous queue
    if (batchId) {
      loadBatchProspects(batchId);
      return;
    }

    // Traditional mode: load from sessionStorage
    const prospectData = sessionStorage.getItem("enrich_prospects");
    if (!prospectData) {
      router.push("/operator/discover");
      return;
    }

    try {
      const data = JSON.parse(prospectData) as Prospect[];
      setProspects(data);
      generateEmails(data);
      sessionStorage.removeItem("enrich_prospects");
    } catch (error) {
      console.error("Error parsing prospects:", error);
      router.push("/operator/discover");
    }
  }, [router, batchId]);

  const loadBatchProspects = async (batchId: string) => {
    try {
      const res = await fetch(`/api/b2b/orchestration/batch?batch_id=${batchId}`);
      if (!res.ok) throw new Error("Failed to load batch");

      const data = await res.json();
      const prospects = data.prospects as Prospect[];

      setProspects(prospects);
      generateEmails(prospects);
    } catch (error) {
      console.error("Error loading batch:", error);
      router.push("/operator/queue");
    } finally {
      setLoading(false);
    }
  };

  const generateEmails = async (prospectList: Prospect[]) => {
    try {
      const res = await fetch("/api/b2b/batch-emails/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prospects: prospectList }),
      });

      if (!res.ok) {
        throw new Error("Failed to generate emails");
      }

      const data = await res.json();

      // Combine prospect data with generated emails and substitute template variables
      const dayOfWeek = new Date().toLocaleDateString('en-US', { weekday: 'long' });

      const enriched = data.emails.map((email: any) => {
        const prospect = prospectList.find(p => p.id === email.prospectId);

        // Substitute template variables: {{businessName}}, {{day}}
        const subject = email.subject
          .replace(/{{businessName}}/g, prospect?.businessName || "")
          .replace(/{{day}}/g, dayOfWeek);

        const body = email.body
          .replace(/{{businessName}}/g, prospect?.businessName || "")
          .replace(/{{day}}/g, dayOfWeek);

        return {
          ...email,
          subject,
          body,
          email: prospect?.email || "",
          senderName: user?.firstName || "Team Member"
        };
      });

      setGeneratedEmails(enriched);
    } catch (error) {
      console.error("Error generating emails:", error);
      alert("Failed to generate emails");
      router.push("/operator/discover");
    } finally {
      setLoading(false);
    }
  };

  // Calculate tier breakdown from generated emails
  const getTierBreakdown = () => {
    const breakdown = { tier1: 0, tier2: 0, tier3: 0 };
    generatedEmails.forEach(email => {
      const prospect = prospects.find(p => p.id === email.prospectId);
      if (prospect && 'tier' in prospect) {
        const tier = (prospect as any).tier;
        if (tier === 1) breakdown.tier1++;
        else if (tier === 2) breakdown.tier2++;
        else breakdown.tier3++;
      }
    });
    return breakdown;
  };

  const handleSendAll = () => {
    // Show confirmation modal instead of immediately sending
    setShowSendConfirmation(true);
  };

  const confirmSend = async () => {
    setSending(true);
    try {
      console.log("[ENRICH] Sending campaign:", campaignName);

      // Build emails payload with full metadata for campaign tracking
      const emailsToSend = generatedEmails.map(email => {
        const prospect = prospects.find(p => p.id === email.prospectId);
        return {
          prospectId: email.prospectId,
          prospectName: prospect?.contactName || email.prospectName || "[Name]",
          prospectEmail: email.email,
          subject: email.subject,
          body: email.body,
          tier: email.characterMeta?.tier || 1,
          category: email.characterMeta?.category || "Business",
        };
      });

      console.log("[ENRICH] Campaign:", { campaignName, emails: emailsToSend.length });

      // Call new campaigns endpoint that saves to DB + sends emails
      const res = await fetch("/api/b2b/campaigns/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include", // CRITICAL: Include auth cookies
        body: JSON.stringify({
          campaignName: campaignName,
          channel: "email", // TODO: pull from DISCOVER selection
          emails: emailsToSend,
        }),
      });

      if (!res.ok) {
        const error = await res.json();
        console.error("[ENRICH] API error:", error);
        throw new Error(error.error || "Failed to send campaign");
      }

      const data = await res.json();
      console.log("[ENRICH] Campaign sent:", data);

      // Show sent emails with real campaign ID from database
      const sentList = generatedEmails.map(email => {
        const prospect = prospects.find(p => p.id === email.prospectId);
        return {
          id: email.prospectId,
          prospectName: prospect?.contactName || email.prospectName || "[Name]",
          prospectEmail: email.email,
          subject: email.subject,
          sentAt: new Date().toISOString(),
          replied: false
        };
      });

      setSentEmails(sentList);
      // Use real campaign ID from database response
      setSentCampaignId(data.campaignId);

      // Mark campaign as sent
      setCampaignSent(true);
      setShowSendConfirmation(false);

      // Clear draft after sending (emails can't be in both draft AND sent)
      setGeneratedEmails([]);
      setActiveTab("sent");
      setCurrentIndex(0);
    } catch (error) {
      console.error("Error sending campaign:", error);
      alert(`Failed to send: ${error instanceof Error ? error.message : "Unknown error"}`);
      setShowSendConfirmation(false);
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F9F9F9] pt-32 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-[#E8E8E8] border-t-[#0D0D0D] rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-sm text-[#666666]">Generating emails...</p>
        </div>
      </div>
    );
  }

  // Post-send success screen
  if (campaignSent && sentEmails.length > 0) {
    return (
      <div className="min-h-screen bg-[#F9F9F9] pt-32">
        <div className="max-w-2xl mx-auto px-4 md:px-0 py-12">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-[#0D0D0D] rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-3xl text-white">✓</span>
            </div>
            <h1 className="text-3xl font-black text-[#0D0D0D] mb-3">Campaign sent successfully</h1>
            <p className="text-lg text-[#666666] mb-8">
              {sentEmails.length} email{sentEmails.length !== 1 ? 's' : ''} queued for delivery
            </p>
          </div>

          <div className="border border-[#E8E8E8] rounded-lg p-8 bg-white mb-8">
            <div className="space-y-4">
              <div>
                <p className="text-xs text-[#888888] uppercase font-semibold mb-1">Campaign</p>
                <p className="text-lg font-semibold text-[#0D0D0D]">{campaignName}</p>
              </div>
              <div className="border-t border-[#E8E8E8] pt-4">
                <p className="text-xs text-[#888888] uppercase font-semibold mb-3">Tier breakdown</p>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm font-black text-[#0D0D0D]">{getTierBreakdown().tier1}</p>
                    <p className="text-xs text-[#888888]">Tier 1</p>
                  </div>
                  <div>
                    <p className="text-sm font-black text-[#0D0D0D]">{getTierBreakdown().tier2}</p>
                    <p className="text-xs text-[#888888]">Tier 2</p>
                  </div>
                  <div>
                    <p className="text-sm font-black text-[#0D0D0D]">{getTierBreakdown().tier3}</p>
                    <p className="text-xs text-[#888888]">Tier 3</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => router.push("/operator/reach")}
              className="flex-1 px-6 py-3 bg-[#0D0D0D] text-white rounded-lg text-sm font-semibold hover:bg-[#333333] transition-colors"
            >
              View in REACH
            </button>
            <button
              onClick={() => router.push("/operator/discover")}
              className="flex-1 px-6 py-3 border border-[#E8E8E8] text-[#0D0D0D] rounded-lg text-sm font-semibold hover:border-[#0D0D0D] transition-colors"
            >
              New Campaign
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (generatedEmails.length === 0 && activeTab === "draft") {
    return (
      <div className="min-h-screen bg-[#F9F9F9] pt-32 flex items-center justify-center">
        <p className="text-sm text-[#666666]">No emails generated</p>
      </div>
    );
  }

  const currentEmail = generatedEmails[currentIndex];

  return (
    <div className="min-h-screen bg-[#F9F9F9] pt-32">
      <div className="max-w-3xl mx-auto px-4 md:px-0 py-12">
        {/* Sub-Hero */}
        <p className="text-lg font-bold text-[#0D0D0D] mb-8 md:mb-12 pb-4 md:pb-8 border-b border-[#E8E8E8] leading-relaxed">
          Generate personalized emails and send to prospects
        </p>

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
            Draft ({generatedEmails.length})
          </button>
          <button
            onClick={() => setActiveTab("sent")}
            className={`pb-3 text-sm font-semibold transition-colors ${
              activeTab === "sent"
                ? "text-[#0D0D0D] border-b-2 border-[#0D0D0D]"
                : "text-[#888888] hover:text-[#0D0D0D]"
            }`}
          >
            Sent ({sentEmails.length})
          </button>
        </div>

        {/* DRAFT TAB */}
        {activeTab === "draft" && generatedEmails.length > 0 && (
          <>
            {/* Navigation */}
            <div className="mb-6 flex items-center justify-between p-4 bg-[#F5F5F5] rounded-lg">
              <button
                onClick={() => setCurrentIndex(Math.max(0, currentIndex - 1))}
                disabled={currentIndex === 0}
                className="px-4 py-2 text-sm font-semibold text-[#0D0D0D] disabled:text-[#CCCCCC] hover:bg-white rounded transition-colors"
              >
                ← Previous
              </button>
              <p className="text-sm font-semibold text-[#0D0D0D]">
                {currentIndex + 1} / {generatedEmails.length}
              </p>
              <button
                onClick={() => setCurrentIndex(Math.min(generatedEmails.length - 1, currentIndex + 1))}
                disabled={currentIndex === generatedEmails.length - 1}
                className="px-4 py-2 text-sm font-semibold text-[#0D0D0D] disabled:text-[#CCCCCC] hover:bg-white rounded transition-colors"
              >
                Next →
              </button>
            </div>

            {/* Email Preview */}
            <div className="border border-[#E8E8E8] rounded-lg p-8 bg-[#F9F9F9] mb-8">
              <div className="bg-white rounded p-6 space-y-4">
                {/* TO */}
                <div className="pb-4 border-b border-[#E8E8E8]">
                  <p className="text-xs text-[#888888] uppercase font-semibold mb-1">To</p>
                  <p className="text-sm font-semibold text-[#0D0D0D]">{currentEmail.email}</p>
                  <p className="text-xs text-[#666666] mt-1">{currentEmail.businessName} • {currentEmail.city}</p>
                </div>

                {/* SUBJECT */}
                <div className="pb-4 border-b border-[#E8E8E8]">
                  <p className="text-xs text-[#888888] uppercase font-semibold mb-1">Subject</p>
                  <p className="text-sm font-semibold text-[#0D0D0D]">{currentEmail.subject}</p>
                </div>

                {/* BODY */}
                <div>
                  <p className="text-xs text-[#888888] uppercase font-semibold mb-2">Message</p>
                  <div className="bg-[#F9F9F9] border border-[#E8E8E8] rounded p-4 font-mono text-xs text-[#0D0D0D] whitespace-pre-wrap leading-relaxed">
                    {currentEmail.body}
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setEditingIndex(currentIndex);
                  setEditSubject(currentEmail.subject);
                  setEditBody(currentEmail.body);
                }}
                className="flex-1 px-4 py-3 border border-[#0D0D0D] text-[#0D0D0D] text-xs font-semibold rounded hover:bg-[#F5F5F5] transition-colors flex items-center justify-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a2.25 2.25 0 112.828 2.828l-1.687 1.687m0 0a2.25 2.25 0 01-3.182 0m0 0l-6.364 6.364m0 0l1.414 1.414m0 0l6.364-6.364" />
                </svg>
                Edit & Personalize
              </button>
              <button
                onClick={handleSendAll}
                disabled={sending}
                className="flex-1 px-4 py-3 bg-[#0D0D0D] text-white text-xs font-semibold rounded hover:bg-[#333333] disabled:opacity-50 transition-colors"
              >
                {sending ? "Sending..." : `✓ Send All (${generatedEmails.length})`}
              </button>
              <button
                onClick={() => router.back()}
                className="px-4 py-3 border border-[#E8E8E8] text-[#0D0D0D] text-xs font-semibold rounded hover:bg-[#F5F5F5] transition-colors"
              >
                Cancel
              </button>
            </div>
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
                  <div
                    key={email.id}
                    onClick={() => setExpandedEmailId(expandedEmailId === email.id ? null : email.id)}
                    className="border border-[#E8E8E8] rounded-lg p-4 bg-[#F9F9F9] hover:bg-white cursor-pointer transition-colors"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-[#0D0D0D]">{email.prospectName}</p>
                        <p className="text-xs text-[#888888]">{email.prospectEmail}</p>
                        <p className="text-xs text-[#666666] mt-1">{email.subject}</p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-xs text-[#888888]">
                          {new Date(email.sentAt).toLocaleDateString()}
                        </p>
                        <div className="mt-2 flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-[#0D0D0D]"></div>
                          <p className="text-xs font-semibold text-[#666666]">Sent</p>
                        </div>
                      </div>
                    </div>

                    {/* Expanded View */}
                    {expandedEmailId === email.id && (
                      <div className="mt-4 pt-4 border-t border-[#E8E8E8] text-xs text-[#666666]">
                        <p className="font-semibold text-[#0D0D0D] mb-2">Message was sent to: {email.prospectEmail}</p>
                        <p className="text-[#888888]">Sent on {new Date(email.sentAt).toLocaleString()}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* EDITOR MODAL */}
        {editingIndex !== null && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              {/* Modal Header - Minimal */}
              <div className="sticky top-0 bg-white border-b border-[#E8E8E8] p-6 flex items-center justify-between">
                <h2 className="text-sm font-bold text-[#0D0D0D]">Edit Email</h2>
                <button
                  onClick={() => setEditingIndex(null)}
                  className="text-2xl text-[#888888] hover:text-[#0D0D0D]"
                >
                  ×
                </button>
              </div>

              {/* Modal Content - Pure Minimal */}
              <div className="p-6 space-y-4">
                {/* Subject Editor */}
                <div>
                  <input
                    type="text"
                    value={editSubject}
                    onChange={(e) => setEditSubject(e.target.value)}
                    placeholder="Subject"
                    className="w-full px-3 py-2 bg-[#F9F9F9] border-b border-[#E8E8E8] text-sm text-[#0D0D0D] rounded-none focus:outline-none focus:border-[#0D0D0D] transition-colors"
                  />
                </div>

                {/* Body Editor */}
                <div>
                  <textarea
                    value={editBody}
                    onChange={(e) => setEditBody(e.target.value)}
                    placeholder="Message"
                    rows={10}
                    className="w-full px-3 py-2 bg-[#F9F9F9] border-b border-[#E8E8E8] text-sm text-[#0D0D0D] rounded-none focus:outline-none focus:border-[#0D0D0D] transition-colors resize-none"
                  />
                </div>

                {/* Quick Preview - Silent */}
                <div className="bg-[#F9F9F9] border border-[#E8E8E8] rounded p-4 space-y-2">
                  {prospects.slice(0, 1).map((prospect, idx) => {
                    const subj = editSubject.replace(/{{businessName}}/g, prospect.businessName);
                    const body = editBody.replace(/{{businessName}}/g, prospect.businessName);
                    return (
                      <div key={idx}>
                        <p className="text-xs font-semibold text-[#0D0D0D]">{subj}</p>
                        <p className="text-xs text-[#666666] mt-1 whitespace-pre-wrap">{body}</p>
                      </div>
                    );
                  })}
                </div>

                {/* Save Options */}
                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => {
                      // Save to this email only
                      const updated = [...generatedEmails];
                      updated[editingIndex] = {
                        ...updated[editingIndex],
                        subject: editSubject,
                        body: editBody,
                      };
                      setGeneratedEmails(updated);
                      setEditingIndex(null);
                      alert("✓ Email updated for this batch");
                    }}
                    className="flex-1 px-4 py-3 bg-[#0D0D0D] text-white text-xs font-semibold rounded hover:bg-[#333333] transition-colors"
                  >
                    ✓ Save for This Batch
                  </button>
                  <button
                    onClick={() => {
                      // Save as master template
                      const updated = [...generatedEmails];
                      updated[editingIndex] = {
                        ...updated[editingIndex],
                        subject: editSubject,
                        body: editBody,
                      };
                      setGeneratedEmails(updated);
                      setEditingIndex(null);
                      sessionStorage.setItem("masterTemplate", JSON.stringify({
                        subject: editSubject,
                        body: editBody
                      }));
                      alert("✓ Saved as master template for future use");
                    }}
                    className="flex-1 px-4 py-3 border border-[#0D0D0D] text-[#0D0D0D] text-xs font-semibold rounded hover:bg-[#F5F5F5] transition-colors"
                  >
                    💾 Save as Master Template
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SEND CONFIRMATION MODAL */}
        {showSendConfirmation && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-md w-full">
              {/* Modal Header */}
              <div className="border-b border-[#E8E8E8] p-6">
                <h2 className="text-lg font-black text-[#0D0D0D]">Send Campaign?</h2>
              </div>

              {/* Modal Content */}
              <div className="p-6 space-y-6">
                <div>
                  <label className="text-xs font-semibold text-[#888888] uppercase block mb-2">Campaign Name</label>
                  <input
                    type="text"
                    value={campaignName}
                    onChange={(e) => setCampaignName(e.target.value)}
                    className="w-full px-4 py-3 border border-[#E8E8E8] rounded-lg text-sm text-[#0D0D0D] focus:border-[#0D0D0D] focus:outline-none"
                  />
                </div>

                <div className="bg-[#F9F9F9] border border-[#E8E8E8] rounded-lg p-4">
                  <p className="text-xs font-semibold text-[#0D0D0D] mb-3">Tier Breakdown</p>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="text-center">
                      <p className="text-2xl font-black text-[#0D0D0D]">{getTierBreakdown().tier1}</p>
                      <p className="text-[10px] text-[#888888] mt-1">Tier 1</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-black text-[#0D0D0D]">{getTierBreakdown().tier2}</p>
                      <p className="text-[10px] text-[#888888] mt-1">Tier 2</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-black text-[#0D0D0D]">{getTierBreakdown().tier3}</p>
                      <p className="text-[10px] text-[#888888] mt-1">Tier 3</p>
                    </div>
                  </div>
                  <div className="border-t border-[#E8E8E8] mt-4 pt-4">
                    <p className="text-sm font-black text-[#0D0D0D]">Total: {generatedEmails.length} emails</p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={confirmSend}
                    disabled={sending}
                    className="flex-1 px-4 py-3 bg-[#0D0D0D] text-white text-sm font-semibold rounded-lg hover:bg-[#333333] disabled:opacity-50 transition-colors"
                  >
                    {sending ? "Sending..." : "✓ Send Campaign"}
                  </button>
                  <button
                    onClick={() => setShowSendConfirmation(false)}
                    disabled={sending}
                    className="flex-1 px-4 py-3 border border-[#E8E8E8] text-[#0D0D0D] text-sm font-semibold rounded-lg hover:border-[#0D0D0D] disabled:opacity-50 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
