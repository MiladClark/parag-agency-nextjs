import type { BlogAuthor, BlogCategory, BlogPost } from "../types";

// Phase-1 file-backed blog content. Shapes mirror the future Payload
// collections (Authors, Categories, Posts) so only the repository impl changes
// when the CMS is wired. All posts belong to the "parag" tenant.

export const blogAuthors: Record<string, BlogAuthor> = {
  sara: {
    name: "سارا محمدی",
    role: "استراتژیست محتوا",
    bio: "بیش از هشت سال تجربه در تولید محتوا و سئو برای برندهای ایرانی؛ عاشق روایت‌های داده‌محور.",
  },
  reza: {
    name: "رضا کریمی",
    role: "متخصص تبلیغات دیجیتال",
    bio: "مدیریت کمپین‌های پرفورمنس و گوگل ادز با تمرکز بر بازگشت سرمایه واقعی.",
  },
  niloofar: {
    name: "نیلوفر احمدی",
    role: "مدیر برندینگ",
    bio: "طراح هویت بصری و استراتژیست برند؛ باور دارد هر برند یک داستان دارد.",
  },
};

export function categoryTitleOf(slug: string): string {
  return blogCategories.find((c) => c.slug === slug)?.title ?? slug;
}

export const blogCategories: BlogCategory[] = [
  { slug: "seo", title: "سئو", description: "بهینه‌سازی برای موتورهای جستجو و رشد ترافیک ارگانیک." },
  { slug: "content", title: "تولید محتوا", description: "استراتژی، نگارش و تقویم محتوایی حرفه‌ای." },
  { slug: "ads", title: "تبلیغات دیجیتال", description: "کمپین‌های پولی، گوگل ادز و تبلیغات شبکه‌های اجتماعی." },
  { slug: "branding", title: "برندینگ", description: "هویت بصری، لحن برند و تجربهٔ مشتری." },
  { slug: "growth", title: "رشد کسب‌وکار", description: "استراتژی رشد، تحلیل داده و بهینه‌سازی نرخ تبدیل." },
];

function seo(title: string, description: string, slug: string) {
  return {
    title: `${title} | بلاگ پاراگ`,
    description,
    canonical: `https://parag.agency/blog/${slug}`,
    ogType: "article",
  };
}

