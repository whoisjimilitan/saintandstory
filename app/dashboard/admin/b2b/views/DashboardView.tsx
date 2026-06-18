"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface Prospect {
  id: string;
  businessName: string;
  businessCategory: string;
  email: string;
  status: string;
}

export function DashboardView() {
  const [prospects, setProspects] = useState<Prospect[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function fetchProspects() {
      try {
        const response = await fetch("/api/b2b/prospects");
        if (response.ok) {
          const data = await response.json();
          setProspects(data.prospects || []);
        }
      } catch (error) {
        console.error("Failed to fetch prospects:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchProspects();
  }, []);

  if (loading) {
    return <div className="p-6">Loading...</div>;
  }

  const hot = prospects.filter((p) => p.status === "warm");
  const warm = prospects.filter((p) => p.status === "contacted");
  const cold = prospects.filter((p) => p.status === "new");

  const selectProspect = (prospect: Prospect) => {
    // This will be handled by the layout's context panel
    // For now, we'll just navigate to show the prospect
    router.push(`/dashboard/admin/b2b?module=dashboard&prospect=${prospect.id}`);
  };

  return (
    <div className="flex-1 p-8 overflow-auto">
      <div className="max-w-3xl">
        {/* HOT REPLIES */}
        {hot.length > 0 && (
          <div className="mb-8">
            <p className="text-xs font-semibold text-[#0D0D0D] mb-4 uppercase tracking-wider">
              🔥 Hot Replies
            </p>
            <div className="space-y-2">
              {hot.map((prospect) => (
                <div
                  key={prospect.id}
                  onClick={() => selectProspect(prospect)}
                  className="bg-white border border-[#E8E8E8] rounded-lg p-4 cursor-pointer hover:border-[#0D0D0D] transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-[#0D0D0D]">{prospect.businessName}</p>
                      <p className="text-xs text-[#888888] mt-1">{prospect.email}</p>
                    </div>
                    <span className="text-xs bg-green-500 text-white px-2 py-1 rounded">
                      WARM
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* WARM LEADS */}
        {warm.length > 0 && (
          <div className="mb-8">
            <p className="text-xs font-semibold text-[#0D0D0D] mb-4 uppercase tracking-wider">
              Engaged
            </p>
            <div className="space-y-2">
              {warm.map((prospect) => (
                <div
                  key={prospect.id}
                  onClick={() => selectProspect(prospect)}
                  className="bg-white border border-[#E8E8E8] rounded-lg p-4 cursor-pointer hover:border-[#0D0D0D] transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-[#0D0D0D]">{prospect.businessName}</p>
                      <p className="text-xs text-[#888888] mt-1">{prospect.email}</p>
                    </div>
                    <span className="text-xs bg-[#D1D1D1] text-[#0D0D0D] px-2 py-1 rounded">
                      CONTACTED
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* COLD LEADS */}
        {cold.length > 0 && (
          <div className="mb-8">
            <p className="text-xs font-semibold text-[#0D0D0D] mb-4 uppercase tracking-wider">
              New
            </p>
            <div className="space-y-2">
              {cold.slice(0, 5).map((prospect) => (
                <div
                  key={prospect.id}
                  onClick={() => selectProspect(prospect)}
                  className="bg-white border border-[#E8E8E8] rounded-lg p-4 cursor-pointer hover:border-[#0D0D0D] transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-[#0D0D0D]">{prospect.businessName}</p>
                      <p className="text-xs text-[#888888] mt-1">{prospect.email}</p>
                    </div>
                    <span className="text-xs bg-[#E8E8E8] text-[#888888] px-2 py-1 rounded">
                      NEW
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {prospects.length === 0 && (
          <div className="text-center py-12">
            <p className="text-[#888888]">No prospects yet. Discover businesses to get started.</p>
          </div>
        )}
      </div>
    </div>
  );
}
