"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

interface Prospect {
  id: string;
  businessName: string;
  businessCategory: string;
  email: string;
  phone?: string;
  status: string;
  leadState?: string;
  conversationEvents: Array<{
    id: string;
    type: string;
    direction: string;
    subject?: string;
    body?: string;
    createdAt: string;
  }>;
}

interface ContextPanelProps {
  prospect: Prospect | null;
  onProspectSelect: (prospect: Prospect) => void;
  refreshTrigger: number;
  onRefresh: () => void;
}

export function ContextPanel({
  prospect,
  refreshTrigger,
  onRefresh,
}: ContextPanelProps) {
  const searchParams = useSearchParams();
  const [emailSubject, setEmailSubject] = useState("");
  const [emailBody, setEmailBody] = useState("");
  const [sendingEmail, setSendingEmail] = useState(false);
  const [recordingResponse, setRecordingResponse] = useState(false);
  const [prospectData, setProspectData] = useState<Prospect | null>(prospect);

  useEffect(() => {
    const prospectId = searchParams.get("prospect");
    if (prospectId) {
      fetchProspect(prospectId);
    } else {
      setProspectData(prospect);
    }
  }, [prospect, refreshTrigger, searchParams]);

  const fetchProspect = async (prospectId: string) => {
    try {
      const response = await fetch(`/api/b2b/prospect/${prospectId}`);
      if (response.ok) {
        const data = await response.json();
        setProspectData(data);
      }
    } catch (error) {
      console.error("Failed to fetch prospect:", error);
    }
  };

  if (!prospectData) {
    return (
      <div className="w-96 bg-[#F5F5F5] border-l border-[#E8E8E8] flex flex-col items-center justify-center p-6">
        <p className="text-[#888888] text-sm">Select a prospect to begin</p>
      </div>
    );
  }

  const handleSendEmail = async () => {
    if (!emailSubject.trim() || !emailBody.trim()) {
      alert("Please fill in subject and body");
      return;
    }

    setSendingEmail(true);
    try {
      const response = await fetch("/api/b2b/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          leadId: prospectData.id,
          subject: emailSubject,
          body: emailBody,
          emailType: "manual",
        }),
      });

      if (response.ok) {
        setEmailSubject("");
        setEmailBody("");
        onRefresh();
      } else {
        alert("Failed to send email");
      }
    } catch (error) {
      console.error("Error sending email:", error);
      alert("Error sending email");
    } finally {
      setSendingEmail(false);
    }
  };

  const handleRecordResponse = async (responseType: "YES" | "NO") => {
    setRecordingResponse(true);
    try {
      const response = await fetch("/api/b2b/respond", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          leadId: prospectData.id,
          responseType,
        }),
      });

      if (response.ok) {
        onRefresh();
      } else {
        alert("Failed to record response");
      }
    } catch (error) {
      console.error("Error recording response:", error);
      alert("Error recording response");
    } finally {
      setRecordingResponse(false);
    }
  };

  const hasReplied =
    prospectData.conversationEvents.some((e) => e.type === "REPLIED_YES") ||
    prospectData.conversationEvents.some((e) => e.type === "REPLIED_NO");

  return (
    <div className="w-96 bg-[#F5F5F5] border-l border-[#E8E8E8] flex flex-col overflow-hidden">
      {/* HEADER */}
      <div className="p-6 border-b border-[#E8E8E8]">
        <h2 className="text-lg font-semibold text-[#0D0D0D]">
          {prospectData.businessName}
        </h2>
        <p className="text-xs text-[#888888] mt-1">{prospectData.businessCategory}</p>
        <div className="mt-3 flex items-center gap-2">
          <span
            className={`px-2 py-1 rounded-md text-xs font-medium ${
              prospectData.status === "warm"
                ? "bg-green-500 text-white"
                : prospectData.status === "contacted"
                  ? "bg-[#D1D1D1] text-[#0D0D0D]"
                  : "bg-[#E8E8E8] text-[#888888]"
            }`}
          >
            {prospectData.status}
          </span>
          <span className="text-xs text-[#888888]">{prospectData.email}</span>
        </div>
      </div>

      {/* SCROLLABLE CONTENT */}
      <div className="flex-1 overflow-y-auto px-6 py-4">
        {/* EMAIL SEND SECTION */}
        <div className="mb-6">
          <p className="text-xs font-semibold text-[#0D0D0D] mb-3 uppercase tracking-wider">
            Send Email
          </p>
          <div className="space-y-3">
            <input
              type="text"
              value={emailSubject}
              onChange={(e) => setEmailSubject(e.target.value)}
              placeholder="Subject"
              className="w-full bg-white border border-[#E8E8E8] rounded-lg px-3 py-2 text-sm text-[#0D0D0D] placeholder-[#888888] focus:outline-none focus:border-[#0D0D0D]"
              disabled={sendingEmail}
            />
            <textarea
              value={emailBody}
              onChange={(e) => setEmailBody(e.target.value)}
              placeholder="Email body"
              rows={4}
              className="w-full bg-white border border-[#E8E8E8] rounded-lg px-3 py-2 text-sm text-[#0D0D0D] placeholder-[#888888] focus:outline-none focus:border-[#0D0D0D] resize-none"
              disabled={sendingEmail}
            />
            <button
              onClick={handleSendEmail}
              disabled={sendingEmail}
              className="w-full bg-green-500 text-white py-2 rounded-lg text-sm font-semibold hover:bg-green-600 disabled:opacity-50"
            >
              {sendingEmail ? "Sending..." : "Send Email"}
            </button>
          </div>
        </div>

        {/* RESPONSE SECTION */}
        <div className="mb-6 pb-6 border-b border-[#E8E8E8]">
          <p className="text-xs font-semibold text-[#0D0D0D] mb-3 uppercase tracking-wider">
            Response
          </p>
          {hasReplied ? (
            <p className="text-xs text-[#888888]">Response already recorded</p>
          ) : (
            <div className="flex gap-2">
              <button
                onClick={() => handleRecordResponse("YES")}
                disabled={recordingResponse}
                className="flex-1 bg-green-500 text-white py-2 rounded-lg text-sm font-semibold hover:bg-green-600 disabled:opacity-50"
              >
                YES
              </button>
              <button
                onClick={() => handleRecordResponse("NO")}
                disabled={recordingResponse}
                className="flex-1 bg-red-500 text-white py-2 rounded-lg text-sm font-semibold hover:bg-red-600 disabled:opacity-50"
              >
                NO
              </button>
            </div>
          )}
        </div>

        {/* TIMELINE */}
        <div>
          <p className="text-xs font-semibold text-[#0D0D0D] mb-3 uppercase tracking-wider">
            Timeline
          </p>
          <div className="space-y-4">
            {prospectData.conversationEvents.length === 0 ? (
              <p className="text-xs text-[#888888]">No interactions yet</p>
            ) : (
              prospectData.conversationEvents.map((event) => (
                <div
                  key={event.id}
                  className="text-xs border-l border-[#E8E8E8] pl-3 py-1"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-sm">
                      {event.type === "EMAIL_SENT"
                        ? "📧"
                        : event.type === "REPLIED_YES"
                          ? "✅"
                          : event.type === "REPLIED_NO"
                            ? "❌"
                            : "•"}
                    </span>
                    <span className="text-[#888888]">
                      {event.type === "EMAIL_SENT"
                        ? "Email sent"
                        : event.type === "REPLIED_YES"
                          ? "Replied YES"
                          : "Replied NO"}
                    </span>
                  </div>
                  <span className="text-[#888888] text-xs">
                    {new Date(event.createdAt).toLocaleString()}
                  </span>
                  {event.subject && (
                    <p className="text-[#888888] mt-1">Subject: {event.subject}</p>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
