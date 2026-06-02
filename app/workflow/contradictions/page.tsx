"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function ContradictionsPage() {
  const [contradictions, setContradictions] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      const res = await fetch("/api/workflow/contradictions");
      const data = await res.json();
      setContradictions(data);
      setLoading(false);
    }
    fetchData();
  }, []);

  if (loading) return <div className="p-8">Loading...</div>;
  if (!contradictions) return null;

  return (
    <div className="max-w-6xl mx-auto p-8">
      <h1 className="text-4xl font-bold mb-2">Contradictions</h1>
      <p className="text-gray-600 mb-8">Where reality surprised us</p>

      <div className="bg-blue-50 border border-blue-200 p-6 rounded-lg mb-8">
        <p className="text-gray-700">{contradictions.significance}</p>
      </div>

      {contradictions.totalContradictions === 0 ? (
        <div className="bg-gray-50 border border-gray-200 p-12 rounded-lg text-center">
          <h2 className="text-2xl font-semibold mb-4">No contradictions yet</h2>
          <p className="text-gray-700 mb-6">
            Contradictions appear when our assumptions are tested against reality. They're learning
            opportunities that help us understand the actual business situation better.
          </p>
          <p className="text-sm text-gray-600">
            Conduct more conversations to discover contradictions.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {contradictions.contradictions.map((c: any) => (
            <div key={c.id} className="bg-red-50 border border-red-200 p-6 rounded-lg">
              <h3 className="font-semibold text-lg mb-3">{c.assumption.statement}</h3>
              <div className="bg-white p-4 rounded border border-red-100 mb-4">
                <p className="text-sm text-gray-600 mb-2">What we expected:</p>
                <p className="text-gray-700">{c.assumption.statement}</p>
              </div>
              <div className="bg-red-100 p-4 rounded">
                <p className="text-sm font-semibold text-red-800 mb-2">What reality showed:</p>
                <p className="text-gray-700">{c.contradiction.description}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-8 flex gap-4">
        <Link href="/workflow/assumptions" className="text-blue-600">
          ← Back to Assumptions
        </Link>
        <Link href="/workflow/timeline" className="text-blue-600">
          View Timeline →
        </Link>
      </div>
    </div>
  );
}
