import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";
import LoginForm from "./LoginForm";

export async function generateMetadata(): Promise<Metadata> {
  return buildMetadata({
    title: "ورود | آژانس پاراگ",
    description: "ورود به پنل کاربری آژانس دیجیتال مارکتینگ پاراگ.",
    canonical: "https://parag.agency/login",
  });
}

export default function Page() {
  return <LoginForm />;
}
