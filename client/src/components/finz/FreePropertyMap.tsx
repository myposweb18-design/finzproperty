import { useEffect, useRef, useState } from "react";
import { Link } from "wouter";
import { ArrowRight, LocateFixed, Scan } from "lucide-react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { cn } from "@/lib/utils";
import { formatLkr } from "@shared/marketplace";
import { localityCoordinate } from "@shared/localityCoordinates";

type MapItem = {
  id: number;
  title: string;
  location: string;
  image: string;
  price: number;
  href: string;
  intent?: "buy" | "rent";
};

export function FreePropertyMap({ items }: { items: MapItem[] }) {
  const mapRef = useRef<HTMLDivElement>(null);
  const map = useRef<L.Map | null>(null);
  const markers = useRef(new Map<number, L.CircleMarker>());
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const selected = items.find(item => item.id === selectedId);

  useEffect(() => {
    if (!mapRef.current || map.current) return;
    map.current = L.map(mapRef.current, {
      zoomControl: true,
      scrollWheelZoom: true,
    }).setView([7.8731, 80.7718], 7);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19,
    }).addTo(map.current);
    return () => {
      map.current?.remove();
      map.current = null;
    };
  }, []);

  useEffect(() => {
    if (!map.current) return;
    markers.current.forEach(marker => marker.remove());
    markers.current.clear();
    const bounds: L.LatLngTuple[] = [];
    items.slice(0, 50).forEach(item => {
      const position = localityCoordinate(item.location);
      bounds.push([position.lat, position.lng]);
      const marker = L.circleMarker([position.lat, position.lng], {
        radius: item.id === selectedId ? 10 : 8,
        color: item.id === selectedId ? "#0b1f33" : "#a98136",
        weight: item.id === selectedId ? 3 : 2,
        fillColor: item.id === selectedId ? "#d8b66a" : "#ba9546",
        fillOpacity: 0.95,
      }).addTo(map.current!);
      marker.bindPopup(
        `<strong>${item.title.replaceAll("<", "&lt;")}</strong><br>${item.location}<br><b>${formatLkr(item.price, item.intent)}</b>`
      );
      marker.on("click", () => setSelectedId(item.id));
      markers.current.set(item.id, marker);
    });
    if (bounds.length && selectedId === null)
      map.current.fitBounds(bounds, { padding: [35, 35] });
    if (selectedId !== null) {
      const item = items.find(entry => entry.id === selectedId);
      if (item) {
        const position = localityCoordinate(item.location);
        map.current.flyTo([position.lat, position.lng], 14, { duration: 0.7 });
        markers.current.get(item.id)?.openPopup();
      }
    }
  }, [items, selectedId]);

  function select(item: MapItem) {
    setSelectedId(item.id);
  }
  function showAll() {
    setSelectedId(null);
    const bounds = items.slice(0, 50).map(item => {
      const p = localityCoordinate(item.location);
      return [p.lat, p.lng] as L.LatLngTuple;
    });
    if (bounds.length) map.current?.fitBounds(bounds, { padding: [35, 35] });
  }

  return (
    <div
      className="overflow-hidden rounded-[22px] border border-[#e7e2d9] bg-white"
      data-map-provider="openstreetmap"
    >
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#e7e2d9] bg-[#fffdf9] px-4 py-3">
        <p role="status" className="min-w-0 text-xs leading-5 text-[#657580]">
          {selected ? (
            <>
              <span className="font-semibold text-[#0b1f33]">
                {selected.title}
              </span>{" "}
              · Focused on its published locality
            </>
          ) : (
            "Select a property below to zoom to it on this map."
          )}
        </p>
        {selectedId !== null && (
          <button
            type="button"
            onClick={showAll}
            className="fp-button inline-flex min-h-10 shrink-0 items-center gap-2 rounded-xl border border-[#e0dacd] bg-white px-3 text-xs font-semibold text-[#536570]"
          >
            <Scan size={15} />
            Show all on map
          </button>
        )}
      </div>
      <div className="grid lg:grid-cols-[.65fr_1.35fr]">
        <div className="relative order-2 max-h-[500px] overflow-y-auto p-4 lg:order-1">
          {items.length ? (
            items.map(item => (
              <button
                key={item.id}
                type="button"
                onClick={() => select(item)}
                aria-pressed={selectedId === item.id}
                className={cn(
                  "mb-3 flex w-full gap-3 rounded-xl border p-3 text-left transition-colors",
                  selectedId === item.id
                    ? "border-[#ba9546] bg-[#fff7e6]"
                    : "border-[#eee9e1] bg-white hover:border-[#d8b66a]"
                )}
              >
                <img
                  src={item.image}
                  alt=""
                  loading="lazy"
                  className="h-16 w-20 shrink-0 rounded-lg object-cover"
                />
                <span className="min-w-0">
                  <span className="block text-sm font-semibold">
                    {item.title}
                  </span>
                  <span className="mt-1 block text-xs text-[#6c7c87]">
                    {item.location}
                  </span>
                  <span className="mt-2 block text-xs font-semibold">
                    {formatLkr(item.price, item.intent)}
                  </span>
                  <span className="mt-2 inline-flex items-center gap-1 text-[11px] font-medium text-[#94702e]">
                    <LocateFixed size={12} />
                    {selectedId === item.id
                      ? "Selected on map"
                      : "Zoom to location"}
                  </span>
                  {selectedId === item.id && (
                    <span className="mt-2 flex items-center gap-1 text-xs font-semibold text-[#936e27]">
                      View details <ArrowRight size={13} />
                    </span>
                  )}
                </span>
              </button>
            ))
          ) : (
            <p className="p-4 text-sm text-[#6c7c87]">
              No matching records to place on the map.
            </p>
          )}
        </div>
        <div
          ref={mapRef}
          className="order-1 min-h-[380px] min-w-0 lg:order-2 sm:min-h-[520px]"
        />
      </div>
      <p className="border-t px-5 py-3 text-xs leading-5 text-[#6c7c87]">
        Free OpenStreetMap preview. Markers show approximate published
        localities, not verified property boundaries or exact addresses.
      </p>
    </div>
  );
}
