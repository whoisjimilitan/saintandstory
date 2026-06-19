import { ReactNode } from "react";

interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: ReactNode;
  action?: ReactNode;
}

export function EmptyState({
  title,
  description,
  icon,
  action,
}: EmptyStateProps) {
  return (
    <div className="bg-white border border-[#E8E8E8] rounded-2xl px-6 py-12 text-center">
      {icon && (
        <div className="mb-4 flex justify-center">
          {icon}
        </div>
      )}
      <h3 className="font-sans font-bold text-[#0D0D0D] text-base">
        {title}
      </h3>
      {description && (
        <p className="text-[#888888] text-sm mt-2">
          {description}
        </p>
      )}
      {action && (
        <div className="mt-6">
          {action}
        </div>
      )}
    </div>
  );
}
