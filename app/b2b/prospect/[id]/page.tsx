"use client";

import { useEffect, useState, use } from "react";

interface ConversationEvent {
  id: string;
  type: string;
  direction: string;
  subject?: string;
  body?: string;
  createdAt: string;
}

interface ProspectDetail {
  id: string;
  businessName: string;
  businessCategory?: string;
  email?: string;
  phone?: string;
  status: string;
  leadState?: string;
  conversationEvents: ConversationEvent[];
}

function deriveProspectState(events: ConversationEvent[]): string {
  if (events.length === 0) return "NO_RESPONSE";

  const hasReplyYes = events.some((e) => e.type === "REPLIED_YES");
  const hasReplyNo = events.some((e) => e.type === "REPLIED_NO");
  const hasOpened = events.some((e) => e.type === "EMAIL_OPENED");
  const hasClicked = events.some((e) => e.type === "CLICKED");

  if (hasReplyYes) return "POSITIVE";
  if (hasReplyNo) return "NEGATIVE";
  if (hasOpened || hasClicked) return "ENGAGED";

  return "NO_RESPONSE";
}

function getEventIcon(type: string): string {
  const icons: Record<string, string> = {
    EMAIL_SENT: "📧",
    EMAIL_OPENED: "👁️",
    CLICKED: "🔗",
    REPLIED_YES: "✅",
    REPLIED_NO: "❌",
  };
  return icons[type] || "•";
}

function getEventLabel(type: string): string {
  const labels: Record<string, string> = {
    EMAIL_SENT: "Email sent",
    EMAIL_OPENED: "Opened",
    CLICKED: "Clicked link",
    REPLIED_YES: "Replied YES",
    REPLIED_NO: "Replied NO",
  };
  return labels[type] || type;
}

