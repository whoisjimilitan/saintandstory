"use client";

import { useEffect, useState } from "react";

interface ResponseRecord {
  id: string;
  business_name: string;
  email: string;
  response_type: "YES" | "NO";
  responded_at: string;
  engagement_score: number;
  pressure_type: string;
}

export function ResponsesView() {
  const [responses, setResponses] = useState<ResponseRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadResponses() {
      try {
        const response = await fetch("/api/b2b/responses-today");
        if (response.ok) {
          const data = await response.json();
          setResponses(data.responses || []);
        }
      } catch (error) {
        console.error("Failed to load responses:", error);
      } finally {
        setLoading(false);
      }
    }

    loadResponses();
    const interval = setInterval(loadResponses, 30000); // Refresh every 30s
    return () => clearInterval(interval);
  }, []);

  const yesCount = responses.filter((r) => r.response_type === "YES").length;
  const noCount = responses.filter((r) => r.response_type === "NO").length;

  if (loading) {
    return (
      <div className="flex-1 px-6 py-10">
        <p className="text-sm text-[#888888]">Loading responses...</p>
      </div>
    );
  }

  return (
    <div className="flex-1 px-6 py-10 overflow-auto">
      <div className="max-w-4xl space-y-16">
        {/* HEADER */}
        <div>
          <h1 className="text-4xl font-black text-[#0D0D0D] tracking-tight">
            Today's Responses
          </h1>
          <p className="text-sm text-[#888888] mt-3">
            Companies that have responded to your hypothesis test
          </p>
        </div>

        {/* SUMMARY */}
        <div className="space-y-4">
          <div className="flex gap-12">
            <div>
              <p className="text-2xl font-black text-green-600">{yesCount}</p>
              <p className="text-xs uppercase tracking-[0.2em] text-[#888888] mt-1">
                YES (Pain is Real)
              </p>
            </div>
            <div>
              <p className="text-2xl font-black text-[#0D0D0D]">{noCount}</p>
              <p className="text-xs uppercase tracking-[0.2em] text-[#888888] mt-1">
                NO (Not Relevant)
              </p>
            </div>
            <div>
              <p className="text-2xl font-black text-[#888888]">
                {responses.length}
              </p>
              <p className="text-xs uppercase tracking-[0.2em] text-[#888888] mt-1">
                Total Responses
              </p>
            </div>
          </div>
        </div>

        {/* RESPONSES LIST */}
        {responses.length > 0 ? (
          <div className="space-y-4">
            {responses.map((response) => (
              <div
                key={response.id}
                className={`px-4 py-4 border-l-2 ${
                  response.response_type === "YES"
                    ? "border-green-600"
                    : "border-[#E8E8E8]"
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <p className="font-medium text-[#0D0D0D]">
                      {response.business_name}
                    </p>
                    <p className="text-xs text-[#888888] mt-1">
                      {response.email}
                    </p>
                    <p className="text-xs text-[#666666] mt-2">
                      Pressure: {response.pressure_type}
                    </p>
                  </div>
                  <div className="text-right">
                    <p
                      className={`text-sm font-bold uppercase tracking-[0.1em] ${
                        response.response_type === "YES"
                          ? "text-green-600"
                          : "text-[#0D0D0D]"
                      }`}
                    >
                      {response.response_type}
                    </p>
                    <p className="text-xs text-[#888888] mt-2">
                      {new Date(response.responded_at).toLocaleTimeString(
                        "en-US",
                        { hour: "2-digit", minute: "2-digit" }
                      )}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-sm text-[#888888]">
              No responses yet today. Send emails to see responses here.
            </p>
          </div>
        )}

        {/* INFO */}
        <div className="space-y-4 pt-8 border-t border-[#E8E8E8]">
          <h3 className="text-[10px] uppercase tracking-[0.2em] font-medium text-[#0D0D0D]">
            What This Means
          </h3>
          <div className="space-y-2 text-xs text-[#666666]">
            <p>
              <strong>YES:</strong> Company confirms they experience this
              operational friction. Hypothesis validated for this pressure
              type.
            </p>
            <p>
              <strong>NO:</strong> Company indicates this pressure type doesn't
              apply to them. Hypothesis rejected for this industry/scenario.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
