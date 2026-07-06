"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function OperatorPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/operator/discover");
  }, [router]);

  return (
    <div className="flex items-center justify-center h-screen">
      <div className="text-center">
        <div className="w-8 h-8 border-2 border-[#E8E8E8] border-t-[#0D0D0D] rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-sm text-[#666666]">Redirecting to Discover...</p>
      </div>
    </div>
  );
}
