"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AdminAutoRefresh() {
  const router = useRouter();
  useEffect(() => {
    const id = setInterval(() => router.refresh(), 15_000);
    return () => clearInterval(id);
  }, [router]);

  return (
    <div className="flex items-center gap-1.5 mb-6">
      <span className="relative flex h-2 w-2">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
        <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
      </span>
      <span className="text-[10px] text-[#888888] uppercase tracking-[0.15em] font-medium">Live</span>
    </div>
  );
}
