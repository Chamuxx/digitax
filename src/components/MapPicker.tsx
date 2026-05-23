"use client";

import { useEffect, useRef } from "react";
// Dynamic import of Leaflet css can also be done, but usually handled globally

interface Props {
  lat: number;
  lng: number;
  onChange?: (lat: number, lng: number) => void;
  readOnly?: boolean;
  height?: number;
}

export function MapPicker({ lat, lng, onChange, readOnly, height = 320 }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const markerRef = useRef<any>(null);

  useEffect(() => {
    if (!ref.current || mapRef.current || typeof window === 'undefined') return;

    // Dynamically import leaflet to avoid SSR issues
    import("leaflet").then((L) => {
      import("leaflet/dist/images/marker-icon.png").then((iconUrl) => {
        import("leaflet/dist/images/marker-icon-2x.png").then((iconRetinaUrl) => {
          import("leaflet/dist/images/marker-shadow.png").then((shadowUrl) => {
            const getUrl = (mod: any) => typeof mod.default === 'string' ? mod.default : (mod.default?.src || mod.src || mod);

            const DefaultIcon = L.icon({
              iconUrl: getUrl(iconUrl),
              iconRetinaUrl: getUrl(iconRetinaUrl),
              shadowUrl: getUrl(shadowUrl),
              iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41],
            });
            L.Marker.prototype.options.icon = DefaultIcon;

            const map = L.map(ref.current!).setView([lat, lng], 14);
            L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
              attribution: "&copy; OpenStreetMap contributors",
              maxZoom: 19,
            }).addTo(map);
            const marker = L.marker([lat, lng], { draggable: !readOnly }).addTo(map);
            markerRef.current = marker;
            mapRef.current = map;

            if (!readOnly) {
              marker.on("dragend", () => {
                const p = marker.getLatLng();
                onChange?.(p.lat, p.lng);
              });
              map.on("click", (e: any) => {
                marker.setLatLng(e.latlng);
                onChange?.(e.latlng.lat, e.latlng.lng);
              });
            }
          });
        });
      });
    });

    return () => { 
      if (mapRef.current) {
        mapRef.current.remove(); 
        mapRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (markerRef.current && mapRef.current) {
      markerRef.current.setLatLng([lat, lng]);
      mapRef.current.setView([lat, lng], mapRef.current.getZoom());
    }
  }, [lat, lng]);

  return <div ref={ref} style={{ height }} className="w-full rounded-lg border overflow-hidden" />;
}
