"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface PhoneLead {
  leadId: string;
  businessName: string;
  phone: string;
  city: string;
}

interface PhoneOutreachData {
  phone_outreach_queue: {
    ready_to_call: number;
    sample: PhoneLead[];
    all: PhoneLead[];
  };
  call_tracking_stats: {
    total_calls_logged: number;
    calls_reached: number;
    voicemails_left: number;
    emails_captured: number;
    unique_leads_called: number;
  };
}

const Icons = {
  Phone: () => (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M3 2h3l1.5 6-3 2c.47 1.45 1.62 2.6 3.07 3.07l2-3 6 1.5v3c0 1.1-.9 2-2 2-6.6 0-12-5.4-12-12 0-1.1.9-2 2-2z" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  CheckCircle: () => (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="8" cy="8" r="6" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M6 8l1.5 1.5 2.5-2.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  TrendingUp: () => (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M2 14l3-3 2 2 5-5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M10 6h4v4" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  Copy: () => (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="3" y="5" width="8" height="9" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M5 5V3c0-1 1-2 2-2h6c1 0 2 1 2 2v8c0 1-1 2-2 2h-2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
};

export default function PhoneOutreachPage() {
  const [data, setData] = useState<PhoneOutreachData | null>(null);
  const [loading, setLoading] = useState(true);
  const [copyAlert, setCopyAlert] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("/api/admin/phone-outreach", {
          headers: { "x-admin-email": "whoisjimi.today@gmail.com" },
        });
        if (response.ok) {
          const json = await response.json();
          setData(json);
        }
      } catch (error) {
        console.error("Failed to fetch phone outreach data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  const copyToClipboard = (phone: string) => {
    navigator.clipboard.writeText(phone);
    setCopyAlert(phone);
    setTimeout(() => setCopyAlert(null), 2000);
  };

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
        <p className="text-[#666666]">Failed to load phone outreach data</p>
      </div>
    );
  }

  const stats = data.call_tracking_stats;
  const queue = data.phone_outreach_queue;

  return (
    <div className="min-h-screen bg-white pt-24">
      {/* HEADER */}
      <div className="mb-8 px-4 md:px-0">
        <div className="inline-flex items-center gap-2 mb-6 bg-[#F5F5F5] px-3 py-1.5 rounded-full border border-[#E8E8E8]">
          <p className="text-xs font-semibold text-[#0D0D0D] font-mono">PHONE OUTREACH</p>
        </div>
        <h1 className="text-4xl md:text-5xl font-black text-[#0D0D0D] mb-3 tracking-tight leading-tight">
          Call Queue
        </h1>
        <p className="text-base text-[#666666] leading-relaxed max-w-3xl font-normal">
          {queue.ready_to_call} facility managers ready to call. Log outcomes to build email capture list.
        </p>
      </div>

      {/* CALL TRACKING STATS */}
      <div className="mb-16 px-4 md:px-0">
        <p className="text-xs font-semibold text-[#888888] tracking-[0.15em] uppercase mb-4">Campaign Progress</p>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="border border-[#E8E8E8] rounded-lg p-4 bg-[#F9F9F9] hover:border-[#0D0D0D] transition-colors">
            <p className="text-xs text-[#888888] font-semibold mb-2">Ready to Call</p>
            <p className="text-2xl font-black text-[#0D0D0D]">{queue.ready_to_call}</p>
          </div>
          <div className="border border-[#E8E8E8] rounded-lg p-4 bg-[#F9F9F9] hover:border-[#0D0D0D] transition-colors">
            <p className="text-xs text-[#888888] font-semibold mb-2">Calls Logged</p>
            <p className="text-2xl font-black text-[#0D0D0D]">{stats.total_calls_logged}</p>
          </div>
          <div className="border border-[#E8E8E8] rounded-lg p-4 bg-[#F9F9F9] hover:border-[#0D0D0D] transition-colors">
            <p className="text-xs text-[#888888] font-semibold mb-2">Reached</p>
            <p className="text-2xl font-black text-[#0D0D0D]">{stats.calls_reached}</p>
          </div>
          <div className="border border-[#E8E8E8] rounded-lg p-4 bg-[#F9F9F9] hover:border-[#0D0D0D] transition-colors">
            <p className="text-xs text-[#888888] font-semibold mb-2">Voicemails</p>
            <p className="text-2xl font-black text-[#0D0D0D]">{stats.voicemails_left}</p>
          </div>
          <div className="border border-[#E8E8E8] rounded-lg p-4 bg-[#F9F9F9] hover:border-[#0D0D0D] transition-colors">
            <p className="text-xs text-[#888888] font-semibold mb-2">Emails Captured</p>
            <p className="text-2xl font-black text-[#0D0D0D]">{stats.emails_captured}</p>
          </div>
        </div>
      </div>

      {/* CALL QUEUE */}
      <div className="mb-16 px-4 md:px-0">
        <p className="text-xs font-semibold text-[#0D0D0D] uppercase tracking-widest mb-4">
          Leads Ready to Call
        </p>
        <div className="space-y-3 max-h-[600px] overflow-y-auto">
          {queue.all.slice(0, 20).map((lead) => (
            <div
              key={lead.leadId}
              className="border border-[#E8E8E8] rounded-lg p-4 flex items-center justify-between hover:border-[#0D0D0D] hover:bg-[#F9F9F9] transition-all"
            >
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-[#0D0D0D] mb-1">
                  {lead.businessName}
                </p>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-[#888888]">{lead.city}</span>
                  <span className="text-xs text-[#CCCCCC]">•</span>
                  <span className="text-xs font-mono text-[#666666]">{lead.phone}</span>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0 ml-4">
                <button
                  onClick={() => copyToClipboard(lead.phone)}
                  className="p-2 text-[#888888] hover:text-[#0D0D0D] hover:bg-[#F5F5F5] rounded transition-colors"
                  title="Copy phone"
                >
                  <Icons.Copy />
                </button>
                <a
                  href={`tel:${lead.phone}`}
                  className="text-xs font-semibold text-[#0D0D0D] border border-[#E8E8E8] px-3 py-1.5 rounded hover:bg-[#F5F5F5] transition-colors"
                >
                  Call
                </a>
              </div>
              {copyAlert === lead.phone && (
                <div className="absolute right-4 text-xs text-[#0D0D0D] bg-[#F5F5F5] px-2 py-1 rounded">
                  Copied!
                </div>
              )}
            </div>
          ))}
        </div>
        {queue.all.length > 20 && (
          <p className="text-xs text-[#888888] mt-4">
            ... and {queue.all.length - 20} more leads ready to call
          </p>
        )}
      </div>

      {/* INSTRUCTIONS */}
      <div className="mb-16 px-4 md:px-0">
        <div className="border border-[#E8E8E8] rounded-lg p-8 bg-[#F9F9F9]">
          <div className="max-w-3xl space-y-4">
            <div className="flex items-start gap-3">
              <div className="text-[#0D0D0D] mt-0.5 flex-shrink-0">
                <Icons.Phone />
              </div>
              <div>
                <p className="text-sm font-semibold text-[#0D0D0D]">How to Log Calls</p>
                <p className="text-xs text-[#666666] mt-2 font-mono bg-white border border-[#E8E8E8] p-3 rounded">
                  POST /api/admin/phone-outreach?confirm=true <br/>
                  Body: {"{ leadId, callOutcome, emailCaptured?, notes? }"}
                </p>
                <p className="text-xs text-[#666666] mt-2">
                  <strong>Outcomes:</strong> reached, voicemail, wrong_number, no_answer, declined
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 pt-3 border-t border-[#E8E8E8]">
              <div className="text-[#0D0D0D] mt-0.5 flex-shrink-0">
                <Icons.TrendingUp />
              </div>
              <div>
                <p className="text-xs font-semibold text-[#0D0D0D] tracking-[0.05em] uppercase mb-2">
                  Strategy
                </p>
                <ul className="space-y-1 text-xs text-[#666666]">
                  <li>• Call through the queue during business hours</li>
                  <li>• Capture email addresses when you reach decision makers</li>
                  <li>• Log outcomes even for voicemails (helps us track reach rate)</li>
                  <li>
                    <Link href="/operator/whatsapp" className="text-[#0D0D0D] font-semibold hover:underline">
                      View WhatsApp conversations →
                    </Link>
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
