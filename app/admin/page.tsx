import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";
import { AdminShell } from "@/components/admin/AdminShell";

export async function generateMetadata(): Promise<Metadata> {
  return buildMetadata({
    title: "پنل ادمین | آژانس پاراگ",
    description: "پنل مدیریت آژانس دیجیتال مارکتینگ پاراگ.",
    canonical: "https://parag.agency/admin",
  });
}

export default function Page() {
  return <AdminShell />;
}
