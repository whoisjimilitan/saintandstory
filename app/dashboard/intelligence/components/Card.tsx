import { ReactNode } from "react";

interface CardProps {
  children: ReactNode;
  className?: string;
}

export function Card({ children, className = "" }: CardProps) {
  return (
    <div className={`bg-white border border-[#E8E8E8] rounded-2xl ${className}`}>
      {children}
    </div>
  );
}
