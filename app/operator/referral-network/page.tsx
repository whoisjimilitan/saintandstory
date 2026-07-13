"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import OperatorReferralDashboard from "@/components/OperatorReferralDashboard";
import { generateReferralMessage } from "@/lib/referral-message";

interface ReferralSignup {
  id: string;
  name: string;
  office: string;
  phone: string;
  city: string;
  code: string;
  createdAt: string;
  sentAt?: string;
}

export default function ReferralNetworkPage() {
  const [mounted, setMounted] = useState(false);
  const [referrals, setReferrals] = useState<{ pending: ReferralSignup[]; sent: ReferralSignup[] }>({
    pending: [],
    sent: [],
  });
  const [sentHistoryExpanded, setSentHistoryExpanded] = useState(false);
  const [markingSent, setMarkingSent] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
    fetchReferrals();
  }, []);

  const fetchReferrals = async () => {
    try {
      const response = await fetch("/api/referral/list");
      const data = await response.json();

      if (!response.ok) {
        console.error("[REFERRAL-NETWORK] API Error:", {
          status: response.status,
          error: data.error,
          details: data.details,
          fullResponse: data,
        });
        throw new Error(data.error || "Failed to fetch referrals");
      }

      console.log("[REFERRAL-NETWORK] ✓ Fetched referrals:", data);
      setReferrals({
        pending: data.pending || [],
        sent: data.sent || [],
      });
    } catch (error) {
      console.error("[REFERRAL-NETWORK] Error fetching referrals:", error);
    }
  };

  const markAsSent = async (referrerId: string) => {
    setMarkingSent(referrerId);
    try {
      const response = await fetch("/api/referral/mark-sent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ referrerId }),
      });

      if (!response.ok) throw new Error("Failed to mark as sent");

      const signup = referrals.pending.find((r) => r.id === referrerId);
      if (signup) {
        setReferrals({
          pending: referrals.pending.filter((r) => r.id !== referrerId),
          sent: [...referrals.sent, { ...signup, sentAt: new Date().toISOString() }],
        });
      }

      console.log("[REFERRAL NETWORK] ✓ Marked as sent:", referrerId);
    } catch (error) {
      console.error("[REFERRAL NETWORK] Error marking as sent:", error);
      alert("Failed to mark as sent. Try again.");
    } finally {
      setMarkingSent(null);
    }
  };

  return (
    <div className="min-h-screen bg-white pt-32 pb-16">
      <div className="max-w-6xl mx-auto px-4 md:px-8">
        {/* HEADER */}
        <div className="mb-12 flex items-center justify-between">
          <div>
            <h1 className="text-3xl md:text-4xl font-black text-[#0D0D0D] mb-2 tracking-tight">Referral Network</h1>
            <p className="text-xs text-[#999999]">Receptionists and Office Managers earnings</p>
          </div>
          <Link
            href="/operator"
            className="text-sm font-medium text-[#888888] hover:text-[#0D0D0D] transition"
          >
            ← Back to Today
          </Link>
        </div>

        {/* DASHBOARD */}
        {mounted && <OperatorReferralDashboard />}

        {/* REFERRAL SIGNUPS - Pending & Sent */}
        <div className="mt-16">
          <p className="text-xs font-semibold text-[#0D0D0D] uppercase tracking-widest mb-6">Referral Signups</p>

          {/* Pending Signups - Expanded */}
          <div className="mb-4 border border-[#E8E8E8] rounded-lg overflow-hidden">
            <button
              onClick={() => {}}
              className="w-full text-left p-6 bg-white hover:bg-[#F9F9F9] transition-colors border-b border-[#E8E8E8] flex items-center justify-between"
            >
              <div>
                <p className="text-sm font-semibold text-[#0D0D0D]">Pending Signups</p>
                <p className="text-xs text-[#888888] mt-1">{referrals.pending.length} awaiting WhatsApp</p>
              </div>
              <div className="text-2xl font-black text-[#0D0D0D]">{referrals.pending.length}</div>
            </button>

            {referrals.pending.length > 0 ? (
              <div className="divide-y divide-[#E8E8E8]">
                {referrals.pending.map((signup) => (
                  <div key={signup.id} className="p-6 bg-white hover:bg-[#F9F9F9] transition-colors">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <p className="text-sm font-semibold text-[#0D0D0D]">{signup.name}</p>
                        <p className="text-xs text-[#888888] mt-1">{signup.office} • {signup.city}</p>
                      </div>
                      <button
                        onClick={() => markAsSent(signup.id)}
                        disabled={markingSent === signup.id}
                        className="px-4 py-2 bg-[#0D0D0D] text-white text-xs font-semibold rounded-lg hover:bg-[#333333] disabled:opacity-50 transition-colors"
                      >
                        {markingSent === signup.id ? "Marking..." : "Mark Sent"}
                      </button>
                    </div>

                    <div className="mb-3">
                      <p className="text-xs text-[#888888] mb-2">Code</p>
                      <p className="font-mono font-black text-base text-[#0D0D0D] mb-3">{signup.code}</p>

                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(signup.phone);
                          alert("Phone copied!");
                        }}
                        className="text-xs text-[#888888] hover:text-[#0D0D0D] transition"
                      >
                        {signup.phone}
                      </button>
                    </div>

                    <div className="bg-[#F9F9F9] p-4 rounded-lg border-l-4 border-[#0D0D0D]">
                      <p className="text-xs text-[#888888] mb-2">Message Template</p>
                      <p className="text-sm text-[#0D0D0D] leading-relaxed mb-3">
                        {generateReferralMessage(signup.code)}
                      </p>
                      <button
                        onClick={() => {
                          const text = generateReferralMessage(signup.code);
                          navigator.clipboard.writeText(text);
                          alert("Message copied! Send via WhatsApp, then mark as sent.");
                        }}
                        className="w-full px-3 py-2 bg-white border border-[#E8E8E8] text-[#0D0D0D] text-xs font-semibold rounded hover:border-[#0D0D0D] transition-colors"
                      >
                        Copy Message
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-6 bg-[#FAFAFA] text-center">
                <p className="text-sm text-[#888888]">No pending signups. All caught up!</p>
              </div>
            )}
          </div>

          {/* Sent Signups - Collapsed */}
          <div className="border border-[#E8E8E8] rounded-lg overflow-hidden">
            <button
              onClick={() => setSentHistoryExpanded(!sentHistoryExpanded)}
              className="w-full text-left p-6 bg-white hover:bg-[#F9F9F9] transition-colors border-b border-[#E8E8E8] flex items-center justify-between"
            >
              <div>
                <p className="text-sm font-semibold text-[#0D0D0D]">Sent History</p>
                <p className="text-xs text-[#888888] mt-1">{referrals.sent.length} completed</p>
              </div>
              <div className="text-xl text-[#0D0D0D]">{sentHistoryExpanded ? "−" : "+"}</div>
            </button>

            {sentHistoryExpanded && referrals.sent.length > 0 && (
              <div className="divide-y divide-[#E8E8E8]">
                {referrals.sent.map((signup) => (
                  <div key={signup.id} className="p-6 bg-white hover:bg-[#F9F9F9] transition-colors text-xs">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-semibold text-[#0D0D0D]">{signup.name}</p>
                        <p className="text-[#888888] mt-1">{signup.office} • {signup.city}</p>
                        <p className="text-[#CCCCCC] mt-2">
                          {signup.sentAt ? new Date(signup.sentAt).toLocaleDateString() : "N/A"}
                        </p>
                      </div>
                      <p className="font-mono font-black text-[#0D0D0D]">{signup.code}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
