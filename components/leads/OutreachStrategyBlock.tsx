"use client";

interface OutreachStrategyBlockProps {
  primaryAngle?: string;
  primaryHook?: string;
  secondaryAngle?: string;
  secondaryHook?: string;
  reasoning?: string;
}

export function OutreachStrategyBlock({
  primaryAngle,
  primaryHook,
  secondaryAngle,
  secondaryHook,
  reasoning,
}: OutreachStrategyBlockProps) {
  return (
    <div className="bg-purple-50 border-l-4 border-purple-400 p-3 rounded-lg space-y-3">
      <div>
        <div className="text-xs font-medium text-gray-600 mb-1">Primary Angle</div>
        <div className="text-sm font-semibold text-gray-900">
          {primaryAngle || "(Not determined)"}
        </div>
        {primaryHook && (
          <div className="text-xs text-gray-700 mt-1 italic">
            "{primaryHook}"
          </div>
        )}
      </div>

      {secondaryAngle && (
        <div className="pt-2 border-t border-purple-200">
          <div className="text-xs font-medium text-gray-600 mb-1">
            Secondary Angle
          </div>
          <div className="text-sm text-gray-900">{secondaryAngle}</div>
          {secondaryHook && (
            <div className="text-xs text-gray-700 mt-1 italic">
              "{secondaryHook}"
            </div>
          )}
        </div>
      )}

      {reasoning && (
        <div className="pt-2 border-t border-purple-200">
          <div className="text-xs font-medium text-gray-600 mb-1">Reasoning</div>
          <div className="text-xs text-gray-700">{reasoning}</div>
        </div>
      )}
    </div>
  );
}
