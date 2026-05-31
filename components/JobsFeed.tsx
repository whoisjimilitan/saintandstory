"use client";

import { useState } from "react";

const STATUS_LABEL: Record<string, string> = {
  new: "New",
  matched: "Matched",
  confirmed: "Confirmed",
  in_progress: "In progress",
  completed: "Completed",
  cancelled: "Cancelled",
};

const STATUS_STYLE: Record<string, string> = {
  new: "bg-[#0D0D0D] text-white",
  matched: "bg-[#F5F5F5] text-[#0D0D0D] border border-[#E8E8E8]",
  confirmed: "bg-[#F5F5F5] text-[#0D0D0D] border border-[#E8E8E8]",
  in_progress: "bg-[#0D0D0D] text-white",
  completed: "bg-[#F5F5F5] text-[#888888] border border-[#E8E8E8]",
  cancelled: "bg-[#F5F5F5] text-[#888888] border border-[#E8E8E8]",
};

function JobCard({
  job,
  showActions,
  onAccept,
  onPass,
  accepting,
}: {
  job: Record<string, unknown>;
  showActions?: boolean;
  onAccept?: () => void;
  onPass?: () => void;
  accepting?: boolean;
}) {
  const status = (job.status as string) ?? "new";
  return (
    <div className="bg-white border border-[#E8E8E8] rounded-2xl p-5">
      <div className="flex items-start justify-between gap-3 mb-4">
        <div>
          <p className="font-sans font-bold text-[#0D0D0D] text-sm">{job.service_type as string || "Removal"}</p>
          <p className="text-[#888888] text-xs mt-0.5">
            {job.postcode_from as string}{job.postcode_to ? ` → ${job.postcode_to as string}` : ""}
            {job.distance_miles ? ` · ${job.distance_miles as number} mi` : ""}
          </p>
        </div>
        <span className={`text-[10px] font-semibold px-2.5 py-1 rounded-full uppercase tracking-[0.1em] shrink-0 ${STATUS_STYLE[status]}`}>
          {STATUS_LABEL[status]}
        </span>
      </div>

      <div className="flex flex-wrap gap-4 mb-4">
        {job.timeframe ? (
          <div>
            <p className="text-[#888888] text-[10px] uppercase tracking-[0.1em]">Timeframe</p>
            <p className="text-[#0D0D0D] text-sm font-medium">{job.timeframe as string}</p>
          </div>
        ) : null}
        {job.duration ? (
          <div>
            <p className="text-[#888888] text-[10px] uppercase tracking-[0.1em]">Duration</p>
            <p className="text-[#0D0D0D] text-sm font-medium">{job.duration as string}</p>
          </div>
        ) : null}
        {job.price ? (
          <div>
            <p className="text-[#888888] text-[10px] uppercase tracking-[0.1em]">Price</p>
            <p className="font-sans font-black text-[#0D0D0D] text-sm">£{job.price as number}</p>
          </div>
        ) : null}
      </div>

      {job.help_loading ? (
        <p className="text-[#888888] text-xs mb-4">
          Loading help: {job.help_loading as string}
        </p>
      ) : null}

      {showActions && (
        <div className="flex gap-2 border-t border-[#E8E8E8] pt-4">
          <button
            onClick={onAccept}
            disabled={accepting}
            className="flex-1 bg-[#0D0D0D] hover:bg-[#333333] disabled:opacity-40 text-white font-semibold py-2.5 rounded-full text-sm transition-colors"
          >
            {accepting ? "Accepting…" : "Accept →"}
          </button>
          <button
            onClick={onPass}
            disabled={accepting}
            className="px-5 border border-[#E8E8E8] hover:border-[#0D0D0D] text-[#888888] hover:text-[#0D0D0D] font-medium py-2.5 rounded-full text-sm transition-colors"
          >
            Pass
          </button>
        </div>
      )}
    </div>
  );
}

interface Props {
  driverId: string | null;
  availableJobs: Record<string, unknown>[];
  myJobs: Record<string, unknown>[];
}

export default function JobsFeed({ driverId, availableJobs, myJobs }: Props) {
  const [tab, setTab] = useState<"available" | "mine">("available");
  const [jobs, setJobs] = useState(availableJobs);
  const [accepting, setAccepting] = useState<string | null>(null);

  async function accept(jobId: string) {
    if (!driverId) return;
    setAccepting(jobId);
    try {
      await fetch("/api/jobs/accept", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobId, driverId }),
      });
      setJobs(prev => prev.filter(j => j.id !== jobId));
    } finally {
      setAccepting(null);
    }
  }

  function pass(jobId: string) {
    setJobs(prev => prev.filter(j => j.id !== jobId));
  }

  const activeJobs = myJobs.filter(j => !["completed", "cancelled"].includes(j.status as string));
  const pastJobs = myJobs.filter(j => ["completed", "cancelled"].includes(j.status as string));

  return (
    <div>
      {/* Tab toggle */}
      <div className="inline-flex items-center bg-[#F5F5F5] rounded-full p-1 mb-6">
        {(["available", "mine"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-5 py-2 rounded-full text-sm font-semibold transition-all ${
              tab === t ? "bg-[#0D0D0D] text-white" : "text-[#888888] hover:text-[#0D0D0D]"
            }`}
          >
            {t === "available" ? `Available (${jobs.length})` : `Mine (${myJobs.length})`}
          </button>
        ))}
      </div>

      {tab === "available" && (
        <div className="space-y-3">
          {jobs.length === 0 && (
            <div className="bg-[#F5F5F5] border border-[#E8E8E8] rounded-2xl p-8 text-center">
              <p className="text-[#888888] text-sm">No new jobs in your area right now.</p>
              <p className="text-[#888888] text-xs mt-1">Check back soon — jobs are posted daily.</p>
            </div>
          )}
          {jobs.map((job) => (
            <JobCard
              key={job.id as string}
              job={job}
              showActions
              onAccept={() => accept(job.id as string)}
              onPass={() => pass(job.id as string)}
              accepting={accepting === job.id}
            />
          ))}
        </div>
      )}

      {tab === "mine" && (
        <div className="space-y-6">
          {activeJobs.length > 0 && (
            <div>
              <p className="text-[10px] font-semibold text-[#888888] uppercase tracking-[0.2em] mb-3">Active</p>
              <div className="space-y-3">
                {activeJobs.map((job) => <JobCard key={job.id as string} job={job} />)}
              </div>
            </div>
          )}
          {pastJobs.length > 0 && (
            <div>
              <p className="text-[10px] font-semibold text-[#888888] uppercase tracking-[0.2em] mb-3">Completed</p>
              <div className="space-y-3">
                {pastJobs.map((job) => <JobCard key={job.id as string} job={job} />)}
              </div>
            </div>
          )}
          {myJobs.length === 0 && (
            <div className="bg-[#F5F5F5] border border-[#E8E8E8] rounded-2xl p-8 text-center">
              <p className="text-[#888888] text-sm">No jobs yet. Accept your first job from the Available tab.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
