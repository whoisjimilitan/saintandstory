"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";

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

  const mode = searchParams.get("mode") || "draft";
  const count = parseInt(searchParams.get("count") || "0");

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

  useEffect(() => {
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
  }, [router]);

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

      // Combine prospect data with generated emails
      const enriched = data.emails.map((email: any) => ({
        ...email,
        email: prospectList.find(p => p.id === email.prospectId)?.email || ""
      }));

      setGeneratedEmails(enriched);
    } catch (error) {
      console.error("Error generating emails:", error);
      alert("Failed to generate emails");
      router.push("/operator/discover");
    } finally {
      setLoading(false);
    }
  };

  const handleSendAll = async () => {
    setSending(true);
    try {
      const res = await fetch("/api/b2b/batch-emails/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          emails: generatedEmails.map(email => ({
            prospectId: email.prospectId,
            subject: email.subject,
            body: email.body,
          })),
        }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to send");
      }

      const data = await res.json();

      // Show sent emails
      const sentList = generatedEmails.map(email => ({
        id: email.prospectId,
        prospectName: email.businessName,
        prospectEmail: email.email,
        subject: email.subject,
        sentAt: new Date().toISOString(),
        replied: false
      }));

      setSentEmails(sentList);
      setActiveTab("sent");
      alert(`✓ Sent ${data.sent} emails successfully`);
    } catch (error) {
      console.error("Error sending:", error);
      alert(`Failed to send: ${error instanceof Error ? error.message : "Unknown error"}`);
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
                  <p className="text-xs text-[#888888] mt-2">{currentEmail.wordCount} words</p>
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
                className="flex-1 px-4 py-3 border border-[#0D0D0D] text-[#0D0D0D] text-xs font-semibold rounded hover:bg-[#F5F5F5] transition-colors"
              >
                ✏️ Edit & Personalize
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
              {/* Modal Header */}
              <div className="sticky top-0 bg-white border-b border-[#E8E8E8] p-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-bold text-[#0D0D0D]">Edit & Personalize Email</h2>
                  <button
                    onClick={() => setEditingIndex(null)}
                    className="text-2xl text-[#888888] hover:text-[#0D0D0D]"
                  >
                    ×
                  </button>
                </div>
                <p className="text-xs text-[#666666] mt-2">
                  Hint: Type {'{{businessName}}'} in subject or message to personalize emails for each prospect
                </p>
              </div>

              {/* Modal Content */}
              <div className="p-6 space-y-6">
                {/* Subject Editor */}
                <div>
                  <label className="text-xs font-semibold text-[#0D0D0D] uppercase mb-2 block">Subject</label>
                  <input
                    type="text"
                    value={editSubject}
                    onChange={(e) => setEditSubject(e.target.value)}
                    className="w-full px-4 py-2 bg-[#F9F9F9] border border-[#E8E8E8] text-sm text-[#0D0D0D] rounded focus:outline-none focus:border-[#0D0D0D] transition-colors"
                  />
                </div>

                {/* Body Editor */}
                <div>
                  <label className="text-xs font-semibold text-[#0D0D0D] uppercase mb-2 block">Message</label>
                  <textarea
                    value={editBody}
                    onChange={(e) => setEditBody(e.target.value)}
                    rows={8}
                    className="w-full px-4 py-3 bg-[#F9F9F9] border border-[#E8E8E8] text-sm text-[#0D0D0D] font-mono rounded focus:outline-none focus:border-[#0D0D0D] transition-colors resize-none"
                  />
                  <p className="text-xs text-[#888888] mt-2">Use {'{{businessName}}'} to insert prospect business name</p>
                </div>

                {/* Preview with Substitutions */}
                <div className="bg-[#F5F5F5] border-2 border-[#E8E8E8] rounded p-4 space-y-3">
                  <p className="text-xs font-semibold text-[#0D0D0D] uppercase">Preview (first 3 prospects)</p>
                  <div className="space-y-2">
                    {prospects.slice(0, 3).map((prospect, idx) => {
                      const subj = editSubject.replace(/{{businessName}}/g, prospect.businessName);
                      const body = editBody.replace(/{{businessName}}/g, prospect.businessName);
                      return (
                        <div key={idx} className="bg-white border border-[#E8E8E8] rounded p-3">
                          <p className="text-xs text-[#888888]">{prospect.businessName}</p>
                          <p className="text-xs font-semibold text-[#0D0D0D] mt-1">{subj}</p>
                          <p className="text-xs text-[#666666] mt-1 whitespace-pre-wrap">{body.substring(0, 100)}...</p>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Variable Guide */}
                <div className="bg-[#F9F9F9] border border-[#E8E8E8] rounded p-3">
                  <p className="text-xs font-semibold text-[#0D0D0D] mb-2">Available Variables:</p>
                  <div className="grid grid-cols-2 gap-2">
                    <p className="text-xs text-[#666666]">{'{{businessName}}'} = Business name</p>
                    <p className="text-xs text-[#666666]">Example: "Hi {'{{businessName}}'}  "</p>
                  </div>
                </div>

                {/* Save Options */}
                <div className="flex gap-3">
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
      </div>
    </div>
  );
}
