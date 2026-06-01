const R = 6371; // Earth radius km

export function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// UK urban average 25 km/h — accurate to within 2-3 min for most moves
export function etaMinutes(distanceKm: number): number {
  return Math.max(1, Math.round((distanceKm / 25) * 60));
}

// True if driver is within 200m of destination
export function hasArrived(driverLat: number, driverLng: number, destLat: number, destLng: number): boolean {
  return haversineKm(driverLat, driverLng, destLat, destLng) < 0.2;
}
