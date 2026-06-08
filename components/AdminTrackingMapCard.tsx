"use client";

import { MapContainer, TileLayer, Marker, Popup, Polyline } from "react-leaflet";
import L from "leaflet";
import { useEffect, useState } from "react";
import { MapPin } from "lucide-react";

interface DriverLocation {
  driverId: string;
  driverName: string;
  latitude: number;
  longitude: number;
  status: "confirmed" | "in_progress" | "completed";
  currentJobId?: string;
  accuracy?: number;
}

interface JobRoute {
  jobId: string;
  pickupLat: number;
  pickupLng: number;
  deliveryLat: number;
  deliveryLng: number;
  status: "confirmed" | "in_progress" | "completed";
}

interface Props {
  drivers: DriverLocation[];
  routes: JobRoute[];
  centerLat?: number;
  centerLng?: number;
  zoom?: number;
}

// Semantic color mapping for driver status (Tier 1 compliance)
const STATUS_COLORS: Record<string, string> = {
  confirmed: "#F5F5F5", // Light gray card
  in_progress: "#0D0D0D", // Dark card
  completed: "#888888", // Muted gray
};

// Create custom icons for drivers and locations
const createDriverIcon = (status: string) => {
  const color = status === "in_progress" ? "#0D0D0D" : "#888888";
  return L.divIcon({
    html: `
      <div style="
        width: 32px;
        height: 32px;
        background-color: ${color};
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        border: 2px solid white;
        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      ">
        <div style="
          width: 8px;
          height: 8px;
          background-color: white;
          border-radius: 50%;
        "></div>
      </div>
    `,
    className: "driver-icon",
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -16],
  });
};

const createLocationIcon = (type: "pickup" | "delivery") => {
  const bgColor = type === "pickup" ? "#0D0D0D" : "#E8E8E8";
  const textColor = type === "pickup" ? "white" : "#0D0D0D";
  return L.divIcon({
    html: `
      <div style="
        width: 28px;
        height: 28px;
        background-color: ${bgColor};
        border-radius: 4px;
        display: flex;
        align-items: center;
        justify-content: center;
        border: 1px solid #EAE6E0;
        font-size: 12px;
        color: ${textColor};
        font-weight: 600;
      ">
        ${type === "pickup" ? "P" : "D"}
      </div>
    `,
    className: "location-icon",
    iconSize: [28, 28],
    iconAnchor: [14, 14],
    popupAnchor: [0, -14],
  });
};

export default function AdminTrackingMapCard({
  drivers,
  routes,
  centerLat = 51.5074,
  centerLng = -0.1278,
  zoom = 12,
}: Props) {
  const [mapKey, setMapKey] = useState(0);

  // Recenter map when drivers update
  useEffect(() => {
    setMapKey((prev) => prev + 1);
  }, [drivers]);

  return (
    <div className="bg-white border border-[#E8E8E8] rounded-2xl p-5 overflow-hidden">
      {/* Card Header */}
      <div className="flex items-center gap-2 mb-4">
        <MapPin size={20} className="text-[#0D0D0D]" strokeWidth={2} />
        <h3 className="font-sans font-black text-sm text-[#0D0D0D]">Live Tracking</h3>
        <span className="ml-auto text-[10px] uppercase tracking-[0.1em] text-[#888888]">
          {drivers.filter((d) => d.status === "in_progress").length} Active
        </span>
      </div>

      {/* Map Container */}
      <div className="h-96 rounded-lg overflow-hidden border border-[#E8E8E8] mb-4">
        {drivers.length > 0 || routes.length > 0 ? (
          <MapContainer
            key={mapKey}
            center={[centerLat, centerLng]}
            zoom={zoom}
            style={{ height: "100%", width: "100%" }}
            className="z-0"
          >
            <TileLayer
              attribution='&copy; OpenStreetMap contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {/* Render job routes */}
            {routes.map((route) => (
              <Polyline
                key={route.jobId}
                positions={[
                  [route.pickupLat, route.pickupLng],
                  [route.deliveryLat, route.deliveryLng],
                ]}
                color={route.status === "in_progress" ? "#0D0D0D" : "#E8E8E8"}
                weight={2}
                opacity={route.status === "in_progress" ? 1 : 0.5}
              />
            ))}

            {/* Render pickup/delivery markers */}
            {routes.map((route) => (
              <div key={`route-${route.jobId}`}>
                <Marker
                  position={[route.pickupLat, route.pickupLng]}
                  icon={createLocationIcon("pickup")}
                >
                  <Popup className="text-xs">
                    <div className="text-[#0D0D0D]">
                      <p className="font-semibold">Pickup</p>
                      <p className="text-[10px] text-[#888888]">Job {route.jobId}</p>
                    </div>
                  </Popup>
                </Marker>
                <Marker
                  position={[route.deliveryLat, route.deliveryLng]}
                  icon={createLocationIcon("delivery")}
                >
                  <Popup className="text-xs">
                    <div className="text-[#0D0D0D]">
                      <p className="font-semibold">Delivery</p>
                      <p className="text-[10px] text-[#888888]">Job {route.jobId}</p>
                    </div>
                  </Popup>
                </Marker>
              </div>
            ))}

            {/* Render driver location markers */}
            {drivers.map((driver) => (
              <Marker
                key={driver.driverId}
                position={[driver.latitude, driver.longitude]}
                icon={createDriverIcon(driver.status)}
              >
                <Popup className="text-xs">
                  <div className="text-[#0D0D0D]">
                    <p className="font-semibold">{driver.driverName}</p>
                    <p className="text-[10px] text-[#888888]">
                      {driver.status === "in_progress" ? "Live" : "Confirmed"}
                    </p>
                    {driver.accuracy && (
                      <p className="text-[10px] text-[#888888]">
                        Accuracy: ±{Math.round(driver.accuracy)}m
                      </p>
                    )}
                    {driver.currentJobId && (
                      <p className="text-[10px] text-[#888888]">Job {driver.currentJobId}</p>
                    )}
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        ) : (
          <div className="h-96 bg-[#F5F5F5] flex items-center justify-center">
            <p className="text-[#888888] text-xs">No active drivers or routes</p>
          </div>
        )}
      </div>

      {/* Driver Summary */}
      {drivers.length > 0 && (
        <div className="border-t border-[#E8E8E8] pt-4 space-y-2">
          <p className="text-[10px] uppercase tracking-[0.1em] text-[#888888] font-semibold mb-2">
            Active Drivers
          </p>
          <div className="space-y-1.5">
            {drivers
              .filter((d) => d.status === "in_progress")
              .map((driver) => (
                <div key={driver.driverId} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#0D0D0D] animate-pulse" />
                    <span className="text-sm text-[#0D0D0D]">{driver.driverName}</span>
                  </div>
                  <span className="text-[10px] text-[#888888]">
                    {driver.currentJobId ? `Job ${driver.currentJobId}` : "—"}
                  </span>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Phase 2 Placeholder: ETA Integration */}
      <div className="border-t border-[#E8E8E8] mt-4 pt-4">
        <p className="text-[10px] text-[#888888] italic">
          (Phase 2: ETA popups, route optimization, and predictive arrival will display here)
        </p>
      </div>
    </div>
  );
}
