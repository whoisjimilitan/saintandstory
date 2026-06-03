"use client";

import { useState } from "react";

interface Job {
  id: string;
  reference: string;
  status: string;
  postcodeFrom?: string;
  postcodeTo?: string;
  price?: number;
  arrivedPickupAt?: string;
  collectedAt?: string;
  arrivedDeliveryAt?: string;
  completedAt?: string;
}

interface JobEvent {
  id: string;
  eventType: string;
  timestamp: string;
  latitude?: number;
  longitude?: number;
}

export default function DriverJobDetail({ job, timeline }: { job: Job; timeline: JobEvent[] }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const recordEvent = async (eventType: string, needsPhoto: boolean = false) => {
    setLoading(true);
    setError("");

    try {
      const position = await getLocation();

      if (needsPhoto) {
        const file = await capturePhoto();
        const formData = new FormData();
        formData.append("jobId", job.id);
        formData.append("eventType", eventType);
        formData.append("latitude", position?.latitude || "");
        formData.append("longitude", position?.longitude || "");
        formData.append("file", file);

        await fetch("/api/driver/job-photo", {
          method: "POST",
          body: formData,
        });
      } else {
        await fetch("/api/driver/job-event", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            jobId: job.id,
            eventType,
            latitude: position?.latitude,
            longitude: position?.longitude,
          }),
        });
      }

      window.location.reload();
    } catch (err) {
      setError(String(err));
    } finally {
      setLoading(false);
    }
  };

  const getLocation = async () => {
    return new Promise<{ latitude: number; longitude: number }>((resolve) => {
      navigator.geolocation.getCurrentPosition((pos) => {
        resolve({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
        });
      });
    });
  };

  const capturePhoto = async (): Promise<File> => {
    return new Promise((resolve) => {
      const input = document.createElement("input");
      input.type = "file";
      input.accept = "image/*";
      input.onchange = (e) => {
        const file = (e.target as HTMLInputElement).files?.[0];
        if (file) resolve(file);
      };
      input.click();
    });
  };

  const getNextAction = () => {
    if (!job.arrivedPickupAt) return { label: "Arrived at Pickup", event: "arrived_pickup" };
    if (!job.collectedAt) return { label: "Collected Parcel", event: "collected", needsPhoto: true };
    if (!job.arrivedDeliveryAt) return { label: "On My Way", event: "on_way" };
    if (!job.completedAt) return { label: "Delivered", event: "delivered", needsPhoto: true };
    return null;
  };

  const nextAction = getNextAction();

  return (
    <div className="space-y-4">
      {/* Job Info */}
      <div className="bg-white border border-[#E8E8E8] rounded-2xl p-5">
        <p className="font-black text-[#0D0D0D] text-lg">{job.reference}</p>
        <p className="text-[#888888] text-sm">
          {job.postcodeFrom}
          {job.postcodeTo && ` → ${job.postcodeTo}`}
        </p>
        {job.price && <p className="font-semibold text-[#0D0D0D] mt-2">£{job.price}</p>}
      </div>

      {/* Action Button */}
      {nextAction && (
        <button
          onClick={() => recordEvent(nextAction.event, nextAction.needsPhoto)}
          disabled={loading}
          className="w-full bg-[#0D0D0D] hover:bg-[#333333] disabled:opacity-40 text-white font-semibold py-3 rounded-xl"
        >
          {loading ? "Recording…" : nextAction.label}
        </button>
      )}

      {error && <p className="text-red-600 text-sm">{error}</p>}

      {/* Timeline */}
      <div className="space-y-2">
        {timeline.map((event) => (
          <div key={event.id} className="bg-[#F5F5F5] rounded-xl p-3 text-sm">
            <p className="font-semibold text-[#0D0D0D]">{formatEventType(event.eventType)}</p>
            <p className="text-[#888888] text-xs">{new Date(event.timestamp).toLocaleString()}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function formatEventType(type: string) {
  const labels: Record<string, string> = {
    arrived_pickup: "Arrived at Pickup",
    collected: "Collected Parcel",
    on_way: "On My Way",
    arrived_delivery: "Arrived at Delivery",
    delivered: "Delivered",
  };
  return labels[type] || type;
}