export const blogPosts: BlogPost[] = [
  {
    slug: "seo-checklist-1404",
    title: "چک‌لیست کامل سئو برای سال ۱۴۰۴",
    excerpt:
      "هر آنچه برای بهینه‌سازی سایت در سال جدید نیاز دارید؛ از سئوی فنی تا محتوا و تجربهٔ کاربری، در یک راهنمای عملی.",
    coverGradient: "from-emerald-500/30 to-green-700/30",
    category: "seo",
    tags: ["سئو", "سئو فنی", "چک‌لیست"],
    author: blogAuthors.sara,
    publishedAt: "2025-06-10",
    featured: true,
    tenant: "parag",
    seo: seo(
      "چک‌لیست کامل سئو برای سال ۱۴۰۴",
      "راهنمای گام‌به‌گام سئو در سال ۱۴۰۴: سئوی فنی، محتوا، لینک‌سازی و تجربهٔ کاربری.",
      "seo-checklist-1404",
    ),
    body: [
      { type: "paragraph", text: "سئو دیگر فقط دربارهٔ کلمات کلیدی نیست؛ امروز موتورهای جستجو به تجربهٔ کاربر، سرعت و کیفیت محتوا اهمیت می‌دهند. در این راهنما یک چک‌لیست عملی برای شروع سال ارائه می‌کنیم." },
      { type: "heading", level: 2, text: "۱. سئوی فنی را جدی بگیرید" },
      { type: "paragraph", text: "پیش از هر چیز مطمئن شوید که ربات‌های گوگل می‌توانند سایت شما را به‌درستی بخوانند و ایندکس کنند." },
      { type: "list", ordered: false, items: ["بهبود سرعت بارگذاری و Core Web Vitals", "ساختار URL تمیز و نقشهٔ سایت XML", "رفع خطاهای ایندکس در سرچ کنسول", "پیاده‌سازی داده‌های ساختاریافته"] },
      { type: "heading", level: 2, text: "۲. محتوای هدفمند بسازید" },
      { type: "paragraph", text: "محتوایی که به نیت جستجوی کاربر پاسخ دهد، همیشه برنده است. روی عمق و کیفیت سرمایه‌گذاری کنید، نه صرفاً تعداد." },
      { type: "quote", text: "محتوای عالی بهترین استراتژی سئوست؛ بقیهٔ کارها فقط کمک می‌کنند دیده شود.", cite: "تیم محتوای پاراگ" },
    ],
  },
  {
    slug: "content-calendar-guide",
    title: "چگونه یک تقویم محتوایی حرفه‌ای بسازیم",
    excerpt:
      "تقویم محتوایی ستون فقرات بازاریابی محتوایی است. در این مقاله قدم‌به‌قدم یاد می‌گیرید چطور آن را طراحی و اجرا کنید.",
    coverGradient: "from-teal-500/30 to-emerald-700/30",
    category: "content",
    tags: ["تولید محتوا", "استراتژی", "برنامه‌ریزی"],
    author: blogAuthors.sara,
    publishedAt: "2025-05-28",
    tenant: "parag",
    seo: seo(
      "چگونه یک تقویم محتوایی حرفه‌ای بسازیم",
      "راهنمای عملی ساخت تقویم محتوایی؛ از تعیین اهداف تا زمان‌بندی و اندازه‌گیری نتایج.",
      "content-calendar-guide",
    ),
    body: [
      { type: "paragraph", text: "بدون برنامه، تولید محتوا به کاری پراکنده و بی‌نتیجه تبدیل می‌شود. تقویم محتوایی به شما کمک می‌کند منظم، هدفمند و پیوسته منتشر کنید." },
      { type: "heading", level: 2, text: "اهداف را مشخص کنید" },
      { type: "paragraph", text: "پیش از انتخاب موضوع، بدانید هر محتوا قرار است چه هدفی را برآورده کند: آگاهی از برند، جذب سرنخ یا افزایش فروش." },
      { type: "list", ordered: true, items: ["تعیین پرسونای مخاطب", "انتخاب کانال‌های انتشار", "تعیین تناوب انتشار", "اندازه‌گیری و بازنگری ماهانه"] },
      { type: "paragraph", text: "در پایان هر ماه عملکرد را بررسی کنید و تقویم ماه بعد را بر اساس داده‌ها اصلاح کنید." },
    ],
  },
  {
    slug: "google-ads-roi",
    title: "افزایش بازگشت سرمایه در گوگل ادز",
    excerpt:
      "هزینه‌ کردن در گوگل ادز آسان است، اما سودآور کردن آن هنر می‌خواهد. این تکنیک‌ها ROI کمپین شما را متحول می‌کند.",
    coverGradient: "from-lime-500/30 to-green-700/30",
    category: "ads",
    tags: ["گوگل ادز", "تبلیغات", "ROI"],
    author: blogAuthors.reza,
    publishedAt: "2025-05-15",
    featured: true,
    tenant: "parag",
    seo: seo(
      "افزایش بازگشت سرمایه در گوگل ادز",
      "تکنیک‌های عملی برای بهینه‌سازی کمپین‌های گوگل ادز و افزایش بازگشت سرمایه.",
      "google-ads-roi",
    ),
    body: [
      { type: "paragraph", text: "بسیاری از کسب‌وکارها بودجهٔ تبلیغاتی خود را بدون استراتژی روشن هدر می‌دهند. کلید موفقیت، اندازه‌گیری دقیق و بهینه‌سازی مداوم است." },
      { type: "heading", level: 2, text: "روی کلمات کلیدی منفی تمرکز کنید" },
      { type: "paragraph", text: "کلمات کلیدی منفی جلوی نمایش تبلیغ شما به جستجوهای بی‌ربط را می‌گیرند و بودجه را حفظ می‌کنند." },
      { type: "heading", level: 2, text: "صفحهٔ فرود را بهینه کنید" },
      { type: "paragraph", text: "کلیک گران است؛ اگر صفحهٔ فرود ضعیف باشد، آن کلیک هدر می‌رود. پیام تبلیغ و صفحه باید هماهنگ باشند." },
      { type: "quote", text: "هر کلیک یک سرمایه‌گذاری است، نه یک هزینه.", cite: "رضا کریمی" },
    ],
  },
  {
    slug: "brand-identity-basics",
    title: "مبانی ساخت هویت بصری برند",
    excerpt:
      "هویت بصری فقط یک لوگو نیست. در این مقاله اجزای اصلی یک هویت برند منسجم و به‌یادماندنی را بررسی می‌کنیم.",
    coverGradient: "from-green-500/30 to-teal-700/30",
    category: "branding",
    tags: ["برندینگ", "هویت بصری", "طراحی"],
    author: blogAuthors.niloofar,
    publishedAt: "2025-04-30",
    tenant: "parag",
    seo: seo(
      "مبانی ساخت هویت بصری برند",
      "اجزای اصلی هویت بصری برند: لوگو، رنگ، تایپوگرافی و لحن؛ راهنمای شروع برندینگ.",
      "brand-identity-basics",
    ),
    body: [
      { type: "paragraph", text: "هویت بصری، اولین چیزی است که مخاطب از برند شما درک می‌کند. انسجام در این هویت، اعتماد می‌سازد." },
      { type: "heading", level: 2, text: "اجزای کلیدی" },
      { type: "list", ordered: false, items: ["لوگو و نشانه", "پالت رنگی", "تایپوگرافی", "لحن و زبان برند"] },
      { type: "paragraph", text: "این اجزا باید در همهٔ نقاط تماس با مشتری یکسان و هماهنگ به کار روند تا برند در ذهن ماندگار شود." },
    ],
  },
  {
    slug: "cro-quick-wins",
    title: "۷ راهکار سریع برای افزایش نرخ تبدیل",
    excerpt:
      "گاهی تغییرات کوچک، نتایج بزرگ می‌سازند. این هفت راهکار عملی نرخ تبدیل سایت شما را به‌سرعت بهبود می‌دهد.",
    coverGradient: "from-emerald-500/30 to-lime-700/30",
    category: "growth",
    tags: ["نرخ تبدیل", "CRO", "بهینه‌سازی"],
    author: blogAuthors.reza,
    publishedAt: "2025-04-18",
    tenant: "parag",
    seo: seo(
      "۷ راهکار سریع برای افزایش نرخ تبدیل",
      "هفت تکنیک عملی و سریع برای بهبود نرخ تبدیل و افزایش فروش وب‌سایت.",
      "cro-quick-wins",
    ),
    body: [
      { type: "paragraph", text: "نرخ تبدیل یعنی چه نسبتی از بازدیدکنندگان به مشتری تبدیل می‌شوند. بهبود آن، مستقیم روی درآمد اثر می‌گذارد." },
      { type: "list", ordered: true, items: ["دکمهٔ دعوت به اقدام واضح و برجسته", "کاهش فیلدهای فرم", "افزودن نظرات و اعتمادسازی", "بهبود سرعت سایت", "پیام ارزش روشن در بالای صفحه", "تست A/B مداوم", "بهینه‌سازی نسخهٔ موبایل"] },
      { type: "paragraph", text: "از یک تغییر شروع کنید، نتیجه را اندازه بگیرید و سپس سراغ بعدی بروید." },
    ],
  },
  {
    slug: "social-media-strategy",
    title: "استراتژی شبکه‌های اجتماعی برای برندها",
    excerpt:
      "حضور در شبکه‌های اجتماعی بدون استراتژی، اتلاف زمان است. چارچوبی ساده برای ساختن حضوری مؤثر و هدفمند.",
    coverGradient: "from-teal-500/30 to-green-700/30",
    category: "content",
    tags: ["شبکه‌های اجتماعی", "استراتژی", "برندینگ"],
    author: blogAuthors.niloofar,
    publishedAt: "2025-04-05",
    tenant: "parag",
    seo: seo(
      "استراتژی شبکه‌های اجتماعی برای برندها",
      "چارچوبی عملی برای طراحی استراتژی شبکه‌های اجتماعی و ساخت حضوری مؤثر.",
      "social-media-strategy",
    ),
    body: [
      { type: "paragraph", text: "هر پلتفرم مخاطب و زبان خودش را دارد. کپی‌کردن یک محتوا در همه‌جا، به‌ندرت جواب می‌دهد." },
      { type: "heading", level: 2, text: "پلتفرم درست را انتخاب کنید" },
      { type: "paragraph", text: "به‌جای حضور در همهٔ شبکه‌ها، روی جایی تمرکز کنید که مخاطب هدف شما بیشتر آنجاست." },
      { type: "quote", text: "کیفیت تعامل مهم‌تر از تعداد فالوئر است." },
    ],
  },
  {
    slug: "technical-seo-speed",
    title: "سرعت سایت و تأثیر آن بر سئو",
    excerpt:
      "سرعت پایین سایت، هم کاربران را فراری می‌دهد هم رتبهٔ شما را پایین می‌آورد. راهکارهای عملی برای بهینه‌سازی سرعت.",
    coverGradient: "from-green-500/30 to-emerald-700/30",
    category: "seo",
    tags: ["سئو فنی", "سرعت سایت", "Core Web Vitals"],
    author: blogAuthors.sara,
    publishedAt: "2025-03-22",
    tenant: "parag",
    seo: seo(
      "سرعت سایت و تأثیر آن بر سئو",
      "چرا سرعت سایت برای سئو حیاتی است و چطور Core Web Vitals را بهبود دهیم.",
      "technical-seo-speed",
    ),
    body: [
      { type: "paragraph", text: "گوگل بارها اعلام کرده که سرعت و تجربهٔ کاربری از عوامل رتبه‌بندی هستند. یک ثانیه تأخیر می‌تواند نرخ تبدیل را کاهش دهد." },
      { type: "heading", level: 2, text: "از کجا شروع کنیم؟" },
      { type: "list", ordered: false, items: ["فشرده‌سازی و بهینه‌سازی تصاویر", "استفاده از CDN", "کاهش جاوااسکریپت اضافی", "کش‌گذاری مرورگر"] },
      { type: "code", lang: "text", code: "LCP < 2.5s\nINP < 200ms\nCLS < 0.1" },
    ],
  },
  {
    slug: "storytelling-in-marketing",
    title: "قدرت داستان‌سرایی در بازاریابی",
    excerpt:
      "مردم اعداد را فراموش می‌کنند اما داستان‌ها را به یاد می‌سپارند. چطور از داستان‌سرایی برای رشد برند استفاده کنیم.",
    coverGradient: "from-lime-500/30 to-emerald-700/30",
    category: "branding",
    tags: ["برندینگ", "داستان‌سرایی", "محتوا"],
    author: blogAuthors.niloofar,
    publishedAt: "2025-03-08",
    tenant: "parag",
    seo: seo(
      "قدرت داستان‌سرایی در بازاریابی",
      "چرا داستان‌سرایی مؤثرترین ابزار بازاریابی است و چطور آن را به کار ببریم.",
      "storytelling-in-marketing",
    ),
    body: [
      { type: "paragraph", text: "داستان‌ها احساس می‌سازند و احساس، تصمیم خرید را شکل می‌دهد. برندهای بزرگ، فروشندهٔ داستان‌اند نه محصول." },
      { type: "heading", level: 2, text: "ساختار یک داستان خوب" },
      { type: "paragraph", text: "قهرمان داستان شما مشتری است، نه برندتان. برند نقش راهنما را دارد که به قهرمان کمک می‌کند به هدفش برسد." },
      { type: "quote", text: "مردم آنچه را می‌خرند که به آن‌ها کمک می‌کند نسخهٔ بهتری از خودشان شوند." },
    ],
  },
];
