"use client";

import { useEffect, useState } from "react";

interface EmailCampaign {
  id: string;
  campaignName: string;
  totalLeads: number;
  sent: number;
  opened: number;
  replied: number;
  sentAt: string;
}

export default function ReachPage() {
  const [emailCampaigns, setEmailCampaigns] = useState<EmailCampaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [showHistory, setShowHistory] = useState(false);

  // Filter campaigns by 24-hour window
  const filterCampaignsByWindow = (campaigns: any[], now = new Date()) => {
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const today = campaigns.filter((c) => new Date(c.sentAt) >= oneDayAgo);
    const history = campaigns.filter((c) => new Date(c.sentAt) < oneDayAgo);
    return { today, history };
  };

  const emailByWindow = filterCampaignsByWindow(emailCampaigns);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const emailRes = await fetch("/api/b2b/campaigns/list");

      if (emailRes.ok) {
        const data = await emailRes.json();
        setEmailCampaigns(
          data.campaigns?.filter((c: any) => c.channel === "email") || []
        );
      }
    } catch (error) {
      console.error("[REACH] Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const emailStats = emailByWindow.today.reduce(
    (acc, c) => ({
      total: acc.total + ((c as any).emailStats?.sent || c.sent || 0),
      opened: acc.opened + ((c as any).emailStats?.opened || c.opened || 0),
      replied: acc.replied + ((c as any).emailStats?.replied || c.replied || 0),
    }),
    { total: 0, opened: 0, replied: 0 }
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-white pt-16 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-[#E8E8E8] border-t-[#0D0D0D] rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-sm text-[#666666]">Loading campaigns...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white pt-16 pb-16">
      <div className="max-w-6xl mx-auto px-4 md:px-8">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-3xl md:text-4xl font-black text-[#0D0D0D] mb-2 tracking-tight leading-tight">
            Reach
          </h1>
          <p className="text-xs text-[#999999]">Track email campaign performance</p>
        </div>

        {/* Stats */}
        <div className="mb-12 pb-8 border-b border-[#E8E8E8]">
          <p className="text-xs font-semibold text-[#0D0D0D] uppercase tracking-widest mb-6">
            Summary
          </p>
          <div className="grid grid-cols-3 gap-12">
            <div>
              <p className="text-xs text-[#888888] mb-2">Sent</p>
              <p className="text-3xl font-black text-[#0D0D0D]">{emailStats.total}</p>
            </div>
            <div>
              <p className="text-xs text-[#888888] mb-2">Opened</p>
              <p className="text-3xl font-black text-[#0D0D0D]">{emailStats.opened}</p>
            </div>
            <div>
              <p className="text-xs text-[#888888] mb-2">Replied</p>
              <p className="text-3xl font-black text-[#0D0D0D]">{emailStats.replied}</p>
            </div>
          </div>
        </div>

        {/* Today's Campaigns */}
        <div className="mb-8">
          <p className="text-xs font-semibold text-[#0D0D0D] uppercase tracking-widest mb-6">
            Today
          </p>
          {emailByWindow.today.length === 0 ? (
            <p className="text-sm text-[#666666]">No campaigns sent today</p>
          ) : (
            <div className="space-y-3">
              {emailByWindow.today.map((campaign) => (
                <div
                  key={campaign.id}
                  className="border border-[#E8E8E8] rounded-lg p-4 hover:bg-[#F9F9F9] transition-colors group"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-[#0D0D0D]">
                        {campaign.campaignName}
                      </p>
                      <p className="text-xs text-[#888888] mt-1">
                        {campaign.totalLeads} leads •{" "}
                        {new Date(campaign.sentAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex gap-6 text-right items-center">
                      <div>
                        <p className="text-xs text-[#888888]">Sent</p>
                        <p className="text-sm font-semibold text-[#0D0D0D]">
                          {(campaign as any).emailStats?.sent || 0}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-[#888888]">Opened</p>
                        <p className="text-sm font-semibold text-[#0D0D0D]">
                          {(campaign as any).emailStats?.opened || 0}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-[#888888]">Replied</p>
                        <p className="text-sm font-semibold text-[#0D0D0D]">
                          {(campaign as any).emailStats?.replied || 0}
                        </p>
                      </div>
                      <button
                        onClick={() => {
                          if (confirm(`Delete campaign "${campaign.campaignName}"? This cannot be undone.`)) {
                            fetch("/api/operator/campaigns/delete", {
                              method: "DELETE",
                              headers: { "Content-Type": "application/json" },
                              body: JSON.stringify({ campaignId: campaign.id }),
                            }).then((res) => {
                              if (res.ok) {
                                window.location.reload();
                              }
                            });
                          }
                        }}
                        className="ml-4 text-[#999999] hover:text-[#FF6B6B] transition-colors opacity-0 group-hover:opacity-100"
                        title="Delete campaign"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* History Section */}
        {emailByWindow.history.length > 0 && (
          <div>
            <button
              onClick={() => setShowHistory(!showHistory)}
              className="text-xs font-semibold text-[#0D0D0D] uppercase tracking-widest mb-6 hover:text-[#666666] transition-colors flex items-center gap-2"
            >
              {showHistory ? "▼" : "▶"} History ({emailByWindow.history.length})
            </button>

            {showHistory && (
              <div className="space-y-3">
                {emailByWindow.history.map((campaign) => (
                  <div
                    key={campaign.id}
                    className="border border-[#E8E8E8] rounded-lg p-4 hover:bg-[#F9F9F9] transition-colors opacity-75 group"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-[#0D0D0D]">
                          {campaign.campaignName}
                        </p>
                        <p className="text-xs text-[#888888] mt-1">
                          {campaign.totalLeads} leads •{" "}
                          {new Date(campaign.sentAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex gap-6 text-right items-center">
                        <div>
                          <p className="text-xs text-[#888888]">Sent</p>
                          <p className="text-sm font-semibold text-[#0D0D0D]">
                            {campaign.sent}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-[#888888]">Opened</p>
                          <p className="text-sm font-semibold text-[#0D0D0D]">
                            {campaign.opened}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-[#888888]">Replied</p>
                          <p className="text-sm font-semibold text-[#0D0D0D]">
                            {campaign.replied}
                          </p>
                        </div>
                        <button
                          onClick={() => {
                            if (confirm(`Delete campaign "${campaign.campaignName}"? This cannot be undone.`)) {
                              fetch("/api/operator/campaigns/delete", {
                                method: "DELETE",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({ campaignId: campaign.id }),
                              }).then((res) => {
                                if (res.ok) {
                                  window.location.reload();
                                }
                              });
                            }
                          }}
                          className="ml-4 text-[#999999] hover:text-[#FF6B6B] transition-colors opacity-0 group-hover:opacity-100"
                          title="Delete campaign"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
