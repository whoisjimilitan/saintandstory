"use client";

import { useState, useEffect } from "react";

interface Contact {
  id: string;
  businessName: string;
  contactName: string;
  phone: string;
  postcode: string;
  industry?: string;
  status: string;
}

interface CallLogEntry {
  id: string;
  businessName: string;
  contactName: string;
  phone: string;
  status: string;
  notes?: string;
  calledAt: string;
}

export default function CallQueue() {
  const [activeTab, setActiveTab] = useState<"queue" | "history">("queue");
  const [queue, setQueue] = useState<Contact[]>([]);
  const [recentCalls, setRecentCalls] = useState<CallLogEntry[]>([]);
  const [keywordSearch, setKeywordSearch] = useState("");
  const [postcodeSearch, setPostcodeSearch] = useState("");
  const [searchResults, setSearchResults] = useState<Contact[]>([]);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (activeTab === "queue") {
      fetchQueue();
    }
  }, [activeTab]);

  const fetchQueue = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/contacts/queue");
      const data = await response.json();
      setQueue(data.queue || []);
      setRecentCalls(data.recentCalls || []);
    } catch (error) {
      console.error("Error fetching queue:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      setMessage("Uploading...");

      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/contacts/upload", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) throw new Error(data.error);

      setMessage(`✓ Uploaded ${data.created} contacts`);
      setTimeout(() => setMessage(""), 3000);
      fetchQueue();
    } catch (error) {
      setMessage(`✗ ${error instanceof Error ? error.message : "Upload failed"}`);
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

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
        params.append("businessName", query);
      }

      const url = `/api/contacts/search?${params}`;
      console.log("[CONTACTS] Searching:", url);

      const response = await fetch(url);
      const data = await response.json();

      console.log("[CONTACTS] Response:", data);

      if (!response.ok) {
        console.error("[CONTACTS] Error:", data.error);
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

  const handleCall = async (
    contactId: string,
    status: string,
    businessName: string
  ) => {
    try {
      const response = await fetch("/api/contacts/call", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contactId,
          status,
          notes: "",
        }),
      });

      if (!response.ok) throw new Error("Failed to log call");

      setMessage(`✓ ${businessName} marked as ${status}`);
      setTimeout(() => setMessage(""), 2000);
      fetchQueue();
    } catch (error) {
      setMessage(`✗ Error: ${error instanceof Error ? error.message : "Failed"}`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Upload Section */}
      <div className="border border-[#E8E8E8] rounded-lg p-6 bg-white">
        <p className="text-xs font-semibold text-[#0D0D0D] uppercase tracking-widest mb-4">
          Upload Contacts
        </p>
        <label className="block">
          <input
            type="file"
            accept=".csv"
            onChange={handleUpload}
            disabled={uploading}
            className="text-sm text-[#888888] cursor-pointer"
          />
        </label>
        <p className="text-xs text-[#CCCCCC] mt-2">
          CSV: Business Name, Contact Name, Phone, Postcode, Industry, Email
        </p>
        {message && (
          <p className="text-xs mt-2 font-semibold text-[#0D0D0D]">{message}</p>
        )}
      </div>

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
            Search
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
            Search
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Results Table */}
        <div className="lg:col-span-2">
          <div className="border border-[#E8E8E8] rounded-lg overflow-hidden bg-white">
            <div className="px-6 py-4 border-b border-[#E8E8E8] bg-[#FAFAFA]">
              <p className="text-sm font-semibold text-[#0D0D0D]">
                {searchResults.length > 0 ? "Search Results" : "Call Queue"}
              </p>
              <p className="text-xs text-[#888888]">
                {searchResults.length > 0
                  ? `${searchResults.length} found`
                  : `${queue.length} to call`}
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b border-[#E8E8E8] bg-[#F9F9F9]">
                  <tr>
                    <th className="px-4 py-3 text-left font-semibold text-[#0D0D0D]">
                      Business
                    </th>
                    <th className="px-4 py-3 text-left font-semibold text-[#0D0D0D]">
                      Contact
                    </th>
                    <th className="px-4 py-3 text-left font-semibold text-[#0D0D0D]">
                      Phone
                    </th>
                    <th className="px-4 py-3 text-center font-semibold text-[#0D0D0D]">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E8E8E8]">
                  {(searchResults.length > 0 ? searchResults : queue).map(
                    (contact) => (
                      <tr
                        key={contact.id}
                        className="hover:bg-[#F9F9F9] transition"
                      >
                        <td className="px-4 py-3 text-[#0D0D0D]">
                          {contact.businessName}
                        </td>
                        <td className="px-4 py-3 text-[#0D0D0D]">
                          {contact.contactName}
                        </td>
                        <td className="px-4 py-3">
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(contact.phone);
                              setMessage("Phone copied!");
                              setTimeout(() => setMessage(""), 1500);
                            }}
                            className="text-[#0D0D0D] hover:underline font-mono text-xs"
                          >
                            {contact.phone}
                          </button>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <button
                            onClick={() =>
                              handleCall(
                                contact.id,
                                "called",
                                contact.businessName
                              )
                            }
                            className="text-xs px-3 py-1 bg-[#0D0D0D] text-white rounded hover:bg-[#333333] font-semibold"
                          >
                            Call
                          </button>
                        </td>
                      </tr>
                    )
                  )}
                </tbody>
              </table>

              {(searchResults.length > 0 ? searchResults : queue).length === 0 && (
                <div className="px-6 py-8 text-center text-[#888888] text-sm">
                  {searchResults.length > 0
                    ? "No results found"
                    : "No contacts in queue. Upload a CSV to start."}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Queue Summary */}
        <div className="space-y-4">
          <div className="border border-[#E8E8E8] rounded-lg p-6 bg-white">
            <p className="text-xs font-semibold text-[#0D0D0D] uppercase tracking-widest mb-4">
              Today's Activity
            </p>
            <div className="space-y-3">
              <div>
                <p className="text-2xl font-black text-[#0D0D0D]">
                  {queue.length}
                </p>
                <p className="text-xs text-[#888888]">to call</p>
              </div>
              <div>
                <p className="text-2xl font-black text-[#0D0D0D]">
                  {recentCalls.length}
                </p>
                <p className="text-xs text-[#888888]">called today</p>
              </div>
            </div>
          </div>

          {recentCalls.length > 0 && (
            <div className="border border-[#E8E8E8] rounded-lg p-6 bg-white">
              <p className="text-xs font-semibold text-[#0D0D0D] uppercase tracking-widest mb-4">
                Recent Calls
              </p>
              <div className="space-y-2 text-xs">
                {recentCalls.slice(0, 5).map((call) => (
                  <div key={call.id} className="border-b border-[#E8E8E8] pb-2">
                    <p className="font-semibold text-[#0D0D0D]">
                      {call.contactName}
                    </p>
                    <p className="text-[#888888]">{call.businessName}</p>
                    <p className="text-[#CCCCCC]">{call.status}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
