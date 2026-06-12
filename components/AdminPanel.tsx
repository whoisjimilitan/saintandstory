"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown } from "lucide-react";
import SmsButton from "@/components/SmsButton";
import AdminEtaBadge from "@/components/AdminEtaBadge";

interface Driver {
  id: string;
  full_name: string;
  area: string;
  vehicle_type: string;
  phone: string;
  rating_avg: number | null;
  rating_count: number | null;
  last_seen_at: string | null;
  avg_response_mins: number | null;
  current_job_ref?: string | null;
  current_job_from?: string | null;
  current_job_to?: string | null;
  current_job_status?: string | null;
}

function isOnline(ts: string | null) {
  if (!ts) return false;
  return Date.now() - new Date(ts).getTime() < 5 * 60 * 1000;
}

function lastSeenLabel(ts: string | null) {
  if (!ts) return "Offline";
  const diff = Date.now() - new Date(ts).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 5) return "Online now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

interface Job {
  id: string;
  reference: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  service_type: string;
  postcode_from: string;
  postcode_to: string;
  timeframe: string;
  duration: string;
  help_loading: string;
  large_items: unknown;
  address_from?: string;
  address_to?: string;
  price?: number;
  previous_jobs?: number;
  created_at: string;
  offered_at?: string | null;
  confirmed_at?: string | null;
  in_progress_at?: string | null;
  completed_at?: string | null;
  driver_id?: string;
  driver_name?: string;
  driver_phone?: string;
  updated_at?: string;
  driver_eta_minutes?: number | null;
  location_sharing_since?: string | null;
}

function isStaleOffered(ts: string | undefined) {
  if (!ts) return false;
  return Date.now() - new Date(ts).getTime() > 2 * 60 * 60 * 1000;
}

function suggestDrivers(job: Job, drivers: Driver[]) {
  const prefix = (job.postcode_from ?? "").split(" ")[0].toLowerCase();
  return drivers.filter(d => (d.area ?? "").toLowerCase().includes(prefix)).slice(0, 5);
}

function timeAgo(ts: string) {
  const diff = Date.now() - new Date(ts).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

function isStale(ts: string) {
  return Date.now() - new Date(ts).getTime() > 4 * 60 * 60 * 1000;
}

function formatTime(ts: string | null | undefined) {
  if (!ts) return null;
  const d = new Date(ts);
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

// ─── Shared small components ──────────────────────────────────────────────────

function CopyRef({ reference }: { reference: string }) {
  const [copied, setCopied] = useState(false);
  function copy(e: React.MouseEvent) {
    e.stopPropagation();
    navigator.clipboard.writeText(reference).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1400);
    });
  }
  return (
    <button
      onClick={copy}
      title="Copy reference"
      className="font-mono text-[10px] text-[#888888] hover:text-[#0D0D0D] transition-colors"
    >
      {copied ? "Copied!" : reference}
    </button>
  );
}

function QuickDial({ phone }: { phone: string }) {
  return (
    <a
      href={`tel:${phone}`}
      onClick={e => e.stopPropagation()}
      title={`Call ${phone}`}
      className="shrink-0 w-7 h-7 rounded-full bg-[#F5F5F5] border border-[#E8E8E8] flex items-center justify-center hover:bg-[#0D0D0D] hover:border-[#0D0D0D] group transition-colors"
    >
      <svg className="w-3 h-3 text-[#888888] group-hover:text-white transition-colors" viewBox="0 0 20 20" fill="currentColor">
        <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
      </svg>
    </a>
  );
}

