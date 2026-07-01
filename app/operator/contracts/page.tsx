"use client";

import { useEffect, useState } from "react";

interface Contract {
  id: string;
  businessName: string;
  contactName: string | null;
  contactEmail: string | null;
  contactPhone: string | null;
  serviceType: string | null;
  frequency: string;
  dayOfWeek: number | null;
  preferredTime: string | null;
  price: string;
  active: boolean;
  createdAt: string;
  lastGeneratedAt: string | null;
  nextScheduledAt: string | null;
}

export default function ContractsPage() {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<"all" | "active" | "inactive">("all");
  const [selectedContract, setSelectedContract] = useState<Contract | null>(null);

  useEffect(() => {
    const fetchContracts = async () => {
      try {
        setLoading(true);
        const res = await fetch("/api/b2b/contracts");
        if (!res.ok) throw new Error("Failed to fetch contracts");

        const data = await res.json();
        setContracts(data.contracts || []);
        console.log("[CONTRACTS] Loaded contracts:", data.contracts?.length);
      } catch (error) {
        console.error("[CONTRACTS] Failed to fetch contracts:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchContracts();
    // Refresh every 30 seconds for live updates
    const interval = setInterval(fetchContracts, 30000);
    return () => clearInterval(interval);
  }, []);

  const filteredContracts =
    filterStatus === "all"
      ? contracts
      : filterStatus === "active"
        ? contracts.filter(c => c.active)
        : contracts.filter(c => !c.active);

  const stats = {
    total: contracts.length,
    active: contracts.filter(c => c.active).length,
    inactive: contracts.filter(c => !c.active).length,
    totalValue: contracts
      .reduce((sum, c) => sum + (parseFloat(c.price) || 0), 0)
      .toLocaleString("en-GB", { style: "currency", currency: "GBP" }),
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "2-digit",
    });
  };

  const getDayName = (dayOfWeek: number | null) => {
    if (dayOfWeek === null) return "N/A";
    const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    return days[dayOfWeek] || "N/A";
  };

  const getFrequencyLabel = (frequency: string) => {
    const labels: Record<string, string> = {
      daily: "Daily",
      weekly: "Weekly",
      biweekly: "Bi-weekly",
      monthly: "Monthly",
    };
    return labels[frequency] || frequency;
  };

  return (
    <div className="min-h-screen bg-white pt-24">
      <div className="max-w-6xl mx-auto px-4 md:px-8">
        {/* Header */}
        <div className="mb-16">
          <h1 className="text-4xl md:text-5xl font-black text-[#0D0D0D] mb-3 tracking-tight leading-tight">
            B2B Contracts
          </h1>
          <p className="text-base text-[#666666] leading-relaxed max-w-3xl font-normal">
            Track all standing orders and ongoing customer relationships. Monitor active contracts and revenue.
          </p>
        </div>

        {/* Stats */}
        <div className="mb-16 pb-12 border-b border-[#E8E8E8]">
          <p className="text-xs font-semibold text-[#0D0D0D] uppercase tracking-widest mb-6">
            Summary
          </p>
          <div className="grid grid-cols-4 gap-12">
            <div>
              <p className="text-xs text-[#888888] uppercase tracking-widest mb-2">Total</p>
              <p className="text-3xl font-black text-[#0D0D0D]">{stats.total}</p>
            </div>
            <div>
              <p className="text-xs text-[#888888] uppercase tracking-widest mb-2">Active</p>
              <p className="text-3xl font-black text-[#0D0D0D]">{stats.active}</p>
            </div>
            <div>
              <p className="text-xs text-[#888888] uppercase tracking-widest mb-2">Inactive</p>
              <p className="text-3xl font-black text-[#0D0D0D]">{stats.inactive}</p>
            </div>
            <div>
              <p className="text-xs text-[#888888] uppercase tracking-widest mb-2">Value</p>
              <p className="text-2xl font-black text-[#0D0D0D]">{stats.totalValue}</p>
            </div>
          </div>
        </div>

        {/* Filter */}
        <div className="mb-16 pb-6 border-b border-[#E8E8E8]">
          <div className="flex gap-3">
            {["all", "active", "inactive"].map(status => (
              <button
                key={status}
                onClick={() =>
                  setFilterStatus(
                    status === "all"
                      ? "all"
                      : status === "active"
                        ? "active"
                        : "inactive"
                  )
                }
                className={`px-4 py-2 rounded text-sm font-semibold transition-colors ${
                  filterStatus === status
                    ? "bg-[#0D0D0D] text-white"
                    : "bg-[#F9F9F9] text-[#0D0D0D] hover:bg-[#E8E8E8]"
                }`}
              >
                {status === "all" ? "All" : status === "active" ? "Active" : "Inactive"}
              </button>
            ))}
          </div>
        </div>

        {/* Contracts */}
        <div>
          {loading ? (
            <div className="text-center py-12">
              <div className="w-8 h-8 border-2 border-[#E8E8E8] border-t-[#0D0D0D] rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-sm text-[#666666]">Loading contracts...</p>
            </div>
          ) : filteredContracts.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-sm text-[#666666]">
                {contracts.length === 0 ? "No contracts yet" : "No contracts match this filter"}
              </p>
            </div>
          ) : (
            <div>
              <p className="text-xs font-semibold text-[#0D0D0D] uppercase tracking-widest mb-6">
                Contracts
              </p>
              <div className="space-y-4">
                {filteredContracts.map(contract => (
                  <div
                    key={contract.id}
                    onClick={() => setSelectedContract(contract)}
                    className="rounded-lg p-4 bg-white border border-[#E8E8E8] hover:bg-[#F9F9F9] transition-colors cursor-pointer"
                  >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <p className="text-sm font-semibold text-[#0D0D0D]">
                          {contract.businessName}
                        </p>
                        <span
                          className={`px-2 py-1 rounded text-xs font-semibold ${
                            contract.active
                              ? "bg-[#0D0D0D] text-white"
                              : "bg-[#E8E8E8] text-[#0D0D0D]"
                          }`}
                        >
                          {contract.active ? "Active" : "Inactive"}
                        </span>
                      </div>
                      <p className="text-xs text-[#888888] mb-1">
                        {contract.contactName || "No contact"} •{" "}
                        {contract.contactEmail || contract.contactPhone || "No contact info"}
                      </p>
                      <p className="text-xs text-[#666666]">
                        {contract.serviceType || "Service"} • {getFrequencyLabel(contract.frequency)} •{" "}
                        {getDayName(contract.dayOfWeek)}
                      </p>
                    </div>
                    <div className="flex flex-col items-end flex-shrink-0">
                      <p className="text-sm font-black text-[#0D0D0D] mb-1">
                        £{parseFloat(contract.price || "0").toFixed(2)}
                      </p>
                      <p className="text-xs text-[#888888]">
                        {formatDate(contract.createdAt)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Contract Detail Modal */}
      {selectedContract && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          onClick={() => setSelectedContract(null)}
        >
          <div
            className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto"
            onClick={e => e.stopPropagation()}
          >
            <div className="p-6 border-b border-[#E8E8E8]">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h2 className="text-xl font-black text-[#0D0D0D] mb-1">
                    {selectedContract.businessName}
                  </h2>
                  <p className="text-sm text-[#666666]">
                    {selectedContract.contactName || "Unknown"}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedContract(null)}
                  className="text-[#888888] hover:text-[#0D0D0D] text-2xl"
                >
                  ×
                </button>
              </div>
              <div className="flex gap-2 mb-4">
                <span
                  className={`px-2 py-1 rounded text-xs font-semibold ${
                    selectedContract.active
                      ? "bg-[#0D0D0D] text-white"
                      : "bg-[#E8E8E8] text-[#0D0D0D]"
                  }`}
                >
                  {selectedContract.active ? "Active" : "Inactive"}
                </span>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Contact Info */}
              <div>
                <p className="text-xs text-[#888888] mb-2 font-semibold">Contact Information</p>
                <div className="space-y-1 text-sm">
                  {selectedContract.contactName && (
                    <div className="flex justify-between">
                      <span className="text-[#0D0D0D]">Name</span>
                      <span className="text-[#666666]">{selectedContract.contactName}</span>
                    </div>
                  )}
                  {selectedContract.contactEmail && (
                    <div className="flex justify-between">
                      <span className="text-[#0D0D0D]">Email</span>
                      <span className="text-[#666666]">{selectedContract.contactEmail}</span>
                    </div>
                  )}
                  {selectedContract.contactPhone && (
                    <div className="flex justify-between">
                      <span className="text-[#0D0D0D]">Phone</span>
                      <span className="text-[#666666]">{selectedContract.contactPhone}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Service Details */}
              <div>
                <p className="text-xs text-[#888888] mb-2 font-semibold">Service Details</p>
                <div className="space-y-1 text-sm">
                  {selectedContract.serviceType && (
                    <div className="flex justify-between">
                      <span className="text-[#0D0D0D]">Type</span>
                      <span className="text-[#666666]">{selectedContract.serviceType}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-[#0D0D0D]">Frequency</span>
                    <span className="text-[#666666]">{getFrequencyLabel(selectedContract.frequency)}</span>
                  </div>
                  {selectedContract.dayOfWeek !== null && (
                    <div className="flex justify-between">
                      <span className="text-[#0D0D0D]">Day</span>
                      <span className="text-[#666666]">{getDayName(selectedContract.dayOfWeek)}</span>
                    </div>
                  )}
                  {selectedContract.preferredTime && (
                    <div className="flex justify-between">
                      <span className="text-[#0D0D0D]">Time</span>
                      <span className="text-[#666666]">{selectedContract.preferredTime}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Pricing */}
              <div>
                <p className="text-xs text-[#888888] mb-2 font-semibold">Pricing</p>
                <div className="flex justify-between items-baseline">
                  <span className="text-[#0D0D0D]">Per {selectedContract.frequency}</span>
                  <span className="text-2xl font-black text-[#0D0D0D]">
                    £{parseFloat(selectedContract.price || "0").toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Dates */}
              <div>
                <p className="text-xs text-[#888888] mb-2 font-semibold">Timeline</p>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-[#0D0D0D]">Created</span>
                    <span className="text-[#666666]">{formatDate(selectedContract.createdAt)}</span>
                  </div>
                  {selectedContract.lastGeneratedAt && (
                    <div className="flex justify-between">
                      <span className="text-[#0D0D0D]">Last Generated</span>
                      <span className="text-[#666666]">
                        {formatDate(selectedContract.lastGeneratedAt)}
                      </span>
                    </div>
                  )}
                  {selectedContract.nextScheduledAt && (
                    <div className="flex justify-between">
                      <span className="text-[#0D0D0D]">Next Scheduled</span>
                      <span className="text-[#666666]">
                        {formatDate(selectedContract.nextScheduledAt)}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-[#E8E8E8] bg-[#F9F9F9]">
              <button
                onClick={() => setSelectedContract(null)}
                className="w-full px-4 py-2 bg-[#0D0D0D] text-white rounded font-semibold hover:bg-[#333333]"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
