"use client";

import { useState } from "react";
import DriverLocationShare from "@/components/DriverLocationShare";

const STATUS_LABEL: Record<string, string> = {
  offered: "Offered to you",
  confirmed: "Confirmed",
  in_progress: "In progress",
  completed: "Completed",
  cancelled: "Cancelled",
};

const STATUS_STYLE: Record<string, string> = {
  offered: "bg-[#0D0D0D] text-white",
  confirmed: "bg-[#F5F5F5] text-[#0D0D0D] border border-[#E8E8E8]",
  in_progress: "bg-[#0D0D0D] text-white",
  completed: "bg-[#F5F5F5] text-[#888888] border border-[#E8E8E8]",
  cancelled: "bg-[#F5F5F5] text-[#888888] border border-[#E8E8E8]",
};

function JobCard({
  job,
  onAccept,
  onDecline,
  onUpdateStatus,
  responding,
  updating,
}: {
  job: Record<string, unknown>;
  onAccept?: () => void;
  onDecline?: () => void;
  onUpdateStatus?: (newStatus: string) => void;
  responding?: boolean;
  updating?: boolean;
}) {
  const status = (job.status as string) ?? "offered";
  const isOffered = status === "offered";

  return (
    <div className={`rounded-2xl p-5 border ${isOffered ? "bg-[#0D0D0D] border-[#0D0D0D]" : "bg-white border-[#E8E8E8]"}`}>
      <div className="flex items-start justify-between gap-3 mb-4">
        <div>
          <p className={`font-sans font-bold text-sm ${isOffered ? "text-white" : "text-[#0D0D0D]"}`}>
            {(job.service_type as string) || "Removal"}
          </p>
          <p className={`text-xs mt-0.5 ${isOffered ? "text-white/60" : "text-[#888888]"}`}>
            {job.postcode_from as string}
            {job.postcode_to ? ` → ${job.postcode_to as string}` : ""}
            {job.distance_miles ? ` · ${job.distance_miles as number} mi` : ""}
          </p>
        </div>
        <span className={`text-[10px] font-semibold px-2.5 py-1 rounded-full uppercase tracking-[0.1em] shrink-0 ${
          isOffered ? "bg-white/15 text-white" : STATUS_STYLE[status]
        }`}>
          {STATUS_LABEL[status] ?? status}
        </span>
      </div>

      <div className="flex flex-wrap gap-4 mb-4">
        {job.timeframe ? (
          <div>
            <p className={`text-[10px] uppercase tracking-[0.1em] ${isOffered ? "text-white/50" : "text-[#888888]"}`}>Timeframe</p>
            <p className={`text-sm font-medium ${isOffered ? "text-white/90" : "text-[#0D0D0D]"}`}>{job.timeframe as string}</p>
          </div>
        ) : null}
        {job.duration ? (
          <div>
            <p className={`text-[10px] uppercase tracking-[0.1em] ${isOffered ? "text-white/50" : "text-[#888888]"}`}>Duration</p>
            <p className={`text-sm font-medium ${isOffered ? "text-white/90" : "text-[#0D0D0D]"}`}>{job.duration as string}</p>
          </div>
        ) : null}
        {job.price ? (
          <div>
            <p className={`text-[10px] uppercase tracking-[0.1em] ${isOffered ? "text-white/50" : "text-[#888888]"}`}>Price</p>
            <p className={`font-sans font-black text-sm ${isOffered ? "text-white" : "text-[#0D0D0D]"}`}>£{job.price as number}</p>
          </div>
        ) : null}
      </div>

      {job.help_loading ? (
        <p className={`text-xs mb-4 ${isOffered ? "text-white/60" : "text-[#888888]"}`}>
          Loading help: {job.help_loading as string}
        </p>
      ) : null}

      {job.reference ? (
        <p className={`text-[10px] font-mono tracking-[0.1em] mb-4 ${isOffered ? "text-white/40" : "text-[#888888]"}`}>
          {job.reference as string}
        </p>
      ) : null}

      {isOffered && onAccept && onDecline && (
        <div className="flex gap-2 border-t border-white/15 pt-4">
          <button
            onClick={onAccept}
            disabled={responding}
            className="flex-1 bg-white hover:bg-[#F5F5F5] disabled:opacity-40 text-[#0D0D0D] font-semibold py-2.5 rounded-full text-sm transition-colors"
          >
            {responding ? "Confirming…" : "Accept →"}
          </button>
          <button
            onClick={onDecline}
            disabled={responding}
            className="px-5 border border-white/20 hover:border-white/40 text-white/70 hover:text-white font-medium py-2.5 rounded-full text-sm transition-colors"
          >
            Decline
          </button>
        </div>
      )}

      {status === "confirmed" && onUpdateStatus && (
        <DriverLocationShare
          job={job}
          onArrived={() => onUpdateStatus("in_progress")}
          arriving={updating}
        />
      )}

      {status === "in_progress" && onUpdateStatus && (
        <div className="border-t border-[#E8E8E8] pt-4">
          <button
            onClick={() => onUpdateStatus("completed")}
            disabled={updating}
            className="w-full bg-[#0D0D0D] hover:bg-[#333333] disabled:opacity-40 text-white font-semibold py-2.5 rounded-full text-sm transition-colors"
          >
            {updating ? "Completing…" : "Mark as complete →"}
          </button>
        </div>
      )}
    </div>
  );
}

