/// <reference types="@types/google.maps" />
import { useEffect, useRef, useState } from "react";
import { LoaderCircle, MapPinned } from "lucide-react";
import { cn } from "@/lib/utils";
declare global {
  interface Window {
    google?: typeof google;
    __finzMapsReady?: () => void;
  }
}
let loader: Promise<void> | undefined;
export function loadMapScript(): Promise<void> {
  if (window.google?.maps?.Map) return Promise.resolve();
  if (loader) return loader;
  loader = new Promise<void>((resolve, reject) => {
    const config = window.__MANUS_CONFIG__;
    if (!config?.apiUrl || !config.apiBrowserKey) {
      reject(
        new Error("Interactive maps are not configured for this environment.")
      );
      return;
    }
    let settled = false;
    const script = document.createElement("script");
    script.dataset.finzMaps = "true";
    const timeout = window.setTimeout(
      () => fail("The map provider took too long to respond. Please retry."),
      20000
    );
    function ready() {
      if (settled) return;
      if (!window.google?.maps?.Map) return;
      settled = true;
      window.clearTimeout(timeout);
      resolve();
    }
    function fail(message: string) {
      if (settled) return;
      settled = true;
      window.clearTimeout(timeout);
      script.remove();
      reject(new Error(message));
    }
    window.__finzMapsReady = ready;
    const url = new URL(
      `${config.apiUrl.replace(/\/$/, "")}/v1/maps/proxy/maps/api/js`
    );
    url.searchParams.set("key", config.apiBrowserKey);
    url.searchParams.set("v", "weekly");
    url.searchParams.set("libraries", "geocoding,marker");
    url.searchParams.set("loading", "async");
    url.searchParams.set("callback", "__finzMapsReady");
    script.src = url.toString();
    script.async = true;
    script.crossOrigin = "anonymous";
    script.onload = ready;
    script.onerror = () =>
      fail("The map provider could not be loaded. Use Retry map to reconnect.");
    document.head.appendChild(script);
  }).catch(e => {
    loader = undefined;
    throw e;
  });
  return loader;
}
export function MapView({
  className,
  initialCenter = { lat: 7.8731, lng: 80.7718 },
  initialZoom = 7,
  onMapReady,
  fallbackQuery = "Sri Lanka",
}: {
  className?: string;
  initialCenter?: google.maps.LatLngLiteral;
  initialZoom?: number;
  onMapReady?: (map: google.maps.Map) => void;
  fallbackQuery?: string;
}) {
  const container = useRef<HTMLDivElement>(null);
  const callback = useRef(onMapReady);
  callback.current = onMapReady;
  const [error, setError] = useState("");
  const [fallback, setFallback] = useState(false);
  const [loading, setLoading] = useState(true);
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    let disposed = false;
    let map: google.maps.Map | undefined;
    let observer: ResizeObserver | undefined;
    let frame = 0;
    setError("");
    setFallback(false);
    setLoading(true);
    void loadMapScript()
      .then(() => {
        if (disposed || !container.current || !window.google) return;
        map = new window.google.maps.Map(container.current, {
          center: initialCenter,
          zoom: initialZoom,
          mapTypeControl: true,
          fullscreenControl: true,
          zoomControl: true,
          streetViewControl: true,
          gestureHandling: "cooperative",
          clickableIcons: false,
        });
        callback.current?.(map);
        const currentMap = map;
        window.google.maps.event.addListenerOnce(currentMap, "idle", () => {
          if (!disposed) setLoading(false);
        });
        if (typeof ResizeObserver !== "undefined") {
          observer = new ResizeObserver(() => {
            cancelAnimationFrame(frame);
            frame = requestAnimationFrame(() => {
              if (disposed || !window.google) return;
              const center = currentMap.getCenter();
              window.google.maps.event.trigger(currentMap, "resize");
              if (center) currentMap.setCenter(center);
            });
          });
          observer.observe(container.current);
        }
      })
      .catch(e => {
        if (!disposed) {
          setError(e instanceof Error ? e.message : "Map unavailable.");
          setFallback(true);
          setLoading(false);
        }
      });
    return () => {
      disposed = true;
      observer?.disconnect();
      cancelAnimationFrame(frame);
      if (map && window.google)
        window.google.maps.event.clearInstanceListeners(map);
    };
  }, [attempt]);
  return (
    <div
      className={cn(
        "relative h-[380px] min-w-0 w-full bg-[#e8ece8] sm:h-[520px]",
        className
      )}
      data-map-status={error ? "error" : loading ? "loading" : "ready"}
    >
      <div
        ref={container}
        className="h-full w-full"
        aria-label="Interactive property locality map"
        role="region"
      />
      {fallback && (
        <iframe
          key={fallbackQuery}
          title={`Map of ${fallbackQuery}`}
          src={`https://www.google.com/maps?q=${encodeURIComponent(`${fallbackQuery}, Sri Lanka`)}&output=embed`}
          className="absolute inset-0 h-full w-full border-0"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        />
      )}
      {loading && !error && (
        <div
          role="status"
          className="pointer-events-none absolute inset-0 grid place-items-center bg-[#f3f1eb]/90 p-6 text-center"
        >
          <div>
            <LoaderCircle
              size={25}
              className="mx-auto animate-spin text-[#a98136]"
            />
            <p className="mt-3 text-sm font-semibold text-[#536570]">
              Loading interactive map…
            </p>
          </div>
        </div>
      )}
      {error && (
        <div
          role="alert"
          className={cn(
            "absolute inset-x-0 bottom-0 p-3 text-center",
            fallback
              ? "bg-white/90"
              : "inset-y-0 grid place-items-center bg-[#f3f1eb] p-6"
          )}
        >
          <div>
            {!fallback && (
              <MapPinned size={28} className="mx-auto text-[#a98136]" />
            )}
            <p className="mt-1 font-semibold">
              {fallback ? "Map preview" : "Map unavailable"}
            </p>
            <p className="mx-auto mt-1 max-w-xl text-xs leading-5 text-[#657580]">
              {fallback
                ? "Using a credential-free Google Maps preview. Add managed map credentials for interactive markers and zoom-to-property."
                : error}
            </p>
            {!fallback && (
              <button
                type="button"
                onClick={() => setAttempt(n => n + 1)}
                className="fp-button mt-4 min-h-11 rounded-full bg-[#0b1f33] px-5 text-sm font-semibold text-white"
              >
                Retry map
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
