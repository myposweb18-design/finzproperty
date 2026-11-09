import { useEffect, useRef, useState } from "react";
import { Link } from "wouter";
import { ArrowRight, LocateFixed, Scan } from "lucide-react";
import { MapView } from "@/components/Map";
import { cn } from "@/lib/utils";
import { formatLkr } from "@shared/marketplace";
import { focusPropertyLocality } from "@shared/mapFocus";

type MapItem = {
  id: number;
  title: string;
  location: string;
  image: string;
  price: number;
  href: string;
  intent?: "buy" | "rent";
};
type LocatedItem = {
  item: MapItem;
  marker: google.maps.Marker;
  position: google.maps.LatLngLiteral;
};
type FocusStatus = "idle" | "locating" | "ready" | "unavailable";
type MapActions = {
  select: (item: MapItem, fromMarker?: boolean) => void;
  overview: () => void;
};
const coordinateCache = new Map<string, google.maps.LatLngLiteral>();
const reducedMotion = () =>
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export function PropertyMap({ items }: { items: MapItem[] }) {
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [unlocated, setUnlocated] = useState(0);
  const [loading, setLoading] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [focusStatus, setFocusStatus] = useState<FocusStatus>("idle");
  const selection = useRef<number | null>(null);
  const actions = useRef<MapActions | null>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const mapPane = useRef<HTMLDivElement>(null);
  const rowRefs = useRef(new Map<number, HTMLDivElement>());
  const selected = items.find(item => item.id === selectedId);
  const signature = JSON.stringify(items);

  useEffect(() => {
    if (
      selection.current !== null &&
      !items.some(item => item.id === selection.current)
    ) {
      selection.current = null;
      setSelectedId(null);
      setFocusStatus("idle");
    }
    if (!map || !window.google) return;
    let disposed = false;
    let selectionVersion = 0;
    const located = new Map<number, LocatedItem>();
    const pending = new Map<number, Promise<LocatedItem | null>>();
    const geocoder = new window.google.maps.Geocoder();
    const bounds = new window.google.maps.LatLngBounds();
    const info = new window.google.maps.InfoWindow({ disableAutoPan: true });
    let failures = 0;
    setUnlocated(0);
    setLoading(true);

    function highlight(id: number | null) {
      for (const entry of located.values()) {
        entry.marker.setZIndex(entry.item.id === id ? 1000 : 1);
        entry.marker.setIcon(
          entry.item.id === id
            ? {
                path: window.google!.maps.SymbolPath.CIRCLE,
                scale: 9,
                fillColor: "#d8b66a",
                fillOpacity: 1,
                strokeColor: "#0b1f33",
                strokeWeight: 3,
              }
            : null
        );
      }
    }
    function popup(entry: LocatedItem) {
      const content = document.createElement("div");
      content.style.maxWidth = "250px";
      content.style.padding = "3px";
      const title = document.createElement("strong");
      title.textContent = entry.item.title;
      const locality = document.createElement("p");
      locality.textContent = entry.item.location;
      locality.style.margin = "7px 0";
      locality.style.color = "#657580";
      const price = document.createElement("p");
      price.textContent = formatLkr(entry.item.price, entry.item.intent);
      price.style.fontWeight = "600";
      const note = document.createElement("p");
      note.textContent = "Approximate published locality";
      note.style.fontSize = "11px";
      note.style.margin = "7px 0";
      const link = document.createElement("a");
      link.href = entry.item.href;
      link.textContent = "View details";
      link.style.color = "#936e27";
      content.append(title, locality, price, note, link);
      info.setContent(content);
      info.open({ map: map!, anchor: entry.marker, shouldFocus: false });
    }
    function ensureMarker(item: MapItem): Promise<LocatedItem | null> {
      const existing = located.get(item.id);
      if (existing) return Promise.resolve(existing);
      const inFlight = pending.get(item.id);
      if (inFlight) return inFlight;
      const task = (async () => {
        const address = `${item.location.trim()}, Sri Lanka`;
        let position = coordinateCache.get(address);
        if (!position && item.location.trim()) {
          try {
            const response = await geocoder.geocode({
              address,
              region: "LK",
              componentRestrictions: { country: "LK" },
            });
            position = response.results[0]?.geometry.location.toJSON();
            if (position) coordinateCache.set(address, position);
          } catch {
            /* Missing or failed coordinates never become invented markers. */
          }
        }
        if (disposed || !position) return null;
        const marker = new window.google!.maps.Marker({
          map,
          position,
          title: `${item.title} — approximate locality`,
        });
        const entry = { item, marker, position };
        located.set(item.id, entry);
        bounds.extend(position);
        marker.addListener("click", () => controller.select(item, true));
        return entry;
      })().catch(() => null);
      pending.set(item.id, task);
      void task.finally(() => {
        if (pending.get(item.id) === task) pending.delete(item.id);
      });
      return task;
    }
    function select(item: MapItem, fromMarker = false) {
      const request = ++selectionVersion;
      selection.current = item.id;
      setSelectedId(item.id);
      setFocusStatus("locating");
      void ensureMarker(item).then(entry => {
        if (
          disposed ||
          request !== selectionVersion ||
          selection.current !== item.id
        )
          return;
        if (!entry) {
          info.close();
          highlight(null);
          setFocusStatus("unavailable");
          return;
        }
        focusPropertyLocality(map!, entry.position, reducedMotion());
        highlight(item.id);
        popup(entry);
        setFocusStatus("ready");
        if (fromMarker) {
          const list = listRef.current;
          const row = rowRefs.current.get(item.id);
          if (list && row)
            list.scrollTo({
              top:
                list.scrollTop +
                row.getBoundingClientRect().top -
                list.getBoundingClientRect().top -
                12,
              behavior: reducedMotion() ? "instant" : "smooth",
            });
        }
      });
    }
    function overview() {
      selectionVersion++;
      selection.current = null;
      setSelectedId(null);
      setFocusStatus("idle");
      info.close();
      highlight(null);
      if (!bounds.isEmpty()) {
        map!.fitBounds(bounds, 40);
        if (located.size === 1) map!.setZoom(13);
      }
    }
    const controller = { select, overview };
    actions.current = controller;
    async function populate() {
      for (const item of items.slice(0, 50)) {
        if (disposed) return;
        const result = await ensureMarker(item);
        if (!result) failures++;
      }
      if (disposed) return;
      if (selection.current === null && !bounds.isEmpty()) {
        map!.fitBounds(bounds, 40);
        if (located.size === 1) map!.setZoom(13);
      }
      setUnlocated(failures);
      setLoading(false);
    }
    void populate();
    const pendingSelection = items.find(item => item.id === selection.current);
    if (pendingSelection) select(pendingSelection);
    return () => {
      disposed = true;
      selectionVersion++;
      info.close();
      for (const entry of located.values()) {
        window.google?.maps.event.clearInstanceListeners(entry.marker);
        entry.marker.setMap(null);
      }
      if (actions.current === controller) actions.current = null;
    };
  }, [map, signature]);

  function choose(item: MapItem) {
    selection.current = item.id;
    setSelectedId(item.id);
    setFocusStatus("locating");
    actions.current?.select(item);
    if (window.matchMedia("(max-width: 1023px)").matches)
      mapPane.current?.scrollIntoView({
        block: "nearest",
        behavior: reducedMotion() ? "instant" : "smooth",
      });
  }
  function showAll() {
    selection.current = null;
    setSelectedId(null);
    setFocusStatus("idle");
    actions.current?.overview();
  }
  return (
    <div
      className="overflow-hidden rounded-[22px] border border-[#e7e2d9] bg-white"
      data-selected-map-item={selectedId ?? ""}
      data-map-focus-status={focusStatus}
    >
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#e7e2d9] bg-[#fffdf9] px-4 py-3">
        <p role="status" className="min-w-0 text-xs leading-5 text-[#657580]">
          {selected ? (
            focusStatus === "locating" ? (
              `Locating ${selected.title}…`
            ) : focusStatus === "unavailable" ? (
              "This locality could not be located. No location is guessed."
            ) : (
              <>
                <span className="font-semibold text-[#0b1f33]">
                  {selected.title}
                </span>{" "}
                · Focused on its published locality
              </>
            )
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
        <div
          ref={listRef}
          className="relative order-2 max-h-[500px] overflow-y-auto p-4 lg:order-1"
        >
          {items.length ? (
            items.map(item => (
              <div
                key={item.id}
                ref={node => {
                  if (node) rowRefs.current.set(item.id, node);
                  else rowRefs.current.delete(item.id);
                }}
                className={cn(
                  "mb-3 overflow-hidden rounded-xl border transition-colors duration-200",
                  selectedId === item.id
                    ? "border-[#ba9546] bg-[#fff7e6] ring-1 ring-[#ba9546]/30"
                    : "border-[#eee9e1] bg-white hover:border-[#d8b66a]"
                )}
              >
                <button
                  type="button"
                  onClick={() => choose(item)}
                  aria-label={`Show ${item.title} on map`}
                  aria-pressed={selectedId === item.id}
                  className="flex w-full gap-3 p-3 text-left"
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
                    <span
                      className={cn(
                        "mt-2 inline-flex items-center gap-1 text-[11px] font-medium",
                        selectedId === item.id
                          ? "text-[#94702e]"
                          : "text-[#879299]"
                      )}
                    >
                      <LocateFixed size={12} />
                      {selectedId === item.id
                        ? focusStatus === "unavailable"
                          ? "Locality unavailable"
                          : focusStatus === "locating"
                            ? "Locating on map…"
                            : "Selected on map"
                        : "Zoom to location"}
                    </span>
                  </span>
                </button>
                {selectedId === item.id && (
                  <div className="border-t border-[#e8d6ad] px-3 py-2.5">
                    <Link
                      href={item.href}
                      className="inline-flex min-h-8 items-center gap-2 text-xs font-semibold text-[#936e27]"
                    >
                      View details
                      <ArrowRight size={13} />
                    </Link>
                  </div>
                )}
              </div>
            ))
          ) : (
            <p className="p-4 text-sm text-[#6c7c87]">
              No matching records to place on the map.
            </p>
          )}
        </div>
        <div ref={mapPane} className="order-1 min-w-0 lg:order-2">
          <MapView onMapReady={setMap} />
        </div>
      </div>
      <p className="border-t px-5 py-3 text-xs leading-5 text-[#6c7c87]">
        Markers show geocoded localities, not verified property boundaries or
        exact addresses.{" "}
        {loading
          ? "Locating available records…"
          : unlocated
            ? `${unlocated} localities could not be located.`
            : "Select a card or marker to zoom in; Show all on map restores the overview."}{" "}
        {items.length > 50 &&
          "The first 50 matches are mapped initially; another selected record is located on demand."}
      </p>
    </div>
  );
}
