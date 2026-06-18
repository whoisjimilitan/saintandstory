"use client";

import { useState } from "react";

const CATEGORIES = [
  "Solicitors",
  "Estate Agents",
  "Florists",
  "Restaurants",
  "Retail Stores",
];

export function DiscoverView() {
  const [city, setCity] = useState("");
  const [category, setCategory] = useState("Solicitors");
  const [searching, setSearching] = useState(false);
  const [results, setResults] = useState<string[]>([]);

  const handleSearch = async () => {
    if (!city.trim()) return;

    setSearching(true);
    try {
      const response = await fetch("/api/b2b/discover", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ niche: category, city: city.trim() }),
      });

      if (response.ok) {
        const data = await response.json();
        setResults(data.added || []);
      }
    } catch (error) {
      console.error("Discovery error:", error);
    } finally {
      setSearching(false);
    }
  };

  return (
    <div className="flex-1 px-6 py-10 overflow-auto">
      <div className="max-w-3xl space-y-12">
        <div className="space-y-6">
          <h1 className="text-4xl font-black text-[#0D0D0D] tracking-tight">
            Discover Prospects
          </h1>

          <div className="space-y-4">
            <div>
              <label className="text-[10px] uppercase tracking-[0.2em] font-medium text-[#0D0D0D] block mb-3">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full text-sm bg-[#F5F5F5] border border-[#E8E8E8] px-4 py-3 text-[#0D0D0D] focus:outline-none focus:border-[#0D0D0D]"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[10px] uppercase tracking-[0.2em] font-medium text-[#0D0D0D] block mb-3">
                City
              </label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="e.g., London"
                className="w-full text-sm bg-[#F5F5F5] border border-[#E8E8E8] px-4 py-3 text-[#0D0D0D] placeholder-[#888888] focus:outline-none focus:border-[#0D0D0D]"
                onKeyPress={(e) => {
                  if (e.key === "Enter") handleSearch();
                }}
              />
            </div>

            <button
              onClick={handleSearch}
              disabled={searching}
              className="w-full text-sm font-medium text-white bg-[#0D0D0D] px-4 py-3 hover:opacity-80 transition-opacity disabled:opacity-50"
            >
              {searching ? "Searching..." : "Search Prospects"}
            </button>
          </div>
        </div>

        {results.length > 0 && (
          <div className="space-y-6 pt-12 border-t border-[#E8E8E8]">
            <h2 className="text-[10px] uppercase tracking-[0.2em] font-medium text-[#0D0D0D]">
              Added ({results.length})
            </h2>
            <div className="space-y-3">
              {results.map((name, idx) => (
                <div key={idx} className="px-4 py-3 border-l-2 border-[#0A66C2]">
                  <p className="text-sm text-[#0D0D0D]">{name}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
