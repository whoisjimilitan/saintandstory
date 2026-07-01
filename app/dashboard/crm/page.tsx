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

interface Job {
  id: string;
  serviceType: string;
  price: number;
  active: boolean;
  createdAt: string;
  nextScheduledAt?: string;
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
  customer: {
    isCustomer: boolean;
    jobCount: number;
    totalSpent: number;
    lastJobDate?: string;
    jobs: Job[];
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
    <div className="min-h-screen bg-white pt-24 pb-16">
      <div className="max-w-6xl mx-auto px-4 md:px-8">

        {/* === HEADER === */}
        <div className="mb-16">
          <p className="text-xs text-[#888888] tracking-widest uppercase mb-3">Search & view</p>
          <h1 className="text-4xl md:text-5xl font-black text-[#0D0D0D] mb-3 tracking-tight leading-tight">
            Prospect Database
          </h1>
          <p className="text-base text-[#666666] leading-relaxed max-w-3xl font-normal">
            Find prospects and customers. View all communications, engagement history, and transaction records.
          </p>
        </div>

        {/* === SEARCH === */}
        <form onSubmit={handleSearch} className="mb-16">
          <div className="max-w-2xl mx-auto">
            <div className="flex items-center gap-3 px-6 py-4 border border-[#E8E8E8] rounded-full bg-white hover:border-[#0D0D0D] focus-within:border-[#0D0D0D] transition-all">
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

        {/* === RESULTS LAYOUT === */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">

          {/* Search Results Sidebar */}
          <div className="lg:col-span-1">
            <p className="text-xs font-semibold text-[#0D0D0D] tracking-[0.05em] uppercase mb-6">
              Results ({searchResults.length})
            </p>

            {searchResults.length === 0 && searchQuery.length >= 2 && (
              <p className="text-sm text-[#888888]">No results found</p>
            )}

            {searchResults.length === 0 && searchQuery.length === 0 && (
              <p className="text-sm text-[#888888]">Search to begin</p>
            )}

            <div className="space-y-2 max-h-[600px] overflow-y-auto">
              {searchResults.map((prospect) => (
                <button
                  key={prospect.id}
                  onClick={() => loadProspectDetail(prospect.id)}
                  className={`w-full text-left p-3 rounded-lg transition-all ${
                    selectedProspect?.prospect.id === prospect.id
                      ? "bg-[#0D0D0D] text-white"
                      : "bg-white border border-[#E8E8E8] hover:border-[#0D0D0D] hover:bg-[#F9F9F9]"
                  }`}
                >
                  <p className={`font-semibold text-xs ${selectedProspect?.prospect.id === prospect.id ? 'text-white' : 'text-[#0D0D0D]'}`}>
                    {prospect.businessName}
                  </p>
                  <p className={`text-[10px] mt-1.5 ${selectedProspect?.prospect.id === prospect.id ? 'text-[#CCCCCC]' : 'text-[#888888]'}`}>
                    {prospect.email}
                  </p>
                  <div className={`flex gap-2 mt-2.5 text-[10px] ${selectedProspect?.prospect.id === prospect.id ? 'text-[#AAAAAA]' : 'text-[#CCCCCC]'}`}>
                    <span>{prospect.emailCount} emails</span>
                    <span>•</span>
                    <span>{prospect.totalOpens} opens</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Prospect Details */}
          <div className="lg:col-span-2">
            {loading ? (
              <div className="text-center py-12">
                <p className="text-sm text-[#888888]">Loading...</p>
              </div>
            ) : selectedProspect ? (
              <div className="space-y-16">

                {/* Business Profile */}
                <div>
                  <p className="text-xs font-semibold text-[#0D0D0D] tracking-[0.05em] uppercase mb-4">
                    Business profile
                  </p>
                  <h2 className="text-3xl md:text-4xl font-black text-[#0D0D0D] mb-8 tracking-tight leading-tight">
                    {selectedProspect.prospect.businessName}
                  </h2>

                  <div className="grid grid-cols-2 gap-12 pb-12 border-b border-[#E8E8E8]">
                    <div>
                      <p className="text-xs text-[#888888] font-semibold uppercase tracking-widest mb-2">Category</p>
                      <p className="text-sm text-[#0D0D0D]">{selectedProspect.prospect.category}</p>
                    </div>
                    <div>
                      <p className="text-xs text-[#888888] font-semibold uppercase tracking-widest mb-2">City</p>
                      <p className="text-sm text-[#0D0D0D]">{selectedProspect.prospect.city}</p>
                    </div>
                    <div>
                      <p className="text-xs text-[#888888] font-semibold uppercase tracking-widest mb-2">Email</p>
                      <p className="text-sm text-[#0D0D0D] break-all">{selectedProspect.prospect.email}</p>
                    </div>
                    <div>
                      <p className="text-xs text-[#888888] font-semibold uppercase tracking-widest mb-2">Phone</p>
                      <p className="text-sm text-[#0D0D0D]">{selectedProspect.prospect.phone || "—"}</p>
                    </div>
                  </div>
                </div>

                {/* Customer Status */}
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <p className="text-xs font-semibold text-[#0D0D0D] tracking-[0.05em] uppercase">
                      Status
                    </p>
                    <span className={`text-xs font-semibold px-3 py-1.5 rounded-full ${
                      selectedProspect.customer.isCustomer
                        ? "bg-[#0D0D0D] text-white"
                        : "bg-[#E8E8E8] text-[#0D0D0D]"
                    }`}>
                      {selectedProspect.customer.isCustomer ? "Customer" : "Prospect"}
                    </span>
                  </div>

                  {selectedProspect.customer.isCustomer ? (
                    <div className="grid grid-cols-3 gap-12 pb-12 border-b border-[#E8E8E8]">
                      <div>
                        <p className="text-xs text-[#888888] uppercase tracking-widest mb-3">Jobs</p>
                        <p className="text-3xl font-black text-[#0D0D0D]">
                          {selectedProspect.customer.jobCount}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-[#888888] uppercase tracking-widest mb-3">Total spent</p>
                        <p className="text-3xl font-black text-[#0D0D0D]">
                          £{selectedProspect.customer.totalSpent.toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-[#888888] uppercase tracking-widest mb-3">Last service</p>
                        <p className="text-sm text-[#0D0D0D]">
                          {selectedProspect.customer.lastJobDate
                            ? new Date(selectedProspect.customer.lastJobDate).toLocaleDateString()
                            : "—"}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-[#666666] pb-12 border-b border-[#E8E8E8]">
                      This prospect has not yet placed any orders. They are in discovery and qualification.
                    </p>
                  )}
                </div>

                {/* Engagement Overview */}
                <div>
                  <p className="text-xs font-semibold text-[#0D0D0D] tracking-[0.05em] uppercase mb-6">
                    Engagement
                  </p>
                  <div className="grid grid-cols-3 gap-12 pb-12 border-b border-[#E8E8E8]">
                    <div>
                      <p className="text-xs text-[#888888] uppercase tracking-widest mb-3">Emails sent</p>
                      <p className="text-3xl font-black text-[#0D0D0D]">
                        {selectedProspect.emailsSummary.totalSent}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-[#888888] uppercase tracking-widest mb-3">Total opens</p>
                      <p className="text-3xl font-black text-[#0D0D0D]">
                        {selectedProspect.emailsSummary.totalOpens}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-[#888888] uppercase tracking-widest mb-3">Total clicks</p>
                      <p className="text-3xl font-black text-[#0D0D0D]">
                        {selectedProspect.emailsSummary.totalClicks}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Communication History */}
                {selectedProspect.emails.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-[#0D0D0D] tracking-[0.05em] uppercase mb-6">
                      Communication history
                    </p>
                    <div className="space-y-6">
                      {selectedProspect.emails.map((email) => (
                        <div key={email.id} className="pb-6 border-b border-[#E8E8E8] last:border-0">
                          <div className="flex items-start justify-between gap-3 mb-2">
                            <p className="font-semibold text-sm text-[#0D0D0D] flex-1">{email.subject}</p>
                            <span className="text-[10px] px-2.5 py-1 bg-[#E8E8E8] text-[#0D0D0D] rounded-full font-semibold whitespace-nowrap">
                              {email.status}
                            </span>
                          </div>
                          <p className="text-xs text-[#888888] mb-2">
                            {new Date(email.sentAt).toLocaleDateString()}
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
                  <div className="text-center py-12 text-[#888888]">
                    <p className="text-sm">No communication history yet</p>
                  </div>
                )}

                {/* Order History */}
                {selectedProspect.customer.isCustomer && selectedProspect.customer.jobs.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-[#0D0D0D] tracking-[0.05em] uppercase mb-6">
                      Order history
                    </p>
                    <div className="space-y-6">
                      {selectedProspect.customer.jobs.map((job) => (
                        <div key={job.id} className="pb-6 border-b border-[#E8E8E8] last:border-0">
                          <div className="flex items-start justify-between gap-3 mb-2">
                            <div className="flex-1">
                              <p className="font-semibold text-sm text-[#0D0D0D]">{job.serviceType}</p>
                              <p className="text-xs text-[#888888] mt-1">
                                {new Date(job.createdAt).toLocaleDateString()}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="font-black text-lg text-[#0D0D0D]">£{job.price.toLocaleString()}</p>
                              <span className={`text-[10px] px-2.5 py-1 rounded-full font-semibold whitespace-nowrap inline-block mt-1 ${
                                job.active
                                  ? "bg-[#0D0D0D] text-white"
                                  : "bg-[#E8E8E8] text-[#0D0D0D]"
                              }`}>
                                {job.active ? "Active" : "Completed"}
                              </span>
                            </div>
                          </div>
                          {job.nextScheduledAt && (
                            <p className="text-xs text-[#888888] mt-2">
                              Next: {new Date(job.nextScheduledAt).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              </div>
            ) : (
              <div className="text-center py-16">
                <p className="text-base text-[#0D0D0D] font-semibold mb-2">No prospect selected</p>
                <p className="text-sm text-[#888888]">Search to view their profile and communication history</p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-16 flex justify-center">
          <button
            onClick={() => router.push("/operator")}
            className="text-xs font-semibold text-[#0D0D0D] hover:text-[#666666] transition-colors"
          >
            ← Back to TODAY
          </button>
        </div>
      </div>
    </div>
  );
}
