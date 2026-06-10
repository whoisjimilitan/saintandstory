"use client";

import { useState } from "react";
import JobCard from "@/components/JobCard";

type Tab = "offered" | "active" | "done";

interface Props {
  driverId: string | null;
  myJobs: Record<string, unknown>[];
  driverName?: string;
}

export default function JobsFeed({ driverId, myJobs, driverName }: Props) {
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
            driverName={driverName}
          />
        ))}
      </div>
    </div>
  );
}
