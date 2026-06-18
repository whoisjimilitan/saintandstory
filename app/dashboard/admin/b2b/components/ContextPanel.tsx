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
          leadId: prospectData?.id,
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
        const error = await response.json();
        alert(`Error: ${error.error}`);
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
          leadId: prospectData?.id,
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
    prospectData?.conversationEvents.some((e) => e.type === "REPLIED_YES") ||
    prospectData?.conversationEvents.some((e) => e.type === "REPLIED_NO");

  if (!prospectData) {
    return (
      <div className="w-80 border-l border-[#E8E8E8] bg-white px-6 py-10">
        <p className="text-sm text-[#888888]">Select a prospect to begin</p>
      </div>
    );
  }

  return (
    <div className="w-80 border-l border-[#E8E8E8] bg-white overflow-y-auto">
      <div className="px-6 py-10 space-y-16">
        {/* PROSPECT HEADER */}
        <div className="space-y-4">
          <div>
            <h2 className="text-lg font-black text-[#0D0D0D] tracking-tight">
              {prospectData.businessName}
            </h2>
            <p className="text-sm text-[#888888] mt-2">
              {prospectData.businessCategory}
            </p>
          </div>

          <div className="flex items-center gap-3 pt-4 border-t border-[#E8E8E8]">
            <div
              className={`h-3 w-3 rounded-full ${
                prospectData.status === "warm"
                  ? "bg-[#0A66C2]"
                  : prospectData.status === "contacted"
                    ? "bg-[#666666]"
                    : "bg-[#E8E8E8]"
              }`}
            />
            <span className="text-[10px] uppercase tracking-[0.2em] text-[#888888]">
              {prospectData.status}
            </span>
          </div>

          <p className="text-xs text-[#888888]">{prospectData.email}</p>
        </div>

        {/* EMAIL COMPOSER */}
        <div className="space-y-4">
          <h3 className="text-[10px] uppercase tracking-[0.2em] font-medium text-[#0D0D0D]">
            Send Email
          </h3>

          <input
            type="text"
            value={emailSubject}
            onChange={(e) => setEmailSubject(e.target.value)}
            placeholder="Subject"
            className="w-full text-sm bg-[#F5F5F5] border border-[#E8E8E8] px-3 py-2 text-[#0D0D0D] placeholder-[#888888] focus:outline-none focus:border-[#0D0D0D]"
            disabled={sendingEmail}
          />

          <textarea
            value={emailBody}
            onChange={(e) => setEmailBody(e.target.value)}
            placeholder="Message"
            rows={5}
            className="w-full text-sm bg-[#F5F5F5] border border-[#E8E8E8] px-3 py-2 text-[#0D0D0D] placeholder-[#888888] focus:outline-none focus:border-[#0D0D0D] resize-none"
            disabled={sendingEmail}
          />

          <button
            onClick={handleSendEmail}
            disabled={sendingEmail}
            className="w-full text-sm font-medium text-[#0D0D0D] border border-[#0D0D0D] px-3 py-2 hover:bg-[#0D0D0D] hover:text-white transition-colors disabled:opacity-50"
          >
            {sendingEmail ? "Sending..." : "Send"}
          </button>
        </div>

        {/* RESPONSE ACTIONS */}
        <div className="space-y-4">
          <h3 className="text-[10px] uppercase tracking-[0.2em] font-medium text-[#0D0D0D]">
            Response
          </h3>

          {hasReplied ? (
            <p className="text-sm text-[#888888]">Response recorded</p>
          ) : (
            <div className="flex gap-2">
              <button
                onClick={() => handleRecordResponse("YES")}
                disabled={recordingResponse}
                className="flex-1 text-sm font-medium text-white bg-[#0D0D0D] px-3 py-2 hover:opacity-80 transition-opacity disabled:opacity-50"
              >
                YES
              </button>
              <button
                onClick={() => handleRecordResponse("NO")}
                disabled={recordingResponse}
                className="flex-1 text-sm font-medium text-[#DC2626] border border-[#DC2626] px-3 py-2 hover:bg-[#DC2626] hover:text-white transition-colors disabled:opacity-50"
              >
                NO
              </button>
            </div>
          )}
        </div>

        {/* TIMELINE */}
        <div className="space-y-6">
          <h3 className="text-[10px] uppercase tracking-[0.2em] font-medium text-[#0D0D0D]">
            Interactions
          </h3>

          {prospectData.conversationEvents.length === 0 ? (
            <p className="text-sm text-[#888888]">No interactions yet</p>
          ) : (
            <div className="space-y-8">
              {prospectData.conversationEvents.map((event, idx) => (
                <div key={event.id} className="space-y-2">
                  <div className="flex items-baseline gap-2">
                    <span className="text-[10px] uppercase tracking-[0.2em] text-[#888888] font-medium">
                      {event.type === "EMAIL_SENT"
                        ? "Email"
                        : event.type === "REPLIED_YES"
                          ? "Reply"
                          : "No Reply"}
                    </span>
                    <span className="text-[10px] text-[#888888]">
                      {new Date(event.createdAt).toLocaleDateString()} at{" "}
                      {new Date(event.createdAt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>

                  {event.subject && (
                    <p className="text-sm text-[#0D0D0D]">{event.subject}</p>
                  )}

                  {idx < prospectData.conversationEvents.length - 1 && (
                    <div className="mt-4 border-t border-[#E8E8E8]" />
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
