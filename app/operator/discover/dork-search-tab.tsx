"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { EmailPreviewModal } from "./email-preview-modal";

export function DorkSearchTab() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [emailModalOpen, setEmailModalOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState<any>(null);

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

  const handleViewLead = (leadId: string) => {
    router.push(`/operator/understand?prospectId=${leadId}`);
  };

  const handleGenerateEmail = (lead: any) => {
    setSelectedLead(lead);
    setEmailModalOpen(true);
  };

  const handleEmailApproved = async (email: any) => {
    // TODO: BATCH 2 Phase 2 - Save email and send campaign
    console.log("Email approved:", email);
    // For now, just close the modal
  };

  return (
    <div className="space-y-8">
      {/* Search Input Section */}
      <div className="space-y-3">
        <div>
          <label className="text-xs font-semibold text-[#0D0D0D] uppercase tracking-[0.15em] block mb-3">
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
            placeholder="e.g., Furniture stores on Instagram with email and phone"
            className="w-full px-4 py-3 border border-[#E8E8E8] rounded text-sm text-[#0D0D0D] focus:outline-none focus:border-[#0D0D0D] transition-colors bg-white"
            rows={3}
          />
          <p className="text-xs text-[#888888] mt-2">
            Tip: Include business type, source (Instagram, LinkedIn), and contact type (email, phone)
          </p>
        </div>

        <button
          onClick={handleSearch}
          disabled={loading}
          className="px-6 py-2 bg-[#0D0D0D] text-white text-xs font-semibold rounded hover:bg-[#333333] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? "Searching..." : "Search"}
        </button>
      </div>

      {/* Error State */}
      {error && (
        <div className="p-4 bg-[#FFF5F5] border border-[#FFE0E0] rounded">
          <p className="text-xs font-semibold text-[#D32F2F]">Error</p>
          <p className="text-xs text-[#B71C1C] mt-1">{error}</p>
        </div>
      )}

      {/* Results Section */}
      {result && result.success && (
        <div className="space-y-6">
          {/* Search Parameters */}
          <div>
            <h3 className="text-xs font-semibold text-[#0D0D0D] uppercase tracking-[0.15em] mb-4">
              Search Parameters
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="border border-[#E8E8E8] rounded p-3">
                <p className="text-[9px] text-[#888888] uppercase font-semibold tracking-[0.1em] mb-2">
                  Business Type
                </p>
                <p className="text-sm font-semibold text-[#0D0D0D]">
                  {result.parsed.businessType}
                </p>
              </div>
              <div className="border border-[#E8E8E8] rounded p-3">
                <p className="text-[9px] text-[#888888] uppercase font-semibold tracking-[0.1em] mb-2">
                  Source
                </p>
                <p className="text-sm font-semibold text-[#0D0D0D]">
                  {result.parsed.source}
                </p>
              </div>
              <div className="border border-[#E8E8E8] rounded p-3">
                <p className="text-[9px] text-[#888888] uppercase font-semibold tracking-[0.1em] mb-2">
                  Contact Type
                </p>
                <p className="text-sm font-semibold text-[#0D0D0D]">
                  {result.parsed.contactType}
                </p>
              </div>
              <div className="border border-[#E8E8E8] rounded p-3">
                <p className="text-[9px] text-[#888888] uppercase font-semibold tracking-[0.1em] mb-2">
                  Pressure Group
                </p>
                <p className="text-sm font-semibold text-[#0D0D0D]">
                  {result.parsed.pressureGroup}
                </p>
              </div>
            </div>
          </div>

          {/* Results Stats */}
          {result.leadsCreated > 0 && (
            <div className="border border-[#E8E8E8] rounded p-6">
              <div className="flex items-baseline justify-between mb-6">
                <h3 className="text-xs font-semibold text-[#0D0D0D] uppercase tracking-[0.15em]">
                  Discovered Prospects
                </h3>
                <p className="text-2xl font-black text-[#0D0D0D]">
                  {result.leadsCreated}
                </p>
              </div>

              {/* Leads List */}
              <div className="space-y-3">
                {result.leads?.map((lead: any, idx: number) => (
                  <div
                    key={idx}
                    className="p-4 border border-[#E8E8E8] rounded hover:border-[#0D0D0D] hover:bg-[#F9F9F9] transition-all"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-[#0D0D0D]">
                          {lead.businessName}
                        </p>
                        <div className="flex gap-4 mt-2 text-xs text-[#888888]">
                          {lead.email && (
                            <p>
                              <span className="font-semibold">Email:</span> {lead.email}
                            </p>
                          )}
                          {lead.phone && (
                            <p>
                              <span className="font-semibold">Phone:</span> {lead.phone}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleGenerateEmail(lead)}
                          className="px-3 py-1 text-xs font-semibold text-white bg-[#0D0D0D] rounded hover:bg-[#333333] transition-colors whitespace-nowrap"
                        >
                          Email
                        </button>
                        <button
                          onClick={() => handleViewLead(lead.id)}
                          className="px-3 py-1 text-xs font-semibold text-[#0D0D0D] border border-[#E8E8E8] rounded hover:bg-[#F9F9F9] transition-colors whitespace-nowrap"
                        >
                          View
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Empty State */}
      {!result && !loading && !error && (
        <div className="border border-[#E8E8E8] rounded p-12 text-center bg-[#F9F9F9]">
          <p className="text-sm text-[#888888]">
            Enter a search query to discover prospects
          </p>
        </div>
      )}

      {/* Email Preview Modal */}
      {selectedLead && (
        <EmailPreviewModal
          isOpen={emailModalOpen}
          lead={selectedLead}
          onClose={() => {
            setEmailModalOpen(false);
            setSelectedLead(null);
          }}
          onApprove={handleEmailApproved}
        />
      )}
    </div>
  );
}
