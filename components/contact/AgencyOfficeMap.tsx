"use client";

import { useEffect, useRef, useState } from "react";
import { AttributionControl, Map as LibreMap, Marker, setWorkerUrl } from "maplibre-gl";
import { LocateFixed, MapPin, Minus, Plus } from "lucide-react";
import { agencyMapStyle } from "./agencyMapStyle";
import "maplibre-gl/dist/maplibre-gl.css";

setWorkerUrl(new URL("maplibre-gl/dist/maplibre-gl-worker.mjs", import.meta.url).toString());

type Props = { latitude: number; longitude: number; exact: boolean; href: string };

export default function AgencyOfficeMap({ latitude, longitude, exact, href }: Props) {
  const host = useRef<HTMLDivElement>(null);
  const mapRef = useRef<LibreMap | null>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");

  useEffect(() => {
    if (!host.current) return;
    let map: LibreMap | undefined;
    let resize: ResizeObserver | undefined;
    let themeObserver: MutationObserver | undefined;
    let disposed = false;
    const timeout = window.setTimeout(() => { if (!disposed) setStatus("error"); }, 20000);
    try {
      let dark = document.documentElement.dataset.theme !== "light";
      const desktop = host.current.clientWidth >= 768;
      map = new LibreMap({
        container: host.current,
        style: agencyMapStyle(dark),
        center: [longitude, latitude],
        zoom: exact ? 16.8 : 14.8,
        bearing: -18, pitch: 30,
        minZoom: 3, maxZoom: 19,
        attributionControl: false,
        cooperativeGestures: true,
        dragRotate: false, pitchWithRotate: false,
        canvasContextAttributes: { antialias: false },
        locale: {
          "AttributionControl.ToggleAttribution": "منابع نقشه",
          "CooperativeGesturesHandler.WindowsHelpText": "برای زوم، Ctrl را نگه دارید",
          "CooperativeGesturesHandler.MacHelpText": "برای زوم، ⌘ را نگه دارید",
          "CooperativeGesturesHandler.MobileHelpText": "برای جابه‌جایی نقشه از دو انگشت استفاده کنید",
        },
      });
      map.jumpTo({ center: [longitude, latitude], padding: { top: 0, bottom: 0, left: 0, right: desktop ? 410 : 0 } });
      mapRef.current = map;
      map.touchZoomRotate.disableRotation();
      map.addControl(new AttributionControl({ compact: true }), "bottom-left");
      map.getCanvas().setAttribute("aria-label", "نقشهٔ تعاملی دفتر آژانس پاراگ در تهران");

      const pin = document.createElement("a");
      pin.className = "agency-map-pin";
      pin.href = href; pin.target = "_blank"; pin.rel = "noopener noreferrer";
      pin.setAttribute("aria-label", exact ? "مسیریابی به دفتر آژانس پاراگ" : "مشاهده مسیر نشانی پاراگ");
      const image = document.createElement("img");
      image.src = "/logo-mark.svg"; image.alt = ""; image.width = 36; image.height = 36;
      const label = document.createElement("span");
      label.className = "agency-map-pin-label";
      label.textContent = exact ? "پاراگ، همین‌جا" : "محدودهٔ دفتر پاراگ";
      pin.append(image, label);
      new Marker({ element: pin, anchor: "bottom", offset: [0, -10] }).setLngLat([longitude, latitude]).addTo(map);

      map.on("load", () => { if (!disposed) { clearTimeout(timeout); setStatus("ready"); } });
      themeObserver = new MutationObserver(() => {
        const next = document.documentElement.dataset.theme !== "light";
        if (next !== dark) { dark = next; map?.setStyle(agencyMapStyle(dark)); }
      });
      themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
      let wasDesktop = desktop;
      resize = new ResizeObserver(() => {
        if (!map || !host.current) return;
        map.resize();
        const isDesktop = host.current.clientWidth >= 768;
        if (isDesktop !== wasDesktop) {
          wasDesktop = isDesktop;
          map.jumpTo({ center: [longitude, latitude], padding: { top: 0, bottom: 0, left: 0, right: isDesktop ? 410 : 0 } });
        }
      });
      resize.observe(host.current);
    } catch {
      clearTimeout(timeout);
      queueMicrotask(() => { if (!disposed) setStatus("error"); });
    }
    return () => {
      disposed = true;
      clearTimeout(timeout);
      themeObserver?.disconnect(); resize?.disconnect();
      mapRef.current = null;
      map?.remove();
    };
  }, [latitude, longitude, exact, href]);

  function recenter() {
    const duration = window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : 700;
    mapRef.current?.easeTo({ center: [longitude, latitude], zoom: exact ? 16.8 : 14.8, bearing: -18, pitch: 30, duration });
  }

  return <div className="agency-office-map" data-map-status={status}>
    <div ref={host} className="agency-map-canvas" />
    {status !== "ready" && <div className="agency-map-message" role="status">
      <MapPin size={24} strokeWidth={1.5} />
      <p>{status === "loading" ? "در حال آماده‌سازی نقشه…" : "نقشه در دسترس نیست."}</p>
      {status === "error" && <a href={href} target="_blank" rel="noopener noreferrer">مشاهده مسیر در نقشه <span aria-hidden="true">↖</span></a>}
    </div>}
    {status === "ready" && <div className="agency-map-controls" aria-label="کنترل نقشه">
      <div>
        <button type="button" onClick={() => mapRef.current?.zoomIn()} aria-label="بزرگ‌نمایی نقشه"><Plus size={18} strokeWidth={1.5} /></button>
        <button type="button" onClick={() => mapRef.current?.zoomOut()} aria-label="کوچک‌نمایی نقشه"><Minus size={18} strokeWidth={1.5} /></button>
      </div>
      <button type="button" onClick={recenter} aria-label="بازگشت به دفتر پاراگ" title="بازگشت به دفتر پاراگ"><LocateFixed size={18} strokeWidth={1.5} /></button>
    </div>}
  </div>;
}
