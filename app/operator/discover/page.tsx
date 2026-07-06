"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import OpportunityCsvUpload from "@/components/OpportunityCsvUpload";
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
  source: "search" | "upload" | "manual";
  extractedNeed?: string;
}

type DiscoveryMode = "search" | "upload" | "manual" | null;

function detectCategory(businessName: string): string {
  const name = businessName.toLowerCase();
  if (name.includes("solicitor") || name.includes("lawyer")) return "Solicitor";
  if (name.includes("estate agent") || name.includes("realtor")) return "Estate Agent";
  if (name.includes("accountant")) return "Accountant";
  if (name.includes("pharmacy") || name.includes("chemist")) return "Pharmacy";
  if (name.includes("hospital") || name.includes("clinic")) return "Hospital";
  if (name.includes("restaurant") || name.includes("cafe")) return "Restaurant";
  if (name.includes("builder") || name.includes("construction")) return "Constructor";
  if (name.includes("architect")) return "Architect";
  if (name.includes("vet")) return "Veterinary";
  return "Business";
}

export default function DiscoverPage() {
  const router = useRouter();

  const [discoveryMode, setDiscoveryMode] = useState<DiscoveryMode>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchRadius, setSearchRadius] = useState(10);
  const [isPostcodeSearch, setIsPostcodeSearch] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);

  const [prospects, setProspects] = useState<Prospect[]>([]);
  const [selectedLeads, setSelectedLeads] = useState<Set<string>>(new Set());

  const [manualForm, setManualForm] = useState({
    businessName: "",
    contactName: "",
    email: "",
    phone: "",
    city: "",
    postcode: "",
    category: "",
  });

  const resultsRef = useRef<HTMLDivElement>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchTerm.trim()) return;

    setSearchLoading(true);
    try {
      // Build search params - increase limit to 1000
      const params = new URLSearchParams();
      if (isPostcodeSearch) {
        params.append("postcode", searchTerm);
        params.append("radius", searchRadius.toString());
      } else {
        params.append("keyword", searchTerm);
      }
      params.append("limit", "1000"); // Increased from default

      const url = `/api/b2b/discover?${params}`;
      console.log("[DISCOVER] Searching:", url);

      const res = await fetch(url, { method: "GET" });
      const data = await res.json();

      console.log("[DISCOVER] Search response:", data);

      if (!res.ok) {
        console.error("[DISCOVER] Search failed:", data.error);
        alert(`Search failed: ${data.error || "Unknown error"}`);
        setProspects([]);
        return;
      }

      // Map results and sort alphabetically by city + business name
      let results = (data.results || []).map((r: any) => ({
        id: r.id,
        businessName: r.businessName || r.name,
        contactName: r.contactName,
        city: r.city,
        postcode: r.postcode,
        email: r.email,
        phone: r.phone,
        tier: getConsequenceTier(r.businessName || r.name),
        category: detectCategory(r.businessName || r.name),
        source: "search" as const
      }));

      // Deduplication: fetch already-targeted companies from OpportunityFeed
      const alreadyTargetedRes = await fetch("/api/operator/opportunity-feed/targeted-companies");
      const alreadyTargeted = alreadyTargetedRes.ok
        ? await alreadyTargetedRes.json().then((d: any) => new Set(d.companies || []))
        : new Set();

      // Filter out already-targeted prospects
      const originalCount = results.length;
      results = results.filter(r => !alreadyTargeted.has((r.businessName || "").toLowerCase()));

      const dedupedCount = originalCount - results.length;
      if (dedupedCount > 0) {
        console.log(`[DISCOVER] Filtered out ${dedupedCount} already-targeted prospects`);
      }

      // Sort: by city first (A-Z), then by business name (A-Z)
      results = results.sort((a, b) => {
        const cityA = (a.city || "").toLowerCase();
        const cityB = (b.city || "").toLowerCase();
        if (cityA !== cityB) {
          return cityA.localeCompare(cityB);
        }
        const nameA = (a.businessName || "").toLowerCase();
        const nameB = (b.businessName || "").toLowerCase();
        return nameA.localeCompare(nameB);
      });

      console.log("[DISCOVER] Mapped results:", results.length, results);

      if (results.length === 0) {
        alert("No prospects found matching your search");
      } else {
        alert(`Found ${results.length} prospects (sorted by city and name)`);
      }

      setProspects(results);
      setTimeout(() => resultsRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
    } catch (error) {
      console.error("[DISCOVER] Search error:", error);
      alert(`Search error: ${error instanceof Error ? error.message : "Unknown error"}`);
    } finally {
      setSearchLoading(false);
    }
  };

  const handleManualAdd = () => {
    if (!manualForm.businessName.trim()) return;

    const newProspect: Prospect = {
      id: `manual-${Date.now()}`,
      businessName: manualForm.businessName,
      contactName: manualForm.contactName,
      email: manualForm.email,
      phone: manualForm.phone,
      city: manualForm.city,
      postcode: manualForm.postcode,
      tier: getConsequenceTier(manualForm.businessName),
      category: detectCategory(manualForm.businessName),
      source: "manual"
    };

    setProspects([newProspect, ...prospects]);
    setManualForm({ businessName: "", contactName: "", email: "", phone: "", city: "", postcode: "", category: "" });
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

  const handleReviewAndSend = async () => {
    if (selectedLeads.size === 0) {
      alert("Please select at least one prospect");
      return;
    }

    const selectedProspects = prospects.filter(p => selectedLeads.has(p.id));

    try {
      // Create OpportunityFeed records (unified persistence)
      const res = await fetch("/api/operator/opportunity-feed/create-from-prospects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prospects: selectedProspects })
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to create opportunity records");
      }

      const data = await res.json();
      console.log("[DISCOVER] Created opportunities:", data);

      // Show detailed error if all failed
      if (data.created === 0 && data.errors > 0) {
        const errorDetails = data.errorDetails
          ? data.errorDetails.map((e: any) => `${e.businessName}: ${e.error}`).join("\n")
          : "Unknown error";
        console.error("[DISCOVER] Creation errors:", data.errorDetails);
        alert(`Failed to create opportunities:\n\n${errorDetails}\n\nCheck browser console and Vercel logs.`);
        return;
      }

      // Extract IDs of created records
      const opportunityIds = data.opportunities
        .filter((opp: any) => opp.status === "created" || opp.status === "already_exists")
        .map((opp: any) => opp.opportunityId);

      if (opportunityIds.length === 0) {
        alert(`No prospects were processed successfully.\n\nMessage: ${data.message}`);
        return;
      }

      // Navigate to Enrich with opportunity IDs
      router.push(`/operator/enrich?opportunities=${opportunityIds.join(",")}`);
    } catch (error) {
      console.error("[DISCOVER] Error creating opportunities:", error);
      alert(`Failed to prepare prospects: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  };

  const tier1Count = prospects.filter(p => p.tier === 1 && selectedLeads.has(p.id)).length;
  const tier2Count = prospects.filter(p => p.tier === 2 && selectedLeads.has(p.id)).length;
  const tier3Count = prospects.filter(p => p.tier === 3 && selectedLeads.has(p.id)).length;

  return (
    <div className="min-h-screen bg-white pt-16 pb-16">
      <div className="max-w-6xl mx-auto px-4 md:px-8">

        {/* === HEADER === */}
        <div className="mb-12">
          <h1 className="text-3xl md:text-4xl font-black text-[#0D0D0D] mb-2 tracking-tight leading-tight">
            Discover
          </h1>
          <p className="text-sm text-[#666666] leading-relaxed max-w-2xl font-normal">
            Find prospects. System automatically infers problems and generates personalized briefs.
          </p>
        </div>

        {/* === HOW TO FIND PROSPECTS === */}
        <div className="mb-16">
          <p className="text-xs font-semibold text-[#0D0D0D] uppercase tracking-widest mb-6">
            How to Find Prospects
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <button
              onClick={() => setDiscoveryMode(discoveryMode === "search" ? null : "search")}
              className={`p-6 rounded-lg border-2 transition-all text-left ${
                discoveryMode === "search"
                  ? "border-[#0D0D0D] bg-[#0D0D0D] text-white"
                  : "border-[#E8E8E8] bg-white text-[#0D0D0D] hover:border-[#0D0D0D]"
              }`}
            >
              <p className="font-bold text-base mb-1">Search</p>
              <p className="text-xs opacity-70">By postcode or keyword</p>
            </button>

            {/* Upload */}
            <button
              onClick={() => setDiscoveryMode(discoveryMode === "upload" ? null : "upload")}
              className={`p-6 rounded-lg border-2 transition-all text-left ${
                discoveryMode === "upload"
                  ? "border-[#0D0D0D] bg-[#0D0D0D] text-white"
                  : "border-[#E8E8E8] bg-white text-[#0D0D0D] hover:border-[#0D0D0D]"
              }`}
            >
              <p className="font-bold text-base mb-1">Upload CSV</p>
              <p className="text-xs opacity-70">Bulk import prospects</p>
            </button>

            {/* Manual */}
            <button
              onClick={() => setDiscoveryMode(discoveryMode === "manual" ? null : "manual")}
              className={`p-6 rounded-lg border-2 transition-all text-left ${
                discoveryMode === "manual"
                  ? "border-[#0D0D0D] bg-[#0D0D0D] text-white"
                  : "border-[#E8E8E8] bg-white text-[#0D0D0D] hover:border-[#0D0D0D]"
              }`}
            >
              <p className="font-bold text-base mb-1">Add Manually</p>
              <p className="text-xs opacity-70">Spot a business yourself</p>
            </button>
          </div>
        </div>

        {/* === SEARCH MODE === */}
        {discoveryMode === "search" && (
          <div className="mb-16 pb-12 border-b border-[#E8E8E8]">
            <form onSubmit={handleSearch} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-[#888888] uppercase tracking-widest block mb-2">
                  Search Term
                </label>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder={isPostcodeSearch ? "e.g., SW1A1AA" : "e.g., Solicitors, Restaurants"}
                  className="w-full px-4 py-3 text-sm border border-[#E8E8E8] rounded-lg bg-white text-[#0D0D0D] placeholder-[#CCCCCC] focus:border-[#0D0D0D] focus:outline-none"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="postcodeSearch"
                  checked={isPostcodeSearch}
                  onChange={(e) => setIsPostcodeSearch(e.target.checked)}
                  className="w-4 h-4 rounded appearance-none border border-[#0D0D0D] bg-white checked:bg-[#0D0D0D] checked:border-[#0D0D0D] cursor-pointer"
                />
                <label htmlFor="postcodeSearch" className="text-xs text-[#888888] cursor-pointer">
                  Search by postcode instead
                </label>
              </div>

              {isPostcodeSearch && (
                <div>
                  <label className="text-xs font-semibold text-[#888888] uppercase tracking-widest block mb-2">
                    Search Radius: {searchRadius} km
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="50"
                    value={searchRadius}
                    onChange={(e) => setSearchRadius(parseInt(e.target.value))}
                    className="w-full h-2 bg-[#E8E8E8] rounded appearance-none cursor-pointer accent-[#0D0D0D]"
                  />
                </div>
              )}

              <button
                type="submit"
                disabled={searchLoading}
                className="w-full px-4 py-3 bg-[#0D0D0D] text-white text-sm font-semibold rounded-lg hover:bg-[#333333] disabled:opacity-50 transition-colors"
              >
                {searchLoading ? "Searching..." : "Search"}
              </button>
            </form>
          </div>
        )}

        {/* === UPLOAD MODE === */}
        {discoveryMode === "upload" && (
          <div className="mb-16 pb-12 border-b border-[#E8E8E8]">
            <OpportunityCsvUpload
              onUploadComplete={(opportunities) => {
                const converted: Prospect[] = opportunities.map((opp) => ({
                  id: opp.id,
                  businessName: opp.companyName,
                  email: opp.contactEmail,
                  tier: getConsequenceTier(opp.companyName),
                  category: detectCategory(opp.companyName),
                  source: "upload",
                  extractedNeed: opp.extractedNeed
                }));
                setProspects([...converted, ...prospects]);
              }}
            />
          </div>
        )}

        {/* === MANUAL MODE === */}
        {discoveryMode === "manual" && (
          <div className="mb-16 pb-12 border-b border-[#E8E8E8] bg-[#F9F9F9] p-8 rounded-lg">
            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-[#888888] uppercase tracking-widest block mb-2">
                  Business Name *
                </label>
                <input
                  type="text"
                  value={manualForm.businessName}
                  onChange={(e) => setManualForm({ ...manualForm, businessName: e.target.value })}
                  placeholder="Company name"
                  className="w-full px-4 py-3 text-sm border border-[#E8E8E8] rounded-lg bg-white text-[#0D0D0D] focus:border-[#0D0D0D] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-[#888888] uppercase tracking-widest block mb-2">
                    Contact Name
                  </label>
                  <input
                    type="text"
                    value={manualForm.contactName}
                    onChange={(e) => setManualForm({ ...manualForm, contactName: e.target.value })}
                    placeholder="Optional"
                    className="w-full px-4 py-3 text-sm border border-[#E8E8E8] rounded-lg bg-white text-[#0D0D0D] focus:border-[#0D0D0D] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-[#888888] uppercase tracking-widest block mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={manualForm.email}
                    onChange={(e) => setManualForm({ ...manualForm, email: e.target.value })}
                    placeholder="Optional"
                    className="w-full px-4 py-3 text-sm border border-[#E8E8E8] rounded-lg bg-white text-[#0D0D0D] focus:border-[#0D0D0D] focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-[#888888] uppercase tracking-widest block mb-2">
                    Phone
                  </label>
                  <input
                    type="tel"
                    value={manualForm.phone}
                    onChange={(e) => setManualForm({ ...manualForm, phone: e.target.value })}
                    placeholder="Optional"
                    className="w-full px-4 py-3 text-sm border border-[#E8E8E8] rounded-lg bg-white text-[#0D0D0D] focus:border-[#0D0D0D] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-[#888888] uppercase tracking-widest block mb-2">
                    Category
                  </label>
                  <input
                    type="text"
                    value={manualForm.category}
                    onChange={(e) => setManualForm({ ...manualForm, category: e.target.value })}
                    placeholder="e.g., Solicitors, Restaurant"
                    className="w-full px-4 py-3 text-sm border border-[#E8E8E8] rounded-lg bg-white text-[#0D0D0D] focus:border-[#0D0D0D] focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-[#888888] uppercase tracking-widest block mb-2">
                    City
                  </label>
                  <input
                    type="text"
                    value={manualForm.city}
                    onChange={(e) => setManualForm({ ...manualForm, city: e.target.value })}
                    placeholder="Optional"
                    className="w-full px-4 py-3 text-sm border border-[#E8E8E8] rounded-lg bg-white text-[#0D0D0D] focus:border-[#0D0D0D] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-[#888888] uppercase tracking-widest block mb-2">
                    Postcode
                  </label>
                  <input
                    type="text"
                    value={manualForm.postcode}
                    onChange={(e) => setManualForm({ ...manualForm, postcode: e.target.value })}
                    placeholder="Optional"
                    className="w-full px-4 py-3 text-sm border border-[#E8E8E8] rounded-lg bg-white text-[#0D0D0D] focus:border-[#0D0D0D] focus:outline-none"
                  />
                </div>
              </div>

              <button
                onClick={handleManualAdd}
                className="w-full px-4 py-3 bg-[#0D0D0D] text-white text-sm font-semibold rounded-lg hover:bg-[#333333] transition-colors"
              >
                Add Prospect
              </button>
            </div>
          </div>
        )}

        {/* === RESULTS === */}
        {prospects.length > 0 && (
          <div className="mb-16" ref={resultsRef}>
            <div className="mb-6">
              <p className="text-xs font-semibold text-[#0D0D0D] uppercase tracking-widest mb-1">
                {prospects.length} Prospects Found
              </p>
              <p className="text-sm text-[#888888]">
                {selectedLeads.size} selected
              </p>
            </div>

            <div className="space-y-3">
              {prospects.map((prospect) => (
                <button
                  key={prospect.id}
                  onClick={() => toggleLead(prospect.id)}
                  className={`w-full p-4 rounded-lg border transition-all text-left ${
                    selectedLeads.has(prospect.id)
                      ? "border-[#0D0D0D] bg-[#0D0D0D] text-white"
                      : "border-[#E8E8E8] bg-white text-[#0D0D0D] hover:border-[#0D0D0D]"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-semibold text-sm">{prospect.businessName}</p>
                      <p className="text-xs opacity-70 mt-1">
                        {prospect.category} {prospect.city && `• ${prospect.city}`}
                      </p>
                      {prospect.email && (
                        <p className="text-xs opacity-60 mt-1">{prospect.email}</p>
                      )}
                    </div>
                    <div className="text-xs font-semibold opacity-70">
                      T{prospect.tier}
                    </div>
                  </div>
                </button>
              ))}
            </div>

            {selectedLeads.size > 0 && (
              <button
                onClick={handleReviewAndSend}
                className="w-full mt-8 px-6 py-3 bg-[#0D0D0D] text-white text-sm font-semibold rounded-lg hover:bg-[#333333] transition-colors"
              >
                Review & Proceed to Enrich →
              </button>
            )}
          </div>
        )}

        {/* === FROM SOCIALS === */}
        <div className="pt-12 border-t border-[#E8E8E8]">
          <p className="text-xs font-semibold text-[#0D0D0D] uppercase tracking-widest mb-4">
            From Socials
          </p>
          <div className="bg-[#F9F9F9] p-6 rounded-lg border border-[#E8E8E8] flex items-center justify-between">
            <p className="text-sm text-[#666666]">
              Automatic discovery from social sources goes to Settings queue
            </p>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-[#22C55E] rounded-full"></div>
              <p className="text-xs text-[#888888]">Operational</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
