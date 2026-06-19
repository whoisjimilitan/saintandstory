import { ReactNode } from "react";

interface EntityCardProps {
  title: string;
  subtitle?: string;
  details?: string[];
  status?: ReactNode;
  actions?: ReactNode;
  onClick?: () => void;
}

export function EntityCard({
  title,
  subtitle,
  details,
  status,
  actions,
  onClick,
}: EntityCardProps) {
  return (
    <div
      className="bg-white border border-[#E8E8E8] rounded-2xl p-5 cursor-pointer hover:border-[#0D0D0D] transition-colors"
      onClick={onClick}
    >
      <div className="space-y-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="font-sans font-bold text-[#0D0D0D] text-base">
              {title}
            </h3>
            {subtitle && (
              <p className="text-[#888888] text-xs mt-1">
                {subtitle}
              </p>
            )}
          </div>
          {status && (
            <div className="ml-4">
              {status}
            </div>
          )}
        </div>

        {details && details.length > 0 && (
          <div className="space-y-1">
            {details.map((detail, i) => (
              <p key={i} className="text-[#888888] text-xs">
                {detail}
              </p>
            ))}
          </div>
        )}

        {actions && (
          <div className="pt-3 border-t border-[#E8E8E8]">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
}
