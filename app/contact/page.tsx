import type { Metadata } from "next";
import { getContentRepository } from "@/content/repository";
import { buildMetadata } from "@/lib/seo";
import { Hero } from "@/components/sections/Hero";
import { Section } from "@/components/ui/Section";
import { ContactForm } from "@/components/ContactForm";
import { Icon } from "@/components/ui/Icon";

export async function generateMetadata(): Promise<Metadata> {
  const repo = getContentRepository();
  const page = await repo.getPage("contact");
  return page ? buildMetadata(page.seo) : {};
}

export default async function Page() {
  const repo = getContentRepository();
  const [page, settings] = await Promise.all([repo.getPage("contact"), repo.getSiteSettings()]);
  if (!page) return null;
  const { contact, social } = settings;

  return (
    <>
      <Hero hero={page.hero} compact />
      <Section className="!pt-4">
        <div className="grid gap-10 lg:grid-cols-[1.3fr_1fr]">
          <div className="rounded-3xl border border-border bg-panel p-7 sm:p-10">
            <ContactForm />
          </div>

          <aside className="flex flex-col gap-6">
            <div className="flex flex-col gap-5 rounded-3xl border border-border bg-panel p-7">
              <h3 className="text-lg font-bold text-text">راه‌های ارتباطی</h3>
              {contact.phone && <ContactRow icon="phone" label="تلفن" value={contact.phone} />}
              {contact.email && (
                <ContactRow
                  icon="mail"
                  label="ایمیل"
                  value={contact.email}
                  href={`mailto:${contact.email}`}
                />
              )}
              {contact.address && <ContactRow icon="map" label="آدرس" value={contact.address} />}
            </div>

            <div className="flex items-center gap-2 rounded-3xl border border-border bg-panel p-7">
              {social.map((s) => (
                <a
                  key={s.href}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.label}
                  className="flex h-11 w-11 items-center justify-center rounded-full border border-border text-text-muted transition-colors hover:border-accent/40 hover:text-accent"
                >
                  <Icon name={s.icon} className="text-lg" />
                </a>
              ))}
            </div>
          </aside>
        </div>
      </Section>
    </>
  );
}

function ContactRow({
  icon,
  label,
  value,
  href,
}: {
  icon: string;
  label: string;
  value: string;
  href?: string;
}) {
  const content = (
    <div className="flex items-center gap-3">
      <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-accent-soft text-lg text-accent">
        <Icon name={icon} />
      </span>
      <div className="flex flex-col">
        <span className="text-xs text-text-muted">{label}</span>
        <span className="text-sm text-text">{value}</span>
      </div>
    </div>
  );
  return href ? (
    <a href={href} className="transition-opacity hover:opacity-80">
      {content}
    </a>
  ) : (
    content
  );
}
