'use client';

import type { ValidationIntelligence } from "@/lib/validation-intelligence";

interface Props {
  validation: ValidationIntelligence;
}

export function FrictionValidationPanel({ validation }: Props) {
  const getConfidenceColor = (score: number) => {
    if (score >= 80) {
      return { bg: "#E8F5E9", text: "#1B5E20", label: "Confirmed" };
    } else if (score >= 60) {
      return { bg: "#FFF8E5", text: "#CC6600", label: "Emerging" };
    } else if (score >= 40) {
      return { bg: "#FFE5CC", text: "#CC5500", label: "Weak" };
    } else {
      return { bg: "#FFE5E5", text: "#CC0000", label: "None" };
    }
  };

  const getStatusBadgeColor = (status: string) => {
    if (status === 'confirmed_reality') {
      return { bg: "#E8F5E9", text: "#1B5E20" };
    } else if (status === 'emerging_truth') {
      return { bg: "#FFF8E5", text: "#CC6600" };
    }
    return { bg: "#FFE5E5", text: "#CC0000" };
  };

  const problemColor = getConfidenceColor(validation.problem_validation_confidence);
  const solutionColor = getConfidenceColor(validation.solution_validation_confidence);
  const problemStatusColor = getStatusBadgeColor(validation.problem_status);
  const solutionStatusColor = getStatusBadgeColor(validation.solution_status);

  return (
    <div className="bg-white border border-[#E8E8E8] rounded p-8 space-y-8">
      {/* HEADER */}
      <div>
        <h3 className="text-sm font-semibold text-[#0D0D0D] mb-4">
          VALIDATION INTELLIGENCE
        </h3>
        <p className="text-[10px] text-[#888888]">
          Evidence that confirms (or refutes) our diagnosis
        </p>
      </div>

      <div className="border-t border-[#E8E8E8]"></div>

      {/* PROBLEM VALIDATION */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-sm font-semibold text-[#0D0D0D]">
            PROBLEM VALIDATION
          </h4>
          <span
            className="text-[10px] font-semibold uppercase tracking-[0.05em] px-3 py-1 rounded"
            style={{
              backgroundColor: problemColor.bg,
              color: problemColor.text
            }}
          >
            {problemColor.label}
          </span>
        </div>

        <p className="text-[10px] text-[#888888] mb-4">
          Do they actually have the problem we diagnosed?
        </p>

        {/* Confidence Score */}
        <div className="bg-[#F5F5F5] border border-[#E8E8E8] rounded p-4 mb-4">
          <div className="flex items-center justify-between mb-3">
            <p className="text-[10px] font-semibold text-[#888888] uppercase tracking-[0.05em]">
              Confidence Score
            </p>
            <p className="text-2xl font-black text-[#0D0D0D]">
              {validation.problem_validation_confidence}%
            </p>
          </div>
          <div className="w-full bg-[#E8E8E8] rounded h-2 overflow-hidden">
            <div
              className="h-full bg-[#0D0D0D]"
              style={{
                width: `${validation.problem_validation_confidence}%`
              }}
            />
          </div>
          <p className="text-[10px] text-[#666666] mt-2">
            Evidence Level: <span className="font-semibold">{validation.problem_evidence_level}</span> •{" "}
            <span
              style={{
                color: problemStatusColor.text,
                fontWeight: 600
              }}
            >
              {validation.problem_status.replace(/_/g, " ")}
            </span>
          </p>
        </div>

        {/* Evidence breakdown */}
        <div className="space-y-2">
          <div className="flex items-center justify-between p-2 text-[10px]">
            <span className="text-[#666666]">Opened email</span>
            <span className={validation.problem_evidence.opened ? "text-[#1B5E20] font-semibold" : "text-[#999999]"}>
              {validation.problem_evidence.opened ? "✓" : "—"}
            </span>
          </div>
          <div className="flex items-center justify-between p-2 text-[10px]">
            <span className="text-[#666666]">Clicked content ({validation.problem_evidence.clicked_count}x)</span>
            <span className={validation.problem_evidence.clicked ? "text-[#1B5E20] font-semibold" : "text-[#999999]"}>
              {validation.problem_evidence.clicked ? "✓" : "—"}
            </span>
          </div>
          <div className="flex items-center justify-between p-2 text-[10px]">
            <span className="text-[#666666]">Replied to email</span>
            <span className={validation.problem_evidence.replied ? "text-[#1B5E20] font-semibold" : "text-[#999999]"}>
              {validation.problem_evidence.replied ? "✓" : "—"}
            </span>
          </div>
          <div className="flex items-center justify-between p-2 text-[10px]">
            <span className="text-[#666666]">Confirmed issue in reply</span>
            <span className={validation.problem_evidence.confirmed_issue_in_reply ? "text-[#1B5E20] font-semibold" : "text-[#999999]"}>
              {validation.problem_evidence.confirmed_issue_in_reply ? "✓" : "—"}
            </span>
          </div>
          <div className="flex items-center justify-between p-2 text-[10px]">
            <span className="text-[#666666]">Discussed on call</span>
            <span className={validation.problem_evidence.discussed_on_call ? "text-[#1B5E20] font-semibold" : "text-[#999999]"}>
              {validation.problem_evidence.discussed_on_call ? "✓" : "—"}
            </span>
          </div>
        </div>
      </div>

      <div className="border-t border-[#E8E8E8]"></div>

      {/* SOLUTION VALIDATION */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-sm font-semibold text-[#0D0D0D]">
            SOLUTION VALIDATION
          </h4>
          <span
            className="text-[10px] font-semibold uppercase tracking-[0.05em] px-3 py-1 rounded"
            style={{
              backgroundColor: solutionColor.bg,
              color: solutionColor.text
            }}
          >
            {solutionColor.label}
          </span>
        </div>

        <p className="text-[10px] text-[#888888] mb-4">
          Do they believe Saint & Story can solve it?
        </p>

        {/* Confidence Score */}
        <div className="bg-[#F5F5F5] border border-[#E8E8E8] rounded p-4 mb-4">
          <div className="flex items-center justify-between mb-3">
            <p className="text-[10px] font-semibold text-[#888888] uppercase tracking-[0.05em]">
              Confidence Score
            </p>
            <p className="text-2xl font-black text-[#0D0D0D]">
              {validation.solution_validation_confidence}%
            </p>
          </div>
          <div className="w-full bg-[#E8E8E8] rounded h-2 overflow-hidden">
            <div
              className="h-full bg-[#0D0D0D]"
              style={{
                width: `${validation.solution_validation_confidence}%`
              }}
            />
          </div>
          <p className="text-[10px] text-[#666666] mt-2">
            Evidence Level: <span className="font-semibold">{validation.solution_evidence_level}</span> •{" "}
            <span
              style={{
                color: solutionStatusColor.text,
                fontWeight: 600
              }}
            >
              {validation.solution_status.replace(/_/g, " ")}
            </span>
          </p>
        </div>

        {/* Evidence breakdown */}
        <div className="space-y-2">
          <div className="flex items-center justify-between p-2 text-[10px]">
            <span className="text-[#666666]">Requested details</span>
            <span className={validation.solution_evidence.requested_details ? "text-[#1B5E20] font-semibold" : "text-[#999999]"}>
              {validation.solution_evidence.requested_details ? "✓" : "—"}
            </span>
          </div>
          <div className="flex items-center justify-between p-2 text-[10px]">
            <span className="text-[#666666]">Asked how it works</span>
            <span className={validation.solution_evidence.asked_how_it_works ? "text-[#1B5E20] font-semibold" : "text-[#999999]"}>
              {validation.solution_evidence.asked_how_it_works ? "✓" : "—"}
            </span>
          </div>
          <div className="flex items-center justify-between p-2 text-[10px]">
            <span className="text-[#666666]">Booked call</span>
            <span className={validation.solution_evidence.booked_call ? "text-[#1B5E20] font-semibold" : "text-[#999999]"}>
              {validation.solution_evidence.booked_call ? "✓" : "—"}
            </span>
          </div>
          <div className="flex items-center justify-between p-2 text-[10px]">
            <span className="text-[#666666]">Requested pricing</span>
            <span className={validation.solution_evidence.requested_pricing ? "text-[#1B5E20] font-semibold" : "text-[#999999]"}>
              {validation.solution_evidence.requested_pricing ? "✓" : "—"}
            </span>
          </div>
          <div className="flex items-center justify-between p-2 text-[10px]">
            <span className="text-[#666666]">Became customer</span>
            <span className={validation.solution_evidence.became_customer ? "text-[#1B5E20] font-semibold" : "text-[#999999]"}>
              {validation.solution_evidence.became_customer ? "✓" : "—"}
            </span>
          </div>
        </div>
      </div>

      <div className="border-t border-[#E8E8E8]"></div>

      {/* READINESS */}
      <div>
        <h4 className="text-[10px] font-semibold text-[#888888] uppercase tracking-[0.05em] mb-4">
          Readiness for Learning
        </h4>
        <div className="grid grid-cols-2 gap-4">
          <div
            className={`p-4 rounded border ${
              validation.is_pattern_ready
                ? "bg-[#E8F5E9] border-[#C8E6C9]"
                : "bg-[#F5F5F5] border-[#E8E8E8]"
            }`}
          >
            <p className="text-[10px] font-semibold text-[#666666] uppercase mb-2">
              Pattern Learning
            </p>
            <p className={`text-sm font-semibold ${validation.is_pattern_ready ? "text-[#1B5E20]" : "text-[#999999]"}`}>
              {validation.is_pattern_ready ? "Ready" : "Not Ready"}
            </p>
            <p className="text-[10px] text-[#666666] mt-1">
              Requires problem validation ≥ 60%
            </p>
          </div>

          <div
            className={`p-4 rounded border ${
              validation.is_commercial_ready
                ? "bg-[#E8F5E9] border-[#C8E6C9]"
                : "bg-[#F5F5F5] border-[#E8E8E8]"
            }`}
          >
            <p className="text-[10px] font-semibold text-[#666666] uppercase mb-2">
              Commercial Learning
            </p>
            <p className={`text-sm font-semibold ${validation.is_commercial_ready ? "text-[#1B5E20]" : "text-[#999999]"}`}>
              {validation.is_commercial_ready ? "Ready" : "Not Ready"}
            </p>
            <p className="text-[10px] text-[#666666] mt-1">
              Requires both validations ≥ 60%
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
