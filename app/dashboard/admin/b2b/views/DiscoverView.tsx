"use client";

import { useState } from "react";

interface DiscoveredBusiness {
  id: string;
  name: string;
  address: string;
  postcode: string;
  phone?: string;
  email?: string;
  website?: string;
  category: string;
  source: string;
}

export function DiscoverView() {
  const [postcode, setPostcode] = useState("");
  const [radius, setRadius] = useState(5);
  const [category, setCategory] = useState("all");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<DiscoveredBusiness[]>([]);
  const [error, setError] = useState("");

  const CATEGORIES = [
    "all",
    "logistics",
    "restaurants",
    "pharmacies",
    "retail",
    "estate_agents",
    "professional_services",
    "construction",
    "hospitality",
    "education",
    "healthcare",
    "finance",
  ];

  const handleDiscover = async () => {
    if (!postcode.trim()) {
      setError("Please enter a postcode");
      return;
    }

    setLoading(true);
    setError("");
    setResults([]);

    try {
      const response = await fetch("/api/b2b/discover", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          postcode,
          radius,
          category: category === "all" ? undefined : category,
        }),
      });

      if (!response.ok) {
        throw new Error("Discovery failed");
      }

      const data = await response.json();
      setResults(data.businesses || []);

      if (data.businesses.length === 0) {
        setError("No businesses found in this area");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Discovery error");
    } finally {
      setLoading(false);
    }
  };

  const handleAddToQueue = async (business: DiscoveredBusiness) => {
    try {
      // Create lead from discovered business
      const response = await fetch("/api/b2b/add-prospect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          businessName: business.name,
          email: business.email || "",
          businessCategory: business.category,
          painPoint: "discovery",
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to add to queue");
      }

      // Show confirmation
      alert(`${business.name} added to queue`);
    } catch (err) {
      alert("Failed to add to queue");
    }
  };

  return (
    <div className="flex-1 px-6 py-10 overflow-auto">
      <div className="max-w-4xl space-y-16">
        {/* HEADER */}
        <div>
          <h1 className="text-4xl font-black text-[#0D0D0D] tracking-tight">
            Discover
          </h1>
          <p className="text-sm text-[#888888] mt-3">
            Find businesses in your target area. Search by postcode and radius to discover new prospects.
          </p>
        </div>

        {/* SEARCH FORM */}
        <div className="space-y-8 pb-8 border-b border-[#E8E8E8]">
          {/* Postcode */}
          <div className="space-y-3">
            <label className="text-[10px] uppercase tracking-[0.2em] font-medium text-[#0D0D0D] block">
              Postcode
            </label>
            <input
              type="text"
              value={postcode}
              onChange={(e) => setPostcode(e.target.value.toUpperCase())}
              placeholder="e.g., SW1A 1AA"
              className="w-full text-sm bg-[#F5F5F5] border border-[#E8E8E8] px-4 py-3 text-[#0D0D0D] placeholder-[#888888] focus:outline-none focus:border-[#0D0D0D]"
              disabled={loading}
            />
          </div>

          {/* Radius */}
          <div className="space-y-3">
            <label className="text-[10px] uppercase tracking-[0.2em] font-medium text-[#0D0D0D] block">
              Radius (miles)
            </label>
            <div className="flex gap-4 items-center">
              <input
                type="range"
                min="1"
                max="25"
                value={radius}
                onChange={(e) => setRadius(parseInt(e.target.value))}
                className="flex-1 accent-[#888888]"
                disabled={loading}
              />
              <span className="text-sm font-medium text-[#0D0D0D] w-12 text-right">
                {radius}
              </span>
            </div>
          </div>

          {/* Category */}
          <div className="space-y-3">
            <label className="text-[10px] uppercase tracking-[0.2em] font-medium text-[#0D0D0D] block">
              Industry (Optional)
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full text-sm bg-[#F5F5F5] border border-[#E8E8E8] px-4 py-3 text-[#0D0D0D] focus:outline-none focus:border-[#0D0D0D]"
              disabled={loading}
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat === "all" ? "All Industries" : cat.replace(/_/g, " ")}
                </option>
              ))}
            </select>
          </div>

          {/* Error */}
          {error && (
            <div className="text-sm text-[#DC2626] border-l-2 border-[#DC2626] pl-4 py-2">
              {error}
            </div>
          )}

          {/* Search Button */}
          <button
            onClick={handleDiscover}
            disabled={loading}
            className="text-sm font-medium text-white bg-[#0D0D0D] px-4 py-3 hover:opacity-80 transition-opacity disabled:opacity-50"
          >
            {loading ? "Searching..." : "Discover Businesses"}
          </button>
        </div>

        {/* RESULTS */}
        {results.length > 0 && (
          <div className="space-y-8">
            <div>
              <p className="text-sm text-[#888888] mb-4">
                Found {results.length} businesses
              </p>
            </div>

            <div className="space-y-4">
              {results.map((business) => (
                <div
                  key={business.id}
                  className="px-4 py-4 border-l-2 border-[#0A66C2] space-y-3"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="font-medium text-[#0D0D0D]">
                        {business.name}
                      </p>
                      <p className="text-xs text-[#888888] mt-1">
                        {business.address}, {business.postcode}
                      </p>
                      {business.phone && (
                        <p className="text-xs text-[#666666] mt-1">
                          {business.phone}
                        </p>
                      )}
                      {business.email && (
                        <p className="text-xs text-[#666666]">
                          {business.email}
                        </p>
                      )}
                      <p className="text-[10px] uppercase tracking-[0.1em] text-[#0A66C2] mt-2">
                        {business.category}
                      </p>
                    </div>
                    <button
                      onClick={() => handleAddToQueue(business)}
                      className="text-sm font-medium text-[#0D0D0D] border border-[#0D0D0D] px-3 py-2 hover:bg-[#0D0D0D] hover:text-white transition-colors"
                    >
                      + Queue
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
