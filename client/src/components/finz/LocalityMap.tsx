import { useEffect, useState } from "react";
import { MapView } from "@/components/Map";
const localityCache = new Map<string, google.maps.LatLngLiteral>();
export function LocalityMap({ location }: { location: string }) {
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [phase, setPhase] = useState<
    "locating" | "ready" | "missing" | "error"
  >("locating");
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    if (!map || !window.google) return;
    let disposed = false;
    let marker: google.maps.Marker | undefined;
    setPhase("locating");
    async function locate() {
      const address = `${location.trim()}, Sri Lanka`;
      try {
        let position = localityCache.get(address);
        if (!position) {
          const result = await new window.google!.maps.Geocoder().geocode({
            address,
            region: "LK",
            componentRestrictions: { country: "LK" },
          });
          position = result.results[0]?.geometry.location.toJSON();
          if (position) localityCache.set(address, position);
        }
        if (disposed) return;
        if (!position) {
          setPhase("missing");
          return;
        }
        map!.setCenter(position);
        map!.setZoom(14);
        marker = new window.google!.maps.Marker({
          map,
          position,
          title: `${location} — approximate published locality`,
        });
        setPhase("ready");
      } catch (error) {
        if (!disposed)
          setPhase(
            typeof error === "object" &&
              error !== null &&
              "code" in error &&
              error.code === "ZERO_RESULTS"
              ? "missing"
              : "error"
          );
      }
    }
    void locate();
    return () => {
      disposed = true;
      marker?.setMap(null);
    };
  }, [map, location, attempt]);
  return (
    <div
      data-locality-status={map ? phase : "loading"}
      className="overflow-hidden rounded-[18px] border border-[#e7e2d9] bg-[#f7f5f0]"
    >
      <div className="relative">
        <MapView
          onMapReady={setMap}
          fallbackQuery={location}
          className="h-[330px] sm:h-[420px]"
        />
        {map && phase === "locating" && (
          <div
            role="status"
            className="pointer-events-none absolute inset-0 grid place-items-center bg-[#f3f1eb]/85 p-5 text-center text-sm font-semibold text-[#657580]"
          >
            Locating {location}…
          </div>
        )}
      </div>
      {map && (phase === "missing" || phase === "error") && (
        <div
          role="alert"
          className="border-t border-[#e7e2d9] bg-[#fff8e8] px-4 py-3 text-sm leading-6 text-[#796b51]"
        >
          <p>
            {phase === "missing"
              ? "The published locality could not be located. No property pin is shown because an exact address is not available."
              : "We couldn’t locate this address just now. The map is still available to explore."}
          </p>
          <button
            type="button"
            onClick={() => setAttempt(n => n + 1)}
            className="fp-button mt-2 min-h-10 rounded-lg border border-[#d8c59c] bg-white px-3 text-xs font-semibold"
          >
            Retry locality
          </button>
        </div>
      )}
      <p className="border-t border-[#e7e2d9] bg-white px-4 py-3 text-xs leading-5 text-[#75828a]">
        The pin marks the published locality, not a verified property entrance
        or boundary. Zoom, drag or switch to satellite view to explore the area.
      </p>
    </div>
  );
}
