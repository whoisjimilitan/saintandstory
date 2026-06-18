"use client";

import { useEffect, useState } from "react";

interface Lead {
  id: string;
  businessName: string;
  email: string;
  businessCategory: string;
  painPoint: string;
  status: string;
  createdAt: string;
}

export function LeadsView() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    async function fetchLeads() {
      try {
        const response = await fetch("/api/b2b/leads");
        if (response.ok) {
          const data = await response.json();
          setLeads(data.leads || []);
        }
      } catch (error) {
        console.error("Failed to fetch leads:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchLeads();
  }, []);

  const filteredLeads =
    filter === "all" ? leads : leads.filter((lead) => lead.status === filter);

  const statusCounts = {
    all: leads.length,
    new: leads.filter((l) => l.status === "new").length,
    sent: leads.filter((l) => l.status === "sent").length,
    warm: leads.filter((l) => l.status === "warm").length,
    contacted: leads.filter((l) => l.status === "contacted").length,
  };

  if (loading) {
    return (
      <div className="flex-1 px-6 py-10">
        <p className="text-sm text-[#888888]">Loading...</p>
      </div>
    );
  }

  return (
    <div className="flex-1 px-6 py-10 overflow-auto">
      <div className="max-w-4xl space-y-12">
        {/* HEADER */}
        <div>
          <h1 className="text-4xl font-black text-[#0D0D0D] tracking-tight">
            All Leads
          </h1>
          <p className="text-sm text-[#888888] mt-3">
            {leads.length} prospects in system
          </p>
        </div>

        {/* FILTERS */}
        <div className="space-y-3">
          <p className="text-[10px] uppercase tracking-[0.2em] font-medium text-[#0D0D0D]">
            Filter by Status
          </p>
          <div className="flex flex-wrap gap-3">
            {["all", "new", "sent", "warm", "contacted"].map((status) => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`text-sm px-4 py-2 border transition-colors ${
                  filter === status
                    ? "border-[#0D0D0D] text-[#0D0D0D] bg-[#0D0D0D] text-white"
                    : "border-[#E8E8E8] text-[#0D0D0D] hover:border-[#0D0D0D]"
                }`}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)} (
                {statusCounts[status as keyof typeof statusCounts]})
              </button>
            ))}
          </div>
        </div>

        {/* LIST */}
        {filteredLeads.length === 0 ? (
          <p className="text-sm text-[#888888]">No leads found</p>
        ) : (
          <div className="space-y-3">
            {filteredLeads.map((lead) => (
              <div
                key={lead.id}
                className="px-4 py-4 border-l-2 border-[#E8E8E8] hover:border-[#0D0D0D] transition-colors"
              >
                <div className="flex items-baseline justify-between gap-4">
                  <div>
                    <p className="font-medium text-[#0D0D0D]">
                      {lead.businessName}
                    </p>
                    <p className="text-xs text-[#888888] mt-1">
                      {lead.email}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-[#888888]">
                      {lead.businessCategory}
                    </span>
                    <span className="text-[10px] uppercase tracking-[0.2em] text-[#888888]">
                      {lead.status}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
