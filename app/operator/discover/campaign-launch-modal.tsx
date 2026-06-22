"use client";

import { useState } from "react";

interface CampaignLaunchModalProps {
  isOpen: boolean;
  selectedLeads: any[];
  onClose: () => void;
  onLaunch: (campaignId: string) => void;
}

export function CampaignLaunchModal({
  isOpen,
  selectedLeads,
  onClose,
  onLaunch
}: CampaignLaunchModalProps) {
  const [loading, setLoading] = useState(false);
  const [campaign, setCampaign] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const prepareCampaign = async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/b2b/dork-search/campaign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          leadIds: selectedLeads.map((lead) => lead.id),
          campaignName: `Campaign ${new Date().toLocaleDateString()}`
        })
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to prepare campaign");
        return;
      }

      setCampaign(data.campaign);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to prepare campaign");
    } finally {
      setLoading(false);
    }
  };

  const handleLaunch = async () => {
    if (campaign?.campaignId) {
      onLaunch(campaign.campaignId);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="border-b border-[#E8E8E8] p-6 sticky top-0 bg-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-[#0D0D0D] uppercase tracking-[0.15em] mb-1">
                Launch Campaign
              </p>
              <p className="text-sm text-[#888888]">
                {selectedLeads.length} prospect{selectedLeads.length !== 1 ? "s" : ""}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-[#888888] hover:text-[#0D0D0D] transition-colors text-2xl leading-none"
            >
              ×
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {!campaign && !loading && (
            <button
              onClick={prepareCampaign}
              className="w-full px-6 py-3 bg-[#0D0D0D] text-white rounded text-sm font-semibold hover:bg-[#333333] transition-colors"
            >
              Analyze & Prepare Campaign
            </button>
          )}

          {loading && (
            <div className="text-center py-8">
              <p className="text-sm text-[#888888]">Analyzing leads and grouping by pressure...</p>
            </div>
          )}

          {error && (
            <div className="p-4 bg-[#FFF5F5] border border-[#FFE0E0] rounded">
              <p className="text-xs font-semibold text-[#D32F2F]">Error</p>
              <p className="text-xs text-[#B71C1C] mt-1">{error}</p>
            </div>
          )}

          {campaign && (
            <div className="space-y-6">
              {/* Campaign Summary */}
              <div className="bg-[#F9F9F9] border border-[#E8E8E8] rounded p-6">
                <p className="text-xs font-semibold text-[#0D0D0D] uppercase tracking-[0.15em] mb-4">
                  Campaign Summary
                </p>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <p className="text-[9px] text-[#888888] uppercase font-semibold mb-1">
                      Total Prospects
                    </p>
                    <p className="text-2xl font-black text-[#0D0D0D]">
                      {campaign.totalLeads}
                    </p>
                  </div>
                  <div>
                    <p className="text-[9px] text-[#888888] uppercase font-semibold mb-1">
                      Pressure Groups
                    </p>
                    <p className="text-2xl font-black text-[#0D0D0D]">
                      {campaign.groupedByPressure.filter((g: any) => g.count > 0).length}
                    </p>
                  </div>
                  <div>
                    <p className="text-[9px] text-[#888888] uppercase font-semibold mb-1">
                      Status
                    </p>
                    <p className="text-sm font-semibold text-[#0D0D0D]">Ready</p>
                  </div>
                </div>
              </div>

              {/* Pressure Groups */}
              <div className="space-y-4">
                <p className="text-xs font-semibold text-[#0D0D0D] uppercase tracking-[0.15em]">
                  Prospects Grouped by Pressure
                </p>
                {campaign.groupedByPressure.map((group: any, idx: number) => (
                  group.count > 0 && (
                    <div
                      key={idx}
                      className="border border-[#E8E8E8] rounded p-4 space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-semibold text-[#0D0D0D]">
                            {group.pressure}
                          </p>
                          <p className="text-xs text-[#888888] mt-1">
                            {group.count} prospect{group.count !== 1 ? "s" : ""} • {group.responseRate} response rate
                          </p>
                        </div>
                        <p className="text-2xl font-black text-[#0D0D0D]">
                          {group.count}
                        </p>
                      </div>

                      {/* Leads in Group */}
                      <div className="pt-3 border-t border-[#E8E8E8] space-y-2">
                        {group.leads.slice(0, 3).map((lead: any, lidx: number) => (
                          <div key={lidx} className="text-xs text-[#666666]">
                            <p className="font-semibold">{lead.businessName}</p>
                            {lead.email && <p className="text-[#888888]">{lead.email}</p>}
                          </div>
                        ))}
                        {group.leads.length > 3 && (
                          <p className="text-xs text-[#888888] italic">
                            +{group.leads.length - 3} more
                          </p>
                        )}
                      </div>
                    </div>
                  )
                ))}
              </div>

              {/* Launch Button */}
              <button
                onClick={handleLaunch}
                className="w-full px-6 py-3 bg-[#0D0D0D] text-white rounded text-sm font-semibold hover:bg-[#333333] transition-colors"
              >
                Launch Campaign
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
