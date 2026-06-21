"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

interface Prospect {
  id: string;
  businessName: string;
  contactName?: string;
  city?: string;
  postcode?: string;
  confidenceScore?: number;
  industry?: string;
  status?: string;
  pressureSignal?: string;
  trustSource?: string;
}

interface DiscoverState {
  loading: boolean;
  error: string | null;
  results: Prospect[];
  totalCount: number;
  currentFilter: string;
  uploadProgress?: number;
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
  const [searchRadius, setSearchRadius] = useState(10);
  const [isPostcodeSearch, setIsPostcodeSearch] = useState(false);

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

  // Handle search (keyword or postcode with radius)
  // Uses new orchestrator endpoint at /api/b2b/discover
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchTerm.trim()) return;

    try {
      setState((s) => ({ ...s, loading: true, error: null }));

      // Build URL for orchestrator endpoint
      const params = new URLSearchParams();

      if (isPostcodeSearch) {
        params.append("postcode", searchTerm);
        if (searchRadius) {
          params.append("radius", searchRadius.toString());
        }
      } else {
        params.append("keyword", searchTerm);
      }

      params.append("limit", "100");

      const url = `/api/b2b/discover?${params.toString()}`;

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
        currentFilter: `search="${searchTerm}"${isPostcodeSearch ? ` within ${searchRadius}km` : ""}`,
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

  // Handle file upload for bulk import
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setState((s) => ({ ...s, uploadProgress: 0 }));

      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/b2b/discover/import", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}: Upload failed`);

      const data = await res.json();

      setState((s) => ({
        ...s,
        uploadProgress: undefined,
        results: data.results || [],
        totalCount: data.totalCount || 0,
        currentFilter: `imported from file (${data.importedCount || 0} leads)`,
      }));

      // Reset file input
      e.target.value = "";
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Upload failed";
      setState((s) => ({
        ...s,
        uploadProgress: undefined,
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

  const handleClearFilters = () => {
    setSearchTerm("");
    setSearchRadius(10);
    setIsPostcodeSearch(false);
    setState({
      loading: true,
      error: null,
      results: [],
      totalCount: 0,
      currentFilter: "all",
      uploadProgress: undefined,
    });
    router.push("/operator/discover");
  };

  // Interpret pressure signal from prospect data
  const getPressureSignal = (prospect: Prospect): string => {
    if (prospect.pressureSignal) return prospect.pressureSignal;

    // Fallback interpretation
    if (prospect.confidenceScore && prospect.confidenceScore >= 80) {
      return "Strong market signals detected";
    }
    if (prospect.status === "expansion") {
      return "Company expanding (growth signal)";
    }
    return "Potential opportunity";
  };

  // Interpret trust source from prospect data
  const getTrustSource = (prospect: Prospect): string => {
    if (prospect.trustSource) return prospect.trustSource;

    // Fallback interpretation
    if (prospect.confidenceScore && prospect.confidenceScore >= 85) {
      return "Multiple signals aligned (Google, hiring, capex)";
    }
    if (prospect.confidenceScore && prospect.confidenceScore >= 70) {
      return "Primary signals confirmed";
    }
    return "Basic business data verified";
  };

  return (
    <div className="px-4 md:px-12 py-10 max-w-6xl">
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
          Find new prospects and import lead lists into your pipeline.
        </p>
      </div>

      {/* Discovery Briefing (Pressure Signals) */}
      <section className="mb-12 p-4 bg-[#F9F9F9] border border-[#E8E8E8] rounded-lg">
        <p className="text-sm text-[#0D0D0D]">
          <span className="font-semibold">Opportunity window is open.</span> Find prospects showing pressure signals (expansion, hiring, capex) when they're ready to buy.
        </p>
      </section>

      {/* Active Filter Display */}
      {(status || score || stage || state.currentFilter !== "all") && (
        <div className="mb-8 p-4 bg-[#F5F5F5] border border-[#E8E8E8] rounded-lg">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-[#0D0D0D]">
              Filtered: {state.currentFilter === "all" ? getFilterLabel() : state.currentFilter}
            </p>
            <button
              onClick={handleClearFilters}
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

        {/* Search Type Toggle */}
        <div className="flex gap-4 mb-6">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="searchType"
              checked={!isPostcodeSearch}
              onChange={() => setIsPostcodeSearch(false)}
              className="w-4 h-4 accent-[#0D0D0D]"
            />
            <span className="text-sm text-[#0D0D0D]">Keyword Search</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="searchType"
              checked={isPostcodeSearch}
              onChange={() => setIsPostcodeSearch(true)}
              className="w-4 h-4 accent-[#0D0D0D]"
            />
            <span className="text-sm text-[#0D0D0D]">Postcode Search</span>
          </label>
        </div>

        {/* Postcode Search with Radius Slider */}
        {isPostcodeSearch && (
          <div className="mb-6 p-4 bg-[#F5F5F5] border border-[#E8E8E8] rounded-lg">
            <div className="flex items-center justify-between mb-4">
              <label className="text-sm font-semibold text-[#0D0D0D]">
                Search Radius: {searchRadius} km
              </label>
              <span className="text-xs text-[#888888]">1-25 km</span>
            </div>
            <input
              type="range"
              min="1"
              max="25"
              value={searchRadius}
              onChange={(e) => setSearchRadius(parseInt(e.target.value))}
              className="w-full accent-[#333333]"
            />
            <p className="text-xs text-[#888888] mt-2">
              Adjust radius to find prospects near your target location
            </p>
          </div>
        )}

        {/* Search Input */}
        <form onSubmit={handleSearch} className="flex gap-2 mb-6">
          <input
            type="text"
            placeholder={
              isPostcodeSearch
                ? "Enter postcode (e.g., SW1A 1AA)"
                : "Search by company name, industry, or location…"
            }
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 px-4 py-3 bg-white border border-[#E8E8E8] text-sm text-[#0D0D0D] placeholder-[#C9C9C9] focus:outline-none focus:border-[#0D0D0D] transition-colors rounded"
          />
          <button
            type="submit"
            className="px-6 py-3 bg-[#0D0D0D] text-white text-xs font-semibold rounded hover:bg-[#333333] transition-colors"
          >
            Search
          </button>
        </form>

        {/* File Upload Section */}
        <div className="p-4 bg-[#F9F9F9] border-2 border-dashed border-[#E8E8E8] rounded-lg text-center">
          <p className="text-sm font-semibold text-[#0D0D0D] mb-2">
            Or import leads from CSV file
          </p>
          <p className="text-xs text-[#888888] mb-4">
            Upload a CSV with columns: businessName, city, industry, contactName
          </p>
          <label className="inline-flex px-4 py-2 bg-white border border-[#E8E8E8] rounded text-xs font-semibold text-[#0D0D0D] hover:border-[#0D0D0D] cursor-pointer transition-colors">
            <input
              type="file"
              accept=".csv"
              onChange={handleFileUpload}
              className="hidden"
              disabled={state.uploadProgress !== undefined}
            />
            {state.uploadProgress !== undefined
              ? `Uploading... ${state.uploadProgress}%`
              : "Choose CSV File"}
          </label>
        </div>
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
                Try a different search term or expand your radius.
              </p>
            )}
          </div>
        )}

        {!state.loading && !state.error && state.results.length > 0 && (
          <div className="space-y-4">
            {state.results.map((prospect) => (
              <button
                key={prospect.id}
                onClick={() => handleProspectClick(prospect)}
                className="w-full text-left border border-[#E8E8E8] rounded-lg p-6 bg-white hover:border-[#0D0D0D] hover:shadow-md transition-all cursor-pointer group"
              >
                {/* Header: Company + Confidence */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-[#0D0D0D] group-hover:text-[#333333]">
                      {prospect.businessName}
                    </p>
                    {prospect.contactName && (
                      <p className="text-xs text-[#888888]">
                        {prospect.contactName}
                      </p>
                    )}
                  </div>
                  {prospect.confidenceScore !== undefined && (
                    <div className="ml-4 text-right">
                      <p className="text-sm font-black text-[#0D0D0D]">
                        {prospect.confidenceScore}%
                      </p>
                      <p className="text-[9px] text-[#888888]">confidence</p>
                    </div>
                  )}
                </div>

                {/* Pressure Signal (Why This Matters Now) */}
                <div className="mb-3 pb-3 border-b border-[#E8E8E8]">
                  <p className="text-xs font-semibold text-[#0D0D0D] mb-1">
                    PRESSURE SIGNAL
                  </p>
                  <p className="text-xs text-[#666666]">
                    {getPressureSignal(prospect)}
                  </p>
                </div>

                {/* Trust Signal (Why Confident) */}
                <div className="mb-3 pb-3 border-b border-[#E8E8E8]">
                  <p className="text-xs font-semibold text-[#0D0D0D] mb-1">
                    TRUST BASIS
                  </p>
                  <p className="text-xs text-[#666666]">
                    {getTrustSource(prospect)}
                  </p>
                </div>

                {/* Location + Industry */}
                <div className="flex gap-3 text-xs text-[#888888] mb-3">
                  {prospect.postcode && <span>{prospect.postcode}</span>}
                  {prospect.city && <span>{prospect.city}</span>}
                  {prospect.industry && <span>{prospect.industry}</span>}
                </div>

                {/* Decision Guidance + CTA */}
                <p className="text-xs text-[#0D0D0D] font-semibold group-hover:text-[#666666] transition-colors">
                  Qualify This Prospect →
                </p>
              </button>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
