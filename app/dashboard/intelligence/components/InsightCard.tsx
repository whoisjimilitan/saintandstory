import { ReactNode } from "react";

interface InsightCardProps {
  title: string;
  value: ReactNode;
  description?: string;
  icon?: ReactNode;
  variant?: "default" | "highlight" | "critical";
}

const variantStyles = {
  default: "border-[#E8E8E8] bg-white",
  highlight: "border-[#10b981] bg-green-50",
  critical: "border-[#EF4444] bg-red-50",
};

export function InsightCard({
  title,
  value,
  description,
  icon,
  variant = "default",
}: InsightCardProps) {
  return (
    <div className={`border rounded-2xl p-6 ${variantStyles[variant]}`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-[10px] font-semibold text-[#888888] uppercase tracking-[0.2em] mb-2">
            {title}
          </p>
          <div className="text-2xl font-bold text-[#0D0D0D]">
            {value}
          </div>
          {description && (
            <p className="text-sm text-[#888888] mt-2">
              {description}
            </p>
          )}
        </div>
        {icon && (
          <div className="ml-4">
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}
