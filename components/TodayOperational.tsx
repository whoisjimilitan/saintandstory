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
    const interval = setInterval(fetch, 30000); // Live updates every 30s
    return () => clearInterval(interval);
  }, []);

  if (loading || !data) return null;

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      {/* AVAILABILITY RIGHT NOW */}
      <div className="mb-12">
        <div className="flex items-center gap-2 mb-4">
          <div className="text-[#0D0D0D]">
            <Icons.Drivers />
          </div>
          <p className="text-xs font-semibold text-[#0D0D0D] uppercase tracking-widest">
            Drivers Available
          </p>
        </div>
        <div className="flex items-baseline gap-4">
          <p className="text-4xl font-black text-[#0D0D0D]">{data.driversOnline}</p>
          <p className="text-sm text-[#888888]">online for interception jobs</p>
        </div>
        <p className="text-xs text-[#666666] mt-3">
          {data.driversTotalPool} total • {data.driversOffline} offline
        </p>
      </div>

      {/* ACTUAL PIPELINE MOVES */}
      <div className="mb-12 pb-12 border-b border-[#E8E8E8]">
        <div className="flex items-center gap-2 mb-4">
          <div className="text-[#0D0D0D]">
            <Icons.TrendingUp />
          </div>
          <p className="text-xs font-semibold text-[#0D0D0D] uppercase tracking-widest">
            Pipeline Today
          </p>
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <p className="text-2xl font-black text-[#0D0D0D]">{data.pipelineQualified}</p>
            <p className="text-xs text-[#888888] mt-1">qualified today</p>
          </div>
          <div>
            <p className="text-2xl font-black text-[#0D0D0D]">{data.pipelineProposed}</p>
            <p className="text-xs text-[#888888] mt-1">proposals sent</p>
          </div>
          <div>
            <p className="text-2xl font-black text-[#0D0D0D]">{data.pipelineClosedToday}</p>
            <p className="text-xs text-[#888888] mt-1">closed today</p>
          </div>
        </div>
      </div>

      {/* WAITING RESPONSES */}
      <div className="mb-12 pb-12 border-b border-[#E8E8E8]">
        <div className="flex items-center gap-2 mb-4">
          <div className="text-[#0D0D0D]">
            <Icons.Message />
          </div>
          <p className="text-xs font-semibold text-[#0D0D0D] uppercase tracking-widest">
            Email Replies Waiting
          </p>
        </div>
        <div className="flex items-baseline gap-3">
          <p className="text-3xl font-black text-[#0D0D0D]">{data.repliesWaiting}</p>
          <p className="text-sm text-[#888888]">prospects ready to contact</p>
        </div>
        <p className="text-xs text-[#666666] mt-3">Oldest: {data.oldestReplyHours} hours waiting</p>
      </div>

      {/* IMMEDIATE ACTIONS */}
      <div className="mb-8">
        <p className="text-xs font-semibold text-[#0D0D0D] uppercase tracking-widest mb-4">
          Right Now
        </p>
        <div className="space-y-3">
          {/* Contact replies */}
          {data.repliesWaiting > 0 && (
            <Link href="/operator/responses">
              <div className="p-4 bg-[#0D0D0D] text-white rounded-lg hover:bg-[#1A1A1A] transition-colors cursor-pointer">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <Icons.Clock />
                    <p className="font-semibold text-sm">Contact {data.repliesWaiting} replies</p>
                  </div>
                  <p className="text-xs text-[#CCCCCC]">→</p>
                </div>
              </div>
            </Link>
          )}

          {/* Assign drivers */}
          {data.driversOnline > 0 && (
            <Link href="/operator/understand">
              <div className="p-4 bg-[#F9F9F9] border border-[#E8E8E8] rounded-lg hover:border-[#0D0D0D] transition-colors cursor-pointer">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <div className="text-[#0D0D0D]">
                      <Icons.Drivers />
                    </div>
                    <p className="font-semibold text-sm text-[#0D0D0D]">Assign {data.driversOnline} drivers to jobs</p>
                  </div>
                  <p className="text-xs text-[#888888]">→</p>
                </div>
              </div>
            </Link>
          )}

          {/* Follow up stalled prospects */}
          {data.prospectsStalled > 0 && (
            <Link href="/operator/pipeline">
              <div className="p-4 bg-[#F9F9F9] border border-[#E8E8E8] rounded-lg hover:border-[#0D0D0D] transition-colors cursor-pointer">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <div className="text-[#0D0D0D]">
                      <Icons.AlertCircle />
                    </div>
                    <p className="font-semibold text-sm text-[#0D0D0D]">Follow up {data.prospectsStalled} stalled</p>
                  </div>
                  <p className="text-xs text-[#888888]">→</p>
                </div>
              </div>
            </Link>
          )}
        </div>
      </div>

      {/* STATUS CHECK */}
      {data.statusMessage && (
        <div className="p-4 bg-[#F9F9F9] rounded-lg border border-[#E8E8E8]">
          <p className="text-sm text-[#0D0D0D]">{data.statusMessage}</p>
        </div>
      )}
    </div>
  );
}
