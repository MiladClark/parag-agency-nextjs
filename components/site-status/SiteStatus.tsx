import type { CSSProperties } from "react";

type Mode = "maintenance" | "coming-soon";

const copy = {
  brand: "آژانس پاراگ",
  latin: "PARAG",
  tagline: "ایده‌ها در حال شکل گرفتن‌اند",
  maintenance: "ما پشت صحنه مشغول ساختن تجربه‌ای بهتر هستیم. به‌زودی برمی‌گردیم.",
  comingSoon: "اتفاق‌های تازه‌ای در راه است. اینجا به‌زودی خانهٔ ایده‌های بزرگ خواهد بود.",
};

export function SiteStatus({ mode, message }: { mode: Mode; message: string | null }) {
  const maintenance = mode === "maintenance";
  const title = maintenance ? "کمی مکث، برای بهتر شدن." : "به‌زودی، اینجا دیدنی می‌شود.";
  const description = message || (maintenance ? copy.maintenance : copy.comingSoon);
  const style = { "--status-accent": "#72f285", "--status-glow": "rgba(114,242,133,.2)" } as CSSProperties;

  return (
    <main className="site-status" style={style} dir="rtl">
      <div className="site-status__grid" aria-hidden="true" />
      <div className="site-status__orb site-status__orb--one" aria-hidden="true" />
      <div className="site-status__orb site-status__orb--two" aria-hidden="true" />
      <div className="site-status__frame">
        <header className="site-status__header">
          <div className="site-status__brand-mark" aria-hidden="true"><span /></div>
          <div className="site-status__brand">
            <strong>{copy.brand}</strong>
            <span>{copy.latin}</span>
          </div>
          <div className="site-status__header-line" />
          <span className="site-status__header-label">یک تجربهٔ بهتر در راه است</span>
        </header>

        <section className="site-status__content" aria-labelledby="site-status-title">
          <div className="site-status__eyebrow"><span className="site-status__pulse" />{maintenance ? "در حال به‌روزرسانی" : "به‌زودی رونمایی می‌شود"}<span className="site-status__eyebrow-line" /></div>
          <p className="site-status__index" aria-hidden="true">{maintenance ? "01 / 02" : "02 / 02"}</p>
          <h1 id="site-status-title">{title}</h1>
          <p className="site-status__description">{description}</p>
          <div className="site-status__signature"><span className="site-status__signature-line" />{copy.tagline}</div>
        </section>

        <footer className="site-status__footer">
          <div className="site-status__footer-rule" />
          <span>{copy.latin} <span className="site-status__footer-dot">•</span> {maintenance ? "در حال آماده‌سازی" : "در آستانهٔ آغاز"}</span>
          <span>از همراهی شما سپاسگزاریم</span>
        </footer>
      </div>
    </main>
  );
}
