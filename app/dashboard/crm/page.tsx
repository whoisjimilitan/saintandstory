"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";

interface Prospect {
  id: string;
  businessName: string;
  email: string;
  phone?: string;
  city: string;
  category: string;
  status: string;
  emailCount: number;
  lastEmailAt?: string;
  totalOpens: number;
  totalClicks: number;
  totalReplies: number;
}

interface Email {
  id: string;
  subject: string;
  sentAt: string;
  status: string;
  opens: number;
  clicks: number;
}

interface ProspectDetail {
  prospect: {
    id: string;
    businessName: string;
    category: string;
    email: string;
    phone?: string;
    city: string;
    website?: string;
    status: string;
    createdAt: string;
  };
  emails: Email[];
  emailsSummary: {
    totalSent: number;
    totalOpens: number;
    totalClicks: number;
  };
}

export default function CRMPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const prospectIdParam = searchParams.get("id");

  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Prospect[]>([]);
  const [selectedProspect, setSelectedProspect] = useState<ProspectDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);

  // Auto-load prospect if id is in URL
  useEffect(() => {
    if (prospectIdParam) {
      loadProspectDetail(prospectIdParam);
    }
  }, [prospectIdParam]);

  // Search prospects
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.length < 2) return;

    setSearching(true);
    try {
      const res = await fetch(`/api/crm/search?q=${encodeURIComponent(searchQuery)}`, {
        headers: { "x-admin-email": "whoisjimi.today@gmail.com" },
      });
      const data = await res.json();
      setSearchResults(data.results || []);
      setSelectedProspect(null);
    } catch (error) {
      console.error("Search failed:", error);
    } finally {
      setSearching(false);
    }
  };

  // Load prospect details
  const loadProspectDetail = async (prospectId: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/crm/prospect?id=${prospectId}`, {
        headers: { "x-admin-email": "whoisjimi.today@gmail.com" },
      });
      const data = await res.json();
      setSelectedProspect(data);
    } catch (error) {
      console.error("Failed to load prospect:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white pt-24 pb-12">
      <div className="px-4 md:px-8 lg:px-12">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl md:text-5xl font-black text-[#0D0D0D] mb-3 tracking-tight leading-tight">
            Prospect search.
          </h1>
          <p className="text-base text-[#666666] leading-relaxed max-w-3xl font-normal">
            Find prospects and view all communications.
          </p>
        </div>

        {/* Google-Style Search Bar */}
        <form onSubmit={handleSearch} className="mb-16">
          <div className="max-w-2xl mx-auto">
            <div className="flex items-center gap-3 px-6 py-4 border border-[#E8E8E8] rounded-full bg-white hover:border-[#0D0D0D] hover:shadow-sm transition-all">
              <input
                type="text"
                placeholder="Search by business name, email, phone, or city..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 text-sm text-[#0D0D0D] bg-transparent focus:outline-none placeholder-[#CCCCCC]"
              />
              <button
                type="submit"
                disabled={searchQuery.length < 2 || searching}
                className="text-xs font-semibold text-[#0D0D0D] px-4 py-1.5 rounded hover:bg-[#F9F9F9] disabled:opacity-50 transition-colors"
              >
                {searching ? "Searching..." : "Search"}
              </button>
            </div>
          </div>
        </form>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Search Results Sidebar */}
          <div className="lg:col-span-1">
            <div className="border border-[#E8E8E8] rounded-lg p-6 md:p-8 bg-white max-h-[600px] overflow-y-auto sticky top-24">
              <p className="text-xs font-semibold text-[#0D0D0D] tracking-[0.05em] uppercase mb-4">
                Results ({searchResults.length})
              </p>

              {searchResults.length === 0 && searchQuery.length >= 2 && (
                <p className="text-xs text-[#888888]">No results found</p>
              )}

              <div className="space-y-2">
                {searchResults.map((prospect) => (
                  <button
                    key={prospect.id}
                    onClick={() => loadProspectDetail(prospect.id)}
                    className={`w-full text-left p-3 rounded border transition-all ${
                      selectedProspect?.prospect.id === prospect.id
                        ? "border-[#0D0D0D] bg-[#F9F9F9]"
                        : "border-[#E8E8E8] hover:border-[#0D0D0D] hover:bg-[#F9F9F9]"
                    }`}
                  >
                    <p className="font-semibold text-xs text-[#0D0D0D]">{prospect.businessName}</p>
                    <p className="text-[10px] mt-1 text-[#888888]">{prospect.email}</p>
                    <div className="flex gap-2 mt-2 text-[10px] text-[#CCCCCC]">
                      <span>{prospect.emailCount} emails</span>
                      <span>•</span>
                      <span>{prospect.totalOpens} opens</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Prospect Details */}
          <div className="lg:col-span-2">
            {loading ? (
              <div className="border border-[#E8E8E8] rounded-lg p-12 bg-white text-center">
                <p className="text-sm text-[#888888]">Loading prospect details...</p>
              </div>
            ) : selectedProspect ? (
              <div className="space-y-8">
                {/* Prospect Header Card */}
                <div className="border border-[#E8E8E8] rounded-lg p-6 md:p-8 bg-[#F9F9F9]">
                  <div>
                    <p className="text-xs font-semibold text-[#0D0D0D] tracking-[0.05em] uppercase mb-3">
                      Business Profile
                    </p>
                    <h2 className="text-3xl md:text-4xl font-black text-[#0D0D0D] mb-6 tracking-tight leading-tight">
                      {selectedProspect.prospect.businessName}
                    </h2>

                    <div className="grid grid-cols-2 gap-6">
                      <div>
                        <p className="text-xs text-[#888888] font-semibold mb-1">Category</p>
                        <p className="text-sm text-[#0D0D0D]">{selectedProspect.prospect.category}</p>
                      </div>
                      <div>
                        <p className="text-xs text-[#888888] font-semibold mb-1">City</p>
                        <p className="text-sm text-[#0D0D0D]">{selectedProspect.prospect.city}</p>
                      </div>
                      <div>
                        <p className="text-xs text-[#888888] font-semibold mb-1">Email</p>
                        <p className="text-sm text-[#0D0D0D] break-all">{selectedProspect.prospect.email}</p>
                      </div>
                      <div>
                        <p className="text-xs text-[#888888] font-semibold mb-1">Phone</p>
                        <p className="text-sm text-[#0D0D0D]">{selectedProspect.prospect.phone || "—"}</p>
                      </div>
                      <div>
                        <p className="text-xs text-[#888888] font-semibold mb-1">Status</p>
                        <p className="text-sm text-[#0D0D0D] capitalize">{selectedProspect.prospect.status}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Engagement Overview */}
                <div className="border border-[#E8E8E8] rounded-lg p-6 md:p-8 bg-white">
                  <p className="text-xs font-semibold text-[#0D0D0D] tracking-[0.05em] uppercase mb-6">
                    Engagement Overview
                  </p>
                  <div className="grid grid-cols-3 gap-6">
                    <div>
                      <p className="text-xs text-[#888888] mb-2">Emails Sent</p>
                      <p className="text-3xl font-black text-[#0D0D0D] tracking-tight">
                        {selectedProspect.emailsSummary.totalSent}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-[#888888] mb-2">Total Opens</p>
                      <p className="text-3xl font-black text-[#0D0D0D] tracking-tight">
                        {selectedProspect.emailsSummary.totalOpens}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-[#888888] mb-2">Total Clicks</p>
                      <p className="text-3xl font-black text-[#0D0D0D] tracking-tight">
                        {selectedProspect.emailsSummary.totalClicks}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Communication History */}
                {selectedProspect.emails.length > 0 && (
                  <div className="border border-[#E8E8E8] rounded-lg p-6 md:p-8 bg-white">
                    <p className="text-xs font-semibold text-[#0D0D0D] tracking-[0.05em] uppercase mb-6">
                      Communication History
                    </p>
                    <div className="space-y-3">
                      {selectedProspect.emails.map((email) => (
                        <div key={email.id} className="border border-[#E8E8E8] rounded-lg p-4 hover:bg-[#F9F9F9] transition-colors">
                          <div className="flex items-start justify-between gap-3 mb-2">
                            <p className="font-semibold text-sm text-[#0D0D0D] flex-1">{email.subject}</p>
                            <span className="text-[10px] px-2.5 py-1 bg-white border border-[#E8E8E8] text-[#0D0D0D] rounded font-semibold whitespace-nowrap">
                              {email.status}
                            </span>
                          </div>
                          <p className="text-xs text-[#888888] mb-2">
                            {new Date(email.sentAt).toLocaleDateString()} at{" "}
                            {new Date(email.sentAt).toLocaleTimeString()}
                          </p>
                          <div className="flex gap-3 text-xs text-[#666666]">
                            <span>Opens: {email.opens}</span>
                            <span className="text-[#CCCCCC]">•</span>
                            <span>Clicks: {email.clicks}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {selectedProspect.emails.length === 0 && (
                  <div className="border border-[#E8E8E8] rounded-lg p-12 bg-white text-center">
                    <p className="text-sm text-[#888888]">No communication history yet</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="border border-[#E8E8E8] rounded-lg p-12 bg-white text-center">
                <p className="text-base text-[#0D0D0D] font-semibold mb-2">No prospect selected</p>
                <p className="text-sm text-[#888888]">Search for a prospect to view their full profile and communication history</p>
              </div>
            )}
          </div>
        </div>

        {/* Back Button */}
        <div className="mt-16 flex justify-center">
          <button
            onClick={() => router.push("/operator")}
            className="text-xs font-semibold text-[#0D0D0D] border border-[#E8E8E8] px-4 py-2 rounded hover:border-[#0D0D0D] hover:bg-[#F9F9F9] transition-colors"
          >
            Back to TODAY
          </button>
        </div>
      </div>
    </div>
  );
}
