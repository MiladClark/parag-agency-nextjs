import { Container } from "@/components/ui/Section";
import { ButtonLink } from "@/components/ui/Button";

export default function NotFound() {
  return (
    <Container className="flex min-h-[70vh] flex-col items-center justify-center gap-6 text-center">
      <span className="text-7xl font-extrabold text-accent sm:text-8xl">۴۰۴</span>
      <h1 className="text-2xl font-bold text-text sm:text-3xl">صفحه پیدا نشد</h1>
      <p className="max-w-md text-base leading-8 text-text-muted">
        صفحه‌ای که دنبالش بودید وجود ندارد یا جابه‌جا شده است.
      </p>
      <ButtonLink href="/" size="lg">
        بازگشت به خانه
      </ButtonLink>
    </Container>
  );
}
