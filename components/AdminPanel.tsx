"use client";

import { useState } from "react";
import SmsButton from "@/components/SmsButton";

interface Driver {
  id: string;
  full_name: string;
  area: string;
  vehicle_type: string;
  phone: string;
  rating_avg: number | null;
  rating_count: number | null;
  last_seen_at: string | null;
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
  created_at: string;
  driver_name?: string;
  driver_phone?: string;
}

function suggestDrivers(job: Job, drivers: Driver[]) {
  const prefix = (job.postcode_from ?? "").split(" ")[0].toLowerCase();
  return drivers
    .filter(d => (d.area ?? "").toLowerCase().includes(prefix))
    .slice(0, 5);
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

function JobRow({
  job,
  drivers,
  onAssigned,
}: {
  job: Job;
  drivers: Driver[];
  onAssigned: (jobId: string) => void;
}) {
  const [assigning, setAssigning] = useState<string | null>(null);
  const [price, setPrice] = useState("");
  const [expanded, setExpanded] = useState(false);

  const suggested = suggestDrivers(job, drivers);
  const allDrivers = drivers;
  const [showAll, setShowAll] = useState(false);
  const displayDrivers = showAll ? allDrivers : suggested;

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
      {/* Job header */}
      <button
        className="w-full text-left px-5 py-4 flex items-start justify-between gap-4 hover:bg-[#F5F5F5] transition-colors"
        onClick={() => setExpanded(e => !e)}
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <p className="font-sans font-bold text-[#0D0D0D] text-sm">{job.service_type || "Removal"}</p>
            <span className="text-[10px] font-mono text-[#888888]">{job.reference}</span>
          </div>
          <p className="text-[#888888] text-xs">
            {job.postcode_from}{job.postcode_to ? ` → ${job.postcode_to}` : ""}
            {job.customer_name ? ` · ${job.customer_name}` : ""}
          </p>
        </div>
        <div className="shrink-0 text-right">
          <p className="text-[#888888] text-[10px]">{timeAgo(job.created_at)}</p>
          {isStale(job.created_at) && (
            <span className="inline-block mt-0.5 text-[9px] font-bold uppercase tracking-[0.1em] text-white bg-red-500 px-1.5 py-0.5 rounded-full">Urgent</span>
          )}
        </div>
      </button>

      {expanded && (
        <div className="px-5 pb-5 border-t border-[#E8E8E8]">
          {/* Customer details */}
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
                <p className="text-[#888888] text-[10px] uppercase tracking-[0.1em]">Collection address</p>
                <p className="text-[#0D0D0D] text-sm">{job.address_from} · {job.postcode_from}</p>
              </div>
            )}
            {job.address_to && (
              <div className="col-span-2">
                <p className="text-[#888888] text-[10px] uppercase tracking-[0.1em]">Delivery address</p>
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

          {/* Price field */}
          <div className="mb-4">
            <label className="block text-[#888888] text-[10px] uppercase tracking-[0.1em] mb-1">
              Set job price (optional)
            </label>
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

          {/* Driver suggestions */}
          <div>
            <p className="text-[#888888] text-[10px] uppercase tracking-[0.1em] mb-2">
              {suggested.length > 0 ? `Suggested drivers (${job.postcode_from?.split(" ")[0]})` : "Assign driver"}
            </p>
            {displayDrivers.length === 0 && (
              <p className="text-[#888888] text-xs italic">No drivers in this area yet.</p>
            )}
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
            {!showAll && allDrivers.length > suggested.length && (
              <button
                onClick={() => setShowAll(true)}
                className="mt-2 text-[#888888] text-xs hover:text-[#0D0D0D] transition-colors"
              >
                Show all {allDrivers.length} drivers →
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function OfferedJobRow({ job }: { job: Job }) {
  return (
    <div className="bg-[#F5F5F5] border border-[#E8E8E8] rounded-2xl px-5 py-4 flex items-center justify-between gap-4">
      <div>
        <p className="font-sans font-semibold text-[#0D0D0D] text-sm">{job.service_type || "Removal"}</p>
        <p className="text-[#888888] text-xs">
          {job.postcode_from}{job.postcode_to ? ` → ${job.postcode_to}` : ""}
          {job.driver_name ? ` · Offered to ${job.driver_name}` : ""}
        </p>
      </div>
      <span className="text-[10px] font-semibold text-[#888888] bg-white border border-[#E8E8E8] px-2.5 py-1 rounded-full uppercase tracking-[0.1em] shrink-0">
        Awaiting response
      </span>
    </div>
  );
}

interface Props {
  pendingJobs: Record<string, unknown>[];
  offeredJobs: Record<string, unknown>[];
  confirmedJobs: Record<string, unknown>[];
  inProgressJobs: Record<string, unknown>[];
  drivers: Record<string, unknown>[];
  completedJobs: Record<string, unknown>[];
}

export default function AdminPanel({ pendingJobs, offeredJobs, confirmedJobs, inProgressJobs, drivers, completedJobs }: Props) {
  const [pending, setPending] = useState(pendingJobs as unknown as Job[]);

  function removeJob(jobId: string) {
    setPending(prev => prev.filter(j => j.id !== jobId));
  }

  const typedDrivers = drivers as unknown as Driver[];
  const typedOffered = offeredJobs as unknown as Job[];
  const onlineCount = typedDrivers.filter(d => isOnline(d.last_seen_at)).length;

  return (
    <div className="space-y-8">
      {/* Online drivers */}
      <div>
        <p className="text-[10px] font-semibold text-[#888888] uppercase tracking-[0.2em] mb-3">
          Drivers online ({onlineCount})
        </p>
        {onlineCount === 0 ? (
          <div className="bg-[#F5F5F5] border border-[#E8E8E8] rounded-2xl px-5 py-4">
            <p className="text-[#888888] text-sm">No drivers online right now.</p>
          </div>
        ) : (
          <div className="bg-white border border-[#E8E8E8] rounded-2xl overflow-hidden divide-y divide-[#E8E8E8]">
            {typedDrivers.filter(d => isOnline(d.last_seen_at)).map(driver => (
              <div key={driver.id} className="px-5 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="w-2 h-2 rounded-full bg-green-500 shrink-0" />
                    <div>
                      <p className="font-sans font-semibold text-[#0D0D0D] text-sm">{driver.full_name}</p>
                      <p className="text-[#888888] text-xs">{driver.area} · {driver.vehicle_type}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    {driver.rating_avg ? (
                      <p className="text-[#888888] text-xs">★ {Number(driver.rating_avg).toFixed(1)}{driver.rating_count ? ` (${driver.rating_count})` : ""}</p>
                    ) : null}
                    <p className="text-[10px] text-green-600 font-semibold uppercase tracking-[0.1em] mt-0.5">Online now</p>
                  </div>
                </div>
                {driver.phone && (
                  <div className="flex items-center gap-4 mt-2 pl-5">
                    <a href={`tel:${driver.phone}`} className="text-[#0D0D0D] text-xs font-semibold hover:underline">
                      📞 {driver.phone}
                    </a>
                    <SmsButton phone={driver.phone} driverName={driver.full_name} />
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Pending jobs — need assignment */}
      <div>
        <p className="text-[10px] font-semibold text-[#888888] uppercase tracking-[0.2em] mb-3">
          Needs a driver ({pending.length})
        </p>
        {pending.length === 0 ? (
          <div className="bg-[#F5F5F5] border border-[#E8E8E8] rounded-2xl p-8 text-center">
            <p className="text-[#888888] text-sm">All clear — no pending jobs.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {pending.map(job => (
              <JobRow
                key={job.id}
                job={job}
                drivers={typedDrivers}
                onAssigned={removeJob}
              />
            ))}
          </div>
        )}
      </div>

      {/* Offered jobs — waiting on driver */}
      {typedOffered.length > 0 && (
        <div>
          <p className="text-[10px] font-semibold text-[#888888] uppercase tracking-[0.2em] mb-3">
            Awaiting driver response ({typedOffered.length})
          </p>
          <div className="space-y-2">
            {typedOffered.map(job => (
              <OfferedJobRow key={job.id} job={job} />
            ))}
          </div>
        </div>
      )}

      {/* Confirmed jobs — driver accepted, not started */}
      {confirmedJobs.length > 0 && (
        <div>
          <p className="text-[10px] font-semibold text-[#888888] uppercase tracking-[0.2em] mb-3">
            Confirmed — awaiting start ({confirmedJobs.length})
          </p>
          <div className="bg-white border border-[#E8E8E8] rounded-2xl overflow-hidden divide-y divide-[#E8E8E8]">
            {confirmedJobs.map((job) => (
              <div key={job.id as string} className="flex items-center justify-between px-5 py-4 gap-4">
                <div>
                  <p className="font-sans font-semibold text-[#0D0D0D] text-sm">
                    {String(job.service_type || "Job")} · <span className="font-mono text-[10px] text-[#888888]">{String(job.reference)}</span>
                  </p>
                  <p className="text-[#888888] text-xs">
                    {String(job.postcode_from)}{job.postcode_to ? ` → ${String(job.postcode_to)}` : ""} · {String(job.customer_name || "—")}
                  </p>
                  {job.driver_name != null && (
                    <p className="text-xs mt-0.5">
                      Driver: <span className="text-[#0D0D0D] font-medium">{String(job.driver_name)}</span>
                      {job.driver_phone != null && <> · <a href={`tel:${String(job.driver_phone)}`} className="text-[#0D0D0D] font-medium hover:underline">{String(job.driver_phone)}</a></>}
                    </p>
                  )}
                </div>
                <span className="text-[10px] font-semibold text-[#888888] bg-[#F5F5F5] border border-[#E8E8E8] px-2.5 py-1 rounded-full uppercase tracking-[0.1em] shrink-0">Confirmed</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* In progress jobs — driver en route */}
      {inProgressJobs.length > 0 && (
        <div>
          <p className="text-[10px] font-semibold text-[#888888] uppercase tracking-[0.2em] mb-3">
            In progress ({inProgressJobs.length})
          </p>
          <div className="bg-white border border-[#E8E8E8] rounded-2xl overflow-hidden divide-y divide-[#E8E8E8]">
            {inProgressJobs.map((job) => (
              <div key={job.id as string} className="flex items-center justify-between px-5 py-4 gap-4">
                <div>
                  <p className="font-sans font-semibold text-[#0D0D0D] text-sm">
                    {String(job.service_type || "Job")} · <span className="font-mono text-[10px] text-[#888888]">{String(job.reference)}</span>
                  </p>
                  <p className="text-[#888888] text-xs">
                    {String(job.postcode_from)}{job.postcode_to ? ` → ${String(job.postcode_to)}` : ""} · {String(job.customer_name || "—")}
                  </p>
                  {job.driver_name != null && (
                    <p className="text-xs mt-0.5">
                      Driver: <span className="text-[#0D0D0D] font-medium">{String(job.driver_name)}</span>
                      {job.driver_phone != null && <> · <a href={`tel:${String(job.driver_phone)}`} className="text-[#0D0D0D] font-medium hover:underline">{String(job.driver_phone)}</a></>}
                    </p>
                  )}
                  {job.customer_phone != null && (
                    <p className="text-xs mt-0.5">
                      Customer: <a href={`tel:${String(job.customer_phone)}`} className="text-[#0D0D0D] font-medium hover:underline">{String(job.customer_phone)}</a>
                    </p>
                  )}
                </div>
                <span className="text-[10px] font-semibold text-white bg-[#0D0D0D] px-2.5 py-1 rounded-full uppercase tracking-[0.1em] shrink-0">En route</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Completed jobs */}
      {completedJobs.length > 0 && (
        <div>
          <p className="text-[10px] font-semibold text-[#888888] uppercase tracking-[0.2em] mb-3">
            Completed ({completedJobs.length})
          </p>
          <div className="bg-white border border-[#E8E8E8] rounded-2xl overflow-hidden divide-y divide-[#E8E8E8]">
            {completedJobs.map((job) => (
              <div key={job.id as string} className="px-5 py-4">
                <div className="flex items-start justify-between gap-4 mb-2">
                  <div>
                    <div className="flex items-center gap-2 mb-0.5">
                      <p className="font-sans font-semibold text-[#0D0D0D] text-sm">{(job.service_type as string) || "Job"}</p>
                      <span className="text-[10px] font-mono text-[#888888]">{job.reference as string}</span>
                    </div>
                    <p className="text-[#888888] text-xs">
                      {job.postcode_from as string}{job.postcode_to ? ` → ${job.postcode_to as string}` : ""}
                      {job.driver_name ? ` · ${job.driver_name as string}` : ""}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    {job.price ? (
                      <p className="font-sans font-black text-[#0D0D0D] text-sm">£{Number(job.price).toFixed(0)}</p>
                    ) : null}
                    <p className="text-[#888888] text-[10px]">{timeAgo(job.updated_at as string)}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-[#888888]">
                  {job.customer_name != null && <span><span className="text-[#0D0D0D] font-medium">{String(job.customer_name)}</span></span>}
                  {job.customer_phone != null && <a href={`tel:${String(job.customer_phone)}`} className="text-[#0D0D0D] font-medium hover:underline">{String(job.customer_phone)}</a>}
                  {job.customer_email != null && <a href={`mailto:${String(job.customer_email)}`} className="col-span-2 text-[#888888] hover:text-[#0D0D0D] hover:underline truncate">{String(job.customer_email)}</a>}
                  {job.timeframe != null && <span>Timeframe: {String(job.timeframe)}</span>}
                  {job.duration != null && <span>Duration: {String(job.duration)}</span>}
                  {job.help_loading != null && <span>Loading help: {String(job.help_loading)}</span>}
                  {job.large_items != null && String(job.large_items) !== "[]" && (
                    <span className="col-span-2">Items: {
                      (() => { try { const a = JSON.parse(String(job.large_items)); return Array.isArray(a) ? a.join(", ") : String(job.large_items); } catch { return String(job.large_items); } })()
                    }</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
