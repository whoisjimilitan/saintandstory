'use client';

import type { FrictionValidation } from "@/lib/friction-intelligence";

interface Props {
  validation: FrictionValidation;
}

export function FrictionValidationPanel({ validation }: Props) {
  const getValidationColor = (score: number) => {
    if (score >= 80) {
      return { bg: "#E8F5E9", text: "#1B5E20", label: "Validated" };
    } else if (score >= 60) {
      return { bg: "#FFF8E5", text: "#CC6600", label: "Likely Real" };
    } else if (score >= 40) {
      return { bg: "#FFE5CC", text: "#CC5500", label: "Uncertain" };
    } else {
      return { bg: "#FFE5E5", text: "#CC0000", label: "Unvalidated" };
    }
  };

  const sentimentLabels = {
    confirmed: "They confirmed this is the issue",
    refined: "They corrected our understanding",
    rejected: "They said this isn't the issue",
    unknown: "Validation status unknown"
  };

  const color = getValidationColor(validation.friction_validation_score);

  return (
    <div className="bg-white border border-[#E8E8E8] rounded p-8 space-y-8">
      {/* HEADER */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-[#0D0D0D]">
            FRICTION VALIDATION
          </h3>
          <span
            className="text-[10px] font-semibold uppercase tracking-[0.05em] px-3 py-1 rounded"
            style={{ backgroundColor: color.bg, color: color.text }}
          >
            {color.label}
          </span>
        </div>
        <p className="text-[10px] text-[#888888]">
          {validation.friction_validation_score}% confidence this friction is real
        </p>
      </div>

      <div className="border-t border-[#E8E8E8]"></div>

      {/* DIAGNOSED FRICTION */}
      <div>
        <h4 className="text-[10px] font-semibold text-[#888888] uppercase tracking-[0.05em] mb-2">
          Diagnosed Friction
        </h4>
        <p className="text-base font-semibold text-[#0D0D0D]">
          {validation.diagnosed_friction}
        </p>
      </div>

      {/* VALIDATION SCORE EXPLANATION */}
      <div className="bg-[#F5F5F5] border border-[#E8E8E8] rounded p-4">
        <p className="text-[10px] font-semibold text-[#888888] uppercase tracking-[0.05em] mb-3">
          What this score means
        </p>
        <div className="space-y-2 text-sm text-[#333333]">
          {validation.friction_validation_score >= 80 && (
            <p>✓ This friction is validated. They engaged strongly with this diagnosis.</p>
          )}
          {validation.friction_validation_score >= 60 && validation.friction_validation_score < 80 && (
            <p>◐ This friction is likely real. They showed interest but haven't fully confirmed.</p>
          )}
          {validation.friction_validation_score >= 40 && validation.friction_validation_score < 60 && (
            <p>~ Uncertain if this is the right friction. Some engagement but not conclusive.</p>
          )}
          {validation.friction_validation_score < 40 && (
            <p>✗ This friction diagnosis is probably wrong. Minimal engagement despite outreach.</p>
          )}
        </div>
      </div>

      {/* ENGAGEMENT SIGNALS */}
      <div>
        <h4 className="text-[10px] font-semibold text-[#888888] uppercase tracking-[0.05em] mb-4">
          Engagement Signals
        </h4>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-[#F5F5F5] rounded">
            <span className="text-sm text-[#333333]">Opened email</span>
            <span className={`text-sm font-semibold ${validation.opened ? "text-[#1B5E20]" : "text-[#CC0000]"}`}>
              {validation.opened ? "Yes" : "No"}
            </span>
          </div>
          <div className="flex items-center justify-between p-3 bg-[#F5F5F5] rounded">
            <span className="text-sm text-[#333333]">Clicked related content</span>
            <span className={`text-sm font-semibold ${validation.clicked ? "text-[#1B5E20]" : "text-[#CC0000]"}`}>
              {validation.clicked ? "Yes" : "No"}
            </span>
          </div>
          <div className="flex items-center justify-between p-3 bg-[#F5F5F5] rounded">
            <span className="text-sm text-[#333333]">Replied to email</span>
            <span className={`text-sm font-semibold ${validation.replied ? "text-[#1B5E20]" : "text-[#888888]"}`}>
              {validation.replied ? "Yes" : "No"}
            </span>
          </div>
          <div className="flex items-center justify-between p-3 bg-[#F5F5F5] rounded">
            <span className="text-sm text-[#333333]">Scheduled meeting</span>
            <span className={`text-sm font-semibold ${validation.meeting_scheduled ? "text-[#1B5E20]" : "text-[#888888]"}`}>
              {validation.meeting_scheduled ? "Yes" : "No"}
            </span>
          </div>
          <div className="flex items-center justify-between p-3 bg-[#F5F5F5] rounded">
            <span className="text-sm text-[#333333]">Became job</span>
            <span className={`text-sm font-semibold ${validation.became_job ? "text-[#1B5E20]" : "text-[#888888]"}`}>
              {validation.became_job ? "Yes" : "No"}
            </span>
          </div>
        </div>
      </div>

      <div className="border-t border-[#E8E8E8]"></div>

      {/* SENTIMENT */}
      {validation.friction_sentiment !== 'unknown' && (
        <div>
          <h4 className="text-[10px] font-semibold text-[#888888] uppercase tracking-[0.05em] mb-2">
            What they said
          </h4>
          <p className="text-sm text-[#333333]">
            {sentimentLabels[validation.friction_sentiment]}
          </p>
          {validation.friction_refinement && (
            <p className="text-sm text-[#0D0D0D] font-semibold mt-2">
              "{validation.friction_refinement}"
            </p>
          )}
        </div>
      )}

      {/* RECOMMENDATION */}
      {validation.is_validated ? (
        <div className="bg-[#E8F5E9] border border-[#C8E6C9] rounded p-4">
          <p className="text-[10px] font-semibold text-[#1B5E20] uppercase tracking-[0.05em] mb-2">
            Next Step
          </p>
          <p className="text-sm text-[#1B5E20]">
            This friction is validated. Proceed with solution discussion.
          </p>
        </div>
      ) : (
        <div className="bg-[#FFE5E5] border border-[#FFCCCC] rounded p-4">
          <p className="text-[10px] font-semibold text-[#CC0000] uppercase tracking-[0.05em] mb-2">
            Caution
          </p>
          <p className="text-sm text-[#CC0000]">
            This friction diagnosis is unvalidated. Ask clarifying questions before proposing solutions.
          </p>
        </div>
      )}
    </div>
  );
}
