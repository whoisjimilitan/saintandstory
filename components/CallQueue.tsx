"use client";

import { useState } from "react";

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

// Detect if UK phone number is mobile or landline
function detectPhoneType(phoneNumber: string): "mobile" | "landline" | "unknown" {
  const cleaned = phoneNumber.replace(/\D/g, "");

  // UK mobile: starts with 07 (11 digits total)
  if (cleaned.match(/^447\d{9}$/) || cleaned.match(/^07\d{9}$/)) {
    return "mobile";
  }

  // UK landline: starts with 01, 02, or 03 (10-11 digits)
  if (cleaned.match(/^44[0-3]\d{8,10}$/) || cleaned.match(/^0[1-3]\d{8,10}$/)) {
    return "landline";
  }

  return "unknown";
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

  const handleAddToQueue = (business: Business) => {
    const alreadyQueued = queuedBusinesses.some((q) => q.id === business.id);
    if (alreadyQueued) {
      setMessage("Already queued");
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
    };

    setQueuedBusinesses([queued, ...queuedBusinesses]);
    setMessage(`Added: ${business.name || business.businessName}`);
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
    const phone = business.phone || business.formatted_phone_number || business.telephone;
    if (!phone) {
      setMessage("No phone available");
      return;
    }
    navigator.clipboard.writeText(phone);
    setMessage(`Copied: ${phone}`);
    setTimeout(() => setMessage(""), 1500);
  };

  const handleWhatsApp = (business: Business) => {
    const phone = business.phone || business.formatted_phone_number || business.telephone;
    if (!phone) {
      setMessage("No phone available");
      return;
    }

    // Format phone for WhatsApp (remove spaces, keep + and dashes)
    const formattedPhone = phone.replace(/\s/g, "");

    // Saint & Story sales message
    const message = `Hello, I came across your business and thought Saint & Story could help improve your urgent deliveries and collections. We're a same-day courier service. Would you be open to a quick conversation?`;

    // Try WA Chat Manager first (macOS), fallback to wa.me
    const encodedMessage = encodeURIComponent(message);
    const waChatManagerUrl = `wachatmanager://send?phone=${formattedPhone}&text=${encodedMessage}`;
    const waWebUrl = `https://wa.me/${formattedPhone}?text=${encodedMessage}`;

    // Attempt WA Chat Manager (will fail silently if app not available)
    try {
      const iframe = document.createElement("iframe");
      iframe.style.display = "none";
      iframe.src = waChatManagerUrl;
      document.body.appendChild(iframe);

      // After a short delay, if still on the page, fall back to web version
      setTimeout(() => {
        iframe.remove();
        // Check if still focused on this page (WA Chat Manager would steal focus)
        if (document.hasFocus()) {
          console.log("[QUEUE] WA Chat Manager not available, using wa.me");
          window.open(waWebUrl, "_blank");
          setMessage(`Opened WhatsApp: ${phone}`);
        } else {
          setMessage(`Opened WA Chat Manager: ${phone}`);
        }
      }, 1500);
    } catch (error) {
      console.error("[QUEUE] Error with WA Chat Manager, falling back to wa.me:", error);
      window.open(waWebUrl, "_blank");
      setMessage(`Opened WhatsApp: ${phone}`);
    }
  };

  const handleCallVoIP = async (business: Business) => {
    const phone = business.phone || business.formatted_phone_number || business.telephone;
    if (!phone) {
      setMessage("No phone available");
      return;
    }

    try {
      setMessage("Opening MobileVOIP...");

      // Call backend to force-open MobileVOIP with AppleScript
      const response = await fetch("/api/voip/call", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone })
      });

      const data = await response.json();

      if (!response.ok) {
        // Fallback: try custom URL scheme
        const formattedPhone = phone.replace(/\s/g, "");
        window.location.href = `mobilevoip://dial?number=${formattedPhone}`;
        setMessage(`Calling via MobileVOIP: ${phone}`);
        return;
      }

      setMessage(`MobileVOIP opened: ${phone}`);
    } catch (error) {
      console.error("VoIP call error:", error);
      setMessage("Failed to open MobileVOIP");
    }
  };

  const handleLoadPhone = async (business: Business) => {
    try {
      setMessage("Finding phone...");

      // Build smart query: business name + address/postcode for specificity
      const businessName = business.name || business.businessName || "business";
      const address = business.formatted_address || business.address || "";
      const postcode = business.postcode || "";

      // Query: "Business Name" "postcode" phone UK
      // This helps Google find the specific business with phone in results
      const query = postcode
        ? `"${businessName}" ${postcode} phone UK`
        : `${businessName} phone contact UK`;

      console.log(`[PHONE LOOKUP] Query: ${query}`);

      const response = await fetch("/api/b2b/dork-search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query })
      });

      const data = await response.json();

      if (!response.ok || !data.leads || data.leads.length === 0) {
        console.log(`[PHONE LOOKUP] No leads found in response`);
        setMessage("Phone not found");
        return;
      }

      // Get phone from first result
      const foundPhone = data.leads[0]?.phone;
      if (!foundPhone) {
        console.log(`[PHONE LOOKUP] Leads found but no phone extracted`);
        setMessage("Phone not found");
        return;
      }

      console.log(`[PHONE LOOKUP] ✓ Found phone: ${foundPhone}`);

      // Update business in queue with phone
      setQueuedBusinesses(
        queuedBusinesses.map((q) =>
          q.id === business.id ? { ...q, telephone: foundPhone } : q
        )
      );

      setMessage(`Found: ${foundPhone}`);
      setTimeout(() => setMessage(""), 2000);
    } catch (error) {
      setMessage("Failed to find phone");
      console.error("Error loading phone:", error);
    }
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

                  {/* Phone & Actions */}
                  {(business.phone || business.formatted_phone_number || business.telephone) ? (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleCall(business)}
                          className="text-xs text-[#0D0D0D] font-mono hover:underline"
                        >
                          {business.phone || business.formatted_phone_number || business.telephone}
                        </button>
                        {(() => {
                          const phoneType = detectPhoneType(
                            business.phone || business.formatted_phone_number || business.telephone || ""
                          );
                          return phoneType === "mobile" ? (
                            <span className="text-xs px-1.5 py-0.5 bg-[#E8F5E9] text-[#2E7D32] rounded font-semibold">
                              Mobile
                            </span>
                          ) : (
                            <span className="text-xs px-1.5 py-0.5 bg-[#E3F2FD] text-[#1976D2] rounded font-semibold">
                              Landline
                            </span>
                          );
                        })()}
                      </div>

                      {(() => {
                        const phoneType = detectPhoneType(
                          business.phone || business.formatted_phone_number || business.telephone || ""
                        );
                        return phoneType === "mobile" ? (
                          <button
                            onClick={() => handleWhatsApp(business)}
                            className="w-full text-xs px-3 py-2 bg-[#25D366] text-white rounded hover:bg-[#1FAE56] font-semibold"
                          >
                            WhatsApp Message
                          </button>
                        ) : (
                          <button
                            onClick={() => handleCallVoIP(business)}
                            className="w-full text-xs px-3 py-2 bg-[#0D0D0D] text-white rounded hover:bg-[#333333] font-semibold"
                          >
                            Call via VoIP
                          </button>
                        );
                      })()}
                    </div>
                  ) : (
                    <button
                      onClick={() => handleLoadPhone(business)}
                      className="text-xs px-3 py-1 border border-[#CCCCCC] text-[#CCCCCC] rounded hover:border-[#0D0D0D] hover:text-[#0D0D0D] font-semibold"
                    >
                      Find Phone
                    </button>
                  )}

                  {/* Notes Field */}
                  <div>
                    <textarea
                      value={business.notes}
                      onChange={(e) => handleUpdateNotes(business.id, e.target.value)}
                      placeholder="Notes"
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
                      {business.called ? "Called" : "Mark Called"}
                    </button>
                    <button
                      onClick={() => handleRemoveFromQueue(business.id)}
                      className="flex-1 text-xs px-3 py-2 border border-[#E8E8E8] text-[#0D0D0D] rounded font-semibold hover:border-[#0D0D0D] transition"
                    >
                      Remove
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
              {searchResults.length} Result{searchResults.length !== 1 ? "s" : ""}
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
                    {(business.phone || business.formatted_phone_number || business.telephone) ? (
                      <div className="mt-2 space-y-2">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleCall(business)}
                            className="text-xs text-[#0D0D0D] font-mono hover:underline"
                          >
                            {business.phone || business.formatted_phone_number || business.telephone}
                          </button>
                          {(() => {
                            const phoneType = detectPhoneType(
                              business.phone || business.formatted_phone_number || business.telephone || ""
                            );
                            return phoneType === "mobile" ? (
                              <span className="text-xs px-1.5 py-0.5 bg-[#E8F5E9] text-[#2E7D32] rounded font-semibold">
                                Mobile
                              </span>
                            ) : (
                              <span className="text-xs px-1.5 py-0.5 bg-[#E3F2FD] text-[#1976D2] rounded font-semibold">
                                Landline
                              </span>
                            );
                          })()}
                        </div>
                        <div>
                          {(() => {
                            const phoneType = detectPhoneType(
                              business.phone || business.formatted_phone_number || business.telephone || ""
                            );
                            return phoneType === "mobile" ? (
                              <button
                                onClick={() => handleWhatsApp(business)}
                                className="w-full text-xs px-2 py-1 bg-[#25D366] text-white rounded hover:bg-[#1FAE56] font-semibold"
                              >
                                WhatsApp
                              </button>
                            ) : (
                              <button
                                onClick={() => handleCallVoIP(business)}
                                className="w-full text-xs px-2 py-1 bg-[#0D0D0D] text-white rounded hover:bg-[#333333] font-semibold"
                              >
                                Call (VoIP)
                              </button>
                            );
                          })()}
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={() => handleLoadPhone(business)}
                        className="text-xs px-2 py-1 border border-[#CCCCCC] text-[#CCCCCC] rounded hover:border-[#0D0D0D] hover:text-[#0D0D0D] font-semibold mt-2"
                      >
                        Find Phone
                      </button>
                    )}
                  </div>

                  <button
                    onClick={() => handleAddToQueue(business)}
                    className="text-xs px-4 py-2 bg-[#0D0D0D] text-white rounded hover:bg-[#333333] font-semibold whitespace-nowrap"
                  >
                    Add to Queue
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {!loading && (keywordSearch.length >= 2 || postcodeSearch.length >= 2) && searchResults.length === 0 && (
        <div className="px-6 py-12 text-center border border-[#E8E8E8] rounded-lg bg-[#F9F9F9]">
          <p className="text-sm text-[#888888]">No results</p>
        </div>
      )}
    </div>
  );
}
