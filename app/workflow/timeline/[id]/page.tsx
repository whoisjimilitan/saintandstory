"use client";


import { useEffect, useState } from "react";
import Link from "next/link";

export default function TimelinePage({ params }: { params: { id: string } }) {
  const [timeline, setTimeline] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      const res = await fetch(`/api/workflow/timeline/${params.id}`);
      const data = await res.json();
      setTimeline(data);
      setLoading(false);
    }
    fetchData();
  }, [params.id]);

  if (loading) return <div className="p-8">Loading...</div>;
  if (!timeline) return null;

  const getEventColor = (type: string) => {
    const colors: Record<string, string> = {
      review: "bg-blue-50 border-blue-200",
      hypothesis: "bg-yellow-50 border-yellow-200",
      conversation: "bg-purple-50 border-purple-200",
      outcome: "bg-green-50 border-green-200",
    };
    return colors[type] || "bg-gray-50 border-gray-200";
  };

  const getEventIcon = (type: string) => {
    const icons: Record<string, string> = {
      review: "📝",
      hypothesis: "💡",
      conversation: "📞",
      outcome: "✓",
    };
    return icons[type] || "•";
  };

  return (
    <div className="max-w-6xl mx-auto p-8">
      <h1 className="text-4xl font-bold mb-2">Timeline</h1>
      <p className="text-gray-600 mb-8">Complete chronological history</p>

      {timeline.totalEvents === 0 ? (
        <div className="bg-gray-50 border border-gray-200 p-12 rounded-lg text-center">
          <h2 className="text-2xl font-semibold mb-4">Timeline is empty</h2>
          <p className="text-gray-700">
            The timeline shows all events in chronological order: reviews, hypotheses,
            conversations, and outcomes.
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-4 gap-4 mb-8">
            {Object.entries(timeline.eventTypes).map(([type, count]: [string, any]) => (
              <div key={type} className="bg-white border border-gray-200 p-4 rounded">
                <p className="text-sm text-gray-600 capitalize">{type}</p>
                <p className="text-2xl font-bold">{count}</p>
              </div>
            ))}
          </div>

          <div className="space-y-4">
            {timeline.events.map((event: any) => (
              <div
                key={event.id}
                className={`border p-6 rounded-lg ${getEventColor(event.type)}`}
              >
                <div className="flex items-start gap-4">
                  <span className="text-2xl">{getEventIcon(event.type)}</span>
                  <div className="flex-1">
                    <p className="text-sm text-gray-600">
                      {new Date(event.date).toLocaleDateString()}
                    </p>
                    <p className="font-semibold mt-1">{event.title}</p>
                    {event.type === "review" && (
                      <p className="text-gray-700 mt-2">"{event.data.text}"</p>
                    )}
                    {event.type === "hypothesis" && (
                      <p className="text-gray-700 mt-2">{event.data.statement}</p>
                    )}
                    {event.type === "conversation" && (
                      <p className="text-gray-700 mt-2">{event.data.question}</p>
                    )}
                    {event.type === "outcome" && (
                      <p className="text-gray-700 mt-2">Signal: {event.data.signal}</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      <div className="mt-8 flex gap-4">
        <Link href="/workflow/contradictions" className="text-blue-600">
          ← Back to Contradictions
        </Link>
        <Link href="/workflow/audit" className="text-blue-600">
          View Audit Trail →
        </Link>
      </div>
    </div>
  );
}
