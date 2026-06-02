"use client";


import { useEffect, useState } from "react";
import Link from "next/link";

type InvestigationData = {
  business: { id: string; name: string };
  observed: {
    reviewCount: number;
    reviewExcerpts: Array<{ id: string; text: string; rating?: number; author?: string; date: string }>;
    patterns: Array<{ description: string; occurrences: number; examples: string[] }>;
  };
  hypothesized: {
    hypotheses: Array<{
      id: string;
      statement: string;
      status?: string;
      evidenceCount: number;
      createdAt: string;
      supportingExamples: string[];
    }>;
  };
  unknowns: { items: string[] };
  nextAction: { type: string; label: string };
};

export default function InvestigationPage({ params }: { params: { id: string } }) {
  const [data, setData] = useState<InvestigationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch(`/api/workflow/investigation/${params.id}`);
        if (!res.ok) throw new Error("Failed to fetch investigation");
        const result = await res.json();
        setData(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [params.id]);

  if (loading) return <div className="p-8">Loading...</div>;
  if (error) return <div className="p-8 text-red-600">Error: {error}</div>;
  if (!data) return null;

  return (
    <div className="max-w-6xl mx-auto p-8">
      {/* Header */}
      <div className="mb-8">
        <Link href="/workflow/inbox" className="text-blue-600 hover:underline mb-4 inline-block">
          ← Back to Inbox
        </Link>
        <h1 className="text-4xl font-bold">{data.business.name}</h1>
        <p className="text-gray-600 mt-2">Investigation Phase</p>
      </div>

      {/* OBSERVED SECTION */}
      <section className="mb-12 bg-green-50 border border-green-200 p-8 rounded-lg">
        <h2 className="text-2xl font-semibold mb-6 text-green-900">What We Have Observed</h2>

        <div className="mb-8">
          <p className="font-semibold mb-4">
            {data.observed.reviewCount} reviews analyzed
          </p>
          {data.observed.reviewExcerpts.length > 0 && (
            <div className="space-y-3 mb-6">
              <p className="text-sm text-gray-600">Sample excerpts:</p>
              {data.observed.reviewExcerpts.slice(0, 3).map(r => (
                <div
                  key={r.id}
                  className="bg-white p-3 rounded border border-green-100 text-sm"
                >
                  <p className="text-gray-700 italic">"{r.text.substring(0, 150)}..."</p>
                  {r.rating && (
                    <p className="text-xs text-gray-500 mt-2">
                      {r.author || "Anonymous"} • {r.rating} stars
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {data.observed.patterns.length > 0 && (
          <div>
            <p className="font-semibold mb-4">Observed Patterns</p>
            <div className="space-y-3">
              {data.observed.patterns.map((p, idx) => (
                <div key={idx} className="bg-white p-3 rounded border border-green-100">
                  <p className="font-medium text-sm">{p.description}</p>
                  <p className="text-xs text-gray-600 mt-1">Appears {p.occurrences} times</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* HYPOTHESIZED SECTION */}
      <section className="mb-12 bg-yellow-50 border border-yellow-200 p-8 rounded-lg">
        <h2 className="text-2xl font-semibold mb-6 text-yellow-900">What We Have Hypothesized</h2>

        {data.hypothesized.hypotheses.length === 0 ? (
          <div className="text-gray-600">
            <p>No hypotheses formulated yet.</p>
            <p className="text-sm mt-2">Hypotheses will be generated from the observed evidence.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {data.hypothesized.hypotheses.map(h => (
              <div key={h.id} className="bg-white p-4 rounded border border-yellow-100">
                <p className="font-medium">{h.statement}</p>
                <p className="text-xs text-gray-600 mt-2">
                  Status: {h.status || "emerging"} | Evidence: {h.evidenceCount}
                </p>
                {h.supportingExamples.length > 0 && (
                  <p className="text-xs text-gray-700 mt-2 italic">
                    "{h.supportingExamples[0].substring(0, 80)}..."
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </section>

      {/* UNKNOWN SECTION */}
      {data.unknowns.items.length > 0 && (
        <section className="mb-12 bg-gray-50 border border-gray-200 p-8 rounded-lg">
          <h2 className="text-2xl font-semibold mb-6">What We Do Not Yet Know</h2>
          <ul className="space-y-2">
            {data.unknowns.items.map((item, idx) => (
              <li key={idx} className="text-gray-700">
                • {item}
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* NEXT ACTION */}
      <section className="bg-blue-50 border border-blue-200 p-8 rounded-lg">
        <h2 className="text-lg font-semibold mb-4">Next Step</h2>
        <p className="text-gray-700 mb-6">{data.nextAction.label}</p>
        <Link
          href={`/workflow/conversations/${data.business.id}`}
          className="inline-block bg-blue-600 text-white px-6 py-3 rounded hover:bg-blue-700"
        >
          Proceed to Conversations
        </Link>
      </section>
    </div>
  );
}
