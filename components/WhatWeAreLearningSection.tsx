"use client";

interface PatternInsight {
  pattern_id: string;
  situation: string;
  observed_result: string;
  guidance: string;
  source: string;
}

interface WhatWeAreLearingSectionProps {
  insights: PatternInsight[];
}

export default function WhatWeAreLearningSection({ insights }: WhatWeAreLearingSectionProps) {
  if (!insights || insights.length === 0) {
    return null;
  }

  return (
    <div className="mb-16">
      <p className="text-[10px] font-semibold text-[#888888] uppercase tracking-[0.2em] mb-8">
        What We Are Learning
      </p>

      <div className="space-y-6">
        {insights.map((insight) => (
          <div key={insight.pattern_id} className="border border-[#E8E8E8] rounded px-6 py-6 bg-white">
            <p className="text-xs uppercase tracking-[0.1em] text-[#888888] font-semibold mb-2">
              Situation
            </p>
            <p className="text-sm text-[#0D0D0D] mb-4">
              {insight.situation}
            </p>

            <p className="text-xs uppercase tracking-[0.1em] text-[#888888] font-semibold mb-2">
              What We Observed
            </p>
            <p className="text-sm text-[#0D0D0D] mb-4">
              {insight.observed_result}
            </p>

            <p className="text-xs uppercase tracking-[0.1em] text-[#888888] font-semibold mb-2">
              Next Action
            </p>
            <p className="text-sm text-[#0D0D0D]">
              {insight.guidance}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
