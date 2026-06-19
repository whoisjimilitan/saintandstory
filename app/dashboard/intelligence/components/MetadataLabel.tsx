import { ReactNode } from "react";

interface MetadataLabelProps {
  children: ReactNode;
  className?: string;
}

export function MetadataLabel({ children, className = "" }: MetadataLabelProps) {
  return (
    <p className={`text-[10px] font-semibold text-[#888888] uppercase tracking-[0.2em] ${className}`}>
      {children}
    </p>
  );
}
