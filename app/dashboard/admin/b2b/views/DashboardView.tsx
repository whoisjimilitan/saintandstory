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
    return (
      <div className="flex-1 px-6 py-10">
        <p className="text-sm text-[#888888]">Loading...</p>
      </div>
    );
  }

  const hot = prospects.filter((p) => p.status === "warm");
  const warm = prospects.filter((p) => p.status === "contacted");
  const cold = prospects.filter((p) => p.status === "new");

  const selectProspect = (prospect: Prospect) => {
    router.push(`/dashboard/admin/b2b?module=dashboard&prospect=${prospect.id}`);
  };

  return (
    <div className="flex-1 px-6 py-10 overflow-auto">
      <div className="max-w-3xl space-y-16">
        {/* HEADER */}
        <div>
          <h1 className="text-4xl font-black text-[#0D0D0D] tracking-tight">
            All Leads Queue
          </h1>
          <p className="text-sm text-[#888888] mt-3">
            Complete queue of all leads organized by response status. Click a lead to view details or follow up.
          </p>
        </div>

        {/* QUEUE SECTIONS */}

        {hot.length > 0 && (
          <section className="space-y-6">
            <h2 className="text-[10px] uppercase tracking-[0.2em] font-medium text-[#0D0D0D] border-l-4 border-[#0A66C2] pl-3">
              Action Required
            </h2>
            <div className="space-y-4">
              {hot.map((prospect) => (
                <button
                  key={prospect.id}
                  onClick={() => selectProspect(prospect)}
                  className="w-full text-left px-4 py-4 border-l-2 border-[#0A66C2] hover:border-[#0D0D0D] transition-colors"
                >
                  <div className="flex items-baseline justify-between">
                    <p className="font-medium text-[#0D0D0D]">
                      {prospect.businessName}
                    </p>
                    <span className="text-[10px] uppercase tracking-[0.2em] text-[#888888]">
                      warm
                    </span>
                  </div>
                  <p className="text-sm text-[#888888] mt-2">{prospect.email}</p>
                </button>
              ))}
            </div>
          </section>
        )}

        {warm.length > 0 && (
          <section className="space-y-6">
            <h2 className="text-[10px] uppercase tracking-[0.2em] font-medium text-[#0D0D0D] border-l-4 border-[#888888] pl-3">
              Engaged
            </h2>
            <div className="space-y-4">
              {warm.map((prospect) => (
                <button
                  key={prospect.id}
                  onClick={() => selectProspect(prospect)}
                  className="w-full text-left px-4 py-4 border-l-2 border-[#888888] hover:border-[#0D0D0D] transition-colors"
                >
                  <div className="flex items-baseline justify-between">
                    <p className="font-medium text-[#0D0D0D]">
                      {prospect.businessName}
                    </p>
                    <span className="text-[10px] uppercase tracking-[0.2em] text-[#888888]">
                      contacted
                    </span>
                  </div>
                  <p className="text-sm text-[#888888] mt-2">{prospect.email}</p>
                </button>
              ))}
            </div>
          </section>
        )}

        {cold.length > 0 && (
          <section className="space-y-6">
            <h2 className="text-[10px] uppercase tracking-[0.2em] font-medium text-[#0D0D0D] border-l-4 border-[#E8E8E8] pl-3">
              New
            </h2>
            <div className="space-y-4">
              {cold.slice(0, 20).map((prospect) => (
                <button
                  key={prospect.id}
                  onClick={() => selectProspect(prospect)}
                  className="w-full text-left px-4 py-4 border-l-2 border-[#E8E8E8] hover:border-[#0D0D0D] transition-colors"
                >
                  <div className="flex items-baseline justify-between">
                    <p className="font-medium text-[#0D0D0D]">
                      {prospect.businessName}
                    </p>
                    <span className="text-[10px] uppercase tracking-[0.2em] text-[#888888]">
                      new
                    </span>
                  </div>
                  <p className="text-sm text-[#888888] mt-2">{prospect.email}</p>
                </button>
              ))}
            </div>
          </section>
        )}

        {prospects.length === 0 && (
          <div className="text-center py-20">
            <p className="text-sm text-[#888888]">
              No prospects yet. Discover businesses to get started.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
