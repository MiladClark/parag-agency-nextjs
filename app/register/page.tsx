import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";
import RegisterForm from "./RegisterForm";

export async function generateMetadata(): Promise<Metadata> {
  return buildMetadata({
    title: "ثبت‌نام | آژانس پاراگ",
    description: "ساخت حساب کاربری در آژانس دیجیتال مارکتینگ پاراگ.",
    canonical: "https://parag.agency/register",
  });
}

export default function Page() {
  return <RegisterForm />;
}
