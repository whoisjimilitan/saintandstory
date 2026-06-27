"use client";

import { useState, useEffect } from "react";

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
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Prospect[]>([]);
  const [selectedProspect, setSelectedProspect] = useState<ProspectDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);

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
    <div className="min-h-screen bg-[#F9F9F9]">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-black text-[#0D0D0D] mb-2">CRM Search</h1>
          <p className="text-[#888888]">Find prospects and view all communications</p>
        </div>

        {/* Search Box */}
        <form onSubmit={handleSearch} className="mb-8">
          <div className="flex gap-3">
            <input
              type="text"
              placeholder="Search by business name, email, phone, or city..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 px-4 py-3 border border-[#E8E8E8] rounded-lg focus:outline-none focus:border-[#0D0D0D]"
            />
            <button
              type="submit"
              disabled={searchQuery.length < 2 || searching}
              className="px-6 py-3 bg-[#0D0D0D] text-white rounded-lg font-semibold hover:bg-[#333333] disabled:opacity-50"
            >
              {searching ? "Searching..." : "Search"}
            </button>
          </div>
        </form>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Search Results */}
          <div className="lg:col-span-1 bg-white rounded-lg border border-[#E8E8E8] p-6 max-h-[600px] overflow-y-auto">
            <h2 className="font-semibold text-[#0D0D0D] mb-4">
              Results ({searchResults.length})
            </h2>
            {searchResults.length === 0 && searchQuery.length >= 2 && (
              <p className="text-[#888888] text-sm">No results found</p>
            )}
            <div className="space-y-2">
              {searchResults.map((prospect) => (
                <button
                  key={prospect.id}
                  onClick={() => loadProspectDetail(prospect.id)}
                  className={`w-full text-left p-3 rounded border transition-all ${
                    selectedProspect?.prospect.id === prospect.id
                      ? "bg-[#0D0D0D] text-white border-[#0D0D0D]"
                      : "border-[#E8E8E8] hover:border-[#0D0D0D] hover:bg-[#F5F5F5]"
                  }`}
                >
                  <p className="font-semibold text-sm">{prospect.businessName}</p>
                  <p className="text-xs opacity-70">{prospect.email}</p>
                  <div className="flex gap-2 mt-1 text-xs opacity-60">
                    <span>{prospect.emailCount} emails</span>
                    <span>•</span>
                    <span>{prospect.totalOpens} opens</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Prospect Detail */}
          <div className="lg:col-span-2">
            {loading ? (
              <div className="bg-white rounded-lg border border-[#E8E8E8] p-12 text-center">
                <p className="text-[#888888]">Loading...</p>
              </div>
            ) : selectedProspect ? (
              <div className="space-y-6">
                {/* Prospect Info */}
                <div className="bg-white rounded-lg border border-[#E8E8E8] p-6">
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div>
                      <p className="text-xs text-[#888888] font-semibold mb-1">Business</p>
                      <p className="font-semibold text-[#0D0D0D]">
                        {selectedProspect.prospect.businessName}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-[#888888] font-semibold mb-1">Category</p>
                      <p className="text-[#0D0D0D]">{selectedProspect.prospect.category}</p>
                    </div>
                    <div>
                      <p className="text-xs text-[#888888] font-semibold mb-1">Email</p>
                      <p className="text-[#0D0D0D]">{selectedProspect.prospect.email}</p>
                    </div>
                    <div>
                      <p className="text-xs text-[#888888] font-semibold mb-1">Phone</p>
                      <p className="text-[#0D0D0D]">{selectedProspect.prospect.phone || "—"}</p>
                    </div>
                    <div>
                      <p className="text-xs text-[#888888] font-semibold mb-1">City</p>
                      <p className="text-[#0D0D0D]">{selectedProspect.prospect.city}</p>
                    </div>
                    <div>
                      <p className="text-xs text-[#888888] font-semibold mb-1">Status</p>
                      <p className="text-[#0D0D0D] capitalize">{selectedProspect.prospect.status}</p>
                    </div>
                  </div>
                </div>

                {/* Engagement Summary */}
                <div className="bg-white rounded-lg border border-[#E8E8E8] p-6">
                  <h3 className="font-semibold text-[#0D0D0D] mb-4">Engagement</h3>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <p className="text-xs text-[#888888] mb-1">Emails Sent</p>
                      <p className="text-2xl font-black text-[#0D0D0D]">
                        {selectedProspect.emailsSummary.totalSent}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-[#888888] mb-1">Total Opens</p>
                      <p className="text-2xl font-black text-[#0D0D0D]">
                        {selectedProspect.emailsSummary.totalOpens}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-[#888888] mb-1">Total Clicks</p>
                      <p className="text-2xl font-black text-[#0D0D0D]">
                        {selectedProspect.emailsSummary.totalClicks}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Email History */}
                {selectedProspect.emails.length > 0 && (
                  <div className="bg-white rounded-lg border border-[#E8E8E8] p-6">
                    <h3 className="font-semibold text-[#0D0D0D] mb-4">Email History</h3>
                    <div className="space-y-3">
                      {selectedProspect.emails.map((email) => (
                        <div key={email.id} className="border border-[#E8E8E8] rounded p-3">
                          <div className="flex items-start justify-between mb-2">
                            <p className="font-semibold text-sm text-[#0D0D0D]">{email.subject}</p>
                            <span className="text-[10px] px-2 py-1 bg-[#F5F5F5] rounded">
                              {email.status}
                            </span>
                          </div>
                          <p className="text-xs text-[#888888] mb-2">
                            {new Date(email.sentAt).toLocaleDateString()} at{" "}
                            {new Date(email.sentAt).toLocaleTimeString()}
                          </p>
                          <div className="flex gap-3 text-xs text-[#666666]">
                            <span>Opens: {email.opens}</span>
                            <span>•</span>
                            <span>Clicks: {email.clicks}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-white rounded-lg border border-[#E8E8E8] p-12 text-center">
                <p className="text-[#888888]">Select a prospect to view details</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
