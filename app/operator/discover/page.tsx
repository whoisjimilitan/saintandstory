"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

interface Prospect {
  id: string;
  businessName: string;
  contactName?: string;
  city?: string;
  confidenceScore?: number;
  industry?: string;
  status?: string;
}

interface DiscoverState {
  loading: boolean;
  error: string | null;
  results: Prospect[];
  totalCount: number;
  currentFilter: string;
}

export default function DiscoverPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [state, setState] = useState<DiscoverState>({
    loading: true,
    error: null,
    results: [],
    totalCount: 0,
    currentFilter: "all",
  });
  const [searchTerm, setSearchTerm] = useState("");

  // Parse filter from URL
  const status = searchParams.get("status");
  const score = searchParams.get("score");
  const stage = searchParams.get("stage");

  // Determine which filter is active
  useEffect(() => {
    if (status) setState((s) => ({ ...s, currentFilter: `status=${status}` }));
    else if (score) setState((s) => ({ ...s, currentFilter: `score=${score}` }));
    else if (stage) setState((s) => ({ ...s, currentFilter: `stage=${stage}` }));
    else setState((s) => ({ ...s, currentFilter: "all" }));
  }, [status, score, stage]);

  // Fetch data based on filter
  useEffect(() => {
    const fetchDiscoverData = async () => {
      try {
        setState((s) => ({ ...s, loading: true, error: null }));

        let url = "/api/b2b/discover";
        const params = new URLSearchParams();

        if (status) params.append("status", status);
        if (score) params.append("score", score);
        if (stage) params.append("stage", stage);

        if (params.toString()) {
          url += "?" + params.toString();
        }

        const res = await fetch(url);
        if (!res.ok) throw new Error(`HTTP ${res.status}: Failed to fetch`);

        const data = await res.json();
        setState((s) => ({
          ...s,
          loading: false,
          results: Array.isArray(data) ? data : data.results || [],
          totalCount: data.totalCount || (Array.isArray(data) ? data.length : 0),
        }));
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Unknown error occurred";
        setState((s) => ({
          ...s,
          loading: false,
          error: message,
          results: [],
        }));
      }
    };

    fetchDiscoverData();
  }, [status, score, stage]);

  // Handle search
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchTerm.trim()) return;

    try {
      setState((s) => ({ ...s, loading: true, error: null }));

      const url = `/api/b2b/discover/search?query=${encodeURIComponent(searchTerm)}`;
      const res = await fetch(url, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}: Search failed`);

      const data = await res.json();
      setState((s) => ({
        ...s,
        loading: false,
        results: data.results || [],
        totalCount: data.totalCount || 0,
        currentFilter: `search="${searchTerm}"`,
      }));
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Search failed";
      setState((s) => ({
        ...s,
        loading: false,
        error: message,
      }));
    }
  };

  const getFilterLabel = () => {
    if (status === "new") return "New Leads";
    if (score === "80+") return "High Confidence (80+)";
    if (stage) return `Stage: ${stage.charAt(0).toUpperCase() + stage.slice(1)}`;
    return "All Prospects";
  };

  const handleProspectClick = (prospect: Prospect) => {
    router.push(`/operator/understand?prospectId=${prospect.id}`);
  };

  return (
    <div className="px-4 md:px-12 py-10 max-w-4xl">
      {/* Header */}
      <div className="mb-12">
        <div className="flex items-center justify-between mb-4">
          <h1 className="font-sans font-black text-[#0D0D0D] text-4xl md:text-5xl tracking-tight leading-tight">
            Discover
          </h1>
          <Link
            href="/operator"
            className="text-xs font-semibold text-[#888888] hover:text-[#0D0D0D] transition-colors"
          >
            ← Back to Today
          </Link>
        </div>
        <p className="text-sm md:text-base text-[#888888] font-normal">
          Find and qualify new prospects for outreach.
        </p>
      </div>

      {/* Active Filter Display */}
      {(status || score || stage) && (
        <div className="mb-8 p-4 bg-[#F5F5F5] border border-[#E8E8E8] rounded-lg">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-[#0D0D0D]">
              Filtered: {getFilterLabel()}
            </p>
            <button
              onClick={() => router.push("/operator/discover")}
              className="text-xs font-semibold text-[#888888] hover:text-[#0D0D0D] transition-colors"
            >
              Clear filter
            </button>
          </div>
        </div>
      )}

      {/* Divider */}
      <div className="h-px bg-[#E8E8E8] mb-12"></div>

      {/* Search Section */}
      <section className="mb-12">
        <h2 className="text-sm font-semibold text-[#0D0D0D] uppercase tracking-[0.15em] mb-6">
          Search Prospects
        </h2>
        <form onSubmit={handleSearch} className="flex gap-2">
          <input
            type="text"
            placeholder="Search by postcode, industry, or company name…"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 px-4 py-3 bg-[#F9F9F9] border border-[#E8E8E8] text-sm text-[#0D0D0D] placeholder-[#C9C9C9] focus:outline-none focus:border-[#0D0D0D] transition-colors rounded"
          />
          <button
            type="submit"
            className="px-6 py-3 bg-[#0D0D0D] text-white text-xs font-semibold rounded hover:bg-[#333333] transition-colors"
          >
            Search
          </button>
        </form>
      </section>

      {/* Results Section */}
      <section>
        <div className="mb-6">
          <h2 className="text-sm font-semibold text-[#0D0D0D] uppercase tracking-[0.15em]">
            Results
          </h2>
          {state.totalCount > 0 && (
            <p className="text-xs text-[#888888] mt-2">
              {state.totalCount} prospect{state.totalCount !== 1 ? "s" : ""} found
            </p>
          )}
        </div>

        {state.loading && (
          <div className="flex justify-center py-12">
            <div className="text-center">
              <div className="w-8 h-8 border-2 border-[#E8E8E8] border-t-[#0D0D0D] rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-sm text-[#666666]">Searching prospects...</p>
            </div>
          </div>
        )}

        {state.error && (
          <div className="border border-[#E8E8E8] rounded-lg p-8 bg-white text-center">
            <p className="text-sm text-[#666666] mb-4">{state.error}</p>
            <button
              onClick={() => window.location.reload()}
              className="text-xs font-semibold text-[#0D0D0D] hover:text-[#666666] transition-colors"
            >
              Try Again
            </button>
          </div>
        )}

        {!state.loading && !state.error && state.results.length === 0 && (
          <div className="border border-[#E8E8E8] rounded-lg p-8 bg-white text-center">
            <p className="text-sm text-[#666666]">No prospects found.</p>
            {searchTerm && (
              <p className="text-xs text-[#888888] mt-2">
                Try a different search term or filter.
              </p>
            )}
          </div>
        )}

        {!state.loading && !state.error && state.results.length > 0 && (
          <div className="space-y-3">
            {state.results.map((prospect) => (
              <button
                key={prospect.id}
                onClick={() => handleProspectClick(prospect)}
                className="w-full text-left border border-[#E8E8E8] rounded-lg p-6 bg-white hover:border-[#0D0D0D] hover:shadow-md transition-all cursor-pointer group"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-[#0D0D0D] group-hover:text-[#333333]">
                      {prospect.businessName}
                    </p>
                    {prospect.contactName && (
                      <p className="text-xs text-[#888888]">
                        Contact: {prospect.contactName}
                      </p>
                    )}
                  </div>
                  {prospect.confidenceScore !== undefined && (
                    <div className="ml-4">
                      <p className="text-sm font-black text-[#0D0D0D]">
                        {prospect.confidenceScore}%
                      </p>
                      <p className="text-[9px] text-[#888888]">confidence</p>
                    </div>
                  )}
                </div>
                <div className="flex gap-4 text-xs text-[#888888]">
                  {prospect.city && <span>{prospect.city}</span>}
                  {prospect.industry && <span>{prospect.industry}</span>}
                  {prospect.status && <span>{prospect.status}</span>}
                </div>
                <p className="text-xs text-[#0D0D0D] font-semibold group-hover:text-[#666666] mt-3 transition-colors">
                  View & Qualify →
                </p>
              </button>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
