"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

export default function AuditPage() {
  const searchParams = useSearchParams();
  const assumptionId = searchParams.get("assumption");
  const hypothesisId = searchParams.get("hypothesis");

  const [chain, setChain] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchChain() {
      if (!assumptionId && !hypothesisId) {
        setLoading(false);
        return;
      }

      const query = assumptionId
        ? `?assumption=${assumptionId}`
        : `?hypothesis=${hypothesisId}`;

      const res = await fetch(`/api/workflow/audit${query}`);
      const data = await res.json();
      setChain(data);
      setLoading(false);
    }
    fetchChain();
  }, [assumptionId, hypothesisId]);

  if (loading) return <div className="p-8">Loading...</div>;

  return (
    <div className="max-w-6xl mx-auto p-8">
      <h1 className="text-4xl font-bold mb-2">Audit Trail</h1>
      <p className="text-gray-600 mb-8">Answer: "Why do we think this?"</p>

      {!chain ? (
        <div className="bg-blue-50 border border-blue-200 p-12 rounded-lg text-center">
          <h2 className="text-2xl font-semibold mb-4">No audit trail selected</h2>
          <p className="text-gray-700 mb-6">
            Click on any assumption or hypothesis to see the complete evidence chain that supports
            it.
          </p>
          <p className="text-sm text-gray-600">
            The audit trail shows: Evidence → Hypothesis → Question → Conversation → Outcome →
            Assumption Event
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Target */}
          <div className="bg-blue-50 border border-blue-200 p-8 rounded-lg">
            <h2 className="text-lg font-semibold mb-4">What We're Auditing</h2>
            {chain.assumption && (
              <div>
                <p className="text-gray-700 mb-2">
                  <strong>Assumption:</strong> {chain.assumption.statement}
                </p>
                <p className="text-sm text-gray-600">Status: {chain.assumption.status}</p>
              </div>
            )}
            {chain.hypothesis && (
              <div>
                <p className="text-gray-700 mb-2">
                  <strong>Hypothesis:</strong> {chain.hypothesis.statement}
                </p>
                <p className="text-sm text-gray-600">Status: {chain.hypothesis.status}</p>
                <p className="text-sm text-gray-600">
                  Evidence Count: {chain.hypothesis.evidenceCount}
                </p>
              </div>
            )}
          </div>

          {/* Evidence Chain */}
          <div>
            <h2 className="text-lg font-semibold mb-4">Evidence Chain</h2>

            {chain.tracingBack && (
              <div className="space-y-6">
                {/* Reviews */}
                {chain.tracingBack.reviews && (
                  <div className="bg-green-50 border border-green-200 p-6 rounded-lg">
                    <p className="font-semibold mb-4">
                      Step 1: Raw Evidence ({chain.tracingBack.reviews.total} reviews)
                    </p>
                    <div className="space-y-3">
                      {chain.tracingBack.reviews.supporting?.slice(0, 2).map((r: any, i: number) => (
                        <div
                          key={i}
                          className="bg-white p-3 rounded border border-green-100 text-sm"
                        >
                          <p>"{r.text.substring(0, 150)}..."</p>
                          {r.rating && <p className="text-xs text-gray-600 mt-1">{r.rating} stars</p>}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Conversations */}
                {chain.tracingBack.conversations && (
                  <div className="bg-purple-50 border border-purple-200 p-6 rounded-lg">
                    <p className="font-semibold mb-4">
                      Step 2: Conversations ({chain.tracingBack.conversations.total} total)
                    </p>
                    <div className="space-y-3">
                      {chain.tracingBack.conversations.recent?.slice(0, 2).map((c: any, i: number) => (
                        <div
                          key={i}
                          className="bg-white p-3 rounded border border-purple-100 text-sm"
                        >
                          <p className="font-medium">{c.question}</p>
                          {c.outcome && (
                            <p className="text-xs text-gray-600 mt-1">
                              Outcome: {c.outcome.signal}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Outcomes */}
                {chain.supportingChain && (
                  <div className="bg-yellow-50 border border-yellow-200 p-6 rounded-lg">
                    <p className="font-semibold mb-4">Step 3: Outcomes from Testing</p>
                    <p className="text-gray-700 text-sm">
                      These are the results when this hypothesis or assumption was tested against
                      reality.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Conclusion */}
          <div className="bg-gray-50 border border-gray-200 p-8 rounded-lg">
            <h2 className="text-lg font-semibold mb-4">Conclusion</h2>
            <p className="text-gray-700">
              This chain shows why we believe what we believe. Every step is traceable back to raw
              evidence. This is how we maintain intellectual honesty about our assumptions.
            </p>
          </div>
        </div>
      )}

      <div className="mt-8">
        <Link href="/workflow/timeline" className="text-blue-600">
          ← Back to Timeline
        </Link>
      </div>
    </div>
  );
}
