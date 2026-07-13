"use client";

import { useState } from "react";
import { detectPhoneType, getPhonePlusFormat, getPhone00Format } from "@/lib/phone-utils";

interface Business {
  id: string;
  name: string;
  businessName?: string;
  phone?: string;
  formatted_phone_number?: string;
  telephone?: string;
  formatted_address?: string;
  address?: string;
  city?: string;
  postcode?: string;
  email?: string;
}

interface QueuedBusiness extends Business {
  queuedAt: string;
  notes: string;
  called: boolean;
}

export default function CallQueue() {
  const [keywordSearch, setKeywordSearch] = useState("");
  const [postcodeSearch, setPostcodeSearch] = useState("");
  const [dorkSearch, setDorkSearch] = useState("");
  const [searchResults, setSearchResults] = useState<Business[]>([]);
  const [queuedBusinesses, setQueuedBusinesses] = useState<QueuedBusiness[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [searchMode, setSearchMode] = useState<"keyword" | "postcode" | "dork">("keyword");
  const [manualPhoneEntry, setManualPhoneEntry] = useState<{ [key: string]: string }>({});
  const [manualPhoneMode, setManualPhoneMode] = useState<Set<string>>(new Set());

  const handleSearch = async (query: string, type: "keyword" | "postcode") => {
    if (!query || query.length < 2) {
      setSearchResults([]);
      return;
    }

    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (type === "postcode") {
        params.append("postcode", query);
      } else {
        params.append("keyword", query);
      }

      const url = `/api/b2b/discover?${params}`;
      const response = await fetch(url);
      const data = await response.json();

      if (!response.ok) {
        console.error("[CALL QUEUE SEARCH] Error:", data.error);
        setSearchResults([]);
        setMessage("No results found");
        return;
      }

      // Map results and normalize phone field
      const results = (data.results || []).map((r: any) => ({
        ...r,
        phone: r.telephone || r.phone || r.formatted_phone_number,
      }));

      setSearchResults(results);
      setMessage(`Found ${results.length} businesses`);
    } catch (error) {
      console.error("Search error:", error);
      setSearchResults([]);
      setMessage("Search failed");
    } finally {
      setLoading(false);
    }
  };

  const handleDorkSearch = async (query: string) => {
    if (!query || query.length < 2) return;

    setLoading(true);
    try {
      const response = await fetch("/api/b2b/dork-search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query }),
      });

      const data = await response.json();
      if (data.success && data.leads) {
        // Map dork results to Business interface
        const results = data.leads.map((lead: any) => ({
          ...lead,
          id: lead.id,
          businessName: lead.businessName,
          phone: lead.phone,
          email: lead.email,
          website: lead.website,
        }));

        setSearchResults(results);
        setMessage(`Found ${results.length} results`);
      } else {
        setSearchResults([]);
        setMessage("No results found");
      }
    } catch (error) {
      console.error("Dork search error:", error);
      setSearchResults([]);
      setMessage("Search failed");
    } finally {
      setLoading(false);
    }
  };

  const handleFindPhoneForQueued = async (business: QueuedBusiness) => {
    setMessage(`Finding phone for ${business.businessName}...`);

    try {
      const response = await fetch("/api/b2b/dork-search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: business.businessName || business.name }),
      });

      const data = await response.json();
      if (data.success && data.leads && data.leads.length > 0) {
        const foundPhone = data.leads[0].phone;
        if (foundPhone) {
          // Update the queued business with found phone
          setQueuedBusinesses((current) =>
            current.map((q) =>
              q.id === business.id
                ? { ...q, phone: foundPhone, telephone: foundPhone }
                : q
            )
          );
          setManualPhoneMode((prev) => {
            const next = new Set(prev);
            next.delete(business.id);
            return next;
          });
          setMessage(`Found phone: ${foundPhone}`);
        } else {
          // No phone found - show manual entry
          setManualPhoneMode((prev) => new Set(prev).add(business.id));
          setMessage("No phone found - enter manually:");
        }
      } else {
        // Dork search failed - show manual entry
        setManualPhoneMode((prev) => new Set(prev).add(business.id));
        setMessage("Phone lookup failed - enter manually:");
      }
    } catch (error) {
      console.error("Phone lookup error:", error);
      setManualPhoneMode((prev) => new Set(prev).add(business.id));
      setMessage("Phone lookup failed - enter manually:");
    }
  };

  const handleManualPhoneSubmit = (businessId: string) => {
    const phone = manualPhoneEntry[businessId];
    if (!phone || phone.length < 5) {
      setMessage("Enter a valid phone number");
      return;
    }

    // Update the queued business with manual phone
    setQueuedBusinesses((current) =>
      current.map((q) =>
        q.id === businessId
          ? { ...q, phone, telephone: phone }
          : q
      )
    );

    // Clear manual entry mode
    setManualPhoneMode((prev) => {
      const next = new Set(prev);
      next.delete(businessId);
      return next;
    });
    setManualPhoneEntry((prev) => ({
      ...prev,
      [businessId]: "",
    }));

    setMessage(`Phone saved: ${phone}`);
    setTimeout(() => setMessage(""), 2000);
  };

  const handleAddToQueue = async (business: Business) => {
    const alreadyQueued = queuedBusinesses.some((q) => q.id === business.id);
    if (alreadyQueued) {
      setMessage(`Already queued: ${business.name || business.businessName}`);
      return;
    }

    const queued: QueuedBusiness = {
      ...business,
      queuedAt: new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" }),
      notes: "",
      called: false,
    };

    setQueuedBusinesses([queued, ...queuedBusinesses]);
    setMessage(`Queued: ${business.name || business.businessName}`);

    // If no phone, use dork search to find it
    const hasPhone = business.telephone || business.phone || business.formatted_phone_number;
    if (!hasPhone) {
      setMessage(`Queued: ${business.name || business.businessName} (finding phone...)`);

      try {
        const companyName = business.name || business.businessName;
        const response = await fetch("/api/b2b/dork-search", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ query: companyName }),
        });

        const data = await response.json();
        if (data.success && data.leads && data.leads.length > 0) {
          const foundPhone = data.leads[0].phone;
          if (foundPhone) {
            // Update the queued business with the found phone
            setQueuedBusinesses((current) =>
              current.map((q) =>
                q.id === business.id
                  ? { ...q, phone: foundPhone, telephone: foundPhone }
                  : q
              )
            );
            setMessage(`Queued: ${business.name || business.businessName} (found phone: ${foundPhone})`);
          } else {
            setMessage(`Queued: ${business.name || business.businessName} (no phone found)`);
          }
        } else {
          setMessage(`Queued: ${business.name || business.businessName} (no phone found)`);
        }
      } catch (error) {
        console.error("Dork search error:", error);
        setMessage(`Queued: ${business.name || business.businessName} (phone lookup failed)`);
      }
    }

    setTimeout(() => setMessage(""), 3000);
  };

  const handleRemoveFromQueue = (id: string) => {
    setQueuedBusinesses(queuedBusinesses.filter((q) => q.id !== id));
  };

  const handleMarkCalled = (id: string) => {
    setQueuedBusinesses(
      queuedBusinesses.map((q) => (q.id === id ? { ...q, called: true } : q))
    );
  };

  const handleUpdateNotes = (id: string, notes: string) => {
    setQueuedBusinesses(
      queuedBusinesses.map((q) => (q.id === id ? { ...q, notes } : q))
    );
  };

  const handleCall = (business: Business) => {
    const phone = business.telephone || business.phone || business.formatted_phone_number;
    if (!phone) {
      setMessage("No phone number");
      return;
    }

    const phoneType = detectPhoneType(phone);
    if (phoneType === "mobile") {
      const plusFormat = getPhonePlusFormat(phone);
      const msg = `Hi ${business.businessName || business.name}, Saint & Story here. We help with urgent deliveries and collections.`;
      const encoded = encodeURIComponent(msg);
      window.location.href = `wachatmanager://send?phone=${plusFormat}&text=${encoded}`;
    } else if (phoneType === "landline") {
      const phone00 = getPhone00Format(phone);
      window.location.href = `mobilevoip://dial?number=${phone00}`;
    }
  };

  const calledCount = queuedBusinesses.filter((q) => q.called).length;
  const notCalledCount = queuedBusinesses.filter((q) => !q.called).length;

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Stats Pills */}
      {queuedBusinesses.length > 0 && (
        <div className="flex gap-2">
          <div className="px-4 py-2 rounded-full bg-white border border-[#E8E8E8]">
            <span className="text-xs text-[#888888]">To call</span>
            <span className="ml-2 text-sm font-bold text-[#0D0D0D]">{notCalledCount}</span>
          </div>
          <div className="px-4 py-2 rounded-full bg-white border border-[#E8E8E8]">
            <span className="text-xs text-[#888888]">Called</span>
            <span className="ml-2 text-sm font-bold text-[#0D0D0D]">{calledCount}</span>
          </div>
        </div>
      )}

      {/* Queue */}
      {queuedBusinesses.length > 0 && (
        <div className="space-y-3">
          <p className="text-xs font-semibold text-[#0D0D0D] uppercase tracking-widest">Today's Queue</p>
          {queuedBusinesses.map((business) => (
            <div
              key={business.id}
              className={`border border-[#E8E8E8] rounded-lg p-4 bg-white transition ${
                business.called ? "opacity-60 bg-[#F9F9F9]" : ""
              }`}
            >
              <div className="space-y-2">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-semibold ${business.called ? "line-through text-[#CCCCCC]" : "text-[#0D0D0D]"}`}>
                      {business.name || business.businessName}
                    </p>
                    {(business.telephone || business.phone || business.formatted_phone_number) && (
                      <p className="text-xs text-[#0D0D0D] mt-1 font-mono font-semibold">{business.telephone || business.phone || business.formatted_phone_number}</p>
                    )}
                    {(business.formatted_address || business.address) && (
                      <p className="text-xs text-[#888888]">{business.formatted_address || business.address}</p>
                    )}
                  </div>
                  <button
                    onClick={() => handleRemoveFromQueue(business.id)}
                    className="text-[#CCCCCC] hover:text-[#0D0D0D] text-sm font-semibold"
                  >
                    ×
                  </button>
                </div>

                <textarea
                  value={business.notes}
                  onChange={(e) => handleUpdateNotes(business.id, e.target.value)}
                  placeholder="Add notes..."
                  className="w-full text-xs px-3 py-2 border border-[#E8E8E8] rounded bg-white text-[#0D0D0D] placeholder-[#CCCCCC] focus:outline-none focus:border-[#0D0D0D] resize-none"
                  rows={2}
                />

                {manualPhoneMode.has(business.id) ? (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Enter phone (e.g., 0151 123 4567)"
                      value={manualPhoneEntry[business.id] || ""}
                      onChange={(e) => setManualPhoneEntry({ ...manualPhoneEntry, [business.id]: e.target.value })}
                      onKeyPress={(e) => e.key === "Enter" && handleManualPhoneSubmit(business.id)}
                      className="flex-1 text-xs px-3 py-2 border border-[#0D0D0D] rounded bg-white text-[#0D0D0D] placeholder-[#CCCCCC] focus:outline-none"
                    />
                    <button
                      onClick={() => handleManualPhoneSubmit(business.id)}
                      className="px-4 py-2 bg-[#0D0D0D] text-white text-xs rounded font-semibold hover:bg-[#333333]"
                    >
                      Save
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleMarkCalled(business.id)}
                      disabled={business.called}
                      className={`flex-1 text-xs px-3 py-2 rounded font-semibold transition ${
                        business.called
                          ? "bg-[#E8E8E8] text-[#CCCCCC] cursor-not-allowed"
                          : "bg-[#0D0D0D] text-white hover:bg-[#333333]"
                      }`}
                    >
                      {business.called ? "✓ Called" : "Mark Called"}
                    </button>
                    {(business.telephone || business.phone || business.formatted_phone_number) ? (
                      <button
                        onClick={() => handleCall(business)}
                        className="flex-1 text-xs px-3 py-2 border border-[#0D0D0D] text-[#0D0D0D] rounded font-semibold hover:bg-[#F9F9F9]"
                      >
                        Call
                      </button>
                    ) : (
                      <button
                        onClick={() => handleFindPhoneForQueued(business)}
                        disabled={loading}
                        className="flex-1 text-xs px-3 py-2 border-2 border-[#0D0D0D] text-[#0D0D0D] rounded font-semibold hover:bg-[#F9F9F9] disabled:opacity-50"
                      >
                        {loading ? "Finding..." : "Find Phone"}
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Search Mode Pills */}
      <div className="flex gap-2 flex-wrap">
        <button
          onClick={() => setSearchMode("keyword")}
          className={`px-4 py-2 rounded-full font-semibold text-sm transition ${
            searchMode === "keyword"
              ? "bg-[#0D0D0D] text-white"
              : "bg-white border border-[#E8E8E8] text-[#0D0D0D] hover:border-[#0D0D0D]"
          }`}
        >
          By Business Type
        </button>
        <button
          onClick={() => setSearchMode("postcode")}
          className={`px-4 py-2 rounded-full font-semibold text-sm transition ${
            searchMode === "postcode"
              ? "bg-[#0D0D0D] text-white"
              : "bg-white border border-[#E8E8E8] text-[#0D0D0D] hover:border-[#0D0D0D]"
          }`}
        >
          By Postcode
        </button>
        <button
          onClick={() => setSearchMode("dork")}
          className={`px-4 py-2 rounded-full font-semibold text-sm transition ${
            searchMode === "dork"
              ? "bg-[#0D0D0D] text-white"
              : "bg-white border border-[#E8E8E8] text-[#0D0D0D] hover:border-[#0D0D0D]"
          }`}
        >
          By Role/Phone
        </button>
      </div>

      {/* Search Input */}
      <div className="space-y-2">
        {searchMode === "keyword" && (
          <>
            <p className="text-xs text-[#888888]">Search by business type (e.g., solicitors, accountants)</p>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="e.g., solicitors, accountants, construction..."
                value={keywordSearch}
                onChange={(e) => setKeywordSearch(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSearch(keywordSearch, "keyword")}
                className="flex-1 text-sm px-4 py-3 border border-[#E8E8E8] rounded-lg bg-white text-[#0D0D0D] placeholder-[#CCCCCC] focus:border-[#0D0D0D] focus:outline-none"
              />
              <button
                onClick={() => handleSearch(keywordSearch, "keyword")}
                disabled={loading || keywordSearch.length < 2}
                className="px-6 py-3 bg-[#0D0D0D] text-white text-sm font-semibold rounded-lg hover:bg-[#333333] disabled:opacity-50"
              >
                {loading ? "..." : "Search"}
              </button>
            </div>
          </>
        )}

        {searchMode === "postcode" && (
          <>
            <p className="text-xs text-[#888888]">Search by postcode (e.g., M1, SW1, B1)</p>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="e.g., M1, SW1, B1..."
                value={postcodeSearch}
                onChange={(e) => setPostcodeSearch(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSearch(postcodeSearch, "postcode")}
                className="flex-1 text-sm px-4 py-3 border border-[#E8E8E8] rounded-lg bg-white text-[#0D0D0D] placeholder-[#CCCCCC] focus:border-[#0D0D0D] focus:outline-none"
              />
              <button
                onClick={() => handleSearch(postcodeSearch, "postcode")}
                disabled={loading || postcodeSearch.length < 2}
                className="px-6 py-3 bg-[#0D0D0D] text-white text-sm font-semibold rounded-lg hover:bg-[#333333] disabled:opacity-50"
              >
                {loading ? "..." : "Search"}
              </button>
            </div>
          </>
        )}

        {searchMode === "dork" && (
          <>
            <p className="text-xs text-[#888888]">Find phone numbers & contacts by company name, role, or location</p>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="e.g., Smith & Sons Solicitors, receptionist london, office manager M1..."
                value={dorkSearch}
                onChange={(e) => setDorkSearch(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleDorkSearch(dorkSearch)}
                className="flex-1 text-sm px-4 py-3 border border-[#E8E8E8] rounded-lg bg-white text-[#0D0D0D] placeholder-[#CCCCCC] focus:border-[#0D0D0D] focus:outline-none"
              />
              <button
                onClick={() => handleDorkSearch(dorkSearch)}
                disabled={loading || dorkSearch.length < 2}
                className="px-6 py-3 bg-[#0D0D0D] text-white text-sm font-semibold rounded-lg hover:bg-[#333333] disabled:opacity-50"
              >
                {loading ? "..." : "Search"}
              </button>
            </div>
          </>
        )}
      </div>

      {message && (
        <p className="text-xs text-[#0D0D0D] bg-[#F9F9F9] border border-[#E8E8E8] rounded px-4 py-3">{message}</p>
      )}

      {/* Results */}
      {searchResults.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-[#0D0D0D] uppercase tracking-widest">
              {searchResults.length} Result{searchResults.length !== 1 ? "s" : ""}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  searchResults.forEach(b => handleAddToQueue(b));
                  setMessage(`Added ${searchResults.length} businesses to queue`);
                  setTimeout(() => setMessage(""), 2000);
                }}
                className="text-xs px-3 py-1 bg-[#0D0D0D] text-white rounded font-semibold hover:bg-[#333333]"
              >
                Add All to Queue
              </button>
            </div>
          </div>
          {searchResults.map((business) => (
            <div key={business.id} className="border border-[#E8E8E8] rounded-lg p-4 bg-white hover:border-[#0D0D0D] transition">
              <div className="space-y-2">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-[#0D0D0D]">{business.name || business.businessName}</p>
                    {(business.formatted_address || business.address) && (
                      <p className="text-xs text-[#888888]">{business.formatted_address || business.address}</p>
                    )}

                    {/* Phone */}
                    {(business.telephone || business.phone || business.formatted_phone_number) && (
                      <p className="text-sm text-[#0D0D0D] mt-2 font-mono font-semibold">{business.telephone || business.phone || business.formatted_phone_number}</p>
                    )}

                    {/* Email */}
                    {business.email && (
                      <p className="text-xs text-[#0D0D0D] font-mono mt-1">{business.email}</p>
                    )}
                  </div>
                  <button
                    onClick={() => handleAddToQueue(business)}
                    className="px-4 py-2 bg-[#0D0D0D] text-white rounded font-semibold text-xs hover:bg-[#333333] whitespace-nowrap"
                  >
                    Queue
                  </button>
                </div>

                {(business.telephone || business.phone || business.formatted_phone_number) && (
                  <button
                    onClick={() => handleCall(business)}
                    className="w-full px-4 py-2 border border-[#0D0D0D] text-[#0D0D0D] rounded font-semibold text-sm hover:bg-[#F9F9F9]"
                  >
                    Call
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && searchResults.length === 0 && (keywordSearch || postcodeSearch || dorkSearch) && (
        <p className="text-xs text-[#888888] text-center py-8">No results found. Try a different search.</p>
      )}
    </div>
  );
}
