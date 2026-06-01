"use client";

import { useEffect, useState } from "react";
import PusherJs from "pusher-js";

interface Props {
  trackingToken: string;
  driverFirstName: string;
  initialEta: number | null;
  initialSharing: boolean;
}

export default function TrackingLive({ trackingToken, driverFirstName, initialEta, initialSharing }: Props) {
  const [eta, setEta] = useState<number | null>(initialEta);
  const [sharing, setSharing] = useState(initialSharing);
  const [arrived, setArrived] = useState(false);

  useEffect(() => {
    const key = process.env.NEXT_PUBLIC_PUSHER_KEY;
    const cluster = process.env.NEXT_PUBLIC_PUSHER_CLUSTER ?? "eu";
    if (!key) return;

    const pusher = new PusherJs(key, { cluster });
    const channel = pusher.subscribe(`tracking-${trackingToken}`);

    channel.bind("driver-location", (data: { etaMinutes: number | null; arrived: boolean }) => {
      setEta(data.etaMinutes);
      setSharing(data.etaMinutes !== null);
      if (data.arrived) setArrived(true);
    });

    return () => {
      channel.unbind_all();
      pusher.unsubscribe(`tracking-${trackingToken}`);
      pusher.disconnect();
    };
  }, [trackingToken]);

  if (arrived) {
    return (
      <div className="bg-[#0D0D0D] rounded-2xl px-5 py-4 flex items-center gap-3">
        <span className="w-2 h-2 rounded-full bg-green-500 shrink-0" />
        <p className="font-sans font-semibold text-white text-sm">
          {driverFirstName} has arrived.
        </p>
      </div>
    );
  }

  if (!sharing || eta === null) return null;

  return (
    <div className="bg-[#0D0D0D] rounded-2xl px-5 py-5">
      <p className="text-white/55 text-[10px] uppercase tracking-[0.15em] mb-2">Live ETA</p>
      <div className="flex items-end gap-2 mb-1">
        <p className="font-sans font-black text-white text-4xl tracking-tight">{eta}</p>
        <p className="font-sans font-medium text-white/70 text-lg mb-0.5">min away</p>
      </div>
      <p className="text-white/50 text-xs">
        {driverFirstName} is on the way. Updates automatically.
      </p>
    </div>
  );
}
