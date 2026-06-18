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
    <div className="flex-1 p-8 overflow-auto">
      <div className="max-w-xl">
        <h1 className="text-2xl font-semibold text-white mb-6">Discover Prospects</h1>

        <div className="bg-[#111111] border border-[#1C1C1C] rounded-lg p-6 mb-6">
          <div className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-white uppercase tracking-wider mb-2 block">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-[#0A0A0A] border border-[#1C1C1C] rounded-lg px-3 py-2 text-white text-sm"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-white uppercase tracking-wider mb-2 block">
                City
              </label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="e.g., London"
                className="w-full bg-[#0A0A0A] border border-[#1C1C1C] rounded-lg px-3 py-2 text-white text-sm placeholder-[#6B6B6B]"
                onKeyPress={(e) => {
                  if (e.key === "Enter") handleSearch();
                }}
              />
            </div>

            <button
              onClick={handleSearch}
              disabled={searching}
              className="w-full bg-[#30D158] text-black py-2 rounded-lg text-sm font-semibold hover:bg-[#26BA50] disabled:opacity-50"
            >
              {searching ? "Searching..." : "Search"}
            </button>
          </div>
        </div>

        {results.length > 0 && (
          <div className="space-y-2">
            {results.map((name, idx) => (
              <div key={idx} className="bg-[#111111] border border-[#1C1C1C] rounded-lg p-3">
                <p className="text-sm text-white">✅ {name}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