export default function ProspectPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [prospect, setProspect] = useState<ProspectDetail | null>(null);
  const [prospectState, setProspectState] = useState<string>("NO_RESPONSE");
  const [lastActivity, setLastActivity] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [emailSubject, setEmailSubject] = useState("");
  const [emailBody, setEmailBody] = useState("");
  const [sendingEmail, setSendingEmail] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [recordingResponse, setRecordingResponse] = useState(false);
  const [responseRecorded, setResponseRecorded] = useState(false);

  const refreshProspect = async () => {
    try {
      const response = await fetch(`/api/b2b/prospect/${id}`);
      if (response.ok) {
        const data = await response.json();
        setProspect(data);

        // Derive state from events
        const state = deriveProspectState(data.conversationEvents);
        setProspectState(state);

        // Get last activity
        if (data.conversationEvents.length > 0) {
          const lastEvent = data.conversationEvents[0];
          setLastActivity(
            new Date(lastEvent.createdAt).toLocaleDateString()
          );
        }
      }
    } catch (error) {
      console.error("Failed to fetch prospect:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshProspect();
  }, [id]);

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
          leadId: id,
          subject: emailSubject,
          body: emailBody,
          emailType: "manual",
        }),
      });

      if (response.ok) {
        setEmailSent(true);
        setEmailSubject("");
        setEmailBody("");
        setTimeout(() => setEmailSent(false), 3000);
        // Refresh prospect data to show new event
        await refreshProspect();
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
    // Find the most recent outreach
    const lastEmailEvent = prospect?.conversationEvents.find(
      (e) => e.type === "EMAIL_SENT"
    );
    if (!lastEmailEvent) {
      alert("No email found to respond to");
      return;
    }

    setRecordingResponse(true);
    try {
      // We need the outreachId, but it's in metadata. For now, we'll need to fetch it
      // Actually, we should store outreachId in the conversation event
      const response = await fetch("/api/b2b/respond", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          leadId: id,
          responseType,
        }),
      });

      if (response.ok) {
        setResponseRecorded(true);
        setTimeout(() => setResponseRecorded(false), 3000);
        // Refresh prospect data to show new event
        await refreshProspect();
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

  if (loading) return <div className="p-6">Loading...</div>;
  if (!prospect) return <div className="p-6">Prospect not found</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto p-6">
        {/* HEADER */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {prospect.businessName}
              </h1>
              <p className="text-gray-600 mt-1">{prospect.businessCategory}</p>
            </div>
            <div className="text-right">
              <div
                className={`inline-block px-4 py-2 rounded-full font-medium text-sm ${
                  prospectState === "POSITIVE"
                    ? "bg-green-100 text-green-800"
                    : prospectState === "NEGATIVE"
                      ? "bg-red-100 text-red-800"
                      : prospectState === "ENGAGED"
                        ? "bg-blue-100 text-blue-800"
                        : "bg-gray-100 text-gray-800"
                }`}
              >
                {prospectState}
              </div>
              {lastActivity && (
                <p className="text-gray-500 text-sm mt-2">
                  Last activity: {lastActivity}
                </p>
              )}
            </div>
          </div>

          <div className="mt-4 grid grid-cols-3 gap-4 border-t pt-4">
            <div>
              <p className="text-gray-500 text-sm">Email</p>
              <p className="font-medium">{prospect.email || "—"}</p>
            </div>
            <div>
              <p className="text-gray-500 text-sm">Phone</p>
              <p className="font-medium">{prospect.phone || "—"}</p>
            </div>
            <div>
              <p className="text-gray-500 text-sm">Status</p>
              <p className="font-medium capitalize">{prospect.status}</p>
            </div>
          </div>
        </div>

        {/* TIMELINE */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-6">
            Conversation Timeline
          </h2>

          {prospect.conversationEvents.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">No interactions yet</p>
            </div>
          ) : (
            <div className="space-y-6">
              {prospect.conversationEvents.map((event, index) => (
                <div key={event.id} className="relative">
                  {index !== prospect.conversationEvents.length - 1 && (
                    <div className="absolute left-6 top-16 bottom-0 w-0.5 bg-gray-200" />
                  )}

                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center text-xl">
                      {getEventIcon(event.type)}
                    </div>
                    <div className="flex-grow">
                      <div className="flex items-center justify-between">
                        <p className="font-medium text-gray-900">
                          {getEventLabel(event.type)}
                        </p>
                        <p className="text-gray-500 text-sm">
                          {new Date(event.createdAt).toLocaleString()}
                        </p>
                      </div>

                      {event.subject && (
                        <p className="text-gray-700 mt-1 text-sm">
                          <span className="font-medium">Subject:</span>{" "}
                          {event.subject}
                        </p>
                      )}

                      {event.body && event.type === "EMAIL_SENT" && (
                        <details className="mt-2">
                          <summary className="cursor-pointer text-sm text-blue-600 hover:text-blue-700">
                            View email content
                          </summary>
                          <div className="mt-2 bg-gray-50 p-4 rounded text-sm text-gray-700 whitespace-pre-wrap border border-gray-200">
                            {event.body}
                          </div>
                        </details>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* EMAIL ACTION PANEL */}
        <div className="bg-white rounded-lg shadow-sm p-6 mt-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Send Email</h2>

          {emailSent && (
            <div className="bg-green-50 border border-green-200 p-3 rounded mb-4 text-green-700">
              ✅ Email sent successfully
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Subject
              </label>
              <input
                type="text"
                value={emailSubject}
                onChange={(e) => setEmailSubject(e.target.value)}
                placeholder="Email subject"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                disabled={sendingEmail}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Body
              </label>
              <textarea
                value={emailBody}
                onChange={(e) => setEmailBody(e.target.value)}
                placeholder="Enter email content here"
                rows={6}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono"
                disabled={sendingEmail}
              />
            </div>

            <button
              onClick={handleSendEmail}
              disabled={sendingEmail || !prospect?.email}
              className="w-full bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-400"
            >
              {sendingEmail ? "Sending..." : "Send Email"}
            </button>
          </div>
        </div>

        {/* RESPONSE PANEL */}
        <div className="bg-white rounded-lg shadow-sm p-6 mt-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Record Response</h2>

          {responseRecorded && (
            <div className="bg-green-50 border border-green-200 p-3 rounded mb-4 text-green-700">
              ✅ Response recorded successfully
            </div>
          )}

          {prospectState === "POSITIVE" || prospectState === "NEGATIVE" ? (
            <div className="text-gray-600">
              Response already recorded: <span className="font-medium">{prospectState}</span>
            </div>
          ) : (
            <div className="flex gap-4">
              <button
                onClick={() => handleRecordResponse("YES")}
                disabled={recordingResponse}
                className="flex-1 bg-green-600 text-white py-2 rounded-lg font-medium hover:bg-green-700 disabled:bg-gray-400"
              >
                {recordingResponse ? "Recording..." : "YES"}
              </button>
              <button
                onClick={() => handleRecordResponse("NO")}
                disabled={recordingResponse}
                className="flex-1 bg-red-600 text-white py-2 rounded-lg font-medium hover:bg-red-700 disabled:bg-gray-400"
              >
                {recordingResponse ? "Recording..." : "NO"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
