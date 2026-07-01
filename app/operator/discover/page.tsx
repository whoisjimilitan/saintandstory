"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import WhatsAppBatchCampaign from "@/components/WhatsAppBatchCampaign";
import { getConsequenceTier } from "@/lib/business-pain-promise-map";

interface Prospect {
  id: string;
  businessName: string;
  contactName?: string;
  city?: string;
  postcode?: string;
  email?: string;
  phone?: string;
  tier?: 1 | 2 | 3;
  category?: string;
}

type Channel = "email" | "whatsapp" | "phone";
type ActionMode = "upload" | "search" | "manual" | null;


function detectCategory(businessName: string): string {
  const name = businessName.toLowerCase();
  if (name.includes("solicitor") || name.includes("lawyer")) return "Solicitor";
  if (name.includes("estate agent") || name.includes("realtor")) return "Estate Agent";
  if (name.includes("accountant")) return "Accountant";
  if (name.includes("plumber")) return "Plumber";
  if (name.includes("electrician")) return "Electrician";
  if (name.includes("builder") || name.includes("construction")) return "Builder";
  if (name.includes("pharmacy") || name.includes("chemist")) return "Pharmacy";
  if (name.includes("hospital") || name.includes("clinic")) return "Hospital";
  if (name.includes("restaurant") || name.includes("cafe")) return "Restaurant";
  return "Business";
}

