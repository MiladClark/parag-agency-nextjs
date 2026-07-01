// Bespoke storytelling content for the homepage scroll experience.

export interface JourneyStep {
  index: string;
  icon: string;
  title: string;
  body: string;
}

// Big lines revealed word-by-word as the user scrolls (the brand manifesto).
export const manifestoLines: string[] = [
  "هر برندی یک داستان دارد.",
  "ما آن را به زبان دیجیتال روایت می‌کنیم،",
  "تا دیده شوید، به‌یاد بمانید و انتخاب شوید.",
];

export interface HeroStat {
  value: number;
  prefix?: string;
  suffix?: string;
  label: string;
}

export const heroStats: HeroStat[] = [
  { value: 120, prefix: "+", label: "پروژه موفق" },
  { value: 98, suffix: "٪", label: "رضایت مشتریان" },
  { value: 3, suffix: "x", label: "میانگین رشد ترافیک" },
  { value: 8, prefix: "+", label: "سال تجربه" },
];

export const journeySteps: JourneyStep[] = [
  {
    index: "۰۱",
    icon: "search",
    title: "کشف و شناخت",
    body: "همه‌چیز با شناخت عمیق برند، بازار و مخاطب شما آغاز می‌شود. داده جمع می‌کنیم، گوش می‌دهیم و فرصت‌ها را پیدا می‌کنیم.",
  },
  {
    index: "۰۲",
    icon: "target",
    title: "استراتژی",
    body: "نقشه‌ راهی روشن و داده‌محور طراحی می‌کنیم؛ از پیام برند تا کانال‌ها و قیف فروش، همه در یک مسیر منسجم.",
  },
  {
    index: "۰۳",
    icon: "rocket",
    title: "اجرا و خلاقیت",
    body: "ایده‌ها به کمپین، محتوا و طراحی‌های اثرگذار تبدیل می‌شوند. اینجا جایی است که برند شما زنده می‌شود.",
  },
  {
    index: "۰۴",
    icon: "trending",
    title: "رشد و بهینه‌سازی",
    body: "اندازه‌گیری می‌کنیم، یاد می‌گیریم و بی‌وقفه بهتر می‌شویم. رشد شما یک اتفاق نیست، یک فرایند پیوسته است.",
  },
];
