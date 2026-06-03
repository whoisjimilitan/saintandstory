"use client";

import { useState } from "react";

interface FeedbackButtonsProps {
  slug: string;
}

export function FeedbackButtons({ slug }: FeedbackButtonsProps) {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleFeedback(feedbackType: "yes" | "partly" | "no") {
    setLoading(true);

    try {
      const response = await fetch("/api/prospect-feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slug,
          feedbackType,
          referrer: "direct",
          userAgent: typeof navigator !== "undefined" ? navigator.userAgent : undefined,
        }),
      });

      if (response.ok) {
        setSubmitted(true);
        // Reset after 3 seconds
        setTimeout(() => setSubmitted(false), 3000);
      }
    } catch (error) {
      console.error("Error submitting feedback:", error);
    } finally {
      setLoading(false);
    }
  }

  if (submitted) {
    return (
      <div className="text-center py-6">
        <p className="text-[#0D0D0D] font-semibold">Thank you for the feedback.</p>
        <p className="text-[#888888] text-sm mt-1">It helps us understand what matters.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-[#0D0D0D] font-semibold">Was this useful?</p>
      <div className="flex gap-3 flex-wrap">
        <button
          onClick={() => handleFeedback("yes")}
          disabled={loading}
          className="flex-1 min-w-[140px] px-4 py-3 bg-[#0D0D0D] hover:bg-[#333333] text-white font-semibold rounded-lg text-sm transition-colors disabled:opacity-50"
        >
          Yes, reflects our operation
        </button>
        <button
          onClick={() => handleFeedback("partly")}
          disabled={loading}
          className="flex-1 min-w-[100px] px-4 py-3 bg-[#F5F5F5] hover:bg-[#E8E8E8] text-[#0D0D0D] font-semibold rounded-lg text-sm transition-colors border border-[#E8E8E8] disabled:opacity-50"
        >
          Partly
        </button>
        <button
          onClick={() => handleFeedback("no")}
          disabled={loading}
          className="flex-1 min-w-[100px] px-4 py-3 bg-[#F5F5F5] hover:bg-[#E8E8E8] text-[#0D0D0D] font-semibold rounded-lg text-sm transition-colors border border-[#E8E8E8] disabled:opacity-50"
        >
          Not really
        </button>
      </div>
      <p className="text-[#888888] text-xs">Feedback helps improve our movement detection.</p>
    </div>
  );
}
