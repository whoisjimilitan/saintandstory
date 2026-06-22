"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface DorkSearchResult {
  batchId: string;
  query: string;
  dorkQuery: string;
  pressureGroup: string;
  resultsCount: number;
  createdLeads: number;
  leads: Array<{ id: string; businessName: string; email?: string; phone?: string }>;
  readyForPreview: boolean;
}

export function DorkSearchTab() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<DorkSearchResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async () => {
    if (!query.trim()) {
      setError("Please enter a search query");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/b2b/dork-search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query })
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Search failed");
      }

      const data: DorkSearchResult = await res.json();
      setResults(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Search failed");
    } finally {
      setLoading(false);
    }
  };

  const handleViewLead = (leadId: string) => {
    router.push(`/operator/understand?prospectId=${leadId}`);
  };

  return (
    <div className="space-y-6">
      {/* Input Section */}
      <div className="space-y-3">
        <div>
          <label className="text-xs font-semibold text-[#0D0D0D] uppercase tracking-[0.1em] block mb-3">
            What prospects are you looking for?
          </label>
          <textarea
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && e.ctrlKey) {
                handleSearch();
              }
            }}
            placeholder="e.g., Furniture stores on Instagram with phone numbers, London, handling custom orders"
            className="w-full px-4 py-3 border border-[#E8E8E8] rounded text-sm focus:outline-none focus:border-[#0D0D0D]"
            rows={3}
          />
          <p className="text-xs text-[#888888] mt-2">
            Tip: Include keywords, location, and what you know about their pain
          </p>
        </div>

        <button
          onClick={handleSearch}
          disabled={loading}
          className="px-6 py-2 bg-[#0D0D0D] text-white rounded text-xs font-semibold hover:bg-[#333333] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? "Searching..." : "Search & Preview"}
        </button>
      </div>

      {/* Error Display */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Results Section */}
      {results && (
        <div className="space-y-6">
          {/* Stats */}
          <div className="p-4 bg-[#F5F5F5] rounded-lg border border-[#E8E8E8]">
            <div className="grid grid-cols-3 gap-4">
              <div>
                <p className="text-[9px] text-[#888888] uppercase font-semibold tracking-[0.1em]">
                  Results Found
                </p>
                <p className="text-2xl font-black text-[#0D0D0D] mt-1">
                  {results.resultsCount}
                </p>
              </div>
              <div>
                <p className="text-[9px] text-[#888888] uppercase font-semibold tracking-[0.1em]">
                  Created Leads
                </p>
                <p className="text-2xl font-black text-[#0D0D0D] mt-1">
                  {results.createdLeads}
                </p>
              </div>
              <div>
                <p className="text-[9px] text-[#888888] uppercase font-semibold tracking-[0.1em]">
                  Pressure Group
                </p>
                <p className="text-xs font-semibold text-[#0D0D0D] mt-1">
                  {results.pressureGroup}
                </p>
              </div>
            </div>
          </div>

          {/* Dork Query Display */}
          <div className="p-3 bg-[#F9F9F9] border border-[#E8E8E8] rounded text-xs font-mono">
            <p className="text-[9px] text-[#888888] uppercase mb-2 font-semibold">
              Dork Query
            </p>
            <p className="text-[#0D0D0D] break-all">{results.dorkQuery}</p>
          </div>

          {/* Leads List */}
          {results.leads.length > 0 && (
            <div className="space-y-3">
              <p className="text-xs font-semibold text-[#0D0D0D] uppercase tracking-[0.1em]">
                Discovered Prospects
              </p>
              <div className="space-y-2">
                {results.leads.map((lead) => (
                  <button
                    key={lead.id}
                    onClick={() => handleViewLead(lead.id)}
                    className="w-full p-3 text-left border border-[#E8E8E8] rounded hover:border-[#0D0D0D] hover:bg-[#F9F9F9] transition-all group"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-[#0D0D0D]">
                          {lead.businessName}
                        </p>
                        <div className="text-xs text-[#888888] mt-1 space-y-0.5">
                          {lead.email && (
                            <p>📧 {lead.email}</p>
                          )}
                          {lead.phone && (
                            <p>📞 {lead.phone}</p>
                          )}
                        </div>
                      </div>
                      <p className="text-xs font-semibold text-[#0D0D0D] group-hover:text-[#333333] transition-colors">
                        View →
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Next Steps */}
          <div className="p-4 bg-[#F5F5F5] rounded-lg border border-[#E8E8E8]">
            <p className="text-xs font-semibold text-[#0D0D0D] mb-2">
              ✓ Next Steps
            </p>
            <ul className="text-xs text-[#666666] space-y-1">
              <li>• Click on any prospect above to view and enrich</li>
              <li>• System automatically enriched all prospects</li>
              <li>• Email drafts generated based on pressure signals</li>
              <li>• Ready to qualify and launch outreach</li>
            </ul>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!results && !loading && (
        <div className="p-8 text-center bg-[#F9F9F9] rounded-lg border border-[#E8E8E8]">
          <p className="text-sm text-[#888888]">
            Enter a search query above to discover prospects using intelligent dorking
          </p>
        </div>
      )}
    </div>
  );
}
