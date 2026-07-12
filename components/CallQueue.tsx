"use client";

import { useState, useEffect } from "react";
import { getPhonePlusFormat, getPhone00Format, detectPhoneType } from "@/lib/phone-utils";

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
  phone_mobile?: string[];
  phone_landline?: string[];
}

export default function CallQueue() {
  const [keywordSearch, setKeywordSearch] = useState("");
  const [postcodeSearch, setPostcodeSearch] = useState("");
  const [searchResults, setSearchResults] = useState<Business[]>([]);
  const [queuedBusinesses, setQueuedBusinesses] = useState<QueuedBusiness[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

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

  const handleAddToQueue = async (business: Business) => {
    const alreadyQueued = queuedBusinesses.some((q) => q.id === business.id);
    if (alreadyQueued) {
      setMessage(`Already queued: ${business.name || business.businessName}`);
      return;
    }

    const queued: QueuedBusiness = {
      ...business,
      queuedAt: new Date().toLocaleTimeString("en-GB", {
        hour: "2-digit",
        minute: "2-digit",
      }),
      notes: "",
      called: false,
      phone_mobile: [],
      phone_landline: [],
    };

    setQueuedBusinesses([queued, ...queuedBusinesses]);
    setMessage(`✓ Queued: ${business.name || business.businessName}`);

    // Fetch phone numbers in background
    try {
      const res = await fetch("/api/b2b/lookup-phones", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          businessName: business.businessName || business.name,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.phones) {
          // Update the queued business with found phones
          setQueuedBusinesses((current) =>
            current.map((q) =>
              q.id === business.id
                ? {
                    ...q,
                    phone_mobile: data.phones.mobile || [],
                    phone_landline: data.phones.landline || [],
                  }
                : q
            )
          );
          console.log(
            `[QUEUE] Found phones for ${business.businessName}: ${data.phones.mobile.length} mobile, ${data.phones.landline.length} landline`
          );
        }
      }
    } catch (error) {
      console.error("[QUEUE] Phone lookup failed:", error);
    }

    setTimeout(() => setMessage(""), 2000);
  };

  const handleRemoveFromQueue = (id: string) => {
    setQueuedBusinesses(queuedBusinesses.filter((q) => q.id !== id));
  };

  const handleUpdateNotes = (id: string, notes: string) => {
    setQueuedBusinesses(
      queuedBusinesses.map((q) => (q.id === id ? { ...q, notes } : q))
    );
  };

  const handleMarkCalled = (id: string) => {
    setQueuedBusinesses(
      queuedBusinesses.map((q) => (q.id === id ? { ...q, called: true } : q))
    );
  };

  const handleCall = (business: Business) => {
    const phone = business.telephone || business.phone || business.formatted_phone_number;
    if (!phone) {
      setMessage("✗ No phone number available");
      return;
    }
    navigator.clipboard.writeText(phone);
    setMessage(`✓ Copied: ${phone}`);
    setTimeout(() => setMessage(""), 1500);
  };

  const handleWhatsApp = (business: Business) => {
    const phone = business.telephone || business.phone || business.formatted_phone_number;
    if (!phone) {
      setMessage("✗ No phone number available");
      return;
    }

    const phoneType = detectPhoneType(phone);
    if (phoneType !== "mobile") {
      setMessage("✗ WhatsApp only works with mobile numbers (07xxx)");
      return;
    }

    const plusFormat = getPhonePlusFormat(phone);
    if (!plusFormat) {
      setMessage("✗ Invalid phone number");
      return;
    }

    // Use WA Chat Manager app scheme
    const message = `Hi ${business.businessName}, Saint & Story here. We help with urgent deliveries and collections.`;
    const encoded = encodeURIComponent(message);
    const waUrl = `wachatmanager://send?phone=${plusFormat}&text=${encoded}`;

    window.location.href = waUrl;
    setMessage(`✓ Opening WhatsApp...`);
    setTimeout(() => setMessage(""), 2000);
  };

  const handleVoIPCall = (business: Business) => {
    const phone = business.telephone || business.phone || business.formatted_phone_number;
    if (!phone) {
      setMessage("✗ No phone number available");
      return;
    }

    const phoneType = detectPhoneType(phone);
    if (phoneType !== "landline") {
      setMessage("✗ VoIP only works with landlines (01/02/03xxx)");
      return;
    }

    const phone00Format = getPhone00Format(phone);
    if (!phone00Format) {
      setMessage("✗ Invalid phone number");
      return;
    }

    // Use MobileVOIP URL scheme
    const voipUrl = `mobilevoip://dial?number=${phone00Format}`;
    window.location.href = voipUrl;
    setMessage(`✓ Opening MobileVOIP...`);
    setTimeout(() => setMessage(""), 2000);
  };

  const calledCount = queuedBusinesses.filter((q) => q.called).length;
  const notCalledCount = queuedBusinesses.filter((q) => !q.called).length;

  return (
    <div className="space-y-6">
      {/* Daily Summary */}
      {queuedBusinesses.length > 0 && (
        <div className="grid grid-cols-2 gap-3">
          <div className="border border-[#E8E8E8] rounded-lg p-4 bg-white">
            <p className="text-2xl font-black text-[#0D0D0D]">{notCalledCount}</p>
            <p className="text-xs text-[#888888]">to call</p>
          </div>
          <div className="border border-[#E8E8E8] rounded-lg p-4 bg-white">
            <p className="text-2xl font-black text-[#0D0D0D]">{calledCount}</p>
            <p className="text-xs text-[#888888]">called today</p>
          </div>
        </div>
      )}

      {/* Today's Queue */}
      {queuedBusinesses.length > 0 && (
        <div className="border border-[#E8E8E8] rounded-lg bg-white overflow-hidden">
          <div className="px-6 py-4 border-b border-[#E8E8E8] bg-[#FAFAFA]">
            <p className="text-sm font-semibold text-[#0D0D0D]">Today's Queue</p>
            <p className="text-xs text-[#888888]">{queuedBusinesses.length} in queue</p>
          </div>

          <div className="divide-y divide-[#E8E8E8]">
            {queuedBusinesses.map((business) => (
              <div
                key={business.id}
                className={`p-6 ${business.called ? "bg-[#F9F9F9]" : "hover:bg-[#F9F9F9]"} transition`}
              >
                <div className="space-y-3">
                  {/* Business Info */}
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <p className={`font-semibold text-sm ${business.called ? "text-[#CCCCCC] line-through" : "text-[#0D0D0D]"}`}>
                        {business.name || business.businessName}
                      </p>
                      {(business.formatted_address || business.address) && (
                        <p className="text-xs text-[#888888] mt-1">
                          {business.formatted_address || business.address}
                        </p>
                      )}
                    </div>
                    <div className="text-xs text-[#CCCCCC]">{business.queuedAt}</div>
                  </div>

                  {/* Phone Numbers - Show Google Places + Dork Search results */}
                  <div className="bg-[#F0F0F0] p-3 rounded border-l-2 border-[#0D0D0D] space-y-2">
                    {/* Primary phone from Google Places */}
                    {(business.telephone || business.phone || business.formatted_phone_number) && (
                      <button
                        onClick={() => handleCall(business)}
                        className="text-sm font-mono text-[#0D0D0D] hover:underline font-semibold block w-full text-left"
                      >
                        📍 {business.telephone || business.phone || business.formatted_phone_number}
                      </button>
                    )}

                    {/* Mobile numbers from dork search */}
                    {(business as any).phone_mobile && (business as any).phone_mobile.length > 0 && (
                      <div className="space-y-1">
                        <p className="text-xs text-[#666] font-semibold">Mobile:</p>
                        {(business as any).phone_mobile.map((phone: string, idx: number) => (
                          <button
                            key={idx}
                            onClick={() => {
                              navigator.clipboard.writeText(phone);
                              setMessage(`✓ Copied mobile: ${phone}`);
                              setTimeout(() => setMessage(""), 1500);
                            }}
                            className="text-sm font-mono text-[#25D366] hover:underline block w-full text-left"
                          >
                            📱 {phone}
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Landline numbers from dork search */}
                    {(business as any).phone_landline && (business as any).phone_landline.length > 0 && (
                      <div className="space-y-1">
                        <p className="text-xs text-[#666] font-semibold">Landline:</p>
                        {(business as any).phone_landline.map((phone: string, idx: number) => (
                          <button
                            key={idx}
                            onClick={() => {
                              navigator.clipboard.writeText(phone);
                              setMessage(`✓ Copied landline: ${phone}`);
                              setTimeout(() => setMessage(""), 1500);
                            }}
                            className="text-sm font-mono text-[#4B72D1] hover:underline block w-full text-left"
                          >
                            ☎ {phone}
                          </button>
                        ))}
                      </div>
                    )}

                    {!business.telephone && !business.phone && !business.formatted_phone_number && !(business as any).phone_mobile?.length && !(business as any).phone_landline?.length && (
                      <p className="text-xs text-[#999999]">Searching for phone numbers...</p>
                    )}
                  </div>

                  {/* Notes Field */}
                  <div>
                    <textarea
                      value={business.notes}
                      onChange={(e) => handleUpdateNotes(business.id, e.target.value)}
                      placeholder="Add notes here (interested, call back, etc.)"
                      className="w-full text-xs px-3 py-2 border border-[#E8E8E8] rounded bg-white text-[#0D0D0D] placeholder-[#CCCCCC] focus:border-[#0D0D0D] focus:outline-none resize-none"
                      rows={2}
                    />
                  </div>

                  {/* Actions */}
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
                    <button
                      onClick={() => handleRemoveFromQueue(business.id)}
                      className="flex-1 text-xs px-3 py-2 border border-[#E8E8E8] text-[#0D0D0D] rounded font-semibold hover:border-[#0D0D0D] transition"
                    >
                      Remove
                    </button>
                  </div>

                  {/* Contact Methods - Always show both */}
                  <div className="flex gap-2 pt-2">
                    <button
                      onClick={() => handleWhatsApp(business)}
                      className="flex-1 text-sm px-4 py-3 bg-[#25D366] text-white rounded font-bold hover:bg-[#1fa855] transition"
                    >
                      💬 WhatsApp
                    </button>
                    <button
                      onClick={() => handleVoIPCall(business)}
                      className="flex-1 text-sm px-4 py-3 bg-[#4B72D1] text-white rounded font-bold hover:bg-[#3a5aa8] transition"
                    >
                      ☎ Call (VoIP)
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Search Section */}
      <div className="border border-[#E8E8E8] rounded-lg bg-white p-6">
        <p className="text-xs font-semibold text-[#0D0D0D] uppercase tracking-widest mb-4">
          Find Businesses
        </p>

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
              {searchResults.length} Business{searchResults.length !== 1 ? "es" : ""} Found
            </p>
          </div>

          <div className="divide-y divide-[#E8E8E8]">
            {searchResults.map((business) => (
              <div key={business.id} className="p-6 hover:bg-[#F9F9F9] transition">
                <div className="space-y-3">
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
                      {(business.telephone || business.phone || business.formatted_phone_number) && (
                        <div className="mt-3 flex items-center gap-2">
                          <button
                            onClick={() => handleCall(business)}
                            className="text-sm font-mono text-[#0D0D0D] hover:underline font-semibold"
                          >
                            {business.telephone || business.phone || business.formatted_phone_number}
                          </button>
                          <span className="text-lg text-[#4B72D1]">•</span>
                        </div>
                      )}
                    </div>

                    <button
                      onClick={() => handleAddToQueue(business)}
                      className="text-xs px-4 py-2 bg-[#0D0D0D] text-white rounded hover:bg-[#333333] font-semibold whitespace-nowrap"
                    >
                      Add to Queue
                    </button>
                  </div>

                  {/* Call Button - Full width like in screenshot */}
                  <button
                    onClick={() => {
                      const phone = business.telephone || business.phone || business.formatted_phone_number;
                      if (!phone) {
                        setMessage("✗ No phone number available");
                        return;
                      }
                      const phoneType = detectPhoneType(phone);
                      if (phoneType === "mobile") {
                        handleWhatsApp(business);
                      } else if (phoneType === "landline") {
                        handleVoIPCall(business);
                      } else {
                        setMessage("✗ Unable to detect phone type");
                      }
                    }}
                    className="w-full text-sm px-4 py-3 bg-[#0D0D0D] text-white rounded font-bold hover:bg-[#333333] transition"
                  >
                    Call
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {!loading && (keywordSearch.length >= 2 || postcodeSearch.length >= 2) && searchResults.length === 0 && (
        <div className="px-6 py-12 text-center border border-[#E8E8E8] rounded-lg bg-[#F9F9F9]">
          <p className="text-sm text-[#888888]">No businesses found. Try a different search.</p>
        </div>
      )}
    </div>
  );
}
