"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

type InsightData = {
  business: { id: string; name: string; placeId?: string };
  hypotheses: Array<{
    id: string;
    statement: string;
    status?: string;
    evidenceCount: number;
  }>;
  reviews: {
    total: number;
    excerpts: Array<{ id: string; text: string; rating?: number; author?: string }>;
  };
  conversations: {
    total: number;
    recent: Array<{
      id: string;
      question: string;
      outcome?: {
        signalType: string;
        truthLevel: string;
        signalClassification: string;
      } | null;
      createdAt: string;
    }>;
  };
};

type TimelineData = {
  businessId: string;
  totalEvents: number;
  events: Array<{
    id: string;
    date: string;
    type: string;
    question: string;
    outcome?: {
      signalType: string;
      truthLevel: string;
      signalClassification: string;
      notes?: string;
      date: string;
    } | null;
  }>;
};

type SummaryData = {
  business: { id: string; name: string };
  whatHasBeenObserved: {
    reviewsAnalyzed: number;
    conversationsLogged: number;
    hypothesesDocumented: number;
    observedPatterns: Array<{ description: string; occurrences: number }>;
  };
  whatRemainsUnknown: string[];
  conversationOutcomes: Record<string, number>;
  dataQuality: {
    hasReviews: boolean;
    hasConversations: boolean;
    hasHypotheses: boolean;
    totalDataPoints: number;
  };
  nextStep: string;
};

export default function BusinessPage() {
  const params = useParams();
  const businessId = typeof params.id === 'string' ? params.id : '';

  const [insights, setInsights] = useState<InsightData | null>(null);
  const [timeline, setTimeline] = useState<TimelineData | null>(null);
  const [summary, setSummary] = useState<SummaryData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const [insightsRes, timelineRes, summaryRes] = await Promise.all([
          fetch(`/api/insights/business/${businessId}`),
          fetch(`/api/timeline/business/${businessId}`),
          fetch(`/api/summary/business/${businessId}`),
        ]);

        if (!insightsRes.ok) throw new Error("Failed to fetch insights");
        if (!timelineRes.ok) throw new Error("Failed to fetch timeline");
        if (!summaryRes.ok) throw new Error("Failed to fetch summary");

        const [insightsData, timelineData, summaryData] = await Promise.all([
          insightsRes.json(),
          timelineRes.json(),
          summaryRes.json(),
        ]);

        setInsights(insightsData);
        setTimeline(timelineData);
        setSummary(summaryData);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [businessId]);

  if (loading) return <div className="p-8">Loading...</div>;
  if (error) return <div className="p-8 text-red-600">Error: {error}</div>;
  if (!insights || !timeline || !summary) return null;

  return (
    <div className="max-w-6xl mx-auto p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">{summary.business.name}</h1>
        <p className="text-gray-600">Business ID: {businessId}</p>
      </div>

      {/* What Has Been Observed */}
      <section className="mb-12 bg-blue-50 p-6 rounded-lg">
        <h2 className="text-2xl font-semibold mb-4">What Has Been Observed</h2>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div>
            <p className="text-sm text-gray-600">Reviews Analyzed</p>
            <p className="text-3xl font-bold">
              {summary.whatHasBeenObserved.reviewsAnalyzed}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Conversations Logged</p>
            <p className="text-3xl font-bold">
              {summary.whatHasBeenObserved.conversationsLogged}
            </p>
          </div>
        </div>

        {summary.whatHasBeenObserved.observedPatterns.length > 0 && (
          <div>
            <h3 className="font-semibold mb-3">Repeated Patterns</h3>
            <ul className="space-y-2">
              {summary.whatHasBeenObserved.observedPatterns.map((p, idx) => (
                <li key={idx} className="text-sm">
                  <span className="font-medium">{p.description}</span>
                  <span className="text-gray-600 ml-2">(appears {p.occurrences} times)</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </section>

      {/* What Remains Unknown */}
      {summary.whatRemainsUnknown.length > 0 && (
        <section className="mb-12 bg-gray-50 p-6 rounded-lg">
          <h2 className="text-2xl font-semibold mb-4">What Remains Unknown</h2>
          <ul className="space-y-2">
            {summary.whatRemainsUnknown.map((item, idx) => (
              <li key={idx} className="text-sm text-gray-700">• {item}</li>
            ))}
          </ul>
        </section>
      )}

      {/* Documented Hypotheses */}
      {insights.hypotheses.length > 0 && (
        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">Documented Hypotheses</h2>
          <div className="space-y-3">
            {insights.hypotheses.map(h => (
              <div key={h.id} className="bg-white border border-gray-200 p-4 rounded">
                <p className="font-medium text-sm">{h.statement}</p>
                <p className="text-xs text-gray-600 mt-2">
                  Status: {h.status || "emerging"} | Evidence: {h.evidenceCount}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Conversations Timeline */}
      {timeline.events.length > 0 && (
        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">Conversation Timeline</h2>
          <div className="space-y-4">
            {timeline.events.map((event, idx) => (
              <div key={event.id} className="bg-white border border-gray-200 p-4 rounded">
                <p className="text-xs text-gray-500">
                  {new Date(event.date).toLocaleDateString()}
                </p>
                <p className="font-medium mt-1">{event.question}</p>
                {event.outcome && (
                  <div className="mt-3 bg-gray-50 p-3 rounded text-sm">
                    <p>
                      <span className="text-gray-600">Signal: </span>
                      <span className="font-medium">{event.outcome.signalType}</span>
                    </p>
                    <p>
                      <span className="text-gray-600">Truth Level: </span>
                      <span className="font-medium">{event.outcome.truthLevel}</span>
                    </p>
                    <p>
                      <span className="text-gray-600">Classification: </span>
                      <span className="font-medium">{event.outcome.signalClassification}</span>
                    </p>
                    {event.outcome.notes && (
                      <p className="mt-2 italic text-gray-700">"{event.outcome.notes}"</p>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Review Excerpts */}
      {insights.reviews.excerpts.length > 0 && (
        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">Recent Reviews</h2>
          <p className="text-sm text-gray-600 mb-4">
            {insights.reviews.total} total reviews analyzed
          </p>
          <div className="space-y-3">
            {insights.reviews.excerpts.map(r => (
              <div key={r.id} className="bg-white border border-gray-200 p-4 rounded text-sm">
                <p className="text-xs text-gray-500 mb-2">
                  {r.author && `by ${r.author}`}
                  {r.rating && ` • ${r.rating} stars`}
                </p>
                <p className="text-gray-700 italic">"{r.text}"</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Next Step */}
      <section className="bg-green-50 p-6 rounded-lg border border-green-200">
        <h2 className="text-lg font-semibold mb-2">Next Step</h2>
        <p className="text-gray-700 mb-4">{summary.nextStep}</p>
        <Link
          href={`/dashboard/admin/b2b/lead/${businessId}`}
          className="inline-block bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Back to Dashboard
        </Link>
      </section>
    </div>
  );
}
