"use client";

import { useEffect, useState } from "react";
import CTAButton from "@/components/landing/CTAButton";

interface ConversationPhase {
  phaseNumber: number;
  phaseName: string;
  frame: string;
  content: string;
  characterCount: number;
  charLimit: number;
}

interface ConversationEngineProps {
  industry: string;
  company: string;
  city: string;
  onCTAClick?: () => void;
}

export default function ConversationEngine({
  industry,
  company,
  city,
  onCTAClick,
}: ConversationEngineProps) {
  const [phases, setPhases] = useState<ConversationPhase[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedPhase, setExpandedPhase] = useState<number | null>(1);

  useEffect(() => {
    const fetchConversation = async () => {
      try {
        const response = await fetch(
          `/api/dev/conversation-builder?industry=${industry}&company=${encodeURIComponent(company)}&city=${encodeURIComponent(city)}`
        );

        if (!response.ok) {
          throw new Error("Failed to generate conversation");
        }

        const data = await response.json();
        setPhases(data.conversation.phases);
        setError(null);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load conversation"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchConversation();
  }, [industry, company, city]);

  const handleCTA = () => {
    if (onCTAClick) {
      onCTAClick();
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F5F5F5] py-12 px-4">
        <div className="max-w-2xl mx-auto">
          <p className="text-sm text-[#888888]">Loading conversation...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#F5F5F5] py-12 px-4">
        <div className="max-w-2xl mx-auto">
          <p className="text-sm text-red-600">Error: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F5F5] py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <p className="text-[10px] uppercase tracking-[0.1em] text-[#888888] font-semibold mb-3">
            Conversation Framework
          </p>
          <h1 className="font-black text-lg text-[#0D0D0D]">
            Let's map this out together
          </h1>
          <p className="text-xs text-[#888888] mt-2">
            This conversation continues from your email. We'll walk through what
            ownership looks like for {company}.
          </p>
        </div>

        {/* Conversation Phases */}
        <div className="space-y-4">
          {phases.map((phase) => (
            <button
              key={phase.phaseNumber}
              onClick={() =>
                setExpandedPhase(
                  expandedPhase === phase.phaseNumber ? null : phase.phaseNumber
                )
              }
              className="w-full text-left bg-white rounded-2xl p-5 border border-[#E8E8E8] hover:border-[#0D0D0D] transition-colors focus:outline-none focus:ring-2 focus:ring-[#0D0D0D] focus:ring-offset-2"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-[10px] uppercase tracking-[0.1em] text-[#888888] font-semibold mb-1">
                    Phase {phase.phaseNumber}
                  </p>
                  <p className="font-semibold text-sm text-[#0D0D0D]">
                    {phase.phaseName}
                  </p>
                </div>
                <span className="text-[10px] text-[#888888] ml-4">
                  {phase.characterCount}/{phase.charLimit}
                </span>
              </div>

              {expandedPhase === phase.phaseNumber && (
                <div className="mt-4 pt-4 border-t border-[#E8E8E8]">
                  <p className="text-sm text-[#0D0D0D] leading-relaxed">
                    {phase.content}
                  </p>
                  <p className="text-[10px] text-[#888888] mt-3">
                    Frame: <span className="font-semibold">{phase.frame}</span>
                  </p>
                </div>
              )}
            </button>
          ))}
        </div>

        <div className="mt-8" />

        {/* Single CTA */}
        <div className="bg-white rounded-2xl p-5 border border-[#E8E8E8]">
          <p className="text-[10px] uppercase tracking-[0.1em] text-[#888888] font-semibold mb-3">
            Next Step
          </p>
          <p className="text-sm text-[#0D0D0D] mb-4">
            Ready to map out what operational ownership looks like for{" "}
            {company}? Let's schedule a 20-minute walkthrough.
          </p>
          <CTAButton
            label="Schedule the walkthrough"
            onClick={handleCTA}
            fullWidth={true}
            showIcon={true}
          />
        </div>

        {/* Footer */}
        <p className="text-[10px] text-[#888888] text-center mt-6 italic">
          (This continues from your email and landing page. Just next steps.)
        </p>
      </div>
    </div>
  );
}
