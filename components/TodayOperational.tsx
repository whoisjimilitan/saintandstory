"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

// Premium monochrome icons as a cohesive set
const Icons = {
  Drivers: () => (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="12" cy="8" r="3" />
      <path d="M4 14c0-1.5 2-3 8-3s8 1.5 8 3v4H4v-4z" />
    </svg>
  ),
  Message: () => (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  ),
  TrendingUp: () => (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
      <polyline points="17 6 23 6 23 12" />
    </svg>
  ),
  Clock: () => (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  ),
  CheckCircle: () => (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  ),
  AlertCircle: () => (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  ),
};

export function TodayOperational() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await fetch("/api/operator/today-operational");
        if (res.ok) {
          const json = await res.json();
          setData(json.data);
        }
      } catch (error) {
        console.error("[TODAY] Failed:", error);
      } finally {
        setLoading(false);
      }
    };
    fetch();
    const interval = setInterval(fetch, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading || !data) return null;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">

      {/* === THE MOMENT: What matters right now === */}
      <div className="mb-16">
        {/* Primary state indicator */}
        <div className="flex items-center gap-2 mb-4">
          {data.statusMessage?.includes("Pipeline healthy") && (
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#F5F5F5] border border-[#E8E8E8]">
              <div className="w-2 h-2 rounded-full bg-[#0D0D0D]"></div>
              <p className="text-xs font-medium text-[#0D0D0D]">System operational</p>
            </div>
          )}
          {data.repliesWaiting > 0 && (
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#0D0D0D] text-white">
              <div className="w-2 h-2 rounded-full bg-white animate-pulse"></div>
              <p className="text-xs font-medium">{data.repliesWaiting} reply{data.repliesWaiting !== 1 ? 's' : ''} waiting</p>
            </div>
          )}
        </div>

        {/* Main insight */}
        <div className="mb-8">
          <p className="text-sm text-[#888888] tracking-widest uppercase mb-3">Right now</p>
          <div className="flex items-baseline gap-4">
            <p className="text-5xl font-black text-[#0D0D0D]">{data.driversOnline}</p>
            <p className="text-lg text-[#666666] font-light">
              driver{data.driversOnline !== 1 ? 's' : ''} available for immediate dispatch
            </p>
          </div>
          <p className="text-xs text-[#888888] mt-2">{data.driversTotalPool} in pool • {data.driversOffline} offline</p>
        </div>

        {/* Context: What's in motion */}
        {(data.pipelineQualified + data.pipelineProposed + data.pipelineClosedToday > 0) && (
          <div className="mb-8 pb-8 border-b border-[#E8E8E8]">
            <p className="text-xs text-[#888888] tracking-widest uppercase mb-3">Pipeline today</p>
            <div className="flex gap-12">
              {data.pipelineQualified > 0 && (
                <div>
                  <p className="text-2xl font-black text-[#0D0D0D]">{data.pipelineQualified}</p>
                  <p className="text-xs text-[#888888] mt-1">qualified</p>
                </div>
              )}
              {data.pipelineProposed > 0 && (
                <div>
                  <p className="text-2xl font-black text-[#0D0D0D]">{data.pipelineProposed}</p>
                  <p className="text-xs text-[#888888] mt-1">proposals sent</p>
                </div>
              )}
              {data.pipelineClosedToday > 0 && (
                <div>
                  <p className="text-2xl font-black text-[#0D0D0D]">{data.pipelineClosedToday}</p>
                  <p className="text-xs text-[#888888] mt-1">closed today</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* === CAMPAIGN PULSE: Unified view of outreach === */}
      <div className="mb-16">
        <p className="text-xs text-[#888888] tracking-widest uppercase mb-6">Campaign pulse</p>

        <div className="grid grid-cols-2 gap-8 mb-12">
          {/* Email */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="text-[#0D0D0D]">
                <Icons.Message />
              </div>
              <p className="text-sm font-semibold text-[#0D0D0D]">Email</p>
            </div>
            <div className="space-y-4">
              <div>
                <p className="text-3xl font-black text-[#0D0D0D]">{data.emailSent}</p>
                <p className="text-xs text-[#888888] mt-1">sent today</p>
              </div>
              <div className="flex gap-6 text-sm">
                <div>
                  <p className="font-semibold text-[#0D0D0D]">{data.emailOpened}</p>
                  <p className="text-xs text-[#888888]">opened</p>
                </div>
                <div>
                  <p className="font-semibold text-[#0D0D0D]">{data.emailReplied}</p>
                  <p className="text-xs text-[#888888]">replied</p>
                </div>
              </div>
            </div>
            {data.emailSent > 0 && (
              <Link href="/operator/outreach" className="inline-flex items-center gap-2 mt-4 text-xs font-semibold text-[#0D0D0D] hover:text-[#666666] transition-colors">
                View campaign <span className="text-[#888888]">→</span>
              </Link>
            )}
          </div>

          {/* WhatsApp */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="text-[#0D0D0D]">
                <Icons.Message />
              </div>
              <p className="text-sm font-semibold text-[#0D0D0D]">WhatsApp</p>
            </div>
            <div className="space-y-4">
              <div>
                <p className="text-3xl font-black text-[#0D0D0D]">{data.whatsappActive}</p>
                <p className="text-xs text-[#888888] mt-1">active conversations</p>
              </div>
              <div className="flex gap-6 text-sm">
                <div>
                  <p className="font-semibold text-[#0D0D0D]">{data.whatsappReady}</p>
                  <p className="text-xs text-[#888888]">ready</p>
                </div>
                <div>
                  <p className="font-semibold text-[#0D0D0D]">{data.whatsappReplied}</p>
                  <p className="text-xs text-[#888888]">replied</p>
                </div>
              </div>
            </div>
            {data.whatsappActive > 0 && (
              <Link href="/operator/whatsapp" className="inline-flex items-center gap-2 mt-4 text-xs font-semibold text-[#0D0D0D] hover:text-[#666666] transition-colors">
                View conversations <span className="text-[#888888]">→</span>
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* === IMMEDIATE ACTIONS: What to do next === */}
      {(data.repliesWaiting > 0 || data.driversOnline > 0 || data.prospectsStalled > 0) && (
        <div className="mb-12">
          <p className="text-xs text-[#888888] tracking-widest uppercase mb-6">Your move</p>
          <div className="space-y-3">
            {data.repliesWaiting > 0 && (
              <Link href="/operator/responses">
                <div className="p-4 bg-[#0D0D0D] text-white rounded-lg hover:bg-[#1A1A1A] transition-colors cursor-pointer group">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm font-semibold mb-1">Contact {data.repliesWaiting} email reply{data.repliesWaiting !== 1 ? 's' : ''}</p>
                      <p className="text-xs text-[#CCCCCC]">Oldest waiting {data.oldestReplyHours}h</p>
                    </div>
                    <span className="text-[#CCCCCC] group-hover:translate-x-1 transition-transform">→</span>
                  </div>
                </div>
              </Link>
            )}

            {data.driversOnline > 0 && (
              <Link href="/operator/understand">
                <div className="p-4 bg-[#F9F9F9] border border-[#E8E8E8] rounded-lg hover:border-[#0D0D0D] transition-colors cursor-pointer group">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm font-semibold text-[#0D0D0D] mb-1">Assign {data.driversOnline} driver{data.driversOnline !== 1 ? 's' : ''} to jobs</p>
                      <p className="text-xs text-[#888888]">Interception work available</p>
                    </div>
                    <span className="text-[#888888] group-hover:translate-x-1 transition-transform">→</span>
                  </div>
                </div>
              </Link>
            )}

            {data.prospectsStalled > 0 && (
              <Link href="/operator/pipeline">
                <div className="p-4 bg-[#F9F9F9] border border-[#E8E8E8] rounded-lg hover:border-[#0D0D0D] transition-colors cursor-pointer group">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm font-semibold text-[#0D0D0D] mb-1">Follow up {data.prospectsStalled} stalled prospect{data.prospectsStalled !== 1 ? 's' : ''}</p>
                      <p className="text-xs text-[#888888]">3+ days without movement</p>
                    </div>
                    <span className="text-[#888888] group-hover:translate-x-1 transition-transform">→</span>
                  </div>
                </div>
              </Link>
            )}
          </div>
        </div>
      )}

      {/* === STATUS: System health === */}
      {data.statusMessage && (
        <div className="text-sm text-[#666666] p-4 bg-[#F9F9F9] rounded-lg border border-[#E8E8E8]">
          {data.statusMessage}
        </div>
      )}
    </div>
  );
}
