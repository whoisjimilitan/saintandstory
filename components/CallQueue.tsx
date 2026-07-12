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
  const [roleSearch, setRoleSearch] = useState("");
  const [postcodeSearch, setPostcodeSearch] = useState("");
  const [searchResults, setSearchResults] = useState<Lead[]>([]);
  const [queuedLeads, setQueuedLeads] = useState<QueuedLead[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [activeTab, setActiveTab] = useState<"business" | "role">("business");

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
        setMessage(`✓ Found ${data.leads.length} businesses`);
      } else {
        setMessage("✗ No results found. Try a different search.");
        setSearchResults([]);
      }
    } catch (error) {
      console.error("Search error:", error);
      setMessage("✗ Search failed");
    } finally {
      setLoading(false);
    }
  };

  const handleRoleSearch = async () => {
    if (!roleSearch || !postcodeSearch || roleSearch.length < 2 || postcodeSearch.length < 2) {
      setMessage("✗ Enter both role and postcode");
      return;
    }

    const query = `${roleSearch} ${postcodeSearch} site:linkedin`;
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
        setMessage(`✓ Found ${data.leads.length} people in ${postcodeSearch}`);
      } else {
        setMessage("✗ No results found. Try a different role or postcode.");
        setSearchResults([]);
      }
    } catch (error) {
      console.error("Search error:", error);
      setMessage("✗ Search failed");
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
    setMessage(`✓ Queued: ${lead.businessName}`);
    setTimeout(() => setMessage(""), 2000);
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
      setMessage("✗ No phone number");
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
    <div className="space-y-6">
      {/* Daily Summary */}
      {queuedLeads.length > 0 && (
        <div className="grid grid-cols-2 gap-3">
          <div className="border border-[#E8E8E8] rounded-lg p-4 bg-white">
            <p className="text-2xl font-black text-[#0D0D0D]">{notCalledCount}</p>
            <p className="text-xs text-[#888888]">to call</p>
          </div>
          <div className="border border-[#E8E8E8] rounded-lg p-4 bg-white">
            <p className="text-2xl font-black text-[#0D0D0D]">{calledCount}</p>
            <p className="text-xs text-[#888888]">called</p>
          </div>
        </div>
      )}

      {/* Today's Queue */}
      {queuedLeads.length > 0 && (
        <div className="border border-[#E8E8E8] rounded-lg bg-white overflow-hidden">
          <div className="px-6 py-4 border-b border-[#E8E8E8] bg-[#FAFAFA]">
            <p className="text-sm font-semibold text-[#0D0D0D]">Today's Queue</p>
          </div>

          <div className="divide-y divide-[#E8E8E8]">
            {queuedLeads.map((lead) => (
              <div key={lead.id} className={`p-6 ${lead.called ? "bg-[#F9F9F9]" : ""}`}>
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <p className={`font-semibold text-sm ${lead.called ? "text-[#CCCCCC] line-through" : "text-[#0D0D0D]"}`}>
                        {lead.businessName}
                      </p>
                      {lead.phone && (
                        <p className="text-xs text-[#888888] mt-1 font-mono">{lead.phone}</p>
                      )}
                      {lead.email && (
                        <p className="text-xs text-[#888888] font-mono">{lead.email}</p>
                      )}
                    </div>
                    <div className="text-xs text-[#CCCCCC]">{lead.queuedAt}</div>
                  </div>

                  <textarea
                    value={lead.notes}
                    onChange={(e) => handleUpdateNotes(lead.id, e.target.value)}
                    placeholder="Add notes..."
                    className="w-full text-xs px-3 py-2 border border-[#E8E8E8] rounded bg-white"
                    rows={2}
                  />

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleMarkCalled(lead.id)}
                      disabled={lead.called}
                      className={`flex-1 text-xs px-3 py-2 rounded font-semibold ${
                        lead.called
                          ? "bg-[#E8E8E8] text-[#CCCCCC] cursor-not-allowed"
                          : "bg-[#0D0D0D] text-white hover:bg-[#333333]"
                      }`}
                    >
                      {lead.called ? "✓ Called" : "Mark Called"}
                    </button>
                    <button
                      onClick={() => handleRemoveFromQueue(lead.id)}
                      className="flex-1 text-xs px-3 py-2 border border-[#E8E8E8] text-[#0D0D0D] rounded font-semibold hover:border-[#0D0D0D]"
                    >
                      Remove
                    </button>
                  </div>

                  {lead.phone && (
                    <button
                      onClick={() => handleCall(lead)}
                      className="w-full text-sm px-4 py-3 bg-[#0D0D0D] text-white rounded font-bold hover:bg-[#333333]"
                    >
                      Call
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Search Section */}
      <div className="border border-[#E8E8E8] rounded-lg bg-white overflow-hidden">
        <div className="flex border-b border-[#E8E8E8]">
          <button
            onClick={() => setActiveTab("business")}
            className={`flex-1 px-6 py-4 text-sm font-semibold ${
              activeTab === "business"
                ? "text-[#0D0D0D] border-b-2 border-[#0D0D0D]"
                : "text-[#888888]"
            }`}
          >
            Search by Business
          </button>
          <button
            onClick={() => setActiveTab("role")}
            className={`flex-1 px-6 py-4 text-sm font-semibold ${
              activeTab === "role"
                ? "text-[#0D0D0D] border-b-2 border-[#0D0D0D]"
                : "text-[#888888]"
            }`}
          >
            Search by Role & Postcode
          </button>
        </div>

        <div className="p-6 space-y-4">
          {activeTab === "business" ? (
            <div className="space-y-3">
              <p className="text-xs text-[#888888] uppercase tracking-widest">Find businesses by type</p>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="e.g., solicitors, accountants, construction, dentists..."
                  value={businessSearch}
                  onChange={(e) => setBusinessSearch(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleBusinessSearch(businessSearch)}
                  className="flex-1 text-sm px-4 py-3 border border-[#E8E8E8] rounded-lg focus:border-[#0D0D0D] focus:outline-none"
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
            <div className="space-y-3">
              <p className="text-xs text-[#888888] uppercase tracking-widest">Find people in specific roles</p>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="e.g., receptionist, office manager, director..."
                  value={roleSearch}
                  onChange={(e) => setRoleSearch(e.target.value)}
                  className="flex-1 text-sm px-4 py-3 border border-[#E8E8E8] rounded-lg focus:border-[#0D0D0D] focus:outline-none"
                />
                <input
                  type="text"
                  placeholder="Postcode (e.g., M1, SW1)"
                  value={postcodeSearch}
                  onChange={(e) => setPostcodeSearch(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleRoleSearch()}
                  className="w-32 text-sm px-4 py-3 border border-[#E8E8E8] rounded-lg focus:border-[#0D0D0D] focus:outline-none"
                />
              </div>
              <button
                onClick={handleRoleSearch}
                disabled={loading || roleSearch.length < 2 || postcodeSearch.length < 2}
                className="w-full px-6 py-3 bg-[#0D0D0D] text-white text-sm font-semibold rounded-lg hover:bg-[#333333] disabled:opacity-50"
              >
                {loading ? "..." : "Search"}
              </button>
            </div>
          )}
        </div>
      </div>

      {message && (
        <div className="px-4 py-3 rounded-lg bg-[#F9F9F9] border border-[#E8E8E8]">
          <p className="text-xs font-semibold text-[#0D0D0D]">{message}</p>
        </div>
      )}

      {/* Search Results */}
      {searchResults.length > 0 && (
        <div className="border border-[#E8E8E8] rounded-lg bg-white overflow-hidden">
          <div className="px-6 py-4 border-b border-[#E8E8E8] bg-[#FAFAFA]">
            <p className="text-sm font-semibold text-[#0D0D0D]">
              {searchResults.length} Result{searchResults.length !== 1 ? "s" : ""}
            </p>
          </div>

          <div className="divide-y divide-[#E8E8E8]">
            {searchResults.map((lead) => (
              <div key={lead.id} className="p-6 hover:bg-[#F9F9F9] transition">
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <p className="font-semibold text-[#0D0D0D] text-sm">{lead.businessName}</p>
                      {lead.phone && (
                        <p className="text-xs text-[#0D0D0D] mt-2 font-mono font-semibold">{lead.phone}</p>
                      )}
                      {lead.email && (
                        <p className="text-xs text-[#0D0D0D] font-mono">{lead.email}</p>
                      )}
                    </div>
                    <button
                      onClick={() => handleAddToQueue(lead)}
                      className="text-xs px-4 py-2 bg-[#0D0D0D] text-white rounded hover:bg-[#333333] font-semibold whitespace-nowrap"
                    >
                      Add to Queue
                    </button>
                  </div>

                  {lead.phone && (
                    <button
                      onClick={() => handleCall(lead)}
                      className="w-full text-sm px-4 py-3 bg-[#0D0D0D] text-white rounded font-bold hover:bg-[#333333]"
                    >
                      Call Now
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {!loading && searchResults.length === 0 && (businessSearch || roleSearch) && (
        <div className="px-6 py-12 text-center border border-[#E8E8E8] rounded-lg bg-[#F9F9F9]">
          <p className="text-sm text-[#888888]">No results found. Try a different search.</p>
        </div>
      )}
    </div>
  );
}
