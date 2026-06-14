"use client";

import { useEffect, useState } from "react";

interface TelemetryData {
  timestamp: string;
  window_hours: number;
  discovery: {
    businesses_found: number;
    new_leads: number;
  };
  campaign: {
    emails_sent: number;
    successful: number;
    failed: number;
    unique_leads_targeted: number;
  };
  engagement: {
    opens: number;
    clicks: number;
    bounces: number;
    complaints: number;
    engaged_leads: number;
    open_rate: string;
    click_rate: string;
  };
  qualification: {
    tier_a: number;
    tier_b: number;
    tier_c: number;
  };
  page_engagement: {
    total_visits: number;
    unique_sessions: number;
    leads_who_visited: number;
  };
  orchestration: {
    last_run: string;
    status: string;
  };
}

export default function CampaignTelemetry() {
  const [telemetry, setTelemetry] = useState<TelemetryData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(true);

  useEffect(() => {
    const fetchTelemetry = async () => {
      try {
        const response = await fetch("/api/campaigns/telemetry?hours=24");
        if (!response.ok) throw new Error("Failed to fetch telemetry");
        const data = await response.json();
        setTelemetry(data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    };

    fetchTelemetry();

    if (autoRefresh) {
      const interval = setInterval(fetchTelemetry, 5000);
      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

  if (loading) return <div className="p-4">Loading campaign telemetry...</div>;
  if (error) return <div className="p-4 text-red-600">Error: {error}</div>;
  if (!telemetry) return <div className="p-4">No data available</div>;

  const { discovery, campaign, engagement, qualification, page_engagement, orchestration } = telemetry;

  return (
    <div className="p-6 bg-white rounded-lg shadow">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Campaign Telemetry</h1>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={autoRefresh}
            onChange={(e) => setAutoRefresh(e.target.checked)}
            className="w-4 h-4"
          />
          <span className="text-sm">Auto-refresh (5s)</span>
        </label>
      </div>

      <div className="text-xs text-gray-500 mb-6">
        Last updated: {new Date(telemetry.timestamp).toLocaleString()}
      </div>

      {/* DISCOVERY SECTION */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="border rounded-lg p-4">
          <div className="text-xs font-semibold text-gray-600 mb-2">DISCOVERY</div>
          <div className="flex gap-4">
            <div>
              <div className="text-2xl font-bold">{discovery.businesses_found}</div>
              <div className="text-xs text-gray-600">Businesses Found</div>
            </div>
            <div>
              <div className="text-2xl font-bold">{discovery.new_leads}</div>
              <div className="text-xs text-gray-600">New Leads Added</div>
            </div>
          </div>
        </div>

        {/* CAMPAIGN SECTION */}
        <div className="border rounded-lg p-4">
          <div className="text-xs font-semibold text-gray-600 mb-2">EMAILS SENT</div>
          <div className="flex gap-4">
            <div>
              <div className="text-2xl font-bold text-green-600">{campaign.successful}</div>
              <div className="text-xs text-gray-600">Successful</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-red-600">{campaign.failed}</div>
              <div className="text-xs text-gray-600">Failed</div>
            </div>
          </div>
        </div>
      </div>

      {/* ENGAGEMENT SECTION */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="border rounded-lg p-4">
          <div className="text-xs font-semibold text-gray-600 mb-2">OPENS & CLICKS</div>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm">Opens</span>
              <span className="font-bold">{engagement.opens}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm">Clicks</span>
              <span className="font-bold">{engagement.clicks}</span>
            </div>
            <div className="flex justify-between border-t pt-2">
              <span className="text-sm font-semibold">Open Rate</span>
              <span className="font-bold">{engagement.open_rate}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm font-semibold">Click Rate</span>
              <span className="font-bold">{engagement.click_rate}%</span>
            </div>
          </div>
        </div>

        <div className="border rounded-lg p-4">
          <div className="text-xs font-semibold text-gray-600 mb-2">LEAD QUALIFICATION</div>
          <div className="space-y-1">
            <div className="flex justify-between">
              <span className="text-sm">🔴 Tier A (Hot)</span>
              <span className="font-bold text-red-600">{qualification.tier_a}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm">🟡 Tier B (Warm)</span>
              <span className="font-bold text-yellow-600">{qualification.tier_b}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm">🔵 Tier C (Cold)</span>
              <span className="font-bold text-blue-600">{qualification.tier_c}</span>
            </div>
          </div>
        </div>
      </div>

      {/* PAGE ENGAGEMENT SECTION */}
      <div className="border rounded-lg p-4 mb-6">
        <div className="text-xs font-semibold text-gray-600 mb-3">LANDING PAGE ENGAGEMENT</div>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <div className="text-2xl font-bold">{page_engagement.total_visits}</div>
            <div className="text-xs text-gray-600">Page Visits</div>
          </div>
          <div>
            <div className="text-2xl font-bold">{page_engagement.unique_sessions}</div>
            <div className="text-xs text-gray-600">Unique Sessions</div>
          </div>
          <div>
            <div className="text-2xl font-bold">{page_engagement.leads_who_visited}</div>
            <div className="text-xs text-gray-600">Leads Who Visited</div>
          </div>
        </div>
      </div>

      {/* ORCHESTRATION STATUS */}
      <div className="border rounded-lg p-4 bg-gray-50">
        <div className="text-xs font-semibold text-gray-600 mb-2">ORCHESTRATION STATUS</div>
        <div>
          <div className="flex justify-between items-center">
            <span className="text-sm">Last Run</span>
            <span className="font-mono text-sm">
              {orchestration.last_run ? new Date(orchestration.last_run).toLocaleString() : "Never"}
            </span>
          </div>
          <div className="flex justify-between items-center mt-1">
            <span className="text-sm">Status</span>
            <span
              className={`px-2 py-1 rounded text-xs font-semibold ${
                orchestration.status === "success" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"
              }`}
            >
              {orchestration.status || "Unknown"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
