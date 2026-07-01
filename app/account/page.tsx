import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";
import AccountClient from "./AccountClient";

export async function generateMetadata(): Promise<Metadata> {
  return buildMetadata({
    title: "حساب کاربری | پاراگ",
    description: "مدیریت حساب کاربری در آژانس پاراگ.",
    canonical: "https://parag.agency/account",
  });
}

export default function Page() {
  return <AccountClient />;
}