function JobTimeline({ job }: { job: Job }) {
  const events = [
    { ts: job.created_at, label: "Received" },
    { ts: job.offered_at, label: `Offered${job.driver_name ? ` · ${job.driver_name}` : ""}` },
    { ts: job.confirmed_at, label: "Driver accepted" },
    { ts: job.in_progress_at, label: "En route" },
    { ts: job.completed_at, label: "Completed" },
  ].filter(e => !!e.ts);

  if (events.length <= 1) return null;

  return (
    <div className="mt-4 pt-4 border-t border-[#E8E8E8]">
      <p className="text-[10px] font-semibold text-[#888888] uppercase tracking-[0.15em] mb-3">Timeline</p>
      <div className="space-y-2">
        {events.map((e, i) => (
          <div key={i} className="flex items-center gap-3">
            <span className="font-mono text-[10px] text-[#888888] w-10 shrink-0">{formatTime(e.ts as string)}</span>
            <div className="w-1 h-1 rounded-full bg-[#E8E8E8] shrink-0" />
            <span className="text-xs text-[#0D0D0D]">{e.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Cancel button (shared) ───────────────────────────────────────────────────

function CancelButton({ jobId, onCancelled }: { jobId: string; onCancelled: (id: string) => void }) {
  const [confirm, setConfirm] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  async function cancel() {
    setCancelling(true);
    try {
      const res = await fetch("/api/jobs/cancel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobId }),
      });
      if (res.ok) onCancelled(jobId);
    } finally {
      setCancelling(false);
      setConfirm(false);
    }
  }

  if (confirm) {
    return (
      <div className="flex items-center gap-3">
        <span className="text-xs text-[#888888]">Cancel this job?</span>
        <button
          onClick={cancel}
          disabled={cancelling}
          className="bg-[#0D0D0D] hover:bg-[#333333] disabled:opacity-40 text-white font-semibold px-4 py-1.5 rounded-full text-xs transition-colors"
        >
          {cancelling ? "Cancelling…" : "Confirm →"}
        </button>
        <button onClick={() => setConfirm(false)} className="text-[#888888] text-xs hover:text-[#0D0D0D] transition-colors">
          ← back
        </button>
      </div>
    );
  }

  return (
    <button onClick={() => setConfirm(true)} className="text-[#888888] hover:text-[#0D0D0D] hover:bg-[#F5F5F5] text-xs transition-all px-2 py-1 rounded-md">
      Cancel job
    </button>
  );
}

// ─── Pending job row (Orders section) ────────────────────────────────────────

function JobRow({ job, drivers, onAssigned }: { job: Job; drivers: Driver[]; onAssigned: (jobId: string) => void }) {
  const [assigning, setAssigning] = useState<string | null>(null);
  const [price, setPrice] = useState("");
  const [expanded, setExpanded] = useState(false);
  const [showAll, setShowAll] = useState(false);

  const suggested = suggestDrivers(job, drivers);
  const displayDrivers = showAll ? drivers : suggested;

  async function assign(driverId: string) {
    setAssigning(driverId);
    try {
      const res = await fetch("/api/jobs/assign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobId: job.id, driverId, price: price || null }),
      });
      if (res.ok) onAssigned(job.id);
    } finally {
      setAssigning(null);
    }
  }

  return (
    <div className="bg-white border border-[#E8E8E8] rounded-2xl overflow-hidden">
      <button
        className="w-full text-left px-5 py-4 flex items-start justify-between gap-4 hover:bg-[#F5F5F5] transition-colors"
        onClick={() => setExpanded(e => !e)}
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <p className="font-sans font-bold text-[#0D0D0D] text-sm">{job.service_type || "Removal"}</p>
            <CopyRef reference={job.reference} />
          </div>
          <p className="text-[#888888] text-xs">
            {job.postcode_from}{job.postcode_to ? ` → ${job.postcode_to}` : ""}
            {job.customer_name ? ` · ${job.customer_name}` : ""}
          </p>
          {job.previous_jobs != null && Number(job.previous_jobs) > 0 && (
            <p className="text-[10px] font-semibold text-[#0D0D0D] uppercase tracking-[0.1em] mt-0.5">
              Returning · {Number(job.previous_jobs)} prev job{Number(job.previous_jobs) !== 1 ? "s" : ""}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {job.customer_phone && <QuickDial phone={job.customer_phone} />}
          <div className="text-right">
            <p className="text-[#888888] text-[10px]">{timeAgo(job.created_at)}</p>
            {isStale(job.created_at) && (
              <span className="inline-block mt-0.5 text-[9px] font-bold uppercase tracking-[0.1em] text-white bg-red-500 px-1.5 py-0.5 rounded-full">Urgent</span>
            )}
          </div>
        </div>
      </button>

      {expanded && (
        <div className="px-5 pb-5 border-t border-[#E8E8E8]">
          <div className="grid grid-cols-2 gap-3 py-4">
            {job.customer_email && (
              <div>
                <p className="text-[#888888] text-[10px] uppercase tracking-[0.1em]">Email</p>
                <a href={`mailto:${job.customer_email}`} className="text-[#0D0D0D] text-sm font-medium hover:underline">{job.customer_email}</a>
              </div>
            )}
            {job.customer_phone && (
              <div>
                <p className="text-[#888888] text-[10px] uppercase tracking-[0.1em]">Phone</p>
                <a href={`tel:${job.customer_phone}`} className="text-[#0D0D0D] text-sm font-medium hover:underline">{job.customer_phone}</a>
              </div>
            )}
            {job.timeframe && (
              <div>
                <p className="text-[#888888] text-[10px] uppercase tracking-[0.1em]">Timeframe</p>
                <p className="text-[#0D0D0D] text-sm">{job.timeframe}</p>
              </div>
            )}
            {job.duration && (
              <div>
                <p className="text-[#888888] text-[10px] uppercase tracking-[0.1em]">Duration</p>
                <p className="text-[#0D0D0D] text-sm">{job.duration}</p>
              </div>
            )}
            {job.help_loading && (
              <div>
                <p className="text-[#888888] text-[10px] uppercase tracking-[0.1em]">Loading help</p>
                <p className="text-[#0D0D0D] text-sm">{job.help_loading}</p>
              </div>
            )}
            {job.address_from && (
              <div className="col-span-2">
                <p className="text-[#888888] text-[10px] uppercase tracking-[0.1em]">Collection</p>
                <p className="text-[#0D0D0D] text-sm">{job.address_from} · {job.postcode_from}</p>
              </div>
            )}
            {job.address_to && (
              <div className="col-span-2">
                <p className="text-[#888888] text-[10px] uppercase tracking-[0.1em]">Delivery</p>
                <p className="text-[#0D0D0D] text-sm">{job.address_to} · {job.postcode_to}</p>
              </div>
            )}
            {job.large_items != null && String(job.large_items) !== "[]" && (
              <div className="col-span-2">
                <p className="text-[#888888] text-[10px] uppercase tracking-[0.1em]">Large items</p>
                <p className="text-[#0D0D0D] text-sm">{
                  (() => { try { const a = JSON.parse(String(job.large_items)); return Array.isArray(a) ? a.join(", ") : String(job.large_items); } catch { return String(job.large_items); } })()
                }</p>
              </div>
            )}
          </div>

          <div className="mb-4">
            <label className="block text-[#888888] text-[10px] uppercase tracking-[0.1em] mb-1">Set job price (optional)</label>
            <div className="relative w-36">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#888888] text-sm">£</span>
              <input
                type="number"
                value={price}
                onChange={e => setPrice(e.target.value)}
                placeholder="e.g. 180"
                className="w-full pl-7 pr-3 py-2 border border-[#E8E8E8] rounded-lg text-sm text-[#0D0D0D] focus:outline-none focus:border-[#0D0D0D]"
              />
            </div>
          </div>

          <div>
            <p className="text-[#888888] text-[10px] uppercase tracking-[0.1em] mb-2">
              {suggested.length > 0 ? `Suggested drivers (${job.postcode_from?.split(" ")[0]})` : "Assign driver"}
            </p>
            {displayDrivers.length === 0 && <p className="text-[#888888] text-xs italic">No drivers in this area yet.</p>}
            <div className="space-y-2">
              {displayDrivers.map(driver => (
                <div key={driver.id} className="flex items-center justify-between gap-3 bg-[#F5F5F5] rounded-xl px-4 py-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className={`w-2 h-2 rounded-full shrink-0 ${isOnline(driver.last_seen_at) ? "bg-green-500" : "bg-[#D0D0D0]"}`} />
                      <p className="font-sans font-semibold text-[#0D0D0D] text-sm">{driver.full_name}</p>
                      <span className="text-[10px] text-[#888888]">{lastSeenLabel(driver.last_seen_at)}</span>
                    </div>
                    <p className="text-[#888888] text-xs">
                      {driver.area} · {driver.vehicle_type}
                      {driver.rating_avg ? ` · ★ ${Number(driver.rating_avg).toFixed(1)}` : ""}
                      {driver.rating_count ? ` (${driver.rating_count})` : ""}
                    </p>
                  </div>
                  <button
                    onClick={() => assign(driver.id)}
                    disabled={!!assigning}
                    className="bg-[#0D0D0D] hover:bg-[#333333] disabled:opacity-40 text-white font-semibold px-4 py-1.5 rounded-full text-xs transition-colors shrink-0"
                  >
                    {assigning === driver.id ? "Assigning…" : "Assign →"}
                  </button>
                </div>
              ))}
            </div>
            {!showAll && drivers.length > suggested.length && (
              <button onClick={() => setShowAll(true)} className="mt-2 text-[#888888] text-xs hover:text-[#0D0D0D] hover:bg-[#F5F5F5] transition-all px-2 py-1 rounded-md">
                Show all {drivers.length} drivers →
              </button>
            )}
          </div>

          <JobTimeline job={job} />

          <div className="mt-4 pt-4 border-t border-[#E8E8E8]">
            <CancelButton jobId={job.id} onCancelled={onAssigned} />
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Offered job row (Awaiting driver section) ────────────────────────────────

function OfferedJobRow({ job, drivers, onReassigned }: { job: Job; drivers: Driver[]; onReassigned: (jobId: string) => void }) {
  const [expanded, setExpanded] = useState(false);
  const [reassigning, setReassigning] = useState(false);
  const [showDrivers, setShowDrivers] = useState(false);
  const [showAssignPanel, setShowAssignPanel] = useState(false);
  const [assigning, setAssigning] = useState<string | null>(null);
  const [price, setPrice] = useState(job.price ? String(Number(job.price).toFixed(2)) : "");

  async function reassign() {
    setReassigning(true);
    try {
      const res = await fetch("/api/jobs/reassign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobId: job.id }),
      });
      if (res.ok) onReassigned(job.id);
    } finally {
      setReassigning(false);
    }
  }

  async function assignTo(driverId: string) {
    setAssigning(driverId);
    try {
      const res = await fetch("/api/jobs/assign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobId: job.id, driverId, price: price || null }),
      });
      if (res.ok) onReassigned(job.id);
    } finally {
      setAssigning(null);
    }
  }

  return (
    <div className="bg-white border border-[#E8E8E8] rounded-2xl overflow-hidden">
      <div className="px-5 py-4 flex items-center justify-between gap-4 border-b border-[#E8E8E8]">
        <button
          className="flex-1 text-left hover:bg-[#F5F5F5] -mx-4 -my-4 px-4 py-4 rounded-tl-xl transition-colors"
          onClick={() => setExpanded(e => !e)}
        >
          <p className="font-sans font-semibold text-[#0D0D0D] text-sm">{job.service_type || "Removal"}</p>
          <p className="text-[#888888] text-xs">
            {job.postcode_from}{job.postcode_to ? ` → ${job.postcode_to}` : ""}
            {job.driver_name ? ` · ${job.driver_name}` : ""}
          </p>
        </button>
        <div className="flex items-center gap-2 shrink-0">
          {job.driver_phone && <QuickDial phone={job.driver_phone} />}
          {isStaleOffered(job.updated_at) ? (
            <span className="text-[9px] font-bold uppercase tracking-[0.1em] text-white bg-red-500 px-2.5 py-1 rounded-full">
              Urgent · {job.updated_at ? timeAgo(job.updated_at) : "—"}
            </span>
          ) : (
            <span className="text-[10px] font-semibold text-[#888888] bg-[#F5F5F5] border border-[#E8E8E8] px-2.5 py-1 rounded-full uppercase tracking-[0.1em]">
              Awaiting · {job.updated_at ? timeAgo(job.updated_at) : "—"}
            </span>
          )}
        </div>
      </div>
      <div className="px-5 py-2 flex items-center gap-2 bg-[#F5F5F5]">
        <button
          onClick={() => setShowAssignPanel(v => !v)}
          className="bg-[#0D0D0D] hover:bg-[#333333] text-white font-semibold px-4 py-2 rounded-full text-xs transition-colors"
        >
          Assign driver →
        </button>
        <button
          onClick={() => setExpanded(e => !e)}
          className="text-[#888888] hover:text-[#0D0D0D] text-xs font-medium transition-colors"
        >
          {expanded ? "Hide details ↑" : "Show details ↓"}
        </button>
      </div>

      {showAssignPanel && (
        <div className="px-5 py-4 border-t border-[#E8E8E8] bg-[#F5F5F5]">
          <div className="mb-3">
            <label className="block text-[#888888] text-[10px] uppercase tracking-[0.1em] mb-2">Job price</label>
            <div className="relative w-36">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#888888] text-sm">£</span>
              <input
                type="number"
                value={price}
                onChange={e => setPrice(e.target.value)}
                placeholder="e.g. 180"
                className="w-full pl-7 pr-3 py-2 border border-[#E8E8E8] rounded-lg text-sm text-[#0D0D0D] focus:outline-none focus:border-[#0D0D0D]"
              />
            </div>
          </div>
          <div className="space-y-2">
            {drivers.length === 0 ? (
              <p className="text-[#888888] text-xs italic">No drivers available.</p>
            ) : (
              drivers.map(driver => (
                <div key={driver.id} className="flex items-center justify-between gap-3 bg-white rounded-xl px-4 py-3 border border-[#E8E8E8]">
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <span className={`w-2 h-2 rounded-full shrink-0 ${isOnline(driver.last_seen_at) ? "bg-green-500" : "bg-[#D0D0D0]"}`} />
                    <div className="min-w-0">
                      <p className="font-sans font-semibold text-[#0D0D0D] text-sm">{driver.full_name}</p>
                      <p className="text-[#888888] text-xs">{driver.area} · {driver.vehicle_type}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => assignTo(driver.id)}
                    disabled={!!assigning}
                    className="bg-[#0D0D0D] hover:bg-[#333333] disabled:opacity-40 text-white font-semibold px-4 py-1.5 rounded-full text-xs transition-colors shrink-0"
                  >
                    {assigning === driver.id ? "Assigning…" : "Assign"}
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {expanded && (
        <div className="px-5 pb-5 border-t border-[#E8E8E8]">
          <div className="py-4 grid grid-cols-2 gap-3">
            {job.driver_name && <div>
              <p className="text-[#888888] text-[10px] uppercase tracking-[0.1em]">Assigned to</p>
              <p className="text-[#0D0D0D] text-sm font-semibold">{job.driver_name}</p>
            </div>}
            {job.driver_phone && <div>
              <p className="text-[#888888] text-[10px] uppercase tracking-[0.1em]">Driver phone</p>
              <a href={`tel:${job.driver_phone}`} className="text-[#0D0D0D] text-sm font-semibold hover:underline">{job.driver_phone}</a>
            </div>}
            {job.customer_name && <div>
              <p className="text-[#888888] text-[10px] uppercase tracking-[0.1em]">Customer</p>
              <p className="text-[#0D0D0D] text-sm">{job.customer_name}</p>
            </div>}
            {job.customer_phone && <div>
              <p className="text-[#888888] text-[10px] uppercase tracking-[0.1em]">Customer phone</p>
              <a href={`tel:${job.customer_phone}`} className="text-[#0D0D0D] text-sm font-semibold hover:underline">{job.customer_phone}</a>
            </div>}
          </div>

          {!showDrivers ? (
            <div className="space-y-3">
              <div className="flex gap-3">
                <button
                  onClick={reassign}
                  disabled={reassigning}
                  className="bg-[#0D0D0D] hover:bg-[#333333] disabled:opacity-40 text-white font-semibold px-5 py-2 rounded-full text-xs transition-colors"
                >
                  {reassigning ? "Resetting…" : "Return to orders →"}
                </button>
                <button
                  onClick={() => setShowDrivers(true)}
                  className="border border-[#E8E8E8] hover:border-[#0D0D0D] text-[#0D0D0D] font-semibold px-5 py-2 rounded-full text-xs transition-colors"
                >
                  Reassign →
                </button>
              </div>
              <CancelButton jobId={job.id} onCancelled={onReassigned} />
            </div>
          ) : (
            <div>
              <div className="mb-3">
                <label className="block text-[#888888] text-[10px] uppercase tracking-[0.1em] mb-1">Job price</label>
                <div className="relative w-36">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#888888] text-sm">£</span>
                  <input type="number" value={price} onChange={e => setPrice(e.target.value)} placeholder="e.g. 180" className="w-full pl-7 pr-3 py-2 border border-[#E8E8E8] rounded-lg text-sm focus:outline-none focus:border-[#0D0D0D]" />
                </div>
              </div>
              <div className="space-y-2">
                {drivers.filter(d => d.id !== job.driver_id).map(driver => (
                  <div key={driver.id} className="flex items-center justify-between gap-3 bg-[#F5F5F5] rounded-xl px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full shrink-0 ${isOnline(driver.last_seen_at) ? "bg-green-500" : "bg-[#D0D0D0]"}`} />
                      <div>
                        <p className="font-sans font-semibold text-[#0D0D0D] text-sm">{driver.full_name}</p>
                        <p className="text-[#888888] text-xs">{driver.area} · {driver.vehicle_type}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => assignTo(driver.id)}
                      disabled={!!assigning}
                      className="bg-[#0D0D0D] hover:bg-[#333333] disabled:opacity-40 text-white font-semibold px-4 py-1.5 rounded-full text-xs transition-colors shrink-0"
                    >
                      {assigning === driver.id ? "Assigning…" : "Assign →"}
                    </button>
                  </div>
                ))}
              </div>
              <button onClick={() => setShowDrivers(false)} className="mt-3 text-[#888888] text-xs hover:text-[#0D0D0D] transition-colors">← Back</button>
            </div>
          )}

          <JobTimeline job={job} />
        </div>
      )}
    </div>
  );
}

// ─── Active job row (Confirmed + En route — expandable) ───────────────────────

function ActiveJobRow({
  job,
  type,
  onCancelled,
}: {
  job: Job;
  type: "confirmed" | "in_progress";
  onCancelled: (id: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="bg-white border border-[#E8E8E8] rounded-2xl overflow-hidden">
      <button
        className="w-full text-left px-5 py-4 flex items-center justify-between gap-4 hover:bg-[#F5F5F5] transition-colors"
        onClick={() => setExpanded(e => !e)}
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <p className="font-sans font-bold text-[#0D0D0D] text-sm">{job.service_type || "Removal"}</p>
            <CopyRef reference={job.reference} />
            {type === "in_progress" && (
              <AdminEtaBadge
                jobId={job.id}
                initialEta={job.driver_eta_minutes ?? null}
                initialSharing={!!job.location_sharing_since && job.driver_eta_minutes != null}
              />
            )}
          </div>
          <p className="text-[#888888] text-xs">
            {job.postcode_from}{job.postcode_to ? ` → ${job.postcode_to}` : ""} · {job.customer_name || "—"}
          </p>
          {job.driver_name && (
            <p className="text-[#888888] text-xs mt-0.5">{job.driver_name}</p>
          )}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {job.customer_phone && <QuickDial phone={job.customer_phone} />}
          <span className={`text-[10px] font-semibold px-2.5 py-1 rounded-full uppercase tracking-[0.1em] ${
            type === "in_progress" ? "bg-[#0D0D0D] text-white" : "bg-[#F5F5F5] text-[#888888] border border-[#E8E8E8]"
          }`}>
            {type === "in_progress" ? "En route" : "Confirmed"}
          </span>
        </div>
      </button>

      {expanded && (
        <div className="px-5 pb-5 border-t border-[#E8E8E8]">
          <div className="py-4 grid grid-cols-2 gap-3">
            {job.driver_name && <div>
              <p className="text-[#888888] text-[10px] uppercase tracking-[0.1em]">Driver</p>
              <p className="text-[#0D0D0D] text-sm font-semibold">{job.driver_name}</p>
            </div>}
            {job.driver_phone && <div>
              <p className="text-[#888888] text-[10px] uppercase tracking-[0.1em]">Driver phone</p>
              <a href={`tel:${job.driver_phone}`} className="text-[#0D0D0D] text-sm font-semibold hover:underline">{job.driver_phone}</a>
            </div>}
            {job.customer_name && <div>
              <p className="text-[#888888] text-[10px] uppercase tracking-[0.1em]">Customer</p>
              <p className="text-[#0D0D0D] text-sm">{job.customer_name}</p>
            </div>}
            {job.customer_phone && <div>
              <p className="text-[#888888] text-[10px] uppercase tracking-[0.1em]">Customer phone</p>
              <a href={`tel:${job.customer_phone}`} className="text-[#0D0D0D] text-sm font-semibold hover:underline">{job.customer_phone}</a>
            </div>}
            {job.customer_email && <div className="col-span-2">
              <p className="text-[#888888] text-[10px] uppercase tracking-[0.1em]">Customer email</p>
              <a href={`mailto:${job.customer_email}`} className="text-[#0D0D0D] text-sm hover:underline">{job.customer_email}</a>
            </div>}
            {job.price && <div>
              <p className="text-[#888888] text-[10px] uppercase tracking-[0.1em]">Price</p>
              <p className="font-sans font-black text-[#0D0D0D] text-sm">£{Number(job.price).toFixed(0)}</p>
            </div>}
            {job.timeframe && <div>
              <p className="text-[#888888] text-[10px] uppercase tracking-[0.1em]">Timeframe</p>
              <p className="text-[#0D0D0D] text-sm">{job.timeframe}</p>
            </div>}
          </div>

          <JobTimeline job={job} />

          {type === "confirmed" && job.driver_phone && (
            <div className="mt-4 pt-4 border-t border-[#E8E8E8]">
              <p className="text-[10px] uppercase tracking-[0.1em] text-[#888888] mb-3 font-semibold">Follow-up</p>
              <div className="flex gap-2">
                <a
                  href={`tel:${job.driver_phone}`}
                  className="flex-1 bg-[#0D0D0D] hover:bg-[#333333] text-white font-semibold px-4 py-2 rounded-full text-xs transition-colors text-center"
                >
                  Call driver
                </a>
                {job.driver_phone && <SmsButton phone={job.driver_phone} driverName={job.driver_name || "Driver"} />}
              </div>
            </div>
          )}

          <div className="mt-4 pt-4 border-t border-[#E8E8E8]">
            <CancelButton jobId={job.id} onCancelled={onCancelled} />
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Main panel ───────────────────────────────────────────────────────────────

interface Props {
  pendingJobs: Record<string, unknown>[];
  offeredJobs: Record<string, unknown>[];
  confirmedJobs: Record<string, unknown>[];
  inProgressJobs: Record<string, unknown>[];
  drivers: Record<string, unknown>[];
  completedJobs: Record<string, unknown>[];
}

export default function AdminPanel({ pendingJobs, offeredJobs, confirmedJobs, inProgressJobs, drivers, completedJobs }: Props) {
  const router = useRouter();
  const [pending, setPending] = useState(pendingJobs as unknown as Job[]);
  const [offered, setOffered] = useState(offeredJobs as unknown as Job[]);
  const [completedOpen, setCompletedOpen] = useState(false);
  const [completedSearch, setCompletedSearch] = useState("");
  const [expandedAwaitingDrivers, setExpandedAwaitingDrivers] = useState(false);
  const [expandedFleet, setExpandedFleet] = useState(false);
  const [expandedConfirmed, setExpandedConfirmed] = useState(false);
  const [expandedCustomers, setExpandedCustomers] = useState(false);

  function removeJob(jobId: string) {
    setPending(prev => prev.filter(j => j.id !== jobId));
    router.refresh();
  }

  function removeOffered(jobId: string) {
    setOffered(prev => prev.filter(j => j.id !== jobId));
    router.refresh();
  }

  const typedDrivers = drivers as unknown as Driver[];
  const onlineCount = typedDrivers.filter(d => isOnline(d.last_seen_at)).length;

  const filteredCompleted = completedSearch.trim()
    ? (completedJobs as unknown as Job[]).filter(j => {
        const q = completedSearch.toLowerCase();
        return (
          String(j.reference ?? "").toLowerCase().includes(q) ||
          String(j.customer_name ?? "").toLowerCase().includes(q) ||
          String(j.postcode_from ?? "").toLowerCase().includes(q) ||
          String(j.postcode_to ?? "").toLowerCase().includes(q)
        );
      })
    : (completedJobs as unknown as Job[]);

  return (
    <div className="space-y-8">

      {/* En route ─────────────────────────────────────────────────────────── */}
      {inProgressJobs.length > 0 && (
        <div id="section-enroute">
          <p className="text-[10px] font-semibold text-[#888888] uppercase tracking-[0.2em] mb-3">
            En route ({inProgressJobs.length})
          </p>
          <div className="space-y-2">
            {(inProgressJobs as unknown as Job[]).map((job: Job) => (
              <ActiveJobRow
                key={job.id}
                job={job}
                type="in_progress"
                onCancelled={() => router.refresh()}
              />
            ))}
          </div>
        </div>
      )}

      {/* Customers ──────────────────────────────────────────────────────────── */}
      {pending.length > 0 && (
        <div id="section-orders">
          <button
            onClick={() => setExpandedCustomers(v => !v)}
            className="w-full flex items-center justify-between mb-3"
          >
            <span className="text-[10px] font-semibold text-[#888888] uppercase tracking-[0.2em]">
              Customer{pending.length !== 1 ? "s" : ""}
            </span>
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-[#888888]">
                {pending.length}
              </span>
              <ChevronDown
                className={`w-4 h-4 text-[#888888] transition-transform ${
                  expandedCustomers ? "rotate-180" : ""
                }`}
              />
            </div>
          </button>
          {expandedCustomers && (
            <div className="space-y-3">
              {pending.map(job => (
                <JobRow key={job.id} job={job} drivers={typedDrivers} onAssigned={removeJob} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Awaiting driver ───────────────────────────────────────────────────── */}
      {offered.length > 0 && (
        <div id="section-awaiting">
          <button
            onClick={() => setExpandedAwaitingDrivers(v => !v)}
            className="w-full flex items-center justify-between mb-3"
          >
            <span className="text-[10px] font-semibold text-[#888888] uppercase tracking-[0.2em]">
              Awaiting Driver
            </span>
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-[#888888]">
                {offered.length}
              </span>
              <ChevronDown
                className={`w-4 h-4 text-[#888888] transition-transform ${
                  expandedAwaitingDrivers ? "rotate-180" : ""
                }`}
              />
            </div>
          </button>
          {expandedAwaitingDrivers && (
            <div className="space-y-2">
              {offered.map(job => (
                <OfferedJobRow key={job.id} job={job} drivers={typedDrivers} onReassigned={removeOffered} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Confirmed ─────────────────────────────────────────────────────────── */}
      {confirmedJobs.length > 0 && (
        <div id="section-confirmed">
          <button
            onClick={() => setExpandedConfirmed(v => !v)}
            className="w-full flex items-center justify-between mb-3"
          >
            <span className="text-[10px] font-semibold text-[#888888] uppercase tracking-[0.2em]">
              Confirmed
            </span>
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-[#888888]">
                {confirmedJobs.length}
              </span>
              <ChevronDown
                className={`w-4 h-4 text-[#888888] transition-transform ${
                  expandedConfirmed ? "rotate-180" : ""
                }`}
              />
            </div>
          </button>
          {expandedConfirmed && (
            <div className="space-y-2">
              {(confirmedJobs as unknown as Job[]).map((job: Job) => (
                <ActiveJobRow
                  key={job.id}
                  job={job}
                  type="confirmed"
                  onCancelled={() => router.refresh()}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Fleet ─────────────────────────────────────────────────────────────── */}
      <div id="section-fleet">
        <button
          onClick={() => setExpandedFleet(v => !v)}
          className="w-full flex items-center justify-between mb-3"
        >
          <span className="text-[10px] font-semibold text-[#888888] uppercase tracking-[0.2em]">
            Fleet
          </span>
          <div className="flex items-center gap-2">
            {onlineCount > 0 && (
              <span className="text-[10px] text-green-600 font-semibold uppercase tracking-[0.12em]">
                {onlineCount} online
              </span>
            )}
            <span className="text-[10px] text-[#888888]">
              {typedDrivers.length}
            </span>
            <ChevronDown
              className={`w-4 h-4 text-[#888888] transition-transform ${
                expandedFleet ? "rotate-180" : ""
              }`}
            />
          </div>
        </button>
        {expandedFleet && (
          <>
            {typedDrivers.length === 0 ? (
              <div className="bg-[#F5F5F5] border border-[#E8E8E8] rounded-2xl px-5 py-4">
                <p className="text-[#888888] text-sm">No active drivers yet.</p>
              </div>
            ) : (
              <div className="bg-white border border-[#E8E8E8] rounded-2xl overflow-hidden divide-y divide-[#E8E8E8]">
                {typedDrivers.map(driver => {
                  const online = isOnline(driver.last_seen_at);
                  return (
                    <div key={driver.id} className="flex items-start gap-3 px-5 py-3.5">
                      <span className={`w-2 h-2 rounded-full shrink-0 mt-1.5 ${online ? "bg-green-500" : "bg-[#D0D0D0]"}`} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-sans font-semibold text-[#0D0D0D] text-sm">{driver.full_name}</p>
                          <span className="text-[#888888] text-xs">{driver.vehicle_type}</span>
                          <span className="text-[#D0D0D0] text-xs">·</span>
                          <span className="text-[#888888] text-xs">{driver.area}</span>
                          {driver.rating_avg != null && Number(driver.rating_avg) > 0 && (
                            <>
                              <span className="text-[#D0D0D0] text-xs">·</span>
                              <span className="text-[#888888] text-xs">★ {Number(driver.rating_avg).toFixed(1)}{driver.rating_count ? ` (${driver.rating_count})` : ""}</span>
                            </>
                          )}
                        </div>
                        <p className={`text-[10px] mt-0.5 ${online ? "text-green-600 font-semibold" : "text-[#888888]"}`}>
                          {lastSeenLabel(driver.last_seen_at)}
                          {driver.avg_response_mins != null && (
                            <span className="text-[#888888] font-normal ml-2">avg {driver.avg_response_mins}min response</span>
                          )}
                        </p>
                        {driver.current_job_ref && (
                          <p className="text-[10px] text-[#888888] mt-0.5">
                            On job{" "}
                            <span className="font-mono text-[#0D0D0D]">{driver.current_job_ref}</span>
                            {" · "}{driver.current_job_from}{driver.current_job_to ? ` → ${driver.current_job_to}` : ""}
                            {driver.current_job_status === "in_progress" && (
                              <span className="ml-1 text-green-600 font-semibold">· En route</span>
                            )}
                          </p>
                        )}
                      </div>
                      {driver.phone && (
                        <div className="flex items-center gap-3 shrink-0">
                          <a href={`tel:${driver.phone}`} className="text-[#0D0D0D] text-xs font-semibold hover:underline whitespace-nowrap">
                            {driver.phone}
                          </a>
                          <SmsButton phone={driver.phone} driverName={driver.full_name} />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>

      {/* Completed ─────────────────────────────────────────────────────────── */}
      {completedJobs.length > 0 && (
        <div id="section-completed">
          <button
            onClick={() => setCompletedOpen(o => !o)}
            className="w-full flex items-center justify-between mb-3"
          >
            <span className="text-[10px] font-semibold text-[#888888] uppercase tracking-[0.2em]">
              Completed
            </span>
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-[#888888]">
                {completedJobs.length}
              </span>
              <ChevronDown
                className={`w-4 h-4 text-[#888888] transition-transform ${
                  completedOpen ? "rotate-180" : ""
                }`}
              />
            </div>
          </button>
          {completedOpen && (
            <>
              <div className="mb-3">
                <input
                  type="text"
                  value={completedSearch}
                  onChange={e => setCompletedSearch(e.target.value)}
                  placeholder="Search by reference, customer, or postcode…"
                  className="w-full px-4 py-2.5 border border-[#E8E8E8] rounded-xl text-sm text-[#0D0D0D] placeholder:text-[#888888] focus:outline-none focus:border-[#0D0D0D] transition-colors"
                />
              </div>
              {filteredCompleted.length === 0 ? (
                <p className="text-[#888888] text-sm text-center py-6">No results.</p>
              ) : (
                <div className="bg-white border border-[#E8E8E8] rounded-2xl overflow-hidden divide-y divide-[#E8E8E8]">
                  {filteredCompleted.map(job => (
                    <div key={job.id} className="px-5 py-4">
                      <div className="flex items-start justify-between gap-4 mb-2">
                        <div>
                          <div className="flex items-center gap-2 mb-0.5">
                            <p className="font-sans font-semibold text-[#0D0D0D] text-sm">{job.service_type || "Job"}</p>
                            <CopyRef reference={job.reference} />
                          </div>
                          <p className="text-[#888888] text-xs">
                            {job.postcode_from}{job.postcode_to ? ` → ${job.postcode_to}` : ""}
                            {job.driver_name ? ` · ${job.driver_name}` : ""}
                          </p>
                        </div>
                        <div className="text-right shrink-0">
                          {job.price != null ? (
                            <p className="font-sans font-black text-[#0D0D0D] text-sm">£{Number(job.price).toFixed(0)}</p>
                          ) : (
                            <p className="text-[#888888] text-[10px]">No price</p>
                          )}
                          <p className="text-[#888888] text-[10px]">{timeAgo(job.updated_at as string)}</p>
                        </div>
                      </div>
                      <div className="space-y-1 text-xs text-[#888888]">
                        {job.customer_name && <div><span className="text-[#0D0D0D] font-medium">{job.customer_name}</span></div>}
                        {job.customer_phone && <div><a href={`tel:${job.customer_phone}`} className="text-[#0D0D0D] font-medium hover:underline">{job.customer_phone}</a></div>}
                        {job.customer_email && <div className="truncate"><a href={`mailto:${job.customer_email}`} className="text-[#888888] hover:text-[#0D0D0D] hover:underline truncate">{job.customer_email}</a></div>}
                        <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                          {job.timeframe && <span>Timeframe: {job.timeframe}</span>}
                          {job.duration && <span>Duration: {job.duration}</span>}
                        </div>
                      </div>
                      <JobTimeline job={job} />
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
