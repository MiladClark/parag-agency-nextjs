import type { PortfolioCaseStudy } from "../types";

const SITE_URL = "https://parag.agency";

export const portfolioCases: PortfolioCaseStudy[] = [
  {
    slug: "pulse-fitness",
    title: "نبض؛ اپلیکیشن هوشمند تناسب اندام",
    category: "طراحی و توسعه اپلیکیشن",
    client: "استارتاپ نبض",
    cover: "from-emerald-500/40 to-green-900/40",
    coverImage: "/portfolio/pulse/hero.png",
    summary:
      "طراحی و توسعه کامل اپلیکیشن موبایل تناسب اندام با داشبورد شخصی، برنامه تمرین، آنالیتیکس پیشرفت و پروفایل دستاوردها.",
    tags: ["اپلیکیشن موبایل", "UI/UX", "React Native", "پروداکت"],
    seo: {
      title: "نبض؛ نمونه کار اپلیکیشن تناسب اندام | آژانس پاراگ",
      description:
        "کیس‌استادی طراحی و توسعه اپلیکیشن نبض: تجربه کاربری تیره، داشبورد تمرین، آنالیتیکس و سیستم دستاوردها.",
      canonical: `${SITE_URL}/portfolio/pulse-fitness`,
      ogImage: `${SITE_URL}/portfolio/pulse/hero.png`,
    },
    year: "۱۴۰۳",
    role: "پروداکت، طراحی UI/UX، توسعه موبایل",
    timeline: "۴ ماه",
    platform: "iOS و Android",
    heroImage: "/portfolio/pulse/hero.png",
    overview: [
      "نبض یک اپلیکیشن تناسب اندام است که تمرین روزانه، پیگیری پیشرفت و انگیزه کاربر را در یک تجربه یکپارچه جمع می‌کند.",
      "از صفر تا انتشار کنار تیم نبض بودیم: کشف محصول، طراحی رابط، پروتوتایپ تعاملی و توسعه نسخه موبایل.",
    ],
    challenge: {
      title: "چالش",
      body: "کاربران اپ‌های ورزشی معمولاً بعد از چند هفته رها می‌کنند؛ اولین نسخه نبض شلوغ بود، مسیر شروع مبهم بود و پیشرفت کاربر دیده نمی‌شد.",
    },
    solution: {
      title: "راه‌حل",
      body: "یک تجربه تاریک و متمرکز طراحی کردیم با داشبورد شخصی، برنامه تمرین مرحله‌ای، آنالیتیکس خوانا و سیستم دستاورد برای حفظ عادت.",
    },
    features: [
      {
        title: "داشبورد شخصی",
        body: "نمای روزانه با حلقه پیشرفت، میانبر تمرین و کارت‌های هدف؛ کاربر در سه ثانیه می‌فهمد امروز چه کاری مانده.",
        image: "/portfolio/pulse/home.png",
      },
      {
        title: "جریان تمرین",
        body: "صفحه تمرین با تایمر، مراحل و راهنمای حرکت؛ تمرکز روی اجرا بدون حواس‌پرتی.",
        image: "/portfolio/pulse/workout.png",
      },
      {
        title: "آنالیتیکس پیشرفت",
        body: "نمودارهای هفتگی و شاخص‌های کالری و فعالیت تا کاربر رشد خودش را ببیند و برگردد.",
        image: "/portfolio/pulse/analytics.png",
      },
      {
        title: "پروفایل و دستاوردها",
        body: "مدال‌ها، استریک و تقویم فعالیت برای تقویت حس پیشرفت و رقابت سالم با خود.",
        image: "/portfolio/pulse/profile.png",
      },
    ],
    stack: ["React Native", "TypeScript", "Node.js", "PostgreSQL", "Figma", "Motion"],
    results: [
      { value: "۴.۸", label: "امتیاز فروشگاه" },
      { value: "۲.۴x", label: "افزایش ماندگاری ۳۰ روزه" },
      { value: "۳۸٪", label: "رشد تکمیل تمرین" },
      { value: "۴ ماه", label: "از ایده تا انتشار" },
    ],
    gallery: [
      { src: "/portfolio/pulse/home.png", alt: "داشبورد اپ نبض", caption: "خانه" },
      { src: "/portfolio/pulse/workout.png", alt: "صفحه تمرین نبض", caption: "تمرین" },
      { src: "/portfolio/pulse/analytics.png", alt: "آنالیتیکس نبض", caption: "پیشرفت" },
      { src: "/portfolio/pulse/profile.png", alt: "پروفایل و دستاوردها", caption: "پروفایل" },
    ],
  },
];

export function getPortfolioCase(slug: string): PortfolioCaseStudy | null {
  return portfolioCases.find((c) => c.slug === slug) ?? null;
}
