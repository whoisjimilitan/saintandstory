"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { QueueCenter } from "./queue-center";
import { DorkInjectModal } from "./dork-inject-modal";
import WhatsAppBatchCampaign from "@/components/WhatsAppBatchCampaign";

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
  const [activeTab, setActiveTab] = useState<"google-places" | "batch-upload">("batch-upload");
  const [selectedChannel, setSelectedChannel] = useState<"email" | "whatsapp" | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchRadius, setSearchRadius] = useState(10);
  const [isPostcodeSearch, setIsPostcodeSearch] = useState(false);
  const [showManualAddForm, setShowManualAddForm] = useState(false);
  const [showDorkInjectModal, setShowDorkInjectModal] = useState(false);
  const [manualAddForm, setManualAddForm] = useState({
    businessName: "",
    contactName: "",
    email: "",
    phone: "",
    city: "",
    postcode: "",
  });
  const [manualAddLoading, setManualAddLoading] = useState(false);
  const [showQueueCenter, setShowQueueCenter] = useState(false);
  const [selectedProspectsForEnrich, setSelectedProspectsForEnrich] = useState<Set<string>>(new Set());

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
        const resultsData = Array.isArray(data) ? data : data.results || [];

        // Store discovery results in sessionStorage for access in Understand page
        if (typeof window !== "undefined") {
          sessionStorage.setItem("discover_results", JSON.stringify(resultsData));
          sessionStorage.setItem("discover_timestamp", new Date().toISOString());
        }

        setState((s) => ({
          ...s,
          loading: false,
          results: resultsData,
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

      params.append("limit", "500");

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
      setShowQueueCenter(true);
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
      setShowQueueCenter(true);

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

  const handleProspectClick = async (prospect: Prospect) => {
    try {
      // Import prospect into database (or get existing UUID if already imported)
      const importRes = await fetch("/api/b2b/prospect/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          googlePlaceId: prospect.id,
          businessName: prospect.businessName,
          city: prospect.city,
        }),
      });

      if (!importRes.ok) {
        console.error("Failed to import prospect");
        alert("Could not load prospect. Please try again.");
        return;
      }

      const { id } = await importRes.json();
      // Navigate to Understand with the database UUID
      router.push(`/operator/understand?prospectId=${id}`);
    } catch (error) {
      console.error("Error importing prospect:", error);
      alert("Could not load prospect. Please try again.");
    }
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

  const handlePreviewAndPersonalise = () => {
    const selectedLeads = state.results.filter(p => selectedProspectsForEnrich.has(p.id));
    if (selectedLeads.length === 0) {
      alert("Please select at least one prospect");
      return;
    }

    // Store selected leads for ENRICH to use
    sessionStorage.setItem('enrich_prospects', JSON.stringify(selectedLeads));
    sessionStorage.setItem('enrich_mode', 'campaign');

    // Navigate to ENRICH
    router.push('/operator/enrich?mode=campaign');
  };

  const handleManualAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setManualAddLoading(true);

    try {
      const res = await fetch("/api/b2b/prospect/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          googlePlaceId: `manual-${Date.now()}`,
          businessName: manualAddForm.businessName,
          contactName: manualAddForm.contactName || undefined,
          email: manualAddForm.email || undefined,
          phone: manualAddForm.phone || undefined,
          city: manualAddForm.city,
          postcode: manualAddForm.postcode || undefined,
        }),
      });

      if (!res.ok) throw new Error("Failed to create lead");

      const { id } = await res.json();

      // Reset form and navigate to Understand page
      setShowManualAddForm(false);
      setManualAddForm({ businessName: "", contactName: "", email: "", phone: "", city: "", postcode: "" });
      router.push(`/operator/understand?prospectId=${id}`);
    } catch (error) {
      console.error("Error creating lead:", error);
      alert("Could not create lead. Please try again.");
    } finally {
      setManualAddLoading(false);
    }
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
    <div className="min-h-screen bg-[#F9F9F9] pt-32">
      <div className="px-4 md:px-12 py-10 max-w-6xl mx-auto">
        {/* Sub-Hero */}
        <div className="mb-8 md:mb-12 pb-4 md:pb-8 border-b border-[#E8E8E8]">
          <p className="text-lg font-bold text-[#0D0D0D] mb-4 md:mb-6 leading-relaxed">
            Upload to pipeline or search for prospects
          </p>
          <button
            onClick={() => setShowManualAddForm(true)}
            className="px-4 py-2 text-xs font-semibold text-[#0D0D0D] border border-[#E8E8E8] rounded hover:border-[#0D0D0D] transition-colors"
          >
            + Manually Add Lead
          </button>
        </div>

      {/* Tab Navigation + One-Click Injection */}
      <div className="mb-12 flex items-center justify-between border-b border-[#E8E8E8] pb-0">
        <div className="flex gap-0">
          <button
            onClick={() => setActiveTab("batch-upload")}
            className={`px-4 py-3 text-xs font-semibold uppercase tracking-[0.1em] border-b-2 transition-colors ${
              activeTab === "batch-upload"
                ? "text-[#0D0D0D] border-[#0D0D0D]"
                : "text-[#888888] border-transparent hover:text-[#0D0D0D]"
            }`}
          >
            Batch Upload
          </button>
          <button
            onClick={() => setActiveTab("google-places")}
            className={`px-4 py-3 text-xs font-semibold uppercase tracking-[0.1em] border-b-2 transition-colors ${
              activeTab === "google-places"
                ? "text-[#0D0D0D] border-[#0D0D0D]"
                : "text-[#888888] border-transparent hover:text-[#0D0D0D]"
            }`}
          >
            Google Places
          </button>
        </div>

        {/* ONE-CLICK INJECTION BUTTON */}
        <button
          onClick={() => setShowDorkInjectModal(true)}
          className="px-4 py-3 text-xs font-semibold uppercase tracking-[0.1em] text-white bg-[#0D0D0D] hover:bg-[#333333] rounded transition-colors"
          title="Run dork search and inject 50-100 leads directly into pipeline"
        >
          ⚡ Quick Inject
        </button>
      </div>

      {/* Queue Center View - Takes Priority */}
      {showQueueCenter && state.results.length > 0 ? (
        <div className="mb-12">
          <QueueCenter
            prospects={state.results}
            totalCount={state.totalCount}
            onBack={() => setShowQueueCenter(false)}
          />
        </div>
      ) : (
        <>
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

      {/* BATCH UPLOAD TAB */}
      {activeTab === "batch-upload" && (
        <div className="mb-12">
          {!selectedChannel ? (
            <div className="max-w-2xl">
              <div className="mb-8">
                <h3 className="text-xl font-black text-[#0D0D0D] mb-2">Upload for Campaign</h3>
                <p className="text-sm text-[#666666]">
                  Choose which channel this upload is for
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => setSelectedChannel("email")}
                  className="p-6 border-2 border-[#E8E8E8] rounded-lg hover:border-[#0D0D0D] hover:bg-[#F9F9F9] transition-all text-left"
                >
                  <p className="text-sm font-black text-[#0D0D0D] mb-2">Email Campaign</p>
                  <p className="text-xs text-[#666666]">Medium & enterprise businesses</p>
                </button>

                <button
                  onClick={() => setSelectedChannel("whatsapp")}
                  className="p-6 border-2 border-[#E8E8E8] rounded-lg hover:border-[#0D0D0D] hover:bg-[#F9F9F9] transition-all text-left"
                >
                  <p className="text-sm font-black text-[#0D0D0D] mb-2">WhatsApp Campaign</p>
                  <p className="text-xs text-[#666666]">Small businesses & real-time outreach</p>
                </button>
              </div>
            </div>
          ) : (
            <div>
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <p className="text-xs text-[#888888] uppercase font-semibold tracking-[0.05em] mb-1">Campaign Type</p>
                  <p className="text-sm font-black text-[#0D0D0D]">
                    {selectedChannel === "email" ? "Email Campaign" : "WhatsApp Campaign"}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedChannel(null)}
                  className="text-xs text-[#0D0D0D] hover:text-[#666666] transition-colors"
                >
                  Change
                </button>
              </div>
              <WhatsAppBatchCampaign channel={selectedChannel} onCampaignCreated={() => setSelectedChannel(null)} />
            </div>
          )}
        </div>
      )}

      {/* GOOGLE PLACES TAB */}
      {activeTab === "google-places" && (
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
      )}

      {/* Results Section */}
      {activeTab === "google-places" && (
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
          <div>
            {/* Selection Bar - Email Channel Only */}
            {selectedChannel === "email" && (
              <div className="mb-6 p-4 bg-[#F9F9F9] border border-[#E8E8E8] rounded-lg">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-[#0D0D0D]">
                    {selectedProspectsForEnrich.size} selected
                  </p>
                  <div className="flex gap-3">
                    {selectedProspectsForEnrich.size > 0 && (
                      <>
                        <button
                          onClick={handlePreviewAndPersonalise}
                          className="px-6 py-2 bg-[#0D0D0D] text-white rounded text-sm font-semibold hover:bg-[#333333] transition-colors"
                        >
                          Preview & Personalise
                        </button>
                        <button
                          onClick={() => setSelectedProspectsForEnrich(new Set())}
                          className="px-6 py-2 border border-[#E8E8E8] text-[#0D0D0D] rounded text-sm font-semibold hover:border-[#0D0D0D] transition-colors"
                        >
                          Clear
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-4">
            {state.results.map((prospect) => (
              <div
                key={prospect.id}
                className="flex items-start gap-4 border border-[#E8E8E8] rounded-lg p-6 bg-white hover:border-[#0D0D0D] hover:shadow-md transition-all group"
              >
                {/* Checkbox for Email Channel */}
                {selectedChannel === "email" && (
                  <input
                    type="checkbox"
                    checked={selectedProspectsForEnrich.has(prospect.id)}
                    onChange={(e) => {
                      const newSelected = new Set(selectedProspectsForEnrich);
                      if (e.target.checked) {
                        newSelected.add(prospect.id);
                      } else {
                        newSelected.delete(prospect.id);
                      }
                      setSelectedProspectsForEnrich(newSelected);
                    }}
                    className="w-4 h-4 mt-2 accent-[#0D0D0D] cursor-pointer flex-shrink-0"
                  />
                )}

                {/* Prospect Info */}
                <button
                  onClick={() => handleProspectClick(prospect)}
                  className="flex-1 text-left cursor-pointer"
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
              </div>
            ))}
            </div>
          </div>
        )}
      </section>
      )}
        </>
      )}

      {/* Manual Add Lead Modal */}
      {showManualAddForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-8 max-w-md w-full">
            <h2 className="text-2xl font-black text-[#0D0D0D] mb-6">Add Lead Manually</h2>

            <form onSubmit={handleManualAddSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-[#0D0D0D] uppercase block mb-2">
                  Business Name *
                </label>
                <input
                  type="text"
                  required
                  value={manualAddForm.businessName}
                  onChange={(e) =>
                    setManualAddForm((f) => ({ ...f, businessName: e.target.value }))
                  }
                  className="w-full px-4 py-2 border border-[#E8E8E8] rounded text-sm focus:outline-none focus:border-[#0D0D0D]"
                  placeholder="Company name"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-[#0D0D0D] uppercase block mb-2">
                  Contact Name
                </label>
                <input
                  type="text"
                  value={manualAddForm.contactName}
                  onChange={(e) =>
                    setManualAddForm((f) => ({ ...f, contactName: e.target.value }))
                  }
                  className="w-full px-4 py-2 border border-[#E8E8E8] rounded text-sm focus:outline-none focus:border-[#0D0D0D]"
                  placeholder="Contact name"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-[#0D0D0D] uppercase block mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={manualAddForm.email}
                  onChange={(e) =>
                    setManualAddForm((f) => ({ ...f, email: e.target.value }))
                  }
                  className="w-full px-4 py-2 border border-[#E8E8E8] rounded text-sm focus:outline-none focus:border-[#0D0D0D]"
                  placeholder="Email"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-[#0D0D0D] uppercase block mb-2">
                  Phone
                </label>
                <input
                  type="tel"
                  value={manualAddForm.phone}
                  onChange={(e) =>
                    setManualAddForm((f) => ({ ...f, phone: e.target.value }))
                  }
                  className="w-full px-4 py-2 border border-[#E8E8E8] rounded text-sm focus:outline-none focus:border-[#0D0D0D]"
                  placeholder="Phone number"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-[#0D0D0D] uppercase block mb-2">
                  City
                </label>
                <input
                  type="text"
                  value={manualAddForm.city}
                  onChange={(e) =>
                    setManualAddForm((f) => ({ ...f, city: e.target.value }))
                  }
                  className="w-full px-4 py-2 border border-[#E8E8E8] rounded text-sm focus:outline-none focus:border-[#0D0D0D]"
                  placeholder="City"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-[#0D0D0D] uppercase block mb-2">
                  Postcode
                </label>
                <input
                  type="text"
                  value={manualAddForm.postcode}
                  onChange={(e) =>
                    setManualAddForm((f) => ({ ...f, postcode: e.target.value }))
                  }
                  className="w-full px-4 py-2 border border-[#E8E8E8] rounded text-sm focus:outline-none focus:border-[#0D0D0D]"
                  placeholder="Postcode"
                />
              </div>

              <div className="flex gap-3 pt-6 border-t border-[#E8E8E8]">
                <button
                  type="submit"
                  disabled={manualAddLoading}
                  className="flex-1 px-4 py-2 bg-[#0D0D0D] text-white text-xs font-semibold rounded hover:bg-[#333333] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {manualAddLoading ? "Creating..." : "Create Lead"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowManualAddForm(false)}
                  className="px-4 py-2 border border-[#E8E8E8] text-[#0D0D0D] text-xs font-semibold rounded hover:border-[#0D0D0D] transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DORK SEARCH INJECTION MODAL */}
      <DorkInjectModal
        isOpen={showDorkInjectModal}
        onClose={() => setShowDorkInjectModal(false)}
        onSuccess={(count) => {
          // Refresh results after injection
          setShowDorkInjectModal(false);
          setState(s => ({ ...s, error: null }));
          // Could refresh queue or show toast here
        }}
      />
      </div>
    </div>
  );
}
