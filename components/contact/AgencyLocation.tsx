"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import { ArrowUpLeft, Check, Copy, MapPin } from "lucide-react";
import { directionsUrl, phoneHref, type CmsContact } from "@/lib/contact";
import "./agency-location.css";

const AgencyOfficeMap = dynamic(() => import("./AgencyOfficeMap"), {
  ssr: false,
  loading: () => <div className="agency-map-message" role="status">در حال آماده‌سازی نقشه…</div>,
});

export function AgencyLocation({ contact }: { contact: CmsContact }) {
  const section = useRef<HTMLElement>(null);
  const copyTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [active, setActive] = useState(false);
  const [copyStatus, setCopyStatus] = useState<"idle" | "copied" | "error">("idle");
  const exact = contact.latitude != null && contact.longitude != null;
  const href = directionsUrl(contact);

  useEffect(() => {
    if (!section.current) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { setActive(true); observer.disconnect(); }
    }, { rootMargin: "240px" });
    observer.observe(section.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => () => { if (copyTimeout.current) clearTimeout(copyTimeout.current); }, []);

  async function copyAddress() {
    try {
      await navigator.clipboard.writeText([contact.address, contact.postalCode && `کد پستی: ${contact.postalCode}`].filter(Boolean).join("\n"));
      setCopyStatus("copied");
    } catch { setCopyStatus("error"); }
    if (copyTimeout.current) clearTimeout(copyTimeout.current);
    copyTimeout.current = setTimeout(() => setCopyStatus("idle"), 3000);
  }

  if (!contact.address) return null;

  return (
    <section ref={section} className="agency-location" aria-labelledby="agency-location-title">
      <div className="agency-location-heading">
        <div>
          <p className="agency-location-eyebrow"><MapPin size={15} strokeWidth={1.5} /> یک قرار، از نزدیک</p>
          <h2 id="agency-location-title">مسیرتان به <span>پاراگ</span> می‌رسد.</h2>
        </div>
        <p>برای دیدار حضوری، پیش از آمدن با ما هماهنگ کنید.</p>
      </div>

      <div className="agency-location-stage">
        <div className="agency-location-viewport">
          {active ? <AgencyOfficeMap
            latitude={contact.latitude ?? 35.72165}
            longitude={contact.longitude ?? 51.4015}
            exact={exact}
            href={href}
          /> : <div className="agency-map-message" role="status">نقشهٔ دفتر پاراگ</div>}
          <div className="agency-location-coordinate" aria-hidden="true">
            <span>PARAG / TEHRAN</span>
            {exact && <span>{contact.latitude!.toFixed(5)}° N &nbsp; {contact.longitude!.toFixed(5)}° E</span>}
          </div>
        </div>

        <aside className="agency-location-glass" aria-label="نشانی دفتر آژانس پاراگ">
          <div className="agency-location-card-heading">
            <span className="agency-location-office">دفتر آژانس پاراگ</span>
            <MapPin size={20} strokeWidth={1.5} aria-hidden="true" />
          </div>
          <h3>منتظر دیدارتان هستیم.</h3>
          <address>{contact.address}</address>
          <dl className="agency-location-details">
            {contact.postalCode && <div><dt>کد پستی</dt><dd>{contact.postalCode}</dd></div>}
            {contact.hours && <div><dt>ساعات کاری</dt><dd>{contact.hours}</dd></div>}
          </dl>
          {(contact.phone || contact.email) && <div className="agency-location-contact">
            {contact.phone && <a href={`tel:${contact.phoneIntl || phoneHref(contact.phone)}`} dir="ltr">{contact.phone}</a>}
            {contact.email && <a href={`mailto:${contact.email}`} dir="ltr">{contact.email}</a>}
          </div>}
          <div className="agency-location-actions">
            <a className="agency-location-directions" href={href} target="_blank" rel="noopener noreferrer">مسیریابی به دفتر <ArrowUpLeft size={19} strokeWidth={1.5} /></a>
            <button type="button" onClick={copyAddress} className="agency-location-copy" aria-label={copyStatus === "copied" ? "نشانی کپی شد" : "کپی نشانی"} title="کپی نشانی">
              {copyStatus === "copied" ? <Check size={18} strokeWidth={1.5} /> : <Copy size={18} strokeWidth={1.5} />}
            </button>
          </div>
          <span className="agency-location-copy-status" role="status">{copyStatus === "copied" ? "نشانی کپی شد" : copyStatus === "error" ? "کپی انجام نشد؛ نشانی را انتخاب و کپی کنید." : ""}</span>
        </aside>
      </div>
    </section>
  );
}
