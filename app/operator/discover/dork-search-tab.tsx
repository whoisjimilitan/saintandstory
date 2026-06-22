"use client";

import { useState } from "react";

export function DorkSearchTab() {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async () => {
    if (!query.trim()) {
      setError("Please enter a search query");
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch("/api/b2b/dork-search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: query.trim() })
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Search failed");
        return;
      }

      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Search failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Input Section */}
      <div className="space-y-3">
        <label className="text-xs font-semibold text-[#0D0D0D] uppercase tracking-[0.1em] block">
          Search Query
        </label>
        <textarea
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && e.ctrlKey) {
              handleSearch();
            }
          }}
          placeholder="Enter search query (e.g., Furniture stores on Instagram with phone)"
          className="w-full px-4 py-3 border border-[#E8E8E8] rounded text-sm focus:outline-none focus:border-[#0D0D0D]"
          rows={3}
        />
        <button
          onClick={handleSearch}
          disabled={loading}
          className="px-6 py-2 bg-[#0D0D0D] text-white rounded text-xs font-semibold hover:bg-[#333333] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? "Searching..." : "Search"}
        </button>
      </div>

      {/* Error Display */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded text-sm text-red-700">
          ❌ {error}
        </div>
      )}

      {/* Success Display */}
      {result && result.success && (
        <div className="space-y-4">
          <div className="p-4 bg-green-50 border border-green-200 rounded">
            <p className="text-sm font-semibold text-green-900">✅ Query Received</p>
            <p className="text-xs text-green-800 mt-2">
              Query: <strong>{result.query}</strong>
            </p>
            <p className="text-xs text-green-800">
              Timestamp: {result.timestamp}
            </p>
            <p className="text-xs text-green-800">
              Status: {result.phase}
            </p>
          </div>

          <div className="p-4 bg-[#F5F5F5] rounded border border-[#E8E8E8]">
            <p className="text-xs font-semibold text-[#0D0D0D] mb-2">API Response:</p>
            <pre className="text-xs overflow-auto bg-white p-2 border border-[#E8E8E8] rounded">
              {JSON.stringify(result, null, 2)}
            </pre>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!result && !loading && !error && (
        <div className="p-8 text-center bg-[#F9F9F9] rounded-lg border border-[#E8E8E8]">
          <p className="text-sm text-[#888888]">
            Enter a search query above. PHASE 1 testing basic endpoint functionality.
          </p>
        </div>
      )}
    </div>
  );
}
