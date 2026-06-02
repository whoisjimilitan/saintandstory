"use client";


import { useEffect, useState } from "react";
import Link from "next/link";

export default function OutcomesPage({ params }: { params: { id: string } }) {
  const [outcomes, setOutcomes] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      const res = await fetch(`/api/workflow/outcomes/${params.id}`);
      const data = await res.json();
      setOutcomes(data);
      setLoading(false);
    }
    fetchData();
  }, [params.id]);

  if (loading) return <div className="p-8">Loading...</div>;
  if (!outcomes) return null;

  return (
    <div className="max-w-6xl mx-auto p-8">
      <h1 className="text-4xl font-bold mb-2">Outcomes</h1>
      <p className="text-gray-600 mb-8">What reality told us</p>

      {outcomes.totalOutcomes === 0 ? (
        <div className="bg-blue-50 border border-blue-200 p-12 rounded-lg text-center">
          <h2 className="text-2xl font-semibold mb-4">No outcomes recorded yet</h2>
          <p className="text-gray-700 mb-6">
            Once conversations happen, outcomes will be recorded here. Each outcome captures what
            the business owner said and how it relates to our hypotheses.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {outcomes.outcomes.map((o: any) => (
            <div key={o.id} className="bg-white border border-gray-200 p-6 rounded-lg">
              <div className="flex justify-between mb-4">
                <p className="font-semibold">{o.question}</p>
                <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                  {o.signal.type}
                </span>
              </div>
              <p className="text-sm text-gray-600">Truth Level: {o.truthLevel}</p>
              <p className="text-sm text-gray-600">Classification: {o.classification}</p>
              {o.notes && <p className="mt-3 text-gray-700 italic">"{o.notes}"</p>}
            </div>
          ))}
        </div>
      )}

      <div className="mt-8 flex gap-4">
        <Link href={`/workflow/conversations/${params.id}`} className="text-blue-600">
          ← Back to Conversations
        </Link>
        <Link href="/workflow/assumptions" className="text-blue-600">
          View Assumptions →
        </Link>
      </div>
    </div>
  );
}
