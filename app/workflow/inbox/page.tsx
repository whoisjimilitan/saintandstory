"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type InboxBusiness = {
  id: string;
  name: string;
  placeId?: string;
  reviewCount: number;
  hypothesesCount: number;
  discoveredAt: string;
  status: string;
  actions: Array<{ label: string; href?: string; action?: string; businessId?: string }>;
};

export default function InboxPage() {
  const [businesses, setBusinesses] = useState<InboxBusiness[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchInbox() {
      try {
        const res = await fetch("/api/workflow/inbox");
        if (!res.ok) throw new Error("Failed to fetch inbox");
        const data = await res.json();
        setBusinesses(data.businesses);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    }

    fetchInbox();
  }, []);

  if (loading) return <div className="p-8">Loading...</div>;
  if (error) return <div className="p-8 text-red-600">Error: {error}</div>;

  return (
    <div className="max-w-6xl mx-auto p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Inbox</h1>
        <p className="text-gray-600">
          Businesses discovered but not yet reviewed ({businesses.length})
        </p>
      </div>

      {/* Empty State */}
      {businesses.length === 0 && (
        <div className="bg-blue-50 border border-blue-200 p-12 rounded-lg text-center">
          <h2 className="text-2xl font-semibold mb-4">No businesses in inbox</h2>
          <p className="text-gray-700 mb-6">
            Once businesses are discovered through niche search or imported, they will appear here.
          </p>
          <p className="text-gray-600 text-sm mb-6">
            Each business in the inbox is waiting to be investigated. You'll review evidence from
            reviews, formulate hypotheses, and prepare questions for conversation.
          </p>
          <Link
            href="/workflow/niche-search"
            className="inline-block bg-blue-600 text-white px-6 py-3 rounded hover:bg-blue-700"
          >
            Discover Businesses
          </Link>
        </div>
      )}

      {/* Business List */}
      {businesses.length > 0 && (
        <div className="space-y-4">
          {businesses.map(business => (
            <div
              key={business.id}
              className="bg-white border border-gray-200 p-6 rounded-lg hover:shadow-md transition"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h2 className="text-xl font-semibold">{business.name}</h2>
                  <p className="text-sm text-gray-600 mt-1">
                    Discovered {new Date(business.discoveredAt).toLocaleDateString()}
                  </p>
                </div>
                <span className="text-sm bg-blue-100 text-blue-800 px-3 py-1 rounded">
                  Inbox
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-sm text-gray-600">Reviews</p>
                  <p className="text-2xl font-bold">{business.reviewCount}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Hypotheses</p>
                  <p className="text-2xl font-bold">{business.hypothesesCount}</p>
                </div>
              </div>

              <div className="flex gap-3">
                <Link
                  href={`/workflow/investigation/${business.id}`}
                  className="flex-1 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 text-center"
                >
                  Start Investigation
                </Link>
                <button
                  className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50"
                  onClick={() => {
                    // Archive functionality would go here
                    setBusinesses(businesses.filter(b => b.id !== business.id));
                  }}
                >
                  Archive
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Navigation */}
      <div className="mt-12 border-t pt-8">
        <div className="grid grid-cols-3 gap-4">
          <Link
            href="/workflow/investigating"
            className="p-4 border border-gray-200 rounded hover:bg-gray-50"
          >
            <p className="font-semibold">Investigating</p>
            <p className="text-sm text-gray-600">Businesses with hypotheses</p>
          </Link>
          <Link
            href="/workflow/conversations"
            className="p-4 border border-gray-200 rounded hover:bg-gray-50"
          >
            <p className="font-semibold">Contacted</p>
            <p className="text-sm text-gray-600">Conversations started</p>
          </Link>
          <Link
            href="/workflow/assumptions"
            className="p-4 border border-gray-200 rounded hover:bg-gray-50"
          >
            <p className="font-semibold">Assumptions</p>
            <p className="text-sm text-gray-600">What we believe</p>
          </Link>
        </div>
      </div>
    </div>
  );
}