type Tab = "offered" | "active" | "done";

interface Props {
  driverId: string | null;
  myJobs: Record<string, unknown>[];
}

export default function JobsFeed({ driverId, myJobs }: Props) {
  const offered = myJobs.filter(j => j.status === "offered");
  const active = myJobs.filter(j => ["confirmed", "in_progress"].includes(j.status as string));

  const defaultTab: Tab = offered.length > 0 ? "offered" : active.length > 0 ? "active" : "done";
  const [tab, setTab] = useState<Tab>(defaultTab);
  const [jobs, setJobs] = useState(myJobs);
  const [responding, setResponding] = useState<string | null>(null);
  const [updating, setUpdating] = useState<string | null>(null);

  const tabJobs = {
    offered: jobs.filter(j => j.status === "offered"),
    active: jobs.filter(j => ["confirmed", "in_progress"].includes(j.status as string)),
    done: jobs.filter(j => ["completed", "cancelled"].includes(j.status as string)),
  };

  async function updateStatus(jobId: string, newStatus: string) {
    setUpdating(jobId);
    try {
      await fetch("/api/jobs/update-status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobId, newStatus }),
      });
      setJobs(prev =>
        prev.map(j => j.id === jobId ? { ...j, status: newStatus } : j)
      );
      if (newStatus === "completed") setTab("done");
    } finally {
      setUpdating(null);
    }
  }

  async function respond(jobId: string, action: "accept" | "decline") {
    if (!driverId) return;
    setResponding(jobId);
    try {
      await fetch("/api/jobs/respond", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobId, driverId, action }),
      });
      setJobs(prev =>
        prev
          .map(j => j.id === jobId ? { ...j, status: action === "accept" ? "confirmed" : "declined" } : j)
          .filter(j => j.status !== "declined")
      );
      if (action === "accept") setTab("active");
    } finally {
      setResponding(null);
    }
  }

  const tabs: { key: Tab; label: string; count: number }[] = [
    { key: "offered", label: "Offered", count: tabJobs.offered.length },
    { key: "active", label: "Active", count: tabJobs.active.length },
    { key: "done", label: "Done", count: tabJobs.done.length },
  ];

  return (
    <div>
      <div className="inline-flex items-center bg-[#F5F5F5] rounded-full p-1 mb-6">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-5 py-2 rounded-full text-sm font-semibold transition-all ${
              tab === t.key ? "bg-[#0D0D0D] text-white" : "text-[#888888] hover:text-[#0D0D0D]"
            }`}
          >
            {t.label}
            {t.count > 0 && (
              <span className={`ml-1.5 text-[10px] ${tab === t.key ? "text-white/60" : "text-[#888888]"}`}>
                {t.count}
              </span>
            )}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {tabJobs[tab].length === 0 && (
          <div className="bg-[#F5F5F5] border border-[#E8E8E8] rounded-2xl p-8 text-center">
            {tab === "offered" && (
              <>
                <p className="text-[#888888] text-sm">No jobs offered yet.</p>
                <p className="text-[#888888] text-xs mt-1">We&apos;ll email you the moment a job matches your area.</p>
              </>
            )}
            {tab === "active" && (
              <p className="text-[#888888] text-sm">No active jobs right now.</p>
            )}
            {tab === "done" && (
              <p className="text-[#888888] text-sm">Completed jobs will appear here.</p>
            )}
          </div>
        )}
        {tabJobs[tab].map((job) => (
          <JobCard
            key={job.id as string}
            job={job}
            onAccept={tab === "offered" ? () => respond(job.id as string, "accept") : undefined}
            onDecline={tab === "offered" ? () => respond(job.id as string, "decline") : undefined}
            onUpdateStatus={tab === "active" ? (s) => updateStatus(job.id as string, s) : undefined}
            responding={responding === (job.id as string)}
            updating={updating === (job.id as string)}
          />
        ))}
      </div>
    </div>
  );
}
