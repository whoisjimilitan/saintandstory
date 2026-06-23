"use client";

import { useEffect, useState } from "react";

interface ProspectWithScore {
  id: string;
  businessName: string;
  city: string;
  email: string;
  engagementScore: number;
  status: string;
  lastEngagementAt?: string;
}

export default function IntelligencePage() {
  const [prospects, setProspects] = useState<ProspectWithScore[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<"score" | "recent">("score");

  useEffect(() => {
    fetchProspects();
  }, []);

  const fetchProspects = async () => {
    try {
      // Fetch all prospects with engagement scores
      const res = await fetch("/api/b2b/prospects?limit=200&sort=engagement_score");
      if (res.ok) {
        const data = await res.json();
        setProspects(data.prospects || []);
      }
    } catch (error) {
      console.error("Error fetching prospects:", error);
    } finally {
      setLoading(false);
    }
  };

  const sortedProspects = [...prospects].sort((a, b) => {
    if (sortBy === "score") {
      return (b.engagementScore || 0) - (a.engagementScore || 0);
    } else {
      const aDate = new Date(a.lastEngagementAt || 0).getTime();
      const bDate = new Date(b.lastEngagementAt || 0).getTime();
      return bDate - aDate;
    }
  });

  const getScoreLabel = (score: number) => {
    if (score >= 80) return "Hot";
    if (score >= 60) return "Warm";
    if (score >= 40) return "Cool";
    return "Cold";
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "bg-[#0D0D0D] text-white";
    if (score >= 60) return "bg-[#666666] text-white";
    if (score >= 40) return "bg-[#CCCCCC] text-[#0D0D0D]";
    return "bg-[#E8E8E8] text-[#888888]";
  };

  const avgScore = prospects.length > 0
    ? Math.round(prospects.reduce((sum, p) => sum + (p.engagementScore || 0), 0) / prospects.length)
    : 0;

  const hotCount = prospects.filter((p) => (p.engagementScore || 0) >= 80).length;
  const warmCount = prospects.filter((p) => (p.engagementScore || 0) >= 60 && (p.engagementScore || 0) < 80).length;

  return (
    <div className="min-h-screen bg-white pt-20">
      <div className="max-w-4xl mx-auto px-4 md:px-0 py-12">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-black text-[#0D0D0D] mb-2">Intelligence</h1>
          <p className="text-sm text-[#888888]">Engagement scores and behavior patterns</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-3 mb-8">
          <div className="border border-[#E8E8E8] rounded-lg p-4 bg-[#F9F9F9]">
            <p className="text-xs text-[#888888] uppercase font-semibold mb-1">Total Prospects</p>
            <p className="text-2xl font-black text-[#0D0D0D]">{prospects.length}</p>
          </div>
          <div className="border border-[#E8E8E8] rounded-lg p-4 bg-[#F9F9F9]">
            <p className="text-xs text-[#888888] uppercase font-semibold mb-1">Avg Score</p>
            <p className="text-2xl font-black text-[#0D0D0D]">{avgScore}</p>
          </div>
          <div className="border border-[#E8E8E8] rounded-lg p-4 bg-[#F9F9F9]">
            <p className="text-xs text-[#888888] uppercase font-semibold mb-1">Hot 🔥</p>
            <p className="text-2xl font-black text-[#0D0D0D]">{hotCount}</p>
          </div>
          <div className="border border-[#E8E8E8] rounded-lg p-4 bg-[#F9F9F9]">
            <p className="text-xs text-[#888888] uppercase font-semibold mb-1">Warm</p>
            <p className="text-2xl font-black text-[#0D0D0D]">{warmCount}</p>
          </div>
        </div>

        {/* Sort */}
        <div className="mb-8 flex gap-3">
          <button
            onClick={() => setSortBy("score")}
            className={`px-3 py-2 text-xs font-semibold rounded transition-colors ${
              sortBy === "score"
                ? "bg-[#0D0D0D] text-white"
                : "bg-[#F5F5F5] text-[#0D0D0D] hover:bg-[#E8E8E8]"
            }`}
          >
            Sort by Score
          </button>
          <button
            onClick={() => setSortBy("recent")}
            className={`px-3 py-2 text-xs font-semibold rounded transition-colors ${
              sortBy === "recent"
                ? "bg-[#0D0D0D] text-white"
                : "bg-[#F5F5F5] text-[#0D0D0D] hover:bg-[#E8E8E8]"
            }`}
          >
            Sort by Recent
          </button>
        </div>

        {/* Prospects List */}
        {loading ? (
          <div className="text-center py-12">
            <div className="w-8 h-8 border-2 border-[#E8E8E8] border-t-[#0D0D0D] rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-sm text-[#666666]">Loading intelligence...</p>
          </div>
        ) : sortedProspects.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-sm text-[#666666]">No prospects to analyze yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {sortedProspects.map((prospect) => (
              <div
                key={prospect.id}
                className="border border-[#E8E8E8] rounded-lg p-4 bg-[#F9F9F9] hover:bg-white transition-colors"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-[#0D0D0D]">{prospect.businessName}</p>
                    <p className="text-xs text-[#888888]">{prospect.email} • {prospect.city}</p>
                    <p className="text-xs text-[#666666] mt-1">
                      Status: <span className="font-semibold">{prospect.status}</span>
                    </p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className={`inline-block px-3 py-2 rounded font-semibold text-sm ${getScoreColor(prospect.engagementScore || 0)}`}>
                      {getScoreLabel(prospect.engagementScore || 0)}
                    </div>
                    <p className="text-xs text-[#888888] mt-2">
                      Score: {prospect.engagementScore || 0}
                    </p>
                    {prospect.lastEngagementAt && (
                      <p className="text-xs text-[#888888] mt-1">
                        {new Date(prospect.lastEngagementAt).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Refresh Button */}
        <button
          onClick={fetchProspects}
          className="mt-8 px-4 py-2 text-xs font-semibold text-[#0D0D0D] border border-[#E8E8E8] rounded hover:bg-[#F5F5F5] transition-colors"
        >
          Refresh
        </button>
      </div>
    </div>
  );
}
