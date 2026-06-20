"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface BriefingData {
  discovered: number;
  orders: number;
  loading: boolean;
}

export default function OperatorBriefing() {
  const [data, setData] = useState<BriefingData>({
    discovered: 0,
    orders: 0,
    loading: true,
  });

  const [dateStr, setDateStr] = useState("");

  useEffect(() => {
    const today = new Date();
    const day = today.getDate();
    const month = today.toLocaleDateString("en-US", { month: "long" });
    const year = today.getFullYear();
    setDateStr(`${month} ${day}`);
  }, []);

  useEffect(() => {
    const loadData = async () => {
      try {
        const res = await fetch("/api/operator/morning-brief/summary");
        if (!res.ok) throw new Error("Failed to fetch");
        const summary = await res.json();
        setData({
          discovered: summary.discovered,
          orders: summary.orders,
          loading: false,
        });
      } catch (error) {
        console.error("Error:", error);
        setData((prev) => ({ ...prev, loading: false }));
      }
    };
    loadData();
  }, []);

  if (data.loading) return null;

  return (
    <div className="max-w-2xl">
      {/* Header */}
      <div className="mb-12">
        <p className="text-xs text-[#888888] uppercase tracking-wide mb-1">
          Operator
        </p>
        <p className="text-xs text-[#C9C9C9]">Saturday {dateStr}</p>
      </div>

      {/* Greeting */}
      <div className="mb-8">
        <h1 className="text-3xl font-black text-[#0D0D0D] mb-6">
          Good morning, James.
        </h1>
        <p className="text-base text-[#0D0D0D] leading-relaxed">
          You have {data.discovered} new{" "}
          {data.discovered === 1 ? "opportunity" : "opportunities"}.
          <br />
          {data.orders} standing{" "}
          {data.orders === 1 ? "order" : "orders"} is ready for fulfilment.
        </p>
      </div>

      {/* Divider */}
      <div className="h-px bg-[#E8E8E8] my-8"></div>

      {/* Today's Focus */}
      <div className="mb-8">
        <p className="text-xs font-semibold text-[#0D0D0D] uppercase tracking-wide mb-4">
          Today's Focus
        </p>
        <div className="space-y-3">
          <div>
            <p className="text-sm text-[#0D0D0D]">● Accounting firms</p>
            <p className="text-xs text-[#888888] ml-4">High confidence</p>
            <p className="text-xs text-[#888888] ml-4">2 opportunities</p>
          </div>
          <div>
            <p className="text-sm text-[#0D0D0D]">● Hospitality</p>
            <p className="text-xs text-[#888888] ml-4">1 opportunity</p>
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className="h-px bg-[#E8E8E8] my-8"></div>

      {/* Pipeline */}
      <div className="mb-8">
        <p className="text-xs font-semibold text-[#0D0D0D] uppercase tracking-wide mb-4">
          Pipeline
        </p>
        <div className="space-y-2 text-sm text-[#0D0D0D]">
          <div className="flex justify-between">
            <span>Discover</span>
            <span className="font-semibold">2</span>
          </div>
          <div className="flex justify-between">
            <span>Enrich</span>
            <span className="font-semibold">4</span>
          </div>
          <div className="flex justify-between">
            <span>Qualified</span>
            <span className="font-semibold">1</span>
          </div>
          <div className="flex justify-between">
            <span>Orders</span>
            <span className="font-semibold">0</span>
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className="h-px bg-[#E8E8E8] my-8"></div>

      {/* What should happen next */}
      <div>
        <p className="text-xs font-semibold text-[#0D0D0D] uppercase tracking-wide mb-4">
          What should happen next?
        </p>
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <span className="text-sm text-[#888888]">✓</span>
            <Link
              href="/operator/discover"
              className="text-sm text-[#0D0D0D] hover:text-[#666666] transition-colors"
            >
              Review today's opportunities
            </Link>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-[#888888]">✓</span>
            <Link
              href="/operator/orders"
              className="text-sm text-[#0D0D0D] hover:text-[#666666] transition-colors"
            >
              Approve standing orders
            </Link>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-[#888888]">✓</span>
            <Link
              href="/operator/understand"
              className="text-sm text-[#0D0D0D] hover:text-[#666666] transition-colors"
            >
              Continue enrichment
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
