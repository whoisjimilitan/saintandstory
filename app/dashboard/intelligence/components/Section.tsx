import { ReactNode } from "react";

interface SectionProps {
  title?: string;
  description?: string;
  children: ReactNode;
  className?: string;
}

export function Section({ title, description, children, className = "" }: SectionProps) {
  return (
    <div className={`space-y-4 ${className}`}>
      {title && (
        <div>
          <h2 className="font-sans font-bold text-[#0D0D0D] text-base">
            {title}
          </h2>
          {description && (
            <p className="text-sm text-[#888888] mt-1">
              {description}
            </p>
          )}
        </div>
      )}
      {children}
    </div>
  );
}
