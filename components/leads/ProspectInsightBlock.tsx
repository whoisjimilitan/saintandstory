"use client";

interface ProspectInsightBlockProps {
  challenges?: string[];
  opportunities?: string[];
  painPoint?: string;
  reviewRating?: number;
}

export function ProspectInsightBlock({
  challenges = [],
  opportunities = [],
  painPoint,
  reviewRating,
}: ProspectInsightBlockProps) {
  return (
    <div className="space-y-3">
      {painPoint && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-3 rounded">
          <div className="text-xs font-medium text-gray-600 mb-1">Pain Point</div>
          <div className="text-sm text-gray-900">{painPoint}</div>
          {reviewRating && (
            <div className="text-xs text-gray-500 mt-1">
              Found in review: {reviewRating.toFixed(1)}⭐
            </div>
          )}
        </div>
      )}

      {challenges.length > 0 && (
        <div>
          <div className="text-xs font-medium text-gray-600 mb-2">
            Likely Challenges
          </div>
          <div className="space-y-1">
            {challenges.slice(0, 3).map((challenge, i) => (
              <div
                key={i}
                className="text-sm bg-red-50 border border-red-100 px-2 py-1 rounded"
              >
                • {challenge}
              </div>
            ))}
          </div>
        </div>
      )}

      {opportunities.length > 0 && (
        <div>
          <div className="text-xs font-medium text-gray-600 mb-2">
            Opportunities
          </div>
          <div className="space-y-1">
            {opportunities.slice(0, 3).map((opp, i) => (
              <div
                key={i}
                className="text-sm bg-green-50 border border-green-100 px-2 py-1 rounded"
              >
                ✓ {opp}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
