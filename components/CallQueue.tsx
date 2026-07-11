"use client";

import { useState } from "react";

interface Business {
  id: string;
  name: string;
  businessName?: string;
  phone?: string;
  formatted_phone_number?: string;
  formatted_address?: string;
  address?: string;
  city?: string;
  postcode?: string;
  email?: string;
}

export default function CallQueue() {
  const [keywordSearch, setKeywordSearch] = useState("");
  const [postcodeSearch, setPostcodeSearch] = useState("");
  const [searchResults, setSearchResults] = useState<Business[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [selectedBusiness, setSelectedBusiness] = useState<Business | null>(null);
  const [notes, setNotes] = useState("");

  const handleSearch = async (query: string, type: "keyword" | "postcode") => {
    if (!query || query.length < 2) {
      setSearchResults([]);
      return;
    }

    try {
      setLoading(true);

      const params = new URLSearchParams();
      if (type === "postcode") {
        params.append("postcode", query);
      } else {
        params.append("keyword", query);
      }

      const url = `/api/b2b/discover?${params}`;
      console.log("[CALL QUEUE SEARCH] Querying:", url);

      const response = await fetch(url);
      const data = await response.json();

      console.log("[CALL QUEUE SEARCH] Results:", data);

      if (!response.ok) {
        console.error("[CALL QUEUE SEARCH] Error:", data.error);
        setSearchResults([]);
        return;
      }

      setSearchResults(data.results || []);
    } catch (error) {
      console.error("Error searching:", error);
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToProspects = async (business: Business) => {
    try {
      setSelectedBusiness(business);
      setMessage(`Selected: ${business.name || business.businessName} - ready to queue`);
    } catch (error) {
      setMessage(`✗ Error: ${error instanceof Error ? error.message : "Failed"}`);
    }
  };

  const handleCall = async (business: Business) => {
    const phone = business.phone || business.formatted_phone_number;
    if (!phone) {
      setMessage("✗ No phone number available");
      return;
    }
    navigator.clipboard.writeText(phone);
    setMessage(`✓ Phone copied: ${phone}`);
    setTimeout(() => setMessage(""), 2000);
  };

  const handleMarkInterested = async (business: Business) => {
    setSelectedBusiness(business);
    setMessage(`✓ Marked ${business.name || business.businessName} as interested`);
    setTimeout(() => setMessage(""), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Search Section */}
      <div className="space-y-3">
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Search by business name..."
            value={keywordSearch}
            onChange={(e) => setKeywordSearch(e.target.value)}
            className="flex-1 text-sm px-4 py-3 border border-[#E8E8E8] rounded-lg bg-white focus:border-[#0D0D0D] focus:outline-none"
          />
          <button
            onClick={() => handleSearch(keywordSearch, "keyword")}
            disabled={loading || keywordSearch.length < 2}
            className="px-6 py-3 bg-[#0D0D0D] text-white text-sm font-semibold rounded-lg hover:bg-[#333333] disabled:opacity-50"
          >
            {loading ? "..." : "Search"}
          </button>
        </div>

        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Search by postcode..."
            value={postcodeSearch}
            onChange={(e) => setPostcodeSearch(e.target.value)}
            className="flex-1 text-sm px-4 py-3 border border-[#E8E8E8] rounded-lg bg-white focus:border-[#0D0D0D] focus:outline-none"
          />
          <button
            onClick={() => handleSearch(postcodeSearch, "postcode")}
            disabled={loading || postcodeSearch.length < 2}
            className="px-6 py-3 bg-[#0D0D0D] text-white text-sm font-semibold rounded-lg hover:bg-[#333333] disabled:opacity-50"
          >
            {loading ? "..." : "Search"}
          </button>
        </div>
      </div>

      {message && (
        <div className="px-4 py-3 rounded-lg bg-[#F9F9F9] border border-[#E8E8E8]">
          <p className="text-xs font-semibold text-[#0D0D0D]">{message}</p>
        </div>
      )}

      {/* Results */}
      {searchResults.length > 0 && (
        <div className="border border-[#E8E8E8] rounded-lg bg-white overflow-hidden">
          <div className="px-6 py-4 border-b border-[#E8E8E8] bg-[#FAFAFA]">
            <p className="text-sm font-semibold text-[#0D0D0D]">
              {searchResults.length} Business{searchResults.length !== 1 ? "es" : ""} Found
            </p>
          </div>

          <div className="divide-y divide-[#E8E8E8]">
            {searchResults.map((business) => (
              <div key={business.id} className="p-6 hover:bg-[#F9F9F9] transition">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <p className="font-semibold text-[#0D0D0D] text-sm">
                      {business.name || business.businessName}
                    </p>
                    {(business.formatted_address || business.address) && (
                      <p className="text-xs text-[#888888] mt-1">
                        {business.formatted_address || business.address}
                      </p>
                    )}
                    {(business.phone || business.formatted_phone_number) && (
                      <button
                        onClick={() => handleCall(business)}
                        className="text-xs text-[#0D0D0D] font-mono hover:underline mt-2"
                      >
                        {business.phone || business.formatted_phone_number}
                      </button>
                    )}
                  </div>

                  <div className="flex flex-col gap-2">
                    <button
                      onClick={() => handleAddToProspects(business)}
                      className="text-xs px-3 py-2 bg-[#0D0D0D] text-white rounded hover:bg-[#333333] font-semibold whitespace-nowrap"
                    >
                      Add to Prospects
                    </button>
                    <button
                      onClick={() => handleMarkInterested(business)}
                      className="text-xs px-3 py-2 border border-[#E8E8E8] text-[#0D0D0D] rounded hover:border-[#0D0D0D] font-semibold whitespace-nowrap"
                    >
                      Interested
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {!loading && keywordSearch.length >= 2 && searchResults.length === 0 && (
        <div className="px-6 py-12 text-center border border-[#E8E8E8] rounded-lg bg-[#F9F9F9]">
          <p className="text-sm text-[#888888]">No businesses found. Try a different search.</p>
        </div>
      )}
    </div>
  );
}
