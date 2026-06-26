"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface CampaignData {
  campaign_overview: {
    total_facility_managers_discovered: string;
    email_channel: string;
    phone_channel: number;
    combined_outreach: number;
  };
  email_channel: {
    leads_targeted: string | number;
    emails_sent: string | number;
    response_rate_percent: string;
    yes_responses: string | number;
    maybe_responses: string | number;
    standing_orders: string | number;
    conversion_rate_percent: string;
  };
  phone_channel: {
    leads_called: number;
    total_call_attempts: number;
    calls_reached: number;
    reach_rate_percent: string;
    emails_captured: number;
    email_capture_rate_percent: string;
    leads_with_emails_to_follow_up: number;
    standing_orders: number;
  };
}

const Icons = {
  Email: () => (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M2 4h12v8H2V4z" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M2 4l6 4 6-4" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  Phone: () => (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M3 2h3l1.5 6-3 2c.47 1.45 1.62 2.6 3.07 3.07l2-3 6 1.5v3c0 1.1-.9 2-2 2-6.6 0-12-5.4-12-12 0-1.1.9-2 2-2z" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  TrendingUp: () => (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M2 14l3-3 2 2 5-5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M10 6h4v4" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  Users: () => (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="5" cy="5" r="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M2 12c0-1.1.9-2 2-2h2c1.1 0 2 .9 2 2v2" strokeLinecap="round" strokeLinejoin="round"/>
      <circle cx="11" cy="5" r="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M8 12c0-1.1.9-2 2-2h2c1.1 0 2 .9 2 2v2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
};

export default function CampaignsPage() {
  const [data, setData] = useState<CampaignData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("/api/admin/campaign-attribution", {
          headers: { "x-admin-email": "whoisjimi.today@gmail.com" },
        });
        if (response.ok) {
          const json = await response.json();
          setData(json);
        }
      } catch (error) {
        console.error("Failed to fetch campaign data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 30000); // Refresh every 30s
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-white pt-24 px-4 md:px-0">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-[#F5F5F5] rounded w-48"></div>
          <div className="h-64 bg-[#F5F5F5] rounded"></div>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-white pt-24 px-4 md:px-0">
        <p className="text-[#666666]">Failed to load campaign data</p>
      </div>
    );
  }

  const emailData = data.email_channel;
  const phoneData = data.phone_channel;
  const overview = data.campaign_overview;

  return (
    <div className="min-h-screen bg-white pt-24">
      {/* HEADER */}
      <div className="mb-8 px-4 md:px-0">
        <div className="inline-flex items-center gap-2 mb-6 bg-[#F5F5F5] px-3 py-1.5 rounded-full border border-[#E8E8E8]">
          <p className="text-xs font-semibold text-[#0D0D0D] font-mono">FACILITY MANAGERS</p>
        </div>
        <h1 className="text-4xl md:text-5xl font-black text-[#0D0D0D] mb-3 tracking-tight leading-tight">
          Campaign Performance
        </h1>
        <p className="text-base text-[#666666] leading-relaxed max-w-3xl font-normal">
          Email vs Phone outreach effectiveness for {overview.total_facility_managers_discovered} discovered prospects.
        </p>
      </div>

      {/* OVERVIEW GRID */}
      <div className="mb-16 px-4 md:px-0">
        <p className="text-xs font-semibold text-[#888888] tracking-[0.15em] uppercase mb-4">Overview</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="border border-[#E8E8E8] rounded-lg p-4 bg-[#F9F9F9] hover:border-[#0D0D0D] transition-colors">
            <p className="text-xs text-[#888888] font-semibold mb-2">Discovered</p>
            <p className="text-2xl font-black text-[#0D0D0D]">{overview.total_facility_managers_discovered}</p>
          </div>
          <div className="border border-[#E8E8E8] rounded-lg p-4 bg-[#F9F9F9] hover:border-[#0D0D0D] transition-colors">
            <p className="text-xs text-[#888888] font-semibold mb-2">Email</p>
            <p className="text-2xl font-black text-[#0D0D0D]">{overview.email_channel}</p>
          </div>
          <div className="border border-[#E8E8E8] rounded-lg p-4 bg-[#F9F9F9] hover:border-[#0D0D0D] transition-colors">
            <p className="text-xs text-[#888888] font-semibold mb-2">Phone</p>
            <p className="text-2xl font-black text-[#0D0D0D]">{overview.phone_channel}</p>
          </div>
          <div className="border border-[#E8E8E8] rounded-lg p-4 bg-[#F9F9F9] hover:border-[#0D0D0D] transition-colors">
            <p className="text-xs text-[#888888] font-semibold mb-2">Combined</p>
            <p className="text-2xl font-black text-[#0D0D0D]">{overview.combined_outreach}</p>
          </div>
        </div>
      </div>

      {/* CHANNEL COMPARISON */}
      <div className="mb-16 px-4 md:px-0">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* EMAIL CHANNEL */}
          <div className="border border-[#E8E8E8] rounded-lg p-8 bg-white hover:border-[#0D0D0D] transition-all">
            <div className="flex items-center gap-2 mb-6">
              <div className="text-[#0D0D0D]">
                <Icons.Email />
              </div>
              <h2 className="text-xl font-black text-[#0D0D0D]">Email Channel</h2>
            </div>

            <div className="space-y-6">
              {/* Sent */}
              <div className="pb-4 border-b border-[#E8E8E8]">
                <p className="text-xs font-semibold text-[#888888] tracking-[0.05em] uppercase mb-2">Emails Sent</p>
                <p className="text-3xl font-black text-[#0D0D0D] mb-1">{emailData.emails_sent}</p>
                <p className="text-xs text-[#666666]">of {emailData.leads_targeted} prospects</p>
              </div>

              {/* Response Rate */}
              <div className="pb-4 border-b border-[#E8E8E8]">
                <p className="text-xs font-semibold text-[#888888] tracking-[0.05em] uppercase mb-2">Response Rate</p>
                <p className="text-2xl font-black text-[#0D0D0D] mb-1">{emailData.response_rate_percent}%</p>
                <div className="flex items-center gap-2 text-xs text-[#666666]">
                  <span>✓ {emailData.yes_responses} YES</span>
                  <span className="text-[#CCCCCC]">•</span>
                  <span>~ {emailData.maybe_responses} MAYBE</span>
                </div>
              </div>

              {/* Conversions */}
              <div>
                <p className="text-xs font-semibold text-[#888888] tracking-[0.05em] uppercase mb-2">Conversions</p>
                <p className="text-2xl font-black text-[#0D0D0D] mb-1">{emailData.standing_orders}</p>
                <p className="text-xs text-[#666666]">
                  {emailData.conversion_rate_percent}% conversion rate
                </p>
              </div>
            </div>
          </div>

          {/* PHONE CHANNEL */}
          <div className="border border-[#E8E8E8] rounded-lg p-8 bg-white hover:border-[#0D0D0D] transition-all">
            <div className="flex items-center gap-2 mb-6">
              <div className="text-[#0D0D0D]">
                <Icons.Phone />
              </div>
              <h2 className="text-xl font-black text-[#0D0D0D]">Phone Channel</h2>
            </div>

            <div className="space-y-6">
              {/* Calls */}
              <div className="pb-4 border-b border-[#E8E8E8]">
                <p className="text-xs font-semibold text-[#888888] tracking-[0.05em] uppercase mb-2">Call Attempts</p>
                <p className="text-3xl font-black text-[#0D0D0D] mb-1">{phoneData.total_call_attempts}</p>
                <p className="text-xs text-[#666666]">
                  {phoneData.calls_reached} reached ({phoneData.reach_rate_percent}%)
                </p>
              </div>

              {/* Emails Captured */}
              <div className="pb-4 border-b border-[#E8E8E8]">
                <p className="text-xs font-semibold text-[#888888] tracking-[0.05em] uppercase mb-2">Emails Captured</p>
                <p className="text-2xl font-black text-[#0D0D0D] mb-1">{phoneData.emails_captured}</p>
                <p className="text-xs text-[#666666]">
                  {phoneData.email_capture_rate_percent}% capture rate from calls
                </p>
              </div>

              {/* Conversions */}
              <div>
                <p className="text-xs font-semibold text-[#888888] tracking-[0.05em] uppercase mb-2">Conversions</p>
                <p className="text-2xl font-black text-[#0D0D0D] mb-1">{phoneData.standing_orders}</p>
                <p className="text-xs text-[#666666]">
                  {phoneData.leads_called > 0 ? ((phoneData.standing_orders / phoneData.leads_called) * 100).toFixed(1) : "0"}% conversion rate
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* INSIGHTS & ACTIONS */}
      <div className="mb-16 px-4 md:px-0">
        <div className="border border-[#E8E8E8] rounded-lg p-8 bg-[#F9F9F9]">
          <div className="max-w-3xl space-y-4">
            <div className="flex items-start gap-3">
              <div className="text-[#0D0D0D] mt-0.5 flex-shrink-0">
                <Icons.TrendingUp />
              </div>
              <div>
                <p className="text-sm font-semibold text-[#0D0D0D]">Strategy Recommendation</p>
                <p className="text-xs text-[#666666] mt-1">
                  Phone outreach is best for quality and relationship-building with facility managers. Email is optimal for scale. Hybrid approach recommended: phone for key prospects, email for volume follow-up.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 pt-3 border-t border-[#E8E8E8]">
              <div className="text-[#0D0D0D] mt-0.5 flex-shrink-0">
                <Icons.Users />
              </div>
              <div>
                <p className="text-xs font-semibold text-[#0D0D0D] tracking-[0.05em] uppercase mb-2">Next Steps</p>
                <ul className="space-y-2 text-xs text-[#666666]">
                  <li>
                    <Link href="/operator/pipeline" className="text-[#0D0D0D] font-semibold hover:underline">
                      • Review email responses in Pipeline
                    </Link>
                  </li>
                  <li>
                    <span className="text-[#0D0D0D] font-semibold">
                      • Log phone calls via /api/admin/phone-outreach
                    </span>
                  </li>
                  <li>
                    <span className="text-[#0D0D0D] font-semibold">
                      • Track emails captured from calls
                    </span>
                  </li>
                  <li>
                    <span className="text-[#0D0D0D] font-semibold">
                      • Monitor conversion rates as data flows in
                    </span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
