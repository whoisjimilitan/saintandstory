"use client";

import { useEffect, useRef, useState } from "react";

type ShareStatus = "idle" | "requesting" | "sharing" | "arrived" | "error" | "denied";

interface Props {
  job: Record<string, unknown>;
  onArrived: () => void;
  arriving?: boolean;
}

const SEND_INTERVAL_MS = 30_000;  // POST every 30 seconds
const MIN_MOVE_METRES = 50;       // Only POST if moved > 50m from last update

function metresBetween(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6_371_000;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export default function DriverLocationShare({ job, onArrived, arriving = false }: Props) {
  const [status, setStatus] = useState<ShareStatus>("idle");
  const [eta, setEta] = useState<number | null>(null);

  const watchIdRef = useRef<number | null>(null);
  const lastSentRef = useRef<{ lat: number; lng: number; at: number } | null>(null);
  const jobId = job.id as string;

  useEffect(() => {
    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, []);

  async function sendLocation(lat: number, lng: number, accuracy: number) {
    try {
      const res = await fetch("/api/location/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobId, lat, lng, accuracy }),
      });
      const data = await res.json() as { eta: number | null; arrived: boolean };
      if (data.eta !== null) setEta(data.eta);
      if (data.arrived) setStatus("arrived");
    } catch { /* non-fatal — retry next interval */ }
  }

  function startSharing() {
    if (!navigator.geolocation) {
      setStatus("error");
      return;
    }
    setStatus("requesting");

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude: lat, longitude: lng, accuracy } = pos.coords;
        setStatus("sharing");
        lastSentRef.current = { lat, lng, at: Date.now() };
        await sendLocation(lat, lng, accuracy);

        // watchPosition for subsequent updates
        watchIdRef.current = navigator.geolocation.watchPosition(
          (p) => {
            const { latitude, longitude, accuracy: acc } = p.coords;
            const last = lastSentRef.current;
            const now = Date.now();
            const movedEnough = !last || metresBetween(last.lat, last.lng, latitude, longitude) > MIN_MOVE_METRES;
            const timeElapsed = !last || (now - last.at) > SEND_INTERVAL_MS;

            if (movedEnough || timeElapsed) {
              lastSentRef.current = { lat: latitude, lng: longitude, at: now };
              sendLocation(latitude, longitude, acc);
            }
          },
          () => { /* position error — keep last known, retry next watch */ },
          { enableHighAccuracy: true, maximumAge: 10_000, timeout: 15_000 }
        );
      },
      (err) => {
        if (err.code === err.PERMISSION_DENIED) {
          setStatus("denied");
        } else {
          setStatus("error");
        }
      },
      { enableHighAccuracy: true, timeout: 15_000 }
    );
  }

  function confirmArrival() {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    fetch("/api/location/stop", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ jobId }),
    }).catch(() => {});
    onArrived();
  }

  // Idle — the gate. Driver must tap to proceed.
  if (status === "idle") {
    return (
      <div className="border-t border-[#E8E8E8] pt-4">
        <p className="text-[#888888] text-xs mb-3">
          Tap below before you leave — this lets the customer know you&apos;re on the way.
        </p>
        <button
          onClick={startSharing}
          className="w-full bg-[#0D0D0D] hover:bg-[#333333] text-white font-semibold py-2.5 rounded-full text-sm transition-colors"
        >
          I&apos;m on my way →
        </button>
      </div>
    );
  }

  // Requesting permission
  if (status === "requesting") {
    return (
      <div className="border-t border-[#E8E8E8] pt-4">
        <div className="w-full bg-[#F5F5F5] border border-[#E8E8E8] text-[#888888] font-medium py-2.5 rounded-full text-sm text-center">
          Allow location access…
        </div>
      </div>
    );
  }

  // Permission denied — explain and block
  if (status === "denied") {
    return (
      <div className="border-t border-[#E8E8E8] pt-4">
        <div className="bg-[#F5F5F5] border border-[#E8E8E8] rounded-2xl px-4 py-4 mb-3">
          <p className="text-[#0D0D0D] text-sm font-semibold mb-1">Location access needed</p>
          <p className="text-[#888888] text-xs leading-relaxed">
            Enable location in your browser settings, then tap below. This is how we show your customer you&apos;re on the way.
          </p>
        </div>
        <button
          onClick={startSharing}
          className="w-full bg-[#0D0D0D] hover:bg-[#333333] text-white font-semibold py-2.5 rounded-full text-sm transition-colors"
        >
          Try again →
        </button>
      </div>
    );
  }

  // Error (GPS unavailable etc)
  if (status === "error") {
    return (
      <div className="border-t border-[#E8E8E8] pt-4">
        <p className="text-[#888888] text-xs mb-3">Could not get your location. Check GPS is on and try again.</p>
        <button
          onClick={startSharing}
          className="w-full bg-[#0D0D0D] hover:bg-[#333333] text-white font-semibold py-2.5 rounded-full text-sm transition-colors"
        >
          Try again →
        </button>
      </div>
    );
  }

  // Arrived — prompt confirmation
  if (status === "arrived") {
    return (
      <div className="border-t border-[#E8E8E8] pt-4">
        <div className="bg-[#F5F5F5] border border-[#E8E8E8] rounded-2xl px-4 py-3 mb-3 flex items-center gap-3">
          <span className="w-2 h-2 rounded-full bg-green-500 shrink-0" />
          <p className="text-[#0D0D0D] text-sm font-medium">You appear to have arrived</p>
        </div>
        <button
          onClick={confirmArrival}
          disabled={arriving}
          className="w-full bg-[#0D0D0D] hover:bg-[#333333] disabled:opacity-40 text-white font-semibold py-2.5 rounded-full text-sm transition-colors"
        >
          {arriving ? "Confirming…" : "Confirm arrival →"}
        </button>
      </div>
    );
  }

  // Actively sharing
  return (
    <div className="border-t border-[#E8E8E8] pt-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          <p className="text-[#0D0D0D] text-sm font-medium">Sharing location</p>
        </div>
        {eta !== null && (
          <p className="text-[#888888] text-xs">{eta} min to pickup</p>
        )}
      </div>
      <p className="text-[#888888] text-xs">
        Customer can see your ETA. This stops automatically when you confirm arrival.
      </p>
    </div>
  );
}
