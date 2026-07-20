import { neon } from "@neondatabase/serverless";
import { notFound } from "next/navigation";
import TrackingLive from "@/components/TrackingLive";

const STATUS_STEPS = [
  { key: "pending_review", label: "Request received" },
  { key: "offered", label: "Finding your driver" },
  { key: "confirmed", label: "Driver confirmed" },
  { key: "in_progress", label: "In progress" },
  { key: "completed", label: "Completed" },
];

function stepIndex(status: string) {
  const i = STATUS_STEPS.findIndex(s => s.key === status);
  return i === -1 ? 0 : i;
}

async function getJob(token: string) {
  if (!process.env.DATABASE_URL) return null;
  const sql = neon(process.env.DATABASE_URL);
  const rows = await sql`
    SELECT j.*, d.full_name as driver_name, d.vehicle_type, d.rating_avg
    FROM jobs j
    LEFT JOIN drivers d ON d.id = j.driver_id
    WHERE j.tracking_token = ${token}
    LIMIT 1
  `;
  return rows[0] ?? null;
}

export default async function TrackPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const job = await getJob(token);

  if (!job) notFound();

  const currentStep = stepIndex(job.status as string);
  const isComplete = job.status === "completed";
  const isCancelled = job.status === "cancelled";
  const driverFirstName = ((job.driver_name as string) ?? "").split(" ")[0] || "Your driver";
  const isSharing = !!job.location_sharing_since && job.driver_eta_minutes != null;

  return (
    <div className="min-h-screen bg-[#F5F5F5]">
      <div className="max-w-lg mx-auto px-6 py-12">

        {/* Brand */}
        <div className="mb-10">
          <p className="font-sans font-black text-[#0D0D0D] text-sm tracking-tight">
            Saint <span className="font-display italic font-normal">&amp;</span> Story
          </p>
          <div className="border-t border-[#0D0D0D] mt-1 mb-1 w-24" />
          <p className="font-sans font-medium text-[#0D0D0D] text-[9px] tracking-[0.3em] uppercase">Logistics</p>
        </div>

        <p className="text-[10px] font-semibold text-[#888888] uppercase tracking-[0.2em] mb-1">Your move</p>
        <h1 className="font-sans font-black text-[#0D0D0D] text-3xl tracking-tight mb-2">
          {isCancelled ? "Cancelled." : isComplete ? "C<span class='font-display italic font-normal'>o</span>mpleted." : "In progress."}
        </h1>
        <p className="text-[#888888] text-sm mb-8">Ref: {job.reference as string}</p>

        {/* Progress */}
        {!isCancelled && (
          <div className="bg-white border border-[#E8E8E8] rounded-2xl px-5 py-5 mb-4">
            <div className="space-y-4">
              {STATUS_STEPS.map((s, i) => {
                const done = i <= currentStep;
                const active = i === currentStep;
                return (
                  <div key={s.key} className="flex items-center gap-4">
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${
                      done ? "bg-[#0D0D0D] border-[#0D0D0D]" : "border-[#E8E8E8]"
                    }`}>
                      {done && <div className="w-2 h-2 rounded-full bg-white" />}
                    </div>
                    <p className={`text-sm transition-colors ${
                      active ? "font-semibold text-[#0D0D0D]" : done ? "text-[#888888]" : "text-[#E8E8E8]"
                    }`}>
                      {s.label}
                    </p>
                    {active && (
                      <div className="w-1.5 h-1.5 rounded-full bg-[#0D0D0D] animate-pulse ml-auto" />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Live ETA — shows when driver is en route */}
        {!isCancelled && !isComplete && (
          <div className="mb-4">
            <TrackingLive
              trackingToken={token}
              driverFirstName={driverFirstName}
              initialEta={job.driver_eta_minutes as number | null}
              initialSharing={isSharing}
            />
          </div>
        )}

        {/* Job details */}
        <div className="bg-white border border-[#E8E8E8] rounded-2xl px-5 py-4 space-y-3 mb-4">
          {job.postcode_from && (
            <div className="flex items-start justify-between gap-4">
              <p className="text-[#888888] text-xs uppercase tracking-[0.1em]">Route</p>
              <p className="font-sans font-semibold text-[#0D0D0D] text-sm text-right">
                {job.postcode_from as string}{job.postcode_to ? ` → ${job.postcode_to as string}` : ""}
                {job.distance_miles ? ` · ${job.distance_miles as number} mi` : ""}
              </p>
            </div>
          )}
          {job.service_type && (
            <div className="flex items-start justify-between gap-4 border-t border-[#E8E8E8] pt-3">
              <p className="text-[#888888] text-xs uppercase tracking-[0.1em]">Service</p>
              <p className="font-sans font-semibold text-[#0D0D0D] text-sm text-right">{job.service_type as string}</p>
            </div>
          )}
        </div>

        {/* Driver card */}
        {job.driver_name && (
          <div className="bg-[#0D0D0D] rounded-2xl px-5 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center">
                <span className="font-sans font-black text-white text-xs">
                  {(job.driver_name as string).split(" ").map((n: string) => n[0]).join("").slice(0, 2)}
                </span>
              </div>
              <div>
                <p className="font-sans font-semibold text-white text-sm">{job.driver_name as string}</p>
                <p className="text-white/55 text-xs">{job.vehicle_type as string}</p>
              </div>
            </div>
            {job.rating_avg && Number(job.rating_avg) > 0 && (
              <p className="font-sans font-black text-white text-sm">{Number(job.rating_avg).toFixed(1)} ★</p>
            )}
          </div>
        )}

        <p className="text-[#888888] text-xs text-center mt-8">
          Questions?{" "}
          <a href="tel:+442030517408" className="text-[#0D0D0D] font-semibold hover:underline underline-offset-2">
            0203 432 3991
          </a>
        </p>

      </div>
    </div>
  );
}
