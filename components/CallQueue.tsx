"use client";

import { useState } from "react";
import { detectPhoneType, getPhonePlusFormat, getPhone00Format } from "@/lib/phone-utils";

interface Lead {
  id: string;
  businessName: string;
  email?: string;
  phone?: string;
  website?: string;
}

interface QueuedLead extends Lead {
  queuedAt: string;
  notes: string;
  called: boolean;
}

export default function CallQueue() {
  const [businessSearch, setBusinessSearch] = useState("");
  const [postcodeSearch, setPostcodeSearch] = useState("");
  const [searchResults, setSearchResults] = useState<Lead[]>([]);
  const [queuedLeads, setQueuedLeads] = useState<QueuedLead[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [searchMode, setSearchMode] = useState<"business" | "postcode">("business");

  const handleBusinessSearch = async (query: string) => {
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
        setSearchResults(data.leads);
        setMessage(`Found ${data.leads.length} businesses`);
      } else {
        setMessage("No results found");
        setSearchResults([]);
      }
    } catch (error) {
      console.error("Search error:", error);
      setMessage("Search failed");
    } finally {
      setLoading(false);
    }
  };

  const handlePostcodeSearch = async () => {
    if (!businessSearch || !postcodeSearch || businessSearch.length < 2 || postcodeSearch.length < 2) {
      setMessage("Enter business type and postcode");
      return;
    }

    const query = `${businessSearch} ${postcodeSearch}`;
    setLoading(true);
    try {
      const response = await fetch("/api/b2b/dork-search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query }),
      });

      const data = await response.json();
      if (data.success && data.leads) {
        setSearchResults(data.leads);
        setMessage(`Found ${data.leads.length} businesses in ${postcodeSearch}`);
      } else {
        setMessage("No results found");
        setSearchResults([]);
      }
    } catch (error) {
      console.error("Search error:", error);
      setMessage("Search failed");
    } finally {
      setLoading(false);
    }
  };

  const handleAddToQueue = (lead: Lead) => {
    const alreadyQueued = queuedLeads.some((q) => q.id === lead.id);
    if (alreadyQueued) {
      setMessage(`Already queued: ${lead.businessName}`);
      return;
    }

    const queued: QueuedLead = {
      ...lead,
      queuedAt: new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" }),
      notes: "",
      called: false,
    };

    setQueuedLeads([queued, ...queuedLeads]);
    setMessage(`Queued: ${lead.businessName}`);
    setTimeout(() => setMessage(""), 1500);
  };

  const handleRemoveFromQueue = (id: string) => {
    setQueuedLeads(queuedLeads.filter((q) => q.id !== id));
  };

  const handleMarkCalled = (id: string) => {
    setQueuedLeads(
      queuedLeads.map((q) => (q.id === id ? { ...q, called: true } : q))
    );
  };

  const handleUpdateNotes = (id: string, notes: string) => {
    setQueuedLeads(
      queuedLeads.map((q) => (q.id === id ? { ...q, notes } : q))
    );
  };

  const handleCall = (lead: Lead) => {
    if (!lead.phone) {
      setMessage("No phone number");
      return;
    }

    const phoneType = detectPhoneType(lead.phone);
    if (phoneType === "mobile") {
      const plusFormat = getPhonePlusFormat(lead.phone);
      const message = `Hi ${lead.businessName}, Saint & Story here. We help with urgent deliveries and collections.`;
      const encoded = encodeURIComponent(message);
      window.location.href = `wachatmanager://send?phone=${plusFormat}&text=${encoded}`;
    } else if (phoneType === "landline") {
      const phone00 = getPhone00Format(lead.phone);
      window.location.href = `mobilevoip://dial?number=${phone00}`;
    }
  };

  const calledCount = queuedLeads.filter((q) => q.called).length;
  const notCalledCount = queuedLeads.filter((q) => !q.called).length;

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Stats Pills */}
      {queuedLeads.length > 0 && (
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
      {queuedLeads.length > 0 && (
        <div className="space-y-3">
          <p className="text-xs font-semibold text-[#0D0D0D] uppercase tracking-widest">Today's Queue</p>
          {queuedLeads.map((lead) => (
            <div
              key={lead.id}
              className={`border border-[#E8E8E8] rounded-lg p-4 bg-white transition ${
                lead.called ? "opacity-60 bg-[#F9F9F9]" : ""
              }`}
            >
              <div className="space-y-2">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-semibold ${lead.called ? "line-through text-[#CCCCCC]" : "text-[#0D0D0D]"}`}>
                      {lead.businessName}
                    </p>
                    {lead.phone && (
                      <p className="text-xs text-[#0D0D0D] mt-1 font-mono font-semibold">{lead.phone}</p>
                    )}
                  </div>
                  <button
                    onClick={() => handleRemoveFromQueue(lead.id)}
                    className="text-[#CCCCCC] hover:text-[#0D0D0D] text-sm font-semibold"
                  >
                    ×
                  </button>
                </div>

                <textarea
                  value={lead.notes}
                  onChange={(e) => handleUpdateNotes(lead.id, e.target.value)}
                  placeholder="Add notes..."
                  className="w-full text-xs px-3 py-2 border border-[#E8E8E8] rounded bg-white text-[#0D0D0D] placeholder-[#CCCCCC] focus:outline-none focus:border-[#0D0D0D] resize-none"
                  rows={2}
                />

                <div className="flex gap-2">
                  <button
                    onClick={() => handleMarkCalled(lead.id)}
                    disabled={lead.called}
                    className={`flex-1 text-xs px-3 py-2 rounded font-semibold transition ${
                      lead.called
                        ? "bg-[#E8E8E8] text-[#CCCCCC] cursor-not-allowed"
                        : "bg-[#0D0D0D] text-white hover:bg-[#333333]"
                    }`}
                  >
                    {lead.called ? "✓ Called" : "Mark Called"}
                  </button>
                  {lead.phone && (
                    <button
                      onClick={() => handleCall(lead)}
                      className="flex-1 text-xs px-3 py-2 border border-[#0D0D0D] text-[#0D0D0D] rounded font-semibold hover:bg-[#F9F9F9]"
                    >
                      Call
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Search Options Pills */}
      <div className="flex gap-2">
        <button
          onClick={() => setSearchMode("business")}
          className={`px-4 py-2 rounded-full font-semibold text-sm transition ${
            searchMode === "business"
              ? "bg-[#0D0D0D] text-white"
              : "bg-white border border-[#E8E8E8] text-[#0D0D0D] hover:border-[#0D0D0D]"
          }`}
        >
          Search by Business
        </button>
        <button
          onClick={() => setSearchMode("postcode")}
          className={`px-4 py-2 rounded-full font-semibold text-sm transition ${
            searchMode === "postcode"
              ? "bg-[#0D0D0D] text-white"
              : "bg-white border border-[#E8E8E8] text-[#0D0D0D] hover:border-[#0D0D0D]"
          }`}
        >
          Search by Postcode
        </button>
      </div>

      {/* Search Input */}
      <div className="space-y-3">
        {searchMode === "business" ? (
          <div className="space-y-2">
            <p className="text-xs text-[#888888]">Business type (e.g., solicitors, accountants, construction)</p>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Search..."
                value={businessSearch}
                onChange={(e) => setBusinessSearch(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleBusinessSearch(businessSearch)}
                className="flex-1 text-sm px-4 py-3 border border-[#E8E8E8] rounded-lg bg-white text-[#0D0D0D] placeholder-[#CCCCCC] focus:border-[#0D0D0D] focus:outline-none"
              />
              <button
                onClick={() => handleBusinessSearch(businessSearch)}
                disabled={loading || businessSearch.length < 2}
                className="px-6 py-3 bg-[#0D0D0D] text-white text-sm font-semibold rounded-lg hover:bg-[#333333] disabled:opacity-50"
              >
                {loading ? "..." : "Search"}
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            <p className="text-xs text-[#888888]">Business type and postcode</p>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Business type..."
                value={businessSearch}
                onChange={(e) => setBusinessSearch(e.target.value)}
                className="flex-1 text-sm px-4 py-3 border border-[#E8E8E8] rounded-lg bg-white text-[#0D0D0D] placeholder-[#CCCCCC] focus:border-[#0D0D0D] focus:outline-none"
              />
              <input
                type="text"
                placeholder="Postcode..."
                value={postcodeSearch}
                onChange={(e) => setPostcodeSearch(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handlePostcodeSearch()}
                className="w-32 text-sm px-4 py-3 border border-[#E8E8E8] rounded-lg bg-white text-[#0D0D0D] placeholder-[#CCCCCC] focus:border-[#0D0D0D] focus:outline-none"
              />
              <button
                onClick={handlePostcodeSearch}
                disabled={loading || businessSearch.length < 2 || postcodeSearch.length < 2}
                className="px-6 py-3 bg-[#0D0D0D] text-white text-sm font-semibold rounded-lg hover:bg-[#333333] disabled:opacity-50"
              >
                {loading ? "..." : "Search"}
              </button>
            </div>
          </div>
        )}
      </div>

      {message && (
        <p className="text-xs text-[#0D0D0D] bg-[#F9F9F9] border border-[#E8E8E8] rounded px-4 py-3">{message}</p>
      )}

      {/* Results */}
      {searchResults.length > 0 && (
        <div className="space-y-3">
          <p className="text-xs font-semibold text-[#0D0D0D] uppercase tracking-widest">
            {searchResults.length} Result{searchResults.length !== 1 ? "s" : ""}
          </p>
          {searchResults.map((lead) => (
            <div key={lead.id} className="border border-[#E8E8E8] rounded-lg p-4 bg-white hover:border-[#0D0D0D] transition">
              <div className="space-y-2">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-[#0D0D0D]">{lead.businessName}</p>
                    {lead.phone && (
                      <p className="text-sm text-[#0D0D0D] mt-1 font-mono font-semibold">{lead.phone}</p>
                    )}
                    {lead.email && (
                      <p className="text-xs text-[#888888] font-mono">{lead.email}</p>
                    )}
                  </div>
                  <button
                    onClick={() => handleAddToQueue(lead)}
                    className="px-4 py-2 bg-[#0D0D0D] text-white rounded font-semibold text-xs hover:bg-[#333333] whitespace-nowrap"
                  >
                    Queue
                  </button>
                </div>

                {lead.phone && (
                  <button
                    onClick={() => handleCall(lead)}
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

      {!loading && searchResults.length === 0 && (businessSearch || postcodeSearch) && (
        <p className="text-xs text-[#888888] text-center py-8">No results found. Try a different search.</p>
      )}
    </div>
  );
}
