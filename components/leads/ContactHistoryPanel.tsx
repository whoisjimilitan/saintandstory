"use client";

import { useEffect, useState } from "react";
import { ChevronDown, Mail, CheckCircle, Zap } from "lucide-react";

interface OutreachEvent {
  id: string;
  event_type: string;
  operator: string;
  created_at: string;
  event_data: Record<string, unknown> | null;
}

interface ContactHistoryPanelProps {
  leadId: string;
}

export function ContactHistoryPanel({ leadId }: ContactHistoryPanelProps) {
  const [events, setEvents] = useState<OutreachEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await fetch(
          `/api/b2b/outreach-events?lead_id=${leadId}`
        );
        if (response.ok) {
          const data = await response.json();
          setEvents(data);
        }
      } catch (error) {
        console.error("Failed to fetch contact history:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [leadId]);

  const getEventIcon = (eventType: string) => {
    switch (eventType) {
      case "email_sent":
        return <Mail size={14} className="text-blue-600" />;
      case "status_changed":
        return <CheckCircle size={14} className="text-green-600" />;
      case "contact_marked":
        return <Zap size={14} className="text-yellow-600" />;
      default:
        return <div className="w-3.5 h-3.5 rounded-full bg-gray-300" />;
    }
  };

  const getEventLabel = (eventType: string, data: Record<string, unknown> | null) => {
    switch (eventType) {
      case "email_sent":
        return `Email sent to ${data?.recipient || "unknown"}`;
      case "status_changed":
        return `Status: ${data?.from} → ${data?.to}`;
      case "contact_marked":
        return `Marked as contacted`;
      default:
        return eventType.replace(/_/g, " ");
    }
  };

  if (loading) {
    return <div className="text-xs text-gray-500 italic">Loading history...</div>;
  }

  if (events.length === 0) {
    return <div className="text-xs text-gray-500 italic">No contact history yet</div>;
  }

  return (
    <div className="bg-gray-50 rounded-lg border border-gray-200">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full px-3 py-2 flex items-center justify-between text-xs font-semibold text-gray-700 hover:bg-gray-100 transition"
      >
        <span>Contact History ({events.length})</span>
        <ChevronDown
          size={14}
          className={`transition-transform ${expanded ? "rotate-180" : ""}`}
        />
      </button>

      {expanded && (
        <div className="divide-y border-t">
          {events.map((event, i) => (
            <div key={event.id} className="px-3 py-2 flex gap-2 text-xs">
              <div className="flex-shrink-0 mt-1">{getEventIcon(event.event_type)}</div>
              <div className="flex-1 min-w-0">
                <div className="text-gray-900 font-medium">
                  {getEventLabel(event.event_type, event.event_data)}
                </div>
                <div className="text-gray-500 text-xs">
                  {event.operator} •{" "}
                  {new Date(event.created_at).toLocaleDateString("en-GB")}{" "}
                  {new Date(event.created_at).toLocaleTimeString("en-GB", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
