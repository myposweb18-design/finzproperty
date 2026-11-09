import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { localityCoordinate } from "@shared/localityCoordinates";

export function FreeLocalityMap({
  location,
  className = "",
}: {
  location: string;
  className?: string;
}) {
  const node = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!node.current) return;
    const position = localityCoordinate(location);
    const map = L.map(node.current, { zoomControl: true }).setView(
      [position.lat, position.lng],
      14
    );
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19,
    }).addTo(map);
    L.circleMarker([position.lat, position.lng], {
      radius: 10,
      color: "#0b1f33",
      weight: 3,
      fillColor: "#d8b66a",
      fillOpacity: 0.95,
    })
      .addTo(map)
      .bindPopup(`${location} — approximate published locality`)
      .openPopup();
    return () => {
      map.remove();
    };
  }, [location]);
  return (
    <div
      ref={node}
      className={`min-h-[330px] w-full sm:min-h-[420px] ${className}`}
      aria-label={`Free map of ${location}`}
    />
  );
}