export default function DiscoverPage() {
  const router = useRouter();

  const [selectedChannel, setSelectedChannel] = useState<Channel>("email");
  const [actionMode, setActionMode] = useState<ActionMode>(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [searchRadius, setSearchRadius] = useState(10);
  const [isPostcodeSearch, setIsPostcodeSearch] = useState(false);
  const [searchResults, setSearchResults] = useState<Prospect[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);

  const [manualForm, setManualForm] = useState({
    businessName: "",
    contactName: "",
    email: "",
    phone: "",
    city: "",
    postcode: "",
  });

  const [selectedLeads, setSelectedLeads] = useState<Set<string>>(new Set());
  const resultsRef = useRef<HTMLDivElement>(null);

  const enrichResults = (prospects: Prospect[]): Prospect[] =>
    prospects.map(p => ({
      ...p,
      tier: getConsequenceTier(p.businessName),
      category: detectCategory(p.businessName),
    }));

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchTerm.trim()) return;

    setSearchLoading(true);
    try {
      const params = new URLSearchParams();
      if (isPostcodeSearch) {
        params.append("postcode", searchTerm);
        params.append("radius", searchRadius.toString());
      } else {
        params.append("keyword", searchTerm);
      }

      const res = await fetch(`/api/b2b/discover?${params}`, { method: "GET" });
      if (!res.ok) throw new Error("Search failed");

      const data = await res.json();
      const results = enrichResults(data.results || []);
      setSearchResults(results);

      setTimeout(() => resultsRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
    } catch (error) {
      console.error("Search error:", error);
    } finally {
      setSearchLoading(false);
    }
  };

  const handleManualAdd = () => {
    if (!manualForm.businessName.trim()) return;

    const newProspect: Prospect = {
      id: `manual-${Date.now()}`,
      ...manualForm,
    };

    const enriched = enrichResults([newProspect]);
    setSearchResults([enriched[0], ...searchResults]);
    setManualForm({ businessName: "", contactName: "", email: "", phone: "", city: "", postcode: "" });
  };

  const toggleLead = (prospectId: string) => {
    const newSelected = new Set(selectedLeads);
    if (newSelected.has(prospectId)) {
      newSelected.delete(prospectId);
    } else {
      newSelected.add(prospectId);
    }
    setSelectedLeads(newSelected);
  };

  const handleReviewAndSend = () => {
    if (selectedLeads.size === 0) {
      alert("Please select at least one lead");
      return;
    }

    const selectedProspects = searchResults.filter(p => selectedLeads.has(p.id));
    sessionStorage.setItem("enrich_prospects", JSON.stringify(selectedProspects));
    sessionStorage.setItem("enrich_channel", selectedChannel);
    router.push("/operator/enrich");
  };

  const tier1Count = searchResults.filter(p => p.tier === 1 && selectedLeads.has(p.id)).length;
  const tier2Count = searchResults.filter(p => p.tier === 2 && selectedLeads.has(p.id)).length;
  const tier3Count = searchResults.filter(p => p.tier === 3 && selectedLeads.has(p.id)).length;
  const categories = [...new Set(searchResults.filter(p => selectedLeads.has(p.id)).map(p => p.category))];

  return (
    <div className="min-h-screen bg-white pt-24 pb-16">
      <div className="max-w-6xl mx-auto px-4 md:px-8">

        {/* === HEADER === */}
        <div className="mb-16">
          <h1 className="text-4xl md:text-5xl font-black text-[#0D0D0D] mb-3 tracking-tight leading-tight">
            Discover & Qualify
          </h1>
          <p className="text-base text-[#666666] leading-relaxed max-w-3xl font-normal">
            Build your prospect list. Choose your channel, add leads, and prepare them for outreach.
          </p>
        </div>

        {/* === STEP 1: CHANNEL SELECTION === */}
        <div className="mb-16">
          <p className="text-xs font-semibold text-[#0D0D0D] uppercase tracking-widest mb-6">
            Step 1: Choose Channel
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={() => setSelectedChannel("email")}
              className={`p-6 rounded-lg border-2 transition-all ${
                selectedChannel === "email"
                  ? "border-[#0D0D0D] bg-[#0D0D0D] text-white"
                  : "border-[#E8E8E8] bg-white text-[#0D0D0D] hover:border-[#0D0D0D]"
              }`}
            >
              <p className="font-bold text-base mb-1">Email Campaign</p>
              <p className="text-xs opacity-70">Professional outreach</p>
            </button>

            <button
              onClick={() => setSelectedChannel("whatsapp")}
              className={`p-6 rounded-lg border-2 transition-all ${
                selectedChannel === "whatsapp"
                  ? "border-[#0D0D0D] bg-[#0D0D0D] text-white"
                  : "border-[#E8E8E8] bg-white text-[#0D0D0D] hover:border-[#0D0D0D]"
              }`}
            >
              <p className="font-bold text-base mb-1">WhatsApp Campaign</p>
              <p className="text-xs opacity-70">Real-time messaging</p>
            </button>

            <button
              onClick={() => setSelectedChannel("phone")}
              className={`p-6 rounded-lg border-2 transition-all ${
                selectedChannel === "phone"
                  ? "border-[#0D0D0D] bg-[#0D0D0D] text-white"
                  : "border-[#E8E8E8] bg-white text-[#0D0D0D] hover:border-[#0D0D0D]"
              }`}
            >
              <p className="font-bold text-base mb-1">Phone Campaign</p>
              <p className="text-xs opacity-70">Direct calls</p>
            </button>
          </div>
        </div>

        {/* === STEP 2: ADD LEADS === */}
        <div className="mb-16">
          <p className="text-xs font-semibold text-[#0D0D0D] uppercase tracking-widest mb-6">
            Step 2: Add Leads
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <button
              onClick={() => setActionMode(actionMode === "upload" ? null : "upload")}
              className={`p-4 rounded-lg border transition-all ${
                actionMode === "upload"
                  ? "border-[#0D0D0D] bg-[#F9F9F9]"
                  : "border-[#E8E8E8] bg-white hover:border-[#0D0D0D]"
              }`}
            >
              <p className="font-semibold text-sm text-[#0D0D0D]">Upload CSV</p>
            </button>

            <button
              onClick={() => setActionMode(actionMode === "search" ? null : "search")}
              className={`p-4 rounded-lg border transition-all ${
                actionMode === "search"
                  ? "border-[#0D0D0D] bg-[#F9F9F9]"
                  : "border-[#E8E8E8] bg-white hover:border-[#0D0D0D]"
              }`}
            >
              <p className="font-semibold text-sm text-[#0D0D0D]">Search</p>
            </button>

            <button
              onClick={() => setActionMode(actionMode === "manual" ? null : "manual")}
              className={`p-4 rounded-lg border transition-all ${
                actionMode === "manual"
                  ? "border-[#0D0D0D] bg-[#F9F9F9]"
                  : "border-[#E8E8E8] bg-white hover:border-[#0D0D0D]"
              }`}
            >
              <p className="font-semibold text-sm text-[#0D0D0D]">Add Manually</p>
            </button>
          </div>

          {/* UPLOAD MODE */}
          {actionMode === "upload" && selectedChannel !== "phone" && (
            <div className="rounded-lg p-6 mb-8 bg-[#F9F9F9]">
              {selectedChannel === "email" && (
                <WhatsAppBatchCampaign channel="email" />
              )}
              {selectedChannel === "whatsapp" && (
                <WhatsAppBatchCampaign channel="whatsapp" />
              )}
            </div>
          )}

          {actionMode === "upload" && selectedChannel === "phone" && (
            <div className="rounded-lg p-12 mb-8 bg-[#F9F9F9] text-center">
              <p className="text-sm text-[#666666]">Phone outreach CSV upload coming soon</p>
            </div>
          )}

          {/* SEARCH MODE */}
          {actionMode === "search" && (
            <div className="rounded-lg p-6 mb-8 bg-[#F9F9F9]">
              <div className="mb-6 flex gap-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    checked={!isPostcodeSearch}
                    onChange={() => setIsPostcodeSearch(false)}
                    className="w-4 h-4"
                  />
                  <span className="text-sm text-[#0D0D0D]">Keyword</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    checked={isPostcodeSearch}
                    onChange={() => setIsPostcodeSearch(true)}
                    className="w-4 h-4"
                  />
                  <span className="text-sm text-[#0D0D0D]">Postcode</span>
                </label>
              </div>

              {isPostcodeSearch && (
                <div className="mb-6">
                  <label className="text-sm font-semibold text-[#0D0D0D] block mb-3">
                    Radius: {searchRadius}km
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="25"
                    value={searchRadius}
                    onChange={(e) => setSearchRadius(parseInt(e.target.value))}
                    className="w-full"
                  />
                </div>
              )}

              <form onSubmit={handleSearch} className="flex gap-2">
                <input
                  type="text"
                  placeholder={isPostcodeSearch ? "Enter postcode..." : "Search by business name..."}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="flex-1 px-4 py-2 border border-[#E8E8E8] rounded text-sm focus:outline-none focus:border-[#0D0D0D]"
                />
                <button
                  type="submit"
                  disabled={searchLoading}
                  className="px-6 py-2 bg-[#0D0D0D] text-white text-sm font-semibold rounded hover:bg-[#333333] disabled:opacity-50"
                >
                  Search
                </button>
              </form>
            </div>
          )}

          {/* MANUAL ADD MODE */}
          {actionMode === "manual" && (
            <div className="rounded-lg p-6 mb-8 bg-[#F9F9F9]">
              <div className="space-y-3">
                <input
                  type="text"
                  placeholder="Business name *"
                  value={manualForm.businessName}
                  onChange={(e) => setManualForm({ ...manualForm, businessName: e.target.value })}
                  className="w-full px-4 py-2 border border-[#E8E8E8] rounded text-sm focus:outline-none focus:border-[#0D0D0D]"
                />
                <input
                  type="text"
                  placeholder="Contact name"
                  value={manualForm.contactName}
                  onChange={(e) => setManualForm({ ...manualForm, contactName: e.target.value })}
                  className="w-full px-4 py-2 border border-[#E8E8E8] rounded text-sm focus:outline-none focus:border-[#0D0D0D]"
                />
                <input
                  type="email"
                  placeholder="Email"
                  value={manualForm.email}
                  onChange={(e) => setManualForm({ ...manualForm, email: e.target.value })}
                  className="w-full px-4 py-2 border border-[#E8E8E8] rounded text-sm focus:outline-none focus:border-[#0D0D0D]"
                />
                <input
                  type="tel"
                  placeholder="Phone"
                  value={manualForm.phone}
                  onChange={(e) => setManualForm({ ...manualForm, phone: e.target.value })}
                  className="w-full px-4 py-2 border border-[#E8E8E8] rounded text-sm focus:outline-none focus:border-[#0D0D0D]"
                />
                <input
                  type="text"
                  placeholder="City"
                  value={manualForm.city}
                  onChange={(e) => setManualForm({ ...manualForm, city: e.target.value })}
                  className="w-full px-4 py-2 border border-[#E8E8E8] rounded text-sm focus:outline-none focus:border-[#0D0D0D]"
                />
                <button
                  onClick={handleManualAdd}
                  className="w-full px-4 py-2 bg-[#0D0D0D] text-white text-sm font-semibold rounded hover:bg-[#333333]"
                >
                  Add Lead
                </button>
              </div>
            </div>
          )}
        </div>

        {/* === RESULTS === */}
        {searchResults.length > 0 && (
          <>
            <div className="mb-16">
              <p className="text-xs font-semibold text-[#0D0D0D] uppercase tracking-widest mb-6">
                Step 3: Select Leads ({selectedLeads.size}/{searchResults.length})
              </p>

              <div className="space-y-3 mb-12">
                {searchResults.map((prospect) => (
                  <div
                    key={prospect.id}
                    className="rounded-lg p-4 bg-white border border-[#E8E8E8] hover:bg-[#F9F9F9] flex items-center gap-4 cursor-pointer"
                    onClick={() => toggleLead(prospect.id)}
                  >
                    <input
                      type="checkbox"
                      checked={selectedLeads.has(prospect.id)}
                      onChange={() => {}}
                      className="w-4 h-4 cursor-pointer"
                    />
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-[#0D0D0D]">{prospect.businessName}</p>
                      <p className="text-xs text-[#888888] mt-1">
                        {prospect.category} • {prospect.city || "Unknown"}
                      </p>
                    </div>
                    {prospect.tier && (
                      <span
                        className={`text-xs font-semibold px-2 py-1 rounded ${
                          prospect.tier === 1
                            ? "bg-[#0D0D0D] text-white"
                            : prospect.tier === 2
                            ? "bg-[#333333] text-white"
                            : "bg-[#E8E8E8] text-[#0D0D0D]"
                        }`}
                      >
                        Tier {prospect.tier}
                      </span>
                    )}
                  </div>
                ))}
              </div>

              {/* SUMMARY */}
              {selectedLeads.size > 0 && (
                <div className="rounded-lg p-8 bg-[#F9F9F9]">
                  <p className="text-sm font-semibold text-[#0D0D0D] mb-6">Ready to send?</p>
                  <div className="grid grid-cols-4 gap-8 mb-8">
                    <div>
                      <p className="text-xs text-[#888888] uppercase tracking-widest mb-2">Total</p>
                      <p className="text-3xl font-black text-[#0D0D0D]">{selectedLeads.size}</p>
                    </div>
                    <div>
                      <p className="text-xs text-[#888888] uppercase tracking-widest mb-2">Tier 1</p>
                      <p className="text-3xl font-black text-[#0D0D0D]">{tier1Count}</p>
                    </div>
                    <div>
                      <p className="text-xs text-[#888888] uppercase tracking-widest mb-2">Tier 2</p>
                      <p className="text-3xl font-black text-[#0D0D0D]">{tier2Count}</p>
                    </div>
                    <div>
                      <p className="text-xs text-[#888888] uppercase tracking-widest mb-2">Tier 3</p>
                      <p className="text-3xl font-black text-[#0D0D0D]">{tier3Count}</p>
                    </div>
                  </div>
                  {categories.length > 0 && (
                    <div className="mb-8">
                      <p className="text-xs text-[#888888] uppercase tracking-widest mb-2">Categories</p>
                      <p className="text-sm text-[#0D0D0D]">{categories.join(" • ")}</p>
                    </div>
                  )}
                  <button
                    onClick={handleReviewAndSend}
                    className="w-full px-6 py-3 bg-[#0D0D0D] text-white font-semibold rounded-lg hover:bg-[#333333]"
                  >
                    Review & Send
                  </button>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
