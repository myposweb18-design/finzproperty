import { useEffect, useState } from "react";
import { loadMapScript } from "@/components/Map";
import type { Property } from "@shared/marketplace";

export type NearbyMode =
  | "keyword"
  | "near-me"
  | "school"
  | "hospital"
  | "apartment";
type Coordinate = { lat: number; lng: number };
const cached = new Map<string, Coordinate>();
export function distanceKm(a: Coordinate, b: Coordinate) {
  const rad = (v: number) => (v * Math.PI) / 180;
  const dlat = rad(b.lat - a.lat),
    dlng = rad(b.lng - a.lng);
  const h =
    Math.sin(dlat / 2) ** 2 +
    Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dlng / 2) ** 2;
  return 6371 * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(Math.max(0, 1 - h)));
}
export function useNearbySearch(
  rows: Property[],
  mode: NearbyMode,
  q: string,
  radius: number
) {
  const [position, setPosition] = useState<Coordinate | null>(null);
  const [ids, setIds] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [missing, setMissing] = useState(0);
  const signature = JSON.stringify(rows.map(p => [p.id, p.location]));
  function locate() {
    setError("");
    if (!navigator.geolocation) {
      setError("This browser does not support location access.");
      return;
    }
    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      p => {
        setPosition({ lat: p.coords.latitude, lng: p.coords.longitude });
        setLoading(false);
      },
      () => {
        setError(
          "Location permission was denied or unavailable. Search by city instead."
        );
        setLoading(false);
      },
      { enableHighAccuracy: false, timeout: 12000, maximumAge: 60000 }
    );
  }
  useEffect(() => {
    if (mode === "keyword" || mode === "apartment") return;
    if (mode === "near-me" && !position) {
      setIds(new Set());
      return;
    }
    if (mode !== "near-me" && !q.trim()) {
      setIds(new Set());
      return;
    }
    let disposed = false;
    setLoading(true);
    setError("");
    async function run() {
      await loadMapScript();
      if (!window.google) throw new Error("Map provider unavailable.");
      const geocoder = new window.google.maps.Geocoder();
      async function coordinate(address: string) {
        if (cached.has(address)) return cached.get(address)!;
        const r = await geocoder.geocode({ address, region: "LK" });
        const c = r.results[0]?.geometry.location.toJSON();
        if (!c) throw new Error("Location could not be found.");
        cached.set(address, c);
        return c;
      }
      const anchor =
        mode === "near-me"
          ? position!
          : await coordinate(
              `${q}, ${mode === "school" ? "school or university, " : mode === "hospital" ? "hospital, " : ""}Sri Lanka`
            );
      const found = new Set<number>();
      let skipped = 0;
      for (const row of rows) {
        if (disposed) return;
        try {
          const c = await coordinate(`${row.location}, Sri Lanka`);
          if (distanceKm(anchor, c) <= radius) found.add(row.id);
        } catch {
          skipped++;
        }
      }
      if (!disposed) {
        setIds(found);
        setMissing(skipped);
        setLoading(false);
      }
    }
    void run().catch(e => {
      if (!disposed) {
        setError(e instanceof Error ? e.message : "Nearby search unavailable.");
        setIds(new Set());
        setLoading(false);
      }
    });
    return () => {
      disposed = true;
    };
  }, [signature, mode, q, radius, position]);
  return {
    ids,
    loading,
    error,
    missing,
    locate,
    hasPosition: !!position,
    active: mode !== "keyword" && mode !== "apartment",
  };
}
