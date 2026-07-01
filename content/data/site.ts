import type { SiteSettings } from "../types";

export const siteSettings: SiteSettings = {
  siteName: "پاراگ",
  siteUrl: "https://parag.agency",
  tagline: "آژانس دیجیتال مارکتینگ پاراگ",
  description:
    "پاراگ، آژانس دیجیتال مارکتینگ تخصصی در سئو، تبلیغات آنلاین، تولید محتوا، برندینگ و مشاوره رشد کسب‌وکار.",
  nav: [
    { label: "خانه", href: "/" },
    { label: "درباره ما", href: "/about" },
    {
      label: "خدمات",
      href: "/services",
      children: [
        { label: "دیجیتال مارکتینگ", href: "/services/digital-marketing" },
        { label: "تولید محتوا و سئو", href: "/services/content-seo" },
        { label: "تبلیغات آنلاین و کمپین‌های دیجیتال", href: "/services/online-ads" },
        { label: "طراحی گرافیک و برندسازی", href: "/services/branding" },
        { label: "مشاوره و تحلیل کسب‌وکار دیجیتال", href: "/services/consulting" },
      ],
    },
    { label: "نمونه کارها", href: "/portfolio" },
    { label: "تماس با ما", href: "/contact" },
  ],
  contact: {
    phone: "۰۲۱-۱۲۳۴۵۶۷۸",
    email: "hello@parag.agency",
    address: "تهران، ایران",
    whatsapp: "https://wa.me/989000000000",
  },
  social: [
    { label: "اینستاگرام", href: "https://instagram.com/parag.agency", icon: "instagram" },
    { label: "لینکدین", href: "https://linkedin.com/company/parag-agency", icon: "linkedin" },
    { label: "تلگرام", href: "https://t.me/parag_agency", icon: "telegram" },
  ],
};
