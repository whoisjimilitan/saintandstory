"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function AssumptionsPage() {
  const [assumptions, setAssumptions] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      const res = await fetch("/api/workflow/assumptions");
      const data = await res.json();
      setAssumptions(data);
      setLoading(false);
    }
    fetchData();
  }, []);

  if (loading) return <div className="p-8">Loading...</div>;
  if (!assumptions) return null;

  return (
    <div className="max-w-6xl mx-auto p-8">
      <h1 className="text-4xl font-bold mb-2">Assumptions</h1>
      <p className="text-gray-600 mb-8">What we believe and how reality is testing it</p>

      {assumptions.totalAssumptions === 0 ? (
        <div className="bg-blue-50 border border-blue-200 p-12 rounded-lg text-center">
          <h2 className="text-2xl font-semibold mb-4">No assumptions yet</h2>
          <p className="text-gray-700 mb-6">
            Assumptions are beliefs we have about how businesses operate. As we conduct
            conversations, reality either confirms or contradicts our assumptions.
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-4 gap-4 mb-12">
            <div className="bg-blue-50 p-4 rounded">
              <p className="text-sm text-gray-600">Emerging</p>
              <p className="text-3xl font-bold text-blue-600">
                {assumptions.statusBreakdown.emerging}
              </p>
            </div>
            <div className="bg-green-50 p-4 rounded">
              <p className="text-sm text-gray-600">Supported</p>
              <p className="text-3xl font-bold text-green-600">
                {assumptions.statusBreakdown.supported}
              </p>
            </div>
            <div className="bg-yellow-50 p-4 rounded">
              <p className="text-sm text-gray-600">Weak</p>
              <p className="text-3xl font-bold text-yellow-600">
                {assumptions.statusBreakdown.weak}
              </p>
            </div>
            <div className="bg-red-50 p-4 rounded">
              <p className="text-sm text-gray-600">Rejected</p>
              <p className="text-3xl font-bold text-red-600">
                {assumptions.statusBreakdown.rejected}
              </p>
            </div>
          </div>

          <div className="space-y-4">
            {assumptions.assumptions.map((a: any) => (
              <div
                key={a.id}
                className={`border p-6 rounded-lg ${
                  a.currentStatus === "supported"
                    ? "bg-green-50 border-green-200"
                    : a.currentStatus === "rejected"
                      ? "bg-red-50 border-red-200"
                      : "bg-yellow-50 border-yellow-200"
                }`}
              >
                <p className="font-semibold">{a.statement}</p>
                <p className="text-sm text-gray-600 mt-2">Status: {a.currentStatus}</p>
              </div>
            ))}
          </div>
        </>
      )}

      <div className="mt-8 flex gap-4">
        <Link href="/workflow/contradictions" className="text-blue-600">
          View Contradictions →
        </Link>
      </div>
    </div>
  );
}
