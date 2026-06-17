"use client";

import { useState } from "react";
import Link from "next/link";
import { useDebounce } from "@/hooks/use-debounce";

interface SearchResult {
  id: string;
  business_name: string;
  business_category: string;
  city: string;
  postcode: string;
  email: string | null;
  phone: string | null;
  pressure_type: string | null;
  engagement_score: number | null;
  lead_tier: string | null;
}

interface DiscoverPageState {
  postcode: string;
  radius: number;
  loading: boolean;
  searching: boolean;
  results: SearchResult[];
  error: string | null;
  selectedId: string | null;
}

export default function DiscoverPage() {
  const [state, setState] = useState<DiscoverPageState>({
    postcode: "",
    radius: 5,
    loading: false,
    searching: false,
    results: [],
    error: null,
    selectedId: null,
  });

  const debouncedPostcode = useDebounce(state.postcode, 500);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!state.postcode.trim()) {
      setState((s) => ({ ...s, error: "Enter a postcode to search" }));
      return;
    }

    setState((s) => ({
      ...s,
      loading: true,
      searching: true,
      error: null,
      results: [],
    }));

    try {
      const response = await fetch("/api/b2b/discover/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          postcode: state.postcode,
          radius: state.radius,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setState((s) => ({
          ...s,
          error: data.error || "Search failed",
          loading: false,
        }));
        return;
      }

      setState((s) => ({
        ...s,
        results: data.results || [],
        loading: false,
      }));
    } catch (err) {
      setState((s) => ({
        ...s,
        error: err instanceof Error ? err.message : "Search failed",
        loading: false,
      }));
    }
  };

  const getTierColor = (tier: string | null) => {
    if (!tier) return "text-gray-500";
    if (tier === "A") return "text-blue-600 font-semibold";
    if (tier === "B") return "text-green-600";
    return "text-gray-500";
  };

  const getScoreColor = (score: number | null) => {
    if (!score) return "text-gray-400";
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-blue-600";
    return "text-yellow-600";
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <h1 className="text-lg font-semibold">Discover</h1>
            <div className="hidden sm:flex gap-6">
              <Link
                href="/b2b/dashboard"
                className="text-gray-600 hover:text-gray-900"
              >
                Dashboard
              </Link>
              <Link
                href="/b2b/discover"
                className="text-gray-900 font-medium border-b-2 border-gray-900"
              >
                Discover
              </Link>
              <Link
                href="/b2b/learning"
                className="text-gray-600 hover:text-gray-900"
              >
                Learning
              </Link>
              <Link
                href="/b2b/import"
                className="text-gray-600 hover:text-gray-900"
              >
                Import
              </Link>
            </div>
          </div>
          <Link href="/b2b/settings" className="text-gray-600 hover:text-gray-900">
            ⚙️
          </Link>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-8 py-8">
        {/* Search Panel */}
        <div className="bg-white border border-gray-200 rounded-lg p-6 mb-8">
          <form onSubmit={handleSearch} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Postcode
              </label>
              <input
                type="text"
                placeholder="e.g., M1 1AA"
                value={state.postcode}
                onChange={(e) =>
                  setState((s) => ({
                    ...s,
                    postcode: e.target.value.toUpperCase(),
                  }))
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-800"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search Radius
              </label>
              <select
                value={state.radius}
                onChange={(e) =>
                  setState((s) => ({ ...s, radius: parseInt(e.target.value) }))
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-800"
              >
                <option value="1">1 mile</option>
                <option value="3">3 miles</option>
                <option value="5">5 miles</option>
                <option value="10">10 miles</option>
                <option value="20">20 miles</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={state.loading}
              className="w-full bg-gray-900 text-white py-2 rounded-md font-medium hover:bg-gray-800 disabled:opacity-50"
            >
              {state.loading ? "Searching..." : "Search Market"}
            </button>
          </form>
        </div>

        {/* Error State */}
        {state.error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 text-red-800">
            {state.error}
          </div>
        )}

        {/* Results */}
        <div className="space-y-3">
          {state.results.length > 0 && (
            <div className="text-sm text-gray-600 mb-4">
              Found {state.results.length} qualified opportunity
              {state.results.length !== 1 ? "ies" : ""}
            </div>
          )}

          {state.results.map((result) => (
            <div
              key={result.id}
              className="bg-white border border-gray-200 rounded-lg p-4 hover:border-gray-400 transition cursor-pointer"
              onClick={() =>
                setState((s) => ({ ...s, selectedId: result.id }))
              }
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900">
                    {result.business_name}
                  </h3>
                  <div className="mt-1 text-sm text-gray-600">
                    <span>{result.business_category}</span>
                    <span className="mx-2">•</span>
                    <span>{result.city}</span>
                  </div>
                  {result.pressure_type && (
                    <div className="mt-2 text-sm">
                      <span className="inline-block bg-blue-50 text-blue-700 px-2 py-1 rounded">
                        {result.pressure_type}
                      </span>
                    </div>
                  )}
                </div>

                <div className="text-right ml-4">
                  <div className={`text-2xl font-bold ${getScoreColor(result.engagement_score)}`}>
                    {result.engagement_score || "—"}%
                  </div>
                  {result.lead_tier && (
                    <div className={`text-xs font-medium mt-1 ${getTierColor(result.lead_tier)}`}>
                      Tier {result.lead_tier}
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-3 flex gap-2">
                <button className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50">
                  Preview Email
                </button>
                <button className="px-3 py-1 text-sm bg-gray-900 text-white rounded hover:bg-gray-800">
                  Send
                </button>
              </div>
            </div>
          ))}

          {state.searching && state.results.length === 0 && !state.loading && (
            <div className="text-center py-12 text-gray-500">
              No qualified opportunities found in this area
            </div>
          )}

          {!state.searching && (
            <div className="text-center py-12 text-gray-500">
              Enter a postcode to discover qualified opportunities
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
