"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

interface ProspectDetail {
  id: string;
  businessName: string;
  businessCategory?: string;
  contactName?: string;
  city?: string;
  postcode?: string;
  industry?: string;
  website?: string;
  phone?: string;
  email?: string;
  employees?: number;
  annualRevenue?: string;
  status?: string;
  leadState?: string;
  enrichedData?: {
    decisionMakers?: Array<{ name: string; role: string; email?: string }>;
    signals?: string[];
    painPoints?: string[];
    opportunities?: string[];
  };
}

interface UnderstandState {
  loading: boolean;
  error: string | null;
  prospect: ProspectDetail | null;
  qualifying: boolean;
  qualifyError: string | null;
}

export default function UnderstandPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const prospectId = searchParams.get("prospectId");

  const [state, setState] = useState<UnderstandState>({
    loading: true,
    error: null,
    prospect: null,
    qualifying: false,
    qualifyError: null,
  });

  const [form, setForm] = useState({
    confidenceScore: 50,
    notes: "",
  });

  // Fetch prospect detail
  useEffect(() => {
    const fetchProspect = async () => {
      if (!prospectId) {
        setState((s) => ({
          ...s,
          loading: false,
          error: "No prospect selected. Please search from Discover.",
        }));
        return;
      }

      try {
        setState((s) => ({ ...s, loading: true, error: null }));

        const res = await fetch(`/api/b2b/prospect/${prospectId}`);
        if (!res.ok) throw new Error(`HTTP ${res.status}: Failed to load prospect`);

        const data = await res.json();
        setState((s) => ({
          ...s,
          loading: false,
          prospect: data,
        }));
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Failed to load prospect";
        setState((s) => ({
          ...s,
          loading: false,
          error: message,
        }));
      }
    };

    fetchProspect();
  }, [prospectId]);

  // Handle qualification submit
  const handleQualify = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!prospectId || !state.prospect) return;

    try {
      setState((s) => ({ ...s, qualifying: true, qualifyError: null }));

      const res = await fetch("/api/b2b/qualify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prospectId,
          confidenceScore: form.confidenceScore,
          notes: form.notes,
          status: "qualified",
        }),
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}: Qualification failed`);

      // Success - navigate to Outreach
      router.push(`/operator/outreach?prospectId=${prospectId}`);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Failed to save qualification";
      setState((s) => ({
        ...s,
        qualifying: false,
        qualifyError: message,
      }));
    }
  };

  // Loading state
  if (state.loading) {
    return (
      <div className="px-4 md:px-12 py-10 max-w-4xl">
        <div className="flex justify-center py-12">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-[#E8E8E8] border-t-[#0D0D0D] rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-sm text-[#666666]">Loading prospect details...</p>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (state.error || !state.prospect) {
    return (
      <div className="px-4 md:px-12 py-10 max-w-4xl">
        <div className="mb-12">
          <Link
            href="/operator/discover"
            className="text-xs font-semibold text-[#888888] hover:text-[#0D0D0D] transition-colors mb-6 inline-block"
          >
            ← Back to Discover
          </Link>
          <h1 className="font-sans font-black text-[#0D0D0D] text-4xl md:text-5xl tracking-tight leading-tight">
            Understand
          </h1>
        </div>

        <div className="border border-[#E8E8E8] rounded-lg p-8 bg-white text-center">
          <p className="text-sm text-[#666666] mb-4">
            {state.error || "Could not load prospect."}
          </p>
          <Link
            href="/operator/discover"
            className="text-xs font-semibold text-[#0D0D0D] hover:text-[#666666] transition-colors"
          >
            Go back to Discover
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 md:px-12 py-10 max-w-4xl">
      {/* Header */}
      <div className="mb-12">
        <Link
          href="/operator/discover"
          className="text-xs font-semibold text-[#888888] hover:text-[#0D0D0D] transition-colors mb-6 inline-block"
        >
          ← Back to Discover
        </Link>
        <h1 className="font-sans font-black text-[#0D0D0D] text-4xl md:text-5xl tracking-tight leading-tight mb-3">
          Understand
        </h1>
        <p className="text-sm md:text-base text-[#888888] font-normal">
          Enrich and qualify this prospect before outreach.
        </p>
      </div>

      {/* Divider */}
      <div className="h-px bg-[#E8E8E8] mb-12"></div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        {/* Left Column: Prospect Info */}
        <div>
          {/* Business Info */}
          <section className="mb-12">
            <h2 className="text-sm font-semibold text-[#0D0D0D] uppercase tracking-[0.15em] mb-6">
              Business Information
            </h2>
            <div className="space-y-4">
              <div>
                <p className="text-xs text-[#888888] uppercase tracking-[0.1em] mb-1">
                  Company
                </p>
                <p className="text-base font-semibold text-[#0D0D0D]">
                  {state.prospect.businessName}
                </p>
              </div>

              {state.prospect.contactName && (
                <div>
                  <p className="text-xs text-[#888888] uppercase tracking-[0.1em] mb-1">
                    Primary Contact
                  </p>
                  <p className="text-sm text-[#0D0D0D]">
                    {state.prospect.contactName}
                  </p>
                </div>
              )}

              {state.prospect.city && (
                <div>
                  <p className="text-xs text-[#888888] uppercase tracking-[0.1em] mb-1">
                    Location
                  </p>
                  <p className="text-sm text-[#0D0D0D]">{state.prospect.city}</p>
                </div>
              )}

              {state.prospect.industry && (
                <div>
                  <p className="text-xs text-[#888888] uppercase tracking-[0.1em] mb-1">
                    Industry
                  </p>
                  <p className="text-sm text-[#0D0D0D]">
                    {state.prospect.industry}
                  </p>
                </div>
              )}

              {state.prospect.employees && (
                <div>
                  <p className="text-xs text-[#888888] uppercase tracking-[0.1em] mb-1">
                    Employees
                  </p>
                  <p className="text-sm text-[#0D0D0D]">
                    {state.prospect.employees.toLocaleString()}
                  </p>
                </div>
              )}

              {state.prospect.annualRevenue && (
                <div>
                  <p className="text-xs text-[#888888] uppercase tracking-[0.1em] mb-1">
                    Annual Revenue
                  </p>
                  <p className="text-sm text-[#0D0D0D]">
                    {state.prospect.annualRevenue}
                  </p>
                </div>
              )}

              {state.prospect.businessCategory && (
                <div>
                  <p className="text-xs text-[#888888] uppercase tracking-[0.1em] mb-1">
                    Category
                  </p>
                  <p className="text-sm text-[#0D0D0D]">
                    {state.prospect.businessCategory}
                  </p>
                </div>
              )}

              {state.prospect.email && (
                <div>
                  <p className="text-xs text-[#888888] uppercase tracking-[0.1em] mb-1">
                    Email
                  </p>
                  <p className="text-sm text-[#0D0D0D]">
                    <a href={`mailto:${state.prospect.email}`} className="hover:underline">
                      {state.prospect.email}
                    </a>
                  </p>
                </div>
              )}

              {state.prospect.phone && (
                <div>
                  <p className="text-xs text-[#888888] uppercase tracking-[0.1em] mb-1">
                    Phone
                  </p>
                  <p className="text-sm text-[#0D0D0D]">
                    <a href={`tel:${state.prospect.phone}`} className="hover:underline">
                      {state.prospect.phone}
                    </a>
                  </p>
                </div>
              )}

              {state.prospect.website && (
                <div>
                  <p className="text-xs text-[#888888] uppercase tracking-[0.1em] mb-1">
                    Website
                  </p>
                  <p className="text-sm text-[#0D0D0D]">
                    <a href={state.prospect.website} target="_blank" rel="noopener noreferrer" className="hover:underline">
                      {state.prospect.website}
                    </a>
                  </p>
                </div>
              )}

              {state.prospect.postcode && (
                <div>
                  <p className="text-xs text-[#888888] uppercase tracking-[0.1em] mb-1">
                    Postcode
                  </p>
                  <p className="text-sm text-[#0D0D0D]">{state.prospect.postcode}</p>
                </div>
              )}
            </div>
          </section>

          {/* Divider */}
          <div className="h-px bg-[#E8E8E8] mb-12"></div>

          {/* Enriched Data */}
          {state.prospect.enrichedData && (
            <>
              {state.prospect.enrichedData.decisionMakers &&
                state.prospect.enrichedData.decisionMakers.length > 0 && (
                  <section className="mb-12">
                    <h2 className="text-sm font-semibold text-[#0D0D0D] uppercase tracking-[0.15em] mb-6">
                      Decision Makers
                    </h2>
                    <div className="space-y-4">
                      {state.prospect.enrichedData.decisionMakers.map(
                        (maker, idx) => (
                          <div
                            key={idx}
                            className="pb-4 border-b border-[#E8E8E8] last:border-b-0"
                          >
                            <p className="text-sm font-semibold text-[#0D0D0D]">
                              {maker.name}
                            </p>
                            <p className="text-xs text-[#888888]">{maker.role}</p>
                            {maker.email && (
                              <p className="text-xs text-[#0D0D0D] mt-1">
                                {maker.email}
                              </p>
                            )}
                          </div>
                        )
                      )}
                    </div>
                  </section>
                )}

              {state.prospect.enrichedData.signals &&
                state.prospect.enrichedData.signals.length > 0 && (
                  <section className="mb-12">
                    <h2 className="text-sm font-semibold text-[#0D0D0D] uppercase tracking-[0.15em] mb-6">
                      Engagement Signals
                    </h2>
                    <div className="space-y-2">
                      {state.prospect.enrichedData.signals.map((signal, idx) => (
                        <div
                          key={idx}
                          className="flex items-start gap-2 p-2 bg-[#F5F5F5] rounded"
                        >
                          <span className="text-xs text-[#0D0D0D] flex-1">
                            {signal}
                          </span>
                        </div>
                      ))}
                    </div>
                  </section>
                )}

              {state.prospect.enrichedData.painPoints &&
                state.prospect.enrichedData.painPoints.length > 0 && (
                  <section className="mb-12">
                    <h2 className="text-sm font-semibold text-[#0D0D0D] uppercase tracking-[0.15em] mb-6">
                      Pain Points
                    </h2>
                    <div className="space-y-2">
                      {state.prospect.enrichedData.painPoints.map(
                        (point, idx) => (
                          <div
                            key={idx}
                            className="flex items-start gap-2 p-2 bg-[#FFF5F5] rounded"
                          >
                            <span className="text-xs text-[#0D0D0D] flex-1">
                              {point}
                            </span>
                          </div>
                        )
                      )}
                    </div>
                  </section>
                )}
            </>
          )}
        </div>

        {/* Right Column: Qualification Form */}
        <div>
          <div className="border border-[#E8E8E8] rounded-lg p-8 bg-white sticky top-24">
            <h2 className="text-sm font-semibold text-[#0D0D0D] uppercase tracking-[0.15em] mb-8">
              Qualification
            </h2>

            <form onSubmit={handleQualify} className="space-y-8">
              {/* Confidence Score */}
              <div>
                <label className="text-xs font-semibold text-[#0D0D0D] uppercase tracking-[0.1em] block mb-4">
                  Confidence Score
                </label>
                <div className="flex items-center gap-4">
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={form.confidenceScore}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        confidenceScore: parseInt(e.target.value),
                      }))
                    }
                    className="flex-1"
                    style={{
                      accentColor: '#333333',
                    }}
                  />
                  <span className="text-2xl font-black text-[#0D0D0D] min-w-[50px] text-right">
                    {form.confidenceScore}%
                  </span>
                </div>
                <p className="text-xs text-[#888888] mt-2">
                  How confident are you in this prospect?
                </p>
              </div>

              {/* Notes */}
              <div>
                <label className="text-xs font-semibold text-[#0D0D0D] uppercase tracking-[0.1em] block mb-3">
                  Notes
                </label>
                <textarea
                  value={form.notes}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, notes: e.target.value }))
                  }
                  placeholder="Add any notes about this prospect..."
                  rows={4}
                  className="w-full px-4 py-3 bg-[#F9F9F9] border border-[#E8E8E8] text-sm text-[#0D0D0D] placeholder-[#C9C9C9] focus:outline-none focus:border-[#0D0D0D] transition-colors rounded"
                />
              </div>

              {/* Error */}
              {state.qualifyError && (
                <div className="p-3 bg-[#FFF5F5] border border-[#FFE0E0] rounded">
                  <p className="text-xs text-[#DC2626]">
                    {state.qualifyError}
                  </p>
                </div>
              )}

              {/* Buttons */}
              <div className="flex gap-3 pt-6 border-t border-[#E8E8E8]">
                <button
                  type="submit"
                  disabled={state.qualifying}
                  className="flex-1 px-4 py-3 bg-[#0D0D0D] text-white text-xs font-semibold rounded hover:bg-[#333333] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {state.qualifying ? "Qualifying..." : "Qualify & Proceed"}
                </button>
                <Link
                  href="/operator/discover"
                  className="px-4 py-3 border border-[#E8E8E8] text-[#0D0D0D] text-xs font-semibold rounded hover:border-[#0D0D0D] transition-colors"
                >
                  Skip
                </Link>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
