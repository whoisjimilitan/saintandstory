"use client";

import { useEffect, useState } from "react";

interface DiscoveryConfigItem {
  id: string;
  mode: string;
  niche: string;
  locations: string[];
  enabled: boolean;
  priority: number;
}

export function DiscoveryConfig() {
  const [configs, setConfigs] = useState<DiscoveryConfigItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [niche, setNiche] = useState("");
  const [locations, setLocations] = useState("");

  useEffect(() => {
    fetchConfigs();
  }, []);

  async function fetchConfigs() {
    try {
      const res = await fetch("/api/b2b/discovery-config?enabled=true");
      const data = await res.json();
      setConfigs(data.configs || []);
    } catch (err) {
      console.error("Failed to fetch configs:", err);
    } finally {
      setLoading(false);
    }
  }

  async function handleAdd() {
    if (!niche || !locations) return;

    try {
      const res = await fetch("/api/b2b/discovery-config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: "national",
          niche,
          locations: locations.split(",").map(l => l.trim()),
          enabled: true,
          priority: 50,
        }),
      });

      if (res.ok) {
        setNiche("");
        setLocations("");
        await fetchConfigs();
      }
    } catch (err) {
      console.error("Failed to add config:", err);
    }
  }

  async function handleToggle(id: string, enabled: boolean) {
    try {
      await fetch("/api/b2b/discovery-config", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, enabled: !enabled }),
      });
      await fetchConfigs();
    } catch (err) {
      console.error("Failed to toggle config:", err);
    }
  }

  if (loading) return <div className="text-sm text-[#999999]">Loading…</div>;

  return (
    <div className="space-y-8">
      <div className="bg-white border border-[#E8E8E8] rounded-xl p-8">
        <h3 className="text-sm font-semibold text-[#1A1A1A] mb-6 uppercase tracking-[0.1em] text-[11px]">
          New Acquisition Research
        </h3>
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-[#666666] mb-2 uppercase tracking-[0.1em]">
              Niche or Category
            </label>
            <input
              type="text"
              placeholder="e.g., care_home, healthcare, logistics"
              value={niche}
              onChange={(e) => setNiche(e.target.value)}
              className="w-full px-4 py-3 border border-[#E8E8E8] rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#1A1A1A] focus:border-transparent transition"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-[#666666] mb-2 uppercase tracking-[0.1em]">
              Locations or Postcodes
            </label>
            <input
              type="text"
              placeholder="e.g., london, manchester, M1 1AD (comma-separated)"
              value={locations}
              onChange={(e) => setLocations(e.target.value)}
              className="w-full px-4 py-3 border border-[#E8E8E8] rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#1A1A1A] focus:border-transparent transition"
            />
          </div>
          <button
            onClick={handleAdd}
            className="w-full bg-[#1A1A1A] text-white px-4 py-3 rounded-lg font-semibold text-sm hover:bg-[#333333] active:bg-[#0D0D0D] transition-colors duration-150"
          >
            Create Mission
          </button>
        </div>
      </div>

      <div>
        <h3 className="text-sm font-semibold text-[#1A1A1A] mb-4 uppercase tracking-[0.1em] text-[11px]">
          Active Research
        </h3>
        <div className="space-y-3">
          {configs.length === 0 ? (
            <p className="text-sm text-[#999999]">No research tasks yet. Using autonomous discovery defaults.</p>
          ) : (
            configs.map((config) => (
              <div
                key={config.id}
                className="flex items-center justify-between bg-white border border-[#E8E8E8] rounded-lg p-5 hover:shadow-sm transition-shadow"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-[#1A1A1A]">{config.niche}</p>
                  <p className="text-xs text-[#999999] mt-1">
                    {config.locations.join(", ")} <span className="text-[#CCC]">•</span> Priority: {config.priority}
                  </p>
                </div>
                <button
                  onClick={() => handleToggle(config.id, config.enabled)}
                  className={`ml-4 px-3 py-1.5 rounded-md text-xs font-semibold transition-colors whitespace-nowrap ${
                    config.enabled
                      ? "bg-[#F0F9F7] text-[#1B6B54] border border-[#D1E8E4]"
                      : "bg-[#F5F5F5] text-[#999999] border border-[#E8E8E8]"
                  }`}
                >
                  {config.enabled ? "Active" : "Inactive"}
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
