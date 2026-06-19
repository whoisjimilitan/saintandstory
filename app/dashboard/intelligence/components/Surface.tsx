import { ReactNode } from "react";

interface SurfaceProps {
  children: ReactNode;
  className?: string;
}

export function Surface({ children, className = "" }: SurfaceProps) {
  return (
    <div className={`bg-white rounded-2xl border border-[#E8E8E8] p-6 ${className}`}>
      {children}
    </div>
  );
}
