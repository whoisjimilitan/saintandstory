"use client";

import { useState } from "react";
import Link from "next/link";

interface DiscoveryResult {
  name: string;
  status: string;
}

const CATEGORIES = [
  "Solicitors",
  "Estate Agents",
  "Florists",
  "Restaurants",
  "Retail Stores",
];

export default function DiscoverPage() {
  const [city, setCity] = useState("");
  const [category, setCategory] = useState("Solicitors");
  const [searching, setSearching] = useState(false);
  const [results, setResults] = useState<DiscoveryResult[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [showResults, setShowResults] = useState(false);

  const handleSearch = async () => {
    if (!city.trim()) {
      setError("Please enter a city");
      return;
    }

    setError(null);
    setSearching(true);
    setShowResults(true);

    try {
      const response = await fetch("/api/b2b/discover", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          niche: category,
          city: city.trim(),
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setResults(
          (data.added || []).map((name: string) => ({
            name,
            status: "added",
          }))
        );

        if (data.count === 0) {
          setError("No new prospects found in this search");
        }
      } else {
        setError("Discovery failed. Please try again.");
      }
    } catch (err) {
      console.error("Discovery error:", err);
      setError("Error during discovery. Please try again.");
    } finally {
      setSearching(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto p-6">
        {/* HEADER */}
        <div className="mb-8">
          <Link href="/b2b" className="text-blue-600 hover:text-blue-700 text-sm font-medium mb-4 inline-block">
            ← Back to Dashboard
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Discover Prospects</h1>
          <p className="text-gray-600 mt-2">
            Search for businesses in a specific city and niche
          </p>
        </div>

        {/* SEARCH FORM */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                City
              </label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="e.g., London, Manchester, Edinburgh"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm"
                onKeyPress={(e) => {
                  if (e.key === "Enter") handleSearch();
                }}
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 p-3 rounded text-red-700 text-sm">
                {error}
              </div>
            )}

            <button
              onClick={handleSearch}
              disabled={searching}
              className="w-full bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-400"
            >
              {searching ? "Searching..." : "Search Prospects"}
            </button>
          </div>
        </div>

        {/* RESULTS */}
        {showResults && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">
              {searching ? "Searching..." : "Results"}
            </h2>

            {results.length > 0 ? (
              <div className="space-y-2">
                {results.map((result, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-3 border border-gray-200 rounded-lg"
                  >
                    <div>
                      <p className="font-medium text-gray-900">{result.name}</p>
                      <p className="text-xs text-gray-500">
                        {result.status === "added" ? "✅ Added to pipeline" : ""}
                      </p>
                    </div>
                  </div>
                ))}
                <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-800">
                  <p className="font-medium mb-2">✅ Discovery Complete</p>
                  <p>
                    {results.length} new prospect{results.length !== 1 ? "s" : ""} added to your pipeline.
                  </p>
                  <Link
                    href="/b2b"
                    className="inline-block mt-3 text-blue-600 hover:text-blue-700 font-medium"
                  >
                    View in Dashboard →
                  </Link>
                </div>
              </div>
            ) : (
              !searching && (
                <div className="text-center py-8 text-gray-500">
                  No results shown yet. Click "Search Prospects" to begin.
                </div>
              )
            )}
          </div>
        )}
      </div>
    </div>
  );
}
