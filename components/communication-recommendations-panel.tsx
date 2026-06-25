"use client";

import { useState } from "react";

export interface CommunicationRecommendation {
  rank: 1 | 2 | 3;
  formulation: {
    name: string;
    displayName: string;
    description: string;
    fitScore: number;
    qualityPercentile: number;
  };
  email?: {
    fullBody: string;
    trustValidation: {
      trustScore: number;
      isValid: boolean;
      criticalIssues: string[];
    };
    recommendation: "approve" | "rewrite" | "reject";
  };
  preview?: string;
}

interface Props {
  prospectName: string;
  recommendations: CommunicationRecommendation[];
  onSelect: (recommendation: CommunicationRecommendation) => void;
  onApprove: (recommendation: CommunicationRecommendation) => void;
}

export function CommunicationRecommendationsPanel({
  prospectName,
  recommendations,
  onSelect,
  onApprove,
}: Props) {
  const [selectedRank, setSelectedRank] = useState<1 | 2 | 3>(1);
  const [editMode, setEditMode] = useState(false);
  const [editedBody, setEditedBody] = useState("");

  const selected = recommendations.find((r) => r.rank === selectedRank);

  return (
    <div className="bg-white border-l border-[#E63946]/20 p-6 h-full overflow-y-auto">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-lg font-bold text-[#1D3557]">{prospectName}</h2>
        <p className="text-sm text-[#457B9D] mt-1">
          Communication Recommendations (3-Layer Architecture)
        </p>
      </div>

      {/* Recommendation Tabs */}
      <div className="flex gap-2 mb-6 pb-4 border-b border-[#E63946]/10">
        {recommendations.map((rec) => (
          <button
            key={rec.rank}
            onClick={() => {
              setSelectedRank(rec.rank);
              setEditMode(false);
            }}
            className={`px-3 py-2 rounded text-sm font-medium transition ${
              selectedRank === rec.rank
                ? "bg-[#1D3557] text-white"
                : "bg-[#F1FAEE] text-[#1D3557] hover:bg-[#E63946]/10"
            }`}
          >
            <div className="flex items-center gap-2">
              <span>#{rec.rank}</span>
              <span className="text-xs font-normal">
                {rec.rank === 1 ? "Recommended" : "Alternative"}
              </span>
            </div>
            <div className="text-xs font-normal mt-1">
              Fit: {rec.formulation.fitScore}% | Quality: {rec.formulation.qualityPercentile}%
            </div>
          </button>
        ))}
      </div>

      {/* Selected Recommendation Details */}
      {selected && (
        <div className="space-y-4">
          {/* Formulation Info */}
          <div className="bg-[#F1FAEE] p-4 rounded">
            <h3 className="font-bold text-[#1D3557]">{selected.formulation.displayName}</h3>
            <p className="text-sm text-[#457B9D] mt-2">{selected.formulation.description}</p>
            <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
              <div className="bg-white p-2 rounded">
                <span className="text-[#457B9D]">Fit Score</span>
                <p className="font-bold text-[#1D3557]">{selected.formulation.fitScore}%</p>
              </div>
              <div className="bg-white p-2 rounded">
                <span className="text-[#457B9D]">Quality</span>
                <p className="font-bold text-[#1D3557]">{selected.formulation.qualityPercentile}%</p>
              </div>
            </div>
          </div>

          {/* Trust Validation (for #1) */}
          {selected.rank === 1 && selected.email && (
            <div className="bg-[#E8F4F8] border-l-4 border-[#457B9D] p-4 rounded">
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-bold text-[#1D3557] text-sm">Trust Validation</h4>
                  <p className="text-sm text-[#457B9D] mt-1">
                    Score: {selected.email.trustValidation.trustScore}/100
                  </p>
                </div>
                <div
                  className={`px-3 py-1 rounded text-xs font-bold ${
                    selected.email.trustValidation.isValid
                      ? "bg-green-100 text-green-700"
                      : "bg-yellow-100 text-yellow-700"
                  }`}
                >
                  {selected.email.trustValidation.isValid ? "✓ PASS" : "⚠ REVIEW"}
                </div>
              </div>

              {selected.email.trustValidation.criticalIssues.length > 0 && (
                <div className="mt-3 space-y-1">
                  <p className="text-xs font-bold text-[#E63946]">Issues Found:</p>
                  <ul className="text-xs text-[#E63946] space-y-1 ml-4">
                    {selected.email.trustValidation.criticalIssues.map((issue, idx) => (
                      <li key={idx}>• {issue}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Email Body */}
          {selected.rank === 1 && selected.email && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-[#1D3557] text-sm">Email Body</h4>
                <button
                  onClick={() => {
                    setEditMode(!editMode);
                    if (!editMode) setEditedBody(selected.email!.fullBody);
                  }}
                  className="text-xs px-2 py-1 bg-[#457B9D] text-white rounded hover:bg-[#1D3557]"
                >
                  {editMode ? "Done Editing" : "Edit"}
                </button>
              </div>

              {editMode ? (
                <textarea
                  value={editedBody}
                  onChange={(e) => setEditedBody(e.target.value)}
                  className="w-full h-64 p-3 border border-[#457B9D] rounded font-mono text-sm"
                />
              ) : (
                <div className="bg-[#F1FAEE] p-4 rounded whitespace-pre-wrap text-sm text-[#1D3557] font-mono max-h-64 overflow-y-auto border border-[#E63946]/10">
                  {selected.email.fullBody}
                </div>
              )}
            </div>
          )}

          {/* Preview for #2, #3 */}
          {selected.rank !== 1 && selected.preview && (
            <div className="bg-[#F1FAEE] p-4 rounded text-sm text-[#457B9D]">
              {selected.preview}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2 pt-4 border-t border-[#E63946]/10">
            {selected.rank === 1 ? (
              <>
                <button
                  onClick={() => onApprove(selected)}
                  disabled={!selected.email?.trustValidation.isValid}
                  className="flex-1 px-4 py-2 bg-[#06D6A0] text-white rounded font-bold hover:bg-[#059669] disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  Send Email
                </button>
                {editMode && (
                  <button
                    onClick={() => {
                      onApprove({
                        ...selected,
                        email: {
                          ...selected.email!,
                          fullBody: editedBody,
                        },
                      });
                      setEditMode(false);
                    }}
                    className="flex-1 px-4 py-2 bg-[#457B9D] text-white rounded font-bold hover:bg-[#1D3557]"
                  >
                    Send Edited
                  </button>
                )}
              </>
            ) : (
              <button
                onClick={() => onSelect(selected)}
                className="flex-1 px-4 py-2 bg-[#457B9D] text-white rounded font-bold hover:bg-[#1D3557]"
              >
                Use This Approach
              </button>
            )}
            <button
              onClick={() => setSelectedRank(1)}
              className="px-4 py-2 border border-[#E63946] text-[#E63946] rounded font-bold hover:bg-[#E63946]/10"
            >
              Back to #1
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
